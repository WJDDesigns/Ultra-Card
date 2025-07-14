/*! For license information please see ultra-card.js.LICENSE.txt */
(()=>{"use strict";const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),i=new WeakMap;class n{constructor(t,e,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const o=this.t;if(e&&void 0===t){const e=void 0!==o&&1===o.length;e&&(t=i.get(o)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&i.set(o,t))}return t}toString(){return this.cssText}}const a=(t,...e)=>{const i=1===t.length?t[0]:e.reduce(((e,o,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+t[i+1]),t[0]);return new n(i,t,o)},r=(o,i)=>{if(e)o.adoptedStyleSheets=i.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const e of i){const i=document.createElement("style"),n=t.litNonce;void 0!==n&&i.setAttribute("nonce",n),i.textContent=e.cssText,o.appendChild(i)}},l=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const o of t.cssRules)e+=o.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,o))(e)})(t):t,{is:s,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:p,getOwnPropertySymbols:u,getPrototypeOf:m}=Object,g=globalThis,h=g.trustedTypes,v=h?h.emptyScript:"",b=g.reactiveElementPolyfillSupport,f=(t,e)=>t,y={toAttribute(t,e){switch(e){case Boolean:t=t?v:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let o=t;switch(e){case Boolean:o=null!==t;break;case Number:o=null===t?null:Number(t);break;case Object:case Array:try{o=JSON.parse(t)}catch(t){o=null}}return o}},_=(t,e)=>!s(t,e),x={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:_};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;class w extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=x){if(e.state&&(e.attribute=!1),this._$Ei(),this.elementProperties.set(t,e),!e.noAccessor){const o=Symbol(),i=this.getPropertyDescriptor(t,o,e);void 0!==i&&d(this.prototype,t,i)}}static getPropertyDescriptor(t,e,o){const{get:i,set:n}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get(){return i?.call(this)},set(e){const a=i?.call(this);n.call(this,e),this.requestUpdate(t,a,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??x}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const t=m(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const t=this.properties,e=[...p(t),...u(t)];for(const o of e)this.createProperty(o,t[o])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,o]of e)this.elementProperties.set(t,o)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const o=this._$Eu(t,e);void 0!==o&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const o=new Set(t.flat(1/0).reverse());for(const t of o)e.unshift(l(t))}else void 0!==t&&e.push(l(t));return e}static _$Eu(t,e){const o=e.attribute;return!1===o?void 0:"string"==typeof o?o:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const o of e.keys())this.hasOwnProperty(o)&&(t.set(o,this[o]),delete this[o]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return r(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((t=>t.hostConnected?.()))}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()))}attributeChangedCallback(t,e,o){this._$AK(t,o)}_$EC(t,e){const o=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,o);if(void 0!==i&&!0===o.reflect){const n=(void 0!==o.converter?.toAttribute?o.converter:y).toAttribute(e,o.type);this._$Em=t,null==n?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,e){const o=this.constructor,i=o._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=o.getPropertyOptions(i),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:y;this._$Em=i,this[i]=n.fromAttribute(e,t.type),this._$Em=null}}requestUpdate(t,e,o){if(void 0!==t){if(o??=this.constructor.getPropertyOptions(t),!(o.hasChanged??_)(this[t],e))return;this.P(t,e,o)}!1===this.isUpdatePending&&(this._$ES=this._$ET())}P(t,e,o){this._$AL.has(t)||this._$AL.set(t,e),!0===o.reflect&&this._$Em!==t&&(this._$Ej??=new Set).add(t)}async _$ET(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,o]of t)!0!==o.wrapped||this._$AL.has(e)||void 0===this[e]||this.P(e,this[e],o)}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach((t=>t.hostUpdate?.())),this.update(e)):this._$EU()}catch(e){throw t=!1,this._$EU(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Ej&&=this._$Ej.forEach((t=>this._$EC(t,this[t]))),this._$EU()}updated(t){}firstUpdated(t){}}w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[f("elementProperties")]=new Map,w[f("finalized")]=new Map,b?.({ReactiveElement:w}),(g.reactiveElementVersions??=[]).push("2.0.4");const $=globalThis,k=$.trustedTypes,C=k?k.createPolicy("lit-html",{createHTML:t=>t}):void 0,S="$lit$",z=`lit$${Math.random().toFixed(9).slice(2)}$`,I="?"+z,T=`<${I}>`,A=document,P=()=>A.createComment(""),M=t=>null===t||"object"!=typeof t&&"function"!=typeof t,L=Array.isArray,O=t=>L(t)||"function"==typeof t?.[Symbol.iterator],D="[ \t\n\f\r]",E=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,F=/-->/g,j=/>/g,R=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),U=/'/g,N=/"/g,B=/^(?:script|style|textarea|title)$/i,H=t=>(e,...o)=>({_$litType$:t,strings:e,values:o}),V=H(1),G=(H(2),H(3),Symbol.for("lit-noChange")),W=Symbol.for("lit-nothing"),q=new WeakMap,Y=A.createTreeWalker(A,129);function J(t,e){if(!L(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==C?C.createHTML(e):e}const X=(t,e)=>{const o=t.length-1,i=[];let n,a=2===e?"<svg>":3===e?"<math>":"",r=E;for(let e=0;e<o;e++){const o=t[e];let l,s,d=-1,c=0;for(;c<o.length&&(r.lastIndex=c,s=r.exec(o),null!==s);)c=r.lastIndex,r===E?"!--"===s[1]?r=F:void 0!==s[1]?r=j:void 0!==s[2]?(B.test(s[2])&&(n=RegExp("</"+s[2],"g")),r=R):void 0!==s[3]&&(r=R):r===R?">"===s[0]?(r=n??E,d=-1):void 0===s[1]?d=-2:(d=r.lastIndex-s[2].length,l=s[1],r=void 0===s[3]?R:'"'===s[3]?N:U):r===N||r===U?r=R:r===F||r===j?r=E:(r=R,n=void 0);const p=r===R&&t[e+1].startsWith("/>")?" ":"";a+=r===E?o+T:d>=0?(i.push(l),o.slice(0,d)+S+o.slice(d)+z+p):o+z+(-2===d?e:p)}return[J(t,a+(t[o]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]};class K{constructor({strings:t,_$litType$:e},o){let i;this.parts=[];let n=0,a=0;const r=t.length-1,l=this.parts,[s,d]=X(t,e);if(this.el=K.createElement(s,o),Y.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=Y.nextNode())&&l.length<r;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(S)){const e=d[a++],o=i.getAttribute(t).split(z),r=/([.?@])?(.*)/.exec(e);l.push({type:1,index:n,name:r[2],strings:o,ctor:"."===r[1]?ot:"?"===r[1]?it:"@"===r[1]?nt:et}),i.removeAttribute(t)}else t.startsWith(z)&&(l.push({type:6,index:n}),i.removeAttribute(t));if(B.test(i.tagName)){const t=i.textContent.split(z),e=t.length-1;if(e>0){i.textContent=k?k.emptyScript:"";for(let o=0;o<e;o++)i.append(t[o],P()),Y.nextNode(),l.push({type:2,index:++n});i.append(t[e],P())}}}else if(8===i.nodeType)if(i.data===I)l.push({type:2,index:n});else{let t=-1;for(;-1!==(t=i.data.indexOf(z,t+1));)l.push({type:7,index:n}),t+=z.length-1}n++}}static createElement(t,e){const o=A.createElement("template");return o.innerHTML=t,o}}function Z(t,e,o=t,i){if(e===G)return e;let n=void 0!==i?o._$Co?.[i]:o._$Cl;const a=M(e)?void 0:e._$litDirective$;return n?.constructor!==a&&(n?._$AO?.(!1),void 0===a?n=void 0:(n=new a(t),n._$AT(t,o,i)),void 0!==i?(o._$Co??=[])[i]=n:o._$Cl=n),void 0!==n&&(e=Z(t,n._$AS(t,e.values),n,i)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:o}=this._$AD,i=(t?.creationScope??A).importNode(e,!0);Y.currentNode=i;let n=Y.nextNode(),a=0,r=0,l=o[0];for(;void 0!==l;){if(a===l.index){let e;2===l.type?e=new tt(n,n.nextSibling,this,t):1===l.type?e=new l.ctor(n,l.name,l.strings,this,t):6===l.type&&(e=new at(n,this,t)),this._$AV.push(e),l=o[++r]}a!==l?.index&&(n=Y.nextNode(),a++)}return Y.currentNode=A,i}p(t){let e=0;for(const o of this._$AV)void 0!==o&&(void 0!==o.strings?(o._$AI(t,o,e),e+=o.strings.length-2):o._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,o,i){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=o,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Z(this,t,e),M(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==G&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):O(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==W&&M(this._$AH)?this._$AA.nextSibling.data=t:this.T(A.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:o}=t,i="number"==typeof o?this._$AC(t):(void 0===o.el&&(o.el=K.createElement(J(o.h,o.h[0]),this.options)),o);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new Q(i,this),o=t.u(this.options);t.p(e),this.T(o),this._$AH=t}}_$AC(t){let e=q.get(t.strings);return void 0===e&&q.set(t.strings,e=new K(t)),e}k(t){L(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let o,i=0;for(const n of t)i===e.length?e.push(o=new tt(this.O(P()),this.O(P()),this,this.options)):o=e[i],o._$AI(n),i++;i<e.length&&(this._$AR(o&&o._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,o,i,n){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,o.length>2||""!==o[0]||""!==o[1]?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=W}_$AI(t,e=this,o,i){const n=this.strings;let a=!1;if(void 0===n)t=Z(this,t,e,0),a=!M(t)||t!==this._$AH&&t!==G,a&&(this._$AH=t);else{const i=t;let r,l;for(t=n[0],r=0;r<n.length-1;r++)l=Z(this,i[o+r],e,r),l===G&&(l=this._$AH[r]),a||=!M(l)||l!==this._$AH[r],l===W?t=W:t!==W&&(t+=(l??"")+n[r+1]),this._$AH[r]=l}a&&!i&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class ot extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}class it extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==W)}}class nt extends et{constructor(t,e,o,i,n){super(t,e,o,i,n),this.type=5}_$AI(t,e=this){if((t=Z(this,t,e,0)??W)===G)return;const o=this._$AH,i=t===W&&o!==W||t.capture!==o.capture||t.once!==o.once||t.passive!==o.passive,n=t!==W&&(o===W||i);i&&this.element.removeEventListener(this.name,this,o),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class at{constructor(t,e,o){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(t){Z(this,t)}}const rt={M:S,P:z,A:I,C:1,L:X,R:Q,D:O,V:Z,I:tt,H:et,N:it,U:nt,B:ot,F:at},lt=$.litHtmlPolyfillSupport;lt?.(K,tt),($.litHtmlVersions??=[]).push("3.2.1");class st extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,o)=>{const i=o?.renderBefore??e;let n=i._$litPart$;if(void 0===n){const t=o?.renderBefore??null;i._$litPart$=n=new tt(e.insertBefore(P(),t),t,void 0,o??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}}st._$litElement$=!0,st.finalized=!0,globalThis.litElementHydrateSupport?.({LitElement:st});const dt=globalThis.litElementPolyfillSupport;dt?.({LitElement:st}),(globalThis.litElementVersions??=[]).push("4.1.1");const ct=t=>(e,o)=>{void 0!==o?o.addInitializer((()=>{customElements.define(t,e)})):customElements.define(t,e)},pt={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:_},ut=(t=pt,e,o)=>{const{kind:i,metadata:n}=o;let a=globalThis.litPropertyMetadata.get(n);if(void 0===a&&globalThis.litPropertyMetadata.set(n,a=new Map),a.set(o.name,t),"accessor"===i){const{name:i}=o;return{set(o){const n=e.get.call(this);e.set.call(this,o),this.requestUpdate(i,n,t)},init(e){return void 0!==e&&this.P(i,void 0,t),e}}}if("setter"===i){const{name:i}=o;return function(o){const n=this[i];e.call(this,o),this.requestUpdate(i,n,t)}}throw Error("Unsupported decorator location: "+i)};function mt(t){return(e,o)=>"object"==typeof o?ut(t,e,o):((t,e,o)=>{const i=e.hasOwnProperty(o);return e.constructor.createProperty(o,i?{...t,wrapped:!0}:t),i?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}function gt(t){return mt({...t,state:!0,attribute:!1})}class ht{validate(t){const e=[];return t.id||e.push("Module ID is required"),t.type||e.push("Module type is required"),{valid:0===e.length,errors:e}}generateId(t){return`${t}-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}renderFormField(t,e,o){return V`
      <div class="form-field">
        <label class="form-label">${t}</label>
        ${e} ${o?V`<div class="form-description">${o}</div>`:""}
      </div>
    `}renderColorPicker(t,e,o,i){return this.renderFormField(t,V`
        <input
          type="color"
          .value=${e||"#000000"}
          @change=${t=>o(t.target.value)}
        />
      `,i)}renderNumberInput(t,e,o,i={},n){return this.renderFormField(t,V`
        <input
          type="number"
          .value=${e||0}
          min=${i.min||0}
          max=${i.max||1e3}
          step=${i.step||1}
          @input=${t=>o(Number(t.target.value))}
        />
      `,n)}renderTextInput(t,e,o,i,n){return this.renderFormField(t,V`
        <input
          type="text"
          .value=${e||""}
          placeholder=${i||""}
          @input=${t=>o(t.target.value)}
        />
      `,n)}renderEntityPicker(t,e,o,i,n,a,r){return this.renderFormField("",V`
        <ha-form
          .hass=${i}
          .data=${{entity:e||""}}
          .schema=${[{name:"entity",selector:{entity:{}},label:t,description:a||""}]}
          .computeLabel=${t=>t.label||t.name}
          .computeDescription=${t=>t.description||""}
          @value-changed=${t=>o(t.detail.value.entity)}
        ></ha-form>
      `,"")}renderTextArea(t,e,o,i,n){return this.renderFormField(t,V`
        <textarea
          .value=${e||""}
          placeholder=${i||""}
          rows="3"
          @input=${t=>o(t.target.value)}
        ></textarea>
      `,n)}renderSelect(t,e,o,i,n){return this.renderFormField(t,V`
        <select
          .value=${e||""}
          @change=${t=>i(t.target.value)}
        >
          ${o.map((t=>V`<option value="${t.value}">${t.label}</option>`))}
        </select>
      `,n)}renderCheckbox(t,e,o,i){return this.renderFormField("",V`
        <label class="checkbox-wrapper">
          <input
            type="checkbox"
            .checked=${e||!1}
            @change=${t=>o(t.target.checked)}
          />
          ${t}
        </label>
      `,i)}renderConditionalFieldsGroup(t,e){return V`
      <div class="conditional-fields-group">
        <div class="conditional-fields-header">${t}</div>
        <div class="conditional-fields-content">${e}</div>
      </div>
    `}}class vt{static render(t,e,o,i="Link Configuration"){var n,a,r;return V`
      <div class="ultra-link-component">
        <style>
          /* Hide redundant field labels from ha-form */
          .ultra-clean-form ha-form .mdc-form-field > label,
          .ultra-clean-form ha-form .mdc-text-field > label,
          .ultra-clean-form ha-form .mdc-floating-label,
          .ultra-clean-form ha-form .mdc-notched-outline__leading,
          .ultra-clean-form ha-form .mdc-notched-outline__notch,
          .ultra-clean-form ha-form .mdc-notched-outline__trailing,
          .ultra-clean-form ha-form .mdc-floating-label--float-above,
          .ultra-clean-form ha-form label[for],
          .ultra-clean-form ha-form .ha-form-label {
            display: none !important;
          }

          /* Style the form inputs without labels */
          .ultra-clean-form ha-form .mdc-text-field,
          .ultra-clean-form ha-form .mdc-select,
          .ultra-clean-form ha-form ha-entity-picker,
          .ultra-clean-form ha-form ha-icon-picker {
            margin-top: 0 !important;
          }

          /* Ensure input fields have proper spacing */
          .ultra-clean-form ha-form .mdc-text-field--outlined .mdc-notched-outline {
            border-radius: 8px;
          }

          /* Remove any default margins from form elements */
          .ultra-clean-form ha-form > * {
            margin: 0 !important;
          }

          /* Style field titles and descriptions */
          .field-title {
            font-size: 16px !important;
            font-weight: 600 !important;
            color: var(--primary-text-color) !important;
            margin-bottom: 4px !important;
            display: block !important;
          }

          .field-description {
            font-size: 13px !important;
            color: var(--secondary-text-color) !important;
            margin-bottom: 12px !important;
            display: block !important;
            opacity: 0.8 !important;
            line-height: 1.4 !important;
          }

          .section-title {
            font-size: 18px !important;
            font-weight: 700 !important;
            color: var(--primary-color) !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
          }
        </style>

        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
        >
          ${i}
        </div>
        <div
          class="field-description"
          style="font-size: 13px; font-weight: 400; margin-bottom: 16px; color: var(--secondary-text-color);"
        >
          Configure what happens when users interact with this element. Choose different actions for
          tap, hold, and double-tap gestures.
        </div>

        <!-- Tap Behavior -->
        <div class="tap-behavior-group" style="margin-bottom: 24px;">
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            Tap Behavior
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 12px; color: var(--secondary-text-color);"
          >
            Action to perform when the element is tapped/clicked.
          </div>
          ${vt.renderCleanForm(t,{action:(null===(n=e.tap_action)||void 0===n?void 0:n.action)||"default"},[{name:"action",selector:{select:{options:[{value:"default",label:"Default"},{value:"more-info",label:"More info"},{value:"toggle",label:"Toggle"},{value:"navigate",label:"Navigate"},{value:"url",label:"URL"},{value:"perform-action",label:"Perform action"},{value:"assist",label:"Assist"},{value:"nothing",label:"Nothing"}],mode:"dropdown"}}}],(t=>{const i=Object.assign(Object.assign({},e.tap_action),{action:t.detail.value.action});o({tap_action:i})}))}
          ${vt.renderActionFields(t,e.tap_action||{action:"default"},(t=>{const i=Object.assign(Object.assign({},e.tap_action),t);o({tap_action:i})}))}
        </div>

        <!-- Hold Behavior -->
        <div class="hold-behavior-group" style="margin-bottom: 24px;">
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            Hold Behavior
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 12px; color: var(--secondary-text-color);"
          >
            Action to perform when the element is pressed and held.
          </div>
          ${vt.renderCleanForm(t,{action:(null===(a=e.hold_action)||void 0===a?void 0:a.action)||"default"},[{name:"action",selector:{select:{options:[{value:"default",label:"Default"},{value:"more-info",label:"More info"},{value:"toggle",label:"Toggle"},{value:"navigate",label:"Navigate"},{value:"url",label:"URL"},{value:"perform-action",label:"Perform action"},{value:"assist",label:"Assist"},{value:"nothing",label:"Nothing"}],mode:"dropdown"}}}],(t=>{const i=Object.assign(Object.assign({},e.hold_action),{action:t.detail.value.action});o({hold_action:i})}))}
          ${vt.renderActionFields(t,e.hold_action||{action:"default"},(t=>{const i=Object.assign(Object.assign({},e.hold_action),t);o({hold_action:i})}))}
        </div>

        <!-- Double Tap Behavior -->
        <div class="double-tap-behavior-group">
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            Double Tap Behavior
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 12px; color: var(--secondary-text-color);"
          >
            Action to perform when the element is double-tapped/clicked.
          </div>
          ${vt.renderCleanForm(t,{action:(null===(r=e.double_tap_action)||void 0===r?void 0:r.action)||"default"},[{name:"action",selector:{select:{options:[{value:"default",label:"Default"},{value:"more-info",label:"More info"},{value:"toggle",label:"Toggle"},{value:"navigate",label:"Navigate"},{value:"url",label:"URL"},{value:"perform-action",label:"Perform action"},{value:"assist",label:"Assist"},{value:"nothing",label:"Nothing"}],mode:"dropdown"}}}],(t=>{const i=Object.assign(Object.assign({},e.double_tap_action),{action:t.detail.value.action});o({double_tap_action:i})}))}
          ${vt.renderActionFields(t,e.double_tap_action||{action:"default"},(t=>{const i=Object.assign(Object.assign({},e.double_tap_action),t);o({double_tap_action:i})}))}
        </div>
      </div>
    `}static renderCleanForm(t,e,o,i){return V`
      <div class="ultra-clean-form">
        <ha-form .hass=${t} .data=${e} .schema=${o} @value-changed=${i}></ha-form>
      </div>
    `}static renderActionFields(t,e,o){switch(e.action){case"more-info":case"toggle":return V`
          <div style="margin-top: 16px;">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
              Entity
            </div>
            <div
              class="field-description"
              style="font-size: 12px; font-weight: 400; margin-bottom: 8px; color: var(--secondary-text-color);"
            >
              Select the entity to
              ${"more-info"===e.action?"show more info for":"toggle"}.
            </div>
            ${vt.renderCleanForm(t,{entity:e.entity||""},[{name:"entity",selector:{entity:{}}}],(t=>o({entity:t.detail.value.entity})))}
          </div>
        `;case"navigate":return V`
          <div style="margin-top: 16px;">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
              Navigation Path
            </div>
            <div
              class="field-description"
              style="font-size: 12px; font-weight: 400; margin-bottom: 8px; color: var(--secondary-text-color);"
            >
              Choose where to navigate or enter a custom path (e.g., /lovelace/dashboard).
            </div>
            ${vt.renderNavigationPicker(t,e.navigation_path||"",(t=>o({navigation_path:t})))}
          </div>
        `;case"url":return V`
          <div style="margin-top: 16px;">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
              URL Path
            </div>
            <div
              class="field-description"
              style="font-size: 12px; font-weight: 400; margin-bottom: 8px; color: var(--secondary-text-color);"
            >
              Enter the URL to navigate to (e.g., https://www.example.com).
            </div>
            ${vt.renderCleanForm(t,{url_path:e.url_path||""},[{name:"url_path",selector:{text:{}}}],(t=>o({url_path:t.detail.value.url_path})))}
          </div>
        `;case"perform-action":return V`
          <div style="margin-top: 16px;">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
              Service
            </div>
            <div
              class="field-description"
              style="font-size: 12px; font-weight: 400; margin-bottom: 8px; color: var(--secondary-text-color);"
            >
              Enter the service to call (e.g., light.turn_on).
            </div>
            ${vt.renderCleanForm(t,{service:e.service||""},[{name:"service",selector:{text:{}}}],(t=>o({service:t.detail.value.service})))}

            <div style="margin-top: 12px;">
              <div
                class="field-title"
                style="font-size: 14px; font-weight: 600; margin-bottom: 4px;"
              >
                Service Data (optional)
              </div>
              <div
                class="field-description"
                style="font-size: 12px; font-weight: 400; margin-bottom: 8px; color: var(--secondary-text-color);"
              >
                Enter service data as YAML (e.g., entity_id: light.living_room).
              </div>
              ${vt.renderCleanForm(t,{service_data:e.service_data?JSON.stringify(e.service_data,null,2):""},[{name:"service_data",selector:{text:{multiline:!0,type:"text"}}}],(t=>{try{const e=t.detail.value.service_data?JSON.parse(t.detail.value.service_data):void 0;o({service_data:e})}catch(t){}}))}
            </div>
          </div>
        `;default:return V``}}static renderNavigationPicker(t,e,o){const i=[{value:"/lovelace",label:"Overview (/lovelace)"},{value:"/config",label:"Settings (/config)"},{value:"/config/dashboard",label:"Dashboards (/config/dashboard)"},{value:"/config/entities",label:"Entities (/config/entities)"},{value:"/config/devices",label:"Devices (/config/devices)"},{value:"/config/automations",label:"Automations (/config/automations)"},{value:"/config/scripts",label:"Scripts (/config/scripts)"},{value:"/config/scenes",label:"Scenes (/config/scenes)"},{value:"/developer-tools",label:"Developer Tools (/developer-tools)"},...Object.keys(t.panels).filter((e=>t.panels[e].url_path||"lovelace"===e)).map((e=>({value:t.panels[e].url_path||`/lovelace/${e}`,label:`${t.panels[e].title||e} (${t.panels[e].url_path||`/lovelace/${e}`})`})))];return vt.renderCleanForm(t,{navigation_path:e},[{name:"navigation_path",selector:{select:{options:[{value:"",label:"Custom path..."},...i],mode:"dropdown",custom_value:!0}}}],(t=>o(t.detail.value.navigation_path)))}static getDefaultConfig(){return{tap_action:{action:"default"},hold_action:{action:"default"},double_tap_action:{action:"default"}}}static handleAction(t,e,o){switch(t.action){case"more-info":if(t.entity){const e=new CustomEvent("hass-more-info",{bubbles:!0,composed:!0,detail:{entityId:t.entity}});null==o||o.dispatchEvent(e)}break;case"toggle":t.entity&&e.callService("homeassistant","toggle",{entity_id:t.entity});break;case"navigate":if(t.navigation_path){window.history.pushState(null,"",t.navigation_path);const e=new CustomEvent("location-changed",{bubbles:!0,composed:!0,detail:{replace:!1}});window.dispatchEvent(e)}break;case"url":t.url_path&&window.open(t.url_path,"_blank");break;case"perform-action":if(t.service){const[o,i]=t.service.split(".");o&&i&&e.callService(o,i,t.service_data||{})}break;case"assist":const i=new CustomEvent("hass-assist",{bubbles:!0,composed:!0});null==o||o.dispatchEvent(i)}}}class bt{static renderCleanForm(t,e,o,i){const n=`clean-form-${Math.random().toString(36).substr(2,9)}`;return setTimeout((()=>{const t=document.getElementById(n);t&&(bt.setupFormObserver(t,n),bt.aggressiveCleanup(t))}),0),setTimeout((()=>{const t=document.getElementById(n);t&&bt.aggressiveCleanup(t)}),100),V`
      <div class="ultra-clean-form" id="${n}">
        <ha-form
          .hass=${t}
          .data=${e}
          .schema=${o}
          @value-changed=${t=>{i(t),setTimeout((()=>{const t=document.getElementById(n);t&&bt.aggressiveCleanup(t)}),0)}}
        ></ha-form>
      </div>
    `}static setupFormObserver(t,e){var o;bt.activeObservers.has(e)&&(null===(o=bt.activeObservers.get(e))||void 0===o||o.disconnect());const i=new MutationObserver((o=>{let i=!1;o.forEach((t=>{"childList"===t.type&&t.addedNodes.forEach((t=>{t.nodeType===Node.ELEMENT_NODE&&(i=!0)}))})),i&&!bt.cleanupQueue.has(e)&&(bt.cleanupQueue.add(e),setTimeout((()=>{bt.aggressiveCleanup(t),bt.cleanupQueue.delete(e)}),10))}));i.observe(t,{childList:!0,subtree:!0,characterData:!0}),bt.activeObservers.set(e,i),setTimeout((()=>{document.contains(t)||(i.disconnect(),bt.activeObservers.delete(e))}),3e4)}static aggressiveCleanup(t){var e;if(!t)return;const o=["action","entity","template_mode","icon","name","value","text","url","path","attribute","state","condition","enabled","disabled","template","mode","type","size","color","style","width","height","radius","opacity","service","data","latitude","longitude","navigation_path","show_icon","label","button"],i=t.querySelector("ha-form");if(!i)return;const n=document.createTreeWalker(i,NodeFilter.SHOW_TEXT,null),a=[];let r;for(;r=n.nextNode();){const t=null===(e=r.textContent)||void 0===e?void 0:e.trim().toLowerCase();t&&o.includes(t)&&a.push(r)}a.forEach((t=>{var e;const o=t.parentElement;if(o){const i=o.querySelector("input, select, ha-entity-picker, ha-selector, mwc-select, mwc-textfield");t.textContent&&t.textContent.trim().length<30&&(i||(null===(e=o.parentElement)||void 0===e?void 0:e.querySelector("input, select, ha-entity-picker, ha-selector")))&&t.remove()}})),i.querySelectorAll("*").forEach((t=>{var e,i;const n=null===(e=t.textContent)||void 0===e?void 0:e.trim().toLowerCase();n&&o.includes(n)&&0===t.children.length&&(null===(i=t.parentElement)||void 0===i?void 0:i.querySelector("input, select, ha-entity-picker, ha-selector"))&&(t.style.cssText="display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; width: 0 !important; margin: 0 !important; padding: 0 !important;")})),['div[role="group"] > div:first-child:not([class])','div[role="group"] > span:first-child:not([class])',".mdc-form-field__label",".mdc-text-field__label",".mdc-select__label","label:not([for])","div:not([class]):not([id])","span:not([class]):not([id])"].forEach((t=>{try{i.querySelectorAll(t).forEach((t=>{var e;const i=null===(e=t.textContent)||void 0===e?void 0:e.trim().toLowerCase();i&&o.includes(i)&&(t.style.cssText="display: none !important;")}))}catch(t){}})),i.querySelectorAll('[class*="mdc-"]').forEach((t=>{var e;const i=null===(e=t.textContent)||void 0===e?void 0:e.trim().toLowerCase();i&&o.includes(i)&&0===t.children.length&&(t.classList.contains("mdc-floating-label")||t.classList.contains("mdc-form-field__label")||t.classList.contains("mdc-text-field__label"))&&(t.style.cssText="display: none !important;")})),setTimeout((()=>{var t;const e=document.createTreeWalker(i,NodeFilter.SHOW_TEXT,null),n=[];let a;for(;a=e.nextNode();){const e=null===(t=a.textContent)||void 0===t?void 0:t.trim().toLowerCase();e&&o.includes(e)&&n.push(a)}n.forEach((t=>{t.parentNode&&(t.textContent="")}))}),50)}static getCleanFormStyles(){return"\n      /* Ultra-aggressive label hiding */\n      .ultra-clean-form ha-form label,\n      .ultra-clean-form ha-form .label,\n      .ultra-clean-form ha-form .mdc-floating-label,\n      .ultra-clean-form ha-form .mdc-text-field__label,\n      .ultra-clean-form ha-form .mdc-select__label,\n      .ultra-clean-form ha-form .mdc-form-field__label,\n      .ultra-clean-form ha-form .ha-form-label,\n      .ultra-clean-form ha-form .mdc-notched-outline__leading,\n      .ultra-clean-form ha-form .mdc-notched-outline__notch,\n      .ultra-clean-form ha-form .mdc-notched-outline__trailing,\n      .ultra-clean-form ha-form .mdc-line-ripple {\n        display: none !important;\n        visibility: hidden !important;\n        opacity: 0 !important;\n        height: 0 !important;\n        width: 0 !important;\n        margin: 0 !important;\n        padding: 0 !important;\n        font-size: 0 !important;\n        line-height: 0 !important;\n      }\n\n      /* Override any existing label styles completely */\n      .ultra-clean-form label,\n      .ultra-clean-form .ultra-clean-form label *,\n      .ultra-clean-form ha-form label,\n      .ultra-clean-form ha-form label * {\n        display: none !important;\n        visibility: hidden !important;\n        opacity: 0 !important;\n        height: 0 !important;\n        width: 0 !important;\n        margin: 0 !important;\n        padding: 0 !important;\n        border: none !important;\n        outline: none !important;\n        background: none !important;\n        font-size: 0 !important;\n        line-height: 0 !important;\n        position: absolute !important;\n        left: -9999px !important;\n        top: -9999px !important;\n        z-index: -1 !important;\n        pointer-events: none !important;\n      }\n\n      /* Hide any text that could be a redundant label */\n      .ultra-clean-form ha-form div:not([class]):not([id]),\n      .ultra-clean-form ha-form span:not([class]):not([id]),\n      .ultra-clean-form ha-form p:not([class]):not([id]) {\n        font-size: 0 !important;\n        line-height: 0 !important;\n        color: transparent !important;\n        height: 0 !important;\n        overflow: hidden !important;\n      }\n\n      /* Make sure form inputs still work */\n      .ultra-clean-form ha-form input,\n      .ultra-clean-form ha-form select,\n      .ultra-clean-form ha-form textarea,\n      .ultra-clean-form ha-form ha-entity-picker,\n      .ultra-clean-form ha-form ha-icon-picker,\n      .ultra-clean-form ha-form ha-selector,\n      .ultra-clean-form ha-form .mdc-text-field,\n      .ultra-clean-form ha-form .mdc-select,\n      .ultra-clean-form ha-form .mdc-switch {\n        font-size: 14px !important;\n        line-height: normal !important;\n        color: var(--primary-text-color) !important;\n        height: auto !important;\n        width: auto !important;\n        margin-top: 0 !important;\n        border-radius: 8px !important;\n      }\n\n      /* Ensure dropdowns work */\n      .ultra-clean-form ha-form .mdc-select__selected-text,\n      .ultra-clean-form ha-form .mdc-select__dropdown-icon {\n        font-size: 14px !important;\n        color: var(--primary-text-color) !important;\n        opacity: 1 !important;\n        height: auto !important;\n        width: auto !important;\n      }\n\n      /* Style field titles and descriptions consistently */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n        color: var(--primary-text-color) !important;\n        margin-bottom: 4px !important;\n        display: block !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        display: block !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n    "}static cleanupRedundantLabels(t){bt.aggressiveCleanup(t)}static renderField(t,e,o,i,n,a){return V`
      <div class="form-field-container">
        <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
          ${t}
        </div>
        <div
          class="field-description"
          style="font-size: 13px; font-weight: 400; margin-bottom: 12px; color: var(--secondary-text-color);"
        >
          ${e}
        </div>
        ${bt.renderCleanForm(o,i,n,a)}
      </div>
    `}static createSchemaItem(t,e){return{name:t,selector:e}}static renderSection(t,e,o){return V`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
        >
          ${t}
        </div>
        ${e?V`
              <div
                class="field-description"
                style="font-size: 13px; font-weight: 400; margin-bottom: 16px; color: var(--secondary-text-color);"
              >
                ${e}
              </div>
            `:""}
        ${o.map((t=>V`
            <div style="margin-bottom: 16px;">
              ${bt.renderField(t.title,t.description,t.hass,t.data,t.schema,t.onChange)}
            </div>
          `))}
      </div>
    `}static injectCleanFormStyles(){return V`
      <style>
        ${bt.getCleanFormStyles()}
      </style>
    `}}bt.activeObservers=new Map,bt.cleanupQueue=new Set;class ft extends ht{constructor(){super(...arguments),this.metadata={type:"text",title:"Text Module",description:"Display custom text content",author:"WJD Designs",version:"1.0.0",icon:"mdi:format-text",category:"content",tags:["text","content","typography","template"]},this.clickTimeout=null,this.holdTimeout=null,this.isHolding=!1}createDefault(t){return{id:t||this.generateId("text"),type:"text",text:"Sample Text",link:"",hide_if_no_link:!1,tap_action:{action:"default"},hold_action:{action:"default"},double_tap_action:{action:"default"},icon:"",icon_position:"before",template_mode:!1,template:""}}renderGeneralTab(t,e,o,i){const n=t;return V`
      ${bt.injectCleanFormStyles()}
      <div class="module-general-settings">
        <!-- Content Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Content Configuration
          </div>

          <!-- Text Content -->
          ${bt.renderField("Text Content","Enter the text content to display in this module.",e,{text:n.text||""},[bt.createSchemaItem("text",{text:{}})],(t=>i({text:t.detail.value.text})))}
        </div>

        <!-- Link Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          ${vt.render(e,{tap_action:n.tap_action||{action:"default"},hold_action:n.hold_action||{action:"default"},double_tap_action:n.double_tap_action||{action:"default"}},(t=>{const e={};t.tap_action&&(e.tap_action=t.tap_action),t.hold_action&&(e.hold_action=t.hold_action),t.double_tap_action&&(e.double_tap_action=t.double_tap_action),i(e)}),"Link Configuration")}
        </div>

        <!-- Icon Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Icon Configuration
          </div>

          <!-- Icon Selection -->
          ${bt.renderField("Icon","Choose an icon to display alongside the text. Leave empty for no icon.",e,{icon:n.icon||""},[bt.createSchemaItem("icon",{icon:{}})],(t=>i({icon:t.detail.value.icon})))}
          ${n.icon&&""!==n.icon.trim()?V`
                <div style="margin-top: 24px;">
                  ${this.renderConditionalFieldsGroup("Icon Position",V`
                      <div
                        class="field-title"
                        style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                      >
                        Icon Position
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                      >
                        Choose where to position the icon relative to the text.
                      </div>
                      <div
                        style="display: flex; gap: 8px; justify-content: flex-start; flex-wrap: wrap;"
                      >
                        <button
                          type="button"
                          style="padding: 8px 12px; border: 2px solid ${"before"===(n.icon_position||"before")?"var(--primary-color)":"var(--divider-color)"}; background: ${"before"===(n.icon_position||"before")?"var(--primary-color)":"transparent"}; color: ${"before"===(n.icon_position||"before")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                          @click=${()=>i({icon_position:"before"})}
                        >
                          <ha-icon
                            icon="mdi:format-align-left"
                            style="font-size: 16px; flex-shrink: 0;"
                          ></ha-icon>
                          <span
                            style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                            >Before Text</span
                          >
                        </button>
                        <button
                          type="button"
                          style="padding: 8px 12px; border: 2px solid ${"after"===(n.icon_position||"before")?"var(--primary-color)":"var(--divider-color)"}; background: ${"after"===(n.icon_position||"before")?"var(--primary-color)":"transparent"}; color: ${"after"===(n.icon_position||"before")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                          @click=${()=>i({icon_position:"after"})}
                        >
                          <ha-icon
                            icon="mdi:format-align-right"
                            style="font-size: 16px; flex-shrink: 0;"
                          ></ha-icon>
                          <span
                            style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                            >After Text</span
                          >
                        </button>
                      </div>
                    `)}
                </div>
              `:""}
        </div>

        <!-- Template Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 0;"
        >
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 0; border-bottom: none;"
          >
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;"
            >
              Template Configuration
            </div>
            ${bt.renderField("Template Mode","Enable template mode to use dynamic content with Jinja2 templating",e,{template_mode:n.template_mode||!1},[bt.createSchemaItem("template_mode",{boolean:{}})],(t=>i({template_mode:t.detail.value.template_mode})))}
          </div>

          ${n.template_mode?this.renderConditionalFieldsGroup("Template Settings",V`
                  ${bt.renderField("Template Code","Enter the Jinja2 template code. Example: {{ states('sensor.temperature') }}°C",e,{template:n.template||""},[bt.createSchemaItem("template",{text:{multiline:!0}})],(t=>i({template:t.detail.value.template})))}
                `):V`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  Enable template mode to use dynamic content
                </div>
              `}
        </div>
      </div>
    `}renderPreview(t,e){const o=t;if(o.hide_if_no_link&&!this.hasActiveLink(o))return V`<div class="text-module-hidden">Hidden (no link)</div>`;const i=o,n={fontSize:i.font_size?`${i.font_size}px`:"16px",fontFamily:i.font_family||"Roboto",color:i.color||"var(--primary-text-color)",textAlign:i.text_align||"center",fontWeight:i.font_weight||"normal",fontStyle:i.font_style||"normal",textTransform:i.text_transform||"none",textDecoration:"none",lineHeight:i.line_height||"1.4",letterSpacing:i.letter_spacing||"normal",margin:"0",display:"flex",alignItems:"center",justifyContent:i.text_align||"center",gap:"8px",textShadow:i.text_shadow_h&&i.text_shadow_v?`${i.text_shadow_h||"0"} ${i.text_shadow_v||"0"} ${i.text_shadow_blur||"0"} ${i.text_shadow_color||"rgba(0,0,0,0.5)"}`:"none",boxShadow:i.box_shadow_h&&i.box_shadow_v?`${i.box_shadow_h||"0"} ${i.box_shadow_v||"0"} ${i.box_shadow_blur||"0"} ${i.box_shadow_spread||"0"} ${i.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none"},a=o.icon?V`<ha-icon icon="${o.icon}"></ha-icon>`:"",r=V`<span>${o.text||"Sample Text"}</span>`;let l;l="before"!==o.icon_position&&o.icon_position?"after"===o.icon_position?V`${r}${a}`:r:V`${a}${r}`;const s=this.hasActiveLink(o)?V`<div
          class="text-module-clickable"
          style="color: inherit; text-decoration: inherit; cursor: pointer;"
          @click=${t=>this.handleClick(t,o,e)}
          @dblclick=${t=>this.handleDoubleClick(t,o,e)}
          @mousedown=${t=>this.handleMouseDown(t,o,e)}
          @mouseup=${t=>this.handleMouseUp(t,o,e)}
          @mouseleave=${t=>this.handleMouseLeave(t,o,e)}
          @touchstart=${t=>this.handleTouchStart(t,o,e)}
          @touchend=${t=>this.handleTouchEnd(t,o,e)}
        >
          ${l}
        </div>`:l,d={padding:i.padding_top||i.padding_bottom||i.padding_left||i.padding_right?`${this.addPixelUnit(i.padding_top)||"8px"} ${this.addPixelUnit(i.padding_right)||"0px"} ${this.addPixelUnit(i.padding_bottom)||"8px"} ${this.addPixelUnit(i.padding_left)||"0px"}`:"8px 0",margin:i.margin_top||i.margin_bottom||i.margin_left||i.margin_right?`${this.addPixelUnit(i.margin_top)||"0px"} ${this.addPixelUnit(i.margin_right)||"0px"} ${this.addPixelUnit(i.margin_bottom)||"0px"} ${this.addPixelUnit(i.margin_left)||"0px"}`:"0",background:i.background_color&&"transparent"!==i.background_color?i.background_color:"transparent",backgroundImage:this.getBackgroundImageCSS(i,e),backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",border:i.border_style&&"none"!==i.border_style?`${i.border_width||"1px"} ${i.border_style} ${i.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(i.border_radius)||"0",position:i.position||"static",top:i.top||"auto",bottom:i.bottom||"auto",left:i.left||"auto",right:i.right||"auto",zIndex:i.z_index||"auto",width:i.width||"100%",height:i.height||"auto",maxWidth:i.max_width||"none",maxHeight:i.max_height||"none",minWidth:i.min_width||"none",minHeight:i.min_height||"auto",overflow:i.overflow||"hidden",clipPath:i.clip_path||"none",backdropFilter:i.backdrop_filter||"none",boxShadow:i.box_shadow_h&&i.box_shadow_v?`${i.box_shadow_h||"0"} ${i.box_shadow_v||"0"} ${i.box_shadow_blur||"0"} ${i.box_shadow_spread||"0"} ${i.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"};return V`
      <div class="text-module-container" style=${this.styleObjectToCss(d)}>
        <div class="text-module-preview" style=${this.styleObjectToCss(n)}>${s}</div>
      </div>
    `}validate(t){const e=t,o=[...super.validate(t).errors];if(e.text&&""!==e.text.trim()||o.push("Text content is required"),e.icon&&""!==e.icon.trim()&&(e.icon.includes(":")||o.push('Icon must be in format "mdi:icon-name" or "hass:icon-name"')),e.link&&""!==e.link.trim())try{new URL(e.link)}catch(t){e.link.startsWith("/")||e.link.startsWith("#")||o.push('Link must be a valid URL or start with "/" for relative paths')}return e.tap_action&&"default"!==e.tap_action.action&&"nothing"!==e.tap_action.action&&o.push(...this.validateAction(e.tap_action)),e.hold_action&&"default"!==e.hold_action.action&&"nothing"!==e.hold_action.action&&o.push(...this.validateAction(e.hold_action)),e.double_tap_action&&"default"!==e.double_tap_action.action&&"nothing"!==e.double_tap_action.action&&o.push(...this.validateAction(e.double_tap_action)),!e.template_mode||e.template&&""!==e.template.trim()||o.push("Template code is required when template mode is enabled"),{valid:0===o.length,errors:o}}hasActiveLink(t){const e=t.link&&""!==t.link.trim(),o=t.tap_action&&"default"!==t.tap_action.action&&"nothing"!==t.tap_action.action,i=t.hold_action&&"default"!==t.hold_action.action&&"nothing"!==t.hold_action.action,n=t.double_tap_action&&"default"!==t.double_tap_action.action&&"nothing"!==t.double_tap_action.action;return e||o||i||n}validateAction(t){const e=[];switch(t.action){case"more-info":case"toggle":t.entity||e.push(`Entity is required for ${t.action} action`);break;case"navigate":t.navigation_path||e.push("Navigation path is required for navigate action");break;case"url":t.url_path||e.push("URL path is required for url action");break;case"perform-action":t.service||e.push("Service is required for perform-action")}return e}handleClick(t,e,o){t.preventDefault(),this.clickTimeout&&clearTimeout(this.clickTimeout),this.clickTimeout=setTimeout((()=>{this.handleTapAction(t,e,o)}),300)}handleDoubleClick(t,e,o){t.preventDefault(),this.clickTimeout&&(clearTimeout(this.clickTimeout),this.clickTimeout=null),this.handleDoubleAction(t,e,o)}handleMouseDown(t,e,o){this.startHold(t,e,o)}handleMouseUp(t,e,o){this.endHold(t,e,o)}handleMouseLeave(t,e,o){this.endHold(t,e,o)}handleTouchStart(t,e,o){this.startHold(t,e,o)}handleTouchEnd(t,e,o){this.endHold(t,e,o)}startHold(t,e,o){this.isHolding=!1,this.holdTimeout=setTimeout((()=>{this.isHolding=!0,this.handleHoldAction(t,e,o)}),500)}endHold(t,e,o){this.holdTimeout&&(clearTimeout(this.holdTimeout),this.holdTimeout=null),this.isHolding=!1}handleTapAction(t,e,o){this.isHolding||(e.link&&""!==e.link.trim()?e.link.startsWith("http")||e.link.startsWith("https")?window.open(e.link,"_blank"):window.location.href=e.link:e.tap_action&&"default"!==e.tap_action.action&&"nothing"!==e.tap_action.action&&vt.handleAction(e.tap_action,o,t.target))}handleDoubleAction(t,e,o){e.double_tap_action&&"default"!==e.double_tap_action.action&&"nothing"!==e.double_tap_action.action&&vt.handleAction(e.double_tap_action,o,t.target)}handleHoldAction(t,e,o){e.hold_action&&"default"!==e.hold_action.action&&"nothing"!==e.hold_action.action&&vt.handleAction(e.hold_action,o,t.target)}getStyles(){return"\n      .text-module-preview {\n        min-height: 20px;\n        word-wrap: break-word;\n      }\n      \n      .text-module-hidden {\n        color: var(--secondary-text-color);\n        font-style: italic;\n        text-align: center;\n        padding: 12px;\n        background: var(--secondary-background-color);\n        border-radius: 4px;\n      }\n      \n      /* Field styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n        color: var(--primary-text-color) !important;\n        margin-bottom: 4px !important;\n        display: block !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        display: block !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      .settings-section {\n        margin-bottom: 16px;\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Conditional Fields Grouping CSS */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n      }\n\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      @keyframes slideInFromLeft {\n        from { \n          opacity: 0; \n          transform: translateX(-10px); \n        }\n        to { \n          opacity: 1; \n          transform: translateX(0); \n        }\n      }\n\n      /* Icon picker specific styling */\n      ha-icon-picker {\n        --ha-icon-picker-width: 100%;\n        --ha-icon-picker-height: 56px;\n      }\n\n      /* Text field and select consistency */\n      ha-textfield,\n      ha-select {\n        --mdc-shape-small: 8px;\n        --mdc-theme-primary: var(--primary-color);\n      }\n\n      code {\n        background: var(--secondary-background-color);\n        padding: 2px 6px;\n        border-radius: 4px;\n        font-family: 'Courier New', monospace;\n        font-size: 0.9em;\n        color: var(--primary-color);\n      }\n    "}getBackgroundImageCSS(t,e){const o=t.background_image_type,i=t.background_image,n=t.background_image_entity;switch(o){case"upload":if(i)return i.startsWith("/api/image/serve/")?`url("${this.getImageUrl(e,i)}")`:(i.startsWith("data:image/"),`url("${i}")`);break;case"entity":if(n&&e){const t=e.states[n];if(t){const e=t.attributes.entity_picture||t.attributes.image||t.state;if(e&&"unknown"!==e&&"unavailable"!==e)return`url("${e}")`}}break;case"url":if(i)return`url("${i}")`;break;default:return"none"}return"none"}getImageUrl(t,e){if(!e)return"";if(e.startsWith("http"))return e;if(e.startsWith("data:image/"))return e;if(e.includes("/api/image/serve/")){const o=e.match(/\/api\/image\/serve\/([^\/]+)/);if(o&&o[1]){const i=o[1];try{return`${(t.hassUrl?t.hassUrl():"").replace(/\/$/,"")}/api/image/serve/${i}/original`}catch(t){return e}}return e}return e.startsWith("/")?`${(t.hassUrl?t.hassUrl():"").replace(/\/$/,"")}${e}`:e}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${this.camelToKebab(t)}: ${e}`)).join("; ")}camelToKebab(t){return t.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}addPixelUnit(t){return t?/^\d+$/.test(t)?`${t}px`:/^[\d\s]+$/.test(t)?t.split(" ").map((t=>t.trim()?`${t}px`:t)).join(" "):t:t}}class yt extends ht{constructor(){super(...arguments),this.metadata={type:"separator",title:"Separator Module",description:"Visual dividers and spacing",author:"WJD Designs",version:"1.0.0",icon:"mdi:minus",category:"content",tags:["separator","divider","spacing","layout"]}}createDefault(t){return{id:t||this.generateId("separator"),type:"separator",separator_style:"line",thickness:1,width_percent:100,color:"var(--divider-color)",show_title:!1,title:"",title_size:14,title_color:"var(--secondary-text-color)",title_bold:!1,title_italic:!1,title_uppercase:!1,title_strikethrough:!1,title_underline:!1}}renderGeneralTab(t,e,o,i){const n=t;return V`
      <div class="module-general-settings">
        <!-- Separator Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Separator Configuration
          </div>

          <!-- Separator Style -->
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            Separator Style
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
          >
            Choose the visual style of the separator line.
          </div>
          <ha-form
            .hass=${e}
            .data=${{separator_style:n.separator_style||"line"}}
            .schema=${[{name:"separator_style",selector:{select:{options:[{value:"line",label:"Solid Line"},{value:"double_line",label:"Double Line"},{value:"dotted",label:"Dotted Line"},{value:"double_dotted",label:"Double Dotted"},{value:"shadow",label:"Shadow"},{value:"blank",label:"Blank Space"}],mode:"dropdown"}},label:""}]}
            @value-changed=${t=>i({separator_style:t.detail.value.separator_style})}
          ></ha-form>
        </div>

        <!-- Appearance Configuration -->
        ${"blank"!==n.separator_style?V`
              <div
                class="settings-section"
                style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
              >
                <div
                  class="section-title"
                  style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
                >
                  Appearance
                </div>

                <!-- Thickness -->
                <div class="field-container" style="margin-bottom: 24px;">
                  <div class="field-title">Thickness (px)</div>
                  <div class="field-description">Thickness of the separator line.</div>
                  <div
                    class="gap-control-container"
                    style="display: flex; align-items: center; gap: 12px;"
                  >
                    <input
                      type="range"
                      class="gap-slider"
                      min="1"
                      max="20"
                      step="1"
                      .value="${n.thickness||1}"
                      @input=${t=>{const e=t.target,o=parseFloat(e.value);i({thickness:o})}}
                    />
                    <input
                      type="number"
                      class="gap-input"
                      min="1"
                      max="20"
                      step="1"
                      .value="${n.thickness||1}"
                      @input=${t=>{const e=t.target,o=parseFloat(e.value);isNaN(o)||i({thickness:o})}}
                      @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=parseFloat(e.value)||1,n="ArrowUp"===t.key?1:-1,a=Math.max(1,Math.min(20,o+n));i({thickness:a})}}}
                    />
                    <button
                      class="reset-btn"
                      @click=${()=>i({thickness:1})}
                      title="Reset to default (1)"
                    >
                      <ha-icon icon="mdi:refresh"></ha-icon>
                    </button>
                  </div>
                </div>

                <!-- Width -->
                <div class="field-container" style="margin-bottom: 24px;">
                  <div class="field-title">Width (%)</div>
                  <div class="field-description">
                    Width of the separator as percentage of container.
                  </div>
                  <div
                    class="gap-control-container"
                    style="display: flex; align-items: center; gap: 12px;"
                  >
                    <input
                      type="range"
                      class="gap-slider"
                      min="10"
                      max="100"
                      step="5"
                      .value="${n.width_percent||100}"
                      @input=${t=>{const e=t.target,o=parseFloat(e.value);i({width_percent:o})}}
                    />
                    <input
                      type="number"
                      class="gap-input"
                      min="10"
                      max="100"
                      step="5"
                      .value="${n.width_percent||100}"
                      @input=${t=>{const e=t.target,o=parseFloat(e.value);isNaN(o)||i({width_percent:o})}}
                      @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=parseFloat(e.value)||100,n="ArrowUp"===t.key?5:-5,a=Math.max(10,Math.min(100,o+n));i({width_percent:a})}}}
                    />
                    <button
                      class="reset-btn"
                      @click=${()=>i({width_percent:100})}
                      title="Reset to default (100)"
                    >
                      <ha-icon icon="mdi:refresh"></ha-icon>
                    </button>
                  </div>
                </div>

                <!-- Color -->
                <div class="field-group">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    Color of the separator line.
                  </div>
                  <ultra-color-picker
                    .label=${""}
                    .value=${n.color||""}
                    .defaultValue=${"var(--divider-color)"}
                    .hass=${e}
                    @value-changed=${t=>{const e=t.detail.value;i({color:e})}}
                  ></ultra-color-picker>
                </div>
              </div>
            `:""}

        <!-- Text in Separator -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div style="margin-bottom: 16px;">
            ${bt.renderField("Show Title","Add text in the middle of the separator line (e.g., ------ Text ------)",e,{show_title:n.show_title||!1},[bt.createSchemaItem("show_title",{boolean:{}})],(t=>i({show_title:t.detail.value.show_title})))}
          </div>

          ${n.show_title?V`
                <!-- Text Content -->
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Text Content
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    Text to display in the middle of the separator.
                  </div>
                  <ha-form
                    .hass=${e}
                    .data=${{title:n.title||""}}
                    .schema=${[{name:"title",selector:{text:{}},label:""}]}
                    @value-changed=${t=>i({title:t.detail.value.title})}
                  ></ha-form>
                </div>

                <!-- Font Size -->
                <div class="field-container" style="margin-bottom: 24px;">
                  <div class="field-title">Font Size</div>
                  <div class="field-description">Size of the text in pixels.</div>
                  <div
                    class="gap-control-container"
                    style="display: flex; align-items: center; gap: 12px;"
                  >
                    <input
                      type="range"
                      class="gap-slider"
                      min="8"
                      max="48"
                      step="1"
                      .value="${n.title_size||14}"
                      @input=${t=>{const e=t.target,o=parseFloat(e.value);i({title_size:o})}}
                    />
                    <input
                      type="number"
                      class="gap-input"
                      min="8"
                      max="48"
                      step="1"
                      .value="${n.title_size||14}"
                      @input=${t=>{const e=t.target,o=parseFloat(e.value);isNaN(o)||i({title_size:o})}}
                      @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=parseFloat(e.value)||14,n="ArrowUp"===t.key?1:-1,a=Math.max(8,Math.min(48,o+n));i({title_size:a})}}}
                    />
                    <button
                      class="reset-btn"
                      @click=${()=>i({title_size:14})}
                      title="Reset to default (14)"
                    >
                      <ha-icon icon="mdi:refresh"></ha-icon>
                    </button>
                  </div>
                </div>

                <!-- Text Color -->
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Text Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    Color of the separator text.
                  </div>
                  <ultra-color-picker
                    .label=${""}
                    .value=${n.title_color||""}
                    .defaultValue=${"var(--secondary-text-color)"}
                    .hass=${e}
                    @value-changed=${t=>{const e=t.detail.value;i({title_color:e})}}
                  ></ultra-color-picker>
                </div>

                <!-- Text Formatting -->
                <div class="field-group">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Text Formatting
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    Apply formatting styles to the separator text.
                  </div>
                  <div class="format-buttons" style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button
                      class="format-btn ${n.title_bold?"active":""}"
                      @click=${()=>i({title_bold:!n.title_bold})}
                      style="padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${n.title_bold?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${n.title_bold?"white":"var(--primary-text-color)"};"
                      title="Bold"
                    >
                      <ha-icon icon="mdi:format-bold"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${n.title_italic?"active":""}"
                      @click=${()=>i({title_italic:!n.title_italic})}
                      style="padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${n.title_italic?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${n.title_italic?"white":"var(--primary-text-color)"};"
                      title="Italic"
                    >
                      <ha-icon icon="mdi:format-italic"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${n.title_underline?"active":""}"
                      @click=${()=>i({title_underline:!n.title_underline})}
                      style="padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${n.title_underline?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${n.title_underline?"white":"var(--primary-text-color)"};"
                      title="Underline"
                    >
                      <ha-icon icon="mdi:format-underline"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${n.title_uppercase?"active":""}"
                      @click=${()=>i({title_uppercase:!n.title_uppercase})}
                      style="padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${n.title_uppercase?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${n.title_uppercase?"white":"var(--primary-text-color)"};"
                      title="Uppercase"
                    >
                      <ha-icon icon="mdi:format-letter-case-upper"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${n.title_strikethrough?"active":""}"
                      @click=${()=>i({title_strikethrough:!n.title_strikethrough})}
                      style="padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${n.title_strikethrough?"var(--primary-color)":"var(--secondary-background-color)"}; cursor: pointer; transition: all 0.2s ease; color: ${n.title_strikethrough?"white":"var(--primary-text-color)"};"
                      title="Strikethrough"
                    >
                      <ha-icon icon="mdi:format-strikethrough"></ha-icon>
                    </button>
                  </div>
                </div>
              `:""}
        </div>
      </div>
    `}renderPreview(t,e){const o=t,i=o,n={padding:i.padding_top||i.padding_bottom||i.padding_left||i.padding_right?`${i.padding_top||"8"}px ${i.padding_right||"0"}px ${i.padding_bottom||"8"}px ${i.padding_left||"0"}px`:"8px 0",margin:i.margin_top||i.margin_bottom||i.margin_left||i.margin_right?`${i.margin_top||"0"}px ${i.margin_right||"0"}px ${i.margin_bottom||"0"}px ${i.margin_left||"0"}px`:"0",background:i.background_color||"transparent",backgroundImage:this.getBackgroundImageCSS(i,e),backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",border:i.border_style&&"none"!==i.border_style?`${i.border_width||"1px"} ${i.border_style} ${i.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(i.border_radius)||"0",position:i.position||"relative",top:i.top||"auto",bottom:i.bottom||"auto",left:i.left||"auto",right:i.right||"auto",zIndex:i.z_index||"auto",width:i.width||"100%",height:i.height||"auto",maxWidth:i.max_width||"100%",maxHeight:i.max_height||"none",minWidth:i.min_width||"none",minHeight:i.min_height||"auto",overflow:i.overflow||"visible",clipPath:i.clip_path||"none",backdropFilter:i.backdrop_filter||"none",boxShadow:i.box_shadow_h&&i.box_shadow_v?`${i.box_shadow_h||"0"} ${i.box_shadow_v||"0"} ${i.box_shadow_blur||"0"} ${i.box_shadow_spread||"0"} ${i.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"};if("blank"===o.separator_style)return V`
        <div class="separator-module-container" style=${this.styleObjectToCss(n)}>
          <div
            class="separator-preview blank-separator"
            style="height: ${o.thickness||1}px;"
          >
            ${o.show_title&&o.title?V`
                  <div class="separator-title" style=${this.getTitleStyles(o)}>
                    ${o.title}
                  </div>
                `:""}
          </div>
        </div>
      `;const a=this.getSeparatorStyles(o);return V`
      <div class="separator-module-container" style=${this.styleObjectToCss(n)}>
        <div class="separator-preview" style="width: 100%; text-align: center;">
          ${o.show_title&&o.title?V`
                <div
                  class="separator-with-title"
                  style="position: relative; display: flex; align-items: center; justify-content: center; width: 100%;"
                >
                  <div
                    class="separator-line-left"
                    style=${this.getSeparatorLineStyles(o,"left")}
                  ></div>
                  <div class="separator-title" style=${this.getTitleStyles(o)}>
                    ${o.title}
                  </div>
                  <div
                    class="separator-line-right"
                    style=${this.getSeparatorLineStyles(o,"right")}
                  ></div>
                </div>
              `:V` <div class="separator-line" style=${a}></div> `}
        </div>
      </div>
    `}validate(t){const e=t,o=[...super.validate(t).errors];return e.thickness&&(e.thickness<1||e.thickness>50)&&o.push("Thickness must be between 1 and 50 pixels"),e.width_percent&&(e.width_percent<1||e.width_percent>100)&&o.push("Width must be between 1 and 100 percent"),!e.show_title||e.title&&""!==e.title.trim()||o.push("Title text is required when show title is enabled"),{valid:0===o.length,errors:o}}getStyles(){return"\n      .separator-preview {\n        min-height: 20px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n      }\n      \n      .blank-separator {\n        background: transparent;\n        border: 1px dashed var(--divider-color);\n        opacity: 0.5;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        min-height: 20px;\n      }\n      \n      .separator-with-title {\n        position: relative;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        width: 100%;\n      }\n      \n      .separator-title {\n        margin: 0;\n        line-height: 1.2;\n        background: var(--card-background-color);\n        padding: 0 8px;\n        position: relative;\n        z-index: 1;\n        white-space: nowrap;\n      }\n      \n      .separator-line,\n      .separator-line-left,\n      .separator-line-right {\n        display: block;\n      }\n      \n      .separator-line-left,\n      .separator-line-right {\n        flex: 1;\n      }\n      \n      /* Format button styles */\n      .format-buttons {\n        display: flex;\n        gap: 8px;\n        flex-wrap: wrap;\n      }\n      \n      .format-btn {\n        padding: 8px;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        min-width: 36px;\n        min-height: 36px;\n      }\n      \n      .format-btn:hover {\n        transform: translateY(-1px);\n        box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n      }\n      \n      .format-btn ha-icon {\n        font-size: 16px;\n      }\n      \n      /* Settings section styling */\n      .settings-section {\n        background: var(--secondary-background-color);\n        border-radius: 8px;\n        padding: 16px;\n        margin-bottom: 32px;\n      }\n      \n      .section-title {\n        font-size: 18px;\n        font-weight: 700;\n        text-transform: uppercase;\n        color: var(--primary-color);\n        margin-bottom: 16px;\n        padding-bottom: 0;\n        border-bottom: none;\n        letter-spacing: 0.5px;\n      }\n      \n      .field-title {\n        font-size: 16px;\n        font-weight: 600;\n        margin-bottom: 4px;\n      }\n      \n      .field-description {\n        font-size: 13px;\n        font-weight: 400;\n        margin-bottom: 12px;\n        color: var(--secondary-text-color);\n      }\n      \n      .field-group {\n        margin-bottom: 16px;\n      }\n\n      /* Gap control styles */\n      .gap-control-container {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n\n      .gap-slider {\n        flex: 1;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .gap-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider:hover {\n        background: var(--primary-color);\n        opacity: 0.7;\n      }\n\n      .gap-slider:hover::-webkit-slider-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-slider:hover::-moz-range-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-input {\n        width: 50px !important;\n        max-width: 50px !important;\n        min-width: 50px !important;\n        padding: 4px 6px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n      }\n\n      .gap-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      .reset-btn {\n        width: 36px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n\n      .reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .reset-btn ha-icon {\n        font-size: 16px;\n      }\n    "}getSeparatorStyles(t){const e={width:`${t.width_percent||100}%`,height:`${t.thickness||1}px`,margin:"0 auto"};switch(t.separator_style){case"line":e.backgroundColor=t.color||"var(--divider-color)";break;case"double_line":e.borderTop=`${t.thickness||1}px solid ${t.color||"var(--divider-color)"}`,e.borderBottom=`${t.thickness||1}px solid ${t.color||"var(--divider-color)"}`,e.height=3*(t.thickness||1)+"px";break;case"dotted":e.borderTop=`${t.thickness||1}px dotted ${t.color||"var(--divider-color)"}`,e.height="0";break;case"double_dotted":e.borderTop=`${t.thickness||1}px dotted ${t.color||"var(--divider-color)"}`,e.borderBottom=`${t.thickness||1}px dotted ${t.color||"var(--divider-color)"}`,e.height=3*(t.thickness||1)+"px";break;case"shadow":e.boxShadow=`0 ${t.thickness||1}px ${2*(t.thickness||1)}px ${t.color||"rgba(0,0,0,0.2)"}`,e.height="0"}return Object.entries(e).map((([t,e])=>`${this.camelToKebab(t)}: ${e}`)).join("; ")}getSeparatorLineStyles(t,e){const o={flex:"1",height:`${t.thickness||1}px`,margin:"0"};switch(t.separator_style){case"line":o.backgroundColor=t.color||"var(--divider-color)";break;case"double_line":o.borderTop=`${t.thickness||1}px solid ${t.color||"var(--divider-color)"}`,o.borderBottom=`${t.thickness||1}px solid ${t.color||"var(--divider-color)"}`,o.height=3*(t.thickness||1)+"px";break;case"dotted":o.borderTop=`${t.thickness||1}px dotted ${t.color||"var(--divider-color)"}`,o.height="0";break;case"double_dotted":o.borderTop=`${t.thickness||1}px dotted ${t.color||"var(--divider-color)"}`,o.borderBottom=`${t.thickness||1}px dotted ${t.color||"var(--divider-color)"}`,o.height=3*(t.thickness||1)+"px";break;case"shadow":o.boxShadow=`0 ${t.thickness||1}px ${2*(t.thickness||1)}px ${t.color||"rgba(0,0,0,0.2)"}`,o.height="0"}return Object.entries(o).map((([t,e])=>`${this.camelToKebab(t)}: ${e}`)).join("; ")}getTitleStyles(t){const e={fontSize:`${t.title_size||14}px`,color:t.title_color||"var(--secondary-text-color)",fontWeight:t.title_bold?"bold":"normal",fontStyle:t.title_italic?"italic":"normal",textTransform:t.title_uppercase?"uppercase":"none",margin:"0",padding:"0 8px",backgroundColor:"var(--card-background-color)",position:"relative",zIndex:"1"},o=[];return t.title_strikethrough&&o.push("line-through"),t.title_underline&&o.push("underline"),e.textDecoration=o.length>0?o.join(" "):"none",Object.entries(e).map((([t,e])=>`${this.camelToKebab(t)}: ${e}`)).join("; ")}camelToKebab(t){return t.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}getBackgroundImageCSS(t,e){var o,i;if(!t.background_image_type||"none"===t.background_image_type)return"none";switch(t.background_image_type){case"upload":case"url":if(t.background_image)return`url("${t.background_image}")`;break;case"entity":if(t.background_image_entity&&(null==e?void 0:e.states[t.background_image_entity])){const n=e.states[t.background_image_entity];let a="";if((null===(o=n.attributes)||void 0===o?void 0:o.entity_picture)?a=n.attributes.entity_picture:(null===(i=n.attributes)||void 0===i?void 0:i.image)?a=n.attributes.image:n.state&&"string"==typeof n.state&&(n.state.startsWith("/")||n.state.startsWith("http"))&&(a=n.state),a)return a.startsWith("/local/")||a.startsWith("/media/")||a.startsWith("/"),`url("${a}")`}}return"none"}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${t.replace(/[A-Z]/g,(t=>`-${t.toLowerCase()}`))}: ${e}`)).join("; ")}addPixelUnit(t){return t?/^\d+$/.test(t)?`${t}px`:/^[\d\s]+$/.test(t)?t.split(" ").map((t=>t.trim()?`${t}px`:t)).join(" "):t:t}}var _t=function(t,e,o,i){var n,a=arguments.length,r=a<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,o,i);else for(var l=t.length-1;l>=0;l--)(n=t[l])&&(r=(a<3?n(r):a>3?n(e,o,r):n(e,o))||r);return a>3&&r&&Object.defineProperty(e,o,r),r};const xt=["#000000","#333333","#666666","#999999","#CCCCCC","#FFFFFF","#FF0000","#FF3333","#FF6666","#FF9999","#FFCCCC","#FF6600","#FF8833","#FFAA66","#FFCC99","#FFE6CC","#FFFF00","#FFFF33","#FFFF66","#FFFF99","#FFFFCC","#00FF00","#33FF33","#66FF66","#99FF99","#CCFFCC","#0000FF","#3333FF","#6666FF","#9999FF","#CCCCFF","#9900FF","#AA33FF","#BB66FF","#CC99FF","#DDCCFF","var(--primary-color)","var(--accent-color)","var(--error-color)","var(--warning-color)","var(--success-color)","var(--info-color)","var(--primary-text-color)","var(--secondary-text-color)","var(--disabled-text-color)","var(--divider-color)"];let wt=class extends st{constructor(){super(...arguments),this.disabled=!1,this._showPalette=!1}firstUpdated(){this._currentValue=this.value,this._textInputValue=this.value,document.addEventListener("click",this._handleDocumentClick.bind(this))}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._handleDocumentClick.bind(this))}_handleDocumentClick(t){var e;if(!this._showPalette)return;const o=t.target;(null===(e=this.shadowRoot)||void 0===e?void 0:e.contains(o))||o instanceof HTMLInputElement&&"color"===o.type||(this._showPalette=!1)}updated(t){t.has("value")&&(this._currentValue=this.value,this._textInputValue=this.value)}_togglePalette(t){t.stopPropagation(),this.disabled||(this._showPalette=!this._showPalette,console.log(`🎨 UltraColorPicker: Toggled palette to ${this._showPalette}`))}_selectColor(t,e){e.stopPropagation(),this._currentValue=t,this._showPalette=!1;const o=new CustomEvent("value-changed",{detail:{value:t},bubbles:!0,composed:!0});this.dispatchEvent(o)}_handleNativeColorChange(t){t.stopPropagation();const e=t.target.value;this._selectColor(e,t)}_handleTextInputChange(t){const e=t.target;this._textInputValue=e.value}_handleTextInputKeyDown(t){"Enter"===t.key?(t.preventDefault(),this._applyTextInputValue()):"Escape"===t.key&&(t.preventDefault(),this._textInputValue=this._currentValue,this._showPalette=!1)}_applyTextInputValue(){void 0!==this._textInputValue&&this._selectColor(this._textInputValue,new Event("change"))}_isValidColor(t){return!!t&&([/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/,/^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/,/^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/,/^var\(--[\w-]+\)$/].some((e=>e.test(t)))||["transparent","red","blue","green","yellow","orange","purple","pink","brown","black","white","gray","grey"].includes(t.toLowerCase()))}_resetToDefault(){const t=this.defaultValue||"";this._currentValue=t;const e=new CustomEvent("value-changed",{detail:{value:t},bubbles:!0,composed:!0});this.dispatchEvent(e)}_getDisplayValue(){return this._currentValue&&""!==this._currentValue?this._currentValue:this.defaultValue||""}_getColorForNativeInput(){const t=this._getDisplayValue();if(t.startsWith("var(--")){const e=document.createElement("div");e.style.color=t,document.body.appendChild(e);const o=getComputedStyle(e).color;if(document.body.removeChild(e),o&&o.startsWith("rgb")){const t=o.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);if(t){const[e,o,i,n]=t,a=t=>t.toString(16).padStart(2,"0");return`#${a(parseInt(o))}${a(parseInt(i))}${a(parseInt(n))}`}}return t.includes("--primary-color")?"#03a9f4":t.includes("--primary-text-color")?"#ffffff":"#000000"}return t.startsWith("#")?t:"#000000"}_isDefaultValue(){return!this._currentValue||""===this._currentValue||this._currentValue===this.defaultValue}render(){const t=this._getDisplayValue(),e=this._getColorForNativeInput();return V`
      <div class="ultra-color-picker-container">
        ${this.label?V`<label class="color-label">${this.label}</label>`:""}

        <div class="color-picker-wrapper">
          <!-- Main trigger input field -->
          <div
            class="color-input-field ${this.disabled?"disabled":""}"
            @click=${this._togglePalette}
            tabindex="0"
            role="button"
            aria-label="Open color palette"
            @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._togglePalette(t))}}
          >
            <span class="color-value">${t}</span>
            <ha-icon
              icon="mdi:chevron-${this._showPalette?"up":"down"}"
              class="dropdown-icon"
            ></ha-icon>
          </div>

          <!-- Reset button -->
          <ha-icon-button
            class="reset-button ${this._isDefaultValue()?"disabled":""}"
            .disabled=${this._isDefaultValue()}
            @click=${this._resetToDefault}
            .title=${"Reset to default"}
          >
            <ha-icon icon="mdi:refresh"></ha-icon>
          </ha-icon-button>
        </div>

        <!-- Accordion-style palette -->
        ${this._showPalette?V`
              <div class="color-palette-accordion">
                <!-- Text Input Section -->
                <div class="text-input-section">
                  <div class="input-header">
                    <label class="input-label">Type color value:</label>
                    <div class="native-picker-wrapper">
                      <button
                        class="native-picker-btn"
                        type="button"
                        title="Open native color picker"
                      >
                        <ha-icon icon="mdi:eyedropper"></ha-icon>
                      </button>
                      <input
                        id="native-color-input"
                        type="color"
                        .value=${e}
                        @change=${this._handleNativeColorChange}
                        @click=${t=>t.stopPropagation()}
                        @focus=${t=>t.stopPropagation()}
                        @blur=${t=>t.stopPropagation()}
                        class="native-color-overlay"
                        title="Open native color picker"
                      />
                    </div>
                  </div>

                  <div class="text-input-wrapper">
                    <input
                      type="text"
                      class="color-text-input ${this._isValidColor(this._textInputValue||"")?"valid":"invalid"}"
                      .value=${this._textInputValue||""}
                      @input=${this._handleTextInputChange}
                      @keydown=${this._handleTextInputKeyDown}
                      placeholder="e.g. #ff0000, rgb(255,0,0), var(--primary-color)"
                      spellcheck="false"
                    />
                    <button
                      class="apply-text-btn ${this._isValidColor(this._textInputValue||"")?"":"disabled"}"
                      @click=${t=>{t.stopPropagation(),this._applyTextInputValue()}}
                      .disabled=${!this._isValidColor(this._textInputValue||"")}
                      type="button"
                      title="Apply color"
                    >
                      <ha-icon icon="mdi:check"></ha-icon>
                    </button>
                  </div>
                </div>

                <!-- Color Palette Grid -->
                <div class="palette-grid">
                  ${xt.map((t=>V`
                      <div
                        class="color-swatch ${this._currentValue===t?"selected":""}"
                        style="background-color: ${t}"
                        @click=${e=>this._selectColor(t,e)}
                        title="${t}"
                      ></div>
                    `))}
                </div>
              </div>
            `:""}
      </div>
    `}static get styles(){return a`
      .ultra-color-picker-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        position: relative;
        box-sizing: border-box;
      }

      .color-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 4px;
      }

      .color-picker-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        position: relative;
        /* Ensure palette can overflow this container */
        overflow: visible;
        z-index: 1;
      }

      .color-input-field {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-family: var(--code-font-family, monospace);
        font-size: 14px;
        cursor: pointer;
        user-select: none;
        transition: all 0.2s ease;
        min-height: 36px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
      }

      .color-input-field:hover:not(.disabled) {
        border-color: var(--primary-color);
        background: var(--primary-color-light, rgba(33, 150, 243, 0.1));
      }

      .color-input-field:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 33, 150, 243), 0.2);
      }

      .color-input-field.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--disabled-color, #f5f5f5);
        color: var(--disabled-text-color);
      }

      .color-value {
        flex: 1;
        color: var(--primary-text-color);
        font-family: var(--code-font-family, monospace);
        font-size: 14px;
      }

      .dropdown-icon {
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
        transition: transform 0.2s ease;
        margin-left: 8px;
      }

      .reset-button {
        --mdc-icon-button-size: 40px;
        --mdc-icon-size: 20px;
        --mdc-theme-primary: var(--primary-color);
        border-radius: 6px;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .reset-button:not(.disabled):hover {
        background: rgba(var(--primary-color-rgb, 33, 150, 243), 0.1);
        transform: rotate(180deg);
        transform-origin: center center;
      }

      .reset-button ha-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        transform-origin: center center;
      }

      .reset-button.disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .reset-button.disabled ha-icon {
        color: var(--disabled-text-color);
      }

      .color-palette-accordion {
        margin-top: 12px;
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 16px;
        width: 100%;
        box-sizing: border-box;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        animation: expandDown 0.2s ease-out;
      }

      @keyframes expandDown {
        from {
          opacity: 0;
          transform: scaleY(0.8);
          transform-origin: top;
        }
        to {
          opacity: 1;
          transform: scaleY(1);
          transform-origin: top;
        }
      }

      .text-input-section {
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .input-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .input-label {
        display: block;
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .text-input-wrapper {
        display: flex;
        gap: 8px;
        align-items: stretch;
      }

      .color-text-input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-family: var(--code-font-family, 'Courier New', monospace);
        font-size: 14px;
        transition: all 0.2s ease;
        outline: none;
      }

      .color-text-input:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 33, 150, 243), 0.2);
      }

      .color-text-input.valid {
        border-color: var(--success-color, #4caf50);
      }

      .color-text-input.invalid {
        border-color: var(--error-color, #f44336);
      }

      .apply-text-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px 12px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 44px;
      }

      .apply-text-btn:hover:not(.disabled) {
        background: var(--primary-color-dark, var(--primary-color));
        transform: scale(1.05);
      }

      .apply-text-btn.disabled {
        background: var(--disabled-color, #cccccc);
        color: var(--disabled-text-color);
        cursor: not-allowed;
        opacity: 0.6;
      }

      .apply-text-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .palette-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(32px, 1fr));
        gap: 8px;
        margin-bottom: 0;
        width: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }

      .color-swatch {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s ease;
        position: relative;
      }

      .color-swatch:hover {
        transform: scale(1.1);
        border-color: var(--primary-color);
      }

      .color-swatch.selected {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 33, 150, 243), 0.3);
      }

      .color-swatch[style*='var(--'] {
        position: relative;
      }

      .color-swatch[style*='var(--']:after {
        content: 'T';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 12px;
        font-weight: bold;
        color: var(--primary-text-color);
        text-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
      }

      .native-picker-wrapper {
        position: relative;
        display: inline-block;
      }

      .native-picker-btn {
        background: none;
        border: none;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        color: var(--primary-color);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 36px;
        height: 36px;
        pointer-events: none; /* Let clicks pass through to the overlay */
      }

      .native-picker-btn:hover {
        background: rgba(var(--primary-color-rgb, 33, 150, 243), 0.1);
        transform: scale(1.1);
      }

      .native-picker-btn ha-icon {
        --mdc-icon-size: 18px;
        transition: transform 0.2s ease;
      }

      .native-color-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        border: none;
        background: transparent;
        z-index: 1;
        border-radius: 6px;
      }

      .native-color-overlay::-webkit-color-swatch-wrapper {
        padding: 0;
        border: none;
        border-radius: 6px;
      }

      .native-color-overlay::-webkit-color-swatch {
        border: none;
        border-radius: 6px;
      }

      .native-picker-wrapper:hover .native-picker-btn {
        background: rgba(var(--primary-color-rgb, 33, 150, 243), 0.1);
        transform: scale(1.1);
      }

      @media (max-width: 768px) {
        .color-picker-wrapper {
          gap: 8px;
        }

        .color-input-field {
          font-size: 13px;
          padding: 6px 10px;
        }

        .color-palette-accordion {
          padding: 12px;
        }

        .palette-grid {
          grid-template-columns: repeat(auto-fit, minmax(28px, 1fr));
          gap: 6px;
        }

        .color-swatch {
          width: 28px;
          height: 28px;
        }

        .input-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .text-input-wrapper {
          flex-direction: column;
          gap: 8px;
        }

        .color-text-input {
          width: 100%;
        }
      }
    `}};_t([mt({attribute:!1})],wt.prototype,"hass",void 0),_t([mt()],wt.prototype,"value",void 0),_t([mt()],wt.prototype,"label",void 0),_t([mt()],wt.prototype,"defaultValue",void 0),_t([mt({type:Boolean})],wt.prototype,"disabled",void 0),_t([gt()],wt.prototype,"_currentValue",void 0),_t([gt()],wt.prototype,"_showPalette",void 0),_t([gt()],wt.prototype,"_textInputValue",void 0),wt=_t([ct("ultra-color-picker")],wt);class $t extends ht{constructor(){super(...arguments),this.metadata={type:"image",title:"Images",description:"Display images and photos",author:"WJD Designs",version:"1.0.0",icon:"mdi:image",category:"media",tags:["image","picture","media","photo"]}}createDefault(t){return{id:t||this.generateId("image"),type:"image",image_type:"default",image_url:"",entity:"",image_entity:"",image_attribute:"",width:100,height:200,aspect_ratio:"auto",object_fit:"cover",alignment:"center",tap_action:{action:"default"},hold_action:{action:"default"},double_tap_action:{action:"default"},filter_blur:0,filter_brightness:100,filter_contrast:100,filter_saturate:100,filter_hue_rotate:0,filter_opacity:100,border_radius:8,border_width:0,border_color:"var(--divider-color)",box_shadow:"none",hover_enabled:!1,hover_effect:"scale",hover_scale:105,hover_rotate:5,hover_opacity:90,hover_blur:0,hover_brightness:110,hover_shadow:"none",hover_translate_x:0,hover_translate_y:0,hover_transition:300}}renderGeneralTab(t,e,o,i){const n=t;return V`
      ${bt.injectCleanFormStyles()}
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
            Image Settings
          </div>

          <!-- Image Source Type -->
          ${bt.renderField("Image Source Type","Choose how you want to specify the image source.",e,{image_type:n.image_type||"default"},[bt.createSchemaItem("image_type",{select:{options:[{value:"default",label:"Default Image"},{value:"url",label:"Image URL"},{value:"upload",label:"Upload Image"},{value:"entity",label:"Entity Image"},{value:"attribute",label:"Entity Attribute"}],mode:"dropdown"}})],(t=>i({image_type:t.detail.value.image_type})))}

          <!-- URL Image Source -->
          ${"url"===n.image_type?this.renderConditionalFieldsGroup("Image URL Configuration",V`
                  ${bt.renderField("Image URL","Enter the direct URL to the image you want to display.",e,{image_url:n.image_url||""},[bt.createSchemaItem("image_url",{text:{}})],(t=>i({image_url:t.detail.value.image_url})))}
                `):""}

          <!-- Upload Image Source -->
          ${"upload"===n.image_type?this.renderConditionalFieldsGroup("Upload Image Configuration",V`
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Upload Image
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    Click to upload an image file from your device.
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                    @change=${t=>this.handleFileUpload(t,i)}
                  />
                `):""}

          <!-- Entity Image Source -->
          ${"entity"===n.image_type?this.renderConditionalFieldsGroup("Entity Image Configuration",V`
                  ${bt.renderField("Entity","Select an entity that has an image (e.g., person, camera entities).",e,{image_entity:n.image_entity||""},[bt.createSchemaItem("image_entity",{entity:{}})],(t=>i({image_entity:t.detail.value.image_entity})))}
                `):""}

          <!-- Attribute Image Source -->
          ${"attribute"===n.image_type?this.renderConditionalFieldsGroup("Entity Attribute Configuration",V`
                  ${bt.renderField("Entity","Select the entity that contains the image URL in one of its attributes.",e,{image_entity:n.image_entity||""},[bt.createSchemaItem("image_entity",{entity:{}})],(t=>i({image_entity:t.detail.value.image_entity})))}

                  <div style="margin-top: 16px;">
                    ${bt.renderField("Attribute Name","Enter the name of the attribute that contains the image URL.",e,{image_attribute:n.image_attribute||""},[bt.createSchemaItem("image_attribute",{text:{}})],(t=>i({image_attribute:t.detail.value.image_attribute})))}
                  </div>
                `):""}
        </div>

        <!-- Size & Appearance -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Size & Appearance
          </div>

          <!-- Width -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${bt.renderField("Width (%)","Set the width as a percentage of the container.",e,{width:n.width||100},[bt.createSchemaItem("width",{number:{min:10,max:100,step:5,mode:"slider"}})],(t=>i({width:t.detail.value.width})))}
          </div>

          <!-- Image Alignment (when width < 100%) -->
          ${(n.width||100)<100?V`
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Image Alignment
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                  >
                    Choose how to align the image when it's less than 100% width.
                  </div>
                  <div
                    style="display: flex; gap: 8px; justify-content: flex-start; flex-wrap: wrap;"
                  >
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${"left"===(n.alignment||"center")?"var(--primary-color)":"var(--divider-color)"}; background: ${"left"===(n.alignment||"center")?"var(--primary-color)":"transparent"}; color: ${"left"===(n.alignment||"center")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                      @click=${()=>i({alignment:"left"})}
                    >
                      <ha-icon
                        icon="mdi:format-align-left"
                        style="font-size: 16px; flex-shrink: 0;"
                      ></ha-icon>
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                        >Left</span
                      >
                    </button>
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${"center"===(n.alignment||"center")?"var(--primary-color)":"var(--divider-color)"}; background: ${"center"===(n.alignment||"center")?"var(--primary-color)":"transparent"}; color: ${"center"===(n.alignment||"center")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                      @click=${()=>i({alignment:"center"})}
                    >
                      <ha-icon
                        icon="mdi:format-align-center"
                        style="font-size: 16px; flex-shrink: 0;"
                      ></ha-icon>
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                        >Center</span
                      >
                    </button>
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${"right"===(n.alignment||"center")?"var(--primary-color)":"var(--divider-color)"}; background: ${"right"===(n.alignment||"center")?"var(--primary-color)":"transparent"}; color: ${"right"===(n.alignment||"center")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                      @click=${()=>i({alignment:"right"})}
                    >
                      <ha-icon
                        icon="mdi:format-align-right"
                        style="font-size: 16px; flex-shrink: 0;"
                      ></ha-icon>
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                        >Right</span
                      >
                    </button>
                  </div>
                </div>
              `:""}

          <!-- Height -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${bt.renderField("Height (px)","Set the height in pixels.",e,{height:n.height||200},[bt.createSchemaItem("height",{number:{min:50,max:800,step:10,mode:"slider"}})],(t=>i({height:t.detail.value.height})))}
          </div>

          <!-- Object Fit -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${bt.renderField("Crop & Fit","Control how the image fits within its container.",e,{object_fit:n.object_fit||"cover"},[bt.createSchemaItem("object_fit",{select:{options:[{value:"cover",label:"Cover (crop to fill)"},{value:"contain",label:"Contain (fit entire image)"},{value:"fill",label:"Fill (stretch to fit)"},{value:"scale-down",label:"Scale Down"},{value:"none",label:"None (original size)"}],mode:"dropdown"}})],(t=>i({object_fit:t.detail.value.object_fit})))}
          </div>

          <!-- Border Radius -->
          <div class="field-group">
            ${bt.renderField("Border Radius","Control the rounded corners of the image.",e,{border_radius:n.border_radius||8},[bt.createSchemaItem("border_radius",{number:{min:0,max:50,step:1,mode:"slider"}})],(t=>i({border_radius:t.detail.value.border_radius})))}
          </div>
        </div>

        <!-- Tap Actions Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          ${vt.render(e,{tap_action:n.tap_action||{action:"default"},hold_action:n.hold_action||{action:"default"},double_tap_action:n.double_tap_action||{action:"default"}},(t=>{i(t)}),"Tap Actions")}
        </div>

        <!-- CSS Filters -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            CSS Filters
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 16px;"
          >
            Apply visual effects to your image using CSS filters.
          </div>

          <!-- Blur -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${bt.renderField("Blur","Apply a blur effect to your image.",e,{filter_blur:n.filter_blur||0},[bt.createSchemaItem("filter_blur",{number:{min:0,max:10,step:.1,mode:"slider"}})],(t=>i({filter_blur:t.detail.value.filter_blur})))}
          </div>

          <!-- Brightness -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${bt.renderField("Brightness (%)","Adjust the brightness of your image.",e,{filter_brightness:n.filter_brightness||100},[bt.createSchemaItem("filter_brightness",{number:{min:0,max:200,step:5,mode:"slider"}})],(t=>i({filter_brightness:t.detail.value.filter_brightness})))}
          </div>

          <!-- Contrast -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${bt.renderField("Contrast (%)","Modify the contrast of your image.",e,{filter_contrast:n.filter_contrast||100},[bt.createSchemaItem("filter_contrast",{number:{min:0,max:200,step:5,mode:"slider"}})],(t=>i({filter_contrast:t.detail.value.filter_contrast})))}
          </div>

          <!-- Saturation -->
          <div class="field-group">
            ${bt.renderField("Saturation (%)","Adjust the saturation of your image.",e,{filter_saturate:n.filter_saturate||100},[bt.createSchemaItem("filter_saturate",{number:{min:0,max:200,step:5,mode:"slider"}})],(t=>i({filter_saturate:t.detail.value.filter_saturate})))}
          </div>
        </div>

        <!-- Hover Effects -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 0;"
        >
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 0; border-bottom: none;"
          >
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;"
            >
              Hover Effects
            </div>
            ${bt.renderField("Hover Effects Enabled","Enable hover effects for this image.",e,{enabled:n.hover_enabled||!1},[bt.createSchemaItem("enabled",{boolean:{}})],(t=>i({hover_enabled:t.detail.value.enabled})))}
          </div>

          ${n.hover_enabled?this.renderConditionalFieldsGroup("Hover Effects Configuration",V`
                  <!-- Effect Type -->
                  <div class="field-group" style="margin-bottom: 16px;">
                    <div
                      class="field-title"
                      style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                    >
                      Effect Type
                    </div>
                    ${bt.renderField("Effect Type","Choose the type of hover effect.",e,{effect:n.hover_effect||"scale"},[bt.createSchemaItem("effect",{select:{options:[{value:"scale",label:"Scale (zoom in/out)"},{value:"rotate",label:"Rotate"},{value:"fade",label:"Fade (opacity change)"},{value:"blur",label:"Blur"},{value:"brightness",label:"Brightness"},{value:"glow",label:"Glow (box shadow)"},{value:"slide",label:"Slide (translate)"}],mode:"dropdown"}})],(t=>i({hover_effect:t.detail.value.effect})))}
                  </div>

                  <!-- Scale Effect Settings -->
                  ${"scale"!==n.hover_effect&&n.hover_effect?"":V`
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                          >
                            Scale (%)
                          </div>
                          ${bt.renderField("Scale (%)","Adjust the scale of the image on hover.",e,{scale:n.hover_scale||105},[bt.createSchemaItem("scale",{number:{min:50,max:150,step:5,mode:"slider"}})],(t=>i({hover_scale:t.detail.value.scale})))}
                        </div>
                      `}

                  <!-- Rotate Effect Settings -->
                  ${"rotate"===n.hover_effect?V`
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                          >
                            Rotation (°)
                          </div>
                          ${bt.renderField("Rotation (°)","Rotate the image on hover.",e,{rotate:n.hover_rotate||5},[bt.createSchemaItem("rotate",{number:{min:-180,max:180,step:5,mode:"slider"}})],(t=>i({hover_rotate:t.detail.value.rotate})))}
                        </div>
                      `:""}

                  <!-- Fade Effect Settings -->
                  ${"fade"===n.hover_effect?V`
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                          >
                            Opacity (%)
                          </div>
                          ${bt.renderField("Opacity (%)","Change the opacity of the image on hover.",e,{opacity:n.hover_opacity||90},[bt.createSchemaItem("opacity",{number:{min:0,max:100,step:5,mode:"slider"}})],(t=>i({hover_opacity:t.detail.value.opacity})))}
                        </div>
                      `:""}

                  <!-- Blur Effect Settings -->
                  ${"blur"===n.hover_effect?V`
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                          >
                            Blur (px)
                          </div>
                          ${bt.renderField("Blur (px)","Apply a blur effect to the image on hover.",e,{blur:n.hover_blur||2},[bt.createSchemaItem("blur",{number:{min:0,max:10,step:.5,mode:"slider"}})],(t=>i({hover_blur:t.detail.value.blur})))}
                        </div>
                      `:""}

                  <!-- Brightness Effect Settings -->
                  ${"brightness"===n.hover_effect?V`
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                          >
                            Brightness (%)
                          </div>
                          ${bt.renderField("Brightness (%)","Adjust the brightness of the image on hover.",e,{brightness:n.hover_brightness||110},[bt.createSchemaItem("brightness",{number:{min:50,max:200,step:5,mode:"slider"}})],(t=>i({hover_brightness:t.detail.value.brightness})))}
                        </div>
                      `:""}

                  <!-- Glow Effect Settings -->
                  ${"glow"===n.hover_effect?V`
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                          >
                            Glow Intensity
                          </div>
                          ${bt.renderField("Glow Intensity","Choose the intensity of the glow effect on hover.",e,{shadow:n.hover_shadow||"medium"},[bt.createSchemaItem("shadow",{select:{options:[{value:"light",label:"Light Glow"},{value:"medium",label:"Medium Glow"},{value:"heavy",label:"Heavy Glow"},{value:"custom",label:"Custom Shadow"}],mode:"dropdown"}})],(t=>i({hover_shadow:t.detail.value.shadow})))}
                        </div>
                      `:""}

                  <!-- Slide Effect Settings -->
                  ${"slide"===n.hover_effect?V`
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                          >
                            Horizontal (px)
                          </div>
                          ${bt.renderField("Horizontal (px)","Translate the image horizontally on hover.",e,{translate_x:n.hover_translate_x||0},[bt.createSchemaItem("translate_x",{number:{min:-50,max:50,step:2,mode:"slider"}})],(t=>i({hover_translate_x:t.detail.value.translate_x})))}
                        </div>

                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                          >
                            Vertical (px)
                          </div>
                          ${bt.renderField("Vertical (px)","Translate the image vertically on hover.",e,{translate_y:n.hover_translate_y||0},[bt.createSchemaItem("translate_y",{number:{min:-50,max:50,step:2,mode:"slider"}})],(t=>i({hover_translate_y:t.detail.value.translate_y})))}
                        </div>
                      `:""}

                  <!-- Transition Duration (common for all effects) -->
                  <div class="field-group">
                    <div
                      class="field-title"
                      style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                    >
                      Duration (ms)
                    </div>
                    ${bt.renderField("Duration (ms)","Set the duration for hover effects.",e,{transition:n.hover_transition||300},[bt.createSchemaItem("transition",{number:{min:100,max:1e3,step:50,mode:"slider"}})],(t=>i({hover_transition:t.detail.value.transition})))}
                  </div>
                `):V`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  Enable the toggle above to configure hover effects
                </div>
              `}
        </div>
      </div>
    `}renderPreview(t,e){var o,i;const n=t;let a="";switch(n.image_type){case"default":default:a="/hacsfiles/Ultra-Card/assets/Ultra.jpg";break;case"url":case"upload":a=n.image_url||"";break;case"entity":if(n.image_entity&&(null==e?void 0:e.states[n.image_entity])){const t=e.states[n.image_entity];(null===(o=t.attributes)||void 0===o?void 0:o.entity_picture)?a=t.attributes.entity_picture:t.state&&t.state.startsWith("http")&&(a=t.state)}break;case"attribute":if(n.image_entity&&n.image_attribute&&(null==e?void 0:e.states[n.image_entity])){const t=null===(i=e.states[n.image_entity].attributes)||void 0===i?void 0:i[n.image_attribute];t&&"string"==typeof t&&(a=t)}}const r=[];n.filter_blur&&n.filter_blur>0&&r.push(`blur(${n.filter_blur}px)`),n.filter_brightness&&100!==n.filter_brightness&&r.push(`brightness(${n.filter_brightness}%)`),n.filter_contrast&&100!==n.filter_contrast&&r.push(`contrast(${n.filter_contrast}%)`),n.filter_saturate&&100!==n.filter_saturate&&r.push(`saturate(${n.filter_saturate}%)`);const l=r.length>0?r.join(" "):"none";let s="";const d=n.hover_enabled?`${n.hover_transition||300}ms`:"none";if(n.hover_enabled)switch(n.hover_effect||"scale"){case"scale":const t=(n.hover_scale||105)/100;s=`transform: scale(${t});`;break;case"rotate":s=`transform: rotate(${n.hover_rotate||5}deg);`;break;case"fade":s=`opacity: ${(n.hover_opacity||90)/100};`;break;case"blur":s=`filter: blur(${n.hover_blur||2}px);`;break;case"brightness":s=`filter: brightness(${n.hover_brightness||110}%);`;break;case"glow":let e="";switch(n.hover_shadow||"medium"){case"light":e="0 0 10px rgba(var(--rgb-primary-color), 0.5)";break;case"medium":e="0 0 20px rgba(var(--rgb-primary-color), 0.7)";break;case"heavy":e="0 0 30px rgba(var(--rgb-primary-color), 1)";break;case"custom":e=n.hover_shadow||"0 0 20px rgba(var(--rgb-primary-color), 0.7)"}s=`box-shadow: ${e};`;break;case"slide":const o=n.hover_translate_x||0,i=n.hover_translate_y||0;s=`transform: translate(${o}px, ${i}px);`}const c=`\n      width: ${n.width||100}%;\n      height: ${n.height||200}px;\n      object-fit: ${n.object_fit||"cover"};\n      border-radius: ${n.border_radius||8}px;\n      filter: ${l};\n      transition: ${n.hover_enabled?`transform ${d} ease, filter ${d} ease, opacity ${d} ease, box-shadow ${d} ease`:"none"};\n      cursor: pointer;\n      display: block;\n      border: ${n.border_width?`${n.border_width}px solid ${n.border_color}`:"none"};\n    `;let p="center";switch(n.alignment){case"left":p="flex-start";break;case"center":p="center";break;case"right":p="flex-end"}const u=n,m={padding:u.padding_top||u.padding_bottom||u.padding_left||u.padding_right?`${this.addPixelUnit(u.padding_top)||"0px"} ${this.addPixelUnit(u.padding_right)||"0px"} ${this.addPixelUnit(u.padding_bottom)||"0px"} ${this.addPixelUnit(u.padding_left)||"0px"}`:"0",margin:u.margin_top||u.margin_bottom||u.margin_left||u.margin_right?`${this.addPixelUnit(u.margin_top)||"0px"} ${this.addPixelUnit(u.margin_right)||"0px"} ${this.addPixelUnit(u.margin_bottom)||"0px"} ${this.addPixelUnit(u.margin_left)||"0px"}`:"0",background:u.background_color||"transparent",backgroundImage:this.getBackgroundImageCSS(u,e),backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",border:u.border_style&&"none"!==u.border_style?`${u.border_width||"1px"} ${u.border_style} ${u.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(u.border_radius)||"0",position:u.position||"relative",top:u.top||"auto",bottom:u.bottom||"auto",left:u.left||"auto",right:u.right||"auto",zIndex:u.z_index||"auto",width:u.width||"100%",height:u.height||"auto",maxWidth:u.max_width||"100%",maxHeight:u.max_height||"none",minWidth:u.min_width||"none",minHeight:u.min_height||"auto",overflow:u.overflow||"hidden",clipPath:u.clip_path||"none",backdropFilter:u.backdrop_filter||"none",boxShadow:u.box_shadow_h&&u.box_shadow_v?`${u.box_shadow_h||"0"} ${u.box_shadow_v||"0"} ${u.box_shadow_blur||"0"} ${u.box_shadow_spread||"0"} ${u.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"},g=V`
      <div class="image-module-container" style=${this.styleObjectToCss(m)}>
        <div class="image-module-preview">
          <!-- Image Container with Alignment -->
          <div style="display: flex; justify-content: ${p}; width: 100%;">
            ${a?V`
                  <img
                    src="${a}"
                    alt="Image"
                    style="${c}"
                    @mouseover=${t=>{if(n.hover_enabled&&s){const e=t.target;e.style.transition,e.style.cssText+=s}}}
                    @mouseout=${t=>{if(n.hover_enabled){const e=t.target;e.style.transform="",e.style.opacity="",e.style.filter=l,e.style.boxShadow=""}}}
                    @click=${t=>{const o=n.tap_action||{action:"default"};vt.handleAction(o,e,t.target)}}
                    @contextmenu=${t=>{t.preventDefault();const o=n.hold_action||{action:"default"};vt.handleAction(o,e,t.target)}}
                    @dblclick=${t=>{const o=n.double_tap_action||{action:"default"};vt.handleAction(o,e,t.target)}}
                  />
                `:V`
                  <div
                    style="
                      width: ${n.width||100}%;
                      height: ${n.height||200}px;
                      background: var(--secondary-background-color);
                      border: 2px dashed var(--divider-color);
                      border-radius: ${n.border_radius||8}px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: var(--secondary-text-color);
                      font-size: 14px;
                    "
                  >
                    <div style="text-align: center;">
                      <ha-icon
                        icon="mdi:image-off"
                        style="font-size: 48px; margin-bottom: 8px; opacity: 0.5;"
                      ></ha-icon>
                      <div>No image source configured</div>
                    </div>
                  </div>
                `}
          </div>
        </div>
      </div>
    `;return g}async handleFileUpload(t,e){var o,i;const n=null===(o=t.target.files)||void 0===o?void 0:o[0];if(n)try{const t=new FormData;t.append("file",n);const o=await fetch("/api/media_source/local/upload",{method:"POST",body:t,headers:{Authorization:`Bearer ${(null===(i=window.hassTokens)||void 0===i?void 0:i.access_token)||""}`}});if(o.ok){const t=(await o.json()).media_content_id||`/media/local/${n.name}`;e({image_url:t,image_type:"upload"})}else{console.error("Upload failed:",o.statusText);const t=new FileReader;t.onload=t=>{var o;const i=null===(o=t.target)||void 0===o?void 0:o.result;e({image_url:i,image_type:"upload"})},t.readAsDataURL(n)}}catch(t){console.error("Error uploading file:",t);const o=new FileReader;o.onload=t=>{var o;const i=null===(o=t.target)||void 0===o?void 0:o.result;e({image_url:i,image_type:"upload"})},o.readAsDataURL(n)}}validate(t){const e=t,o=[...super.validate(t).errors];switch(e.image_type){case"url":e.image_url&&""!==e.image_url.trim()||o.push("Image URL is required when using URL type");break;case"upload":e.image_url&&""!==e.image_url.trim()||o.push("Uploaded image is required when using upload type");break;case"entity":e.image_entity&&""!==e.image_entity.trim()||o.push("Image entity is required when using entity type");break;case"attribute":e.image_entity&&""!==e.image_entity.trim()||o.push("Entity is required when using attribute type"),e.image_attribute&&""!==e.image_attribute.trim()||o.push("Attribute name is required when using attribute type")}return e.link_enabled&&!e.link_url&&o.push("Link URL is required when link is enabled"),e.width&&(e.width<1||e.width>100)&&o.push("Width must be between 1 and 100 percent"),e.height&&(e.height<50||e.height>800)&&o.push("Height must be between 50 and 800 pixels"),{valid:0===o.length,errors:o}}getBackgroundImageCSS(t,e){var o,i;if(!t.background_image_type||"none"===t.background_image_type)return"none";switch(t.background_image_type){case"upload":case"url":if(t.background_image)return`url("${t.background_image}")`;break;case"entity":if(t.background_image_entity&&(null==e?void 0:e.states[t.background_image_entity])){const n=e.states[t.background_image_entity];let a="";if((null===(o=n.attributes)||void 0===o?void 0:o.entity_picture)?a=n.attributes.entity_picture:(null===(i=n.attributes)||void 0===i?void 0:i.image)?a=n.attributes.image:n.state&&"string"==typeof n.state&&(n.state.startsWith("/")||n.state.startsWith("http"))&&(a=n.state),a)return a.startsWith("/local/")||a.startsWith("/media/")||a.startsWith("/"),`url("${a}")`}}return"none"}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${t.replace(/[A-Z]/g,(t=>`-${t.toLowerCase()}`))}: ${e}`)).join("; ")}getStyles(){return"\n      .image-module-preview {\n        max-width: 100%;\n        overflow: hidden;\n        box-sizing: border-box;\n      }\n\n\n\n      .image-module-preview img {\n        max-width: 100%;\n        height: auto;\n        display: block;\n      }\n\n      /* Conditional Fields Grouping CSS */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n      }\n\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      @keyframes slideInFromLeft {\n        from { \n          opacity: 0; \n          transform: translateX(-10px); \n        }\n        to { \n          opacity: 1; \n          transform: translateX(0); \n        }\n      }\n\n      /* Field styling - ensure vertical stacking, no columns */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n        color: var(--primary-text-color) !important;\n        margin-bottom: 4px !important;\n        display: block !important;\n        width: 100% !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        display: block !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n        width: 100% !important;\n      }\n\n      .field-group {\n        display: flex !important;\n        flex-direction: column !important;\n        width: 100% !important;\n        margin-bottom: 16px !important;\n      }\n\n      .field-group ha-form {\n        width: 100% !important;\n        display: block !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      .settings-section {\n        margin-bottom: 16px;\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n    "}addPixelUnit(t){return t?/^\d+$/.test(t)?`${t}px`:/^[\d\s]+$/.test(t)?t.split(" ").map((t=>t.trim()?`${t}px`:t)).join(" "):t:t}}class kt extends ht{constructor(){super(...arguments),this.metadata={type:"info",title:"Info Items",description:"Show entity information values",author:"WJD Designs",version:"1.0.0",icon:"mdi:information",category:"data",tags:["info","entity","data","sensors"]}}createDefault(t){return{id:t||this.generateId("info"),type:"info",info_entities:[{id:this.generateId("entity"),entity:"",name:"Entity Name",icon:"",show_icon:!0,show_name:!0,text_size:14,name_size:12,icon_size:18,text_bold:!1,text_italic:!1,text_uppercase:!1,text_strikethrough:!1,name_bold:!1,name_italic:!1,name_uppercase:!1,name_strikethrough:!1,icon_color:"var(--primary-color)",name_color:"var(--secondary-text-color)",text_color:"var(--primary-text-color)",click_action:"more-info",navigation_path:"",url:"",service:"",service_data:{},template_mode:!1,template:"",dynamic_icon_template_mode:!1,dynamic_icon_template:"",dynamic_color_template_mode:!1,dynamic_color_template:"",icon_position:"left",icon_alignment:"center",content_alignment:"start",overall_alignment:"center",icon_gap:8}],alignment:"left",vertical_alignment:"center",columns:1,gap:12,allow_wrap:!0}}renderGeneralTab(t,e,o,i){var n,a,r;const l=t,s=l.info_entities[0]||this.createDefault().info_entities[0];return V`
      <div class="module-general-settings">
        <!-- Entity Configuration -->
        <div class="settings-section">
          <ha-form
            .hass=${e}
            .data=${{entity:s.entity||""}}
            .schema=${[{name:"entity",label:"Entity",description:"Select the entity to display",selector:{entity:{}}}]}
            .computeLabel=${t=>t.label||t.name}
            .computeDescription=${t=>t.description||""}
            @value-changed=${t=>this._handleEntityChange(l,0,t.detail.value.entity,e,i)}
          ></ha-form>
        </div>

        <!-- Custom Name -->
        <div class="settings-section">
          <ha-form
            .hass=${e}
            .data=${{name:s.name||""}}
            .schema=${[{name:"name",label:"Name",description:"Custom display name for this entity",selector:{text:{}}}]}
            .computeLabel=${t=>t.label||t.name}
            .computeDescription=${t=>t.description||""}
            @value-changed=${t=>this._updateEntity(l,0,{name:t.detail.value.name},i)}
          ></ha-form>
        </div>

        <!-- Show Icon -->
        <div class="settings-section">
          <ha-form
            .hass=${e}
            .data=${{show_icon:!1!==s.show_icon}}
            .schema=${[{name:"show_icon",label:"Show Icon",description:"Display an icon next to the entity value",selector:{boolean:{}}}]}
            .computeLabel=${t=>t.label||t.name}
            .computeDescription=${t=>t.description||""}
            @value-changed=${t=>this._updateEntity(l,0,{show_icon:t.detail.value.show_icon},i)}
          ></ha-form>
        </div>

        <!-- Icon Selection -->
        ${!1!==s.show_icon?V`
              <div class="settings-section">
                <ha-form
                  .hass=${e}
                  .data=${{icon:s.icon||""}}
                  .schema=${[{name:"icon",label:"Icon",description:"Choose an icon to display",selector:{icon:{}}}]}
                  .computeLabel=${t=>t.label||t.name}
                  .computeDescription=${t=>t.description||""}
                  @value-changed=${t=>this._updateEntity(l,0,{icon:t.detail.value.icon},i)}
                ></ha-form>
              </div>
            `:""}

        <!-- Show Name -->
        <div class="settings-section">
          <ha-form
            .hass=${e}
            .data=${{show_name:!1!==s.show_name}}
            .schema=${[{name:"show_name",label:"Show Name",description:"Display the entity name above the value",selector:{boolean:{}}}]}
            .computeLabel=${t=>t.label||t.name}
            .computeDescription=${t=>t.description||""}
            @value-changed=${t=>this._updateEntity(l,0,{show_name:t.detail.value.show_name},i)}
          ></ha-form>
        </div>

        <!-- Click Action -->
        <div class="settings-section">
          <ha-form
            .hass=${e}
            .data=${{click_action:s.click_action||"more-info"}}
            .schema=${[{name:"click_action",label:"Click Action",description:"Action to perform when clicking the entity",selector:{select:{options:[{value:"none",label:"No Action"},{value:"more-info",label:"More Info"},{value:"toggle",label:"Toggle"},{value:"navigate",label:"Navigate"},{value:"url",label:"Open URL"},{value:"service",label:"Call Service"}],mode:"dropdown"}}}]}
            .computeLabel=${t=>t.label||t.name}
            .computeDescription=${t=>t.description||""}
            @value-changed=${t=>this._updateEntity(l,0,{click_action:t.detail.value.click_action},i)}
          ></ha-form>
        </div>

        <!-- Icon Color -->
        ${!1!==s.show_icon?V`
              <div class="settings-section">
                <div
                  class="field-title"
                  style="font-size: 16px !important; font-weight: 600 !important;"
                >
                  Icon Color
                </div>
                <ultra-color-picker
                  .value=${s.icon_color||""}
                  .defaultValue=${"var(--primary-color)"}
                  .hass=${e}
                  @value-changed=${t=>this._updateEntity(l,0,{icon_color:t.detail.value},i)}
                ></ultra-color-picker>
              </div>
            `:""}

        <!-- Entity Color -->
        <div class="settings-section">
          <div class="field-title" style="font-size: 16px !important; font-weight: 600 !important;">
            Entity Color
          </div>
          <ultra-color-picker
            .value=${s.text_color||""}
            .defaultValue=${"var(--primary-text-color)"}
            .hass=${e}
            @value-changed=${t=>this._updateEntity(l,0,{text_color:t.detail.value},i)}
          ></ultra-color-picker>
        </div>

        <!-- Template Mode Section -->
        <div
          class="settings-section template-mode-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            Template Mode
          </div>
          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            Use a template to format the entity value. Templates allow you to use Home Assistant
            templating syntax for complex formatting.
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${e}
              .data=${{template_mode:s.template_mode||!1}}
              .schema=${[{name:"template_mode",label:"Template Mode",description:"Use Home Assistant templating syntax to format the value",selector:{boolean:{}}}]}
              .computeLabel=${t=>t.label||t.name}
              .computeDescription=${t=>t.description||""}
              @value-changed=${t=>this._updateEntity(l,0,{template_mode:t.detail.value.template_mode},i)}
            ></ha-form>
          </div>

          ${s.template_mode?V`
                <div class="field-group" style="margin-bottom: 16px;">
                  <ha-form
                    .hass=${e}
                    .data=${{template:s.template||""}}
                    .schema=${[{name:"template",label:"Value Template",description:"Template to format the entity value using Jinja2 syntax",selector:{text:{multiline:!0}}}]}
                    .computeLabel=${t=>t.label||t.name}
                    .computeDescription=${t=>t.description||""}
                    @value-changed=${t=>this._updateEntity(l,0,{template:t.detail.value.template},i)}
                  ></ha-form>
                </div>

                <div class="template-examples">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    Common Examples:
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      {{ states('sensor.${(null===(n=s.entity)||void 0===n?void 0:n.split(".")[1])||"example"}') }}
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      Basic value
                    </div>
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      {{ states('sensor.${(null===(a=s.entity)||void 0===a?void 0:a.split(".")[1])||"example"}') | float(0) }}
                      km
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      With units
                    </div>
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      {{ states('sensor.${(null===(r=s.entity)||void 0===r?void 0:r.split(".")[1])||"example"}') | float(0) |
                      round(1) }}
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      Round to 1 decimal
                    </div>
                  </div>
                </div>
              `:""}
        </div>

        <!-- Size Settings -->
        <div
          class="settings-section size-settings"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            Size Settings
          </div>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            ${!1!==s.show_icon?V`
                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">Icon Size</div>
                    <div class="field-description">Size of the icon in pixels</div>
                    <div
                      class="gap-control-container"
                      style="display: flex; align-items: center; gap: 12px;"
                    >
                      <input
                        type="range"
                        class="gap-slider"
                        min="12"
                        max="48"
                        step="1"
                        .value="${Number(s.icon_size)||18}"
                        @input=${t=>{const e=t.target,o=Number(e.value);this._updateEntity(l,0,{icon_size:o},i)}}
                      />
                      <input
                        type="number"
                        class="gap-input"
                        min="12"
                        max="48"
                        step="1"
                        .value="${Number(s.icon_size)||18}"
                        @input=${t=>{const e=t.target,o=Number(e.value);isNaN(o)||this._updateEntity(l,0,{icon_size:o},i)}}
                        @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=Number(e.value)||18,n="ArrowUp"===t.key?1:-1,a=Math.max(12,Math.min(48,o+n));this._updateEntity(l,0,{icon_size:a},i)}}}
                      />
                      <button
                        class="reset-btn"
                        @click=${()=>this._updateEntity(l,0,{icon_size:18},i)}
                        title="Reset to default (18)"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                `:""}
            ${!1!==s.show_name?V`
                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">Name Size</div>
                    <div class="field-description">Size of the entity name text in pixels</div>
                    <div
                      class="gap-control-container"
                      style="display: flex; align-items: center; gap: 12px;"
                    >
                      <input
                        type="range"
                        class="gap-slider"
                        min="8"
                        max="32"
                        step="1"
                        .value="${s.name_size||12}"
                        @input=${t=>{const e=t.target,o=Number(e.value);this._updateEntity(l,0,{name_size:o},i)}}
                      />
                      <input
                        type="number"
                        class="gap-input"
                        min="8"
                        max="32"
                        step="1"
                        .value="${s.name_size||12}"
                        @input=${t=>{const e=t.target,o=Number(e.value);isNaN(o)||this._updateEntity(l,0,{name_size:o},i)}}
                        @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=Number(e.value)||12,n="ArrowUp"===t.key?1:-1,a=Math.max(8,Math.min(32,o+n));this._updateEntity(l,0,{name_size:a},i)}}}
                      />
                      <button
                        class="reset-btn"
                        @click=${()=>this._updateEntity(l,0,{name_size:12},i)}
                        title="Reset to default (12)"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                `:""}

            <div class="field-container" style="margin-bottom: 24px;">
              <div class="field-title">Value Size</div>
              <div class="field-description">Size of the entity value text in pixels</div>
              <div
                class="gap-control-container"
                style="display: flex; align-items: center; gap: 12px;"
              >
                <input
                  type="range"
                  class="gap-slider"
                  min="8"
                  max="32"
                  step="1"
                  .value="${s.text_size||14}"
                  @input=${t=>{const e=t.target,o=Number(e.value);this._updateEntity(l,0,{text_size:o},i)}}
                />
                <input
                  type="number"
                  class="gap-input"
                  min="8"
                  max="32"
                  step="1"
                  .value="${s.text_size||14}"
                  @input=${t=>{const e=t.target,o=Number(e.value);isNaN(o)||this._updateEntity(l,0,{text_size:o},i)}}
                  @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=Number(e.value)||14,n="ArrowUp"===t.key?1:-1,a=Math.max(8,Math.min(32,o+n));this._updateEntity(l,0,{text_size:a},i)}}}
                />
                <button
                  class="reset-btn"
                  @click=${()=>this._updateEntity(l,0,{text_size:14},i)}
                  title="Reset to default (14)"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            ${!1!==s.show_icon?V`
                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">Icon Gap</div>
                    <div class="field-description">
                      Space between the icon and content in pixels
                    </div>
                    <div
                      class="gap-control-container"
                      style="display: flex; align-items: center; gap: 12px;"
                    >
                      <input
                        type="range"
                        class="gap-slider"
                        min="0"
                        max="32"
                        step="1"
                        .value="${s.icon_gap||8}"
                        @input=${t=>{const e=t.target,o=Number(e.value);this._updateEntity(l,0,{icon_gap:o},i)}}
                      />
                      <input
                        type="number"
                        class="gap-input"
                        min="0"
                        max="32"
                        step="1"
                        .value="${s.icon_gap||8}"
                        @input=${t=>{const e=t.target,o=Number(e.value);isNaN(o)||this._updateEntity(l,0,{icon_gap:o},i)}}
                        @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=Number(e.value)||8,n="ArrowUp"===t.key?1:-1,a=Math.max(0,Math.min(32,o+n));this._updateEntity(l,0,{icon_gap:a},i)}}}
                      />
                      <button
                        class="reset-btn"
                        @click=${()=>this._updateEntity(l,0,{icon_gap:8},i)}
                        title="Reset to default (8)"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                `:""}
          </div>
        </div>

        <!-- Layout & Positioning Section -->
        <div
          class="settings-section layout-positioning-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            Layout & Positioning
          </div>

          <!-- Icon Position -->
          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
            >
              Icon Position
            </div>
            <div
              class="control-button-group"
              style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; max-width: 240px;"
            >
              ${[{value:"left",icon:"mdi:format-align-left"},{value:"top",icon:"mdi:format-align-top"},{value:"right",icon:"mdi:format-align-right"},{value:"bottom",icon:"mdi:format-align-bottom"}].map((t=>V`
                  <button
                    type="button"
                    class="control-btn ${(s.icon_position||"left")===t.value?"active":""}"
                    @click=${()=>this._updateEntity(l,0,{icon_position:t.value},i)}
                    title="${t.value.charAt(0).toUpperCase()+t.value.slice(1)}"
                  >
                    <ha-icon icon="${t.icon}"></ha-icon>
                  </button>
                `))}
            </div>
          </div>

          <!-- Overall Alignment -->
          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
            >
              Overall Alignment
            </div>
            <div
              class="control-button-group"
              style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-width: 180px;"
            >
              ${[{value:"left",icon:"mdi:format-align-left"},{value:"center",icon:"mdi:format-align-center"},{value:"right",icon:"mdi:format-align-right"}].map((t=>V`
                  <button
                    type="button"
                    class="control-btn ${(s.overall_alignment||"center")===t.value?"active":""}"
                    @click=${()=>this._updateEntity(l,0,{overall_alignment:t.value},i)}
                    title="${t.value.charAt(0).toUpperCase()+t.value.slice(1)}"
                  >
                    <ha-icon icon="${t.icon}"></ha-icon>
                  </button>
                `))}
            </div>
          </div>

          <!-- Icon and Content Alignment Side by Side -->
          <div
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px;"
          >
            <!-- Icon Alignment -->
            <div class="field-group">
              <div
                class="field-title"
                style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
              >
                Icon Alignment
              </div>
              <div
                class="control-button-group"
                style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;"
              >
                ${[{value:"start",icon:"mdi:format-align-left"},{value:"center",icon:"mdi:format-align-center"},{value:"end",icon:"mdi:format-align-right"}].map((t=>V`
                    <button
                      type="button"
                      class="control-btn ${(s.icon_alignment||"center")===t.value?"active":""}"
                      @click=${()=>this._updateEntity(l,0,{icon_alignment:t.value},i)}
                      title="${t.value.charAt(0).toUpperCase()+t.value.slice(1)}"
                    >
                      <ha-icon icon="${t.icon}"></ha-icon>
                    </button>
                  `))}
              </div>
            </div>

            <!-- Content Alignment -->
            <div class="field-group">
              <div
                class="field-title"
                style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
              >
                Content Alignment
              </div>
              <div
                class="control-button-group"
                style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;"
              >
                ${[{value:"start",icon:"mdi:format-align-left"},{value:"center",icon:"mdi:format-align-center"},{value:"end",icon:"mdi:format-align-right"}].map((t=>V`
                    <button
                      type="button"
                      class="control-btn ${(s.content_alignment||"start")===t.value?"active":""}"
                      @click=${()=>this._updateEntity(l,0,{content_alignment:t.value},i)}
                      title="${t.value.charAt(0).toUpperCase()+t.value.slice(1)}"
                    >
                      <ha-icon icon="${t.icon}"></ha-icon>
                    </button>
                  `))}
              </div>
            </div>
          </div>
        </div>
      </div>
    `}renderPreview(t,e){const o=t,i=o,n={padding:i.padding_top||i.padding_bottom||i.padding_left||i.padding_right?`${i.padding_top||"8"}px ${i.padding_right||"0"}px ${i.padding_bottom||"8"}px ${i.padding_left||"0"}px`:"8px 0",margin:i.margin_top||i.margin_bottom||i.margin_left||i.margin_right?`${i.margin_top||"0"}px ${i.margin_right||"0"}px ${i.margin_bottom||"0"}px ${i.margin_left||"0"}px`:"0",background:i.background_color||"transparent",backgroundImage:this.getBackgroundImageCSS(i,e),backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",border:i.border_style&&"none"!==i.border_style?`${i.border_width||"1px"} ${i.border_style} ${i.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(i.border_radius)||"0",position:i.position||"relative",top:i.top||"auto",bottom:i.bottom||"auto",left:i.left||"auto",right:i.right||"auto",zIndex:i.z_index||"auto",width:i.width||"100%",height:i.height||"auto",maxWidth:i.max_width||"100%",maxHeight:i.max_height||"none",minWidth:i.min_width||"none",minHeight:i.min_height||"auto",overflow:i.overflow||"hidden",clipPath:i.clip_path||"none",backdropFilter:i.backdrop_filter||"none",boxShadow:i.box_shadow_h&&i.box_shadow_v?`${i.box_shadow_h||"0"} ${i.box_shadow_v||"0"} ${i.box_shadow_blur||"0"} ${i.box_shadow_spread||"0"} ${i.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"};return V`
      <div class="info-module-container" style=${this.styleObjectToCss(n)}>
        <div class="info-module-preview">
          <div
            class="info-entities"
            style="
            display: grid;
            grid-template-columns: repeat(${o.columns||1}, 1fr);
            gap: ${o.gap||12}px;
            justify-content: ${o.alignment||"left"};
          "
          >
            ${o.info_entities.slice(0,3).map((t=>{var o,i,n;const a=null==e?void 0:e.states[t.entity],r=a?a.state:"N/A",l=t.name||(null===(o=null==a?void 0:a.attributes)||void 0===o?void 0:o.friendly_name)||t.entity,s=t.icon||(null===(i=null==a?void 0:a.attributes)||void 0===i?void 0:i.icon)||"mdi:help-circle",d=t.icon_position||"left",c=t.icon_alignment||"center",p=t.content_alignment||"start",u=t.overall_alignment||"center",m=t.icon_gap||8,g=t.show_icon?V`
                    <ha-icon
                      icon="${s}"
                      class="entity-icon"
                      style="color: ${t.icon_color||"var(--primary-color)"}; font-size: ${Number(t.icon_size)||18}px;"
                    ></ha-icon>
                  `:"",h=V`
                <div
                  class="entity-content"
                  style="
                  align-items: ${"start"===p?"flex-start":"end"===p?"flex-end":"center"};
                  text-align: ${"start"===p?"left":"end"===p?"right":"center"};
                "
                >
                  ${t.show_name?V`
                        <div
                          class="entity-name"
                          style="
                    color: ${t.name_color||"var(--secondary-text-color)"};
                    font-size: ${t.name_size||12}px;
                    font-weight: ${t.name_bold?"bold":"normal"};
                    font-style: ${t.name_italic?"italic":"normal"};
                    text-transform: ${t.name_uppercase?"uppercase":"none"};
                    text-decoration: ${t.name_strikethrough?"line-through":"none"};
                  "
                        >
                          ${l}
                        </div>
                      `:""}

                  <div
                    class="entity-value"
                    style="
                  color: ${t.text_color||"var(--primary-text-color)"};
                  font-size: ${t.text_size||14}px;
                  font-weight: ${t.text_bold?"bold":"normal"};
                  font-style: ${t.text_italic?"italic":"normal"};
                  text-transform: ${t.text_uppercase?"uppercase":"none"};
                  text-decoration: ${t.text_strikethrough?"line-through":"none"};
                "
                  >
                    ${r}${(null===(n=null==a?void 0:a.attributes)||void 0===n?void 0:n.unit_of_measurement)||""}
                  </div>
                </div>
              `;return V`
                <div
                  class="info-entity-item position-${d}"
                  style="
                  display: flex;
                  flex-direction: ${"top"===d||"bottom"===d?"column":"row"};
                  align-items: ${"start"===c?"flex-start":"end"===c?"flex-end":"center"};
                  justify-content: ${"left"===u?"flex-start":"right"===u?"flex-end":"center"};
                  gap: ${m}px;
                  padding: 4px;
                  border-radius: 4px;
                "
                >
                  ${"left"===d||"top"===d?V`${g}${h}`:V`${h}${g}`}
                </div>
              `}))}
            ${o.info_entities.length>3?V`
                  <div class="more-entities">+${o.info_entities.length-3} more</div>
                `:""}
          </div>
        </div>
      </div>
    `}validate(t){const e=t,o=[...super.validate(t).errors];return e.info_entities&&0!==e.info_entities.length||o.push("At least one info entity is required"),e.info_entities.forEach(((t,e)=>{t.entity&&""!==t.entity.trim()||o.push(`Entity ${e+1}: Entity ID is required`)})),{valid:0===o.length,errors:o}}getStyles(){return"\n      .info-module-preview {\n        padding: 8px;\n        min-height: 40px;\n      }\n      \n      .info-entities {\n        width: 100%;\n      }\n      \n      .info-entity-item {\n        min-width: 0;\n        flex: 1;\n      }\n      \n      .entity-content {\n        display: flex;\n        flex-direction: column;\n        gap: 2px;\n        min-width: 0;\n        flex: 1;\n      }\n      \n      .entity-icon {\n        flex-shrink: 0;\n      }\n      \n      .entity-name {\n        font-size: 12px;\n        line-height: 1.2;\n      }\n      \n      .entity-value {\n        font-size: 14px;\n        font-weight: 500;\n        line-height: 1.2;\n      }\n      \n      .more-entities {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        padding: 8px;\n        color: var(--secondary-text-color);\n        font-size: 12px;\n        font-style: italic;\n      }\n      \n      .info-entities-section,\n      .layout-section {\n        margin-top: 16px;\n        padding-top: 16px;\n        border-top: 1px solid var(--divider-color);\n      }\n      \n      .info-entities-section:first-child {\n        margin-top: 0;\n        padding-top: 0;\n        border-top: none;\n      }\n      \n      .info-entities-section h4,\n      .layout-section h4 {\n        margin: 0 0 12px 0;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n      }\n      \n      .entity-item {\n        border: 1px solid var(--divider-color);\n        border-radius: 8px;\n        padding: 12px;\n        margin-bottom: 12px;\n        background: var(--card-background-color);\n      }\n      \n      .entity-header {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        margin-bottom: 12px;\n        font-weight: 500;\n        font-size: 14px;\n      }\n      \n      .remove-entity-btn {\n        background: none;\n        border: none;\n        color: var(--error-color);\n        cursor: pointer;\n        padding: 4px;\n        border-radius: 4px;\n        font-size: 14px;\n      }\n      \n      .remove-entity-btn:disabled {\n        opacity: 0.3;\n        cursor: not-allowed;\n      }\n      \n      .add-entity-btn {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n        width: 100%;\n        padding: 12px;\n        border: 2px dashed var(--primary-color);\n        border-radius: 8px;\n        background: none;\n        color: var(--primary-color);\n        cursor: pointer;\n        font-size: 14px;\n        font-weight: 500;\n      }\n      \n      .add-entity-btn:hover {\n        background: var(--primary-color);\n        color: white;\n      }\n      \n      .entity-display-options {\n        display: grid;\n        grid-template-columns: 1fr 1fr;\n        gap: 8px;\n        margin: 8px 0;\n      }\n      \n      /* Control button styles */\n      .control-btn {\n        padding: 8px 4px;\n        border: 1px solid var(--divider-color);\n        background: var(--card-background-color);\n        color: var(--primary-text-color);\n        border-radius: 4px;\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        user-select: none;\n        font-size: 10px;\n      }\n      \n      .control-btn:hover:not(.active) {\n        border-color: var(--primary-color) !important;\n        background: var(--primary-color) !important;\n        color: white !important;\n        opacity: 0.8;\n      }\n      \n      .control-btn.active {\n        border-color: var(--primary-color);\n        background: var(--primary-color);\n        color: white;\n      }\n      \n      .control-btn ha-icon {\n        font-size: 14px;\n      }\n      \n      .control-button-group {\n        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n        border-radius: 4px;\n        overflow: hidden;\n      }\n      \n      .control-button-group .control-btn:not(:last-child) {\n        border-right: none;\n      }\n      \n      .control-button-group .control-btn:first-child {\n        border-radius: 4px 0 0 4px;\n      }\n      \n      .control-button-group .control-btn:last-child {\n        border-radius: 0 4px 4px 0;\n      }\n      \n      .control-button-group .control-btn:only-child {\n        border-radius: 4px;\n      }\n      \n      /* Position-specific layout styles */\n      .position-left {\n        flex-direction: row;\n      }\n      \n      .position-right {\n        flex-direction: row-reverse;\n      }\n      \n      .position-top {\n        flex-direction: column;\n      }\n      \n      .position-bottom {\n        flex-direction: column-reverse;\n      }\n\n      /* Gap control styles */\n      .gap-control-container {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n\n      .gap-slider {\n        flex: 1;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .gap-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider:hover {\n        background: var(--primary-color);\n        opacity: 0.7;\n      }\n\n      .gap-slider:hover::-webkit-slider-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-slider:hover::-moz-range-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-input {\n        width: 50px !important;\n        max-width: 50px !important;\n        min-width: 50px !important;\n        padding: 4px 6px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n      }\n\n      .gap-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      .reset-btn {\n        width: 36px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n\n      .reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .reset-btn ha-icon {\n        font-size: 16px;\n      }\n    "}_addEntity(t,e){const o={id:this.generateId("entity"),entity:"",name:"Entity Name",icon:"",show_icon:!0,show_name:!0,text_size:14,name_size:12,icon_size:18,text_bold:!1,text_italic:!1,text_uppercase:!1,text_strikethrough:!1,name_bold:!1,name_italic:!1,name_uppercase:!1,name_strikethrough:!1,icon_color:"var(--primary-color)",name_color:"var(--secondary-text-color)",text_color:"var(--primary-text-color)",click_action:"more-info",navigation_path:"",url:"",service:"",service_data:{},template_mode:!1,template:"",dynamic_icon_template_mode:!1,dynamic_icon_template:"",dynamic_color_template_mode:!1,dynamic_color_template:"",icon_position:"left",icon_alignment:"center",content_alignment:"start",overall_alignment:"center",icon_gap:8};e({info_entities:[...t.info_entities,o]})}_removeEntity(t,e,o){if(t.info_entities.length<=1)return;const i=t.info_entities.filter(((t,o)=>o!==e));o({info_entities:i})}_handleEntityChange(t,e,o,i,n){var a,r;const l={entity:o};if(o&&(null==i?void 0:i.states[o])){const n=(null===(a=i.states[o].attributes)||void 0===a?void 0:a.friendly_name)||o.split(".").pop()||"",s=null===(r=t.info_entities)||void 0===r?void 0:r[e];(null==s?void 0:s.name)&&"Entity Name"!==s.name&&s.name!==s.entity||(l.name=n)}this._updateEntity(t,e,l,n)}_updateEntity(t,e,o,i){if(!t.info_entities||0===t.info_entities.length){const e=this.createDefault().info_entities[0];return t.info_entities=[Object.assign(Object.assign({},e),o)],void i({info_entities:t.info_entities})}if(e>=t.info_entities.length){const o=this.createDefault().info_entities[0];for(;t.info_entities.length<=e;)t.info_entities.push(Object.assign({},o))}const n=t.info_entities.map(((t,i)=>i===e?Object.assign(Object.assign({},t),o):t));i({info_entities:n})}getBackgroundImageCSS(t,e){var o,i;if(!t.background_image_type||"none"===t.background_image_type)return"none";switch(t.background_image_type){case"upload":case"url":if(t.background_image)return`url("${t.background_image}")`;break;case"entity":if(t.background_image_entity&&(null==e?void 0:e.states[t.background_image_entity])){const n=e.states[t.background_image_entity];let a="";if((null===(o=n.attributes)||void 0===o?void 0:o.entity_picture)?a=n.attributes.entity_picture:(null===(i=n.attributes)||void 0===i?void 0:i.image)?a=n.attributes.image:n.state&&"string"==typeof n.state&&(n.state.startsWith("/")||n.state.startsWith("http"))&&(a=n.state),a)return a.startsWith("/local/")||a.startsWith("/media/")||a.startsWith("/"),`url("${a}")`}}return"none"}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${t.replace(/[A-Z]/g,(t=>`-${t.toLowerCase()}`))}: ${e}`)).join("; ")}addPixelUnit(t){return t?/^\d+$/.test(t)?`${t}px`:/^[\d\s]+$/.test(t)?t.split(" ").map((t=>t.trim()?`${t}px`:t)).join(" "):t:t}}const Ct=t=>(...e)=>({_$litDirective$:t,values:e});class St{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,o){this._$Ct=t,this._$AM=e,this._$Ci=o}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}const{I:zt}=rt,It=()=>document.createComment(""),Tt=(t,e,o)=>{const i=t._$AA.parentNode,n=void 0===e?t._$AB:e._$AA;if(void 0===o){const e=i.insertBefore(It(),n),a=i.insertBefore(It(),n);o=new zt(e,a,t,t.options)}else{const e=o._$AB.nextSibling,a=o._$AM,r=a!==t;if(r){let e;o._$AQ?.(t),o._$AM=t,void 0!==o._$AP&&(e=t._$AU)!==a._$AU&&o._$AP(e)}if(e!==n||r){let t=o._$AA;for(;t!==e;){const e=t.nextSibling;i.insertBefore(t,n),t=e}}}return o},At=(t,e,o=t)=>(t._$AI(e,o),t),Pt={},Mt=t=>{t._$AP?.(!1,!0);let e=t._$AA;const o=t._$AB.nextSibling;for(;e!==o;){const t=e.nextSibling;e.remove(),e=t}},Lt=(t,e,o)=>{const i=new Map;for(let n=e;n<=o;n++)i.set(t[n],n);return i},Ot=Ct(class extends St{constructor(t){if(super(t),2!==t.type)throw Error("repeat() can only be used in text expressions")}dt(t,e,o){let i;void 0===o?o=e:void 0!==e&&(i=e);const n=[],a=[];let r=0;for(const e of t)n[r]=i?i(e,r):r,a[r]=o(e,r),r++;return{values:a,keys:n}}render(t,e,o){return this.dt(t,e,o).values}update(t,[e,o,i]){const n=(t=>t._$AH)(t),{values:a,keys:r}=this.dt(e,o,i);if(!Array.isArray(n))return this.ut=r,a;const l=this.ut??=[],s=[];let d,c,p=0,u=n.length-1,m=0,g=a.length-1;for(;p<=u&&m<=g;)if(null===n[p])p++;else if(null===n[u])u--;else if(l[p]===r[m])s[m]=At(n[p],a[m]),p++,m++;else if(l[u]===r[g])s[g]=At(n[u],a[g]),u--,g--;else if(l[p]===r[g])s[g]=At(n[p],a[g]),Tt(t,s[g+1],n[p]),p++,g--;else if(l[u]===r[m])s[m]=At(n[u],a[m]),Tt(t,n[p],n[u]),u--,m++;else if(void 0===d&&(d=Lt(r,m,g),c=Lt(l,p,u)),d.has(l[p]))if(d.has(l[u])){const e=c.get(r[m]),o=void 0!==e?n[e]:null;if(null===o){const e=Tt(t,n[p]);At(e,a[m]),s[m]=e}else s[m]=At(o,a[m]),Tt(t,n[p],o),n[e]=null;m++}else Mt(n[u]),u--;else Mt(n[p]),p++;for(;m<=g;){const e=Tt(t,s[g+1]);At(e,a[m]),s[m++]=e}for(;p<=u;){const t=n[p++];null!==t&&Mt(t)}return this.ut=r,((t,e=Pt)=>{t._$AH=e})(t,s),G}});var Dt=function(t,e,o,i){var n,a=arguments.length,r=a<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,o,i);else for(var l=t.length-1;l>=0;l--)(n=t[l])&&(r=(a<3?n(r):a>3?n(e,o,r):n(e,o))||r);return a>3&&r&&Object.defineProperty(e,o,r),r};function Et(t,e,o){const i=Ft(t),n=Ft(e);return i&&n?function(t,e,o){return`#${((1<<24)+(t<<16)+(e<<8)+o).toString(16).slice(1)}`}(Math.round(i.r+(n.r-i.r)*o),Math.round(i.g+(n.g-i.g)*o),Math.round(i.b+(n.b-i.b)*o)):t}function Ft(t){const e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return e?{r:parseInt(e[1],16),g:parseInt(e[2],16),b:parseInt(e[3],16)}:null}let jt=4,Rt=class extends st{constructor(){super(...arguments),this.stops=[{id:"1",position:0,color:"#ff0000"},{id:"2",position:50,color:"#ffff00"},{id:"3",position:100,color:"#00ff00"}],this.barSize="regular",this.barRadius="round",this.barStyle="flat",this._draggedIndex=null,this._colorPickerOpen=!1,this._colorPickerStopId=null,this._colorPickerCurrentColor="#000000"}render(){const t=[...this.stops].sort(((t,e)=>t.position-e.position));return V`
      <!-- Action Buttons -->
      <div class="buttons-row">
        <button class="add-button" @click=${this._addStop}>
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Stop
        </button>
        <button class="reset-button" @click=${this._resetStops}>
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
            />
          </svg>
          Reset
        </button>
      </div>

      <!-- Gradient Stops List -->
      <div class="stops-list ${null!==this._draggedIndex?"drag-active":""}">
        ${Ot(t,(t=>t.id),((e,o)=>this._renderStopItem(e,o,t.length)))}
      </div>

      <!-- Color Picker Popup -->
      ${this._colorPickerOpen?V`
            <div class="color-picker-overlay" @click=${this._closeColorPicker}>
              <div class="color-picker-popup" @click=${t=>t.stopPropagation()}>
                <div class="color-picker-header">
                  <h3>Choose Color</h3>
                  <button class="close-btn" @click=${this._closeColorPicker}>×</button>
                </div>
                <ultra-color-picker
                  .value=${this._colorPickerCurrentColor}
                  .defaultValue=${this._colorPickerCurrentColor}
                  @value-changed=${this._handleColorPickerChange}
                ></ultra-color-picker>
              </div>
            </div>
          `:""}
    `}_renderStopItem(t,e,o){const i=0===t.position||100===t.position,n=this._draggedIndex===e,a=o>2&&!i;return V`
      <div
        class="stop-item ${i?"boundary":""} ${n?"dragging":""}"
        draggable="true"
        @dragstart=${t=>this._handleDragStart(t,e)}
        @dragend=${this._handleDragEnd}
        @dragover=${this._handleDragOver}
        @drop=${t=>this._handleDrop(t,e)}
      >
        <!-- Drag Handle -->
        <div class="drag-handle">
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M9 3h2v2H9V3zm4 0h2v2h-2V3zM9 7h2v2H9V7zm4 0h2v2h-2V7zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2z"
            />
          </svg>
        </div>

        <!-- Color Preview & Picker -->
        <div
          class="color-preview color-circle"
          style="background-color: ${t.color}; cursor: pointer;"
          @click=${()=>this._openColorPicker(t.id,t.color)}
        ></div>

        <!-- Percentage Input -->
        <input
          type="number"
          class="percentage-input"
          .value=${t.position.toString()}
          min="0"
          max="100"
          @input=${e=>this._handlePositionChange(t.id,parseFloat(e.target.value)||0)}
          @blur=${this._validateAndSortStops}
        />

        <!-- Stop Info -->
        <div class="stop-info">
          <span>${t.position}%</span>
        </div>

        <!-- Delete Button -->
        <button
          class="delete-button"
          ?disabled=${!a}
          @click=${()=>this._deleteStop(t.id)}
          title=${a?"Delete stop":"Cannot delete boundary stops"}
        >
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
            />
          </svg>
        </button>
      </div>
    `}_addStop(){const t=function(t){if(!t||t.length<2)return{id:"stop-"+jt++,position:50,color:"#808080"};const e=[...t].sort(((t,e)=>t.position-e.position));let o=0,i=50,n="#808080";for(let t=0;t<e.length-1;t++){const a=e[t+1].position-e[t].position;a>o&&(o=a,i=e[t].position+a/2,n=Et(e[t].color,e[t+1].color,.5))}return{id:"stop-"+jt++,position:Math.round(i),color:n}}(this.stops);this.stops=[...this.stops,t],this._notifyChange()}_resetStops(){this.stops=[{id:"1",position:0,color:"#ff0000"},{id:"2",position:50,color:"#ffff00"},{id:"3",position:100,color:"#00ff00"}],jt=4,this._notifyChange(),this._dispatchResetEvent()}_deleteStop(t){if(this.stops.length<=2)return;const e=this.stops.find((e=>e.id===t));e&&0!==e.position&&100!==e.position&&(this.stops=this.stops.filter((e=>e.id!==t)),this._notifyChange())}_handleColorChange(t,e){this.stops=this.stops.map((o=>o.id===t?Object.assign(Object.assign({},o),{color:e}):o)),this._notifyChange()}_openColorPicker(t,e){this._colorPickerStopId=t,this._colorPickerCurrentColor=e,this._colorPickerOpen=!0}_closeColorPicker(){this._colorPickerOpen=!1,this._colorPickerStopId=null}_handleColorPickerChange(t){this._colorPickerStopId&&(this._handleColorChange(this._colorPickerStopId,t.detail.value),this._colorPickerCurrentColor=t.detail.value)}_handlePositionChange(t,e){e=Math.max(0,Math.min(100,e)),this.stops=this.stops.map((o=>o.id===t?Object.assign(Object.assign({},o),{position:e}):o)),this.requestUpdate()}_validateAndSortStops(){this.stops=this.stops.map((t=>0===t.position||"1"===t.id&&t.position<50?Object.assign(Object.assign({},t),{position:0}):100===t.position||"3"===t.id&&t.position>50?Object.assign(Object.assign({},t),{position:100}):t)),this._notifyChange()}_notifyChange(){this.dispatchEvent(new CustomEvent("gradient-changed",{detail:{stops:this.stops},bubbles:!0,composed:!0}))}_dispatchResetEvent(){this.dispatchEvent(new CustomEvent("gradient-stop-reset",{bubbles:!0,composed:!0}))}_handleDragStart(t,e){this._draggedIndex=e,t.dataTransfer&&(t.dataTransfer.effectAllowed="move",t.dataTransfer.setData("text/html",e.toString()))}_handleDragEnd(){this._draggedIndex=null}_handleDragOver(t){t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect="move")}_handleDrop(t,e){if(t.preventDefault(),null===this._draggedIndex||this._draggedIndex===e)return;const o=[...this.stops].sort(((t,e)=>t.position-e.position)),i=o[this._draggedIndex],n=o[e];this.stops=this.stops.map((t=>t.id===i.id?Object.assign(Object.assign({},t),{position:n.position}):t.id===n.id?Object.assign(Object.assign({},t),{position:i.position}):t)),this._draggedIndex=null,this._notifyChange()}};Rt.styles=a`
    :host {
      display: block;
      width: 100%;
      font-family: var(--mdc-typography-body1-font-family, Roboto, sans-serif);
    }

    .gradient-preview {
      width: 100%;
      height: 16px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      margin-bottom: 16px;
      position: relative;
      overflow: hidden;
      background-color: var(--card-background-color, #1c1c1c);
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .gradient-preview-fill {
      width: 100%;
      height: 100%;
      border-radius: inherit;
      position: relative;
    }

    /* Bar size variants to match actual card bars */
    .gradient-preview.bar-size-thin {
      height: 8px;
      border-radius: 4px;
    }

    .gradient-preview.bar-size-regular {
      height: 16px;
      border-radius: 8px;
    }

    .gradient-preview.bar-size-thick {
      height: 24px;
      border-radius: 12px;
    }

    .gradient-preview.bar-size-thiccc {
      height: 32px;
      border-radius: 16px;
    }

    /* Bar radius variants to match actual card bars */
    .gradient-preview.bar-radius-square {
      border-radius: 0;
    }

    .gradient-preview.bar-radius-round {
      /* Uses default border-radius from size classes */
    }

    .gradient-preview.bar-radius-rounded-square.bar-size-thin {
      border-radius: 2px;
    }

    .gradient-preview.bar-radius-rounded-square.bar-size-regular {
      border-radius: 4px;
    }

    .gradient-preview.bar-radius-rounded-square.bar-size-thick {
      border-radius: 6px;
    }

    .gradient-preview.bar-radius-rounded-square.bar-size-thiccc {
      border-radius: 8px;
    }

    .buttons-row {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }

    .add-button,
    .reset-button {
      flex: 1;
      padding: 12px 16px;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .add-button {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .add-button:hover {
      background: var(--primary-color);
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .reset-button {
      background: var(--secondary-color, #666);
      color: white;
    }

    .reset-button:hover {
      background: var(--secondary-color, #666);
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .stops-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stop-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .stop-item:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .stop-item.dragging {
      opacity: 0.7;
      transform: scale(1.02);
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .drag-handle {
      width: 20px;
      height: 20px;
      cursor: grab;
      color: var(--secondary-text-color);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .drag-handle:hover {
      color: var(--primary-text-color);
    }

    .drag-handle:active {
      cursor: grabbing;
    }

    .color-preview {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid var(--divider-color);
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .color-preview:hover {
      border-color: var(--primary-color);
      transform: scale(1.1);
    }

    .percentage-input {
      width: 80px;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      text-align: center;
      font-weight: 500;
    }

    .percentage-input:focus {
      border-color: var(--primary-color);
      outline: none;
      box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
    }

    .stop-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--secondary-text-color);
      font-size: 14px;
    }

    .delete-button {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--secondary-text-color);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .delete-button:hover {
      background: rgba(var(--rgb-error-color, 244, 67, 54), 0.1);
      color: var(--error-color, #f44336);
    }

    .delete-button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .stop-item.boundary .delete-button {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .icon {
      width: 18px;
      height: 18px;
    }

    /* Drag and drop styling */
    .stops-list.drag-active .stop-item:not(.dragging) {
      transition: transform 0.2s ease;
    }

    /* Color Circle Styling */
    .color-circle {
      border: 3px solid var(--divider-color);
      transition: all 0.2s ease;
    }

    .color-circle:hover {
      border-color: var(--primary-color);
      transform: scale(1.15);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    /* Color Picker Popup */
    .color-picker-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(2px);
    }

    .color-picker-popup {
      background: var(--card-background-color);
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--divider-color);
    }

    .color-picker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--divider-color);
    }

    .color-picker-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--secondary-text-color);
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: var(--divider-color);
      color: var(--primary-text-color);
    }
  `,Dt([mt({type:Array})],Rt.prototype,"stops",void 0),Dt([mt({type:String})],Rt.prototype,"barSize",void 0),Dt([mt({type:String})],Rt.prototype,"barRadius",void 0),Dt([mt({type:String})],Rt.prototype,"barStyle",void 0),Dt([gt()],Rt.prototype,"_draggedIndex",void 0),Dt([gt()],Rt.prototype,"_colorPickerOpen",void 0),Dt([gt()],Rt.prototype,"_colorPickerStopId",void 0),Dt([gt()],Rt.prototype,"_colorPickerCurrentColor",void 0),Rt=Dt([ct("uc-gradient-editor")],Rt);class Ut extends ht{constructor(){super(...arguments),this.metadata={type:"bar",title:"Bars",description:"Progress bars for values",author:"WJD Designs",version:"1.0.0",icon:"mdi:chart-bar",category:"data",tags:["bar","progress","chart","value","sensor"]}}createDefault(t){return{id:t||this.generateId("bar"),type:"bar",entity:"",percentage_type:"entity",percentage_entity:"",percentage_attribute_entity:"",percentage_attribute_name:"",percentage_current_entity:"",percentage_total_entity:"",percentage_template:"",bar_size:"medium",bar_radius:"round",bar_style:"flat",bar_width:100,bar_alignment:"center",border_radius:10,label_alignment:"space-between",show_percentage:!0,percentage_text_size:14,show_value:!0,value_position:"inside",left_title:"",left_entity:"",left_condition_type:"none",left_condition_entity:"",left_condition_state:"",left_template_mode:!1,left_template:"",left_title_size:14,left_value_size:14,left_title_color:"",left_value_color:"",left_enabled:!1,right_title:"",right_entity:"",right_enabled:!1,right_condition_type:"none",right_condition_entity:"",right_condition_state:"",right_template_mode:!1,right_template:"",right_title_size:14,right_value_size:14,right_title_color:"",right_value_color:"",bar_color:"",bar_background_color:"transparent",bar_border_color:"",percentage_text_color:"",use_gradient:!1,gradient_display_mode:"full",gradient_stops:[{id:"1",position:0,color:"#ff0000"},{id:"2",position:50,color:"#ffff00"},{id:"3",position:100,color:"#00ff00"}],limit_entity:"",limit_color:"",animation:!0,template_mode:!1,template:""}}renderGeneralTab(t,e,o,i){const n=t;return V`
      ${bt.injectCleanFormStyles()}
      <div class="module-general-settings">
        <!-- Bar Settings (consolidated) -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Bar Settings
          </div>

          <!-- Percentage Calculation -->
          <div style="margin-top: 24px;">
            ${bt.renderField("Percentage Calculation","Configure how the bar's percentage fill level is calculated using one of the options below.",e,{percentage_type:n.percentage_type||"entity"},[bt.createSchemaItem("percentage_type",{select:{options:[{value:"entity",label:"Entity (0-100)"},{value:"attribute",label:"Entity Attribute"},{value:"difference",label:"Difference"},{value:"template",label:"Template"}],mode:"dropdown"}})],(t=>i({percentage_type:t.detail.value.percentage_type})))}
          </div>

          <!-- Entity Attribute Fields -->
          ${"attribute"===n.percentage_type?this.renderConditionalFieldsGroup("Entity Attribute Configuration",V`
                  ${bt.renderField("Attribute Entity","Select the entity that contains the attribute with the percentage value.",e,{percentage_attribute_entity:n.percentage_attribute_entity||""},[bt.createSchemaItem("percentage_attribute_entity",{entity:{}})],(t=>i({percentage_attribute_entity:t.detail.value.percentage_attribute_entity})))}

                  <div style="margin-top: 16px;">
                    ${bt.renderField("Attribute Name",'Enter the name of the attribute that contains the percentage value (e.g., "battery_level").',e,{percentage_attribute_name:n.percentage_attribute_name||""},[bt.createSchemaItem("percentage_attribute_name",{text:{}})],(t=>i({percentage_attribute_name:t.detail.value.percentage_attribute_name})))}
                  </div>
                `):""}

          <!-- Difference Fields -->
          ${"difference"===n.percentage_type?this.renderConditionalFieldsGroup("Difference Calculation Configuration",V`
                  ${bt.renderField("Current Value Entity","Entity representing the current/used amount (e.g., fuel used, battery consumed).",e,{percentage_current_entity:n.percentage_current_entity||""},[bt.createSchemaItem("percentage_current_entity",{entity:{}})],(t=>i({percentage_current_entity:t.detail.value.percentage_current_entity})))}

                  <div style="margin-top: 16px;">
                    ${bt.renderField("Total Value Entity","Entity representing the total/maximum amount (e.g., fuel capacity, battery capacity).",e,{percentage_total_entity:n.percentage_total_entity||""},[bt.createSchemaItem("percentage_total_entity",{entity:{}})],(t=>i({percentage_total_entity:t.detail.value.percentage_total_entity})))}
                  </div>
                `):""}

          <!-- Template Field -->
          ${"template"===n.percentage_type?this.renderConditionalFieldsGroup("Template Configuration",V`
                  ${bt.renderField("Percentage Template","Enter a Jinja2 template that returns a number between 0-100 for the percentage. Example: {{ (states('sensor.battery_level') | float) * 100 }}",e,{percentage_template:n.percentage_template||""},[bt.createSchemaItem("percentage_template",{text:{multiline:!0,type:"text"}})],(t=>i({percentage_template:t.detail.value.percentage_template})))}
                `):""}

          <!-- Bar Percentage Entity -->
          <div style="margin-top: 24px;">
            ${bt.renderField("Bar Percentage Entity","Select the entity that provides the percentage value for the bar.",e,{entity:n.entity||""},[bt.createSchemaItem("entity",{entity:{}})],(t=>i({entity:t.detail.value.entity})))}
          </div>

          <!-- Limit Value Entity -->
          <div style="margin-top: 24px;">
            ${bt.renderField("Limit Value Entity (optional)","Optional: Add a vertical indicator line on the bar (e.g. charge limit for EV battery).",e,{limit_entity:n.limit_entity||""},[bt.createSchemaItem("limit_entity",{entity:{}})],(t=>i({limit_entity:t.detail.value.limit_entity})))}
          </div>
        </div>

        <!-- Bar Appearance Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Bar Appearance
          </div>

          <!-- Bar Size -->
          <div class="field-container" style="margin-bottom: 24px;">
            <div class="field-title">Bar Size</div>
            <div class="field-description">Adjust the thickness of the progress bar.</div>
            <style>
              .number-range-control {
                display: flex;
                gap: 8px;
                align-items: center;
              }
              .range-slider {
                flex: 0 0 15%;
              }
            </style>
            <div class="number-range-control">
              <input
                type="range"
                class="range-slider"
                min="8"
                max="60"
                step="2"
                .value="${n.height||20}"
                @input=${t=>{const e=t.target,o=parseInt(e.value);i({height:o})}}
              />
              <input
                type="number"
                class="range-input"
                min="8"
                max="60"
                step="2"
                .value="${n.height||20}"
                @input=${t=>{const e=t.target,o=parseInt(e.value);isNaN(o)||i({height:o})}}
                @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=parseInt(e.value)||20,n="ArrowUp"===t.key?2:-2,a=Math.max(8,Math.min(60,o+n));i({height:a})}}}
              />
              <button
                class="range-reset-btn"
                @click=${()=>i({height:20})}
                title="Reset to default (20)"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>

          <!-- Border Radius -->
          <div class="field-container" style="margin-bottom: 24px;">
            <div class="field-title">Border Radius</div>
            <div class="field-description">Control the rounded corners of the bar.</div>
            <div class="number-range-control">
              <input
                type="range"
                class="range-slider"
                min="0"
                max="50"
                step="1"
                .value="${n.border_radius||10}"
                @input=${t=>{const e=t.target,o=parseInt(e.value);i({border_radius:o})}}
              />
              <input
                type="number"
                class="range-input"
                min="0"
                max="50"
                step="1"
                .value="${n.border_radius||10}"
                @input=${t=>{const e=t.target,o=parseInt(e.value);isNaN(o)||i({border_radius:o})}}
                @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=parseInt(e.value)||10,n="ArrowUp"===t.key?1:-1,a=Math.max(0,Math.min(50,o+n));i({border_radius:a})}}}
              />
              <button
                class="range-reset-btn"
                @click=${()=>i({border_radius:10})}
                title="Reset to default (10)"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>

          <!-- Bar Style -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${bt.renderField("Bar Style","Choose the visual style of the progress bar.",e,{bar_style:n.bar_style||"flat"},[bt.createSchemaItem("bar_style",{select:{options:[{value:"flat",label:"Flat"},{value:"raised",label:"Raised"},{value:"inset",label:"Inset"}],mode:"dropdown"}})],(t=>i({bar_style:t.detail.value.bar_style})))}
          </div>

          <!-- Bar Width -->
          <div class="field-container" style="margin-bottom: 24px;">
            <div class="field-title">Bar Width</div>
            <div class="field-description">
              Set the width of the bar as a percentage of the container.
            </div>
            <div class="number-range-control">
              <input
                type="range"
                class="range-slider"
                min="10"
                max="100"
                step="5"
                .value="${n.bar_width||100}"
                @input=${t=>{const e=t.target,o=parseInt(e.value);i({bar_width:o})}}
              />
              <input
                type="number"
                class="range-input"
                min="10"
                max="100"
                step="5"
                .value="${n.bar_width||100}"
                @input=${t=>{const e=t.target,o=parseInt(e.value);isNaN(o)||i({bar_width:o})}}
                @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=parseInt(e.value)||100,n="ArrowUp"===t.key?5:-5,a=Math.max(10,Math.min(100,o+n));i({bar_width:a})}}}
              />
              <button
                class="range-reset-btn"
                @click=${()=>i({bar_width:100})}
                title="Reset to default (100)"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>

          <!-- Bar Alignment with Icons -->
          ${(n.bar_width||100)<100?V`
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Bar Alignment
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                  >
                    Choose how to align the bar when it's less than 100% width.
                  </div>
                  <div
                    style="display: flex; gap: 8px; justify-content: flex-start; flex-wrap: wrap;"
                  >
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${"left"===(n.bar_alignment||"center")?"var(--primary-color)":"var(--divider-color)"}; background: ${"left"===(n.bar_alignment||"center")?"var(--primary-color)":"transparent"}; color: ${"left"===(n.bar_alignment||"center")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                      @click=${()=>i({bar_alignment:"left"})}
                    >
                      <ha-icon
                        icon="mdi:format-align-left"
                        style="font-size: 16px; flex-shrink: 0;"
                      ></ha-icon>
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                        >Left</span
                      >
                    </button>
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${"center"===(n.bar_alignment||"center")?"var(--primary-color)":"var(--divider-color)"}; background: ${"center"===(n.bar_alignment||"center")?"var(--primary-color)":"transparent"}; color: ${"center"===(n.bar_alignment||"center")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                      @click=${()=>i({bar_alignment:"center"})}
                    >
                      <ha-icon
                        icon="mdi:format-align-center"
                        style="font-size: 16px; flex-shrink: 0;"
                      ></ha-icon>
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                        >Center</span
                      >
                    </button>
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${"right"===(n.bar_alignment||"center")?"var(--primary-color)":"var(--divider-color)"}; background: ${"right"===(n.bar_alignment||"center")?"var(--primary-color)":"transparent"}; color: ${"right"===(n.bar_alignment||"center")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                      @click=${()=>i({bar_alignment:"right"})}
                    >
                      <ha-icon
                        icon="mdi:format-align-right"
                        style="font-size: 16px; flex-shrink: 0;"
                      ></ha-icon>
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                        >Right</span
                      >
                    </button>
                  </div>
                </div>
              `:""}

          <!-- Label Alignment -->
          <div class="field-group">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important;"
            >
              Label Alignment
            </div>
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
            >
              Control how the left and right side labels are positioned.
            </div>
            <ha-form
              .hass=${e}
              .data=${{label_alignment:n.label_alignment||"space-between"}}
              .schema=${[{name:"label_alignment",selector:{select:{options:[{value:"left",label:"Left"},{value:"center",label:"Center"},{value:"right",label:"Right"},{value:"space-between",label:"Space Between"}],mode:"dropdown"}},label:""}]}
              @value-changed=${t=>i({label_alignment:t.detail.value.label_alignment})}
            ></ha-form>
          </div>
        </div>

        <!-- Percentage Text Display Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Percentage Text Display
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 16px;"
          >
            Control the visibility and appearance of percentage values shown directly on the bar.
            These numbers provide a clear visual indicator of the current level.
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important;"
            >
              Show Percentage
            </div>
            <ha-form
              .hass=${e}
              .data=${{show_percentage:!1!==n.show_percentage}}
              .schema=${[{name:"show_percentage",selector:{boolean:{}},label:""}]}
              @value-changed=${t=>i({show_percentage:t.detail.value.show_percentage})}
            ></ha-form>
          </div>

          ${!1!==n.show_percentage?V`
                <div class="field-container" style="margin-bottom: 24px;">
                  <div class="field-title">Text Size</div>
                  <div class="field-description">
                    Adjust the size of the percentage text displayed on the bar.
                  </div>
                  <div class="number-range-control">
                    <input
                      type="range"
                      class="range-slider"
                      min="8"
                      max="32"
                      step="1"
                      .value="${n.percentage_text_size||14}"
                      @input=${t=>{const e=t.target,o=parseInt(e.value);i({percentage_text_size:o})}}
                    />
                    <input
                      type="number"
                      class="range-input"
                      min="8"
                      max="32"
                      step="1"
                      .value="${n.percentage_text_size||14}"
                      @input=${t=>{const e=t.target,o=parseInt(e.value);isNaN(o)||i({percentage_text_size:o})}}
                      @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=parseInt(e.value)||14,n="ArrowUp"===t.key?1:-1,a=Math.max(8,Math.min(32,o+n));i({percentage_text_size:a})}}}
                    />
                    <button
                      class="range-reset-btn"
                      @click=${()=>i({percentage_text_size:14})}
                      title="Reset to default (14)"
                    >
                      <ha-icon icon="mdi:refresh"></ha-icon>
                    </button>
                  </div>
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
              Left Side
            </div>
            <ha-form
              .hass=${e}
              .data=${{enable_left:n.left_enabled||!1}}
              .schema=${[{name:"enable_left",selector:{boolean:{}},label:""}]}
              @value-changed=${t=>{t.detail.value.enable_left?i({left_enabled:!0,left_title:n.left_title||"Fuel",left_entity:n.left_entity||"",left_template_mode:n.left_template_mode||!1,left_title_size:n.left_title_size||14,left_value_size:n.left_value_size||14,left_title_color:n.left_title_color||"var(--primary-text-color)",left_value_color:n.left_value_color||"var(--primary-text-color)"}):i({left_enabled:!1,left_title:"",left_entity:"",left_template_mode:!1,left_template:""})}}
            ></ha-form>
          </div>

          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            Configure the title and entity value displayed on the left side of the bar. This is
            useful for showing labels like 'Range' or 'Battery' along with their values.
          </div>

          ${n.left_enabled?V`
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Left Title
                  </div>
                  <ha-form
                    .hass=${e}
                    .data=${{left_title:n.left_title||""}}
                    .schema=${[{name:"left_title",selector:{text:{}},label:""}]}
                    @value-changed=${t=>i({left_title:t.detail.value.left_title})}
                  ></ha-form>
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Left Entity
                  </div>
                  <ha-form
                    .hass=${e}
                    .data=${{left_entity:n.left_entity||""}}
                    .schema=${[{name:"left_entity",selector:{entity:{}},label:""}]}
                    @value-changed=${t=>i({left_entity:t.detail.value.left_entity})}
                  ></ha-form>
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Template Mode
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                  >
                    Use a template to format the displayed text, convert units, or display
                    calculated values.
                  </div>
                  <ha-form
                    .hass=${e}
                    .data=${{left_template_mode:n.left_template_mode||!1}}
                    .schema=${[{name:"left_template_mode",selector:{boolean:{}},label:""}]}
                    @value-changed=${t=>i({left_template_mode:t.detail.value.left_template_mode})}
                  ></ha-form>
                </div>

                <div class="field-container" style="margin-bottom: 24px;">
                  <div class="field-title">Title Size</div>
                  <div class="number-range-control">
                    <input
                      type="range"
                      class="range-slider"
                      min="8"
                      max="32"
                      step="1"
                      .value="${n.left_title_size||14}"
                      @input=${t=>{const e=t.target,o=parseInt(e.value);i({left_title_size:o})}}
                    />
                    <input
                      type="number"
                      class="range-input"
                      min="8"
                      max="32"
                      step="1"
                      .value="${n.left_title_size||14}"
                      @input=${t=>{const e=t.target,o=parseInt(e.value);isNaN(o)||i({left_title_size:o})}}
                      @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=parseInt(e.value)||14,n="ArrowUp"===t.key?1:-1,a=Math.max(8,Math.min(32,o+n));i({left_title_size:a})}}}
                    />
                    <button
                      class="range-reset-btn"
                      @click=${()=>i({left_title_size:14})}
                      title="Reset to default (14)"
                    >
                      <ha-icon icon="mdi:refresh"></ha-icon>
                    </button>
                  </div>
                </div>

                <div class="field-container" style="margin-bottom: 24px;">
                  <div class="field-title">Value Size</div>
                  <div class="number-range-control">
                    <input
                      type="range"
                      class="range-slider"
                      min="8"
                      max="32"
                      step="1"
                      .value="${n.left_value_size||14}"
                      @input=${t=>{const e=t.target,o=parseInt(e.value);i({left_value_size:o})}}
                    />
                    <input
                      type="number"
                      class="range-input"
                      min="8"
                      max="32"
                      step="1"
                      .value="${n.left_value_size||14}"
                      @input=${t=>{const e=t.target,o=parseInt(e.value);isNaN(o)||i({left_value_size:o})}}
                      @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=parseInt(e.value)||14,n="ArrowUp"===t.key?1:-1,a=Math.max(8,Math.min(32,o+n));i({left_value_size:a})}}}
                    />
                    <button
                      class="range-reset-btn"
                      @click=${()=>i({left_value_size:14})}
                      title="Reset to default (14)"
                    >
                      <ha-icon icon="mdi:refresh"></ha-icon>
                    </button>
                  </div>
                </div>
              `:V`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  Enable the toggle above to configure left side settings
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
              Right Side
            </div>
            <ha-form
              .hass=${e}
              .data=${{enable_right:n.right_enabled||!1}}
              .schema=${[{name:"enable_right",selector:{boolean:{}},label:""}]}
              @value-changed=${t=>{t.detail.value.enable_right?i({right_enabled:!0,right_title:n.right_title||"Range",right_entity:n.right_entity||"",right_template_mode:n.right_template_mode||!1,right_title_size:n.right_title_size||14,right_value_size:n.right_value_size||14,right_title_color:n.right_title_color||"var(--primary-text-color)",right_value_color:n.right_value_color||"var(--primary-text-color)"}):i({right_enabled:!1,right_title:"",right_entity:"",right_template_mode:!1,right_template:""})}}
            ></ha-form>
          </div>

          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            Configure the title and entity value displayed on the right side of the bar. This is
            ideal for complementary information like 'Time to Full' or secondary measurements.
          </div>

          ${n.right_enabled?V`
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Right Title
                  </div>
                  <ha-form
                    .hass=${e}
                    .data=${{right_title:n.right_title||""}}
                    .schema=${[{name:"right_title",selector:{text:{}},label:""}]}
                    @value-changed=${t=>i({right_title:t.detail.value.right_title})}
                  ></ha-form>
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Right Entity
                  </div>
                  <ha-form
                    .hass=${e}
                    .data=${{right_entity:n.right_entity||""}}
                    .schema=${[{name:"right_entity",selector:{entity:{}},label:""}]}
                    @value-changed=${t=>i({right_entity:t.detail.value.right_entity})}
                  ></ha-form>
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Template Mode
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                  >
                    Use a template to format the displayed text, convert units, or display
                    calculated values.
                  </div>
                  <ha-form
                    .hass=${e}
                    .data=${{right_template_mode:n.right_template_mode||!1}}
                    .schema=${[{name:"right_template_mode",selector:{boolean:{}},label:""}]}
                    @value-changed=${t=>i({right_template_mode:t.detail.value.right_template_mode})}
                  ></ha-form>
                </div>

                <div class="field-container" style="margin-bottom: 24px;">
                  <div class="field-title">Title Size</div>
                  <div class="number-range-control">
                    <input
                      type="range"
                      class="range-slider"
                      min="8"
                      max="32"
                      step="1"
                      .value="${n.right_title_size||14}"
                      @input=${t=>{const e=t.target,o=parseInt(e.value);i({right_title_size:o})}}
                    />
                    <input
                      type="number"
                      class="range-input"
                      min="8"
                      max="32"
                      step="1"
                      .value="${n.right_title_size||14}"
                      @input=${t=>{const e=t.target,o=parseInt(e.value);isNaN(o)||i({right_title_size:o})}}
                      @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=parseInt(e.value)||14,n="ArrowUp"===t.key?1:-1,a=Math.max(8,Math.min(32,o+n));i({right_title_size:a})}}}
                    />
                    <button
                      class="range-reset-btn"
                      @click=${()=>i({right_title_size:14})}
                      title="Reset to default (14)"
                    >
                      <ha-icon icon="mdi:refresh"></ha-icon>
                    </button>
                  </div>
                </div>

                <div class="field-container" style="margin-bottom: 24px;">
                  <div class="field-title">Value Size</div>
                  <div class="number-range-control">
                    <input
                      type="range"
                      class="range-slider"
                      min="8"
                      max="32"
                      step="1"
                      .value="${n.right_value_size||14}"
                      @input=${t=>{const e=t.target,o=parseInt(e.value);i({right_value_size:o})}}
                    />
                    <input
                      type="number"
                      class="range-input"
                      min="8"
                      max="32"
                      step="1"
                      .value="${n.right_value_size||14}"
                      @input=${t=>{const e=t.target,o=parseInt(e.value);isNaN(o)||i({right_value_size:o})}}
                      @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=parseInt(e.value)||14,n="ArrowUp"===t.key?1:-1,a=Math.max(8,Math.min(32,o+n));i({right_value_size:a})}}}
                    />
                    <button
                      class="range-reset-btn"
                      @click=${()=>i({right_value_size:14})}
                      title="Reset to default (14)"
                    >
                      <ha-icon icon="mdi:refresh"></ha-icon>
                    </button>
                  </div>
                </div>
              `:V`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  Enable the toggle above to configure right side settings
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
            Colors
          </div>

          <!-- Bar Colors -->
          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
            >
              Bar Colors
            </div>
            <div
              class="colors-grid"
              style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;"
            >
              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  Bar Color
                </div>
                <ultra-color-picker
                  .value=${n.bar_color||""}
                  .defaultValue=${"var(--primary-color)"}
                  .hass=${e}
                  @value-changed=${t=>i({bar_color:t.detail.value})}
                ></ultra-color-picker>
              </div>

              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  Background Color
                </div>
                <ultra-color-picker
                  .value=${n.bar_background_color||""}
                  .defaultValue=${"var(--secondary-background-color)"}
                  .hass=${e}
                  @value-changed=${t=>i({bar_background_color:t.detail.value})}
                ></ultra-color-picker>
              </div>

              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  Border Color
                </div>
                <ultra-color-picker
                  .value=${n.bar_border_color||""}
                  .defaultValue=${"var(--divider-color)"}
                  .hass=${e}
                  @value-changed=${t=>i({bar_border_color:t.detail.value})}
                ></ultra-color-picker>
              </div>

              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  Limit Indicator
                </div>
                <ultra-color-picker
                  .value=${n.limit_color||""}
                  .defaultValue=${"var(--warning-color)"}
                  .hass=${e}
                  @value-changed=${t=>i({limit_color:t.detail.value})}
                ></ultra-color-picker>
              </div>

              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  Percentage Text
                </div>
                <ultra-color-picker
                  .value=${n.percentage_text_color||""}
                  .defaultValue=${"var(--primary-text-color)"}
                  .hass=${e}
                  @value-changed=${t=>i({percentage_text_color:t.detail.value})}
                ></ultra-color-picker>
              </div>
            </div>
          </div>

          <!-- Left Side Colors -->
          ${n.left_enabled?V`
                <div class="field-group" style="margin-bottom: 24px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    Left Side Colors
                  </div>
                  <div
                    class="colors-grid"
                    style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;"
                  >
                    <div class="color-item">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                      >
                        Title Color
                      </div>
                      <ultra-color-picker
                        .value=${n.left_title_color||""}
                        .defaultValue=${"var(--primary-text-color)"}
                        .hass=${e}
                        @value-changed=${t=>i({left_title_color:t.detail.value})}
                      ></ultra-color-picker>
                    </div>

                    <div class="color-item">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                      >
                        Value Color
                      </div>
                      <ultra-color-picker
                        .value=${n.left_value_color||""}
                        .defaultValue=${"var(--primary-text-color)"}
                        .hass=${e}
                        @value-changed=${t=>i({left_value_color:t.detail.value})}
                      ></ultra-color-picker>
                    </div>
                  </div>
                </div>
              `:""}

          <!-- Right Side Colors -->
          ${n.right_enabled?V`
                <div class="field-group">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    Right Side Colors
                  </div>
                  <div
                    class="colors-grid"
                    style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;"
                  >
                    <div class="color-item">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                      >
                        Title Color
                      </div>
                      <ultra-color-picker
                        .value=${n.right_title_color||""}
                        .defaultValue=${"var(--primary-text-color)"}
                        .hass=${e}
                        @value-changed=${t=>i({right_title_color:t.detail.value})}
                      ></ultra-color-picker>
                    </div>

                    <div class="color-item">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                      >
                        Value Color
                      </div>
                      <ultra-color-picker
                        .value=${n.right_value_color||""}
                        .defaultValue=${"var(--primary-text-color)"}
                        .hass=${e}
                        @value-changed=${t=>i({right_value_color:t.detail.value})}
                      ></ultra-color-picker>
                    </div>
                  </div>
                </div>
              `:""}
        </div>

        <!-- Gradient Mode -->
        <div class="settings-section" style="margin-bottom: 0;">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Gradient Mode
          </div>
          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important;"
          >
            Create beautiful color transitions across your progress bars. Ideal for showing battery
            levels, fuel gauges, or any status indicator requiring visual emphasis.
          </div>

          <div class="field-title" style="font-size: 16px !important; font-weight: 600 !important;">
            Use Gradient
          </div>
          <ha-form
            .hass=${e}
            .data=${{use_gradient:n.use_gradient||!1}}
            .schema=${[{name:"use_gradient",selector:{boolean:{}},label:""}]}
            @value-changed=${t=>{const e=t.detail.value.use_gradient,o={use_gradient:e};!e||n.gradient_stops&&0!==n.gradient_stops.length||(o.gradient_stops=[{id:"1",position:0,color:"#ff0000"},{id:"2",position:50,color:"#ffff00"},{id:"3",position:100,color:"#00ff00"}],o.gradient_display_mode=n.gradient_display_mode||"full"),i(o)}}
          ></ha-form>

          ${n.use_gradient?V`
                <div
                  class="field-title"
                  style="font-size: 16px !important; font-weight: 600 !important;"
                >
                  Gradient Display Mode
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                >
                  • Full: Shows complete gradient on the bar fill<br />
                  • Cropped: Shows gradient only up to the current fill level<br />
                  • Value-Based: Shows solid color matching the current value position
                </div>
                <ha-form
                  .hass=${e}
                  .data=${{gradient_display_mode:n.gradient_display_mode||"full"}}
                  .schema=${[{name:"gradient_display_mode",selector:{select:{options:[{value:"full",label:"Full"},{value:"cropped",label:"Cropped"},{value:"value-based",label:"Value-Based"}],mode:"dropdown"}},label:""}]}
                  @value-changed=${t=>i({gradient_display_mode:t.detail.value.gradient_display_mode})}
                ></ha-form>

                <div
                  class="field-title"
                  style="font-size: 16px !important; font-weight: 600 !important;"
                >
                  Gradient Editor
                </div>
                <uc-gradient-editor
                  .stops=${n.gradient_stops||[{id:"1",position:0,color:"#ff0000"},{id:"2",position:50,color:"#ffff00"},{id:"3",position:100,color:"#00ff00"}]}
                  .barSize=${this.getBarSizeFromHeight(n.height||20)}
                  .barRadius=${this.getBarRadiusFromStyle(n.border_radius||10)}
                  .barStyle=${n.bar_style||"flat"}
                  @gradient-changed=${t=>{i({gradient_stops:t.detail.stops})}}
                ></uc-gradient-editor>
              `:""}
        </div>
      </div>
    `}renderPreview(t,e){var o,i,n,a,r,l,s,d;const c=t,p=null==e?void 0:e.states[c.entity];let u=0,m=100,g="";p&&(u=parseFloat(p.state)||0,g=(null===(o=p.attributes)||void 0===o?void 0:o.unit_of_measurement)||"",(null===(i=p.attributes)||void 0===i?void 0:i.max)?m=parseFloat(p.attributes.max):("%"===g||"battery"===(null===(n=p.attributes)||void 0===n?void 0:n.device_class))&&(m=100));const h=Math.min(Math.max(u/m*100,0),100);let v="",b="";if(c.left_entity&&(null==e?void 0:e.states[c.left_entity])){const t=e.states[c.left_entity];v=t.state,b=(null===(a=t.attributes)||void 0===a?void 0:a.unit_of_measurement)||""}let f="",y="";if(c.right_entity&&(null==e?void 0:e.states[c.right_entity])){const t=e.states[c.right_entity];f=t.state,y=(null===(r=t.attributes)||void 0===r?void 0:r.unit_of_measurement)||""}let _=0;if(c.limit_entity&&(null==e?void 0:e.states[c.limit_entity])){const t=e.states[c.limit_entity],o=parseFloat(t.state)||0;_=Math.min(Math.max(o/m*100,0),100)}const x=c,w=c.height?`${c.height}px`:"auto",$=c.border_radius||10;let k=c.bar_color||x.color||"var(--primary-color)";const C=(t,e)=>{const o=[...t].sort(((t,e)=>t.position-e.position));let i=o[0],n=o[o.length-1];for(let t=0;t<o.length-1;t++)if(e>=o[t].position&&e<=o[t+1].position){i=o[t],n=o[t+1];break}if(i.position===e)return i.color;if(n.position===e)return n.color;const a=n.position-i.position,r=0===a?0:(e-i.position)/a;return this.interpolateColor(i.color,n.color,r)};if(c.use_gradient){const t=c.gradient_stops&&c.gradient_stops.length>0?c.gradient_stops:[{id:"1",position:0,color:"#ff0000"},{id:"2",position:50,color:"#ffff00"},{id:"3",position:100,color:"#00ff00"}],e=function(t){if(!t||0===t.length)return"";const e=[...t].sort(((t,e)=>t.position-e.position));return e.map((t=>`${t.color} ${t.position}%`)).join(", ")}(t);if("full"===c.gradient_display_mode)k=`linear-gradient(to right, ${e})`;else if("value-based"===c.gradient_display_mode)k=C(t,h);else{const e=[...t].sort(((t,e)=>t.position-e.position)),o=e.filter((t=>t.position<=h)).map(((t,e,o)=>{const i=1===o.length?0:t.position/h*100;return`${t.color} ${Math.min(i,100)}%`}));o.length>0&&(k=`linear-gradient(to right, ${o.join(", ")})`)}}let S="",z="";switch(c.bar_style){case"flat":S="box-shadow: none;";break;case"glossy":z=`\n          background: linear-gradient(to bottom, ${k}, ${k} 50%, rgba(0,0,0,0.1) 51%, ${k});\n          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);\n        `;break;case"embossed":S="\n          box-shadow: inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.8);\n          border: 1px solid rgba(0,0,0,0.1);\n        ",z="\n          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1);\n        ";break;case"inset":S="\n          box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);\n          border: 1px solid rgba(0,0,0,0.2);\n        ";break;case"gradient-overlay":z=`\n          background: linear-gradient(to bottom, \n            ${k} 0%, \n            rgba(255,255,255,0) 100%\n          );\n        `;break;case"neon-glow":z=`\n          box-shadow: 0 0 10px ${k}, 0 0 20px ${k}, 0 0 30px ${k};\n          filter: brightness(1.2);\n        `,S="\n          box-shadow: inset 0 0 10px rgba(0,0,0,0.5);\n        ";break;case"outline":S=`\n          border: 2px solid ${c.bar_border_color||"var(--primary-color)"};\n          background-color: transparent !important;\n        `,z=`\n          border: 2px solid ${k};\n          background-color: transparent !important;\n        `;break;case"glass":S="\n          backdrop-filter: blur(10px);\n          background-color: rgba(255,255,255,0.1) !important;\n          border: 1px solid rgba(255,255,255,0.2);\n        ",z="\n          backdrop-filter: blur(5px);\n          background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1)) !important;\n        ";break;case"metallic":z=`\n          background: linear-gradient(to bottom, \n            rgba(255,255,255,0.4) 0%, \n            ${k} 20%, \n            ${k} 80%, \n            rgba(0,0,0,0.2) 100%);\n          box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.3);\n        `;break;case"neumorphic":S="\n          box-shadow: inset 2px 2px 4px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(255,255,255,0.1);\n        ",z="\n          box-shadow: 2px 2px 4px rgba(0,0,0,0.1), -2px -2px 4px rgba(255,255,255,0.1);\n        ";break;case"dashed":z=`\n          background-image: repeating-linear-gradient(\n            90deg,\n            ${k} 0px,\n            ${k} 8px,\n            transparent 8px,\n            transparent 12px\n          );\n        `}const I={padding:x.padding_top||x.padding_bottom||x.padding_left||x.padding_right?`${this.addPixelUnit(x.padding_top)||"16px"} ${this.addPixelUnit(x.padding_right)||"16px"} ${this.addPixelUnit(x.padding_bottom)||"16px"} ${this.addPixelUnit(x.padding_left)||"16px"}`:"16px",margin:x.margin_top||x.margin_bottom||x.margin_left||x.margin_right?`${this.addPixelUnit(x.margin_top)||"0px"} ${this.addPixelUnit(x.margin_right)||"0px"} ${this.addPixelUnit(x.margin_bottom)||"16px"} ${this.addPixelUnit(x.margin_left)||"0px"}`:"0 0 16px 0",background:x.background_color||"transparent",backgroundImage:this.getBackgroundImageCSS(x,e),backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",border:x.border_style&&"none"!==x.border_style?`${x.border_width||"1px"} ${x.border_style} ${x.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(x.border_radius)||"0",position:x.position||"relative",top:x.top||"auto",bottom:x.bottom||"auto",left:x.left||"auto",right:x.right||"auto",zIndex:x.z_index||"auto",width:x.width||"100%",height:x.height||"auto",maxWidth:x.max_width||"100%",maxHeight:x.max_height||"none",minWidth:x.min_width||"none",minHeight:x.min_height||"auto",clipPath:x.clip_path||"none",backdropFilter:x.backdrop_filter||"none",boxSizing:"border-box"},T=`${c.bar_width||100}%`;let A="flex-start";switch(c.bar_alignment){case"left":A="flex-start";break;case"center":A="center";break;case"right":A="flex-end"}return V`
      <div class="bar-module-preview" style=${this.styleObjectToCss(I)}>
        <!-- Bar Container -->
        <div style="display: flex; justify-content: ${A}; width: 100%;">
          <div
            class="bar-container"
            style="
              width: ${T}; 
              height: ${w}; 
              background: ${c.bar_background_color||x.background_color||"transparent"};
              border-radius: ${$}px;
              overflow: hidden;
              position: relative;
              transition: ${!1!==c.animation?"all 0.3s ease":"none"};
              border: ${(c.bar_border_color||x.border_color)&&"outline"!==c.bar_style?`1px solid ${c.bar_border_color||x.border_color}`:"none"};
              ${S}
            "
          >
            <!-- Bar Fill -->
            <div
              class="bar-fill"
              style="
                width: ${h}%;
                height: 100%;
                background: ${k};
                transition: ${!1!==c.animation?"width 0.3s ease":"none"};
                border-radius: ${$}px;
                position: relative;
                ${z}
              "
            ></div>

            <!-- Limit Indicator -->
            ${c.limit_entity&&(null==e?void 0:e.states[c.limit_entity])&&_>=0?V`
                  <div
                    class="bar-limit-line"
                    style="
                    position: absolute; 
                    top: 0; 
                    bottom: 0; 
                    left: ${_}%; 
                    width: 2px; 
                    background-color: ${c.limit_color||"var(--warning-color)"}; 
                    z-index: 5; 
                    transform: translateX(-50%);
                  "
                    title="Limit: ${(null===(l=e.states[c.limit_entity])||void 0===l?void 0:l.state)||"N/A"}${(null===(d=null===(s=e.states[c.limit_entity])||void 0===s?void 0:s.attributes)||void 0===d?void 0:d.unit_of_measurement)||""}"
                  ></div>
                `:""}

            <!-- Percentage Text (Inside Bar) -->
            ${c.show_percentage?V`
                  <div
                    class="percentage-text"
                    style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: ${c.percentage_text_size||14}px;
                    color: ${c.percentage_text_color||x.color||"white"};
                    font-weight: 600;
                    z-index: 10;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                    white-space: nowrap;
                  "
                  >
                    ${Math.round(h)}%
                  </div>
                `:""}
          </div>

          ${!p&&c.entity?V`
                <div
                  class="entity-error"
                  style="color: var(--error-color); font-size: 12px; margin-top: 4px;"
                >
                  Entity not found: ${c.entity}
                </div>
              `:""}
        </div>

        <!-- Left and Right Side Labels (Below Bar) -->
        ${c.left_enabled||c.right_enabled?V`
              <div
                class="bar-labels-below"
                style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; gap: 16px;"
              >
                ${c.left_enabled?V`
                      <div class="left-side-below" style="text-align: left;">
                        <span
                          style="font-size: ${c.left_title_size||14}px; color: ${c.left_title_color||x.color||"var(--primary-text-color)"};"
                        >
                          ${c.left_title}:
                        </span>
                        <span
                          style="font-size: ${c.left_value_size||14}px; font-weight: 600; color: ${c.left_value_color||x.color||"var(--primary-text-color)"}; margin-left: 4px;"
                        >
                          ${v}${b}
                        </span>
                      </div>
                    `:V`<div></div>`}
                ${c.right_enabled?V`
                      <div class="right-side-below" style="text-align: right;">
                        <span
                          style="font-size: ${c.right_title_size||14}px; color: ${c.right_title_color||x.color||"var(--primary-text-color)"};"
                        >
                          ${c.right_title}:
                        </span>
                        <span
                          style="font-size: ${c.right_value_size||14}px; font-weight: 600; color: ${c.right_value_color||x.color||"var(--primary-text-color)"}; margin-left: 4px;"
                        >
                          ${f}${y}
                        </span>
                      </div>
                    `:V`<div></div>`}
              </div>
            `:""}
      </div>
    `}validate(t){const e=t,o=[...super.validate(t).errors];return e.entity&&""!==e.entity.trim()||o.push("Entity ID is required"),e.height&&(e.height<5||e.height>200)&&o.push("Bar height must be between 5 and 200 pixels"),e.border_radius&&(e.border_radius<0||e.border_radius>100)&&o.push("Border radius must be between 0 and 100 pixels"),e.limit_entity&&""!==e.limit_entity.trim()&&(e.limit_entity.includes(".")||o.push("Limit entity must be a valid entity ID (e.g., sensor.battery_limit)")),{valid:0===o.length,errors:o}}getStyles(){return'\n      .bar-module-preview {\n        max-width: 100%;\n        overflow: hidden;\n        box-sizing: border-box;\n      }\n      \n      .bar-container {\n        width: 100%;\n        position: relative;\n        display: block;\n        box-sizing: border-box;\n      }\n      \n      .bar-fill {\n        position: relative;\n        z-index: 1;\n      }\n      \n      .bar-limit-line {\n        opacity: 0.9;\n        transition: opacity 0.2s ease;\n      }\n      \n      .bar-limit-line:hover {\n        opacity: 1;\n      }\n      \n      .bar-name {\n        font-size: 16px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n        margin-bottom: 8px;\n        user-select: none;\n        word-wrap: break-word;\n      }\n      \n      .bar-value {\n        user-select: none;\n        text-shadow: 0 1px 2px rgba(0,0,0,0.1);\n      }\n      \n      .bar-value-outside {\n        user-select: none;\n        text-align: center;\n        font-weight: 600;\n        color: var(--primary-text-color);\n      }\n      \n      .entity-error {\n        font-size: 12px;\n        color: var(--error-color);\n        margin-top: 6px;\n        font-style: italic;\n        opacity: 0.8;\n      }\n      \n      .settings-section {\n        margin-bottom: 16px;\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n      \n      .settings-section * {\n        box-sizing: border-box;\n      }\n      \n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        margin-bottom: 12px !important;\n        padding-bottom: 0 !important;\n        border-bottom: none !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n      \n      .settings-section label {\n        display: block;\n        font-weight: 500;\n        margin-bottom: 4px;\n        color: var(--primary-text-color);\n      }\n      \n      .settings-section input,\n      .settings-section select {\n        width: 100%;\n        max-width: 100%;\n        padding: 8px;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--card-background-color);\n        color: var(--primary-text-color);\n        font-size: 14px;\n        box-sizing: border-box;\n      }\n      \n      .settings-section .checkbox-wrapper {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        font-weight: 500;\n      }\n      \n      .settings-section .checkbox-wrapper input[type="checkbox"] {\n        width: auto;\n        margin: 0;\n      }\n      \n      .help-text {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        margin: 4px 0 0 0;\n        opacity: 0.8;\n        word-wrap: break-word;\n      }\n      \n      .number-input,\n      .text-input,\n      .entity-input,\n      .select-input {\n        transition: border-color 0.2s ease;\n      }\n      \n      .number-input:focus,\n      .text-input:focus,\n      .entity-input:focus,\n      .select-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 1px var(--primary-color);\n      }\n      \n      /* Fix padding overflow */\n      .module-general-settings {\n        max-width: 100%;\n        overflow: hidden;\n      }\n      \n      .module-general-settings > * {\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Conditional Fields Grouping CSS */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n      }\n\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      @keyframes slideInFromLeft {\n        from { \n          opacity: 0; \n          transform: translateX(-10px); \n        }\n        to { \n          opacity: 1; \n          transform: translateX(0); \n        }\n      }\n\n      /* Proper form field arrangement: Title -> Description -> Field */\n      .settings-section ha-form {\n        --ha-form-field-margin: 8px 0;\n      }\n\n      .settings-section ha-form::part(field) {\n        margin-bottom: 8px;\n      }\n\n      .settings-section ha-form .ha-form-label {\n        font-size: 14px;\n        font-weight: 500;\n        color: var(--primary-text-color);\n        margin-bottom: 4px;\n        display: block;\n      }\n\n      .settings-section ha-form .ha-form-description {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        margin-bottom: 8px;\n        display: block;\n        opacity: 0.8;\n        line-height: 1.4;\n      }\n\n      .settings-section ha-form mwc-formfield {\n        --mdc-typography-body2-font-size: 14px;\n      }\n\n      .settings-section ha-form ha-switch {\n        --switch-checked-color: var(--primary-color);\n        --switch-unchecked-color: var(--disabled-color);\n      }\n\n      /* Field arrangement styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n        color: var(--primary-text-color) !important;\n        margin-bottom: 4px !important;\n        padding-bottom: 0 !important;\n        border-bottom: none !important;\n        display: block !important;\n        line-height: 1.2 !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        display: block !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n        font-weight: 400 !important;\n      }\n\n      /* Remove labels from ultra-color-picker when using external titles */\n      .settings-section ultra-color-picker .color-label {\n        display: none;\n      }\n\n      /* Prevent form fields from going off screen */\n      .property-input, .property-select {\n        max-width: 500px;\n      }\n\n      /* Apply max-width to ha-form elements */\n      .settings-section ha-form {\n        max-width: 500px;\n      }\n\n      /* Apply max-width to form inputs and selects */\n      .settings-section input,\n      .settings-section select,\n      .settings-section ha-textfield,\n      .settings-section ha-select {\n        max-width: 500px;\n      }\n\n      /* Fix slider and input field layouts */\n      .settings-section .field-group {\n        max-width: 100%;\n        overflow: visible;\n      }\n\n      /* Ensure slider containers don\'t get cut off */\n      .settings-section ha-form[style*="flex: 1"] {\n        min-width: 200px;\n        flex: 1 1 200px;\n      }\n\n      /* Fix input field containers */\n      .settings-section input[type="number"] {\n        min-width: 60px;\n        max-width: 80px;\n        flex-shrink: 0;\n      }\n\n      /* Ensure proper spacing for slider + input combos */\n      .settings-section div[style*="display: flex; gap: 8px"] {\n        gap: 8px !important;\n        align-items: center !important;\n        flex-wrap: nowrap !important;\n        min-width: 0;\n      }\n\n      .settings-section div[style*="display: flex; gap: 12px"] {\n        gap: 12px !important;\n        align-items: center !important;\n        flex-wrap: nowrap !important;\n        min-width: 0;\n      }\n\n      /* Prevent overflow in gradient editor */\n      .gradient-editor {\n        max-width: 100%;\n        overflow: visible;\n      }\n\n      .gradient-stop {\n        max-width: 100%;\n        overflow: visible;\n        position: relative;\n      }\n\n      /* Gradient stop drag handle styling */\n      .gradient-stop .drag-handle {\n        transition: all 0.2s ease;\n      }\n\n      .gradient-stop:hover .drag-handle {\n        color: var(--primary-color) !important;\n        transform: scale(1.1);\n      }\n\n      /* Ultra color picker sizing */\n      ultra-color-picker {\n        min-width: 40px;\n        max-width: 60px;\n        flex-shrink: 0;\n      }\n\n      /* Ensure gradient controls don\'t overflow */\n      .gradient-stops {\n        max-width: 100%;\n        overflow: visible;\n      }\n\n      /* Hide automatic value displays from ha-form sliders to prevent cut-off */\n      .settings-section ha-form ha-slider::part(value-display),\n      .settings-section ha-form mwc-slider::part(value-display),\n      .settings-section ha-form ha-slider .value-display,\n      .settings-section ha-form mwc-slider .value-display {\n        display: none !important;\n      }\n\n      /* Hide any automatic number displays that might appear next to sliders */\n      .settings-section ha-form .slider-value,\n      .settings-section ha-form .current-value,\n      .settings-section ha-form .number-display {\n        display: none !important;\n      }\n\n      /* Override any default slider value display styles */\n      .settings-section ha-form[data-field*="size"] .mdc-slider-value-indicator,\n      .settings-section ha-form[data-field*="size"] .value-indicator {\n        display: none !important;\n      }\n\n      /* More comprehensive hiding of slider value displays */\n      .settings-section ha-form ha-textfield[type="number"],\n      .settings-section ha-form mwc-textfield[type="number"],\n      .settings-section ha-form .number-input-display {\n        display: none !important;\n      }\n\n      /* Target specific Home Assistant slider value containers */\n      .settings-section ha-form .form-group .number-display,\n      .settings-section ha-form .ha-form-number .display-value,\n      .settings-section ha-form [role="slider"] + *:not(.mdc-slider-track),\n      .settings-section ha-form .mdc-slider + .value-display {\n        display: none !important;\n      }\n\n      /* Ensure sliders take full width without value displays */\n      .settings-section ha-form .mdc-slider,\n      .settings-section ha-form ha-slider {\n        width: 100% !important;\n        max-width: 100% !important;\n      }\n\n      /* Hide any text elements that might display current values */\n      .settings-section ha-form .field-wrapper > span:last-child,\n      .settings-section ha-form .form-control > span:last-child,\n      .settings-section ha-form .slider-container > span:last-child {\n        display: none !important;\n      }\n\n      /* Specifically target number displays in form groups */\n      .settings-section ha-form .form-group > *:last-child:not(ha-slider):not(.mdc-slider):not(input[type="range"]) {\n        display: none !important;\n      }\n\n      /* Custom Slider Controls - Optimized Design */\n      .number-range-control {\n        display: flex;\n        gap: 8px;\n        align-items: center;\n      }\n\n      .range-slider {\n        flex: 0 0 70%;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        min-width: 0;\n      }\n\n      .range-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 18px;\n        height: 18px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .range-slider::-moz-range-thumb {\n        width: 18px;\n        height: 18px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .range-slider:hover {\n        background: var(--primary-color);\n        opacity: 0.7;\n      }\n\n      .range-slider:hover::-webkit-slider-thumb {\n        transform: scale(1.1);\n      }\n\n      .range-slider:hover::-moz-range-thumb {\n        transform: scale(1.1);\n      }\n\n      .range-input {\n        flex: 0 0 20%;\n        padding: 6px 8px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        box-sizing: border-box;\n      }\n\n      .range-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      .range-reset-btn {\n        width: 32px;\n        height: 32px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n\n      .range-reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .range-reset-btn ha-icon {\n        font-size: 14px;\n      }\n\n      /* Conditional Fields Grouping - Reusable Pattern */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n        border-left-color: var(--primary-color);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n        margin: 0;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n        background: transparent;\n      }\n\n      /* Remove top margin from first field in conditional groups */\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      /* Ensure proper spacing within conditional field groups */\n      .conditional-fields-content .field-title {\n        color: var(--primary-text-color);\n      }\n\n      .conditional-fields-content .field-description {\n        color: var(--secondary-text-color);\n        opacity: 0.9;\n      }\n\n      /* Animation for conditional fields appearing */\n      .conditional-fields-group {\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      @keyframes slideInFromLeft {\n        from {\n          opacity: 0;\n          transform: translateX(-10px);\n        }\n        to {\n          opacity: 1;\n          transform: translateX(0);\n        }\n      }\n\n      /* Make conditional fields responsive */\n      @media (max-width: 768px) {\n        .conditional-fields-group {\n          border-left-width: 3px;\n        }\n        \n        .conditional-fields-header {\n          padding: 10px 12px;\n          font-size: 13px;\n        }\n        \n        .conditional-fields-content {\n          padding: 12px;\n        }\n      }\n    '}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${this.camelToKebab(t)}: ${e}`)).join("; ")}camelToKebab(t){return t.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}getBackgroundImageCSS(t,e){const o=t.background_image_type,i=t.background_image,n=t.background_image_entity;switch(o){case"upload":if(i)return i.startsWith("/api/image/serve/")?`url("${this.getImageUrl(e,i)}")`:(i.startsWith("data:image/"),`url("${i}")`);break;case"entity":if(n&&e){const t=e.states[n];if(t){const e=t.attributes.entity_picture||t.attributes.image||t.state;if(e&&"unknown"!==e&&"unavailable"!==e)return`url("${e}")`}}break;case"url":if(i)return`url("${i}")`;break;default:return"none"}return"none"}getImageUrl(t,e){if(!e)return"";if(e.startsWith("http"))return e;if(e.startsWith("data:image/"))return e;if(e.includes("/api/image/serve/")){const o=e.match(/\/api\/image\/serve\/([^\/]+)/);if(o&&o[1]){const i=o[1];try{return`${(t.hassUrl?t.hassUrl():"").replace(/\/$/,"")}/api/image/serve/${i}/original`}catch(t){return e}}return e}return e.startsWith("/")?`${(t.hassUrl?t.hassUrl():"").replace(/\/$/,"")}${e}`:e}getBarSizeFromHeight(t){return t<=12?"thin":t<=20?"regular":t<=30?"thick":"thiccc"}getBarRadiusFromStyle(t){return 0===t?"square":t<8?"rounded-square":"round"}interpolateColor(t,e,o){const i=this.hexToRgb(t),n=this.hexToRgb(e);if(!i||!n)return t;const a=Math.round(i.r+(n.r-i.r)*o),r=Math.round(i.g+(n.g-i.g)*o),l=Math.round(i.b+(n.b-i.b)*o);return this.rgbToHex(a,r,l)}hexToRgb(t){if(!t.startsWith("#"))return null;const e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return e?{r:parseInt(e[1],16),g:parseInt(e[2],16),b:parseInt(e[3],16)}:null}rgbToHex(t,e,o){return`#${((1<<24)+(t<<16)+(e<<8)+o).toString(16).slice(1)}`}addPixelUnit(t){return t?/^\d+$/.test(t)?`${t}px`:/^[\d\s]+$/.test(t)?t.split(" ").map((t=>t.trim()?`${t}px`:t)).join(" "):t:t}}class Nt extends ht{constructor(){super(...arguments),this.metadata={type:"icon",title:"Icons",description:"Interactive icon buttons",author:"WJD Designs",version:"1.0.0",icon:"mdi:circle",category:"interactive",tags:["icon","button","interactive","control"]}}createDefault(t){return{id:t||this.generateId("icon"),type:"icon",icons:[{id:this.generateId("icon-item"),entity:"weather.forecast_home",name:"Forecast",icon_inactive:"mdi:weather-partly-cloudy",icon_active:"mdi:weather-partly-cloudy",inactive_state:"off",active_state:"on",custom_inactive_state_text:"",custom_active_state_text:"",custom_inactive_name_text:"",custom_active_name_text:"",inactive_template_mode:!1,inactive_template:"",active_template_mode:!1,active_template:"",use_entity_color_for_icon:!1,color_inactive:"var(--secondary-text-color)",color_active:"var(--primary-color)",inactive_icon_color:"var(--secondary-text-color)",active_icon_color:"var(--primary-color)",inactive_name_color:"var(--primary-text-color)",active_name_color:"var(--primary-text-color)",inactive_state_color:"var(--secondary-text-color)",active_state_color:"var(--secondary-text-color)",show_name_when_inactive:!0,show_state_when_inactive:!0,show_icon_when_inactive:!0,show_name_when_active:!0,show_state_when_active:!0,show_icon_when_active:!0,show_state:!0,show_name:!0,show_units:!1,icon_size:24,text_size:12,name_icon_gap:4,icon_background:"none",use_entity_color_for_icon_background:!1,icon_background_color:"transparent",inactive_icon_animation:"none",active_icon_animation:"none",vertical_alignment:"center",container_width:void 0,container_background_shape:"none",tap_action:{action:"toggle"},hold_action:{action:"default"},double_tap_action:{action:"default"},click_action:"toggle",double_click_action:"none",hold_action_legacy:"none",navigation_path:"",url:"",service:"",service_data:{},template_mode:!1,template:"",dynamic_icon_template_mode:!1,dynamic_icon_template:"",dynamic_color_template_mode:!1,dynamic_color_template:""}],alignment:"center",vertical_alignment:"center",columns:3,gap:16}}renderGeneralTab(t,e,o,i){const n=t;return V`
      ${bt.injectCleanFormStyles()}
      <div class="module-general-settings">
        ${n.icons.map(((t,o)=>V`
            <div
              class="settings-section"
              style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
            >
              <!-- Entity Selection -->
              ${bt.renderField("Entity","Select the Home Assistant entity this icon will represent. Icon will auto-select from entity if available.",e,{entity:t.entity||""},[bt.createSchemaItem("entity",{entity:{}})],(a=>{var r,l;const s=a.detail.value.entity,d={entity:s};if(s&&(null==e?void 0:e.states[s])){const o=e.states[s],i=null===(r=o.attributes)||void 0===r?void 0:r.icon;!i||t.icon_inactive&&"mdi:lightbulb-outline"!==t.icon_inactive&&"mdi:weather-partly-cloudy"!==t.icon_inactive||(d.icon_inactive=i,d.icon_active=i),!(null===(l=o.attributes)||void 0===l?void 0:l.friendly_name)||t.name&&"Sample Icon"!==t.name&&"Forecast"!==t.name&&"Icon"!==t.name||(d.name=o.attributes.friendly_name)}this._updateIcon(n,o,d,i)}))}

              <!-- Active State Section -->
              <div style="margin-top: 24px;">
                <details
                  style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color);"
                  open
                >
                  <summary
                    style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                  >
                    <ha-icon icon="mdi:chevron-right" style="transition: transform 0.2s;"></ha-icon>
                    Active State
                  </summary>
                  <div style="padding: 16px;">
                    <!-- Active State Field -->
                    ${bt.renderField("Active State",'Define when this icon should be considered "active"',e,{active_state:t.active_state||"on"},[bt.createSchemaItem("active_state",{text:{}})],(t=>this._updateIcon(n,o,{active_state:t.detail.value.active_state},i)))}

                    <!-- Active Icon Picker -->
                    <div style="margin-top: 16px;">
                      ${bt.renderField("Active Icon","Icon to show when the entity is in the active state",e,{icon_active:t.icon_active||"mdi:lightbulb"},[bt.createSchemaItem("icon_active",{icon:{}})],(t=>this._updateIcon(n,o,{icon_active:t.detail.value.icon_active},i)))}
                    </div>

                    <!-- Custom Active State Text -->
                    <div style="margin-top: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        Custom Active State Text
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                      >
                        Override the displayed state text when active
                      </div>
                      <input
                        type="text"
                        .value=${t.custom_active_state_text||""}
                        @input=${t=>{const e=t.target;this._updateIcon(n,o,{custom_active_state_text:e.value},i)}}
                        style="
                          width: 100%;
                          padding: 10px 12px;
                          border: 1px solid var(--divider-color);
                          border-radius: 6px;
                          background: var(--card-background-color);
                          color: var(--primary-text-color);
                          font-size: 14px;
                          transition: all 0.2s ease;
                          box-sizing: border-box;
                        "
                        placeholder="Enter custom text..."
                      />
                    </div>

                    <!-- Custom Active Name Text -->
                    <div style="margin-top: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        Custom Active Name Text
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                      >
                        Override the displayed name text when active
                      </div>
                      <input
                        type="text"
                        .value=${t.custom_active_name_text||""}
                        @input=${t=>{const e=t.target;this._updateIcon(n,o,{custom_active_name_text:e.value},i)}}
                        style="
                          width: 100%;
                          padding: 10px 12px;
                          border: 1px solid var(--divider-color);
                          border-radius: 6px;
                          background: var(--card-background-color);
                          color: var(--primary-text-color);
                          font-size: 14px;
                          transition: all 0.2s ease;
                          box-sizing: border-box;
                        "
                        placeholder="Enter custom name..."
                      />
                    </div>

                    <!-- Show Toggles -->
                    <div
                      style="margin-top: 16px; display: flex; flex-direction: column; gap: 16px;"
                    >
                      <div
                        style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            Show Name When Active
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; opacity: 0.8; line-height: 1.4;"
                          >
                            Display the entity name when active
                          </div>
                        </div>
                        <div style="margin-left: 16px;">
                          <ha-switch
                            .checked=${!1!==t.show_name_when_active}
                            @change=${t=>{const e=t.target;this._updateIcon(n,o,{show_name_when_active:e.checked},i)}}
                          ></ha-switch>
                        </div>
                      </div>

                      <div
                        style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            Show State When Active
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; opacity: 0.8; line-height: 1.4;"
                          >
                            Display the entity state when active
                          </div>
                        </div>
                        <div style="margin-left: 16px;">
                          <ha-switch
                            .checked=${!1!==t.show_state_when_active}
                            @change=${t=>{const e=t.target;this._updateIcon(n,o,{show_state_when_active:e.checked},i)}}
                          ></ha-switch>
                        </div>
                      </div>

                      <div
                        style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            Show Icon When Active
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; opacity: 0.8; line-height: 1.4;"
                          >
                            Display the icon when active
                          </div>
                        </div>
                        <div style="margin-left: 16px;">
                          <ha-switch
                            .checked=${!1!==t.show_icon_when_active}
                            @change=${t=>{const e=t.target;this._updateIcon(n,o,{show_icon_when_active:e.checked},i)}}
                          ></ha-switch>
                        </div>
                      </div>
                    </div>

                    <!-- Icon Animation -->
                    <div style="margin-top: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        Icon Animation
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                      >
                        Animation to apply to the icon when active
                      </div>
                      <select
                        .value=${t.active_icon_animation||"none"}
                        @change=${t=>{const e=t.target;this._updateIcon(n,o,{active_icon_animation:e.value},i)}}
                        style="
                          width: 100%;
                          padding: 10px 12px;
                          border: 1px solid var(--divider-color);
                          border-radius: 6px;
                          background: var(--card-background-color);
                          color: var(--primary-text-color);
                          font-size: 14px;
                          transition: all 0.2s ease;
                          box-sizing: border-box;
                        "
                      >
                        <option value="none">None</option>
                        <option value="pulse">Pulse</option>
                        <option value="spin">Spin</option>
                        <option value="bounce">Bounce</option>
                        <option value="flash">Flash</option>
                        <option value="shake">Shake</option>
                        <option value="vibrate">Vibrate</option>
                        <option value="rotate-left">Rotate Left</option>
                        <option value="rotate-right">Rotate Right</option>
                        <option value="fade">Fade</option>
                        <option value="scale">Scale</option>
                        <option value="tada">Tada</option>
                      </select>
                    </div>

                    <!-- Template Mode -->
                    <div style="margin-top: 16px;">
                      <div
                        style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            Template Mode
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; opacity: 0.8; line-height: 1.4;"
                          >
                            Use a template to determine when this icon should be active. Templates
                            allow you to use Home Assistant templating syntax for complex
                            conditions. (This disables regular state condition)
                          </div>
                        </div>
                        <div style="margin-left: 16px;">
                          <ha-switch
                            .checked=${t.active_template_mode||!1}
                            @change=${t=>{const e=t.target;this._updateIcon(n,o,{active_template_mode:e.checked},i)}}
                          ></ha-switch>
                        </div>
                      </div>
                      ${t.active_template_mode?this.renderConditionalFieldsGroup("Active Template Settings",V`
                              <div style="margin-top: 16px;">
                                <div
                                  class="field-title"
                                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                                >
                                  Active Template
                                </div>
                                <div
                                  class="field-description"
                                  style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                                >
                                  Enter template code that returns true/false to determine active
                                  state
                                </div>
                                <textarea
                                  .value=${t.active_template||""}
                                  @input=${t=>{const e=t.target;this._updateIcon(n,o,{active_template:e.value},i)}}
                                  style="
                                    width: 100%;
                                    min-height: 80px;
                                    padding: 10px 12px;
                                    border: 1px solid var(--divider-color);
                                    border-radius: 6px;
                                    background: var(--card-background-color);
                                    color: var(--primary-text-color);
                                    font-size: 14px;
                                    font-family: monospace;
                                    transition: all 0.2s ease;
                                    box-sizing: border-box;
                                    resize: vertical;
                                  "
                                  placeholder="Enter template code..."
                                ></textarea>
                              </div>
                            `):""}
                    </div>

                    <!-- Icon Size -->
                    <div style="margin-top: 16px;">
                      <div class="field-container" style="margin-bottom: 24px;">
                        <div class="field-title">Active Icon Size</div>
                        <div class="field-description">
                          Size of the icon when active (in pixels)
                        </div>
                        <div
                          class="gap-control-container"
                          style="display: flex; align-items: center; gap: 12px;"
                        >
                          <input
                            type="range"
                            class="gap-slider"
                            min="12"
                            max="72"
                            step="2"
                            .value="${t.active_icon_size||24}"
                            @input=${t=>{const e=t.target,a=Number(e.value);this._updateIcon(n,o,{active_icon_size:a},i)}}
                          />
                          <input
                            type="number"
                            class="gap-input"
                            style="width: 50px !important; max-width: 50px !important; min-width: 50px !important; padding: 4px 6px !important; font-size: 13px !important;"
                            min="12"
                            max="72"
                            step="2"
                            .value="${t.active_icon_size||24}"
                            @input=${t=>{const e=t.target,a=Number(e.value);isNaN(a)||this._updateIcon(n,o,{active_icon_size:a},i)}}
                            @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,a=Number(e.value)||24,r="ArrowUp"===t.key?2:-2,l=Math.max(12,Math.min(72,a+r));this._updateIcon(n,o,{active_icon_size:l},i)}}}
                          />
                          <button
                            class="reset-btn"
                            @click=${()=>this._updateIcon(n,o,{active_icon_size:24},i)}
                            title="Reset to default (24)"
                          >
                            <ha-icon icon="mdi:refresh"></ha-icon>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Icon Background Shape -->
                    <div style="margin-top: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        Active Icon Background Shape
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                      >
                        Shape and style of the icon background when active
                      </div>
                      <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label
                          style="display: flex; align-items: center; gap: 8px; cursor: pointer;"
                        >
                          <input
                            type="radio"
                            name="active_icon_background_${o}"
                            value="none"
                            .checked=${"none"===(t.active_icon_background||"none")}
                            @change=${()=>this._updateIcon(n,o,{active_icon_background:"none"},i)}
                          />
                          None
                        </label>
                        <label
                          style="display: flex; align-items: center; gap: 8px; cursor: pointer;"
                        >
                          <input
                            type="radio"
                            name="active_icon_background_${o}"
                            value="rounded-square"
                            .checked=${"rounded-square"===(t.active_icon_background||"none")}
                            @change=${()=>this._updateIcon(n,o,{active_icon_background:"rounded-square"},i)}
                          />
                          Rounded Square
                        </label>
                        <label
                          style="display: flex; align-items: center; gap: 8px; cursor: pointer;"
                        >
                          <input
                            type="radio"
                            name="active_icon_background_${o}"
                            value="circle"
                            .checked=${"circle"===(t.active_icon_background||"none")}
                            @change=${()=>this._updateIcon(n,o,{active_icon_background:"circle"},i)}
                          />
                          Circle
                        </label>
                      </div>
                    </div>

                    <!-- Use Entity Color for Icon -->
                    <div style="margin-top: 16px;">
                      <div
                        style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            Use Entity Color for Icon
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; opacity: 0.8; line-height: 1.4;"
                          >
                            Use the color provided by the entity instead of custom colors
                          </div>
                        </div>
                        <div style="margin-left: 16px;">
                          <ha-switch
                            .checked=${t.use_entity_color_for_icon||!1}
                            @change=${t=>{const e=t.target;this._updateIcon(n,o,{use_entity_color_for_icon:e.checked},i)}}
                          ></ha-switch>
                        </div>
                      </div>
                    </div>

                    <!-- Color Pickers (if not using entity color) -->
                    ${t.use_entity_color_for_icon?"":this.renderConditionalFieldsGroup("Active Color Settings",V`
                            <div style="display: flex; flex-direction: column; gap: 16px;">
                              <ultra-color-picker
                                .label=${"Active Icon Color"}
                                .value=${t.active_icon_color||"var(--primary-color)"}
                                .defaultValue=${"var(--primary-color)"}
                                .hass=${e}
                                @value-changed=${t=>this._updateIcon(n,o,{active_icon_color:t.detail.value},i)}
                              ></ultra-color-picker>

                              <ultra-color-picker
                                .label=${"Active Name Color"}
                                .value=${t.active_name_color||"var(--primary-text-color)"}
                                .defaultValue=${"var(--primary-text-color)"}
                                .hass=${e}
                                @value-changed=${t=>this._updateIcon(n,o,{active_name_color:t.detail.value},i)}
                              ></ultra-color-picker>

                              <ultra-color-picker
                                .label=${"Active State Color"}
                                .value=${t.active_state_color||"var(--secondary-text-color)"}
                                .defaultValue=${"var(--secondary-text-color)"}
                                .hass=${e}
                                @value-changed=${t=>this._updateIcon(n,o,{active_state_color:t.detail.value},i)}
                              ></ultra-color-picker>
                            </div>

                            <!-- Icon Background Color -->
                            ${"none"!==t.active_icon_background?V`
                                  <div style="margin-top: 16px;">
                                    <ultra-color-picker
                                      .label=${"Active Icon Background Color"}
                                      .value=${t.active_icon_background_color||"var(--card-background-color)"}
                                      .defaultValue=${"var(--card-background-color)"}
                                      .hass=${e}
                                      @value-changed=${t=>this._updateIcon(n,o,{active_icon_background_color:t.detail.value},i)}
                                    ></ultra-color-picker>
                                  </div>
                                `:""}
                          `)}
                  </div>
                </details>
              </div>

              <!-- Inactive State Section -->
              <div style="margin-top: 16px;">
                <details
                  style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color);"
                >
                  <summary
                    style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                  >
                    <ha-icon icon="mdi:chevron-right" style="transition: transform 0.2s;"></ha-icon>
                    Inactive State
                  </summary>
                  <div style="padding: 16px;">
                    <!-- Inactive State Field -->
                    ${bt.renderField("Inactive State",'Define when this icon should be considered "inactive"',e,{inactive_state:t.inactive_state||"off"},[bt.createSchemaItem("inactive_state",{text:{}})],(t=>this._updateIcon(n,o,{inactive_state:t.detail.value.inactive_state},i)))}

                    <!-- Inactive Icon Picker -->
                    <div style="margin-top: 16px;">
                      ${bt.renderField("Inactive Icon","Icon to show when the entity is in the inactive state",e,{icon_inactive:t.icon_inactive||"mdi:lightbulb-outline"},[bt.createSchemaItem("icon_inactive",{icon:{}})],(t=>this._updateIcon(n,o,{icon_inactive:t.detail.value.icon_inactive},i)))}
                    </div>

                    <!-- Custom Inactive State Text -->
                    <div style="margin-top: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        Custom Inactive State Text
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                      >
                        Override the displayed state text when inactive
                      </div>
                      <input
                        type="text"
                        .value=${t.custom_inactive_state_text||""}
                        @input=${t=>{const e=t.target;this._updateIcon(n,o,{custom_inactive_state_text:e.value},i)}}
                        style="
                          width: 100%;
                          padding: 10px 12px;
                          border: 1px solid var(--divider-color);
                          border-radius: 6px;
                          background: var(--card-background-color);
                          color: var(--primary-text-color);
                          font-size: 14px;
                          transition: all 0.2s ease;
                          box-sizing: border-box;
                        "
                        placeholder="Enter custom text..."
                      />
                    </div>

                    <!-- Custom Inactive Name Text -->
                    <div style="margin-top: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        Custom Inactive Name Text
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                      >
                        Override the displayed name text when inactive
                      </div>
                      <input
                        type="text"
                        .value=${t.custom_inactive_name_text||""}
                        @input=${t=>{const e=t.target;this._updateIcon(n,o,{custom_inactive_name_text:e.value},i)}}
                        style="
                          width: 100%;
                          padding: 10px 12px;
                          border: 1px solid var(--divider-color);
                          border-radius: 6px;
                          background: var(--card-background-color);
                          color: var(--primary-text-color);
                          font-size: 14px;
                          transition: all 0.2s ease;
                          box-sizing: border-box;
                        "
                        placeholder="Enter custom name..."
                      />
                    </div>

                    <!-- Show Toggles -->
                    <div
                      style="margin-top: 16px; display: flex; flex-direction: column; gap: 16px;"
                    >
                      <div
                        style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            Show Name When Inactive
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; opacity: 0.8; line-height: 1.4;"
                          >
                            Display the entity name when inactive
                          </div>
                        </div>
                        <div style="margin-left: 16px;">
                          <ha-switch
                            .checked=${!1!==t.show_name_when_inactive}
                            @change=${t=>{const e=t.target;this._updateIcon(n,o,{show_name_when_inactive:e.checked},i)}}
                          ></ha-switch>
                        </div>
                      </div>

                      <div
                        style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            Show State When Inactive
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; opacity: 0.8; line-height: 1.4;"
                          >
                            Display the entity state when inactive
                          </div>
                        </div>
                        <div style="margin-left: 16px;">
                          <ha-switch
                            .checked=${!1!==t.show_state_when_inactive}
                            @change=${t=>{const e=t.target;this._updateIcon(n,o,{show_state_when_inactive:e.checked},i)}}
                          ></ha-switch>
                        </div>
                      </div>

                      <div
                        style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            Show Icon When Inactive
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; opacity: 0.8; line-height: 1.4;"
                          >
                            Display the icon when inactive
                          </div>
                        </div>
                        <div style="margin-left: 16px;">
                          <ha-switch
                            .checked=${!1!==t.show_icon_when_inactive}
                            @change=${t=>{const e=t.target;this._updateIcon(n,o,{show_icon_when_inactive:e.checked},i)}}
                          ></ha-switch>
                        </div>
                      </div>
                    </div>

                    <!-- Icon Animation -->
                    <div style="margin-top: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        Icon Animation
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                      >
                        Animation to apply to the icon when inactive
                      </div>
                      <select
                        .value=${t.inactive_icon_animation||"none"}
                        @change=${t=>{const e=t.target;this._updateIcon(n,o,{inactive_icon_animation:e.value},i)}}
                        style="
                          width: 100%;
                          padding: 10px 12px;
                          border: 1px solid var(--divider-color);
                          border-radius: 6px;
                          background: var(--card-background-color);
                          color: var(--primary-text-color);
                          font-size: 14px;
                          transition: all 0.2s ease;
                          box-sizing: border-box;
                        "
                      >
                        <option value="none">None</option>
                        <option value="pulse">Pulse</option>
                        <option value="spin">Spin</option>
                        <option value="bounce">Bounce</option>
                        <option value="flash">Flash</option>
                        <option value="shake">Shake</option>
                        <option value="vibrate">Vibrate</option>
                        <option value="rotate-left">Rotate Left</option>
                        <option value="rotate-right">Rotate Right</option>
                        <option value="fade">Fade</option>
                        <option value="scale">Scale</option>
                        <option value="tada">Tada</option>
                      </select>
                    </div>

                    <!-- Template Mode -->
                    <div style="margin-top: 16px;">
                      <div
                        style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            Template Mode
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; opacity: 0.8; line-height: 1.4;"
                          >
                            Use a template to determine when this icon should be inactive. Templates
                            allow you to use Home Assistant templating syntax for complex
                            conditions. (This disables regular state condition)
                          </div>
                        </div>
                        <div style="margin-left: 16px;">
                          <ha-switch
                            .checked=${t.inactive_template_mode||!1}
                            @change=${t=>{const e=t.target;this._updateIcon(n,o,{inactive_template_mode:e.checked},i)}}
                          ></ha-switch>
                        </div>
                      </div>
                      ${t.inactive_template_mode?this.renderConditionalFieldsGroup("Inactive Template Settings",V`
                              <div style="margin-top: 16px;">
                                <div
                                  class="field-title"
                                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                                >
                                  Inactive Template
                                </div>
                                <div
                                  class="field-description"
                                  style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                                >
                                  Enter template code that returns true/false to determine inactive
                                  state
                                </div>
                                <textarea
                                  .value=${t.inactive_template||""}
                                  @input=${t=>{const e=t.target;this._updateIcon(n,o,{inactive_template:e.value},i)}}
                                  style="
                                    width: 100%;
                                    min-height: 80px;
                                    padding: 10px 12px;
                                    border: 1px solid var(--divider-color);
                                    border-radius: 6px;
                                    background: var(--card-background-color);
                                    color: var(--primary-text-color);
                                    font-size: 14px;
                                    font-family: monospace;
                                    transition: all 0.2s ease;
                                    box-sizing: border-box;
                                    resize: vertical;
                                  "
                                  placeholder="Enter template code..."
                                ></textarea>
                              </div>
                            `):""}
                    </div>

                    <!-- Icon Size -->
                    <div style="margin-top: 16px;">
                      <div class="field-container" style="margin-bottom: 24px;">
                        <div class="field-title">Inactive Icon Size</div>
                        <div class="field-description">
                          Size of the icon when inactive (in pixels)
                        </div>
                        <div
                          class="gap-control-container"
                          style="display: flex; align-items: center; gap: 12px;"
                        >
                          <input
                            type="range"
                            class="gap-slider"
                            min="12"
                            max="72"
                            step="2"
                            .value="${t.inactive_icon_size||24}"
                            @input=${t=>{const e=t.target,a=Number(e.value);this._updateIcon(n,o,{inactive_icon_size:a},i)}}
                          />
                          <input
                            type="number"
                            class="gap-input"
                            style="width: 50px !important; max-width: 50px !important; min-width: 50px !important; padding: 4px 6px !important; font-size: 13px !important;"
                            min="12"
                            max="72"
                            step="2"
                            .value="${t.inactive_icon_size||24}"
                            @input=${t=>{const e=t.target,a=Number(e.value);isNaN(a)||this._updateIcon(n,o,{inactive_icon_size:a},i)}}
                            @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,a=Number(e.value)||24,r="ArrowUp"===t.key?2:-2,l=Math.max(12,Math.min(72,a+r));this._updateIcon(n,o,{inactive_icon_size:l},i)}}}
                          />
                          <button
                            class="reset-btn"
                            @click=${()=>this._updateIcon(n,o,{inactive_icon_size:24},i)}
                            title="Reset to default (24)"
                          >
                            <ha-icon icon="mdi:refresh"></ha-icon>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Icon Background Shape -->
                    <div style="margin-top: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        Inactive Icon Background Shape
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                      >
                        Shape and style of the icon background when inactive
                      </div>
                      <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label
                          style="display: flex; align-items: center; gap: 8px; cursor: pointer;"
                        >
                          <input
                            type="radio"
                            name="inactive_icon_background_${o}"
                            value="none"
                            .checked=${"none"===(t.inactive_icon_background||"none")}
                            @change=${()=>this._updateIcon(n,o,{inactive_icon_background:"none"},i)}
                          />
                          None
                        </label>
                        <label
                          style="display: flex; align-items: center; gap: 8px; cursor: pointer;"
                        >
                          <input
                            type="radio"
                            name="inactive_icon_background_${o}"
                            value="rounded-square"
                            .checked=${"rounded-square"===(t.inactive_icon_background||"none")}
                            @change=${()=>this._updateIcon(n,o,{inactive_icon_background:"rounded-square"},i)}
                          />
                          Rounded Square
                        </label>
                        <label
                          style="display: flex; align-items: center; gap: 8px; cursor: pointer;"
                        >
                          <input
                            type="radio"
                            name="inactive_icon_background_${o}"
                            value="circle"
                            .checked=${"circle"===(t.inactive_icon_background||"none")}
                            @change=${()=>this._updateIcon(n,o,{inactive_icon_background:"circle"},i)}
                          />
                          Circle
                        </label>
                      </div>
                    </div>

                    <!-- Use Entity Color for Icon -->
                    <div style="margin-top: 16px;">
                      <div
                        style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            Use Entity Color for Icon
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; opacity: 0.8; line-height: 1.4;"
                          >
                            Use the color provided by the entity instead of custom colors
                          </div>
                        </div>
                        <div style="margin-left: 16px;">
                          <ha-switch
                            .checked=${t.use_entity_color_for_icon||!1}
                            @change=${t=>{const e=t.target;this._updateIcon(n,o,{use_entity_color_for_icon:e.checked},i)}}
                          ></ha-switch>
                        </div>
                      </div>
                    </div>

                    <!-- Color Pickers (if not using entity color) -->
                    ${t.use_entity_color_for_icon?"":this.renderConditionalFieldsGroup("Inactive Color Settings",V`
                            <div style="display: flex; flex-direction: column; gap: 16px;">
                              <ultra-color-picker
                                .label=${"Inactive Icon Color"}
                                .value=${t.inactive_icon_color||"var(--secondary-text-color)"}
                                .defaultValue=${"var(--secondary-text-color)"}
                                .hass=${e}
                                @value-changed=${t=>this._updateIcon(n,o,{inactive_icon_color:t.detail.value},i)}
                              ></ultra-color-picker>

                              <ultra-color-picker
                                .label=${"Inactive Name Color"}
                                .value=${t.inactive_name_color||"var(--primary-text-color)"}
                                .defaultValue=${"var(--primary-text-color)"}
                                .hass=${e}
                                @value-changed=${t=>this._updateIcon(n,o,{inactive_name_color:t.detail.value},i)}
                              ></ultra-color-picker>

                              <ultra-color-picker
                                .label=${"Inactive State Color"}
                                .value=${t.inactive_state_color||"var(--secondary-text-color)"}
                                .defaultValue=${"var(--secondary-text-color)"}
                                .hass=${e}
                                @value-changed=${t=>this._updateIcon(n,o,{inactive_state_color:t.detail.value},i)}
                              ></ultra-color-picker>
                            </div>

                            <!-- Icon Background Color -->
                            ${"none"!==t.inactive_icon_background?V`
                                  <div style="margin-top: 16px;">
                                    <ultra-color-picker
                                      .label=${"Inactive Icon Background Color"}
                                      .value=${t.inactive_icon_background_color||"var(--card-background-color)"}
                                      .defaultValue=${"var(--card-background-color)"}
                                      .hass=${e}
                                      @value-changed=${t=>this._updateIcon(n,o,{inactive_icon_background_color:t.detail.value},i)}
                                    ></ultra-color-picker>
                                  </div>
                                `:""}
                          `)}
                  </div>
                </details>
              </div>
            </div>
          `))}
      </div>
    `}renderActionsTab(t,e,o,i){const n=t;return V`
      <div class="module-actions-settings">
        ${n.icons.map(((t,o)=>V`
            <div
              class="settings-section"
              style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
            >
              ${vt.render(e,{tap_action:t.tap_action||{action:"default"},hold_action:t.hold_action||{action:"default"},double_tap_action:t.double_tap_action||{action:"default"}},(t=>{const e={};t.tap_action&&(e.tap_action=t.tap_action),t.hold_action&&(e.hold_action=t.hold_action),t.double_tap_action&&(e.double_tap_action=t.double_tap_action),this._updateIcon(n,o,e,i)}),"Link Configuration")}
            </div>
          `))}
      </div>
    `}renderOtherTab(t,e,o,i){const n=t;return V`
      ${bt.injectCleanFormStyles()}
      <div class="module-other-settings">
        ${n.icons.map(((t,o)=>V`
            <div
              class="settings-section"
              style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
            >
              <!-- Show Units Toggle -->
              <div class="settings-section" style="margin-bottom: 24px;">
                <div
                  class="field-title"
                  style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
                >
                  Show Units
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                >
                  Display the units of measurement alongside the entity state.
                </div>
                ${bt.renderField("","",e,{show_units:t.show_units||!1},[bt.createSchemaItem("show_units",{boolean:{}})],(t=>this._updateIcon(n,o,{show_units:t.detail.value.show_units},i)))}
              </div>

              <!-- Name-Icon Spacing Control -->
              <div class="settings-section" style="margin-bottom: 24px;">
                <div class="field-container" style="margin-bottom: 24px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
                  >
                    Name-Icon Spacing
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Adjust the spacing between the icon and name elements
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
                      .value="${t.name_icon_gap||4}"
                      @input=${t=>{const e=t.target,a=Number(e.value);this._updateIcon(n,o,{name_icon_gap:a},i)}}
                    />
                    <input
                      type="number"
                      class="gap-input"
                      style="width: 50px !important; max-width: 50px !important; min-width: 50px !important; padding: 4px 6px !important; font-size: 13px !important;"
                      min="0"
                      max="20"
                      step="1"
                      .value="${t.name_icon_gap||4}"
                      @input=${t=>{const e=t.target,a=Number(e.value);isNaN(a)||this._updateIcon(n,o,{name_icon_gap:a},i)}}
                      @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,a=Number(e.value)||4,r="ArrowUp"===t.key?1:-1,l=Math.max(0,Math.min(20,a+r));this._updateIcon(n,o,{name_icon_gap:l},i)}}}
                    />
                    <button
                      class="reset-btn"
                      @click=${()=>this._updateIcon(n,o,{name_icon_gap:4},i)}
                      title="Reset to default (4px)"
                    >
                      <ha-icon icon="mdi:refresh"></ha-icon>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Container Style Section -->
              <div
                class="settings-section"
                style="margin-bottom: 24px; padding: 16px; background: var(--card-background-color); border-radius: 8px;"
              >
                <div
                  class="section-title"
                  style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
                >
                  Container Style
                </div>

                <!-- Vertical Alignment -->
                <div class="settings-section" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
                  >
                    Vertical Alignment
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    How to align the icon within the container
                  </div>
                  ${bt.renderField("","",e,{vertical_alignment:t.vertical_alignment||"center"},[bt.createSchemaItem("vertical_alignment",{select:{options:[{value:"top",label:"Top"},{value:"center",label:"Center"},{value:"bottom",label:"Bottom"}]}})],(t=>this._updateIcon(n,o,{vertical_alignment:t.detail.value.vertical_alignment},i)))}
                </div>

                <!-- Container Width -->
                <div class="settings-section" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
                  >
                    Container Width
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Maximum width of the icon container in pixels
                  </div>
                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">Container Width</div>
                    <div class="field-description">
                      Maximum width of the icon container in pixels
                    </div>
                    <div
                      class="gap-control-container"
                      style="display: flex; align-items: center; gap: 12px;"
                    >
                      <input
                        type="range"
                        class="gap-slider"
                        min="40"
                        max="200"
                        step="5"
                        .value="${t.container_width||80}"
                        @input=${t=>{const e=t.target,a=Number(e.value);this._updateIcon(n,o,{container_width:a},i)}}
                      />
                      <input
                        type="number"
                        class="gap-input"
                        style="width: 50px !important; max-width: 50px !important; min-width: 50px !important; padding: 4px 6px !important; font-size: 13px !important;"
                        min="40"
                        max="200"
                        step="5"
                        .value="${t.container_width||80}"
                        @input=${t=>{const e=t.target,a=Number(e.value);isNaN(a)||this._updateIcon(n,o,{container_width:a},i)}}
                        @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,a=Number(e.value)||80,r="ArrowUp"===t.key?5:-5,l=Math.max(40,Math.min(200,a+r));this._updateIcon(n,o,{container_width:l},i)}}}
                      />
                      <button
                        class="reset-btn"
                        @click=${()=>this._updateIcon(n,o,{container_width:80},i)}
                        title="Reset to default (80)"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Container Background Shape -->
                <div class="settings-section" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
                  >
                    Container Background Shape
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Shape of the icon container background
                  </div>
                  ${bt.renderField("","",e,{container_background_shape:t.container_background_shape||"none"},[bt.createSchemaItem("container_background_shape",{select:{options:[{value:"none",label:"None"},{value:"rounded",label:"Rounded"},{value:"square",label:"Square"},{value:"circle",label:"Circle"}]}})],(t=>this._updateIcon(n,o,{container_background_shape:t.detail.value.container_background_shape},i)))}
                </div>
              </div>

              <!-- Dynamic Templates Section -->
              <div
                class="settings-section"
                style="margin-bottom: 24px; padding: 16px; background: var(--card-background-color); border-radius: 8px;"
              >
                <div
                  class="section-title"
                  style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
                >
                  Dynamic Templates
                </div>

                <!-- Dynamic Icon Template -->
                <div class="settings-section" style="margin-bottom: 24px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
                  >
                    Dynamic Icon Template
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Use a template to dynamically select the icon based on entity states or
                    conditions.
                  </div>
                  ${bt.renderField("","",e,{dynamic_icon_template_mode:t.dynamic_icon_template_mode||!1},[bt.createSchemaItem("dynamic_icon_template_mode",{boolean:{}})],(t=>this._updateIcon(n,o,{dynamic_icon_template_mode:t.detail.value.dynamic_icon_template_mode},i)))}
                  ${t.dynamic_icon_template_mode?this.renderConditionalFieldsGroup("Dynamic Icon Template Settings",V`
                          <div class="settings-section">
                            <div
                              class="field-title"
                              style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                            >
                              Template Code
                            </div>
                            <div
                              class="field-description"
                              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                            >
                              Enter the Jinja2 template code that returns an icon name (e.g.,
                              mdi:lightbulb).
                            </div>
                            ${bt.renderField("","",e,{dynamic_icon_template:t.dynamic_icon_template||""},[bt.createSchemaItem("dynamic_icon_template",{text:{multiline:!0}})],(t=>this._updateIcon(n,o,{dynamic_icon_template:t.detail.value.dynamic_icon_template},i)))}
                          </div>
                        `):""}
                </div>

                <!-- Dynamic Color Template -->
                <div class="settings-section" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
                  >
                    Dynamic Color Template
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Use a template to dynamically set the icon color based on entity states or
                    values.
                  </div>
                  ${bt.renderField("","",e,{dynamic_color_template_mode:t.dynamic_color_template_mode||!1},[bt.createSchemaItem("dynamic_color_template_mode",{boolean:{}})],(t=>this._updateIcon(n,o,{dynamic_color_template_mode:t.detail.value.dynamic_color_template_mode},i)))}
                  ${t.dynamic_color_template_mode?this.renderConditionalFieldsGroup("Dynamic Color Template Settings",V`
                          <div class="settings-section">
                            <div
                              class="field-title"
                              style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                            >
                              Template Code
                            </div>
                            <div
                              class="field-description"
                              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                            >
                              Enter the Jinja2 template code that returns a color value (e.g.,
                              #ff0000, rgb(255,0,0), var(--primary-color)).
                            </div>
                            ${bt.renderField("","",e,{dynamic_color_template:t.dynamic_color_template||""},[bt.createSchemaItem("dynamic_color_template",{text:{multiline:!0}})],(t=>this._updateIcon(n,o,{dynamic_color_template:t.detail.value.dynamic_color_template},i)))}
                          </div>
                        `):""}
                </div>
              </div>
            </div>
          `))}
      </div>
    `}renderPreview(t,e){const o=t,i=o,n={padding:i.padding_top||i.padding_bottom||i.padding_left||i.padding_right?`${i.padding_top||"8"}px ${i.padding_right||"0"}px ${i.padding_bottom||"8"}px ${i.padding_left||"0"}px`:"8px 0",margin:i.margin_top||i.margin_bottom||i.margin_left||i.margin_right?`${i.margin_top||"0"}px ${i.margin_right||"0"}px ${i.margin_bottom||"0"}px ${i.margin_left||"0"}px`:"0",background:i.background_color||"transparent",backgroundImage:this.getBackgroundImageCSS(i,e),backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",border:i.border_style&&"none"!==i.border_style?`${i.border_width||"1px"} ${i.border_style} ${i.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(i.border_radius)||"0",position:i.position||"relative",top:i.top||"auto",bottom:i.bottom||"auto",left:i.left||"auto",right:i.right||"auto",zIndex:i.z_index||"auto",width:i.width||"100%",height:i.height||"auto",maxWidth:i.max_width||"100%",maxHeight:i.max_height||"none",minWidth:i.min_width||"none",minHeight:i.min_height||"auto",overflow:i.overflow||"hidden",clipPath:i.clip_path||"none",backdropFilter:i.backdrop_filter||"none",boxShadow:i.box_shadow_h&&i.box_shadow_v?`${i.box_shadow_h||"0"} ${i.box_shadow_v||"0"} ${i.box_shadow_blur||"0"} ${i.box_shadow_spread||"0"} ${i.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"};return V`
      <div class="icon-module-container" style=${this.styleObjectToCss(n)}>
        <div class="icon-module-preview">
          <div
            class="icon-grid"
            style="
            display: grid;
            grid-template-columns: repeat(${Math.min(o.columns||3,o.icons.length)}, 1fr);
            gap: ${o.gap||16}px;
            justify-content: ${o.alignment||"center"};
          "
          >
            ${o.icons.slice(0,6).map((t=>{var o,i,n,a,r;const l=null==e?void 0:e.states[t.entity],s=(null==l?void 0:l.state)||"unknown",d=s===t.active_state,c=d?!1!==t.show_icon_when_active:!1!==t.show_icon_when_inactive,p=d?!1!==t.show_name_when_active:!1!==t.show_name_when_inactive,u=d?!1!==t.show_state_when_active:!1!==t.show_state_when_inactive;let m=d&&t.icon_active||t.icon_inactive;(null===(o=null==l?void 0:l.attributes)||void 0===o?void 0:o.icon)&&(m=l.attributes.icon);const g=t.use_entity_color_for_icon&&(null===(i=null==l?void 0:l.attributes)||void 0===i?void 0:i.rgb_color)?`rgb(${l.attributes.rgb_color.join(",")})`:d?t.active_icon_color:t.inactive_icon_color,h=d?t.active_name_color:t.inactive_name_color,v=d?t.active_state_color:t.inactive_state_color,b=d?t.custom_active_name_text||t.name||(null===(n=null==l?void 0:l.attributes)||void 0===n?void 0:n.friendly_name)||t.entity:t.custom_inactive_name_text||t.name||(null===(a=null==l?void 0:l.attributes)||void 0===a?void 0:a.friendly_name)||t.entity,f=d?t.custom_active_state_text||s:t.custom_inactive_state_text||s,y=d?t.active_icon_background||t.icon_background:t.inactive_icon_background||t.icon_background,_=d?t.active_icon_background_color||t.icon_background_color:t.inactive_icon_background_color||t.icon_background_color,x="none"!==y?{backgroundColor:t.use_entity_color_for_icon_background&&(null===(r=null==l?void 0:l.attributes)||void 0===r?void 0:r.rgb_color)?`rgb(${l.attributes.rgb_color.join(",")})`:_,borderRadius:"circle"===y?"50%":"rounded-square"===y?"8px":"0",padding:"8px",display:"flex",alignItems:"center",justifyContent:"center"}:{},w=d?"none"!==t.active_icon_animation?`icon-animation-${t.active_icon_animation}`:"":"none"!==t.inactive_icon_animation?`icon-animation-${t.inactive_icon_animation}`:"",$={display:"flex",flexDirection:"column",alignItems:"center",justifyContent:t.vertical_alignment||"center",padding:"8px",borderRadius:"circle"===t.container_background_shape?"50%":"rounded"===t.container_background_shape?"8px":"square"===t.container_background_shape?"0":"8px",background:"transparent",cursor:"pointer",transition:"all 0.2s ease",width:t.container_width?`${t.container_width}px`:"auto",minWidth:"60px"};return V`
                <div
                  class="icon-item-preview ${w}"
                  style=${this.styleObjectToCss(Object.assign(Object.assign({},$),{gap:`${t.name_icon_gap||4}px`}))}
                >
                  ${c?V`
                        <div style=${this.styleObjectToCss(x)}>
                          <ha-icon
                            icon="${m||"mdi:help-circle"}"
                            style="
                      color: ${g||"var(--secondary-text-color)"};
                      font-size: ${Number(d?t.active_icon_size||t.icon_size:t.inactive_icon_size||t.icon_size)||24}px;
                      --mdc-icon-size: ${Number(d?t.active_icon_size||t.icon_size:t.inactive_icon_size||t.icon_size)||24}px;
                      width: ${Number(d?t.active_icon_size||t.icon_size:t.inactive_icon_size||t.icon_size)||24}px;
                      height: ${Number(d?t.active_icon_size||t.icon_size:t.inactive_icon_size||t.icon_size)||24}px;
                    "
                          ></ha-icon>
                        </div>
                      `:""}
                  ${p?V`
                        <div
                          class="icon-name"
                          style="
                      font-size: ${t.text_size||12}px;
                        color: ${h||"var(--primary-text-color)"};
                      text-align: center;
                      line-height: 1.2;
                        max-width: 80px;
                      word-wrap: break-word;
                    "
                        >
                          ${b}
                        </div>
                      `:""}
                  ${u?V`
                        <div
                          class="icon-state"
                          style="
                      font-size: ${Math.max((t.text_size||12)-2,10)}px;
                        color: ${v||"var(--secondary-text-color)"};
                      text-align: center;
                    "
                        >
                          ${f}
                        </div>
                      `:""}
                </div>
              `}))}
            ${o.icons.length>6?V`
                  <div
                    class="more-icons"
                    style="
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px;
                color: var(--secondary-text-color);
                font-size: 12px;
                font-style: italic;
              "
                  >
                    +${o.icons.length-6} more
                  </div>
                `:""}
          </div>
        </div>
      </div>
    `}validate(t){const e=t,o=[...super.validate(t).errors];return e.icons&&0!==e.icons.length||o.push("At least one icon is required"),e.icons.forEach(((t,e)=>{t.entity&&""!==t.entity.trim()||o.push(`Icon ${e+1}: Entity ID is required`),t.icon_inactive&&""!==t.icon_inactive.trim()||o.push(`Icon ${e+1}: Inactive icon is required`)})),{valid:0===o.length,errors:o}}getStyles(){return"\n      /* Hide unwanted form labels with underscores and slots */\n      [slot='label'] {\n        display: none !important;\n      }\n\n      ha-form .mdc-form-field > label,\n      ha-form .mdc-text-field > label,\n      ha-form .mdc-floating-label,\n      ha-form .mdc-notched-outline__leading,\n      ha-form .mdc-notched-outline__notch,\n      ha-form .mdc-notched-outline__trailing,\n      ha-form .mdc-floating-label--float-above,\n      ha-form label[for],\n      ha-form .ha-form-label,\n      ha-form .form-label {\n        display: none !important;\n      }\n\n      /* Hide any labels containing underscores */\n      ha-form label[data-label*='_'],\n      ha-form .label-text:contains('_'),\n      label:contains('_') {\n        display: none !important;\n      }\n\n      /* Additional safeguards for underscore labels */\n      ha-form .mdc-text-field-character-counter,\n      ha-form .mdc-text-field-helper-text,\n      ha-form mwc-formfield,\n      ha-form .formfield {\n        display: none !important;\n      }\n\n      /* Hide form field labels that match underscore patterns */\n      ha-form[data-field*='_'] label,\n      ha-form[data-field*='_'] .mdc-floating-label,\n      ha-form[data-field*='_'] .mdc-notched-outline__notch > .mdc-floating-label {\n        display: none !important;\n      }\n\n      /* Target specific underscore field names */\n      ha-form[data-field='use_entity_color_for_icon'] label,\n      ha-form[data-field='use_entity_color_for_icon_background'] label,\n      ha-form[data-field='show_name_when_active'] label,\n      ha-form[data-field='show_state_when_active'] label,\n      ha-form[data-field='show_icon_when_active'] label,\n      ha-form[data-field='show_name_when_inactive'] label,\n      ha-form[data-field='show_state_when_inactive'] label,\n      ha-form[data-field='show_icon_when_inactive'] label,\n      ha-form[data-field='active_template_mode'] label,\n      ha-form[data-field='inactive_template_mode'] label,\n      ha-form[data-field='dynamic_icon_template_mode'] label,\n      ha-form[data-field='dynamic_color_template_mode'] label {\n        display: none !important;\n      }\n\n      /* Hide any element with underscore in text content */\n      *:not(script):not(style) {\n        text-decoration: none !important;\n      }\n      \n      /* Target elements that might show underscore text */\n      .mdc-form-field__label:contains('_'),\n      .mdc-text-field__input + label:contains('_'),\n      .mdc-select__selected-text:contains('_') {\n        display: none !important;\n      }\n\n      .icon-module-preview {\n        padding: 8px;\n        min-height: 60px;\n      }\n      \n      .icon-grid {\n        width: 100%;\n      }\n      \n      .icon-item-preview:hover {\n        background: var(--primary-color) !important;\n        color: white;\n        transform: scale(1.05);\n      }\n      \n      .icon-item-preview:hover ha-icon {\n        color: white !important;\n      }\n      \n      .icon-item-preview:hover .icon-name,\n      .icon-item-preview:hover .icon-state {\n        color: white !important;\n      }\n      \n      /* Field styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n        color: var(--primary-text-color) !important;\n        margin-bottom: 4px !important;\n        display: block !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        display: block !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      .settings-section {\n        margin-bottom: 16px;\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Conditional Fields Grouping CSS */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n      }\n\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      @keyframes slideInFromLeft {\n        from { \n          opacity: 0; \n          transform: translateX(-10px); \n        }\n        to { \n          opacity: 1; \n          transform: translateX(0); \n        }\n      }\n\n      /* Expandable details styling */\n      details > summary {\n        list-style: none;\n      }\n\n      details > summary::-webkit-details-marker {\n        display: none;\n      }\n\n      details[open] > summary ha-icon {\n        transform: rotate(90deg);\n      }\n\n      details > summary:hover {\n        background: rgba(var(--rgb-primary-color), 0.1) !important;\n      }\n\n      /* Icon animations */\n      .icon-animation-pulse {\n        animation: iconPulse 2s ease-in-out infinite;\n      }\n\n      .icon-animation-spin {\n        animation: iconSpin 2s linear infinite;\n      }\n\n      .icon-animation-bounce {\n        animation: iconBounce 1s ease-in-out infinite;\n      }\n\n      .icon-animation-flash {\n        animation: iconFlash 1s ease-in-out infinite;\n      }\n\n      .icon-animation-shake {\n        animation: iconShake 0.5s ease-in-out infinite;\n      }\n\n      @keyframes iconPulse {\n        0%, 100% { opacity: 1; transform: scale(1); }\n        50% { opacity: 0.7; transform: scale(1.1); }\n      }\n\n      @keyframes iconSpin {\n        from { transform: rotate(0deg); }\n        to { transform: rotate(360deg); }\n      }\n\n      @keyframes iconBounce {\n        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }\n        40% { transform: translateY(-10px); }\n        60% { transform: translateY(-5px); }\n      }\n\n      @keyframes iconFlash {\n        0%, 50%, 100% { opacity: 1; }\n        25%, 75% { opacity: 0.3; }\n      }\n\n      @keyframes iconShake {\n        0%, 100% { transform: translateX(0); }\n        10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }\n        20%, 40%, 60%, 80% { transform: translateX(2px); }\n      }\n\n      /* Add icon button styling */\n      .add-icon-btn:hover {\n        background: var(--primary-color);\n        color: white;\n      }\n      \n      /* Remove icon button styling */\n      .remove-icon-btn:disabled {\n        opacity: 0.3;\n        cursor: not-allowed;\n      }\n\n      /* Icon picker specific styling */\n      ha-icon-picker {\n        --ha-icon-picker-width: 100%;\n        --ha-icon-picker-height: 56px;\n      }\n\n      /* Text field and select consistency */\n      ha-textfield,\n      ha-select {\n        --mdc-shape-small: 8px;\n        --mdc-theme-primary: var(--primary-color);\n      }\n\n      /* Grid styling for layout options */\n      .settings-section[style*=\"grid\"] > div {\n        min-width: 0;\n      }\n\n      /* Responsive adjustments */\n      @media (max-width: 768px) {\n        .settings-section[style*=\"grid-template-columns: 1fr 1fr 1fr\"] {\n          grid-template-columns: 1fr !important;\n          gap: 12px !important;\n        }\n\n        .settings-section[style*=\"grid-template-columns: 1fr 1fr\"] {\n          grid-template-columns: 1fr !important;\n          gap: 12px !important;\n        }\n\n        .conditional-fields-group {\n          border-left-width: 3px;\n        }\n        \n        .conditional-fields-header {\n          padding: 10px 12px;\n          font-size: 13px;\n        }\n        \n        .conditional-fields-content {\n        padding: 12px;\n        }\n      }\n\n      /* Ensure form elements don't overflow */\n      .settings-section ha-form {\n        max-width: 100%;\n        overflow: visible;\n      }\n\n      /* Color picker adjustments */\n      .settings-section ha-form[data-field*=\"color\"] {\n        min-height: 56px;\n      }\n\n      /* Boolean toggle adjustments */\n      .settings-section ha-form[data-field*=\"mode\"] {\n        display: flex;\n        align-items: center;\n        min-height: auto;\n      }\n\n      /* Number slider adjustments */\n      .settings-section ha-form[data-field*=\"size\"] .mdc-slider,\n      .settings-section ha-form[data-field*=\"gap\"] .mdc-slider,\n      .settings-section ha-form[data-field*=\"columns\"] .mdc-slider {\n        width: 100%;\n        max-width: 100%;\n      }\n\n      /* Gap control styles */\n      .gap-control-container {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n\n      .gap-slider {\n        flex: 1;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .gap-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider:hover {\n        background: var(--primary-color);\n        opacity: 0.7;\n      }\n\n      .gap-slider:hover::-webkit-slider-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-slider:hover::-moz-range-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-input {\n        width: 50px !important;\n        max-width: 50px !important;\n        min-width: 50px !important;\n        padding: 4px 6px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n      }\n\n      .gap-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      .reset-btn {\n        width: 36px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n\n      .reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .reset-btn ha-icon {\n        font-size: 16px;\n      }\n    "}_addIcon(t,e){const o={id:this.generateId("icon-item"),entity:"weather.forecast_home",name:"Forecast",icon_inactive:"mdi:weather-partly-cloudy",icon_active:"mdi:weather-partly-cloudy",inactive_state:"off",active_state:"on",custom_inactive_state_text:"",custom_active_state_text:"",custom_inactive_name_text:"",custom_active_name_text:"",inactive_template_mode:!1,inactive_template:"",active_template_mode:!1,active_template:"",use_entity_color_for_icon:!1,color_inactive:"var(--secondary-text-color)",color_active:"var(--primary-color)",inactive_icon_color:"var(--secondary-text-color)",active_icon_color:"var(--primary-color)",inactive_name_color:"var(--primary-text-color)",active_name_color:"var(--primary-text-color)",inactive_state_color:"var(--secondary-text-color)",active_state_color:"var(--secondary-text-color)",show_name_when_inactive:!0,show_state_when_inactive:!0,show_icon_when_inactive:!0,show_name_when_active:!0,show_state_when_active:!0,show_icon_when_active:!0,show_state:!0,show_name:!0,icon_size:24,text_size:12,name_icon_gap:4,active_icon_size:24,inactive_icon_size:24,icon_background:"none",use_entity_color_for_icon_background:!1,icon_background_color:"transparent",active_icon_background:"none",inactive_icon_background:"none",active_icon_background_color:"transparent",inactive_icon_background_color:"transparent",inactive_icon_animation:"none",active_icon_animation:"none",show_units:!1,vertical_alignment:"center",container_width:void 0,container_background_shape:"none",tap_action:{action:"toggle"},hold_action:{action:"default"},double_tap_action:{action:"default"},click_action:"toggle",double_click_action:"none",hold_action_legacy:"none",navigation_path:"",url:"",service:"",service_data:{},template_mode:!1,template:"",dynamic_icon_template_mode:!1,dynamic_icon_template:"",dynamic_color_template_mode:!1,dynamic_color_template:""};e({icons:[...t.icons,o]})}_removeIcon(t,e,o){if(t.icons.length<=1)return;const i=t.icons.filter(((t,o)=>o!==e));o({icons:i})}_updateIcon(t,e,o,i){const n=t.icons.map(((t,i)=>i===e?Object.assign(Object.assign({},t),o):t));i({icons:n})}getBackgroundImageCSS(t,e){var o,i;if(!t.background_image_type||"none"===t.background_image_type)return"none";switch(t.background_image_type){case"upload":case"url":if(t.background_image)return`url("${t.background_image}")`;break;case"entity":if(t.background_image_entity&&(null==e?void 0:e.states[t.background_image_entity])){const n=e.states[t.background_image_entity];let a="";if((null===(o=n.attributes)||void 0===o?void 0:o.entity_picture)?a=n.attributes.entity_picture:(null===(i=n.attributes)||void 0===i?void 0:i.image)?a=n.attributes.image:n.state&&"string"==typeof n.state&&(n.state.startsWith("/")||n.state.startsWith("http"))&&(a=n.state),a)return a.startsWith("/local/")||a.startsWith("/media/")||a.startsWith("/"),`url("${a}")`}}return"none"}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${t.replace(/[A-Z]/g,(t=>`-${t.toLowerCase()}`))}: ${e}`)).join("; ")}addPixelUnit(t){return t?/^\d+$/.test(t)?`${t}px`:/^[\d\s]+$/.test(t)?t.split(" ").map((t=>t.trim()?`${t}px`:t)).join(" "):t:t}}class Bt{static getInstance(){return Bt.instance||(Bt.instance=new Bt),Bt.instance}setHass(t){this.hass=t}async executeAction(t){if(this.hass&&t.action_type&&"none"!==t.action_type)try{if(t.confirmation&&!confirm(t.confirmation.text||"Are you sure?"))return;switch(t.action_type){case"toggle":t.entity&&await this.hass.callService("homeassistant","toggle",{entity_id:t.entity});break;case"show_more_info":if(t.entity){const e=new CustomEvent("hass-more-info",{detail:{entityId:t.entity},bubbles:!0,composed:!0});document.dispatchEvent(e)}break;case"navigate":if(t.navigation_path){history.pushState(null,"",t.navigation_path);const e=new CustomEvent("location-changed",{detail:{replace:!1},bubbles:!0,composed:!0});window.dispatchEvent(e)}break;case"url":if(t.url||t.url_path){const e=t.url||t.url_path||"";window.open(e,"_blank")}break;case"call_service":if(t.service){const[e,o]=t.service.split(".");e&&o&&await this.hass.callService(e,o,t.service_data,t.target)}break;case"perform_action":if(t.custom_action){const e=new CustomEvent("action",{detail:{action:"tap",config:t.custom_action},bubbles:!0,composed:!0});document.dispatchEvent(e)}break;case"show_map":if(t.latitude&&t.longitude){const e=`/map?latitude=${t.latitude}&longitude=${t.longitude}`;history.pushState(null,"",e);const o=new CustomEvent("location-changed",{detail:{replace:!1},bubbles:!0,composed:!0});window.dispatchEvent(o)}break;case"voice_assistant":if(!1!==t.start_listening){const t=new CustomEvent("hass-start-voice-conversation",{bubbles:!0,composed:!0});document.dispatchEvent(t)}break;case"trigger":t.entity&&await this.hass.callService("automation","trigger",{entity_id:t.entity});break;default:console.warn("Unknown action type:",t.action_type)}}catch(t){console.error("Error executing action:",t)}}getActionTypeOptions(){return[{value:"none",label:"No Action"},{value:"toggle",label:"Toggle"},{value:"show_more_info",label:"Show More Info"},{value:"navigate",label:"Navigate to Path"},{value:"url",label:"Open URL"},{value:"call_service",label:"Call Service"},{value:"perform_action",label:"Perform Action"},{value:"show_map",label:"Show Map"},{value:"voice_assistant",label:"Voice Assistant"},{value:"trigger",label:"Trigger"}]}validateAction(t){const e=[];if(!t.action_type||"none"===t.action_type)return{valid:!0,errors:[]};switch(t.action_type){case"toggle":case"show_more_info":case"trigger":t.entity||e.push("Entity is required for this action type");break;case"navigate":t.navigation_path||e.push("Navigation path is required");break;case"url":t.url||t.url_path||e.push("URL is required");break;case"call_service":t.service?t.service.includes(".")||e.push("Service must be in domain.service format"):e.push("Service is required");break;case"show_map":void 0!==t.latitude&&void 0!==t.longitude||e.push("Latitude and longitude are required for map action")}return{valid:0===e.length,errors:e}}renderActionForm(t,e,o){return{action:e,actionTypes:this.getActionTypeOptions(),onUpdate:o,validate:()=>this.validateAction(e)}}}const Ht=Bt.getInstance();class Vt extends ht{constructor(){super(...arguments),this.metadata={type:"button",title:"Button",description:"Interactive buttons with actions",author:"WJD Designs",version:"1.0.0",icon:"mdi:gesture-tap-button",category:"interactive",tags:["button","action","click","interactive"]}}createDefault(t){return{id:t||this.generateId("button"),type:"button",label:"Click Me",action:{action_type:"none"},style:"flat",alignment:"center",icon:"",icon_position:"before",show_icon:!1,background_color:"var(--primary-color)",text_color:"white"}}getButtonStyles(){return[{value:"flat",label:"Flat (Default)"},{value:"glossy",label:"Glossy"},{value:"embossed",label:"Embossed"},{value:"inset",label:"Inset"},{value:"gradient-overlay",label:"Gradient Overlay"},{value:"neon-glow",label:"Neon Glow"},{value:"outline",label:"Outline"},{value:"glass",label:"Glass"},{value:"metallic",label:"Metallic"},{value:"neumorphic",label:"Neumorphic"},{value:"dashed",label:"Dashed"}]}getAlignmentOptions(){return[{value:"left",label:"Left"},{value:"center",label:"Center"},{value:"right",label:"Right"},{value:"justify",label:"Full Width"}]}getIconPositionOptions(){return[{value:"before",label:"Before Text"},{value:"after",label:"After Text"}]}renderGeneralTab(t,e,o,i){const n=t;return V`
      ${bt.injectCleanFormStyles()}
      <div class="button-module-settings">
        <!-- Button Label Section -->
        <div class="settings-section" style="margin-bottom: 16px;">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin-bottom: 16px;"
          >
            Button Label
          </div>

          ${bt.renderField("Button Text","The text displayed on the button",e,{label:n.label||"Click Me"},[bt.createSchemaItem("label",{text:{}})],(t=>i({label:t.detail.value.label})))}
        </div>

        <!-- Link Action Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin-bottom: 16px;"
          >
            Link Action
          </div>

          ${this.renderLinkActionForm(n.action||{action_type:"none"},e,(t=>i({action:t})))}
        </div>

        <!-- Button Style Section -->
        <div class="settings-section" style="margin-bottom: 16px;">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin-bottom: 16px;"
          >
            Style
          </div>

          ${bt.renderField("Button Style","Choose the visual style of the button",e,{style:n.style||"flat"},[bt.createSchemaItem("style",{select:{options:this.getButtonStyles(),mode:"dropdown"}})],(t=>i({style:t.detail.value.style})))}
        </div>

        <!-- Background Color Section -->
        <div class="settings-section" style="margin-bottom: 16px;">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin-bottom: 16px;"
          >
            Colors
          </div>

          <div
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;"
          >
            <ultra-color-picker
              .label=${"Background Color"}
              .value=${n.background_color||"var(--primary-color)"}
              .defaultValue=${"var(--primary-color)"}
              .hass=${e}
              @value-changed=${t=>i({background_color:t.detail.value})}
            ></ultra-color-picker>

            <ultra-color-picker
              .label=${"Text Color"}
              .value=${n.text_color||"white"}
              .defaultValue=${"white"}
              .hass=${e}
              @value-changed=${t=>i({text_color:t.detail.value})}
            ></ultra-color-picker>
          </div>

          <div style="margin-top: 8px;">
            <small style="color: var(--secondary-text-color); font-style: italic;">
              Note: Global design properties will override these colors if set in the Design tab
            </small>
          </div>
        </div>

        <!-- Alignment Section -->
        <div class="settings-section" style="margin-bottom: 16px;">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin-bottom: 16px;"
          >
            Alignment
          </div>

          <div style="display: flex; gap: 8px; justify-content: flex-start; flex-wrap: wrap;">
            ${this.getAlignmentOptions().map((t=>V`
                <button
                  type="button"
                  style="padding: 8px 12px; border: 2px solid ${(n.alignment||"center")===t.value?"var(--primary-color)":"var(--divider-color)"}; background: ${(n.alignment||"center")===t.value?"var(--primary-color)":"transparent"}; color: ${(n.alignment||"center")===t.value?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                  @click=${()=>i({alignment:t.value})}
                >
                  <ha-icon
                    icon="mdi:format-align-${"justify"===t.value?"center":t.value}"
                    style="font-size: 16px; flex-shrink: 0;"
                  ></ha-icon>
                  <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                    >${t.label}</span
                  >
                </button>
              `))}
          </div>
        </div>

        <!-- Icon Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div class="field-group" style="margin-bottom: 16px;">
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; color: var(--primary-color);"
            >
              Icon
            </div>
            ${bt.renderField("Show Icon","Display an icon alongside the button text",e,{show_icon:n.show_icon||!1},[bt.createSchemaItem("show_icon",{boolean:{}})],(t=>i({show_icon:t.detail.value.show_icon})))}
          </div>

          ${n.show_icon?V`
                <div class="field-group" style="margin-bottom: 16px;">
                  ${bt.renderField("Icon","Choose an icon for the button",e,{icon:n.icon||""},[bt.createSchemaItem("icon",{icon:{}})],(t=>i({icon:t.detail.value.icon})))}
                </div>

                <div class="field-group">
                  <div class="field-title" style="margin-bottom: 8px;">Icon Position</div>
                  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${this.getIconPositionOptions().map((t=>V`
                        <button
                          type="button"
                          style="padding: 8px 12px; border: 2px solid ${(n.icon_position||"before")===t.value?"var(--primary-color)":"var(--divider-color)"}; background: ${(n.icon_position||"before")===t.value?"var(--primary-color)":"transparent"}; color: ${(n.icon_position||"before")===t.value?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; flex: 1; min-width: 0; box-sizing: border-box; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                          @click=${()=>i({icon_position:t.value})}
                        >
                          ${t.label}
                        </button>
                      `))}
                  </div>
                </div>
              `:V`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  Enable the toggle above to configure icon settings
                </div>
              `}
        </div>
      </div>
    `}renderLinkActionForm(t,e,o){const i=Ht.getActionTypeOptions();return V`
      <div class="link-action-form">
        <!-- Action Type -->
        <div class="field-group" style="margin-bottom: 16px;">
          ${bt.renderField("Action Type","Choose what happens when the button is clicked",e,{action_type:t.action_type||"none"},[bt.createSchemaItem("action_type",{select:{options:i,mode:"dropdown"}})],(e=>o(Object.assign(Object.assign({},t),{action_type:e.detail.value.action_type}))))}
        </div>

        ${this.renderActionTypeSpecificFields(t,e,o)}
      </div>
    `}renderActionTypeSpecificFields(t,e,o){switch(t.action_type){case"toggle":case"show_more_info":case"trigger":return bt.renderField("Entity","Select the entity to interact with",e,{entity:t.entity||""},[bt.createSchemaItem("entity",{entity:{}})],(e=>o(Object.assign(Object.assign({},t),{entity:e.detail.value.entity}))));case"navigate":return bt.renderField("Navigation Path","Path to navigate to (e.g., /dashboard/energy)",e,{navigation_path:t.navigation_path||""},[bt.createSchemaItem("navigation_path",{text:{}})],(e=>o(Object.assign(Object.assign({},t),{navigation_path:e.detail.value.navigation_path}))));case"url":return bt.renderField("URL","URL to open (e.g., https://example.com)",e,{url:t.url||""},[bt.createSchemaItem("url",{text:{}})],(e=>o(Object.assign(Object.assign({},t),{url:e.detail.value.url}))));case"call_service":return V`
          <div class="field-group" style="margin-bottom: 16px;">
            ${bt.renderField("Service","Service to call (e.g., light.turn_on)",e,{service:t.service||""},[bt.createSchemaItem("service",{text:{}})],(e=>o(Object.assign(Object.assign({},t),{service:e.detail.value.service}))))}
          </div>

          <div class="field-group">
            ${bt.renderField("Service Data (JSON)","Additional data for the service call in JSON format",e,{service_data:JSON.stringify(t.service_data||{},null,2)},[bt.createSchemaItem("service_data",{text:{multiline:!0}})],(e=>{try{const i=JSON.parse(e.detail.value.service_data||"{}");o(Object.assign(Object.assign({},t),{service_data:i}))}catch(t){console.warn("Invalid JSON in service data")}}))}
          </div>
        `;case"show_map":return V`
          <div class="field-group" style="margin-bottom: 16px;">
            ${bt.renderField("Latitude","Latitude coordinate for the map location",e,{latitude:t.latitude||0},[bt.createSchemaItem("latitude",{number:{min:-90,max:90,step:1e-6}})],(e=>o(Object.assign(Object.assign({},t),{latitude:e.detail.value.latitude}))))}
          </div>

          <div class="field-group">
            ${bt.renderField("Longitude","Longitude coordinate for the map location",e,{longitude:t.longitude||0},[bt.createSchemaItem("longitude",{number:{min:-180,max:180,step:1e-6}})],(e=>o(Object.assign(Object.assign({},t),{longitude:e.detail.value.longitude}))))}
          </div>
        `;default:return V``}}renderPreview(t,e){const o=t,i=o,n={backgroundColor:i.background_color||o.background_color||"var(--primary-color)",textColor:i.color||o.text_color||"white",fontSize:i.font_size?`${i.font_size}px`:"14px",fontFamily:i.font_family||"inherit",fontWeight:i.font_weight||"500",fontStyle:i.font_style||"normal",textTransform:i.text_transform||"none",textShadow:this.getTextShadowCSS(i)},a=this.getButtonStyleCSS(o.style||"flat",n.backgroundColor,n.textColor,n.fontSize,n.fontFamily,n.fontWeight,n.textTransform,n.fontStyle,n.textShadow),r=this.getAlignmentCSS(o.alignment||"center"),l={padding:i.padding_top||i.padding_bottom||i.padding_left||i.padding_right?`${i.padding_top||"0"}px ${i.padding_right||"0"}px ${i.padding_bottom||"0"}px ${i.padding_left||"0"}px`:"0",margin:i.margin_top||i.margin_bottom||i.margin_left||i.margin_right?`${i.margin_top||"0"}px ${i.margin_right||"0"}px ${i.margin_bottom||"0"}px ${i.margin_left||"0"}px`:"0",background:i.background_color&&i.background_color!==n.backgroundColor?i.background_color:"transparent",backgroundImage:this.getBackgroundImageCSS(i,e),backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",border:i.border_style&&"none"!==i.border_style?`${i.border_width||"1px"} ${i.border_style} ${i.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(i.border_radius)||"0",position:i.position||"relative",top:i.top||"auto",bottom:i.bottom||"auto",left:i.left||"auto",right:i.right||"auto",zIndex:i.z_index||"auto",width:i.width||"100%",height:i.height||"auto",maxWidth:i.max_width||"100%",maxHeight:i.max_height||"none",minWidth:i.min_width||"none",minHeight:i.min_height||"auto",overflow:i.overflow||"visible",clipPath:i.clip_path||"none",backdropFilter:i.backdrop_filter||"none",boxShadow:i.box_shadow_h&&i.box_shadow_v?`${i.box_shadow_h||"0"} ${i.box_shadow_v||"0"} ${i.box_shadow_blur||"0"} ${i.box_shadow_spread||"0"} ${i.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"};return V`
      <div class="button-module-container" style=${this.styleObjectToCss(l)}>
        <div class="button-module-preview" style="${r}">
          <button
            class="ultra-button ${o.style||"flat"} ${"justify"===o.alignment?"justify":""}"
            style="${a} ${"justify"===o.alignment?"width: 100%;":""}"
            @click=${()=>{o.action&&(Ht.setHass(e),Ht.executeAction(o.action))}}
          >
            ${o.show_icon&&o.icon&&"before"===o.icon_position?V`<ha-icon
                  icon="${o.icon}"
                  style="margin-right: 8px; color: inherit;"
                ></ha-icon>`:""}
            ${o.label||"Click Me"}
            ${o.show_icon&&o.icon&&"after"===o.icon_position?V`<ha-icon
                  icon="${o.icon}"
                  style="margin-left: 8px; color: inherit;"
                ></ha-icon>`:""}
          </button>
        </div>
      </div>
    `}getButtonStyleCSS(t,e="var(--primary-color)",o="white",i="14px",n="inherit",a="500",r="none",l="normal",s="none"){const d=`\n      padding: 12px 24px;\n      border-radius: 6px;\n      border: none;\n      cursor: pointer;\n      font-size: ${i};\n      font-family: ${n};\n      font-weight: ${a};\n      font-style: ${l};\n      text-transform: ${r};\n      text-shadow: ${s};\n      transition: all 0.2s ease;\n      display: inline-flex;\n      align-items: center;\n      justify-content: center;\n      min-height: 40px;\n      text-decoration: none;\n      background: ${e};\n      color: ${o};\n    `;let c="",p="";switch(t){case"flat":c="box-shadow: none;";break;case"glossy":p=`\n          background: linear-gradient(to bottom, ${e}, ${e} 50%, rgba(0,0,0,0.1) 51%, ${e}) !important;\n          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);\n        `;break;case"embossed":c="\n          box-shadow: inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.8);\n          border: 1px solid rgba(0,0,0,0.1);\n        ",p="\n          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1);\n        ";break;case"inset":c="\n          box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);\n          border: 1px solid rgba(0,0,0,0.2);\n        ";break;case"gradient-overlay":p=`\n          background: linear-gradient(to bottom, \n            ${e} 0%, \n            rgba(255,255,255,0) 100%\n          ) !important;\n        `;break;case"neon-glow":p=`\n          box-shadow: 0 0 10px ${e}, 0 0 20px ${e}, 0 0 30px ${e};\n          filter: brightness(1.2);\n        `,c="\n          box-shadow: inset 0 0 10px rgba(0,0,0,0.5);\n        ";break;case"outline":c=`\n          border: 2px solid ${e};\n          background-color: transparent !important;\n          color: ${e} !important;\n        `;break;case"glass":c="\n          backdrop-filter: blur(10px);\n          background-color: rgba(255,255,255,0.1) !important;\n          border: 1px solid rgba(255,255,255,0.2);\n        ",p="\n          backdrop-filter: blur(5px);\n          background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1)) !important;\n        ";break;case"metallic":p=`\n          background: linear-gradient(to bottom, \n            rgba(255,255,255,0.4) 0%, \n            ${e} 20%, \n            ${e} 80%, \n            rgba(0,0,0,0.2) 100%) !important;\n          box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.3);\n        `;break;case"neumorphic":c="\n          box-shadow: inset 2px 2px 4px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(255,255,255,0.1);\n        ",p="\n          box-shadow: 2px 2px 4px rgba(0,0,0,0.1), -2px -2px 4px rgba(255,255,255,0.1);\n        ";break;case"dashed":c=`\n          border: 2px dashed ${e};\n          background-color: transparent !important;\n          color: ${e} !important;\n        `}return`${d} ${c} ${p}`}getAlignmentCSS(t){switch(t){case"left":return"display: flex; justify-content: flex-start;";case"center":default:return"display: flex; justify-content: center;";case"right":return"display: flex; justify-content: flex-end;";case"justify":return"display: flex; width: 100%;"}}validate(t){const e=t,o=[...super.validate(t).errors];if(e.label&&""!==e.label.trim()||o.push("Button label is required"),e.action){const t=Ht.validateAction(e.action);o.push(...t.errors)}return{valid:0===o.length,errors:o}}getTextShadowCSS(t){return t.text_shadow_h||t.text_shadow_v||t.text_shadow_blur||t.text_shadow_color?`${t.text_shadow_h||"0px"} ${t.text_shadow_v||"0px"} ${t.text_shadow_blur||"0px"} ${t.text_shadow_color||"rgba(0,0,0,0.5)"}`:"none"}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${this.camelToKebab(t)}: ${e}`)).join("; ")}camelToKebab(t){return t.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}getBackgroundImageCSS(t,e){var o,i;if(!t.background_image_type||"none"===t.background_image_type)return"none";switch(t.background_image_type){case"upload":case"url":if(t.background_image)return`url("${t.background_image}")`;break;case"entity":if(t.background_image_entity&&(null==e?void 0:e.states[t.background_image_entity])){const n=e.states[t.background_image_entity];let a="";if((null===(o=n.attributes)||void 0===o?void 0:o.entity_picture)?a=n.attributes.entity_picture:(null===(i=n.attributes)||void 0===i?void 0:i.image)?a=n.attributes.image:n.state&&"string"==typeof n.state&&(n.state.startsWith("/")||n.state.startsWith("http"))&&(a=n.state),a)return`url("${a}")`}}return"none"}addPixelUnit(t){return t?/^\d+$/.test(t)?`${t}px`:/^[\d\s]+$/.test(t)?t.split(" ").map((t=>t.trim()?`${t}px`:t)).join(" "):t:t}getStyles(){return"\n      .button-module-preview {\n        width: 100%;\n        box-sizing: border-box;\n      }\n      \n      .ultra-button:hover {\n        transform: translateY(-1px);\n        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);\n      }\n      \n      .ultra-button:active {\n        transform: translateY(0);\n      }\n      \n      .ultra-button.justify {\n        width: 100%;\n      }\n    "}}class Gt extends ht{constructor(){super(...arguments),this.metadata={type:"markdown",title:"Markdown Module",description:"Display rich markdown content",author:"WJD Designs",version:"1.0.0",icon:"mdi:language-markdown",category:"content",tags:["markdown","content","rich-text","formatting","template"]}}createDefault(t){return{id:t||this.generateId("markdown"),type:"markdown",markdown_content:"# Welcome to Markdown\n\nThis is a **markdown** module that supports:\n\n- *Italic* and **bold** text\n- [Links](https://example.com)\n- `inline code`\n- Lists and more!\n\n## Features\n1. Headers (H1-H6)\n2. Tables\n3. Code blocks\n4. And much more...\n\n> This is a blockquote example",link:"",hide_if_no_link:!1,template_mode:!1,template:"",enable_html:!1,enable_tables:!0,enable_code_highlighting:!0,max_height:"none",overflow_behavior:"visible"}}renderGeneralTab(t,e,o,i){const n=t;return V`
      <div class="module-general-settings">
        <!-- Content Section -->
        <div class="wpbakery-section">
          <h4>Markdown Content</h4>
          <div class="ha-form-field">
            <ha-form
              .hass=${e}
              .data=${{markdown_content:n.markdown_content||""}}
              .schema=${[{name:"markdown_content",label:"Content",description:"Enter your markdown content with full formatting support",selector:{text:{multiline:!0}}}]}
              .computeLabel=${t=>t.label||t.name}
              .computeDescription=${t=>t.description||""}
              @value-changed=${t=>i({markdown_content:t.detail.value.markdown_content})}
            ></ha-form>
          </div>
        </div>

        <!-- Link & Behavior Section -->
        <div class="wpbakery-section">
          <h4>Link & Behavior</h4>
          <div class="two-column-grid">
            <div class="ha-form-field">
              <ha-form
                .hass=${e}
                .data=${{link:n.link||""}}
                .schema=${[{name:"link",label:"Link URL",description:"Optional URL to make the markdown clickable",selector:{text:{}}}]}
                .computeLabel=${t=>t.label||t.name}
                .computeDescription=${t=>t.description||""}
                @value-changed=${t=>i({link:t.detail.value.link})}
              ></ha-form>
            </div>
            <div class="ha-form-field">
              <ha-form
                .hass=${e}
                .data=${{hide_if_no_link:n.hide_if_no_link||!1}}
                .schema=${[{name:"hide_if_no_link",label:"Hide if No Link",description:"Hide module when no link is provided",selector:{boolean:{}}}]}
                .computeLabel=${t=>t.label||t.name}
                .computeDescription=${t=>t.description||""}
                @value-changed=${t=>i({hide_if_no_link:t.detail.value.hide_if_no_link})}
              ></ha-form>
            </div>
          </div>
        </div>

        <!-- Display Options Section -->
        <div class="wpbakery-section">
          <h4>Display Options</h4>
          <div class="two-column-grid">
            <div class="ha-form-field">
              <ha-form
                .hass=${e}
                .data=${{max_height:n.max_height||"none"}}
                .schema=${[{name:"max_height",label:"Max Height",description:"Maximum height (e.g., 300px, 50vh, none)",selector:{text:{}}}]}
                .computeLabel=${t=>t.label||t.name}
                .computeDescription=${t=>t.description||""}
                @value-changed=${t=>i({max_height:t.detail.value.max_height})}
              ></ha-form>
            </div>
            <div class="ha-form-field">
              <ha-form
                .hass=${e}
                .data=${{overflow_behavior:n.overflow_behavior||"visible"}}
                .schema=${[{name:"overflow_behavior",label:"Overflow Behavior",selector:{select:{options:[{value:"visible",label:"Visible"},{value:"scroll",label:"Scroll"},{value:"hidden",label:"Hidden"}],mode:"dropdown"}}}]}
                .computeLabel=${t=>t.label||t.name}
                @value-changed=${t=>i({overflow_behavior:t.detail.value.overflow_behavior})}
              ></ha-form>
            </div>
          </div>

          <!-- Feature Toggles -->
          <div class="three-column-grid">
            <ha-form
              .hass=${e}
              .data=${{enable_html:n.enable_html||!1}}
              .schema=${[{name:"enable_html",label:"Enable HTML",description:"Allow HTML tags in markdown",selector:{boolean:{}}}]}
              .computeLabel=${t=>t.label||t.name}
              .computeDescription=${t=>t.description||""}
              @value-changed=${t=>i({enable_html:t.detail.value.enable_html})}
            ></ha-form>

            <ha-form
              .hass=${e}
              .data=${{enable_tables:!1!==n.enable_tables}}
              .schema=${[{name:"enable_tables",label:"Enable Tables",description:"Support for markdown tables",selector:{boolean:{}}}]}
              .computeLabel=${t=>t.label||t.name}
              .computeDescription=${t=>t.description||""}
              @value-changed=${t=>i({enable_tables:t.detail.value.enable_tables})}
            ></ha-form>

            <ha-form
              .hass=${e}
              .data=${{enable_code_highlighting:!1!==n.enable_code_highlighting}}
              .schema=${[{name:"enable_code_highlighting",label:"Code Highlighting",description:"Syntax highlighting for code blocks",selector:{boolean:{}}}]}
              .computeLabel=${t=>t.label||t.name}
              .computeDescription=${t=>t.description||""}
              @value-changed=${t=>i({enable_code_highlighting:t.detail.value.enable_code_highlighting})}
            ></ha-form>
          </div>
        </div>

        <!-- Template Mode Section -->
        <div class="wpbakery-section">
          <h4>Template Mode</h4>

          <ha-form
            .hass=${e}
            .data=${{template_mode:n.template_mode||!1}}
            .schema=${[{name:"template_mode",label:"Enable Template Mode",description:"Use Home Assistant Jinja2 templates for dynamic content",selector:{boolean:{}}}]}
            .computeLabel=${t=>t.label||t.name}
            .computeDescription=${t=>t.description||""}
            @value-changed=${t=>i({template_mode:t.detail.value.template_mode})}
          ></ha-form>

          ${n.template_mode?V`
                <div style="margin-top: 16px;">
                  <ha-form
                    .hass=${e}
                    .data=${{template:n.template||""}}
                    .schema=${[{name:"template",label:"Template",description:'Jinja2 template for dynamic content (e.g., {{ states("sensor.temperature") }}°C)',selector:{text:{multiline:!0}}}]}
                    .computeLabel=${t=>t.label||t.name}
                    .computeDescription=${t=>t.description||""}
                    @value-changed=${t=>i({template:t.detail.value.template})}
                  ></ha-form>
                </div>
              `:""}
        </div>
      </div>
    `}renderPreview(t,e){const o=t;if(o.hide_if_no_link&&(!o.link||""===o.link.trim()))return V`<div class="markdown-module-hidden">Hidden (no link)</div>`;const i=o,n={padding:i.padding_top||i.padding_bottom||i.padding_left||i.padding_right?`${i.padding_top||"8"}px ${i.padding_right||"0"}px ${i.padding_bottom||"8"}px ${i.padding_left||"0"}px`:"8px 0",margin:i.margin_top||i.margin_bottom||i.margin_left||i.margin_right?`${i.margin_top||"0"}px ${i.margin_right||"0"}px ${i.margin_bottom||"0"}px ${i.margin_left||"0"}px`:"0",background:i.background_color&&"transparent"!==i.background_color?i.background_color:"transparent",backgroundImage:this.getBackgroundImageCSS(i,e),backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",border:i.border_style&&"none"!==i.border_style?`${i.border_width||"1px"} ${i.border_style} ${i.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(i.border_radius)||"0",position:i.position||"static",top:i.top||"auto",bottom:i.bottom||"auto",left:i.left||"auto",right:i.right||"auto",zIndex:i.z_index||"auto",width:i.width||"100%",height:i.height||"auto",maxWidth:i.max_width||"100%",maxHeight:i.max_height||"none",minWidth:i.min_width||"none",minHeight:i.min_height||"auto",overflow:i.overflow||"hidden",clipPath:i.clip_path||"none",backdropFilter:i.backdrop_filter||"none",boxShadow:i.box_shadow_h&&i.box_shadow_v?`${i.box_shadow_h||"0"} ${i.box_shadow_v||"0"} ${i.box_shadow_blur||"0"} ${i.box_shadow_spread||"0"} ${i.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"},a={fontSize:i.font_size?`${i.font_size}px`:`${o.font_size||14}px`,fontFamily:i.font_family||o.font_family||"Roboto",color:i.color||o.color||"var(--primary-text-color)",textAlign:i.text_align||o.alignment||"left",lineHeight:i.line_height||o.line_height||1.6,letterSpacing:i.letter_spacing||o.letter_spacing||"normal",padding:i.padding_top||i.padding_bottom||i.padding_left||i.padding_right?`${i.padding_top||"8"}px ${i.padding_right||"0"}px ${i.padding_bottom||"8"}px ${i.padding_left||"0"}px`:"8px 0",maxHeight:o.max_height&&"none"!==o.max_height?o.max_height:"none",overflow:o.max_height&&"none"!==o.max_height&&o.overflow_behavior||"visible",textShadow:i.text_shadow_h&&i.text_shadow_v?`${i.text_shadow_h||"0"} ${i.text_shadow_v||"0"} ${i.text_shadow_blur||"0"} ${i.text_shadow_color||"rgba(0,0,0,0.5)"}`:"none",boxShadow:i.box_shadow_h&&i.box_shadow_v?`${i.box_shadow_h||"0"} ${i.box_shadow_v||"0"} ${i.box_shadow_blur||"0"} ${i.box_shadow_spread||"0"} ${i.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none"},r=o.template_mode&&o.template?`Template: ${o.template}`:(t=>{if(!t)return"";let e=t.replace(/^#{6} (.*$)/gim,"<h6>$1</h6>").replace(/^#{5} (.*$)/gim,"<h5>$1</h5>").replace(/^#{4} (.*$)/gim,"<h4>$1</h4>").replace(/^#{3} (.*$)/gim,"<h3>$1</h3>").replace(/^#{2} (.*$)/gim,"<h2>$1</h2>").replace(/^#{1} (.*$)/gim,"<h1>$1</h1>").replace(/\*\*\*(.*?)\*\*\*/g,"<strong><em>$1</em></strong>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>").replace(/`(.*?)`/g,"<code>$1</code>").replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>').replace(/^> (.*$)/gim,"<blockquote>$1</blockquote>").replace(/^---$/gim,"<hr>").replace(/^\*\*\*$/gim,"<hr>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br/>");return e="<p>"+e+"</p>",e=e.replace(/<p><\/p>/g,""),e=e.replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g,"$1"),e=e.replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/g,"$1"),e=e.replace(/<p>(<hr>)<\/p>/g,"$1"),e=e.replace(/^[-*+] (.*$)/gim,"<li>$1</li>"),e=e.replace(/^(\d+)\. (.*$)/gim,"<li>$2</li>"),e=e.replace(/(<li>[\s\S]*?<\/li>(?:\s*<li>[\s\S]*?<\/li>)*)/g,"<ul>$1</ul>"),e})(o.markdown_content||""),l=o.link&&""!==o.link.trim()?V`<a href="${o.link}" style="color: inherit; text-decoration: inherit;">
            <div class="markdown-content" .innerHTML=${r}></div>
          </a>`:V`<div class="markdown-content" .innerHTML=${r}></div>`;return V`
      <div class="markdown-module-container" style=${this.styleObjectToCss(n)}>
        <div class="markdown-module-preview" style=${this.styleObjectToCss(a)}>
          ${l}
        </div>
      </div>
    `}validate(t){const e=t,o=[...super.validate(t).errors];if(e.markdown_content&&""!==e.markdown_content.trim()||o.push("Markdown content is required"),e.font_size&&(e.font_size<1||e.font_size>200)&&o.push("Font size must be between 1 and 200 pixels"),e.link&&""!==e.link.trim())try{new URL(e.link)}catch(t){e.link.startsWith("/")||e.link.startsWith("#")||o.push('Link must be a valid URL or start with "/" for relative paths')}return{valid:0===o.length,errors:o}}getStyles(){return"\n      .markdown-module-preview {\n        min-height: 20px;\n        word-wrap: break-word;\n      }\n      \n      .markdown-module-hidden {\n        color: var(--secondary-text-color);\n        font-style: italic;\n        text-align: center;\n        padding: 12px;\n        background: var(--secondary-background-color);\n        border-radius: 4px;\n      }\n\n      .markdown-content {\n        width: 100%;\n      }\n      \n             /* Module-specific grid layouts */\n       .two-column-grid {\n         display: grid;\n         grid-template-columns: 1fr 1fr;\n         gap: 20px;\n         margin-bottom: 20px;\n       }\n\n       .three-column-grid {\n         display: grid;\n         grid-template-columns: 1fr 1fr 1fr;\n         gap: 16px;\n         margin-bottom: 20px;\n       }\n       \n       @media (max-width: 768px) {\n         .two-column-grid,\n         .three-column-grid {\n           grid-template-columns: 1fr;\n           gap: 16px;\n         }\n       }\n\n      .markdown-content h1,\n      .markdown-content h2,\n      .markdown-content h3,\n      .markdown-content h4,\n      .markdown-content h5,\n      .markdown-content h6 {\n        margin: 16px 0 8px 0;\n        font-weight: 600;\n        line-height: 1.2;\n      }\n\n      .markdown-content h1 { font-size: 2em; }\n      .markdown-content h2 { font-size: 1.5em; }\n      .markdown-content h3 { font-size: 1.25em; }\n      .markdown-content h4 { font-size: 1.1em; }\n      .markdown-content h5 { font-size: 1em; font-weight: 700; }\n      .markdown-content h6 { font-size: 0.9em; font-weight: 700; }\n\n      .markdown-content p {\n        margin: 8px 0;\n        line-height: inherit;\n      }\n\n      .markdown-content ul,\n      .markdown-content ol {\n        margin: 8px 0;\n        padding-left: 20px;\n      }\n\n      .markdown-content li {\n        margin: 4px 0;\n        line-height: inherit;\n      }\n\n      .markdown-content code {\n        background: var(--secondary-background-color);\n        padding: 2px 4px;\n        border-radius: 3px;\n        font-family: 'Courier New', monospace;\n        font-size: 0.9em;\n      }\n\n      .markdown-content blockquote {\n        border-left: 4px solid var(--primary-color);\n        margin: 16px 0;\n        padding: 8px 16px;\n        background: var(--secondary-background-color);\n        font-style: italic;\n      }\n\n      .markdown-content a {\n        color: var(--primary-color);\n        text-decoration: none;\n      }\n\n      .markdown-content a:hover {\n        text-decoration: underline;\n      }\n\n      .markdown-content strong {\n        font-weight: 600;\n      }\n\n      .markdown-content em {\n        font-style: italic;\n      }\n\n      .markdown-content br {\n        line-height: inherit;\n      }\n      \n      .markdown-content hr {\n        border: none;\n        border-top: 1px solid var(--divider-color);\n        margin: 16px 0;\n      }\n      \n      .markdown-content table {\n        border-collapse: collapse;\n        width: 100%;\n        margin: 16px 0;\n      }\n      \n      .markdown-content th,\n      .markdown-content td {\n        border: 1px solid var(--divider-color);\n        padding: 8px 12px;\n        text-align: left;\n      }\n      \n      .markdown-content th {\n        background: var(--secondary-background-color);\n        font-weight: 600;\n      }\n    "}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${this.camelToKebab(t)}: ${e}`)).join("; ")}camelToKebab(t){return t.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}getBackgroundImageCSS(t,e){var o,i;if(!t.background_image_type||"none"===t.background_image_type)return"none";switch(t.background_image_type){case"upload":case"url":if(t.background_image)return`url("${t.background_image}")`;break;case"entity":if(t.background_image_entity&&(null==e?void 0:e.states[t.background_image_entity])){const n=e.states[t.background_image_entity];let a="";if((null===(o=n.attributes)||void 0===o?void 0:o.entity_picture)?a=n.attributes.entity_picture:(null===(i=n.attributes)||void 0===i?void 0:i.image)?a=n.attributes.image:n.state&&"string"==typeof n.state&&(n.state.startsWith("/")||n.state.startsWith("http"))&&(a=n.state),a)return a.startsWith("/local/")||a.startsWith("/media/")||a.startsWith("/"),`url("${a}")`}}return"none"}addPixelUnit(t){return t?/^\d+$/.test(t)?`${t}px`:/^[\d\s]+$/.test(t)?t.split(" ").map((t=>t.trim()?`${t}px`:t)).join(" "):t:t}}class Wt extends ht{constructor(){super(...arguments),this.metadata={type:"horizontal",title:"Horizontal Layout",description:"Arrange modules in rows with flexible alignment and spacing",author:"WJD Designs",version:"1.0.0",icon:"mdi:view-sequential",category:"layout",tags:["layout","horizontal","alignment","container","flexbox"]}}createDefault(t){return{id:t||this.generateId("horizontal"),type:"horizontal",alignment:"left",gap:.7,wrap:!1,modules:[]}}renderGeneralTab(t,e,o,i){const n=t;return V`
      ${bt.injectCleanFormStyles()}

      <div class="module-general-settings">
        <!-- Layout Configuration Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 20px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 24px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Layout Configuration
          </div>

          <!-- Horizontal Alignment Field -->
          <div style="margin-bottom: 24px;">
            ${bt.renderField("Horizontal Alignment","Choose how items are aligned horizontally within the container.",e,{alignment:n.alignment||"left"},[bt.createSchemaItem("alignment",{select:{options:[{value:"left",label:"Left"},{value:"center",label:"Center"},{value:"right",label:"Right"},{value:"space-between",label:"Space Between"},{value:"space-around",label:"Space Around"},{value:"justify",label:"Justify"}],mode:"dropdown"}})],(t=>i({alignment:t.detail.value.alignment})))}
          </div>

          <!-- Gap Between Items Field with Slider and Reset Button -->
          <div style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
            >
              Gap Between Items
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
            >
              Set the spacing between horizontal items (in rem units). Use negative values to
              overlap items.
            </div>
            <div
              class="gap-control-container"
              style="display: flex; align-items: center; gap: 12px;"
            >
              <input
                type="range"
                class="gap-slider"
                min="-5"
                max="10"
                step="0.1"
                .value="${n.gap||.7}"
                @input=${t=>{const e=t.target,o=parseFloat(e.value);i({gap:o})}}
              />
              <input
                type="number"
                class="gap-input"
                style="width: 50px !important; max-width: 50px !important; min-width: 50px !important; padding: 4px 6px !important; font-size: 13px !important;"
                min="-5"
                max="10"
                step="0.1"
                .value="${n.gap||.7}"
                @input=${t=>{const e=t.target,o=parseFloat(e.value);isNaN(o)||i({gap:o})}}
                @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=parseFloat(e.value)||.7,n="ArrowUp"===t.key?.1:-.1,a=Math.max(-5,Math.min(10,o+n)),r=Math.round(10*a)/10;i({gap:r})}}}
              />
              <button
                class="reset-btn"
                @click=${()=>i({gap:.7})}
                title="Reset to default (0.7)"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>

          <!-- Allow Wrapping Field -->
          <div style="margin-bottom: 8px;">
            ${bt.renderField("Allow Wrapping","Allow items to wrap to the next line when they exceed the container width.",e,{wrap:n.wrap||!1},[bt.createSchemaItem("wrap",{boolean:{}})],(t=>i({wrap:t.detail.value.wrap})))}
          </div>
        </div>
      </div>
    `}renderPreview(t,e){const o=t,i=o,n=o.modules&&o.modules.length>0,a=o.gap||.7,r={padding:this.getPaddingCSS(i),margin:this.getMarginCSS(i),background:this.getBackgroundCSS(i),backgroundImage:this.getBackgroundImageCSS(i,e),border:this.getBorderCSS(i),borderRadius:this.addPixelUnit(i.border_radius)||"0",display:"flex",flexDirection:"row",justifyContent:this.getJustifyContent(o.alignment),gap:a>=0?`${a}rem`:"0",flexWrap:o.wrap?"wrap":"nowrap",alignItems:"flex-start",width:"100%",minHeight:"60px",overflow:o.wrap?"visible":"hidden",boxSizing:"border-box"};return V`
      <div class="horizontal-module-preview">
        <div
          class="horizontal-preview-content"
          style=${this.styleObjectToCss(r)}
          data-wrap=${o.wrap?"true":"false"}
        >
          ${n?o.modules.map(((t,n)=>{const r=a<0&&n>0?`0 0 0 ${a}rem`:"0",l=a<0;return V`
                  <div
                    class="child-module-preview ${l?"negative-gap":""}"
                    style="
                          max-width: 100%; 
                          overflow: hidden; 
                          flex-shrink: 1; 
                          flex-grow: ${o.wrap?"0":"1"};
                          min-width: ${o.wrap?"auto":"0"};
                          box-sizing: border-box;
                          margin: ${r};
                          ${l?"padding: 0; border: none; background: transparent;":""}
                        "
                  >
                    ${this._renderChildModulePreview(t,e,i)}
                  </div>
                `})):V`
                <div class="empty-layout-message">
                  <span>No modules added yet</span>
                  <small>Add modules in the layout builder to see them here</small>
                </div>
              `}
        </div>
      </div>
    `}_renderChildModulePreview(t,e,o){let i=t;o&&(i=this.applyLayoutDesignToChild(t,o));const n=Kt().getModule(i.type);return n?n.renderPreview(i,e):V`
      <div class="unknown-child-module">
        <ha-icon icon="mdi:help-circle"></ha-icon>
        <span>Unknown Module: ${i.type}</span>
      </div>
    `}applyLayoutDesignToChild(t,e){const o=Object.assign({},t);return e.color&&(o.color=e.color),e.font_size&&(o.font_size=e.font_size),e.font_family&&(o.font_family=e.font_family),e.font_weight&&(o.font_weight=e.font_weight),e.text_align&&(o.text_align=e.text_align),e.line_height&&(o.line_height=e.line_height),e.letter_spacing&&(o.letter_spacing=e.letter_spacing),e.text_transform&&(o.text_transform=e.text_transform),e.font_style&&(o.font_style=e.font_style),e.background_color&&(o.background_color=e.background_color),e.background_image&&(o.background_image=e.background_image),e.backdrop_filter&&(o.backdrop_filter=e.backdrop_filter),e.width&&(o.width=e.width),e.height&&(o.height=e.height),e.max_width&&(o.max_width=e.max_width),e.max_height&&(o.max_height=e.max_height),e.min_width&&(o.min_width=e.min_width),e.min_height&&(o.min_height=e.min_height),e.margin_top&&(o.margin_top=e.margin_top),e.margin_bottom&&(o.margin_bottom=e.margin_bottom),e.margin_left&&(o.margin_left=e.margin_left),e.margin_right&&(o.margin_right=e.margin_right),e.padding_top&&(o.padding_top=e.padding_top),e.padding_bottom&&(o.padding_bottom=e.padding_bottom),e.padding_left&&(o.padding_left=e.padding_left),e.padding_right&&(o.padding_right=e.padding_right),e.border_radius&&(o.border_radius=e.border_radius),e.border_style&&(o.border_style=e.border_style),e.border_width&&(o.border_width=e.border_width),e.border_color&&(o.border_color=e.border_color),e.text_shadow_h&&(o.text_shadow_h=e.text_shadow_h),e.text_shadow_v&&(o.text_shadow_v=e.text_shadow_v),e.text_shadow_blur&&(o.text_shadow_blur=e.text_shadow_blur),e.text_shadow_color&&(o.text_shadow_color=e.text_shadow_color),e.box_shadow_h&&(o.box_shadow_h=e.box_shadow_h),e.box_shadow_v&&(o.box_shadow_v=e.box_shadow_v),e.box_shadow_blur&&(o.box_shadow_blur=e.box_shadow_blur),e.box_shadow_spread&&(o.box_shadow_spread=e.box_shadow_spread),e.box_shadow_color&&(o.box_shadow_color=e.box_shadow_color),e.position&&(o.position=e.position),e.top&&(o.top=e.top),e.bottom&&(o.bottom=e.bottom),e.left&&(o.left=e.left),e.right&&(o.right=e.right),e.z_index&&(o.z_index=e.z_index),e.overflow&&(o.overflow=e.overflow),e.clip_path&&(o.clip_path=e.clip_path),e.animation_type&&(o.animation_type=e.animation_type),e.animation_entity&&(o.animation_entity=e.animation_entity),e.animation_trigger_type&&(o.animation_trigger_type=e.animation_trigger_type),e.animation_attribute&&(o.animation_attribute=e.animation_attribute),e.animation_state&&(o.animation_state=e.animation_state),e.intro_animation&&(o.intro_animation=e.intro_animation),e.outro_animation&&(o.outro_animation=e.outro_animation),e.animation_duration&&(o.animation_duration=e.animation_duration),e.animation_delay&&(o.animation_delay=e.animation_delay),e.animation_timing&&(o.animation_timing=e.animation_timing),o}validate(t){const e=t,o=[...super.validate(t).errors];if(e.gap&&(e.gap<-5||e.gap>10)&&o.push("Gap must be between -5 and 10 rem"),e.modules&&e.modules.length>0)for(const t of e.modules)"vertical"===t.type&&o.push("Vertical layout modules cannot be placed inside horizontal layout modules"),"horizontal"===t.type&&o.push("Horizontal layout modules cannot be nested inside other horizontal layout modules");return{valid:0===o.length,errors:o}}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${this.camelToKebab(t)}: ${e}`)).join("; ")}camelToKebab(t){return t.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}addPixelUnit(t){return t?/^\d+$/.test(t)?`${t}px`:/^[\d\s]+$/.test(t)?t.split(" ").map((t=>t.trim()?`${t}px`:t)).join(" "):t:t}getPaddingCSS(t){return t.padding_top||t.padding_bottom||t.padding_left||t.padding_right?`${this.addPixelUnit(t.padding_top)||"8px"} ${this.addPixelUnit(t.padding_right)||"8px"} ${this.addPixelUnit(t.padding_bottom)||"8px"} ${this.addPixelUnit(t.padding_left)||"8px"}`:"8px"}getMarginCSS(t){return t.margin_top||t.margin_bottom||t.margin_left||t.margin_right?`${this.addPixelUnit(t.margin_top)||"0"} ${this.addPixelUnit(t.margin_right)||"0"} ${this.addPixelUnit(t.margin_bottom)||"0"} ${this.addPixelUnit(t.margin_left)||"0"}`:"0"}getBackgroundCSS(t){return t.background_color||"transparent"}getBackgroundImageCSS(t,e){return t.background_image?`url(${t.background_image})`:"none"}getBorderCSS(t){return`${this.addPixelUnit(t.border_width)||"0"} ${t.border_style||"solid"} ${t.border_color||"transparent"}`}getJustifyContent(t){switch(t){case"left":default:return"flex-start";case"center":return"center";case"right":return"flex-end";case"space-between":case"justify":return"space-between";case"space-around":return"space-around"}}getStyles(){return'\n      /* Horizontal Module Styles */\n      .horizontal-module-preview {\n        width: 100%;\n        min-height: 60px;\n      }\n\n      .horizontal-preview-content {\n        background: var(--secondary-background-color);\n        border-radius: 6px;\n        border: 1px solid var(--divider-color);\n        transition: all 0.2s ease;\n      }\n\n      .child-module-preview {\n        background: var(--card-background-color);\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        padding: 6px;\n        transition: all 0.2s ease;\n        /* Ensure modules can compress when needed */\n        min-width: 0;\n        min-height: 0;\n        overflow: hidden;\n        box-sizing: border-box;\n      }\n\n      .child-module-preview.negative-gap {\n        background: transparent !important;\n        border: none !important;\n        border-radius: 0 !important;\n        padding: 0 !important;\n      }\n\n      .child-module-preview.negative-gap:hover {\n        border: none !important;\n        box-shadow: none !important;\n      }\n\n      .child-module-preview:hover {\n        border-color: var(--primary-color);\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n      }\n\n      .empty-layout-message {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        gap: 4px;\n        color: var(--secondary-text-color);\n        font-style: italic;\n        text-align: center;\n        width: 100%;\n        padding: 20px;\n      }\n\n      .empty-layout-message span {\n        font-size: 14px;\n        font-weight: 500;\n      }\n\n      .empty-layout-message small {\n        font-size: 12px;\n        opacity: 0.8;\n      }\n\n      .unknown-child-module {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 8px;\n        color: var(--secondary-text-color);\n        font-style: italic;\n      }\n\n      /* Special handling for compressed layouts */\n      .horizontal-preview-content:not([data-wrap="true"]) .child-module-preview {\n        flex-basis: 0;\n        flex-grow: 1;\n        max-width: none;\n      }\n\n      /* Ensure icons and text compress nicely */\n      .horizontal-preview-content:not([data-wrap="true"]) .child-module-preview * {\n        max-width: 100% !important;\n        overflow: hidden !important;\n        text-overflow: ellipsis !important;\n        white-space: nowrap !important;\n      }\n\n      /* Standard field styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n        color: var(--primary-text-color) !important;\n        margin-bottom: 4px !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      /* Custom Range Slider Styling */\n      input[type="range"] {\n        -webkit-appearance: none;\n        appearance: none;\n        height: 6px;\n        border-radius: 3px;\n        background: var(--disabled-color);\n        outline: none;\n        opacity: 0.7;\n        transition: opacity 0.2s;\n      }\n\n      input[type="range"]:hover {\n        opacity: 1;\n      }\n\n      input[type="range"]::-webkit-slider-thumb {\n        -webkit-appearance: none;\n        appearance: none;\n        width: 20px;\n        height: 20px;\n        border-radius: 50%;\n        background: var(--primary-color);\n        cursor: pointer;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n        transition: all 0.2s ease;\n      }\n\n      input[type="range"]::-webkit-slider-thumb:hover {\n        transform: scale(1.1);\n        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);\n      }\n\n      input[type="range"]::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        border-radius: 50%;\n        background: var(--primary-color);\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n        transition: all 0.2s ease;\n      }\n\n      input[type="range"]::-moz-range-thumb:hover {\n        transform: scale(1.1);\n        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);\n      }\n\n      input[type="range"]::-moz-range-track {\n        height: 6px;\n        border-radius: 3px;\n        background: var(--disabled-color);\n        border: none;\n      }\n\n      /* Gap control styles */\n      .gap-control-container {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n\n      .gap-slider {\n        flex: 1;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .gap-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider:hover {\n        background: var(--primary-color);\n        opacity: 0.7;\n      }\n\n      .gap-slider:hover::-webkit-slider-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-slider:hover::-moz-range-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-input {\n        width: 50px !important;\n        max-width: 50px !important;\n        min-width: 50px !important;\n        padding: 4px 6px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n      }\n\n      .gap-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      .reset-btn {\n        width: 36px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n\n      .reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .reset-btn ha-icon {\n        font-size: 16px;\n      }\n    '}}class qt extends ht{constructor(){super(...arguments),this.metadata={type:"vertical",title:"Vertical Layout",description:"Arrange modules in columns with flexible alignment and spacing",author:"WJD Designs",version:"1.0.0",icon:"mdi:view-agenda",category:"layout",tags:["layout","vertical","alignment","container","flexbox"]}}createDefault(t){return{id:t||this.generateId("vertical"),type:"vertical",alignment:"top",gap:1.2,modules:[]}}renderGeneralTab(t,e,o,i){const n=t;return V`
      ${bt.injectCleanFormStyles()}

      <div class="module-general-settings">
        <!-- Layout Configuration Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 20px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 24px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Layout Configuration
          </div>

          <!-- Vertical Alignment Field -->
          <div style="margin-bottom: 24px;">
            ${bt.renderField("Vertical Alignment","Choose how items are aligned vertically within the container.",e,{alignment:n.alignment||"top"},[bt.createSchemaItem("alignment",{select:{options:[{value:"top",label:"Top"},{value:"center",label:"Center"},{value:"bottom",label:"Bottom"},{value:"space-between",label:"Space Between"},{value:"space-around",label:"Space Around"}],mode:"dropdown"}})],(t=>i({alignment:t.detail.value.alignment})))}
          </div>

          <!-- Gap Between Items Field with Slider and Reset Button -->
          <div style="margin-bottom: 8px;">
            <div
              class="field-title"
              style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
            >
              Gap Between Items
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
            >
              Set the spacing between vertical items (in rem units). Use negative values to overlap
              items.
            </div>
            <div
              class="gap-control-container"
              style="display: flex; align-items: center; gap: 12px;"
            >
              <input
                type="range"
                class="gap-slider"
                min="-5"
                max="10"
                step="0.1"
                .value="${n.gap||1.2}"
                @input=${t=>{const e=t.target,o=parseFloat(e.value);i({gap:o})}}
              />
              <input
                type="number"
                class="gap-input"
                style="width: 50px !important; max-width: 50px !important; min-width: 50px !important; padding: 4px 6px !important; font-size: 13px !important;"
                min="-5"
                max="10"
                step="0.1"
                .value="${n.gap||1.2}"
                @input=${t=>{const e=t.target,o=parseFloat(e.value);isNaN(o)||i({gap:o})}}
                @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=parseFloat(e.value)||1.2,n="ArrowUp"===t.key?.1:-.1,a=Math.max(-5,Math.min(10,o+n)),r=Math.round(10*a)/10;i({gap:r})}}}
              />
              <button
                class="reset-btn"
                @click=${()=>i({gap:1.2})}
                title="Reset to default (1.2)"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    `}renderPreview(t,e){const o=t,i=o,n=o.modules&&o.modules.length>0,a=o.gap||1.2,r={padding:this.getPaddingCSS(i),margin:this.getMarginCSS(i),background:this.getBackgroundCSS(i),backgroundImage:this.getBackgroundImageCSS(i,e),border:this.getBorderCSS(i),borderRadius:this.addPixelUnit(i.border_radius)||"0",display:"flex",flexDirection:"column",justifyContent:this.getJustifyContent(o.alignment),gap:a>=0?`${a}rem`:"0",alignItems:"flex-start",width:"100%",minHeight:"60px"};return V`
      <div class="vertical-module-preview">
        <div class="vertical-preview-content" style=${this.styleObjectToCss(r)}>
          ${n?o.modules.map(((t,o)=>{const n=a<0;return V`
                  <div
                    class="child-module-preview ${n?"negative-gap":""}"
                    style="max-width: 100%; overflow: hidden; width: 100%; box-sizing: border-box; margin: ${a<0&&o>0?`${a}rem 0 0 0`:"0"}; ${n?"padding: 0; border: none; background: transparent;":""}"
                  >
                    ${this._renderChildModulePreview(t,e,i)}
                  </div>
                `})):V`
                <div class="empty-layout-message">
                  <span>No modules added yet</span>
                  <small>Add modules in the layout builder to see them here</small>
                </div>
              `}
        </div>
      </div>
    `}_renderChildModulePreview(t,e,o){let i=t;o&&(i=this.applyLayoutDesignToChild(t,o));const n=Kt().getModule(i.type);return n?n.renderPreview(i,e):V`
      <div class="unknown-child-module">
        <ha-icon icon="mdi:help-circle"></ha-icon>
        <span>Unknown Module: ${i.type}</span>
      </div>
    `}applyLayoutDesignToChild(t,e){const o=Object.assign({},t);return e.color&&(o.color=e.color),e.font_size&&(o.font_size=e.font_size),e.font_family&&(o.font_family=e.font_family),e.font_weight&&(o.font_weight=e.font_weight),e.text_align&&(o.text_align=e.text_align),e.line_height&&(o.line_height=e.line_height),e.letter_spacing&&(o.letter_spacing=e.letter_spacing),e.text_transform&&(o.text_transform=e.text_transform),e.font_style&&(o.font_style=e.font_style),e.background_color&&(o.background_color=e.background_color),e.background_image&&(o.background_image=e.background_image),e.backdrop_filter&&(o.backdrop_filter=e.backdrop_filter),e.width&&(o.width=e.width),e.height&&(o.height=e.height),e.max_width&&(o.max_width=e.max_width),e.max_height&&(o.max_height=e.max_height),e.min_width&&(o.min_width=e.min_width),e.min_height&&(o.min_height=e.min_height),e.margin_top&&(o.margin_top=e.margin_top),e.margin_bottom&&(o.margin_bottom=e.margin_bottom),e.margin_left&&(o.margin_left=e.margin_left),e.margin_right&&(o.margin_right=e.margin_right),e.padding_top&&(o.padding_top=e.padding_top),e.padding_bottom&&(o.padding_bottom=e.padding_bottom),e.padding_left&&(o.padding_left=e.padding_left),e.padding_right&&(o.padding_right=e.padding_right),e.border_radius&&(o.border_radius=e.border_radius),e.border_style&&(o.border_style=e.border_style),e.border_width&&(o.border_width=e.border_width),e.border_color&&(o.border_color=e.border_color),e.text_shadow_h&&(o.text_shadow_h=e.text_shadow_h),e.text_shadow_v&&(o.text_shadow_v=e.text_shadow_v),e.text_shadow_blur&&(o.text_shadow_blur=e.text_shadow_blur),e.text_shadow_color&&(o.text_shadow_color=e.text_shadow_color),e.box_shadow_h&&(o.box_shadow_h=e.box_shadow_h),e.box_shadow_v&&(o.box_shadow_v=e.box_shadow_v),e.box_shadow_blur&&(o.box_shadow_blur=e.box_shadow_blur),e.box_shadow_spread&&(o.box_shadow_spread=e.box_shadow_spread),e.box_shadow_color&&(o.box_shadow_color=e.box_shadow_color),e.position&&(o.position=e.position),e.top&&(o.top=e.top),e.bottom&&(o.bottom=e.bottom),e.left&&(o.left=e.left),e.right&&(o.right=e.right),e.z_index&&(o.z_index=e.z_index),e.overflow&&(o.overflow=e.overflow),e.clip_path&&(o.clip_path=e.clip_path),e.animation_type&&(o.animation_type=e.animation_type),e.animation_entity&&(o.animation_entity=e.animation_entity),e.animation_trigger_type&&(o.animation_trigger_type=e.animation_trigger_type),e.animation_attribute&&(o.animation_attribute=e.animation_attribute),e.animation_state&&(o.animation_state=e.animation_state),e.intro_animation&&(o.intro_animation=e.intro_animation),e.outro_animation&&(o.outro_animation=e.outro_animation),e.animation_duration&&(o.animation_duration=e.animation_duration),e.animation_delay&&(o.animation_delay=e.animation_delay),e.animation_timing&&(o.animation_timing=e.animation_timing),o}validate(t){const e=t,o=[...super.validate(t).errors];if(e.gap&&(e.gap<-5||e.gap>10)&&o.push("Gap must be between -5 and 10 rem"),e.modules&&e.modules.length>0)for(const t of e.modules)"horizontal"===t.type&&o.push("Horizontal layout modules cannot be placed inside vertical layout modules"),"vertical"===t.type&&o.push("Vertical layout modules cannot be nested inside other vertical layout modules");return{valid:0===o.length,errors:o}}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${this.camelToKebab(t)}: ${e}`)).join("; ")}camelToKebab(t){return t.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}addPixelUnit(t){return t?/^\d+$/.test(t)?`${t}px`:/^[\d\s]+$/.test(t)?t.split(" ").map((t=>t.trim()?`${t}px`:t)).join(" "):t:t}getPaddingCSS(t){return t.padding_top||t.padding_bottom||t.padding_left||t.padding_right?`${this.addPixelUnit(t.padding_top)||"8px"} ${this.addPixelUnit(t.padding_right)||"8px"} ${this.addPixelUnit(t.padding_bottom)||"8px"} ${this.addPixelUnit(t.padding_left)||"8px"}`:"8px"}getMarginCSS(t){return t.margin_top||t.margin_bottom||t.margin_left||t.margin_right?`${this.addPixelUnit(t.margin_top)||"0"} ${this.addPixelUnit(t.margin_right)||"0"} ${this.addPixelUnit(t.margin_bottom)||"0"} ${this.addPixelUnit(t.margin_left)||"0"}`:"0"}getBackgroundCSS(t){return t.background_color||"transparent"}getBackgroundImageCSS(t,e){return t.background_image?`url(${t.background_image})`:"none"}getBorderCSS(t){return`${this.addPixelUnit(t.border_width)||"0"} ${t.border_style||"solid"} ${t.border_color||"transparent"}`}getJustifyContent(t){switch(t){case"top":default:return"flex-start";case"center":return"center";case"bottom":return"flex-end";case"space-between":return"space-between";case"space-around":return"space-around"}}getStyles(){return'\n      /* Vertical Module Styles */\n      .vertical-module-preview {\n        width: 100%;\n        min-height: 60px;\n      }\n\n      .vertical-preview-content {\n        background: var(--secondary-background-color);\n        border-radius: 6px;\n        border: 1px solid var(--divider-color);\n        transition: all 0.2s ease;\n      }\n\n      .child-module-preview {\n        background: var(--card-background-color);\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        padding: 6px;\n        transition: all 0.2s ease;\n        width: 100%;\n      }\n\n      .child-module-preview.negative-gap {\n        background: transparent !important;\n        border: none !important;\n        border-radius: 0 !important;\n        padding: 0 !important;\n      }\n\n      .child-module-preview.negative-gap:hover {\n        border: none !important;\n        box-shadow: none !important;\n      }\n\n      .child-module-preview:hover {\n        border-color: var(--primary-color);\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n      }\n\n      .empty-layout-message {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        gap: 4px;\n        color: var(--secondary-text-color);\n        font-style: italic;\n        text-align: center;\n        width: 100%;\n        padding: 20px;\n      }\n\n      .empty-layout-message span {\n        font-size: 14px;\n        font-weight: 500;\n      }\n\n      .empty-layout-message small {\n        font-size: 12px;\n        opacity: 0.8;\n      }\n\n      .unknown-child-module {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 8px;\n        color: var(--secondary-text-color);\n        font-style: italic;\n      }\n\n      /* Standard field styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n        color: var(--primary-text-color) !important;\n        margin-bottom: 4px !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      /* Custom Range Slider Styling */\n      input[type="range"] {\n        -webkit-appearance: none;\n        appearance: none;\n        height: 6px;\n        border-radius: 3px;\n        background: var(--disabled-color);\n        outline: none;\n        opacity: 0.7;\n        transition: opacity 0.2s;\n      }\n\n      input[type="range"]:hover {\n        opacity: 1;\n      }\n\n      input[type="range"]::-webkit-slider-thumb {\n        -webkit-appearance: none;\n        appearance: none;\n        width: 20px;\n        height: 20px;\n        border-radius: 50%;\n        background: var(--primary-color);\n        cursor: pointer;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n        transition: all 0.2s ease;\n      }\n\n      input[type="range"]::-webkit-slider-thumb:hover {\n        transform: scale(1.1);\n        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);\n      }\n\n      input[type="range"]::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        border-radius: 50%;\n        background: var(--primary-color);\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n        transition: all 0.2s ease;\n      }\n\n      input[type="range"]::-moz-range-thumb:hover {\n        transform: scale(1.1);\n        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);\n      }\n\n      input[type="range"]::-moz-range-track {\n        height: 6px;\n        border-radius: 3px;\n        background: var(--disabled-color);\n        border: none;\n      }\n\n      /* Gap control styles */\n      .gap-control-container {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n\n      .gap-slider {\n        flex: 1;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .gap-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider:hover {\n        background: var(--primary-color);\n        opacity: 0.7;\n      }\n\n      .gap-slider:hover::-webkit-slider-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-slider:hover::-moz-range-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-input {\n        width: 50px !important;\n        max-width: 50px !important;\n        min-width: 50px !important;\n        padding: 4px 6px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n      }\n\n      .gap-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      .reset-btn {\n        width: 36px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n\n      .reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .reset-btn ha-icon {\n        font-size: 16px;\n      }\n    '}}class Yt{static render(t,e,o,i){return V`<div>Link Configuration (${i})</div>`}static handleAction(t,e,o){if("more-info"===t.action&&t.entity){const e=new CustomEvent("hass-more-info",{detail:{entityId:t.entity},bubbles:!0,composed:!0});o.dispatchEvent(e)}}}class Jt extends ht{constructor(){super(...arguments),this.metadata={type:"camera",title:"Camera Module",description:"Display live camera feeds with comprehensive control options",author:"WJD Designs",version:"1.0.0",icon:"mdi:camera",category:"content",tags:["camera","live","feed","security","surveillance"]},this.clickTimeout=null,this.holdTimeout=null,this.isHolding=!1}createDefault(t){return{id:t||this.generateId("camera"),type:"camera",entity:"",camera_name:"",show_name:!0,name_position:"top-left",aspect_ratio_linked:!0,aspect_ratio_value:1.778,image_fit:"cover",crop_left:0,crop_top:0,crop_right:0,crop_bottom:0,show_controls:!1,live_view:!0,auto_refresh:!0,refresh_interval:30,image_quality:"high",show_unavailable:!0,fallback_image:"",tap_action:{action:"more-info"},hold_action:{action:"default"},double_tap_action:{action:"default"},template_mode:!1,template:""}}renderGeneralTab(t,e,o,i){const n=t;return V`
      <div class="camera-module-settings">
        <!-- Camera Configuration Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            Camera Configuration
          </div>

          ${bt.renderField("Camera Entity","Select the camera entity to display. This should be a camera or mjpeg entity from Home Assistant.",e,{entity:n.entity||""},[bt.createSchemaItem("entity",{entity:{domain:["camera"]}})],(t=>i({entity:t.detail.value.entity})))}
          ${bt.renderField("Camera Name","Custom name for the camera. Leave empty to use entity name.",e,{camera_name:n.camera_name||""},[bt.createSchemaItem("camera_name",{text:{}})],(t=>i({camera_name:t.detail.value.camera_name})))}

          <div style="margin-top: 16px;">
            ${bt.renderField("Show Camera Name","Display the camera name on the feed",e,{show_name:!1!==n.show_name},[bt.createSchemaItem("show_name",{boolean:{}})],(t=>i({show_name:t.detail.value.show_name})))}
          </div>

          ${!1!==n.show_name?V`
                <div style="margin-top: 16px;">
                  ${this.renderConditionalFieldsGroup("Camera Name Position",V`
                      ${bt.renderField("Name Position","Choose where the camera name appears as an overlay on the camera image.",e,{name_position:n.name_position||"top-left"},[bt.createSchemaItem("name_position",{select:{options:[{value:"top-left",label:"Top Left"},{value:"top-right",label:"Top Right"},{value:"center",label:"Center"},{value:"bottom-left",label:"Bottom Left"},{value:"bottom-right",label:"Bottom Right"}]}})],(t=>i({name_position:t.detail.value.name_position})))}
                    `)}
                </div>
              `:""}
        </div>

        <!-- Display Settings Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            Display Settings
          </div>

          <div style="margin-bottom: 16px;">
            ${bt.renderField("Live View","Enable to show live camera stream (requires stream integration). When disabled, shows still image snapshots.",e,{live_view:!1!==n.live_view},[bt.createSchemaItem("live_view",{boolean:{}})],(t=>i({live_view:t.detail.value.live_view})))}
          </div>

          ${!1===n.live_view?V`
                <div style="margin-top: 24px;">
                  ${this.renderConditionalFieldsGroup("Auto Refresh Settings",V`
                      <div style="margin-bottom: 16px;">
                        ${bt.renderField("Auto Refresh","Automatically refresh the camera image at regular intervals",e,{auto_refresh:!1!==n.auto_refresh},[bt.createSchemaItem("auto_refresh",{boolean:{}})],(t=>i({auto_refresh:t.detail.value.auto_refresh})))}
                      </div>

                      ${!1!==n.auto_refresh?V`
                            ${bt.renderField("Refresh Interval (seconds)","How often to refresh the camera image automatically.",e,{refresh_interval:n.refresh_interval||30},[bt.createSchemaItem("refresh_interval",{number:{min:5,max:300,mode:"box"}})],(t=>i({refresh_interval:t.detail.value.refresh_interval})))}
                          `:""}
                    `)}
                </div>
              `:""}

          <!-- Dimensions Section -->
          <div style="margin-bottom: 32px;">
            <div
              class="field-title"
              style="font-size: 18px; font-weight: 700; margin-bottom: 16px; color: var(--primary-color);"
            >
              Dimensions
            </div>

            <style>
              .number-range-control {
                display: flex;
                gap: 8px;
                align-items: center;
              }

              .range-slider {
                flex: 0 0 70%;
                height: 6px;
                background: var(--divider-color);
                border-radius: 3px;
                outline: none;
                appearance: none;
                -webkit-appearance: none;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 0;
              }

              .range-slider::-webkit-slider-thumb {
                appearance: none;
                -webkit-appearance: none;
                width: 18px;
                height: 18px;
                background: var(--primary-color);
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }

              .range-slider::-moz-range-thumb {
                width: 18px;
                height: 18px;
                background: var(--primary-color);
                border-radius: 50%;
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }

              .range-slider:hover {
                background: var(--primary-color);
                opacity: 0.7;
              }

              .range-slider:hover::-webkit-slider-thumb {
                transform: scale(1.1);
              }

              .range-slider:hover::-moz-range-thumb {
                transform: scale(1.1);
              }

              .range-input {
                flex: 0 0 20%;
                padding: 6px 8px !important;
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                background: var(--secondary-background-color);
                color: var(--primary-text-color);
                font-size: 13px;
                text-align: center;
                transition: all 0.2s ease;
                box-sizing: border-box;
              }

              .range-input:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
              }

              .range-reset-btn {
                width: 32px;
                height: 32px;
                padding: 0;
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                background: var(--secondary-background-color);
                color: var(--primary-text-color);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                flex-shrink: 0;
              }

              .range-reset-btn:hover {
                background: var(--primary-color);
                color: var(--text-primary-color);
                border-color: var(--primary-color);
              }

              .range-reset-btn ha-icon {
                font-size: 14px;
              }

              .aspect-ratio-link-btn {
                width: 40px;
                height: 40px;
                padding: 0;
                border: 2px solid var(--divider-color);
                border-radius: 50%;
                background: var(--secondary-background-color);
                color: var(--primary-text-color);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                flex-shrink: 0;
                margin: 0 auto;
                position: relative;
              }

              .aspect-ratio-link-btn.linked {
                border-color: var(--primary-color);
                background: var(--primary-color);
                color: white;
                transform: scale(1.05);
              }

              .aspect-ratio-link-btn:hover {
                transform: scale(1.1);
                border-color: var(--primary-color);
              }

              .aspect-ratio-link-btn.linked:hover {
                background: var(--primary-color);
                opacity: 0.9;
              }

              .aspect-ratio-link-btn ha-icon {
                font-size: 20px;
                transition: transform 0.2s ease;
              }

              .dimensions-container {
                display: flex;
                flex-direction: column;
                gap: 16px;
              }

              .dimension-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
              }
            </style>

            <div class="dimensions-container">
              <div class="dimension-group">
                <div class="field-title">Width (px)</div>
                <div class="field-description">
                  Set the width of the camera display. Range: 100-1000px
                </div>
                <div class="number-range-control">
                  <input
                    type="range"
                    class="range-slider"
                    min="100"
                    max="1000"
                    step="1"
                    .value="${n.width||320}"
                    @input=${t=>{const e=t.target,o=parseInt(e.value);this._handleDimensionChange(n,"width",o,i)}}
                  />
                  <input
                    type="number"
                    class="range-input"
                    min="100"
                    max="1000"
                    step="1"
                    .value="${n.width||320}"
                    @input=${t=>{const e=t.target,o=parseInt(e.value);isNaN(o)||this._handleDimensionChange(n,"width",o,i)}}
                    @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=parseInt(e.value)||320,a="ArrowUp"===t.key?1:-1,r=Math.max(100,Math.min(1e3,o+a));this._handleDimensionChange(n,"width",r,i)}}}
                  />
                  <button
                    class="range-reset-btn"
                    @click=${()=>this._handleDimensionChange(n,"width",320,i)}
                    title="Reset to default (320)"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>

              <!-- Link/Unlink Button -->
              <div style="display: flex; justify-content: center; margin: 8px 0;">
                <button
                  class="aspect-ratio-link-btn ${!1!==n.aspect_ratio_linked?"linked":""}"
                  @click=${()=>{const t=!n.aspect_ratio_linked,e={aspect_ratio_linked:t};if(t){const t=n.width||320,o=n.height||180;e.aspect_ratio_value=t/o}i(e)}}
                  title="${!1!==n.aspect_ratio_linked?"Unlink aspect ratio":"Link aspect ratio"}"
                >
                  <ha-icon
                    icon="${!1!==n.aspect_ratio_linked?"mdi:link-variant":"mdi:link-variant-off"}"
                  ></ha-icon>
                </button>
              </div>

              <div class="dimension-group">
                <div class="field-title">Height (px)</div>
                <div class="field-description">
                  Set the height of the camera display. Range: 100-1000px
                </div>
                <div class="number-range-control">
                  <input
                    type="range"
                    class="range-slider"
                    min="100"
                    max="1000"
                    step="1"
                    .value="${n.height||180}"
                    @input=${t=>{const e=t.target,o=parseInt(e.value);this._handleDimensionChange(n,"height",o,i)}}
                  />
                  <input
                    type="number"
                    class="range-input"
                    min="100"
                    max="1000"
                    step="1"
                    .value="${n.height||180}"
                    @input=${t=>{const e=t.target,o=parseInt(e.value);isNaN(o)||this._handleDimensionChange(n,"height",o,i)}}
                    @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=parseInt(e.value)||180,a="ArrowUp"===t.key?1:-1,r=Math.max(100,Math.min(1e3,o+a));this._handleDimensionChange(n,"height",r,i)}}}
                  />
                  <button
                    class="range-reset-btn"
                    @click=${()=>this._handleDimensionChange(n,"height",180,i)}
                    title="Reset to default (180)"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>
            </div>

            ${!1!==n.aspect_ratio_linked?V`
                  <div
                    style="margin-top: 12px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 8px; border-left: 4px solid var(--primary-color);"
                  >
                    <div
                      style="font-size: 13px; color: var(--primary-color); font-weight: 500; margin-bottom: 4px;"
                    >
                      <ha-icon
                        icon="mdi:link-variant"
                        style="font-size: 14px; margin-right: 6px;"
                      ></ha-icon>
                      Aspect Ratio Linked
                    </div>
                    <div
                      style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.4;"
                    >
                      Dimensions maintain
                      ${(1*(n.aspect_ratio_value||1.778)).toFixed(2)}:1 ratio.
                      Adjusting one dimension automatically updates the other to maintain
                      proportions.
                    </div>
                  </div>
                `:V`
                  <div
                    style="margin-top: 12px; padding: 12px; background: rgba(var(--rgb-secondary-text-color), 0.1); border-radius: 8px; border-left: 4px solid var(--secondary-text-color);"
                  >
                    <div
                      style="font-size: 13px; color: var(--secondary-text-color); font-weight: 500; margin-bottom: 4px;"
                    >
                      <ha-icon
                        icon="mdi:link-variant-off"
                        style="font-size: 14px; margin-right: 6px;"
                      ></ha-icon>
                      Independent Dimensions
                    </div>
                    <div
                      style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.4;"
                    >
                      Width and height can be adjusted independently. Click the link button above to
                      maintain aspect ratio.
                    </div>
                  </div>
                `}
          </div>

          ${bt.renderField("Border Radius (px)","Rounded corners for the camera image. 0 for sharp corners.",e,{border_radius:n.border_radius||"8"},[bt.createSchemaItem("border_radius",{number:{min:0,max:50,mode:"box"}})],(t=>{var e;return i({border_radius:null===(e=t.detail.value.border_radius)||void 0===e?void 0:e.toString()})}))}
        </div>

        <!-- Crop & Position Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            Crop & Position
          </div>
          <div
            class="field-description"
            style="margin-bottom: 20px; color: var(--secondary-text-color); font-style: italic;"
          >
            Adjust the crop and position of the camera view. Useful for focusing on specific areas
            or removing unwanted edges.
          </div>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            <!-- Left Crop -->
            <div class="field-container">
              <div class="field-title">Left Crop (%)</div>
              <div class="field-description">
                Crop from the left edge. Higher values show less of the left side.
              </div>
              <div class="number-range-control">
                <input
                  type="range"
                  class="range-slider"
                  min="0"
                  max="50"
                  step="1"
                  .value="${n.crop_left||0}"
                  @input=${t=>{const e=t.target,o=parseInt(e.value);i({crop_left:o})}}
                />
                <input
                  type="number"
                  class="range-input"
                  min="0"
                  max="50"
                  step="1"
                  .value="${n.crop_left||0}"
                  @input=${t=>{const e=t.target,o=parseInt(e.value);isNaN(o)||i({crop_left:o})}}
                />
                <button
                  class="range-reset-btn"
                  @click=${()=>i({crop_left:0})}
                  title="Reset to default (0)"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <!-- Right Crop -->
            <div class="field-container">
              <div class="field-title">Right Crop (%)</div>
              <div class="field-description">
                Crop from the right edge. Higher values show less of the right side.
              </div>
              <div class="number-range-control">
                <input
                  type="range"
                  class="range-slider"
                  min="0"
                  max="50"
                  step="1"
                  .value="${n.crop_right||0}"
                  @input=${t=>{const e=t.target,o=parseInt(e.value);i({crop_right:o})}}
                />
                <input
                  type="number"
                  class="range-input"
                  min="0"
                  max="50"
                  step="1"
                  .value="${n.crop_right||0}"
                  @input=${t=>{const e=t.target,o=parseInt(e.value);isNaN(o)||i({crop_right:o})}}
                />
                <button
                  class="range-reset-btn"
                  @click=${()=>i({crop_right:0})}
                  title="Reset to default (0)"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <!-- Top Crop -->
            <div class="field-container">
              <div class="field-title">Top Crop (%)</div>
              <div class="field-description">
                Crop from the top edge. Higher values show less of the top area.
              </div>
              <div class="number-range-control">
                <input
                  type="range"
                  class="range-slider"
                  min="0"
                  max="50"
                  step="1"
                  .value="${n.crop_top||0}"
                  @input=${t=>{const e=t.target,o=parseInt(e.value);i({crop_top:o})}}
                />
                <input
                  type="number"
                  class="range-input"
                  min="0"
                  max="50"
                  step="1"
                  .value="${n.crop_top||0}"
                  @input=${t=>{const e=t.target,o=parseInt(e.value);isNaN(o)||i({crop_top:o})}}
                />
                <button
                  class="range-reset-btn"
                  @click=${()=>i({crop_top:0})}
                  title="Reset to default (0)"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>

            <!-- Bottom Crop -->
            <div class="field-container">
              <div class="field-title">Bottom Crop (%)</div>
              <div class="field-description">
                Crop from the bottom edge. Higher values show less of the bottom area.
              </div>
              <div class="number-range-control">
                <input
                  type="range"
                  class="range-slider"
                  min="0"
                  max="50"
                  step="1"
                  .value="${n.crop_bottom||0}"
                  @input=${t=>{const e=t.target,o=parseInt(e.value);i({crop_bottom:o})}}
                />
                <input
                  type="number"
                  class="range-input"
                  min="0"
                  max="50"
                  step="1"
                  .value="${n.crop_bottom||0}"
                  @input=${t=>{const e=t.target,o=parseInt(e.value);isNaN(o)||i({crop_bottom:o})}}
                />
                <button
                  class="range-reset-btn"
                  @click=${()=>i({crop_bottom:0})}
                  title="Reset to default (0)"
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Crop Status -->
          ${(n.crop_left||0)+(n.crop_top||0)+(n.crop_right||0)+(n.crop_bottom||0)>0?V`
                <div
                  style="margin-top: 16px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 8px; border-left: 4px solid var(--primary-color);"
                >
                  <div
                    style="font-size: 13px; color: var(--primary-color); font-weight: 500; margin-bottom: 4px;"
                  >
                    <ha-icon icon="mdi:crop" style="font-size: 14px; margin-right: 6px;"></ha-icon>
                    Active Crops Applied
                  </div>
                  <div
                    style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.4;"
                  >
                    L: ${n.crop_left||0}% | T: ${n.crop_top||0}% | R:
                    ${n.crop_right||0}% | B: ${n.crop_bottom||0}%
                  </div>
                </div>
              `:""}

          <!-- Reset All Crops Button -->
          <div style="margin-top: 20px; text-align: center;">
            <button
              style="
                padding: 8px 16px;
                border: 1px solid var(--primary-color);
                border-radius: 6px;
                background: transparent;
                color: var(--primary-color);
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s ease;
              "
              @click=${()=>i({crop_left:0,crop_top:0,crop_right:0,crop_bottom:0})}
              @mouseover=${t=>{const e=t.target;e.style.background="var(--primary-color)",e.style.color="white"}}
              @mouseout=${t=>{const e=t.target;e.style.background="transparent",e.style.color="var(--primary-color)"}}
            >
              <ha-icon icon="mdi:crop-free" style="margin-right: 6px; font-size: 14px;"></ha-icon>
              Reset All Crops
            </button>
          </div>
        </div>

        <!-- Image Quality & Error Handling Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            Image Quality & Error Handling
          </div>

          ${bt.renderField("Image Quality","Quality setting for the camera stream. Higher quality uses more bandwidth.",e,{image_quality:n.image_quality||"high"},[bt.createSchemaItem("image_quality",{select:{options:[{value:"high",label:"High Quality"},{value:"medium",label:"Medium Quality"},{value:"low",label:"Low Quality (Faster)"}]}})],(t=>i({image_quality:t.detail.value.image_quality})))}
          ${bt.renderField("Fallback Image URL","Optional image to show when camera is unavailable. Can be a URL or local path.",e,{fallback_image:n.fallback_image||""},[bt.createSchemaItem("fallback_image",{text:{}})],(t=>i({fallback_image:t.detail.value.fallback_image})))}
        </div>

        <!-- Link Configuration Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          ${Yt.render(e,{tap_action:n.tap_action||{action:"more-info"},hold_action:n.hold_action||{action:"default"},double_tap_action:n.double_tap_action||{action:"default"}},(t=>{const e={};t.tap_action&&(e.tap_action=t.tap_action),t.hold_action&&(e.hold_action=t.hold_action),t.double_tap_action&&(e.double_tap_action=t.double_tap_action),i(e)}),"Link Configuration")}
        </div>

        <!-- Template Configuration Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;"
          >
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;"
            >
              Template Configuration
            </div>
            ${bt.renderField("Template Mode","Enable template mode to dynamically select camera entity using Jinja2 templating",e,{template_mode:n.template_mode||!1},[bt.createSchemaItem("template_mode",{boolean:{}})],(t=>i({template_mode:t.detail.value.template_mode})))}
          </div>

          ${n.template_mode?this.renderConditionalFieldsGroup("Template Settings",V`
                  ${bt.renderField("Template Code",'Enter Jinja2 template code to dynamically set camera entity. Example: {{ states.camera.front_door.entity_id if is_state("input_boolean.show_front", "on") else states.camera.back_yard.entity_id }}',e,{template:n.template||""},[bt.createSchemaItem("template",{text:{multiline:!0}})],(t=>i({template:t.detail.value.template})))}
                `):V`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  Enable template mode to use dynamic camera selection
                </div>
              `}
        </div>
      </div>
    `}renderPreview(t,e){const o=t,i=o;let n=o.entity;if(o.template_mode&&o.template)try{n=o.entity}catch(t){console.warn("Template evaluation failed:",t)}const a=n?e.states[n]:null,r=!a||"unavailable"===a.state,l=o.camera_name||(a?a.attributes.friendly_name||a.entity_id:"Camera"),s={padding:this.getPaddingCSS(i),margin:this.getMarginCSS(i),background:this.getBackgroundCSS(i),backgroundImage:this.getBackgroundImageCSS(i,e),border:this.getBorderCSS(i),borderRadius:this.addPixelUnit(i.border_radius)||"0px",width:"100%",maxWidth:"100%",boxSizing:"border-box",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:this.getTextColor(i),fontFamily:this.getTextFont(i),fontSize:this.getTextSize(i),fontWeight:this.getTextWeight(i)},d=o.crop_left||0,c=o.crop_right||0,p=o.crop_top||0,u=o.crop_bottom||0,m=o.width||320,g=o.height||180,h=m*(100-d-c)/100,v=g*(100-p-u)/100,b=-m*d/100,f=-g*p/100,y={borderRadius:this.addPixelUnit(o.border_radius)||"8px",objectFit:"cover",width:`${m}px`,height:`${g}px`,display:"block",position:"absolute",left:`${b}px`,top:`${f}px`,transition:"all 0.3s ease"},_={width:`${Math.max(50,h)}px`,height:`${Math.max(50,v)}px`,position:"relative",overflow:"hidden"},x=o.name_position||"top-left",w=this.getCameraNamePositionStyles(x,i),$=V`
      <div class="camera-module-container" style=${this.styleObjectToCss(s)}>
        <div class="camera-image-container" style=${this.styleObjectToCss(_)}>
          ${n?r?V`
                  <div
                    class="camera-unavailable"
                    style=${this.styleObjectToCss(Object.assign(Object.assign({},y),{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",backgroundColor:"var(--error-color, #f44336)",color:this.getTextColor(i),position:"static",left:"auto",top:"auto",fontFamily:this.getTextFont(i)}))}
                  >
                    ${o.fallback_image?V`
                          <img
                            src=${o.fallback_image}
                            alt="Fallback"
                            style="max-width: 100%; max-height: 100%; object-fit: cover;"
                          />
                        `:V`
                          <ha-icon
                            icon="mdi:camera-off"
                            style="font-size: 48px; margin-bottom: 8px;"
                          ></ha-icon>
                          <span
                            style="font-weight: ${this.getTextWeight(i)}; font-size: ${this.getTextSize(i)};"
                            >Camera Unavailable</span
                          >
                          <span
                            style="font-size: ${this.getSmallTextSize(i)}; margin-top: 4px; opacity: 0.9;"
                            >Entity: ${n}</span
                          >
                        `}
                  </div>
                  ${!1!==o.show_name?V`
                        <div
                          class="camera-name-overlay"
                          style=${this.styleObjectToCss(w)}
                        >
                          ${l}
                        </div>
                      `:""}
                `:V`
                  <!-- Use HA's native camera image component - same as picture-glance card -->
                  <hui-image
                    .hass=${e}
                    .cameraImage=${n}
                    .cameraView=${o.live_view?"live":"auto"}
                    style=${this.styleObjectToCss(y)}
                    class="camera-image"
                    @error=${t=>console.log("🎥 HA hui-image error:",t)}
                    @load=${()=>console.log("🎥 HA hui-image loaded successfully")}
                  ></hui-image>
                  ${!1!==o.show_name?V`
                        <div
                          class="camera-name-overlay"
                          style=${this.styleObjectToCss(w)}
                        >
                          ${l}
                        </div>
                      `:""}
                `:V`
                <div
                  class="camera-unavailable"
                  style=${this.styleObjectToCss(Object.assign(Object.assign({},y),{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",backgroundColor:"var(--warning-color, #ff9800)",color:this.getTextColor(i),position:"static",left:"auto",top:"auto",fontFamily:this.getTextFont(i)}))}
                >
                  <ha-icon
                    icon="mdi:camera-plus"
                    style="font-size: 48px; margin-bottom: 8px;"
                  ></ha-icon>
                  <span
                    style="font-weight: ${this.getTextWeight(i)}; font-size: ${this.getTextSize(i)};"
                    >No Camera Selected</span
                  >
                  <span
                    style="font-size: ${this.getSmallTextSize(i)}; margin-top: 4px; opacity: 0.9;"
                    >Choose a camera entity below</span
                  >
                </div>
                ${!1!==o.show_name?V`
                      <div
                        class="camera-name-overlay"
                        style=${this.styleObjectToCss(w)}
                      >
                        ${l}
                      </div>
                    `:""}
              `}
        </div>
      </div>
    `;return this.hasActiveLink(o)?V`<div
          class="camera-module-clickable"
          @click=${t=>this.handleClick(t,o,e)}
          @dblclick=${t=>this.handleDoubleClick(t,o,e)}
          @mousedown=${t=>this.handleMouseDown(t,o,e)}
          @mouseup=${t=>this.handleMouseUp(t,o,e)}
          @mouseleave=${t=>this.handleMouseLeave(t,o,e)}
          @touchstart=${t=>this.handleTouchStart(t,o,e)}
          @touchend=${t=>this.handleTouchEnd(t,o,e)}
        >
          ${$}
        </div>`:$}validate(t){const e=t,o=[...super.validate(t).errors];return e.template_mode||e.entity&&""!==e.entity.trim()||o.push("Camera entity is required when not using template mode"),!e.template_mode||e.template&&""!==e.template.trim()||o.push("Template code is required when template mode is enabled"),!1!==e.auto_refresh&&e.refresh_interval&&(e.refresh_interval<5||e.refresh_interval>300)&&o.push("Refresh interval must be between 5 and 300 seconds"),e.border_radius&&isNaN(Number(e.border_radius))&&o.push("Border radius must be a number"),e.tap_action&&e.tap_action.action&&o.push(...this.validateAction(e.tap_action)),e.hold_action&&e.hold_action.action&&o.push(...this.validateAction(e.hold_action)),e.double_tap_action&&e.double_tap_action.action&&o.push(...this.validateAction(e.double_tap_action)),{valid:0===o.length,errors:o}}handleClick(t,e,o){t.preventDefault(),this.clickTimeout&&clearTimeout(this.clickTimeout),this.clickTimeout=setTimeout((()=>{this.handleTapAction(t,e,o)}),300)}handleDoubleClick(t,e,o){t.preventDefault(),this.clickTimeout&&(clearTimeout(this.clickTimeout),this.clickTimeout=null),this.handleDoubleAction(t,e,o)}handleMouseDown(t,e,o){this.isHolding=!1,this.holdTimeout=setTimeout((()=>{this.isHolding=!0,this.handleHoldAction(t,e,o)}),500)}handleMouseUp(t,e,o){this.holdTimeout&&(clearTimeout(this.holdTimeout),this.holdTimeout=null)}handleMouseLeave(t,e,o){this.holdTimeout&&(clearTimeout(this.holdTimeout),this.holdTimeout=null),this.isHolding=!1}handleTouchStart(t,e,o){this.handleMouseDown(t,e,o)}handleTouchEnd(t,e,o){this.handleMouseUp(t,e,o)}handleTapAction(t,e,o){if(!this.isHolding)if(e.tap_action){const i="default"===e.tap_action.action?{action:"more-info",entity:e.entity}:e.tap_action;Yt.handleAction(i,o,t.target)}else e.entity&&Yt.handleAction({action:"more-info",entity:e.entity},o,t.target)}handleHoldAction(t,e,o){e.hold_action&&"nothing"!==e.hold_action.action&&Yt.handleAction(e.hold_action,o,t.target)}handleDoubleAction(t,e,o){e.double_tap_action&&"nothing"!==e.double_tap_action.action&&Yt.handleAction(e.double_tap_action,o,t.target)}_handleDimensionChange(t,e,o,i){const n={};if(!1!==t.aspect_ratio_linked){const i=t.aspect_ratio_value||1.778;"width"===e?(n.width=o,n.height=Math.round(o/i)):(n.height=o,n.width=Math.round(o*i)),n.width&&(n.width<100||n.width>1e3)&&(n.width=Math.max(100,Math.min(1e3,n.width)),n.height=Math.round(n.width/i)),n.height&&(n.height<100||n.height>1e3)&&(n.height=Math.max(100,Math.min(1e3,n.height)),n.width=Math.round(n.height*i))}else n[e]=o;i(n)}getCameraNamePositionStyles(t,e){const o={position:"absolute",padding:"6px 12px",background:"rgba(0, 0, 0, 0.7)",color:this.getTextColor(e),fontSize:this.getTextSize(e),fontWeight:this.getTextWeight(e),fontFamily:this.getTextFont(e),borderRadius:"4px",zIndex:"10",pointerEvents:"none",backdropFilter:"blur(4px)",maxWidth:"calc(100% - 20px)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textShadow:"0 1px 2px rgba(0, 0, 0, 0.8)",transition:"all 0.2s ease"};switch(t){case"top-left":default:return Object.assign(Object.assign({},o),{top:"8px",left:"8px"});case"top-right":return Object.assign(Object.assign({},o),{top:"8px",right:"8px"});case"center":return Object.assign(Object.assign({},o),{top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center"});case"bottom-left":return Object.assign(Object.assign({},o),{bottom:"8px",left:"8px"});case"bottom-right":return Object.assign(Object.assign({},o),{bottom:"8px",right:"8px"})}}hasActiveLink(t){const e=t.tap_action&&"nothing"!==t.tap_action.action,o=t.hold_action&&"nothing"!==t.hold_action.action,i=t.double_tap_action&&"nothing"!==t.double_tap_action.action;return e||o||i||!!t.entity}refreshCamera(t,e){console.log("🎥 Manual refresh triggered for camera:",t),document.querySelectorAll('hui-image[class*="camera-image"]').forEach((o=>{o.cameraImage===t&&o.hass===e&&(console.log("🎥 Refreshing hui-image component"),o.hass=Object.assign({},e),o.requestUpdate())}))}getCameraImageUrl(t,e,o){var i,n,a;if(!t||!e)return console.log("🎥 Camera URL: Missing entity or hass",{entity:t,hasHass:!!e}),"";let r;try{r=e.hassUrl?`${e.hassUrl()}/api/camera_proxy/${t}`:`/api/camera_proxy/${t}`;const o=r.includes("?")?"&":"?";r+=`${o}token=${Date.now()}`}catch(e){console.warn("🎥 Error generating camera URL:",e),r=`/api/camera_proxy/${t}?token=${Date.now()}`}return console.log("🎥 Camera URL (HA native method):",{entity:t,finalUrl:r,cameraState:null===(i=e.states[t])||void 0===i?void 0:i.state,supportedFeatures:null===(a=null===(n=e.states[t])||void 0===n?void 0:n.attributes)||void 0===a?void 0:a.supported_features}),r}async getCameraImageBlob(t,e,o){try{console.log("🎥 Trying authenticated blob approach for camera:",t);const o=`/api/camera_proxy/${t}?t=${Date.now()}`,i=await fetch(o,{method:"GET",credentials:"include",headers:{Accept:"image/*","Cache-Control":"no-cache",Pragma:"no-cache"}});if(!i.ok)return console.log(`🎥 Blob fetch failed with status ${i.status}:`,i.statusText),await this.getCameraImageViaWebSocket(t,e);const n=await i.blob(),a=URL.createObjectURL(n);return console.log("🎥 Blob URL created successfully:",{blobUrl:a,blobSize:n.size,blobType:n.type}),a}catch(o){return console.error("🎥 Blob method failed:",o),await this.getCameraImageViaWebSocket(t,e)}}async getCameraImageViaWebSocket(t,e){try{console.log("🎥 Attempting WebSocket camera image fetch");const o=e.connection;if(!o)throw new Error("No WebSocket connection available");const i=await o.sendMessagePromise({type:"camera_thumbnail",entity_id:t});if(i&&i.content){const t=atob(i.content),e=new Array(t.length);for(let o=0;o<t.length;o++)e[o]=t.charCodeAt(o);const o=new Uint8Array(e),n=new Blob([o],{type:"image/jpeg"}),a=URL.createObjectURL(n);return console.log("🎥 WebSocket camera image successful:",{blobUrl:a,blobSize:n.size}),a}throw new Error("No image content received from WebSocket")}catch(t){return console.error("🎥 WebSocket camera image failed:",t),""}}async handleImageError(t,e){var o,i,n,a,r,l,s,d,c,p;const u=t.target;if(console.log("🎥 Camera Image Error:",{entity:e.entity,originalSrc:u.src,error:t}),!u.dataset.triedBlob&&e.entity){u.dataset.triedBlob="true",console.log("🎥 Trying authenticated blob approach...");try{const t=(null===(o=document.querySelector("home-assistant"))||void 0===o?void 0:o.hass)||(null===(i=document.querySelector("ha-panel-lovelace"))||void 0===i?void 0:i.hass)||(null===(n=window.hassConnection)||void 0===n?void 0:n.hass);if(t){const o=await this.getCameraImageBlob(e.entity,t,e.image_quality);if(o)return console.log("🎥 Successfully got blob URL, updating image"),void(u.src=o)}else console.log("🎥 Could not find hass instance for blob approach")}catch(t){console.error("🎥 Blob approach failed:",t)}}if(e.fallback_image)console.log("🎥 Using fallback image"),u.src=e.fallback_image;else{console.log("🎥 No fallback image, showing error message"),u.style.display="none";const t=u.closest(".camera-image-container");if(t){const o=e.entity?null===(l=null===(r=null===(a=document.querySelector("home-assistant"))||void 0===a?void 0:a.hass)||void 0===r?void 0:r.states)||void 0===l?void 0:l[e.entity]:null,i=(null===(s=null==o?void 0:o.attributes)||void 0===s?void 0:s.brand)||(null===(d=null==o?void 0:o.attributes)||void 0===d?void 0:d.model)||"Unknown",n=(null===(c=document.querySelector("home-assistant"))||void 0===c||c.hass,e);if(t.innerHTML=`\n          <div style="\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            flex-direction: column;\n            background-color: var(--warning-color, #ff9800);\n            color: ${this.getTextColor(n)};\n            padding: 20px;\n            border-radius: 8px;\n            text-align: center;\n            min-height: 150px;\n            border: 1px solid rgba(255,255,255,0.2);\n            font-family: ${this.getTextFont(n)};\n          ">\n            <ha-icon icon="mdi:camera-off" style="font-size: 48px; margin-bottom: 12px; opacity: 0.9;"></ha-icon>\n            <span style="font-weight: ${this.getTextWeight(n)}; font-size: ${this.getTextSize(n)}; margin-bottom: 8px;">Camera Load Failed</span>\n            <span style="font-size: ${this.getSmallTextSize(n)}; margin-bottom: 8px; opacity: 0.9;">Entity: ${e.entity}</span>\n            <span style="font-size: ${this.getSmallTextSize(n)}; margin-bottom: 12px; opacity: 0.8;">Camera Type: ${i}</span>\n            <div style="font-size: ${this.getSmallTextSize(n)}; opacity: 0.8; line-height: 1.4; margin-bottom: 12px;">\n              <div style="margin-bottom: 6px;">• Check camera entity is working in HA</div>\n              <div style="margin-bottom: 6px;">• Verify RTSP credentials in HA config</div>\n              <div>• Try refreshing the browser</div>\n            </div>\n            <button \n              onclick="window.retryCamera_${null===(p=e.entity)||void 0===p?void 0:p.replace(/\./g,"_")}"\n              style="\n                background: rgba(255,255,255,0.2);\n                border: 1px solid rgba(255,255,255,0.3);\n                color: white;\n                padding: 8px 16px;\n                border-radius: 4px;\n                cursor: pointer;\n                font-size: ${this.getSmallTextSize(n)};\n                font-family: ${this.getTextFont(n)};\n                transition: all 0.2s ease;\n              "\n              onmouseover="this.style.background='rgba(255,255,255,0.3)'"\n              onmouseout="this.style.background='rgba(255,255,255,0.2)'"\n            >\n              🔄 Retry Camera Load\n            </button>\n          </div>\n        `,e.entity){const o=`retryCamera_${e.entity.replace(/\./g,"_")}`;window[o]=async()=>{var o;if(console.log("🎥 Manual retry triggered for camera:",e.entity),null===(o=document.querySelector("home-assistant"))||void 0===o?void 0:o.hass)try{const o=Date.now(),i=`/api/camera_proxy/${e.entity}?t=${o}`,a=document.createElement("img");a.className="camera-image",a.style.cssText=`\n                  position: absolute;\n                  top: 0;\n                  left: 0;\n                  width: 100%;\n                  height: 100%;\n                  object-fit: ${e.image_fit||"cover"};\n                  border-radius: inherit;\n                `,a.onerror=t=>{"string"!=typeof t&&this.handleImageError(t,e)},a.onload=()=>{console.log("🎥 Retry successful!"),t&&(t.innerHTML="",t.appendChild(a))},a.src=i,t&&(t.innerHTML=`\n                    <div style="\n                      display: flex;\n                      align-items: center;\n                      justify-content: center;\n                      flex-direction: column;\n                      background-color: var(--primary-color);\n                      color: ${this.getTextColor(n)};\n                      padding: 20px;\n                      border-radius: 8px;\n                      text-align: center;\n                      min-height: 150px;\n                      font-family: ${this.getTextFont(n)};\n                    ">\n                      <div style="\n                        width: 32px;\n                        height: 32px;\n                        border: 3px solid rgba(255,255,255,0.3);\n                        border-top: 3px solid white;\n                        border-radius: 50%;\n                        animation: spin 1s linear infinite;\n                        margin-bottom: 12px;\n                      "></div>\n                      <span style="font-weight: ${this.getTextWeight(n)}; font-size: ${this.getTextSize(n)};">Retrying Camera Load...</span>\n                      <style>\n                        @keyframes spin {\n                          0% { transform: rotate(0deg); }\n                          100% { transform: rotate(360deg); }\n                        }\n                      </style>\n                    </div>\n                  `)}catch(t){console.error("🎥 Retry failed:",t)}}}}}}renderConditionalFieldsGroup(t,e){return V`
      <div
        class="conditional-fields-group"
        style="margin-top: 16px; padding: 16px; border-left: 4px solid var(--primary-color); background: rgba(var(--rgb-primary-color), 0.08); border-radius: 0 8px 8px 0;"
      >
        <div
          style="font-weight: 600; color: var(--primary-color); margin-bottom: 12px; font-size: 14px;"
        >
          ${t}
        </div>
        ${e}
      </div>
    `}getTextColor(t){return t.text_color||"white"}getTextSize(t){const e=t.text_size||14;return"number"==typeof e?`${e}px`:e}getSmallTextSize(t){const e=t.text_size||14;return`${"number"==typeof e?Math.max(10,e-2):12}px`}getTextWeight(t){return t.text_weight||"500"}getTextFont(t){return t.text_font||'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}styleObjectToCss(t){return Object.entries(t).filter((([t,e])=>null!=e&&""!==e)).map((([t,e])=>`${this.camelToKebab(t)}: ${e}`)).join("; ")}camelToKebab(t){return t.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}addPixelUnit(t){return t&&/^\d+$/.test(t)?`${t}px`:t}getPaddingCSS(t){return t.padding_top||t.padding_bottom||t.padding_left||t.padding_right?`${this.addPixelUnit(t.padding_top)||"8px"} ${this.addPixelUnit(t.padding_right)||"12px"} ${this.addPixelUnit(t.padding_bottom)||"8px"} ${this.addPixelUnit(t.padding_left)||"12px"}`:"8px 12px"}getMarginCSS(t){return t.margin_top||t.margin_bottom||t.margin_left||t.margin_right?`${this.addPixelUnit(t.margin_top)||"0px"} ${this.addPixelUnit(t.margin_right)||"0px"} ${this.addPixelUnit(t.margin_bottom)||"0px"} ${this.addPixelUnit(t.margin_left)||"0px"}`:"0px"}getBackgroundCSS(t){return t.background_color||"transparent"}getBackgroundImageCSS(t,e){return"url"===t.background_image_type&&t.background_image?`url('${t.background_image}')`:"entity"===t.background_image_type&&t.background_image_entity&&e.states[t.background_image_entity]?`url('/api/camera_proxy/${t.background_image_entity}')`:""}getBorderCSS(t){return t.border_width&&t.border_style&&t.border_color?`${t.border_width} ${t.border_style} ${t.border_color}`:""}validateAction(t){const e=[];return"navigate"!==t.action||t.navigation_path||e.push("Navigation path is required for navigate action"),"call-service"!==t.action||t.service&&t.service_data||e.push("Service and service data are required for call-service action"),e}getStyles(){return"\n      .camera-module-container {\n        width: 100%;\n        box-sizing: border-box;\n        transition: all 0.3s ease;\n      }\n      \n      .camera-name-overlay {\n        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);\n        backdrop-filter: blur(4px);\n        -webkit-backdrop-filter: blur(4px);\n        transition: all 0.2s ease;\n      }\n      \n      .camera-image-container {\n        position: relative;\n        overflow: hidden;\n        margin: 0 auto;\n        flex-shrink: 0;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.3s ease;\n      }\n      \n      .camera-image {\n        width: 100%;\n        height: 100%;\n        border-radius: inherit;\n        transition: all 0.3s ease;\n      }\n      \n      .camera-unavailable {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        flex-direction: column;\n        background-color: var(--disabled-color, #f5f5f5);\n        color: var(--secondary-text-color);\n        min-height: 150px;\n        transition: all 0.3s ease;\n      }\n      \n      .camera-module-clickable {\n        cursor: pointer;\n        transition: transform 0.2s ease;\n      }\n      \n      .camera-module-clickable:hover {\n        transform: scale(1.02);\n      }\n      \n      .camera-module-clickable:active {\n        transform: scale(0.98);\n      }\n\n      /* Standard field styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n        color: var(--primary-text-color) !important;\n        margin-bottom: 4px !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      /* Conditional fields grouping */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      @keyframes slideInFromLeft {\n        from {\n          opacity: 0;\n          transform: translateX(-10px);\n        }\n        to {\n          opacity: 1;\n          transform: translateX(0);\n        }\n      }\n\n      /* Global design responsive text */\n      .camera-module-container * {\n        transition: font-size 0.3s ease, color 0.3s ease, font-weight 0.3s ease;\n      }\n\n      /* Enhanced animations for global design changes */\n      @keyframes textSizeChange {\n        0% { transform: scale(1); }\n        50% { transform: scale(1.02); }\n        100% { transform: scale(1); }\n      }\n\n      .camera-module-container.design-updating {\n        animation: textSizeChange 0.3s ease;\n      }\n    "}}class Xt{constructor(){this.modules=new Map,this.modulesByCategory=new Map,this.registerCoreModules()}static getInstance(){return Xt.instance||(Xt.instance=new Xt),Xt.instance}registerCoreModules(){this.registerModule(new ft),this.registerModule(new yt),this.registerModule(new $t),this.registerModule(new kt),this.registerModule(new Ut),this.registerModule(new Nt),this.registerModule(new Vt),this.registerModule(new Gt),this.registerModule(new Wt),this.registerModule(new qt),this.registerModule(new Jt)}registerModule(t){const e=t.metadata.type;this.modules.has(e)&&console.warn(`Module with type "${e}" is already registered. Overriding...`),this.modules.set(e,t),this.updateCategoryMap(t),console.log(`✅ Registered module: ${t.metadata.title} v${t.metadata.version} by ${t.metadata.author}`)}unregisterModule(t){return!!this.modules.get(t)&&(this.modules.delete(t),this.updateCategoryMaps(),console.log(`❌ Unregistered module: ${t}`),!0)}getModule(t){return this.modules.get(t)}getAllModules(){return Array.from(this.modules.values())}getModulesByCategory(t){return this.modulesByCategory.get(t)||[]}getCategories(){return Array.from(this.modulesByCategory.keys())}getAllModuleMetadata(){return this.getAllModules().map((t=>t.metadata))}searchModules(t){const e=t.toLowerCase();return this.getAllModules().filter((t=>{const o=t.metadata;return o.title.toLowerCase().includes(e)||o.description.toLowerCase().includes(e)||o.tags.some((t=>t.toLowerCase().includes(e)))||o.type.toLowerCase().includes(e)}))}createDefaultModule(t,e){console.log(`Creating default module for type: ${t}`);const o=this.getModule(t);if(!o)return console.error(`Module type "${t}" not found in registry`),console.log("Available module types:",Array.from(this.modules.keys())),null;try{const t=o.createDefault(e);return console.log("Successfully created default module:",t),t}catch(e){return console.error(`Error creating default module for type "${t}":`,e),null}}validateModule(t){const e=this.getModule(t.type);return e?e.validate(t):{valid:!1,errors:[`Unknown module type: ${t.type}`]}}getAllModuleStyles(){let t="";for(const e of this.getAllModules())e.getStyles&&(t+=`\n/* Styles for ${e.metadata.title} */\n`,t+=e.getStyles(),t+="\n");return t+=this.getCommonFormStyles(),t}isModuleRegistered(t){return this.modules.has(t)}getRegistryStats(){const t=this.getAllModules(),e={},o=new Set;return t.forEach((t=>{const i=t.metadata.category;e[i]=(e[i]||0)+1,o.add(t.metadata.author)})),{totalModules:t.length,modulesByCategory:e,authors:Array.from(o)}}updateCategoryMap(t){const e=t.metadata.category;this.modulesByCategory.has(e)||this.modulesByCategory.set(e,[]);const o=this.modulesByCategory.get(e),i=o.findIndex((e=>e.metadata.type===t.metadata.type));i>=0?o[i]=t:o.push(t)}updateCategoryMaps(){this.modulesByCategory.clear(),this.getAllModules().forEach((t=>this.updateCategoryMap(t)))}getCommonFormStyles(){return'\n      /* Common form styles for all modules */\n      .module-general-settings {\n        padding: 0;\n      }\n      \n      .form-field {\n        margin-bottom: 16px;\n      }\n      \n      .form-label {\n        display: block;\n        font-weight: 500;\n        margin-bottom: 4px;\n        font-size: 14px;\n        color: var(--primary-text-color);\n      }\n      \n      .form-description {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        margin-top: 4px;\n        line-height: 1.3;\n      }\n\n      /* Container Module Global Styles */\n      .container-module {\n        --container-drag-handle-opacity: 0.8;\n        --container-badge-opacity: 0.9;\n      }\n\n      .container-module:hover {\n        --container-drag-handle-opacity: 1;\n        --container-badge-opacity: 1;\n      }\n\n      /* Container-specific colors that can be overridden by individual modules */\n      .horizontal-module-preview.container-module {\n        --container-primary-color: #9c27b0; /* Purple for horizontal */\n        --container-secondary-color: #e1bee7;\n        --container-accent-color: #7b1fa2;\n        --container-border-color: #ba68c8;\n      }\n\n      .vertical-module-preview.container-module {\n        --container-primary-color: #3f51b5; /* Indigo for vertical */\n        --container-secondary-color: #c5cae9;\n        --container-accent-color: #303f9f;\n        --container-border-color: #7986cb;\n      }\n      \n      .form-field input[type="text"],\n      .form-field input[type="number"],\n      .form-field select,\n      .form-field textarea {\n        width: 100%;\n        padding: 8px 12px;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 14px;\n        font-family: inherit;\n        box-sizing: border-box;\n      }\n      \n      .form-field input[type="color"] {\n        width: 60px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        cursor: pointer;\n        background: none;\n      }\n      \n      .form-field input:focus,\n      .form-field select:focus,\n      .form-field textarea:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 1px var(--primary-color);\n      }\n      \n      .form-field textarea {\n        resize: vertical;\n        min-height: 60px;\n        font-family: monospace;\n      }\n      \n      .checkbox-wrapper {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        font-size: 14px;\n        cursor: pointer;\n        color: var(--primary-text-color);\n      }\n      \n      .checkbox-wrapper input[type="checkbox"] {\n        margin: 0;\n        cursor: pointer;\n      }\n      \n      .checkbox-group {\n        display: grid;\n        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));\n        gap: 8px;\n        margin-top: 8px;\n      }\n    '}}const Kt=()=>Xt.getInstance();class Zt{constructor(t){this.hass=t,this._templateSubscriptions=new Map,this._templateResults=new Map,this._evaluationCache=new Map,this.CACHE_TTL=1e3}getTemplateResult(t){const e=this._evaluationCache.get(t);return e&&Date.now()-e.timestamp<this.CACHE_TTL?e.value:this._templateResults.get(t)}hasTemplateSubscription(t){return this._templateSubscriptions.has(t)}getAllTemplateResults(){return this._templateResults}async evaluateTemplate(t){var e;if(!t||!this.hass)return!1;const o=t.trim();if(!o)return!1;const i=`eval_${o}`,n=this._evaluationCache.get(i);if(n&&Date.now()-n.timestamp<this.CACHE_TTL)return n.value;try{const t=await this.hass.callApi("POST","template",{template:o}),e=t.toLowerCase().trim();let n;if(["true","on","yes","1"].includes(e))n=!0;else if(["false","off","no","0","unavailable","unknown","none",""].includes(e))n=!1;else{const o=parseFloat(e);isNaN(o)?(console.warn(`[UltraVehicleCard] Template evaluated to ambiguous string '${t}', interpreting as false.`),n=!1):n=0!==o}return this._evaluationCache.set(i,{value:n,timestamp:Date.now(),stringValue:t}),n}catch(t){const i=(null===(e=t.error)||void 0===e?void 0:e.message)||t.message||String(t);return console.error(`[UltraVehicleCard] Error evaluating template via API: ${o}. Error: ${i}`),!1}}async subscribeToTemplate(t,e,o){if(t&&this.hass){if(this._templateSubscriptions.has(e)){try{const t=this._templateSubscriptions.get(e);if(t){const e=await t;e&&"function"==typeof e&&await e()}}catch(t){}this._templateSubscriptions.delete(e)}try{const i=new Promise(((i,n)=>{i(this.hass.connection.subscribeMessage((t=>{const i=t.result;this.hass.__uvc_template_strings||(this.hass.__uvc_template_strings={}),this.hass.__uvc_template_strings[e]=i;const n=this.parseTemplateResult(i,e);n!==this._templateResults.get(e)&&o&&o(),this._templateResults.set(e,n),this._evaluationCache.set(e,{value:n,timestamp:Date.now(),stringValue:i})}),{type:"render_template",template:t}))}));this._templateSubscriptions.set(e,i)}catch(e){console.error(`[UltraVehicleCard] Failed to subscribe to template: ${t}`,e)}}}parseTemplateResult(t,e){if(e&&e.startsWith("info_entity_"))return!0;if(e&&e.startsWith("state_text_"))return!0;if(null==t)return!1;if("boolean"==typeof t)return t;if("number"==typeof t)return 0!==t;if("string"==typeof t){const e=t.toLowerCase().trim();return"true"===e||"on"===e||"yes"===e||"active"===e||"home"===e||"1"===e||"open"===e||"unlocked"===e||"false"!==e&&"off"!==e&&"no"!==e&&"inactive"!==e&&"not_home"!==e&&"away"!==e&&"0"!==e&&"closed"!==e&&"locked"!==e&&"unavailable"!==e&&"unknown"!==e&&""!==e}return console.warn(`[UltraVehicleCard] Template evaluated to ambiguous type '${typeof t}', interpreting as false.`),!1}async unsubscribeAllTemplates(){for(const[t,e]of this._templateSubscriptions.entries())try{if(e){const t=await Promise.resolve(e).catch((t=>null));if(t&&"function"==typeof t)try{await t()}catch(t){}}}catch(t){}this._templateSubscriptions.clear(),this._templateResults.clear(),this._evaluationCache.clear()}updateHass(t){this.hass=t,this._evaluationCache.clear()}}class Qt{constructor(){this.hass=null,this.templateService=null}static getInstance(){return Qt.instance||(Qt.instance=new Qt),Qt.instance}setHass(t){this.hass=t,t&&(this.templateService=new Zt(t))}evaluateDisplayConditions(t,e="always"){if(!this.hass)return console.warn("[LogicService] HomeAssistant instance not available"),!0;if("always"===e||!t||0===t.length)return!0;const o=t.filter((t=>!1!==t.enabled));if(0===o.length)return!0;const i=o.map((t=>this.evaluateSingleCondition(t)));switch(e){case"every":return i.every((t=>t));case"any":return i.some((t=>t));default:return!0}}evaluateModuleVisibility(t){if(!this.hass)return console.warn("[LogicService] HomeAssistant instance not available"),!0;if(t.template_mode&&t.template){const e={id:`template_${t.id}`,type:"template",template:t.template,enabled:!0};return this.evaluateTemplateCondition(e)}return this.evaluateDisplayConditions(t.display_conditions||[],t.display_mode||"always")}evaluateRowVisibility(t){if(!this.hass)return console.warn("[LogicService] HomeAssistant instance not available"),!0;if(t.template_mode&&t.template){const e={id:`template_${t.id}`,type:"template",template:t.template,enabled:!0};return this.evaluateTemplateCondition(e)}return this.evaluateDisplayConditions(t.display_conditions||[],t.display_mode||"always")}evaluateColumnVisibility(t){if(!this.hass)return console.warn("[LogicService] HomeAssistant instance not available"),!0;if(t.template_mode&&t.template){const e={id:`template_${t.id}`,type:"template",template:t.template,enabled:!0};return this.evaluateTemplateCondition(e)}return this.evaluateDisplayConditions(t.display_conditions||[],t.display_mode||"always")}evaluateSingleCondition(t){if(!t.enabled)return!0;switch(t.type){case"entity_state":return this.evaluateEntityStateCondition(t);case"entity_attribute":return this.evaluateEntityAttributeCondition(t);case"time":return this.evaluateTimeCondition(t);case"template":return this.evaluateTemplateCondition(t);case"entity":return console.log("[LogicService] Migrating legacy entity condition to entity_state"),this.evaluateEntityStateCondition(t);default:return console.warn("[LogicService] Unknown condition type:",t.type),!0}}evaluateEntityStateCondition(t){if(!t.entity||!this.hass)return!0;const e=this.hass.states[t.entity];if(!e)return console.warn(`[LogicService] Entity not found: ${t.entity}`),!0;const o=t.operator||"=",i=t.value,n=e.state;switch(o){case"=":return n===String(i);case"!=":return n!==String(i);case">":const t=this.tryParseNumber(n),e=this.tryParseNumber(i);return null!==t&&null!==e&&t>e;case">=":const a=this.tryParseNumber(n),r=this.tryParseNumber(i);return null!==a&&null!==r&&a>=r;case"<":const l=this.tryParseNumber(n),s=this.tryParseNumber(i);return null!==l&&null!==s&&l<s;case"<=":const d=this.tryParseNumber(n),c=this.tryParseNumber(i);return null!==d&&null!==c&&d<=c;case"contains":return String(n).toLowerCase().includes(String(i).toLowerCase());case"not_contains":return!String(n).toLowerCase().includes(String(i).toLowerCase());case"has_value":return null!=n&&""!==n;case"no_value":return null==n||""===n;default:return console.warn(`[LogicService] Unknown operator: ${o}`),!0}}evaluateEntityAttributeCondition(t){if(!t.entity||!t.attribute||!this.hass)return!0;const e=this.hass.states[t.entity];if(!e)return console.warn(`[LogicService] Entity not found: ${t.entity}`),!0;const o=e.attributes[t.attribute];if(void 0===o)return console.warn(`[LogicService] Attribute '${t.attribute}' not found on entity '${t.entity}'`),!0;const i=t.operator||"=",n=t.value,a=o;switch(i){case"=":return String(a)===String(n);case"!=":return String(a)!==String(n);case">":const t=this.tryParseNumber(a),e=this.tryParseNumber(n);return null!==t&&null!==e&&t>e;case">=":const o=this.tryParseNumber(a),r=this.tryParseNumber(n);return null!==o&&null!==r&&o>=r;case"<":const l=this.tryParseNumber(a),s=this.tryParseNumber(n);return null!==l&&null!==s&&l<s;case"<=":const d=this.tryParseNumber(a),c=this.tryParseNumber(n);return null!==d&&null!==c&&d<=c;case"contains":return String(a).toLowerCase().includes(String(n).toLowerCase());case"not_contains":return!String(a).toLowerCase().includes(String(n).toLowerCase());case"has_value":return null!=a&&""!==a;case"no_value":return null==a||""===a;default:return console.warn(`[LogicService] Unknown operator: ${i}`),!0}}evaluateTimeCondition(t){if(!t.time_from||!t.time_to)return!0;const e=new Date,o=60*e.getHours()+e.getMinutes(),[i,n]=t.time_from.split(":").map(Number),[a,r]=t.time_to.split(":").map(Number),l=60*i+n,s=60*a+r;return l<=s?o>=l&&o<=s:o>=l||o<=s}evaluateTemplateCondition(t){if(!t.template||!this.hass)return!0;try{const e=`logic_condition_${t.id}_${t.template}`;if(this.templateService)if(this.templateService.hasTemplateSubscription(e)){const t=this.templateService.getTemplateResult(e);if(void 0!==t)return t}else this.templateService.subscribeToTemplate(t.template,e,(()=>{}));this.hass.callApi&&this.hass.callApi("POST","template",{template:t.template}).then((t=>{const o=t.toLowerCase().trim();let i;if(["true","on","yes","1"].includes(o))i=!0;else if(["false","off","no","0","unavailable","unknown","none",""].includes(o))i=!1;else{const t=parseFloat(o);i=!isNaN(t)&&0!==t}this.templateService&&this.templateService._templateResults.set(e,i)})).catch((t=>{console.warn("[LogicService] Error evaluating template via API:",t)}));const o=t.template;if(o.includes("{% if ")&&o.includes(" %}")){const t=o.match(/\{\%\s*if\s+(.+?)\s*\%\}/);if(t){const e=t[1].match(/states\(['"]([^'"]+)['"]\)\s*(==|!=)\s*['"]([^'"]+)['"]/);if(e){const t=e[1],o=e[2],i=e[3],n=this.hass.states[t];if(n){const t=n.state;if("=="===o)return t===i;if("!="===o)return t!==i}}}}const i=/\{\{\s*states\(['"]([^'"]+)['"]\)\s*\}\}/g;let n,a=o;for(;null!==(n=i.exec(o));){const t=n[1],e=this.hass.states[t],o=e?e.state:"unknown";a=a.replace(n[0],o)}if(a!==o){const t=a.toLowerCase().trim();if(["true","on","yes","1"].includes(t))return!0;if(["false","off","no","0","unavailable","unknown","none",""].includes(t))return!1}return console.log(`[LogicService] Template condition evaluation fallback for: ${o}`),!0}catch(t){return console.warn("[LogicService] Error evaluating template condition:",t),!0}}tryParseNumber(t){if("number"==typeof t)return t;if("string"==typeof t){const e=parseFloat(t);return isNaN(e)?null:e}return null}evaluateLogicProperties(t){if(!t.logic_entity||!this.hass)return!0;const e={id:"logic-property",type:t.logic_attribute?"entity_attribute":"entity_state",entity:t.logic_entity,attribute:t.logic_attribute,operator:t.logic_operator||"=",value:t.logic_value,enabled:!0};return this.evaluateSingleCondition(e)}}const te=Qt.getInstance();class ee{static getInstance(){return ee.instance||(ee.instance=new ee),ee.instance}validateAndCorrectConfig(t){const e=[],o=[];let i;try{i=JSON.parse(JSON.stringify(t))}catch(t){return{valid:!1,errors:["Invalid JSON structure"],warnings:[]}}i.type||(i.type="custom:ultra-card",o.push("Added missing card type")),"custom:ultra-card"!==i.type&&e.push(`Invalid card type: ${i.type}`),i.layout||(i.layout={rows:[]},o.push("Added missing layout structure")),i.layout.rows||(i.layout.rows=[],o.push("Added missing rows array")),i.layout.rows=i.layout.rows.map(((t,i)=>{const n=this.validateAndCorrectRow(t,i);return e.push(...n.errors),o.push(...n.warnings),n.correctedRow})),i.layout.rows=i.layout.rows.filter((t=>null!==t));const n={valid:0===e.length,errors:e,warnings:o,correctedConfig:i};return n.valid?o.length>0&&console.log("✅ Config validation passed with corrections",{warnings:o.length,rows:i.layout.rows.length,totalModules:this.countTotalModules(i)}):console.error("❌ Config validation failed",{errors:e,warnings:o}),n}validateAndCorrectRow(t,e){const o=[],i=[];return t.id||(t.id=`row-${Date.now()}-${e}`,i.push(`Row ${e}: Added missing ID`)),t.columns&&Array.isArray(t.columns)||(t.columns=[{id:`col-${Date.now()}-0`,modules:[]}],i.push(`Row ${e}: Added missing columns array`)),t.columns=t.columns.map(((t,n)=>{const a=this.validateAndCorrectColumn(t,e,n);return o.push(...a.errors),i.push(...a.warnings),a.correctedColumn})).filter((t=>null!==t)),0===t.columns.length&&(t.columns=[{id:`col-${Date.now()}-fallback`,modules:[]}],i.push(`Row ${e}: Added fallback column`)),{correctedRow:t,errors:o,warnings:i}}validateAndCorrectColumn(t,e,o){const i=[],n=[];return t.id||(t.id=`col-${Date.now()}-${e}-${o}`,n.push(`Row ${e}, Column ${o}: Added missing ID`)),t.modules&&Array.isArray(t.modules)||(t.modules=[],n.push(`Row ${e}, Column ${o}: Added missing modules array`)),t.modules=t.modules.map(((t,a)=>{const r=this.validateAndCorrectModule(t,e,o,a);return r.valid?r.correctedModule?(n.push(...r.warnings||[]),r.correctedModule):t:(i.push(...r.errors),null)})).filter((t=>null!==t)),{correctedColumn:t,errors:i,warnings:n}}validateAndCorrectModule(t,e,o,i){const n=[],a=[],r=Kt();if(t.id||(t.id=`${t.type||"unknown"}-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,a.push("Module: Added missing ID")),!t.type)return n.push(`Module ${t.id}: Missing type`),{valid:!1,errors:n,warnings:a};if(!r.isModuleRegistered(t.type))return n.push(`Module ${t.id}: Unknown module type "${t.type}"`),{valid:!1,errors:n,warnings:a};const l=r.getModule(t.type);if(l){const e=l.validate(t);if(!e.valid)return n.push(...e.errors.map((e=>`Module ${t.id}: ${e}`))),{valid:!1,errors:n,warnings:a};const o=l.createDefault(t.id);return{valid:!0,errors:[],warnings:a,correctedModule:this.mergeWithDefaults(t,o)}}return{valid:!1,errors:[`Module ${t.id}: No handler found for type "${t.type}"`],warnings:a}}mergeWithDefaults(t,e){const o=Object.assign({},e);return Object.keys(t).forEach((i=>{void 0!==t[i]&&null!==t[i]&&("object"!=typeof t[i]||Array.isArray(t[i])||"object"!=typeof e[i]?o[i]=t[i]:o[i]=Object.assign(Object.assign({},e[i]),t[i]))})),o}countTotalModules(t){return t.layout.rows.reduce(((t,e)=>t+e.columns.reduce(((t,e)=>t+e.modules.length),0)),0)}validateUniqueModuleIds(t){const e=new Set,o=[];for(const i of t.layout.rows)for(const t of i.columns)for(const i of t.modules)e.has(i.id)?o.push(i.id):e.add(i.id);return{valid:0===o.length,duplicates:o}}fixDuplicateModuleIds(t){const e=new Set,o=JSON.parse(JSON.stringify(t));for(const t of o.layout.rows)for(const o of t.columns)for(const t of o.modules){if(e.has(t.id)){let o=`${t.type}-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;for(;e.has(o);)o=`${t.type}-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;console.warn(`🔧 Fixed duplicate module ID: ${t.id} → ${o}`),t.id=o}e.add(t.id)}return o}}const oe=ee.getInstance();var ie=function(t,e,o,i){var n,a=arguments.length,r=a<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,o,i);else for(var l=t.length-1;l>=0;l--)(n=t[l])&&(r=(a<3?n(r):a>3?n(e,o,r):n(e,o))||r);return a>3&&r&&Object.defineProperty(e,o,r),r};let ne=class extends st{render(){return V`
      <div class="about-tab">
        <div class="about-logo-container">
          <h1>Ultra Card</h1>
        </div>

        <div class="about-developed-by">
          Developed by
          <a href="https://wjddesigns.com" target="_blank" rel="noopener">WJD Designs</a>
        </div>

        <div class="about-description">
          <p>A powerful modular card builder for Home Assistant</p>
          <p>Create custom layouts with a professional page-builder interface</p>
        </div>

        <div class="about-buttons">
          <a
            href="https://github.com/WJDDesigns/Ultra-Card"
            target="_blank"
            rel="noopener"
            class="about-button github"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" class="about-button-icon">
              <path
                fill="currentColor"
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
            GitHub Repository
          </a>
        </div>

        <div class="version-info">
          <p>Version 1.0.0</p>
          <p>Modular layout system with conditional logic and professional design tools</p>
        </div>
      </div>
    `}};ne.styles=a`
    .about-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
      color: var(--primary-text-color);
    }

    .about-logo-container h1 {
      color: var(--primary-color);
      font-size: 2.5em;
      margin: 0 0 16px 0;
      text-align: center;
    }

    .about-developed-by {
      font-size: 1.2em;
      margin-bottom: 24px;
      color: var(--secondary-text-color);
      text-align: center;
    }

    .about-developed-by a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: bold;
    }

    .about-developed-by a:hover {
      text-decoration: underline;
    }

    .about-description {
      text-align: center;
      margin-bottom: 32px;
    }

    .about-description p {
      margin: 8px 0;
      color: var(--secondary-text-color);
      line-height: 1.5;
    }

    .about-buttons {
      display: flex;
      justify-content: center;
      margin-bottom: 32px;
    }

    .about-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 20px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
      color: white;
      border: none;
    }

    .about-button svg {
      margin-right: 8px;
      fill: currentColor;
    }

    .about-button.github {
      background-color: #24292e;
    }

    .about-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .version-info {
      text-align: center;
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }

    .version-info p {
      margin: 4px 0;
    }
  `,ie([mt({attribute:!1})],ne.prototype,"hass",void 0),ne=ie([ct("ultra-about-tab")],ne);class ae extends St{constructor(t){if(super(t),this.it=W,2!==t.type)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===W||null==t)return this._t=void 0,this.it=t;if(t===G)return t;if("string"!=typeof t)throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const e=[t];return e.raw=e,this._t={_$litType$:this.constructor.resultType,strings:e,values:[]}}}ae.directiveName="unsafeHTML",ae.resultType=1;const re=Ct(ae);var le,se=function(t,e,o,i){var n,a=arguments.length,r=a<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,o,i);else for(var l=t.length-1;l>=0;l--)(n=t[l])&&(r=(a<3?n(r):a>3?n(e,o,r):n(e,o))||r);return a>3&&r&&Object.defineProperty(e,o,r),r};let de=le=class extends st{constructor(){super(...arguments),this.designProperties={},this._expandedSections=new Set,this._marginLocked=!1,this._paddingLocked=!1,this._clipboardProperties=null}connectedCallback(){super.connectedCallback(),this._loadClipboardFromStorage(),this._storageEventListener=this._handleStorageEvent.bind(this),window.addEventListener("storage",this._storageEventListener)}disconnectedCallback(){super.disconnectedCallback(),this._storageEventListener&&window.removeEventListener("storage",this._storageEventListener)}_handleStorageEvent(t){t.key===le.CLIPBOARD_KEY&&this._loadClipboardFromStorage()}_loadClipboardFromStorage(){try{const t=localStorage.getItem(le.CLIPBOARD_KEY);if(t){const e=JSON.parse(t);e&&"object"==typeof e&&(this._clipboardProperties=e,this.requestUpdate())}}catch(t){console.warn("Failed to load design clipboard from localStorage:",t),this._clipboardProperties=null}}_saveClipboardToStorage(t){try{localStorage.setItem(le.CLIPBOARD_KEY,JSON.stringify(t))}catch(t){console.warn("Failed to save design clipboard to localStorage:",t)}}_clearClipboardFromStorage(){try{localStorage.removeItem(le.CLIPBOARD_KEY)}catch(t){console.warn("Failed to clear design clipboard from localStorage:",t)}}_toggleSection(t){this._expandedSections.has(t)?this._expandedSections.delete(t):(this._expandedSections.clear(),this._expandedSections.add(t)),this.requestUpdate()}_updateProperty(t,e){const o={[t]:e};if(console.log(`🔧 GlobalDesignTab: Updating property ${t} =`,e),console.log("🔧 GlobalDesignTab: onUpdate callback exists:",!!this.onUpdate),this.onUpdate)console.log("🔧 GlobalDesignTab: Using callback approach for property update"),this.onUpdate(o);else{console.log("🔧 GlobalDesignTab: Using event approach for property update");const t=new CustomEvent("design-changed",{detail:o,bubbles:!0,composed:!0});console.log("🔧 GlobalDesignTab: Dispatching design-changed event:",t),this.dispatchEvent(t)}console.log(`🔧 GlobalDesignTab: Property update complete for ${t}`)}_updateSpacing(t,e,o){const i="margin"===t?this._marginLocked:this._paddingLocked;let n;if(n=i?{[`${t}_top`]:o,[`${t}_bottom`]:o,[`${t}_left`]:o,[`${t}_right`]:o}:{[`${t}_${e}`]:o},console.log(`🔧 GlobalDesignTab: Updating spacing ${t}-${e} =`,o,`(locked: ${i})`),console.log("🔧 GlobalDesignTab: Spacing updates:",n),console.log("🔧 GlobalDesignTab: onUpdate callback exists:",!!this.onUpdate),this.onUpdate)console.log("🔧 GlobalDesignTab: Using callback approach for spacing update"),this.onUpdate(n);else{console.log("🔧 GlobalDesignTab: Using event approach for spacing update");const t=new CustomEvent("design-changed",{detail:n,bubbles:!0,composed:!0});console.log("🔧 GlobalDesignTab: Dispatching spacing design-changed event:",t),this.dispatchEvent(t)}}_handleNumericKeydown(t,e,o){if("ArrowUp"!==t.key&&"ArrowDown"!==t.key)return;t.preventDefault();const i=e.match(/^(-?\d*\.?\d*)(.*)$/);if(!i)return;const n=i[1],a=i[2].trim()||"px";let r=parseFloat(n)||0,l=1;"rem"===a||"em"===a?l=.1:"%"===a?l=5:"px"===a&&(l=1),t.shiftKey?l*=10:t.altKey&&(l/=10),"ArrowUp"===t.key?r+=l:r-=l;let s=0;"rem"===a||"em"===a?s=t.altKey?3:1:"%"===a&&t.altKey&&(s=1),o(`${parseFloat(r.toFixed(s))}${a}`)}_toggleSpacingLock(t){"margin"===t?this._marginLocked=!this._marginLocked:this._paddingLocked=!this._paddingLocked,this.requestUpdate()}_resetSection(t){console.log(`🔄 GlobalDesignTab: RESET SECTION CALLED for: ${t}`),console.log("🔄 GlobalDesignTab: Current designProperties:",this.designProperties),console.log("🔄 GlobalDesignTab: onUpdate callback exists:",!!this.onUpdate);const e={};switch(t){case"text":e.color=void 0,e.text_align=void 0,e.font_size=void 0,e.line_height=void 0,e.letter_spacing=void 0,e.font_family=void 0,e.font_weight=void 0,e.text_transform=void 0,e.font_style=void 0;break;case"background":e.background_color=void 0,e.background_image=void 0,e.background_image_type=void 0,e.background_image_entity=void 0,e.backdrop_filter=void 0;break;case"sizes":e.width=void 0,e.height=void 0,e.max_width=void 0,e.max_height=void 0,e.min_width=void 0,e.min_height=void 0;break;case"spacing":e.margin_top=void 0,e.margin_bottom=void 0,e.margin_left=void 0,e.margin_right=void 0,e.padding_top=void 0,e.padding_bottom=void 0,e.padding_left=void 0,e.padding_right=void 0;break;case"border":e.border_radius=void 0,e.border_style=void 0,e.border_width=void 0,e.border_color=void 0;break;case"position":e.position=void 0,e.top=void 0,e.bottom=void 0,e.left=void 0,e.right=void 0,e.z_index=void 0;break;case"text-shadow":e.text_shadow_h=void 0,e.text_shadow_v=void 0,e.text_shadow_blur=void 0,e.text_shadow_color=void 0;break;case"box-shadow":e.box_shadow_h=void 0,e.box_shadow_v=void 0,e.box_shadow_blur=void 0,e.box_shadow_spread=void 0,e.box_shadow_color=void 0;break;case"overflow":e.overflow=void 0,e.clip_path=void 0;break;case"animations":e.animation_type=void 0,e.animation_entity=void 0,e.animation_trigger_type=void 0,e.animation_attribute=void 0,e.animation_state=void 0,e.intro_animation=void 0,e.outro_animation=void 0,e.animation_duration=void 0,e.animation_delay=void 0,e.animation_timing=void 0}if(console.log(`🔄 GlobalDesignTab: Reset properties for ${t}:`,e),this.onUpdate){console.log("🔄 GlobalDesignTab: Using callback approach for section reset");try{this.onUpdate(e),console.log(`🔄 GlobalDesignTab: Callback executed successfully for ${t}`)}catch(e){console.error(`🔄 GlobalDesignTab: Callback error for ${t}:`,e)}}else{console.log("🔄 GlobalDesignTab: Using event approach for section reset");const t=new CustomEvent("design-changed",{detail:e,bubbles:!0,composed:!0});console.log("🔄 GlobalDesignTab: Dispatching reset design-changed event:",t);const o=this.dispatchEvent(t);console.log("🔄 GlobalDesignTab: Event dispatched successfully:",o)}console.log(`🔄 GlobalDesignTab: Requesting update for section ${t}`),this.requestUpdate(),setTimeout((()=>{console.log(`🔄 GlobalDesignTab: Delayed update for section ${t} UI indicators`),this.requestUpdate()}),50),console.log(`✅ GlobalDesignTab: Reset complete for ${t}`)}_copyDesign(){this._clipboardProperties=Object.assign({},this.designProperties),this._saveClipboardToStorage(this._clipboardProperties);const t=Object.keys(this._clipboardProperties).filter((t=>this._clipboardProperties[t])).length;console.log(`Design properties copied to cross-card clipboard (${t} properties)`),this.requestUpdate()}_pasteDesign(){this._clipboardProperties||this._loadClipboardFromStorage(),this._clipboardProperties?(this.onUpdate?this.onUpdate(this._clipboardProperties):this.dispatchEvent(new CustomEvent("design-changed",{detail:this._clipboardProperties,bubbles:!0,composed:!0})),console.log("Design properties pasted from cross-card clipboard")):console.log("No design properties in cross-card clipboard")}_resetAllDesign(){console.log("🔄 GlobalDesignTab: RESET ALL DESIGN CALLED"),console.log("🔄 GlobalDesignTab: Current designProperties:",this.designProperties),console.log("🔄 GlobalDesignTab: onUpdate callback exists:",!!this.onUpdate);const t={color:void 0,text_align:void 0,font_size:void 0,line_height:void 0,letter_spacing:void 0,font_family:void 0,font_weight:void 0,text_transform:void 0,font_style:void 0,background_color:void 0,background_image:void 0,background_image_type:void 0,background_image_entity:void 0,backdrop_filter:void 0,width:void 0,height:void 0,max_width:void 0,max_height:void 0,min_width:void 0,min_height:void 0,margin_top:void 0,margin_bottom:void 0,margin_left:void 0,margin_right:void 0,padding_top:void 0,padding_bottom:void 0,padding_left:void 0,padding_right:void 0,border_radius:void 0,border_style:void 0,border_width:void 0,border_color:void 0,position:void 0,top:void 0,bottom:void 0,left:void 0,right:void 0,z_index:void 0,text_shadow_h:void 0,text_shadow_v:void 0,text_shadow_blur:void 0,text_shadow_color:void 0,box_shadow_h:void 0,box_shadow_v:void 0,box_shadow_blur:void 0,box_shadow_spread:void 0,box_shadow_color:void 0,overflow:void 0,clip_path:void 0,animation_type:void 0,animation_entity:void 0,animation_trigger_type:void 0,animation_attribute:void 0,animation_state:void 0,intro_animation:void 0,outro_animation:void 0,animation_duration:void 0,animation_delay:void 0,animation_timing:void 0};if(console.log("🔄 GlobalDesignTab: Reset properties for ALL sections:",t),this.onUpdate){console.log("🔄 GlobalDesignTab: Using callback approach for reset all");try{this.onUpdate(t),console.log("🔄 GlobalDesignTab: Reset all callback executed successfully")}catch(t){console.error("🔄 GlobalDesignTab: Reset all callback error:",t)}}else{console.log("🔄 GlobalDesignTab: Using event approach for reset all");const e=new CustomEvent("design-changed",{detail:t,bubbles:!0,composed:!0});console.log("🔄 GlobalDesignTab: Dispatching reset all design-changed event:",e);const o=this.dispatchEvent(e);console.log("🔄 GlobalDesignTab: Reset all event dispatched successfully:",o)}console.log("🔄 GlobalDesignTab: Requesting update for reset all"),this.requestUpdate(),setTimeout((()=>{console.log("🔄 GlobalDesignTab: Delayed update for reset all UI indicators"),this.requestUpdate()}),50),console.log("✅ GlobalDesignTab: All design properties reset to default")}_clearClipboard(){this._clipboardProperties=null,this._clearClipboardFromStorage(),console.log("Cross-card clipboard cleared"),this.requestUpdate()}async _handleBackgroundImageUpload(t){var e;const o=null===(e=t.target.files)||void 0===e?void 0:e[0];if(o&&this.hass)try{const t=await async function(t,e){var o;if(!e)throw console.error("[UPLOAD] Missing file."),new Error("No file provided for upload.");if(!(t&&t.auth&&t.auth.data&&t.auth.data.access_token))throw console.error("[UPLOAD] Missing Home Assistant authentication details."),new Error("Authentication details are missing.");const i=new FormData;i.append("file",e);let n="";n=t.connection&&"string"==typeof(null===(o=t.connection.options)||void 0===o?void 0:o.url)?t.connection.options.url.replace(/^ws/,"http"):"function"==typeof t.hassUrl?t.hassUrl():`${window.location.protocol}//${window.location.host}`;const a=`${n.replace(/\/$/,"")}/api/image/upload`;try{const e=await fetch(a,{method:"POST",headers:{Authorization:`Bearer ${t.auth.data.access_token}`},body:i});if(!e.ok){const t=await e.text();throw console.error(`[UPLOAD] Failed to upload image via ${a}: ${e.status} ${e.statusText}`,t),new Error(`Failed to upload image via ${a}: ${e.statusText}`)}const o=await e.json();if(!o||!o.id)throw console.error(`[UPLOAD] Invalid response from ${a}: missing id`,o),new Error(`Invalid response from ${a}: missing id`);return`/api/image/serve/${o.id}`}catch(t){throw console.error(`[UPLOAD] Error during fetch to ${a}:`,t),new Error(`Upload via ${a} failed: ${t instanceof Error?t.message:"Unknown network error"}`)}}(this.hass,o),e={background_image:t,background_image_type:"upload"};this.onUpdate?this.onUpdate(e):this.dispatchEvent(new CustomEvent("design-changed",{detail:e,bubbles:!0,composed:!0}))}catch(t){console.error("Background image upload failed:",t),alert(`Upload failed: ${t instanceof Error?t.message:"Unknown error"}`)}}_truncatePath(t){return t?t.length<=30?t:"..."+t.slice(-27):""}_getStateValueHint(t){if(!this.hass||!t)return"Enter the state value to trigger animation";const e=this.hass.states[t];return e?e.state&&"unknown"!==e.state&&"unavailable"!==e.state?`Current state: ${e.state}`:"Enter the state value to trigger animation":"Entity not found"}_getAttributeNameHint(t){if(!this.hass||!t)return"Enter the attribute name to monitor";const e=this.hass.states[t];if(!e||!e.attributes)return"Entity not found or has no attributes";const o=Object.keys(e.attributes).filter((t=>!t.startsWith("_")&&"object"!=typeof e.attributes[t])).slice(0,3);return o.length>0?`Available attributes: ${o.join(", ")}${Object.keys(e.attributes).length>3?", ...":""}`:"Enter the attribute name to monitor"}_getAttributeValueHint(t,e){if(!this.hass||!t)return"Enter the attribute value to trigger animation";if(!e)return"Select an attribute first";const o=this.hass.states[t];if(!o||!o.attributes)return"Entity not found or has no attributes";const i=o.attributes[e];if(null!=i){const t=String(i);return`Current value: ${t.length>30?`${t.slice(0,27)}...`:t}`}return"Attribute not found - check the attribute name"}_hasModifiedProperties(t){const e=this.designProperties,o=t=>null!=t&&""!==t;switch(t){case"text":return!!(o(e.color)||o(e.text_align)||o(e.font_size)||o(e.line_height)||o(e.letter_spacing)||o(e.font_family)||o(e.font_weight)||o(e.text_transform)||o(e.font_style));case"background":return!!(o(e.background_color)||o(e.background_image)||o(e.background_image_type)||o(e.background_image_entity)||o(e.backdrop_filter));case"sizes":return!!(o(e.width)||o(e.height)||o(e.max_width)||o(e.max_height)||o(e.min_width)||o(e.min_height));case"spacing":return!!(o(e.margin_top)||o(e.margin_bottom)||o(e.margin_left)||o(e.margin_right)||o(e.padding_top)||o(e.padding_bottom)||o(e.padding_left)||o(e.padding_right));case"border":return!!(o(e.border_radius)||o(e.border_style)||o(e.border_width)||o(e.border_color));case"position":return!!(o(e.position)||o(e.top)||o(e.bottom)||o(e.left)||o(e.right)||o(e.z_index));case"text-shadow":return!!(o(e.text_shadow_h)||o(e.text_shadow_v)||o(e.text_shadow_blur)||o(e.text_shadow_color));case"box-shadow":return!!(o(e.box_shadow_h)||o(e.box_shadow_v)||o(e.box_shadow_blur)||o(e.box_shadow_spread)||o(e.box_shadow_color));case"overflow":return!(!o(e.overflow)&&!o(e.clip_path));case"animations":return!!(o(e.animation_type)&&"none"!==e.animation_type||o(e.animation_entity)||o(e.animation_trigger_type)||o(e.animation_attribute)||o(e.animation_state)||o(e.intro_animation)&&"none"!==e.intro_animation||o(e.outro_animation)&&"none"!==e.outro_animation||o(e.animation_duration)||o(e.animation_delay)||o(e.animation_timing)&&"ease"!==e.animation_timing);default:return!1}}_renderAccordion(t,e,o){const i=this._expandedSections.has(o),n=this._hasModifiedProperties(o);return V`
      <div class="accordion-section">
        <div class="accordion-header ${i?"expanded":""}">
          <button class="accordion-toggle" @click=${()=>this._toggleSection(o)}>
            <span class="accordion-title">
              ${t} ${n?V`<span class="edit-indicator"></span>`:""}
            </span>
          </button>
          <div class="accordion-actions">
            ${n?V`
                  <button
                    class="reset-button"
                    @click=${t=>{t.stopPropagation(),this._resetSection(o)}}
                    title="Reset ${t} settings to default"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                `:""}
            <button class="expand-button" @click=${()=>this._toggleSection(o)}>
              <ha-icon icon="mdi:chevron-${i?"up":"down"}"></ha-icon>
            </button>
          </div>
        </div>
        ${i?V`<div class="accordion-content">${e}</div>`:""}
      </div>
    `}render(){return V`
      <div class="global-design-tab">
        <!-- Design Actions Toolbar -->
        <div class="design-toolbar">
          <button
            class="toolbar-button copy-button"
            @click=${this._copyDesign}
            title="Copy current design settings (works across all Ultra Cards)"
          >
            <ha-icon icon="mdi:content-copy"></ha-icon>
            <span>Copy</span>
          </button>

          <button
            class="toolbar-button paste-button ${this._clipboardProperties?"has-content":""}"
            @click=${this._pasteDesign}
            ?disabled=${!this._clipboardProperties}
            title="${this._clipboardProperties?"Paste copied design settings (from cross-card clipboard)":"No design settings in cross-card clipboard"}"
          >
            <ha-icon icon="mdi:content-paste"></ha-icon>
            <span>Paste</span>
          </button>

          <button
            class="toolbar-button reset-all-button"
            @click=${this._resetAllDesign}
            title="Reset all design settings to default"
          >
            <ha-icon icon="mdi:refresh"></ha-icon>
            <span>Reset All</span>
          </button>
        </div>

        ${this._renderAccordion("Text",V`
            <div class="property-group">
              <ultra-color-picker
                .label=${"Text Color"}
                .value=${this.designProperties.color||""}
                .defaultValue=${"var(--primary-text-color)"}
                .hass=${this.hass}
                @value-changed=${t=>this._updateProperty("color",t.detail.value)}
              ></ultra-color-picker>
            </div>

            <div class="property-group">
              <label>Alignment:</label>
              <div class="button-group">
                ${["left","center","right","justify"].map((t=>V`
                    <button
                      class="property-btn ${this.designProperties.text_align===t?"active":""}"
                      @click=${()=>this._updateProperty("text_align",t)}
                    >
                      <ha-icon icon="mdi:format-align-${t}"></ha-icon>
                    </button>
                  `))}
              </div>
            </div>

            <div class="property-group">
              <label>Font Size:</label>
              <input
                type="text"
                .value=${this.designProperties.font_size||""}
                @input=${t=>this._updateProperty("font_size",t.target.value)}
                placeholder="16px, 1.2rem, max(1rem, 1.5vw)"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Line Height:</label>
              <input
                type="text"
                .value=${this.designProperties.line_height||""}
                @input=${t=>this._updateProperty("line_height",t.target.value)}
                placeholder="28px, 1.7"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Letter Spacing:</label>
              <input
                type="text"
                .value=${this.designProperties.letter_spacing||""}
                @input=${t=>this._updateProperty("letter_spacing",t.target.value)}
                placeholder="1px, -0.04em"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Font:</label>
              <select
                .value=${this.designProperties.font_family||""}
                @change=${t=>this._updateProperty("font_family",t.target.value)}
                class="property-select"
              >
                <option value="">– Default –</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Helvetica, sans-serif">Helvetica</option>
                <option value="Times New Roman, serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Verdana, sans-serif">Verdana</option>
              </select>
            </div>

            <div class="property-group">
              <label>Font Weight:</label>
              <select
                .value=${this.designProperties.font_weight||""}
                @change=${t=>this._updateProperty("font_weight",t.target.value)}
                class="property-select"
              >
                <option value="">– Default –</option>
                <option value="100">100 - Thin</option>
                <option value="300">300 - Light</option>
                <option value="400">400 - Normal</option>
                <option value="500">500 - Medium</option>
                <option value="600">600 - Semi Bold</option>
                <option value="700">700 - Bold</option>
                <option value="900">900 - Black</option>
              </select>
            </div>

            <div class="property-group">
              <label>Text Transform:</label>
              <select
                .value=${this.designProperties.text_transform||""}
                @change=${t=>this._updateProperty("text_transform",t.target.value)}
                class="property-select"
              >
                <option value="">– Default –</option>
                <option value="none">None</option>
                <option value="uppercase">UPPERCASE</option>
                <option value="lowercase">lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </div>

            <div class="property-group">
              <label>Font Style:</label>
              <select
                .value=${this.designProperties.font_style||""}
                @change=${t=>this._updateProperty("font_style",t.target.value)}
                class="property-select"
              >
                <option value="">– Default –</option>
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
                <option value="oblique">Oblique</option>
              </select>
            </div>
          `,"text")}
        ${this._renderAccordion("Background",V`
            <div class="property-group">
              <ultra-color-picker
                .label=${"Background Color"}
                .value=${this.designProperties.background_color||""}
                .defaultValue=${"transparent"}
                .hass=${this.hass}
                @value-changed=${t=>this._updateProperty("background_color",t.detail.value)}
              ></ultra-color-picker>
            </div>

            <div class="property-group">
              <label>Background Image Type:</label>
              <select
                .value=${this.designProperties.background_image_type||"none"}
                @change=${t=>this._updateProperty("background_image_type",t.target.value)}
                class="property-select"
              >
                <option value="none">None</option>
                <option value="upload">Upload Image</option>
                <option value="entity">Entity Image</option>
                <option value="url">Image URL</option>
              </select>
            </div>

            ${"upload"===this.designProperties.background_image_type?V`
                  <div class="property-group">
                    <label>Upload Background Image:</label>
                    <div class="upload-container">
                      <div class="file-upload-row">
                        <label class="file-upload-button">
                          <div class="button-content">
                            <ha-icon icon="mdi:upload"></ha-icon>
                            <span class="button-label">Choose File</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            @change=${this._handleBackgroundImageUpload}
                            style="display: none"
                          />
                        </label>
                        <div class="path-display">
                          ${this.designProperties.background_image?V`<span
                                class="uploaded-path"
                                title="${this.designProperties.background_image}"
                              >
                                ${this._truncatePath(this.designProperties.background_image)}
                              </span>`:V`<span class="no-file">No file chosen</span>`}
                        </div>
                      </div>
                    </div>
                  </div>
                `:""}
            ${"entity"===this.designProperties.background_image_type?V`
                  <div class="property-group">
                    <label>Background Image Entity:</label>
                    <ha-entity-picker
                      .hass=${this.hass}
                      .value=${this.designProperties.background_image_entity||""}
                      @value-changed=${t=>this._updateProperty("background_image_entity",t.detail.value)}
                      .label=${"Select entity with image attribute"}
                      allow-custom-entity
                    ></ha-entity-picker>
                  </div>
                `:""}
            ${"url"===this.designProperties.background_image_type?V`
                  <div class="property-group">
                    <label>Background Image URL:</label>
                    <input
                      type="text"
                      .value=${this.designProperties.background_image||""}
                      @input=${t=>this._updateProperty("background_image",t.target.value)}
                      placeholder="https://example.com/image.jpg"
                      class="property-input"
                    />
                  </div>
                `:""}

            <div class="property-group">
              <label>Backdrop Filter:</label>
              <input
                type="text"
                .value=${this.designProperties.backdrop_filter||""}
                @input=${t=>this._updateProperty("backdrop_filter",t.target.value)}
                placeholder="blur(10px), grayscale(100%), invert(75%)"
                class="property-input"
              />
            </div>
          `,"background")}
        ${this._renderAccordion("Sizes",V`
            <div class="property-group">
              <label>Width:</label>
              <input
                type="text"
                .value=${this.designProperties.width||""}
                @input=${t=>this._updateProperty("width",t.target.value)}
                @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.width||"",(t=>this._updateProperty("width",t)))}
                placeholder="200px, 100%, 14rem, 10vw"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Height:</label>
              <input
                type="text"
                .value=${this.designProperties.height||""}
                @input=${t=>this._updateProperty("height",t.target.value)}
                @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.height||"",(t=>this._updateProperty("height",t)))}
                placeholder="200px, 15rem, 10vh"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Max Width:</label>
              <input
                type="text"
                .value=${this.designProperties.max_width||""}
                @input=${t=>this._updateProperty("max_width",t.target.value)}
                @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.max_width||"",(t=>this._updateProperty("max_width",t)))}
                placeholder="200px, 100%, 14rem, 10vw"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Max Height:</label>
              <input
                type="text"
                .value=${this.designProperties.max_height||""}
                @input=${t=>this._updateProperty("max_height",t.target.value)}
                placeholder="200px, 15rem, 10vh"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Min Width:</label>
              <input
                type="text"
                .value=${this.designProperties.min_width||""}
                @input=${t=>this._updateProperty("min_width",t.target.value)}
                placeholder="200px, 100%, 14rem, 10vw"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Min Height:</label>
              <input
                type="text"
                .value=${this.designProperties.min_height||""}
                @input=${t=>this._updateProperty("min_height",t.target.value)}
                placeholder="200px, 15rem, 10vh"
                class="property-input"
              />
            </div>
          `,"sizes")}
        ${this._renderAccordion("Spacing",V`
            <div class="spacing-group">
              <div class="spacing-header">
                <h4>Margin</h4>
                <button
                  type="button"
                  class="lock-button ${this._marginLocked?"locked":""}"
                  @click=${()=>this._toggleSpacingLock("margin")}
                  title="${this._marginLocked?"Unlock to edit sides independently":"Lock to edit all sides together"}"
                >
                  <ha-icon icon="${this._marginLocked?"mdi:lock":"mdi:lock-open"}"></ha-icon>
                </button>
              </div>
              <div class="spacing-fields-desktop">
                <div class="spacing-field">
                  <label>Top</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this.designProperties.margin_top||""}
                    @input=${t=>this._updateSpacing("margin","top",t.target.value)}
                    @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.margin_top||"",(t=>this._updateSpacing("margin","top",t)))}
                    class="spacing-input"
                  />
                </div>
                <div class="spacing-field">
                  <label>Right</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this.designProperties.margin_right||""}
                    @input=${t=>this._updateSpacing("margin","right",t.target.value)}
                    @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.margin_right||"",(t=>this._updateSpacing("margin","right",t)))}
                    class="spacing-input"
                  />
                </div>
                <div class="spacing-field">
                  <label>Bottom</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this.designProperties.margin_bottom||""}
                    @input=${t=>this._updateSpacing("margin","bottom",t.target.value)}
                    @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.margin_bottom||"",(t=>this._updateSpacing("margin","bottom",t)))}
                    class="spacing-input"
                  />
                </div>
                <div class="spacing-field">
                  <label>Left</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this.designProperties.margin_left||""}
                    @input=${t=>this._updateSpacing("margin","left",t.target.value)}
                    @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.margin_left||"",(t=>this._updateSpacing("margin","left",t)))}
                    class="spacing-input"
                  />
                </div>
              </div>
            </div>

            <div class="spacing-group">
              <div class="spacing-header">
                <h4>Padding</h4>
                <button
                  type="button"
                  class="lock-button ${this._paddingLocked?"locked":""}"
                  @click=${()=>this._toggleSpacingLock("padding")}
                  title="${this._paddingLocked?"Unlock to edit sides independently":"Lock to edit all sides together"}"
                >
                  <ha-icon icon="${this._paddingLocked?"mdi:lock":"mdi:lock-open"}"></ha-icon>
                </button>
              </div>
              <div class="spacing-fields-desktop">
                <div class="spacing-field">
                  <label>Top</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this.designProperties.padding_top||""}
                    @input=${t=>this._updateSpacing("padding","top",t.target.value)}
                    @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.padding_top||"",(t=>this._updateSpacing("padding","top",t)))}
                    class="spacing-input"
                  />
                </div>
                <div class="spacing-field">
                  <label>Right</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this.designProperties.padding_right||""}
                    @input=${t=>this._updateSpacing("padding","right",t.target.value)}
                    @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.padding_right||"",(t=>this._updateSpacing("padding","right",t)))}
                    class="spacing-input"
                  />
                </div>
                <div class="spacing-field">
                  <label>Bottom</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this.designProperties.padding_bottom||""}
                    @input=${t=>this._updateSpacing("padding","bottom",t.target.value)}
                    @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.padding_bottom||"",(t=>this._updateSpacing("padding","bottom",t)))}
                    class="spacing-input"
                  />
                </div>
                <div class="spacing-field">
                  <label>Left</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this.designProperties.padding_left||""}
                    @input=${t=>this._updateSpacing("padding","left",t.target.value)}
                    @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.padding_left||"",(t=>this._updateSpacing("padding","left",t)))}
                    class="spacing-input"
                  />
                </div>
              </div>
            </div>
          `,"spacing")}
        ${this._renderAccordion("Border",V`
            <div class="property-group">
              <label>Border Radius:</label>
              <input
                type="text"
                .value=${this.designProperties.border_radius||""}
                @input=${t=>this._updateProperty("border_radius",t.target.value)}
                @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.border_radius||"",(t=>this._updateProperty("border_radius",t)))}
                placeholder="5px, 50%, 0.3em, 12px 0"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Border Style:</label>
              <select
                .value=${this.designProperties.border_style||""}
                @change=${t=>this._updateProperty("border_style",t.target.value)}
                class="property-select"
              >
                <option value="">None</option>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="double">Double</option>
              </select>
            </div>

            <div class="property-group">
              <label>Border Width:</label>
              <input
                type="text"
                .value=${this.designProperties.border_width||""}
                @input=${t=>this._updateProperty("border_width",t.target.value)}
                @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.border_width||"",(t=>this._updateProperty("border_width",t)))}
                placeholder="1px, 2px, 0.125rem"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <ultra-color-picker
                .label=${"Border Color"}
                .value=${this.designProperties.border_color||""}
                .defaultValue=${"var(--divider-color)"}
                .hass=${this.hass}
                @value-changed=${t=>this._updateProperty("border_color",t.detail.value)}
              ></ultra-color-picker>
            </div>
          `,"border")}
        ${this._renderAccordion("Position",V`
            <div class="property-group">
              <label>Position:</label>
              <select
                .value=${this.designProperties.position||""}
                @change=${t=>this._updateProperty("position",t.target.value)}
                class="property-select"
              >
                <option value="">– Default –</option>
                <option value="static">Static</option>
                <option value="relative">Relative</option>
                <option value="absolute">Absolute</option>
                <option value="fixed">Fixed</option>
                <option value="sticky">Sticky</option>
              </select>
            </div>

            ${this.designProperties.position&&"static"!==this.designProperties.position?V`
                  <div class="position-grid">
                    <input
                      type="text"
                      placeholder="Top"
                      .value=${this.designProperties.top||""}
                      @input=${t=>this._updateProperty("top",t.target.value)}
                      @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.top||"",(t=>this._updateProperty("top",t)))}
                    />
                    <div class="position-row">
                      <input
                        type="text"
                        placeholder="Left"
                        .value=${this.designProperties.left||""}
                        @input=${t=>this._updateProperty("left",t.target.value)}
                        @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.left||"",(t=>this._updateProperty("left",t)))}
                      />
                      <div class="position-center">POS</div>
                      <input
                        type="text"
                        placeholder="Right"
                        .value=${this.designProperties.right||""}
                        @input=${t=>this._updateProperty("right",t.target.value)}
                        @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.right||"",(t=>this._updateProperty("right",t)))}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Bottom"
                      .value=${this.designProperties.bottom||""}
                      @input=${t=>this._updateProperty("bottom",t.target.value)}
                      @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.bottom||"",(t=>this._updateProperty("bottom",t)))}
                    />
                  </div>

                  <div class="property-group">
                    <label>Z-Index:</label>
                    <input
                      type="text"
                      .value=${this.designProperties.z_index||""}
                      @input=${t=>this._updateProperty("z_index",t.target.value)}
                      @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.z_index||"",(t=>this._updateProperty("z_index",t)))}
                      placeholder="-1, 1, 3, 50"
                      class="property-input"
                    />
                  </div>
                `:""}
          `,"position")}
        ${this._renderAccordion("Text Shadow",V`
            <div class="property-group">
              <label>Horizontal Shift:</label>
              <input
                type="text"
                .value=${this.designProperties.text_shadow_h||""}
                @input=${t=>this._updateProperty("text_shadow_h",t.target.value)}
                @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.text_shadow_h||"",(t=>this._updateProperty("text_shadow_h",t)))}
                placeholder="0, 3px, 0.05em, 2rem"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Vertical Shift:</label>
              <input
                type="text"
                .value=${this.designProperties.text_shadow_v||""}
                @input=${t=>this._updateProperty("text_shadow_v",t.target.value)}
                @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.text_shadow_v||"",(t=>this._updateProperty("text_shadow_v",t)))}
                placeholder="0, 3px, 0.05em, 2rem"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Blur:</label>
              <input
                type="text"
                .value=${this.designProperties.text_shadow_blur||""}
                @input=${t=>this._updateProperty("text_shadow_blur",t.target.value)}
                @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.text_shadow_blur||"",(t=>this._updateProperty("text_shadow_blur",t)))}
                placeholder="0, 3px, 0.05em, 2rem"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <ultra-color-picker
                .label=${"Text Shadow Color"}
                .value=${this.designProperties.text_shadow_color||""}
                .defaultValue=${"rgba(0,0,0,0.5)"}
                .hass=${this.hass}
                @value-changed=${t=>this._updateProperty("text_shadow_color",t.detail.value)}
              ></ultra-color-picker>
            </div>
          `,"text-shadow")}
        ${this._renderAccordion("Box Shadow",V`
            <div class="property-group">
              <label>Horizontal Shift:</label>
              <input
                type="text"
                .value=${this.designProperties.box_shadow_h||""}
                @input=${t=>this._updateProperty("box_shadow_h",t.target.value)}
                @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.box_shadow_h||"",(t=>this._updateProperty("box_shadow_h",t)))}
                placeholder="0, 3px, 0.05em, 2rem"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Vertical Shift:</label>
              <input
                type="text"
                .value=${this.designProperties.box_shadow_v||""}
                @input=${t=>this._updateProperty("box_shadow_v",t.target.value)}
                @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.box_shadow_v||"",(t=>this._updateProperty("box_shadow_v",t)))}
                placeholder="0, 3px, 0.05em, 2rem"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Blur:</label>
              <input
                type="text"
                .value=${this.designProperties.box_shadow_blur||""}
                @input=${t=>this._updateProperty("box_shadow_blur",t.target.value)}
                @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.box_shadow_blur||"",(t=>this._updateProperty("box_shadow_blur",t)))}
                placeholder="0, 3px, 0.05em, 2rem"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Spread:</label>
              <input
                type="text"
                .value=${this.designProperties.box_shadow_spread||""}
                @input=${t=>this._updateProperty("box_shadow_spread",t.target.value)}
                @keydown=${t=>this._handleNumericKeydown(t,this.designProperties.box_shadow_spread||"",(t=>this._updateProperty("box_shadow_spread",t)))}
                placeholder="0, 3px, 0.05em, 2rem"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <ultra-color-picker
                .label=${"Box Shadow Color"}
                .value=${this.designProperties.box_shadow_color||""}
                .defaultValue=${"rgba(0,0,0,0.1)"}
                .hass=${this.hass}
                @value-changed=${t=>this._updateProperty("box_shadow_color",t.detail.value)}
              ></ultra-color-picker>
            </div>
          `,"box-shadow")}
        ${this._renderAccordion("Overflow",V`
            <div class="property-group">
              <label>Overflow:</label>
              <select
                .value=${this.designProperties.overflow||"hidden"}
                @change=${t=>this._updateProperty("overflow",t.target.value)}
                class="property-select"
              >
                <option value="hidden">Hidden (Default)</option>
                <option value="visible">Visible</option>
                <option value="scroll">Scroll</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div class="property-group">
              <label>Clip-path:</label>
              <input
                type="text"
                .value=${this.designProperties.clip_path||""}
                @input=${t=>this._updateProperty("clip_path",t.target.value)}
                placeholder="ellipse(75% 100% at bottom)"
                class="property-input"
              />
              <small class="property-hint"
                >Examples:<br />
                ellipse(75% 100% at bottom)<br />
                polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)<br />
                polygon(100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%, 25% 6.7%, 75% 6.7%)
              </small>
            </div>
          `,"overflow")}
        ${this._renderAccordion("Animations",V`
            <!-- State-based Animation -->
            <div class="property-section">
              <h5>State-based Animation</h5>
              <div class="property-group">
                <label>Animation Type:</label>
                <select
                  .value=${this.designProperties.animation_type||"none"}
                  @change=${t=>this._updateProperty("animation_type",t.target.value)}
                  class="property-select"
                >
                  <option value="none">None</option>
                  <option value="pulse">Pulse</option>
                  <option value="vibrate">Vibrate</option>
                  <option value="rotate-left">Rotate Left</option>
                  <option value="rotate-right">Rotate Right</option>
                  <option value="hover">Hover</option>
                  <option value="fade">Fade</option>
                  <option value="scale">Scale</option>
                  <option value="bounce">Bounce</option>
                  <option value="shake">Shake</option>
                  <option value="tada">Tada</option>
                </select>
              </div>

              <div class="property-group">
                <label>Animation Duration:</label>
                <input
                  type="text"
                  .value=${this.designProperties.animation_duration||"2s"}
                  @input=${t=>this._updateProperty("animation_duration",t.target.value)}
                  placeholder="2s, 500ms, 1.5s"
                  class="property-input"
                />
                <small class="property-hint">
                  Duration for the animation (e.g., 2s, 500ms, 1.5s)
                </small>
              </div>

              ${this.designProperties.animation_type&&"none"!==this.designProperties.animation_type?V`
                    <div class="property-group">
                      <label>Entity to Monitor:</label>
                      <ha-form
                        .hass=${this.hass}
                        .data=${{entity:this.designProperties.animation_entity||""}}
                        .schema=${[{name:"entity",selector:{entity:{}}}]}
                        @value-changed=${t=>this._updateProperty("animation_entity",t.detail.value.entity)}
                      ></ha-form>
                    </div>

                    ${this.designProperties.animation_entity?V`
                          <div class="property-group">
                            <label>Animation Trigger Type:</label>
                            <select
                              id="animation-trigger-type-select"
                              .value=${this.designProperties.animation_trigger_type||"state"}
                              @change=${t=>{const e=t.target.value;console.log("Animation trigger type changing to:",e);const o={animation_trigger_type:e,animation_state:"",animation_attribute:""};this.onUpdate?this.onUpdate(o):this.dispatchEvent(new CustomEvent("design-changed",{detail:o,bubbles:!0,composed:!0})),this.designProperties=Object.assign(Object.assign({},this.designProperties),o),this.requestUpdate()}}
                              class="property-select ${"attribute"===this.designProperties.animation_trigger_type?"attribute-mode":"state-mode"}"
                            >
                              <option value="state">Entity State</option>
                              <option value="attribute">Entity Attribute</option>
                            </select>
                            <div
                              class="trigger-type-indicator ${"attribute"===this.designProperties.animation_trigger_type?"attribute-mode-indicator":"state-mode-indicator"}"
                            >
                              <ha-icon
                                icon="${"attribute"===this.designProperties.animation_trigger_type?"mdi:format-list-checks":"mdi:state-machine"}"
                              ></ha-icon>
                              <span
                                >${"attribute"===this.designProperties.animation_trigger_type?"Attribute mode: select an attribute and its value to trigger the animation":"State mode: enter a state value to trigger the animation"}</span
                              >
                            </div>
                          </div>

                          ${(()=>{const t=this.designProperties.animation_trigger_type||"state",e="attribute"===t;return console.log("TRIGGER TYPE DETECTION:",{currentTriggerType:t,isAttributeMode:e,entitySelected:!!this.designProperties.animation_entity,attributeSelected:!!this.designProperties.animation_attribute,stateValue:this.designProperties.animation_state}),e?(console.log("🟢 RENDERING ATTRIBUTE MODE UI"),console.log("Rendering attribute mode UI"),V`
                                <div class="property-group attribute-mode-container">
                                  <div class="property-group">
                                    <label>
                                      <ha-icon icon="mdi:format-list-checks"></ha-icon>
                                      Attribute Name:
                                    </label>
                                    <input
                                      type="text"
                                      .value=${this.designProperties.animation_attribute||""}
                                      @input=${t=>{const e=t.target.value;console.log("Animation attribute changed to:",e),console.log("Current entity:",this.designProperties.animation_entity),console.log("Current trigger type:",this.designProperties.animation_trigger_type);const o=t.target;o.classList.add("change-success");const i={animation_attribute:e,animation_state:""};this.onUpdate?this.onUpdate(i):this.dispatchEvent(new CustomEvent("design-changed",{detail:i,bubbles:!0,composed:!0})),setTimeout((()=>{console.log("First UI refresh after attribute change (50ms)"),this.requestUpdate()}),50),setTimeout((()=>{console.log("Second UI refresh after attribute change (150ms)"),this.requestUpdate()}),150),setTimeout((()=>{console.log("Third UI refresh after attribute change (300ms)"),this.requestUpdate()}),300),setTimeout((()=>{console.log("Final UI refresh after attribute change (500ms)"),this.requestUpdate(),o.classList.remove("change-success")}),500)}}
                                      placeholder="friendly_name, device_class, state, etc."
                                      class="property-input attribute-mode-input"
                                    />
                                    <small class="property-hint">
                                      Enter the attribute name manually (e.g., friendly_name,
                                      device_class, state, battery_level)
                                    </small>
                                  </div>

                                  <div class="property-group">
                                    <label>
                                      <ha-icon icon="mdi:format-text"></ha-icon>
                                      Attribute Value:
                                    </label>
                                    <input
                                      type="text"
                                      .value=${this.designProperties.animation_state||""}
                                      @input=${t=>this._updateProperty("animation_state",t.target.value)}
                                      placeholder="blue, 255, heating, on, off, etc."
                                      class="property-input attribute-value-input"
                                    />
                                    <small class="property-hint">
                                      Enter the attribute value that will trigger the animation
                                    </small>
                                  </div>
                                </div>
                              `):(console.log("🔵 RENDERING STATE MODE UI"),V`
                                <div
                                  class="property-group state-value-container"
                                  style="display: ${"attribute"!==String(this.designProperties.animation_trigger_type)?"block !important":"none !important"}"
                                  data-mode="state"
                                >
                                  <label>
                                    <ha-icon icon="mdi:state-machine"></ha-icon>
                                    State Value:
                                  </label>
                                  <input
                                    type="text"
                                    .value=${this.designProperties.animation_state||""}
                                    @input=${t=>this._updateProperty("animation_state",t.target.value)}
                                    placeholder="on, off, playing, idle, etc."
                                    class="property-input state-value-input"
                                  />
                                  <small class="property-hint">
                                    Enter the exact state value that will trigger the animation
                                  </small>
                                  <div class="property-hint state-value-hint">
                                    <ha-icon icon="mdi:information-outline"></ha-icon>
                                    <span>
                                      ${this._getStateValueHint(this.designProperties.animation_entity)}
                                    </span>
                                  </div>
                                </div>
                              `)})()}
                        `:V`
                          <div class="property-group">
                            <label>Trigger Type:</label>
                            <select disabled class="property-select">
                              <option>Select an entity first</option>
                            </select>
                            <small class="property-hint">
                              Select an entity first to configure trigger conditions
                            </small>
                          </div>
                        `}
                  `:""}
            </div>

            <!-- Intro/Outro Animations -->
            <div class="property-section">
              <h5>Intro & Outro Animations</h5>
              <div class="two-column-grid">
                <div class="property-group">
                  <label>Intro Animation:</label>
                  <select
                    .value=${this.designProperties.intro_animation||"none"}
                    @change=${t=>this._updateProperty("intro_animation",t.target.value)}
                    class="property-select"
                  >
                    <option value="none">None</option>
                    <option value="fadeIn">Fade In</option>
                    <option value="slideInUp">Slide In Up</option>
                    <option value="slideInDown">Slide In Down</option>
                    <option value="slideInLeft">Slide In Left</option>
                    <option value="slideInRight">Slide In Right</option>
                    <option value="zoomIn">Zoom In</option>
                    <option value="bounceIn">Bounce In</option>
                    <option value="flipInX">Flip In X</option>
                    <option value="flipInY">Flip In Y</option>
                    <option value="rotateIn">Rotate In</option>
                  </select>
                </div>

                <div class="property-group">
                  <label>Outro Animation:</label>
                  <select
                    .value=${this.designProperties.outro_animation||"none"}
                    @change=${t=>this._updateProperty("outro_animation",t.target.value)}
                    class="property-select"
                  >
                    <option value="none">None</option>
                    <option value="fadeOut">Fade Out</option>
                    <option value="slideOutUp">Slide Out Up</option>
                    <option value="slideOutDown">Slide Out Down</option>
                    <option value="slideOutLeft">Slide Out Left</option>
                    <option value="slideOutRight">Slide Out Right</option>
                    <option value="zoomOut">Zoom Out</option>
                    <option value="bounceOut">Bounce Out</option>
                    <option value="flipOutX">Flip Out X</option>
                    <option value="flipOutY">Flip Out Y</option>
                    <option value="rotateOut">Rotate Out</option>
                  </select>
                </div>
              </div>

              <!-- Animation Settings -->
              <div class="three-column-grid">
                <div class="property-group">
                  <label>Duration:</label>
                  <input
                    type="text"
                    .value=${this.designProperties.animation_duration||""}
                    @input=${t=>this._updateProperty("animation_duration",t.target.value)}
                    placeholder="0.3s, 500ms"
                    class="property-input"
                  />
                </div>

                <div class="property-group">
                  <label>Delay:</label>
                  <input
                    type="text"
                    .value=${this.designProperties.animation_delay||""}
                    @input=${t=>this._updateProperty("animation_delay",t.target.value)}
                    placeholder="0s, 100ms"
                    class="property-input"
                  />
                </div>

                <div class="property-group">
                  <label>Timing:</label>
                  <select
                    .value=${this.designProperties.animation_timing||"ease"}
                    @change=${t=>this._updateProperty("animation_timing",t.target.value)}
                    class="property-select"
                  >
                    <option value="ease">Ease</option>
                    <option value="linear">Linear</option>
                    <option value="ease-in">Ease In</option>
                    <option value="ease-out">Ease Out</option>
                    <option value="ease-in-out">Ease In Out</option>
                    <option value="cubic-bezier(0.25,0.1,0.25,1)">Custom Cubic</option>
                  </select>
                </div>
              </div>
            </div>
          `,"animations")}
      </div>
    `}static get styles(){return a`
      .global-design-tab {
        display: flex;
        flex-direction: column;
        gap: 8px;
        box-sizing: border-box;
        overflow: hidden;
      }

      .design-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        margin-bottom: 8px;
        box-sizing: border-box;
        overflow: hidden;
      }

      .toolbar-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        font-weight: 500;
        min-width: 0;
        flex: 1;
        justify-content: center;
      }

      .toolbar-button:hover:not(:disabled) {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .toolbar-button:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .toolbar-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--disabled-background-color, #f5f5f5);
        color: var(--disabled-text-color, #999);
        border-color: var(--disabled-border-color, #ddd);
      }

      .toolbar-button ha-icon {
        font-size: 16px;
        flex-shrink: 0;
      }

      .toolbar-button span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Specific button styling */
      .copy-button:hover:not(:disabled) {
        border-color: var(--info-color, #2196f3);
        background: var(--info-color, #2196f3);
      }

      .paste-button.has-content {
        border-color: var(--success-color, #4caf50);
        background: rgba(76, 175, 80, 0.1);
      }

      .paste-button.has-content:hover:not(:disabled) {
        border-color: var(--success-color, #4caf50);
        background: var(--success-color, #4caf50);
        color: white;
      }

      .reset-all-button:hover:not(:disabled) {
        border-color: var(--error-color, #f44336);
        background: var(--error-color, #f44336);
      }

      /* Responsive design for smaller screens */
      @media (max-width: 768px) {
        .design-toolbar {
          flex-direction: column;
          gap: 8px;
        }

        .toolbar-button {
          width: 100%;
          justify-content: center;
        }
      }

      @media (max-width: 480px) {
        .toolbar-button span {
          display: none;
        }

        .toolbar-button {
          min-width: 44px;
          padding: 8px;
          justify-content: center;
        }

        .design-toolbar {
          flex-direction: row;
          justify-content: space-around;
        }
      }

      .accordion-section {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
        box-sizing: border-box;
      }

      .accordion-header {
        width: 100%;
        padding: 12px 16px;
        background: var(--secondary-background-color);
        border: none;
        border-radius: 8px 8px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 500;
        color: var(--primary-text-color);
        transition: background-color 0.2s ease;
        box-sizing: border-box;
      }

      .accordion-header:hover {
        background: var(--primary-color);
        color: white;
      }

      .accordion-header.expanded {
        background: var(--primary-color);
        color: white;
        border-radius: 8px 8px 0 0;
      }

      .accordion-header:not(.expanded) {
        border-radius: 8px;
      }

      .accordion-toggle {
        background: none;
        border: none;
        color: inherit;
        font: inherit;
        cursor: pointer;
        display: flex;
        align-items: center;
        flex: 1;
        text-align: left;
        padding: 0;
      }

      .accordion-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .reset-button,
      .expand-button {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
        min-width: 24px;
        height: 24px;
      }

      .reset-button:hover,
      .expand-button:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .accordion-header:not(.expanded) .reset-button:hover,
      .accordion-header:not(.expanded) .expand-button:hover {
        background: rgba(0, 0, 0, 0.1);
      }

      .accordion-title {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .edit-indicator {
        width: 8px;
        height: 8px;
        background: var(--primary-color);
        border-radius: 50%;
        display: inline-block;
        animation: pulse 2s ease-in-out infinite;
      }

      .accordion-header.expanded .edit-indicator {
        background: white;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.6;
        }
      }

      .accordion-content {
        padding: 20px;
        background: var(--card-background-color, #fff);
        border-top: 1px solid var(--divider-color);
        border-radius: 0 0 8px 8px;
        position: relative;
        box-sizing: border-box;
        overflow: hidden;
      }

      .property-group {
        margin-bottom: 16px;
        box-sizing: border-box;
        overflow: hidden;
      }

      .property-group:last-child {
        margin-bottom: 0;
      }

      .property-group label {
        display: block;
        font-weight: 500;
        margin-bottom: 4px;
        color: var(--primary-text-color);
      }

      .property-input,
      .property-select {
        width: 100%;
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
        max-width: 100%;
      }

      .property-input:focus,
      .property-select:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      .property-hint {
        display: block;
        font-size: 11px;
        color: var(--secondary-text-color);
        margin-top: 4px;
        line-height: 1.3;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--secondary-text-color);
        cursor: pointer;
      }

      .button-group {
        display: flex;
        gap: 4px;
      }

      .property-btn {
        flex: 1;
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .property-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .property-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .spacing-group {
        margin-bottom: 20px;
      }

      .spacing-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .spacing-group h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .lock-button {
        padding: 6px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
      }

      .lock-button:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .lock-button.locked {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .spacing-fields-desktop {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }

      .spacing-field {
        display: flex;
        flex-direction: column;
      }

      .spacing-field label {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
        text-align: center;
      }

      .spacing-input {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 12px;
        text-align: center;
        box-sizing: border-box;
        max-width: 100%;
      }

      .spacing-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      @media (max-width: 768px) {
        .spacing-fields-desktop {
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
      }

      .spacing-grid,
      .position-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
        align-items: center;
        max-width: 150px;
        margin: 0 auto;
      }

      .spacing-row,
      .position-row {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 8px;
        align-items: center;
      }

      .spacing-center,
      .position-center {
        width: 40px;
        height: 32px;
        background: var(--primary-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-weight: bold;
        font-size: 11px;
      }

      .spacing-grid input,
      .position-grid input {
        width: 100%;
        text-align: center;
        padding: 4px 8px;
        font-size: 12px;
      }

      /* Property sections */
      .property-section {
        margin-bottom: 24px;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--divider-color);
      }

      .property-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .property-section h5 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
        padding-bottom: 8px;
        border-bottom: 1px solid var(--primary-color);
        display: inline-block;
      }

      /* Grid layouts */
      .two-column-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
      }

      .three-column-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 12px;
        margin-bottom: 16px;
      }

      @media (max-width: 768px) {
        .two-column-grid,
        .three-column-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }
      }

      /* Animation keyframes for intro/outro animations */
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      @keyframes slideInUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideOutUp {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(-100%);
          opacity: 0;
        }
      }

      @keyframes slideInDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideOutDown {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(100%);
          opacity: 0;
        }
      }

      @keyframes slideInLeft {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOutLeft {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(-100%);
          opacity: 0;
        }
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      @keyframes zoomIn {
        from {
          transform: scale(0.3);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes zoomOut {
        from {
          transform: scale(1);
          opacity: 1;
        }
        to {
          transform: scale(0.3);
          opacity: 0;
        }
      }

      @keyframes bounceIn {
        0% {
          transform: scale(0.3);
          opacity: 0;
        }
        50% {
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes bounceOut {
        20% {
          transform: scale(0.9);
        }
        50%,
        55% {
          transform: scale(1.05);
          opacity: 1;
        }
        100% {
          transform: scale(0.3);
          opacity: 0;
        }
      }

      @keyframes flipInX {
        from {
          transform: perspective(400px) rotateX(90deg);
          opacity: 0;
        }
        40% {
          transform: perspective(400px) rotateX(-20deg);
        }
        60% {
          transform: perspective(400px) rotateX(10deg);
        }
        80% {
          transform: perspective(400px) rotateX(-5deg);
        }
        to {
          transform: perspective(400px) rotateX(0deg);
          opacity: 1;
        }
      }

      @keyframes flipOutX {
        from {
          transform: perspective(400px) rotateX(0deg);
          opacity: 1;
        }
        to {
          transform: perspective(400px) rotateX(90deg);
          opacity: 0;
        }
      }

      @keyframes flipInY {
        from {
          transform: perspective(400px) rotateY(90deg);
          opacity: 0;
        }
        40% {
          transform: perspective(400px) rotateY(-20deg);
        }
        60% {
          transform: perspective(400px) rotateY(10deg);
        }
        80% {
          transform: perspective(400px) rotateY(-5deg);
        }
        to {
          transform: perspective(400px) rotateY(0deg);
          opacity: 1;
        }
      }

      @keyframes flipOutY {
        from {
          transform: perspective(400px) rotateY(0deg);
          opacity: 1;
        }
        to {
          transform: perspective(400px) rotateY(90deg);
          opacity: 0;
        }
      }

      @keyframes rotateIn {
        from {
          transform: rotate(-200deg);
          opacity: 0;
        }
        to {
          transform: rotate(0deg);
          opacity: 1;
        }
      }

      @keyframes rotateOut {
        from {
          transform: rotate(0deg);
          opacity: 1;
        }
        to {
          transform: rotate(200deg);
          opacity: 0;
        }
      }

      /* Color picker z-index fix */
      ultra-color-picker {
        position: relative;
        z-index: 1000;
      }

      /* Upload button styling */
      .upload-container {
        width: 100%;
      }

      .file-upload-row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }

      .file-upload-button {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 120px;
      }

      .file-upload-button:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
      }

      .button-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .button-label {
        font-size: 14px;
        font-weight: 500;
      }

      .path-display {
        flex: 1;
        min-width: 0;
      }

      .uploaded-path {
        color: var(--primary-text-color);
        font-size: 12px;
        word-break: break-all;
      }

      .no-file {
        color: var(--secondary-text-color);
        font-size: 12px;
        font-style: italic;
      }

      /* Attribute value selection styling */
      .attribute-value-selection {
        display: flex;
        flex-direction: column;
        gap: 8px;
        position: relative;
        margin-bottom: 8px;
      }

      .attribute-value-select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--primary-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
        appearance: menulist;
        cursor: pointer;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
        max-height: 200px;
        overflow-y: auto;
      }

      .attribute-value-select:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
      }

      .attribute-value-select option {
        padding: 8px;
      }

      /* Enhanced attribute mode styling */
      .attribute-mode {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      .attribute-mode-container {
        background: rgba(var(--rgb-primary-color, 0, 140, 255), 0.05);
        padding: 12px;
        border-radius: 4px;
        border-left: 3px solid var(--primary-color);
        margin-bottom: 16px;
      }

      .trigger-type-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        margin: 8px 0;
        border-radius: 4px;
        font-weight: 500;
      }

      .attribute-mode-indicator {
        background: rgba(var(--rgb-primary-color, 0, 140, 255), 0.1);
        border-left: 3px solid var(--primary-color);
        color: var(--primary-color);
      }

      .state-mode-indicator {
        background: rgba(var(--rgb-info-color, 3, 169, 244), 0.1);
        border-left: 3px solid var(--info-color, #03a9f4);
        color: var(--info-color, #03a9f4);
      }

      .attribute-mode-select {
        border-color: var(--primary-color);
      }

      .attribute-value-container {
        background: rgba(var(--rgb-primary-color, 0, 140, 255), 0.05);
        padding: 16px;
        border-radius: 8px;
        border-left: 3px solid var(--primary-color);
        margin-top: 16px;
      }

      .attribute-value-container label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--primary-color);
        font-weight: 600;
        margin-bottom: 8px;
      }

      .attribute-value-selection {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        border: 1px solid var(--primary-color);
        border-radius: 4px;
        background: rgba(var(--rgb-primary-color, 0, 140, 255), 0.05);
        margin-top: 8px;
      }

      .attribute-value-input {
        border-color: var(--primary-color);
        border-width: 2px;
      }

      .attribute-value-dropdown-container {
        background: white;
        padding: 12px;
        border-radius: 4px;
        border: 1px dashed var(--primary-color);
        position: relative;
        overflow: hidden;
      }

      .attribute-value-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--primary-color);
        margin-bottom: 4px;
      }

      .attribute-value-hint {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-top: 8px;
        background: rgba(var(--rgb-primary-color, 0, 140, 255), 0.05);
        padding: 8px;
        border-radius: 4px;
      }

      /* State mode styling */
      .state-value-container {
        background: rgba(var(--rgb-info-color, 3, 169, 244), 0.05);
        padding: 16px;
        border-radius: 8px;
        border-left: 3px solid var(--info-color, #03a9f4);
        margin-top: 16px;
      }

      .state-value-container label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--info-color, #03a9f4);
        font-weight: 600;
        margin-bottom: 8px;
      }

      .state-value-selection {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        border: 1px solid var(--info-color, #03a9f4);
        border-radius: 4px;
        background: rgba(var(--rgb-info-color, 3, 169, 244), 0.05);
        margin-top: 8px;
      }

      .state-value-input {
        border-color: var(--info-color, #03a9f4);
        border-width: 2px;
      }

      .state-value-dropdown-container {
        background: white;
        padding: 12px;
        border-radius: 4px;
        border: 1px dashed var(--info-color, #03a9f4);
        position: relative;
        overflow: hidden;
      }

      .state-value-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--info-color, #03a9f4);
        margin-bottom: 4px;
      }

      .state-value-hint {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-top: 8px;
        background: rgba(var(--rgb-info-color, 3, 169, 244), 0.05);
        padding: 8px;
        border-radius: 4px;
      }

      .state-value-hint ha-icon {
        color: var(--info-color, #03a9f4);
        flex-shrink: 0;
      }

      .attribute-value-hint ha-icon,
      .state-value-hint ha-icon {
        color: currentColor;
        flex-shrink: 0;
      }

      /* Visual feedback animations */
      @keyframes success-pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(var(--rgb-success-color, 76, 175, 80), 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(var(--rgb-success-color, 76, 175, 80), 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(var(--rgb-success-color, 76, 175, 80), 0);
        }
      }

      .change-success {
        animation: success-pulse 0.5s ease-in-out;
        border-color: var(--success-color, #4caf50) !important;
        box-shadow: 0 0 0 1px var(--success-color, #4caf50);
        transition: all 0.3s ease;
      }

      .attribute-mode-select.change-success,
      .state-mode-select.change-success {
        border-width: 2px;
      }

      .select-attribute-first {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        color: var(--warning-color, #ff9800);
        font-style: italic;
        text-align: center;
        background: rgba(var(--rgb-warning-color, 255, 152, 0), 0.05);
        border: 1px dashed var(--warning-color, #ff9800);
        border-radius: 4px;
      }

      /* Mode switch animation */
      @keyframes highlight-fade {
        0% {
          background-color: rgba(var(--rgb-success-color, 76, 175, 80), 0.2);
        }
        100% {
          background-color: transparent;
        }
      }

      .trigger-type-indicator {
        animation: highlight-fade 1.5s ease-out;
      }

      /* Additional highlight animation for mode switches */
      @keyframes border-pulse {
        0% {
          border-left-width: 3px;
        }
        50% {
          border-left-width: 6px;
        }
        100% {
          border-left-width: 3px;
        }
      }

      .attribute-mode-indicator {
        animation: border-pulse 1s ease-in-out;
      }

      .state-mode-indicator {
        animation: border-pulse 1s ease-in-out;
      }

      /* Visual transitions for UI state changes */
      .property-select,
      .property-input,
      .attribute-value-select,
      .state-value-select {
        transition:
          border-color 0.3s ease,
          box-shadow 0.3s ease,
          background-color 0.3s ease;
      }

      /* Value selection feedback */
      .attribute-value-select:focus,
      .state-value-select:focus {
        border-width: 2px;
        transform: translateY(-1px);
      }

      /* Attribute mode specific animations */
      .attribute-mode-select::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(var(--rgb-primary-color, 0, 140, 255), 0.1);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .attribute-mode-select:focus::after {
        opacity: 1;
      }

      /* State mode specific animations */
      .state-value-select::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(var(--rgb-info-color, 3, 169, 244), 0.1);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .state-value-select:focus::after {
        opacity: 1;
      }

      /* Animation classes */
      .fadeIn {
        animation: fadeIn var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .fadeOut {
        animation: fadeOut var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .slideInUp {
        animation: slideInUp var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .slideOutUp {
        animation: slideOutUp var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .slideInDown {
        animation: slideInDown var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .slideOutDown {
        animation: slideOutDown var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .slideInLeft {
        animation: slideInLeft var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .slideOutLeft {
        animation: slideOutLeft var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .slideInRight {
        animation: slideInRight var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .slideOutRight {
        animation: slideOutRight var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .zoomIn {
        animation: zoomIn var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .zoomOut {
        animation: zoomOut var(--animation-duration, 0.3s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .bounceIn {
        animation: bounceIn var(--animation-duration, 0.6s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .bounceOut {
        animation: bounceOut var(--animation-duration, 0.6s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .flipInX {
        animation: flipInX var(--animation-duration, 0.6s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .flipOutX {
        animation: flipOutX var(--animation-duration, 0.6s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .flipInY {
        animation: flipInY var(--animation-duration, 0.6s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .flipOutY {
        animation: flipOutY var(--animation-duration, 0.6s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .rotateIn {
        animation: rotateIn var(--animation-duration, 0.6s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
      .rotateOut {
        animation: rotateOut var(--animation-duration, 0.6s) var(--animation-timing, ease)
          var(--animation-delay, 0s) both;
      }
    `}};de.CLIPBOARD_KEY="ultra-card-design-clipboard",de._lastAnimationTriggerType=null,se([mt({attribute:!1})],de.prototype,"hass",void 0),se([mt({attribute:!1})],de.prototype,"designProperties",void 0),se([mt({type:Function})],de.prototype,"onUpdate",void 0),se([gt()],de.prototype,"_expandedSections",void 0),se([gt()],de.prototype,"_marginLocked",void 0),se([gt()],de.prototype,"_paddingLocked",void 0),se([gt()],de.prototype,"_clipboardProperties",void 0),de=le=se([ct("ultra-global-design-tab")],de);var ce=function(t,e,o,i){var n,a=arguments.length,r=a<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,o,i);else for(var l=t.length-1;l>=0;l--)(n=t[l])&&(r=(a<3?n(r):a>3?n(e,o,r):n(e,o))||r);return a>3&&r&&Object.defineProperty(e,o,r),r};const pe=[{value:"default",label:"– Default –",category:"default"}],ue=[{value:"Montserrat",label:"Montserrat (used as default font)",category:"typography"}],me=[{value:"Georgia, serif",label:"Georgia, serif",category:"websafe"},{value:"Palatino Linotype, Book Antiqua, Palatino, serif",label:"Palatino Linotype, Book Antiqua, Palatino, serif",category:"websafe"},{value:"Times New Roman, Times, serif",label:"Times New Roman, Times, serif",category:"websafe"},{value:"Arial, Helvetica, sans-serif",label:"Arial, Helvetica, sans-serif",category:"websafe"},{value:"Impact, Charcoal, sans-serif",label:"Impact, Charcoal, sans-serif",category:"websafe"},{value:"Lucida Sans Unicode, Lucida Grande, sans-serif",label:"Lucida Sans Unicode, Lucida Grande, sans-serif",category:"websafe"},{value:"Tahoma, Geneva, sans-serif",label:"Tahoma, Geneva, sans-serif",category:"websafe"},{value:"Trebuchet MS, Helvetica, sans-serif",label:"Trebuchet MS, Helvetica, sans-serif",category:"websafe"},{value:"Verdana, Geneva, sans-serif",label:"Verdana, Geneva, sans-serif",category:"websafe"},{value:"Courier New, Courier, monospace",label:"Courier New, Courier, monospace",category:"websafe"},{value:"Lucida Console, Monaco, monospace",label:"Lucida Console, Monaco, monospace",category:"websafe"}];let ge=class extends st{constructor(){super(...arguments),this.isFullScreen=!1,this._showModuleSelector=!1,this._selectedRowIndex=-1,this._selectedColumnIndex=-1,this._showModuleSettings=!1,this._selectedModule=null,this._activeModuleTab="general",this._activeDesignSubtab="text",this._showRowSettings=!1,this._selectedRowForSettings=-1,this._activeRowTab="general",this._showColumnSettings=!1,this._selectedColumnForSettings=null,this._activeColumnTab="general",this._showColumnLayoutSelector=!1,this._selectedRowForLayout=-1,this._draggedItem=null,this._dropTarget=null,this._selectedLayoutModuleIndex=-1,this._showLayoutChildSettings=!1,this._selectedLayoutChild=null,this._collapsedRows=new Set,this._collapsedColumns=new Set,this._collapsedLayoutModules=new Set,this.COLUMN_LAYOUTS=[{id:"1-col",name:"1",proportions:[1],columnCount:1,gridTemplate:"1fr"},{id:"1-2-1-2",name:"1/2 + 1/2",proportions:[1,1],columnCount:2,gridTemplate:"1fr 1fr"},{id:"1-3-2-3",name:"1/3 + 2/3",proportions:[1,2],columnCount:2,gridTemplate:"1fr 2fr"},{id:"2-3-1-3",name:"2/3 + 1/3",proportions:[2,1],columnCount:2,gridTemplate:"2fr 1fr"},{id:"2-5-3-5",name:"2/5 + 3/5",proportions:[2,3],columnCount:2,gridTemplate:"2fr 3fr"},{id:"3-5-2-5",name:"3/5 + 2/5",proportions:[3,2],columnCount:2,gridTemplate:"3fr 2fr"},{id:"1-3-1-3-1-3",name:"1/3 + 1/3 + 1/3",proportions:[1,1,1],columnCount:3,gridTemplate:"1fr 1fr 1fr"},{id:"1-4-1-2-1-4",name:"1/4 + 1/2 + 1/4",proportions:[1,2,1],columnCount:3,gridTemplate:"1fr 2fr 1fr"},{id:"1-5-3-5-1-5",name:"1/5 + 3/5 + 1/5",proportions:[1,3,1],columnCount:3,gridTemplate:"1fr 3fr 1fr"},{id:"1-6-2-3-1-6",name:"1/6 + 2/3 + 1/6",proportions:[1,4,1],columnCount:3,gridTemplate:"1fr 4fr 1fr"},{id:"1-4-1-4-1-4-1-4",name:"1/4 + 1/4 + 1/4 + 1/4",proportions:[1,1,1,1],columnCount:4,gridTemplate:"1fr 1fr 1fr 1fr"},{id:"1-5-1-5-1-5-1-5",name:"1/5 + 1/5 + 1/5 + 1/5",proportions:[1,1,1,1],columnCount:4,gridTemplate:"1fr 1fr 1fr 1fr"},{id:"1-6-1-6-1-6-1-6",name:"1/6 + 1/6 + 1/6 + 1/6",proportions:[1,1,1,1],columnCount:4,gridTemplate:"1fr 1fr 1fr 1fr"},{id:"1-8-1-4-1-4-1-8",name:"1/8 + 1/4 + 1/4 + 1/8",proportions:[1,2,2,1],columnCount:4,gridTemplate:"1fr 2fr 2fr 1fr"},{id:"1-5-1-5-1-5-1-5-1-5",name:"1/5 + 1/5 + 1/5 + 1/5 + 1/5",proportions:[1,1,1,1,1],columnCount:5,gridTemplate:"1fr 1fr 1fr 1fr 1fr"},{id:"1-6-1-6-1-3-1-6-1-6",name:"1/6 + 1/6 + 1/3 + 1/6 + 1/6",proportions:[1,1,2,1,1],columnCount:5,gridTemplate:"1fr 1fr 2fr 1fr 1fr"},{id:"1-8-1-4-1-4-1-4-1-8",name:"1/8 + 1/4 + 1/4 + 1/4 + 1/8",proportions:[1,2,2,2,1],columnCount:5,gridTemplate:"1fr 2fr 2fr 2fr 1fr"},{id:"1-6-1-6-1-6-1-6-1-6-1-6",name:"1/6 + 1/6 + 1/6 + 1/6 + 1/6 + 1/6",proportions:[1,1,1,1,1,1],columnCount:6,gridTemplate:"1fr 1fr 1fr 1fr 1fr 1fr"}]}_createColumnIconHTML(t){const e=t.reduce(((t,e)=>t+e),0);return`<div style="display: flex; width: 100%; height: 16px; gap: 2px;">${t.map(((t,o)=>`<div style="width: ${t/e*100}%; height: 16px; background: #2196F3; border-radius: 2px; ${o>0?"margin-left: 2px;":""}"></div>`)).join("")}</div>`}_createSimpleIcon(t){return t.map((t=>"█".repeat(t))).join(" ")}_getLayoutsForColumnCount(t){const e=Math.min(t,6);return this.COLUMN_LAYOUTS.filter((t=>t.columnCount===e))}_getGridTemplateColumns(t,e){const o=this.COLUMN_LAYOUTS.find((e=>e.id===t));return o&&o.gridTemplate?o.gridTemplate:{"50-50":"1fr 1fr","30-70":"3fr 7fr","70-30":"7fr 3fr","40-60":"4fr 6fr","60-40":"6fr 4fr","33-33-33":"1fr 1fr 1fr","25-50-25":"1fr 2fr 1fr","20-60-20":"1fr 3fr 1fr","25-25-25-25":"1fr 1fr 1fr 1fr"}[t]||`repeat(${e}, 1fr)`}_migrateLegacyLayoutId(t){return{"50-50":"1-2-1-2","30-70":"1-3-2-3","70-30":"2-3-1-3","33-33-33":"1-3-1-3-1-3","25-50-25":"1-4-1-2-1-4","20-60-20":"1-5-3-5-1-5","25-25-25-25":"1-4-1-4-1-4-1-4"}[t]||t}_ensureLayout(){return this.config.layout&&this.config.layout.rows?this._migrateLayoutNames(this.config.layout):{rows:[{id:`row-${Date.now()}`,row_name:"Row 1",columns:[{id:`col-${Date.now()}`,modules:[],vertical_alignment:"center",horizontal_alignment:"center",column_name:"Column 1"}],column_layout:"1-col"}]}}_migrateLayoutNames(t){return{rows:t.rows.map(((t,e)=>{const o=t,i=Object.assign(Object.assign({},o),{row_name:o.row_name||`Row ${e+1}`});if(t.columns){const e=t.columns.map(((t,e)=>{const o=t;return Object.assign(Object.assign({},o),{column_name:o.column_name||`Column ${e+1}`})}));i.columns=e}return i}))}}_updateConfig(t){const e=Object.assign(Object.assign({},this.config),t),o=new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0});this.dispatchEvent(o)}_updateLayout(t){this._updateConfig({layout:t})}_toggleRowCollapse(t){this._collapsedRows.has(t)?this._collapsedRows.delete(t):this._collapsedRows.add(t),this._collapsedRows=new Set(this._collapsedRows),this._saveCollapseState()}_toggleColumnCollapse(t,e){const o=`${t}-${e}`;this._collapsedColumns.has(o)?this._collapsedColumns.delete(o):this._collapsedColumns.add(o),this._collapsedColumns=new Set(this._collapsedColumns),this._saveCollapseState()}_isRowCollapsed(t){return this._collapsedRows.has(t)}_isColumnCollapsed(t,e){const o=`${t}-${e}`;return this._collapsedColumns.has(o)}_toggleLayoutModuleCollapse(t,e,o){const i=`${t}-${e}-${o}`;this._collapsedLayoutModules.has(i)?this._collapsedLayoutModules.delete(i):this._collapsedLayoutModules.add(i),this._collapsedLayoutModules=new Set(this._collapsedLayoutModules),this._saveCollapseState()}_isLayoutModuleCollapsed(t,e,o){const i=`${t}-${e}-${o}`;return this._collapsedLayoutModules.has(i)}_saveCollapseState(){try{const t={collapsedRows:Array.from(this._collapsedRows),collapsedColumns:Array.from(this._collapsedColumns),collapsedLayoutModules:Array.from(this._collapsedLayoutModules)};localStorage.setItem("ultra-card-layout-collapse-state",JSON.stringify(t))}catch(t){console.warn("Failed to save collapse state:",t)}}_loadCollapseState(){try{const t=localStorage.getItem("ultra-card-layout-collapse-state");if(t){const e=JSON.parse(t);this._collapsedRows=new Set(e.collapsedRows||[]),this._collapsedColumns=new Set(e.collapsedColumns||[]),this._collapsedLayoutModules=new Set(e.collapsedLayoutModules||[])}}catch(t){console.warn("Failed to load collapse state:",t)}}_addRow(){console.log("Adding new row...");const t=this._ensureLayout(),e=t.rows.length,o={id:`row-${Date.now()}`,columns:[],column_layout:"1-col",row_name:`Row ${e+1}`},i={rows:[...t.rows,o]};this._updateLayout(i),console.log("Row added successfully (empty row)")}_deleteRow(t){console.log("Deleting row:",t);const e=this._ensureLayout();if(e.rows.length>1){const o={rows:e.rows.filter(((e,o)=>o!==t))};this._updateLayout(o),console.log("Row deleted successfully")}else console.log("Cannot delete the last remaining row")}_duplicateRow(t){console.log("Duplicating row:",t);const e=this._ensureLayout(),o=e.rows[t];if(!o)return void console.error("Row to copy not found at index:",t);const i=t+1,n=Object.assign(Object.assign({},JSON.parse(JSON.stringify(o))),{id:`row-${Date.now()}`,row_name:`Row ${i+1}`,columns:o.columns.map(((t,e)=>Object.assign(Object.assign({},JSON.parse(JSON.stringify(t))),{id:`col-${Date.now()}-${e}-${Math.random().toString(36).substr(2,9)}`,column_name:`Column ${e+1}`,modules:t.modules.map(((t,e)=>Object.assign(Object.assign({},JSON.parse(JSON.stringify(t))),{id:`${t.type}-${Date.now()}-${e}-${Math.random().toString(36).substr(2,9)}`})))})))}),a=JSON.parse(JSON.stringify(e));a.rows.splice(t+1,0,n),this._updateLayout(a),console.log("Row duplicated successfully. New layout has",a.rows.length,"rows")}_addColumn(t){console.log("Adding column to row:",t);const e=this._ensureLayout(),o=e.rows[t];if(!o)return void console.error("Row not found at index:",t);if(o.columns.length>=6)return void console.log("Cannot add more than 6 columns to a row");const i=o.columns.length,n={id:`col-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,modules:[],vertical_alignment:"center",horizontal_alignment:"center",column_name:`Column ${i+1}`},a={rows:e.rows.map(((e,o)=>o===t?Object.assign(Object.assign({},e),{columns:[...e.columns,n]}):e))};this._updateLayout(a),console.log("Column added successfully. Row now has",a.rows[t].columns.length,"columns")}_addColumnAfter(t,e){console.log("Adding column after:",t,e);const o=this._ensureLayout(),i=o.rows[t];if(!i)return;if(i.columns.length>=6)return void console.log("Cannot add more than 6 columns to a row");const n=e+1,a={id:`col-${Date.now()}`,modules:[],vertical_alignment:"center",horizontal_alignment:"center",column_name:`Column ${n+1}`},r={rows:o.rows.map(((o,i)=>{if(i===t){const t=[...o.columns];return t.splice(e+1,0,a),Object.assign(Object.assign({},o),{columns:t})}return o}))};this._updateLayout(r),console.log("Column added after successfully")}_duplicateColumn(t,e){console.log("Duplicating column:",t,e);const o=this._ensureLayout(),i=o.rows[t];if(!i||!i.columns[e])return void console.error("Row or column not found:",t,e);if(i.columns.length>=6)return void console.log("Cannot duplicate column: maximum 6 columns already reached");const n=i.columns[e],a=e+1,r=Object.assign(Object.assign({},JSON.parse(JSON.stringify(n))),{id:`col-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,column_name:`Column ${a+1}`,modules:n.modules.map(((t,e)=>Object.assign(Object.assign({},JSON.parse(JSON.stringify(t))),{id:`${t.type}-${Date.now()}-${e}-${Math.random().toString(36).substr(2,9)}`})))}),l=JSON.parse(JSON.stringify(o));l.rows[t].columns.splice(e+1,0,r),this._updateLayout(l),console.log("Column duplicated successfully. Row now has",l.rows[t].columns.length,"columns")}_deleteColumn(t,e){console.log("Deleting column:",t,e);const o=this._ensureLayout(),i=o.rows[t];if(!i)return void console.error("Row not found at index:",t);if(!i.columns[e])return void console.error("Column not found at index:",e);const n={rows:o.rows.map(((o,i)=>i===t?Object.assign(Object.assign({},o),{columns:o.columns.filter(((t,o)=>o!==e))}):o))};this._updateLayout(n),console.log("Column deleted successfully. Row now has",n.rows[t].columns.length,"columns")}_openColumnLayoutSelector(t){this._selectedRowForLayout=t,this._showColumnLayoutSelector=!0}_changeColumnLayout(t){if(-1===this._selectedRowForLayout)return;const e=this._ensureLayout(),o=e.rows[this._selectedRowForLayout];if(!o)return;const i=this.COLUMN_LAYOUTS.find((e=>e.id===t));if(!i)return;const n=i.columnCount,a=o.columns.length;console.log(`Changing layout from ${a} to ${n} columns`);const r=JSON.parse(JSON.stringify(e)),l=r.rows[this._selectedRowForLayout];if(n===a)l.column_layout=t;else if(n>a){const e=[...l.columns];for(let t=a;t<n;t++)e.push({id:`col-${Date.now()}-${t}-${Math.random().toString(36).substr(2,9)}`,modules:[],vertical_alignment:"center",horizontal_alignment:"center",column_name:`Column ${t+1}`});l.columns=e,l.column_layout=t}else{const e=[],o=[];l.columns.forEach((t=>{t.modules&&t.modules.length>0&&o.push(...t.modules)}));for(let t=0;t<n;t++)t<a?e.push(Object.assign(Object.assign({},l.columns[t]),{modules:[]})):e.push({id:`col-${Date.now()}-${t}-${Math.random().toString(36).substr(2,9)}`,modules:[],vertical_alignment:"center",horizontal_alignment:"center",column_name:`Column ${t+1}`});o.length>0&&(1===n?e[0].modules=o:o.forEach(((t,o)=>{e[o%n].modules.push(t)}))),l.columns=e,l.column_layout=t}this._updateLayout(r),console.log(`Layout changed successfully. Row now has ${n} columns`),this._showColumnLayoutSelector=!1,this._selectedRowForLayout=-1}_getCurrentLayoutDisplay(t){const e=t.columns.length,o=t.column_layout,i=this.COLUMN_LAYOUTS.find((t=>t.id===o));if(i)return this._createSimpleIcon(i.proportions);switch(e){case 1:return"█";case 2:return"█ █";case 3:return"█ █ █";case 4:return"█ █ █ █";default:return"█ ".repeat(Math.min(e,6)).trim()}}_openModuleSelector(t,e){console.log("Opening module selector for:",{rowIndex:t,columnIndex:e});const o=this._ensureLayout().rows[t];o&&o.columns&&0!==o.columns.length||(console.log("Row has no columns, automatically adding one"),this._addColumn(t),e=0),this._selectedRowIndex=t,this._selectedColumnIndex=e,this._selectedLayoutModuleIndex=-1,this._showModuleSelector=!0}_addModule(t){if(console.log("Adding module of type:",t),-1===this._selectedRowIndex||-1===this._selectedColumnIndex)return void console.error("No row or column selected");const e=this._ensureLayout();if(!e.rows[this._selectedRowIndex])return void console.error("Selected row does not exist:",this._selectedRowIndex);const o=e.rows[this._selectedRowIndex];if(!o.columns[this._selectedColumnIndex])return void console.error("Selected column does not exist:",this._selectedColumnIndex);const i=o.columns[this._selectedColumnIndex];let n,a;switch(t){case"text":n={id:`text-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"text",text:"Sample Text",font_size:16,color:"var(--primary-text-color)"},delete n.name,delete n.title;break;case"separator":n={id:`separator-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"separator",thickness:1,color:"var(--divider-color)"},delete n.name,delete n.title,delete n.label;break;case"image":n={id:`image-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"image",image_type:"none"},delete n.name,delete n.title,delete n.label;break;case"markdown":n={id:`markdown-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"markdown",content:"This is a markdown module that supports:\n\n- Italic and bold text\n- Links\n- inline code\n- Lists and more!",markdown_content:"This is a markdown module that supports:\n\n- Italic and bold text\n- Links\n- inline code\n- Lists and more!"},delete n.name,delete n.title,delete n.label;break;case"bar":n={id:`bar-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"bar",entity:"sensor.battery_level",bar_color:"var(--primary-color)",show_value:!0},delete n.name,delete n.title,delete n.label;break;case"button":n={id:`button-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"button",label:"Click Me",button_text:"Click Me",tap_action:{action:"more-info"}},delete n.name,delete n.title;break;case"info":n={id:`info-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"info",info_entities:[{entity:"sensor.temperature",name:"Temperature",icon:"mdi:thermometer"}]},delete n.name,delete n.title,delete n.label;break;default:try{const e=Kt().createDefaultModule(t);if(e){n=e,delete n.name,delete n.title,delete n.label;break}}catch(t){console.error("Module registry failed:",t)}n={id:`text-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"text",text:"Unknown Module Type",font_size:16,color:"var(--primary-text-color)"}}if(console.log("Created module:",n),a=this._selectedLayoutModuleIndex>=0?{rows:e.rows.map(((t,e)=>e===this._selectedRowIndex?Object.assign(Object.assign({},t),{columns:t.columns.map(((t,e)=>e===this._selectedColumnIndex?Object.assign(Object.assign({},t),{modules:t.modules.map(((t,e)=>{if(e===this._selectedLayoutModuleIndex){const e=t;return Object.assign(Object.assign({},e),{modules:[...e.modules||[],n]})}return t}))}):t))}):t))}:{rows:e.rows.map(((t,e)=>e===this._selectedRowIndex?Object.assign(Object.assign({},t),{columns:t.columns.map(((t,e)=>e===this._selectedColumnIndex?Object.assign(Object.assign({},t),{modules:[...t.modules||[],n]}):t))}):t))},this._updateLayout(a),this._showModuleSelector=!1,this._shouldAutoOpenSettings(t))if(this._selectedLayoutModuleIndex>=0);else{const t=i.modules.length;this._openModuleSettings(this._selectedRowIndex,this._selectedColumnIndex,t)}this._selectedRowIndex=-1,this._selectedColumnIndex=-1,this._selectedLayoutModuleIndex=-1,console.log("Module added successfully")}_duplicateModule(t,e,o){console.log("Duplicating module:",t,e,o);const i=this._ensureLayout(),n=i.rows[t];if(!n||!n.columns[e])return;const a=n.columns[e];if(!a.modules||!a.modules[o])return;const r=a.modules[o],l=Object.assign(Object.assign({},JSON.parse(JSON.stringify(r))),{id:`${r.type}-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}),s={rows:i.rows.map(((i,n)=>n===t?Object.assign(Object.assign({},i),{columns:i.columns.map(((t,i)=>{if(i===e){const e=[...t.modules];return e.splice(o+1,0,l),Object.assign(Object.assign({},t),{modules:e})}return t}))}):i))};this._updateLayout(s),console.log("Module duplicated successfully")}_deleteModule(t,e,o){if(console.log("Deleting module:",t,e,o),!confirm("Are you sure you want to delete this module?"))return;const i=this._ensureLayout(),n=i.rows[t];if(!n||!n.columns[e])return;const a=n.columns[e];if(!a.modules||!a.modules[o])return;const r={rows:i.rows.map(((i,n)=>n===t?Object.assign(Object.assign({},i),{columns:i.columns.map(((t,i)=>i===e?Object.assign(Object.assign({},t),{modules:t.modules.filter(((t,e)=>e!==o))}):t))}):i))};this._updateLayout(r),console.log("Module deleted successfully")}_openModuleSettings(t,e,o){this._selectedModule={rowIndex:t,columnIndex:e,moduleIndex:o},this._showModuleSettings=!0}_updateModule(t){if(console.log("🔄 LayoutTab: _updateModule called with updates:",t),!this._selectedModule)return void console.log("🔄 LayoutTab: No selected module, returning early");const e=this._ensureLayout(),{rowIndex:o,columnIndex:i,moduleIndex:n}=this._selectedModule;console.log(`🔄 LayoutTab: Updating module at row ${o}, column ${i}, module ${n}`);const a={rows:e.rows.map(((e,a)=>a===o?Object.assign(Object.assign({},e),{columns:e.columns.map(((e,o)=>o===i?Object.assign(Object.assign({},e),{modules:e.modules.map(((e,o)=>{if(o===n){console.log("🔄 LayoutTab: Original module:",e);const o=Object.assign({},e);for(const[e,i]of Object.entries(t))void 0===i?(console.log(`🔄 LayoutTab: DELETING property ${e} from module`),delete o[e]):(console.log(`🔄 LayoutTab: SETTING property ${e} =`,i),o[e]=i);return console.log("🔄 LayoutTab: Updated module:",o),o}return e}))}):e))}):e))};console.log("🔄 LayoutTab: Calling _updateLayout with new layout"),this._updateLayout(a),console.log("🔄 LayoutTab: Layout updated successfully")}_updateLayoutChildModule(t){if(console.log("🔄 LayoutTab: _updateLayoutChildModule called with updates:",t),!this._selectedLayoutChild)return void console.log("🔄 LayoutTab: No selected layout child, returning early");const{parentRowIndex:e,parentColumnIndex:o,parentModuleIndex:i,childIndex:n}=this._selectedLayoutChild,a=this._ensureLayout(),r=JSON.parse(JSON.stringify(a)),l=r.rows[e];if(!l||!l.columns[o])return;const s=l.columns[o];if(!s.modules||!s.modules[i])return;const d=s.modules[i];if(!d.modules||!d.modules[n])return;const c=d.modules[n];console.log("🔄 LayoutTab: Original child module:",c);const p=Object.assign({},c);for(const[e,o]of Object.entries(t))void 0===o?(console.log(`🔄 LayoutTab: DELETING property ${e} from child module`),delete p[e]):(console.log(`🔄 LayoutTab: SETTING child module property ${e} =`,o),p[e]=o);d.modules[n]=p,console.log("🔄 LayoutTab: Updated child module:",p),this._updateLayout(r),console.log("🔄 LayoutTab: Layout child module updated successfully")}_updateModuleDesign(t){var e,o,i,n,a,r,l,s,d,c,p,u,m,g,h,v,b,f;if(console.log("🔄 LayoutTab: _updateModuleDesign called with updates:",t),console.log("🔄 LayoutTab: _selectedModule:",this._selectedModule),!this._selectedModule)return void console.log("🔄 LayoutTab: No selected module, returning early");const y={};if(t.hasOwnProperty("color")&&(y.color=t.color),t.hasOwnProperty("text_align")&&(y.text_align=t.text_align),t.hasOwnProperty("font_size")&&(y.font_size=t.font_size?parseFloat(t.font_size):void 0),t.hasOwnProperty("line_height")&&(y.line_height=t.line_height),t.hasOwnProperty("letter_spacing")&&(y.letter_spacing=t.letter_spacing),t.hasOwnProperty("font_family")&&(y.font_family=t.font_family),t.hasOwnProperty("font_weight")&&(y.font_weight=t.font_weight),t.hasOwnProperty("text_transform")&&(y.text_transform=t.text_transform),t.hasOwnProperty("font_style")&&(y.font_style=t.font_style),t.hasOwnProperty("background_color")&&(y.background_color=t.background_color),t.hasOwnProperty("background_image")&&(y.background_image=t.background_image),t.hasOwnProperty("background_image_type")&&(y.background_image_type=t.background_image_type),t.hasOwnProperty("background_image_entity")&&(y.background_image_entity=t.background_image_entity),t.hasOwnProperty("backdrop_filter")&&(y.backdrop_filter=t.backdrop_filter),t.hasOwnProperty("width")&&(y.width=t.width),t.hasOwnProperty("height")&&(y.height=t.height),t.hasOwnProperty("max_width")&&(y.max_width=t.max_width),t.hasOwnProperty("max_height")&&(y.max_height=t.max_height),t.hasOwnProperty("min_width")&&(y.min_width=t.min_width),t.hasOwnProperty("min_height")&&(y.min_height=t.min_height),t.hasOwnProperty("position")&&(y.position=t.position),t.hasOwnProperty("top")&&(y.top=t.top),t.hasOwnProperty("bottom")&&(y.bottom=t.bottom),t.hasOwnProperty("left")&&(y.left=t.left),t.hasOwnProperty("right")&&(y.right=t.right),t.hasOwnProperty("z_index")&&(y.z_index=t.z_index),t.hasOwnProperty("text_shadow_h")&&(y.text_shadow_h=t.text_shadow_h),t.hasOwnProperty("text_shadow_v")&&(y.text_shadow_v=t.text_shadow_v),t.hasOwnProperty("text_shadow_blur")&&(y.text_shadow_blur=t.text_shadow_blur),t.hasOwnProperty("text_shadow_color")&&(y.text_shadow_color=t.text_shadow_color),t.hasOwnProperty("box_shadow_h")&&(y.box_shadow_h=t.box_shadow_h),t.hasOwnProperty("box_shadow_v")&&(y.box_shadow_v=t.box_shadow_v),t.hasOwnProperty("box_shadow_blur")&&(y.box_shadow_blur=t.box_shadow_blur),t.hasOwnProperty("box_shadow_spread")&&(y.box_shadow_spread=t.box_shadow_spread),t.hasOwnProperty("box_shadow_color")&&(y.box_shadow_color=t.box_shadow_color),t.hasOwnProperty("overflow")&&(y.overflow=t.overflow),t.hasOwnProperty("clip_path")&&(y.clip_path=t.clip_path),t.hasOwnProperty("margin_top")&&(y.margin_top=t.margin_top),t.hasOwnProperty("margin_bottom")&&(y.margin_bottom=t.margin_bottom),t.hasOwnProperty("margin_left")&&(y.margin_left=t.margin_left),t.hasOwnProperty("margin_right")&&(y.margin_right=t.margin_right),t.hasOwnProperty("padding_top")&&(y.padding_top=t.padding_top),t.hasOwnProperty("padding_bottom")&&(y.padding_bottom=t.padding_bottom),t.hasOwnProperty("padding_left")&&(y.padding_left=t.padding_left),t.hasOwnProperty("padding_right")&&(y.padding_right=t.padding_right),t.hasOwnProperty("border_radius")&&(y.border_radius=t.border_radius),t.hasOwnProperty("border_style")&&(y.border_style=t.border_style),t.hasOwnProperty("border_width")&&(y.border_width=t.border_width),t.hasOwnProperty("border_color")&&(y.border_color=t.border_color),t.hasOwnProperty("animation_type")&&(y.animation_type=t.animation_type),t.hasOwnProperty("animation_entity")&&(y.animation_entity=t.animation_entity),t.hasOwnProperty("animation_trigger_type")&&(y.animation_trigger_type=t.animation_trigger_type),t.hasOwnProperty("animation_attribute")&&(y.animation_attribute=t.animation_attribute),t.hasOwnProperty("animation_state")&&(y.animation_state=t.animation_state),t.hasOwnProperty("intro_animation")&&(y.intro_animation=t.intro_animation),t.hasOwnProperty("outro_animation")&&(y.outro_animation=t.outro_animation),t.hasOwnProperty("animation_duration")&&(y.animation_duration=t.animation_duration),t.hasOwnProperty("animation_delay")&&(y.animation_delay=t.animation_delay),t.hasOwnProperty("animation_timing")&&(y.animation_timing=t.animation_timing),t.hasOwnProperty("margin_top")||t.hasOwnProperty("margin_bottom")||t.hasOwnProperty("margin_left")||t.hasOwnProperty("margin_right")){const{rowIndex:l,columnIndex:s,moduleIndex:d}=this._selectedModule,c=null===(o=null===(e=this._ensureLayout().rows[l])||void 0===e?void 0:e.columns[s])||void 0===o?void 0:o.modules[d];if(c){const e=t.hasOwnProperty("margin_top")?t.margin_top:null===(i=c.margin)||void 0===i?void 0:i.top,o=t.hasOwnProperty("margin_bottom")?t.margin_bottom:null===(n=c.margin)||void 0===n?void 0:n.bottom,l=t.hasOwnProperty("margin_left")?t.margin_left:null===(a=c.margin)||void 0===a?void 0:a.left,s=t.hasOwnProperty("margin_right")?t.margin_right:null===(r=c.margin)||void 0===r?void 0:r.right;if(void 0===e&&void 0===o&&void 0===l&&void 0===s)y.margin=void 0;else{const t=c.margin||{};y.margin={top:void 0!==e?parseFloat(e)||0:t.top||0,bottom:void 0!==o?parseFloat(o)||0:t.bottom||0,left:void 0!==l?parseFloat(l)||0:t.left||0,right:void 0!==s?parseFloat(s)||0:t.right||0}}}}if(t.hasOwnProperty("padding_top")||t.hasOwnProperty("padding_bottom")||t.hasOwnProperty("padding_left")||t.hasOwnProperty("padding_right")){const{rowIndex:e,columnIndex:o,moduleIndex:i}=this._selectedModule,n=null===(s=null===(l=this._ensureLayout().rows[e])||void 0===l?void 0:l.columns[o])||void 0===s?void 0:s.modules[i];if(n){const e=t.hasOwnProperty("padding_top")?t.padding_top:null===(d=n.padding)||void 0===d?void 0:d.top,o=t.hasOwnProperty("padding_bottom")?t.padding_bottom:null===(c=n.padding)||void 0===c?void 0:c.bottom,i=t.hasOwnProperty("padding_left")?t.padding_left:null===(p=n.padding)||void 0===p?void 0:p.left,a=t.hasOwnProperty("padding_right")?t.padding_right:null===(u=n.padding)||void 0===u?void 0:u.right;if(void 0===e&&void 0===o&&void 0===i&&void 0===a)y.padding=void 0;else{const t=n.padding||{};y.padding={top:void 0!==e?parseFloat(e)||0:t.top||0,bottom:void 0!==o?parseFloat(o)||0:t.bottom||0,left:void 0!==i?parseFloat(i)||0:t.left||0,right:void 0!==a?parseFloat(a)||0:t.right||0}}}}if(t.hasOwnProperty("border_radius")||t.hasOwnProperty("border_style")||t.hasOwnProperty("border_width")||t.hasOwnProperty("border_color")){const{rowIndex:e,columnIndex:o,moduleIndex:i}=this._selectedModule,n=null===(g=null===(m=this._ensureLayout().rows[e])||void 0===m?void 0:m.columns[o])||void 0===g?void 0:g.modules[i];if(n){const e=t.hasOwnProperty("border_radius")?t.border_radius:null===(h=n.border)||void 0===h?void 0:h.radius,o=t.hasOwnProperty("border_style")?t.border_style:null===(v=n.border)||void 0===v?void 0:v.style,i=t.hasOwnProperty("border_width")?t.border_width:null===(b=n.border)||void 0===b?void 0:b.width,a=t.hasOwnProperty("border_color")?t.border_color:null===(f=n.border)||void 0===f?void 0:f.color;if(void 0===e&&void 0===o&&void 0===i&&void 0===a)y.border=void 0;else{const t=n.border||{};y.border={radius:void 0!==e?parseFloat(e)||0:t.radius||0,style:void 0!==o?o:t.style||"none",width:void 0!==i?i:t.width||"1px",color:void 0!==a?a:t.color||"var(--divider-color)"}}}}console.log("🔄 LayoutTab: Final moduleUpdates being applied:",y),this._updateModule(y),console.log("🔄 LayoutTab: _updateModule called successfully")}_closeModuleSettings(){this._showModuleSettings=!1,this._selectedModule=null,this.requestUpdate()}_closeLayoutChildSettings(){this._showLayoutChildSettings=!1,this._selectedLayoutChild=null,this.requestUpdate()}_onDragStart(t,e,o,i,n){var a,r,l;if(!t.dataTransfer)return;t.stopPropagation();const s=this._ensureLayout();let d;switch(e){case"module":void 0!==i&&void 0!==n&&(d=null===(r=null===(a=s.rows[o])||void 0===a?void 0:a.columns[i])||void 0===r?void 0:r.modules[n]);break;case"column":void 0!==i&&(d=null===(l=s.rows[o])||void 0===l?void 0:l.columns[i]);break;case"row":d=s.rows[o]}this._draggedItem={type:e,rowIndex:o,columnIndex:i,moduleIndex:n,data:d},t.dataTransfer.effectAllowed="move",t.dataTransfer.setData("text/plain",JSON.stringify({type:e,rowIndex:o,columnIndex:i,moduleIndex:n}));const c=t.currentTarget;c&&(c.style.opacity="0.6",c.style.transform="scale(0.95)"),"column"===e?this.setAttribute("dragging-column",""):"row"===e&&this.setAttribute("dragging-row","")}_onDragEnd(t){const e=t.currentTarget;e&&(e.style.opacity="",e.style.transform=""),this.removeAttribute("dragging-column"),this.removeAttribute("dragging-row"),this._draggedItem=null,this._dropTarget=null,this.requestUpdate()}_onDragOver(t){this._draggedItem&&(t.preventDefault(),t.stopPropagation(),t.dataTransfer&&(t.dataTransfer.dropEffect="move"))}_onDragEnter(t,e,o,i,n){if(t.preventDefault(),t.stopPropagation(),!this._draggedItem)return;if(this._draggedItem.type===e&&this._draggedItem.rowIndex===o&&this._draggedItem.columnIndex===i&&this._draggedItem.moduleIndex===n)return;if(void 0!==this._draggedItem.layoutChildIndex&&"layout"===e&&this._draggedItem.rowIndex===o&&this._draggedItem.columnIndex===i&&this._draggedItem.moduleIndex===n)return;if(!this._isValidDropTarget(this._draggedItem.type,e))return;this._dropTarget={type:e,rowIndex:o,columnIndex:i,moduleIndex:n};const a=t.currentTarget;a&&(a.style.borderColor="var(--primary-color)",a.style.backgroundColor="rgba(var(--rgb-primary-color), 0.1)"),this.requestUpdate()}_onDragLeave(t){const e=t.currentTarget;e&&(e.style.borderColor="",e.style.backgroundColor=""),t.relatedTarget&&t.currentTarget&&!t.currentTarget.contains(t.relatedTarget)&&(this._dropTarget=null,this.requestUpdate())}_onDrop(t,e,o,i,n){t.preventDefault(),t.stopPropagation();const a=t.currentTarget;a&&(a.style.borderColor="",a.style.backgroundColor=""),this._draggedItem&&(this._draggedItem.type===e&&this._draggedItem.rowIndex===o&&this._draggedItem.columnIndex===i&&this._draggedItem.moduleIndex===n||this._isValidDropTarget(this._draggedItem.type,e)&&(this._performMove(this._draggedItem,{type:e,rowIndex:o,columnIndex:i,moduleIndex:n}),this._draggedItem=null,this._dropTarget=null,this.requestUpdate()))}_isValidDropTarget(t,e){var o;return(null===(o={module:["module","column","layout","layout-child"],column:["column","row"],row:["row"]}[t])||void 0===o?void 0:o.includes(e))||!1}_performMove(t,e){const o=this._ensureLayout(),i=JSON.parse(JSON.stringify(o));switch(t.type){case"module":this._moveModule(i,t,e);break;case"column":this._moveColumn(i,t,e);break;case"row":this._moveRow(i,t,e)}this._updateLayout(i)}_moveModule(t,e,o){let i;if(void 0!==e.layoutChildIndex&&"layout-child"===o.type){const i=e.rowIndex,n=e.columnIndex,a=e.moduleIndex,r=e.layoutChildIndex,l=o.rowIndex,s=o.columnIndex,d=o.moduleIndex,c=o.childIndex;if(i===l&&n===s&&a===d){if(r===c)return;const e=t.rows[i].columns[n].modules[a];if(e&&this._isLayoutModule(e.type)&&e.modules){const t=e.modules.splice(r,1)[0];let o=c;r<c&&(o=c-1),e.modules.splice(o,0,t)}return}}if(void 0!==e.layoutChildIndex){const o=t.rows[e.rowIndex].columns[e.columnIndex].modules[e.moduleIndex];i=o.modules[e.layoutChildIndex],o.modules.splice(e.layoutChildIndex,1)}else i=t.rows[e.rowIndex].columns[e.columnIndex].modules[e.moduleIndex];if("layout"!==o.type)if("layout-child"!==o.type)if(void 0===e.layoutChildIndex&&t.rows[e.rowIndex].columns[e.columnIndex].modules.splice(e.moduleIndex,1),"module"===o.type){let n=o.moduleIndex||0;e.rowIndex===o.rowIndex&&e.columnIndex===o.columnIndex&&o.moduleIndex>e.moduleIndex&&n--,t.rows[o.rowIndex].columns[o.columnIndex].modules.splice(n,0,i)}else"column"===o.type&&t.rows[o.rowIndex].columns[o.columnIndex].modules.push(i);else{const n=t.rows[o.rowIndex].columns[o.columnIndex].modules[o.moduleIndex];if(n&&this._isLayoutModule(n.type)){n.modules||(n.modules=[]);const a=o.childIndex||0;n.modules.splice(a,0,i),void 0===e.layoutChildIndex&&t.rows[e.rowIndex].columns[e.columnIndex].modules.splice(e.moduleIndex,1)}}else{const n=t.rows[o.rowIndex].columns[o.columnIndex].modules[o.moduleIndex];n&&this._isLayoutModule(n.type)&&(n.modules||(n.modules=[]),n.modules.push(i),void 0===e.layoutChildIndex&&t.rows[e.rowIndex].columns[e.columnIndex].modules.splice(e.moduleIndex,1))}}_moveColumn(t,e,o){const i=t.rows[e.rowIndex].columns[e.columnIndex];t.rows[e.rowIndex].columns.splice(e.columnIndex,1),"column"===o.type?t.rows[o.rowIndex].columns.splice(o.columnIndex||0,0,i):"row"===o.type&&t.rows[o.rowIndex].columns.push(i)}_moveRow(t,e,o){const i=t.rows[e.rowIndex];t.rows.splice(e.rowIndex,1);const n=o.rowIndex;t.rows.splice(n,0,i)}_openRowSettings(t){this._selectedRowForSettings=t,this._showRowSettings=!0}_updateRow(t){if(console.log("🔄 LayoutTab: _updateRow called with updates:",t),-1===this._selectedRowForSettings)return void console.log("🔄 LayoutTab: No selected row for settings, returning early");const e=this._ensureLayout(),o=JSON.parse(JSON.stringify(e)),i=o.rows[this._selectedRowForSettings];console.log("🔄 LayoutTab: Original row:",i);for(const[e,o]of Object.entries(t))void 0===o?(console.log(`🔄 LayoutTab: DELETING property ${e} from row`),delete i[e]):(console.log(`🔄 LayoutTab: SETTING row property ${e} =`,o),i[e]=o);console.log("🔄 LayoutTab: Updated row:",i),this._updateLayout(o),console.log("🔄 LayoutTab: Row updated successfully")}_openColumnSettings(t,e){this._selectedColumnForSettings={rowIndex:t,columnIndex:e},this._showColumnSettings=!0}_updateColumn(t){if(console.log("🔄 LayoutTab: _updateColumn called with updates:",t),!this._selectedColumnForSettings)return void console.log("🔄 LayoutTab: No selected column for settings, returning early");const e=this._ensureLayout(),o=JSON.parse(JSON.stringify(e)),i=o.rows[this._selectedColumnForSettings.rowIndex].columns[this._selectedColumnForSettings.columnIndex];console.log("🔄 LayoutTab: Original column:",i);for(const[e,o]of Object.entries(t))void 0===o?(console.log(`🔄 LayoutTab: DELETING property ${e} from column`),delete i[e]):(console.log(`🔄 LayoutTab: SETTING column property ${e} =`,o),i[e]=o);console.log("🔄 LayoutTab: Updated column:",i),this._updateLayout(o),console.log("🔄 LayoutTab: Column updated successfully")}_loadGoogleFont(t){if(!t||"default"===t||me.some((e=>e.value===t)))return;if(document.querySelector(`link[href*="${t.replace(/\s+/g,"+")}"]`))return;const e=document.createElement("link");e.rel="stylesheet",e.href=`https://fonts.googleapis.com/css2?family=${t.replace(/\s+/g,"+")}:wght@300;400;500;600;700&display=swap`,document.head.appendChild(e)}_renderModulePreview(){var t,e,o;if(!this._selectedModule)return V``;const{rowIndex:i,columnIndex:n,moduleIndex:a}=this._selectedModule,r=null===(o=null===(e=null===(t=this.config.layout)||void 0===t?void 0:t.rows[i])||void 0===e?void 0:e.columns[n])||void 0===o?void 0:o.modules[a];return r?V`
      <div class="module-preview">
        <div class="preview-header">Live Preview</div>
        <div class="preview-content">${this._renderSingleModuleWithAnimation(r)}</div>
      </div>
    `:V``}_renderSingleModule(t,e,o,i){return this._renderSimplifiedModule(t,e,o,i)}_renderSimplifiedModule(t,e,o,i){const n=Kt().getModule(t.type),a=(null==n?void 0:n.metadata)||{icon:"mdi:help-circle",title:"Unknown",description:"Unknown module type"};if("horizontal"===t.type||"vertical"===t.type)return this._renderLayoutModuleAsColumn(t,e,o,i,a);const r=this._generateModuleInfo(t),l=this._getModuleDisplayName(t);return V`
      <div class="simplified-module">
        <div class="simplified-module-header">
          <div class="simplified-module-drag-handle" title="Drag to move module">
            <ha-icon icon="mdi:drag"></ha-icon>
          </div>
          <ha-icon icon="${a.icon}" class="simplified-module-icon"></ha-icon>
          <div class="simplified-module-content">
            <div class="simplified-module-title">${l}</div>
            <div class="simplified-module-info">${r}</div>
          </div>
          ${void 0!==e&&void 0!==o&&void 0!==i?V`
                <div class="simplified-module-actions">
                  <button
                    class="simplified-action-btn edit-btn"
                    @click=${t=>{t.stopPropagation(),this._openModuleSettings(e,o,i)}}
                    @mousedown=${t=>t.stopPropagation()}
                    @dragstart=${t=>t.preventDefault()}
                    title="Edit Module"
                  >
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </button>
                  <button
                    class="simplified-action-btn duplicate-btn"
                    @click=${t=>{t.stopPropagation(),this._duplicateModule(e,o,i)}}
                    @mousedown=${t=>t.stopPropagation()}
                    @dragstart=${t=>t.preventDefault()}
                    title="Duplicate Module"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </button>
                  <button
                    class="simplified-action-btn delete-btn"
                    @click=${t=>{t.stopPropagation(),this._deleteModule(e,o,i)}}
                    @mousedown=${t=>t.stopPropagation()}
                    @dragstart=${t=>t.preventDefault()}
                    title="Delete Module"
                    style="margin-left: 8px;"
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                </div>
              `:""}
        </div>
      </div>
    `}_renderLayoutModuleAsColumn(t,e,o,i,n){const a=t,r=a.modules&&a.modules.length>0,l="horizontal"===t.type;return t.type,V`
      <div class="layout-module-container">
        <div class="layout-module-header">
          <div class="layout-module-title">
            <div class="layout-module-drag-handle" title="Drag to move layout module">
              <ha-icon icon="mdi:drag"></ha-icon>
            </div>
            ${void 0!==e&&void 0!==o&&void 0!==i?V`
                  <button
                    class="layout-module-collapse-btn"
                    @click=${t=>{t.stopPropagation(),this._toggleLayoutModuleCollapse(e,o,i)}}
                    @mousedown=${t=>t.stopPropagation()}
                    @dragstart=${t=>t.preventDefault()}
                    title="${this._isLayoutModuleCollapsed(e,o,i)?"Expand Layout Module":"Collapse Layout Module"}"
                  >
                    <ha-icon
                      icon="mdi:chevron-${this._isLayoutModuleCollapsed(e,o,i)?"right":"down"}"
                    ></ha-icon>
                  </button>
                `:""}
            <ha-icon icon="${(null==n?void 0:n.icon)||"mdi:view-sequential"}"></ha-icon>
            <span>${l?"Horizontal Layout":"Vertical Layout"}</span>
          </div>
          <div class="layout-module-actions">
            ${void 0!==e&&void 0!==o&&void 0!==i?V`
                  <button
                    class="layout-module-settings-btn"
                    @click=${t=>{t.stopPropagation(),this._openModuleSettings(e,o,i)}}
                    @mousedown=${t=>t.stopPropagation()}
                    @dragstart=${t=>t.preventDefault()}
                    title="Layout Settings"
                  >
                    <ha-icon icon="mdi:cog"></ha-icon>
                  </button>
                  <button
                    class="layout-module-duplicate-btn"
                    @click=${t=>{t.stopPropagation(),this._duplicateModule(e,o,i)}}
                    @mousedown=${t=>t.stopPropagation()}
                    @dragstart=${t=>t.preventDefault()}
                    title="Duplicate Layout"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </button>
                  <button
                    class="layout-module-delete-btn"
                    @click=${t=>{t.stopPropagation(),this._deleteModule(e,o,i)}}
                    @mousedown=${t=>t.stopPropagation()}
                    @dragstart=${t=>t.preventDefault()}
                    title="Delete Layout"
                    style="margin-left: 8px;"
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                `:""}
          </div>
        </div>
        ${void 0!==e&&void 0!==o&&void 0!==i?this._isLayoutModuleCollapsed(e,o,i)?V``:V`
                <div
                  class="layout-modules-container"
                  style="
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    padding: 8px 12px;
                    min-height: 60px;
                    box-sizing: border-box;
                    overflow: hidden;
                  "
                  @dragover=${this._onDragOver}
                  @dragenter=${t=>this._onDragEnter(t,"layout",e,o,i)}
                  @dragleave=${this._onDragLeave}
                  @drop=${t=>this._onDrop(t,"layout",e,o,i)}
                >
                  ${r?a.modules.map(((t,n)=>{var a,r,l,s,d;return V`
                          <div
                            class="layout-child-module-wrapper"
                            draggable="true"
                            @dragstart=${t=>this._onLayoutChildDragStart(t,e,o,i,n)}
                            @dragend=${t=>this._onLayoutChildDragEnd(t)}
                            @dragover=${this._onDragOver}
                            @dragenter=${t=>this._onLayoutChildDragEnter(t,e,o,i,n)}
                            @dragleave=${this._onDragLeave}
                            @drop=${t=>this._onLayoutChildDrop(t,e,o,i,n)}
                            class="${"layout-child"===(null===(a=this._dropTarget)||void 0===a?void 0:a.type)&&(null===(r=this._dropTarget)||void 0===r?void 0:r.rowIndex)===e&&(null===(l=this._dropTarget)||void 0===l?void 0:l.columnIndex)===o&&(null===(s=this._dropTarget)||void 0===s?void 0:s.moduleIndex)===i&&(null===(d=this._dropTarget)||void 0===d?void 0:d.childIndex)===n?"drop-target":""}"
                            style="width: 100%; max-width: 100%; box-sizing: border-box; overflow: hidden;"
                          >
                            ${this._renderLayoutChildModule(t,e,o,i,n)}
                          </div>
                        `})):V`
                        <div class="layout-module-empty">
                          <ha-icon icon="mdi:plus-circle"></ha-icon>
                          <span>Drop modules here</span>
                        </div>
                      `}
                  ${r?V`
                        <button
                          class="add-module-btn"
                          @click=${t=>{t.stopPropagation(),this._openLayoutModuleSelector(e,o,i)}}
                        >
                          <ha-icon icon="mdi:plus"></ha-icon>
                          Add Module
                        </button>
                      `:""}
                </div>
              `:V`
              <div
                class="layout-modules-container"
                style="
                  display: flex;
                  flex-direction: column;
                  gap: 1rem;
                  padding: 8px 12px;
                  min-height: 60px;
                  box-sizing: border-box;
                  overflow: hidden;
                "
              >
                ${r?a.modules.map(((t,n)=>V`
                        <div
                          class="layout-child-module-wrapper"
                          style="width: 100%; max-width: 100%; box-sizing: border-box; overflow: hidden;"
                        >
                          ${this._renderLayoutChildModule(t,e,o,i,n)}
                        </div>
                      `)):V`
                      <div class="layout-module-empty">
                        <ha-icon icon="mdi:plus-circle"></ha-icon>
                        <span>Drop modules here</span>
                      </div>
                    `}
              </div>
            `}
      </div>
    `}_getJustifyContent(t){switch(t){case"left":default:return"flex-start";case"center":return"center";case"right":return"flex-end";case"justify":return"space-between"}}_renderLayoutChildModule(t,e,o,i,n){const a=Kt().getModule(t.type),r=(null==a?void 0:a.metadata)||{icon:"mdi:help-circle",title:"Unknown",description:"Unknown module type"},l=this._generateModuleInfo(t),s=this._getModuleDisplayName(t);return V`
      <div
        class="layout-child-simplified-module"
        @click=${t=>{const a=t.target;a.closest(".layout-child-actions")||a.closest(".layout-child-drag-handle")||(t.stopPropagation(),void 0!==e&&void 0!==o&&void 0!==i&&void 0!==n&&this._openLayoutChildSettings(e,o,i,n))}}
      >
        <div class="layout-child-module-header">
          <div class="layout-child-drag-handle" title="Drag to reorder">
            <ha-icon icon="mdi:drag"></ha-icon>
          </div>
          <ha-icon icon="${r.icon}" class="layout-child-icon"></ha-icon>
          <div class="layout-child-content">
            <div class="layout-child-title">${s}</div>
            <div class="layout-child-info">${l}</div>
          </div>
          ${void 0!==e&&void 0!==o&&void 0!==i&&void 0!==n?V`
                <div class="layout-child-actions">
                  <button
                    class="layout-child-action-btn edit-btn"
                    @click=${t=>{t.stopPropagation(),this._openLayoutChildSettings(e,o,i,n)}}
                    @mousedown=${t=>t.stopPropagation()}
                    @dragstart=${t=>t.preventDefault()}
                    title="Edit Child Module"
                  >
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </button>
                  <button
                    class="layout-child-action-btn duplicate-btn"
                    @click=${t=>{t.stopPropagation(),this._duplicateLayoutChildModule(e,o,i,n)}}
                    @mousedown=${t=>t.stopPropagation()}
                    @dragstart=${t=>t.preventDefault()}
                    title="Duplicate Child Module"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </button>
                  <button
                    class="layout-child-action-btn delete-btn"
                    @click=${t=>{t.stopPropagation(),this._deleteLayoutChildModule(e,o,i,n)}}
                    @mousedown=${t=>t.stopPropagation()}
                    @dragstart=${t=>t.preventDefault()}
                    title="Delete Child Module"
                    style="margin-left: 8px;"
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                </div>
              `:""}
        </div>
      </div>
    `}_onLayoutModuleDragOver(t,e,o,i){t.preventDefault(),t.stopPropagation(),t.dataTransfer&&(t.dataTransfer.dropEffect="move")}_onLayoutModuleDragEnter(t,e,o,i){t.preventDefault(),t.stopPropagation(),this._draggedItem&&"module"===this._draggedItem.type&&(this._draggedItem.rowIndex===e&&this._draggedItem.columnIndex===o&&this._draggedItem.moduleIndex===i||t.currentTarget.classList.add("layout-drop-target"))}_onLayoutModuleDragLeave(t){t.preventDefault(),t.stopPropagation()}_onLayoutModuleDrop(t,e,o,i){if(t.preventDefault(),t.stopPropagation(),t.currentTarget.classList.remove("layout-drop-target"),!this._draggedItem||"module"!==this._draggedItem.type)return void console.log("Invalid drop - not a module or no dragged item");if(void 0===e||void 0===o||void 0===i)return void console.log("Invalid drop - missing coordinates");const n=this._ensureLayout(),a=n.rows[e];if(!a||!a.columns[o])return void console.log("Invalid drop - target row/column not found");const r=a.columns[o].modules[i];if(!r||!this._isLayoutModule(r.type))return void console.log("Invalid drop - target is not a layout module");r.modules||(r.modules=[]);const l=JSON.parse(JSON.stringify(this._draggedItem.data));if(void 0!==this._draggedItem.layoutChildIndex&&this._draggedItem.rowIndex===e&&this._draggedItem.columnIndex===o&&this._draggedItem.moduleIndex===i)return void console.log("Ignoring layout drop - this should be handled by child reordering");r.modules.push(l);const s=n.rows[this._draggedItem.rowIndex];s&&s.columns[this._draggedItem.columnIndex]&&s.columns[this._draggedItem.columnIndex].modules.splice(this._draggedItem.moduleIndex,1),this._updateLayout(n),console.log("Module successfully moved to layout module"),this._draggedItem=null,this._dropTarget=null}_onLayoutChildDragStart(t,e,o,i,n){var a,r,l;if(!t.dataTransfer)return;t.stopPropagation();const s=null===(r=null===(a=this._ensureLayout().rows[e])||void 0===a?void 0:a.columns[o])||void 0===r?void 0:r.modules[i],d=null===(l=null==s?void 0:s.modules)||void 0===l?void 0:l[n];if(d){this._draggedItem={type:"module",rowIndex:e,columnIndex:o,moduleIndex:i,data:d,layoutChildIndex:n},t.dataTransfer.effectAllowed="move",t.dataTransfer.setData("text/plain",JSON.stringify({type:"layout-child",parentRowIndex:e,parentColumnIndex:o,parentModuleIndex:i,childIndex:n}));const a=t.currentTarget;a&&(a.style.opacity="0.6",a.style.transform="scale(0.95)")}}_onLayoutChildDragEnd(t){t.preventDefault(),t.stopPropagation();const e=t.currentTarget;e&&(e.style.opacity="",e.style.transform=""),this._draggedItem=null,this._dropTarget=null,this.requestUpdate()}_onLayoutChildDragEnter(t,e,o,i,n){t.preventDefault(),t.stopPropagation(),this._draggedItem&&"module"===this._draggedItem.type&&(void 0!==this._draggedItem.layoutChildIndex&&this._draggedItem.rowIndex===e&&this._draggedItem.columnIndex===o&&this._draggedItem.moduleIndex===i&&this._draggedItem.layoutChildIndex===n||(this._dropTarget={type:"layout-child",rowIndex:e,columnIndex:o,moduleIndex:i,childIndex:n},this.requestUpdate()))}_onLayoutChildDrop(t,e,o,i,n){if(t.preventDefault(),t.stopPropagation(),!this._draggedItem||"module"!==this._draggedItem.type)return void console.log("Invalid drop - not a module or no dragged item");if(void 0===e||void 0===o||void 0===i||void 0===n)return void console.log("Invalid drop - missing coordinates");const a=this._ensureLayout(),r=JSON.parse(JSON.stringify(a)),l=r.rows[e].columns[o].modules[i];if(l&&this._isLayoutModule(l.type)){if(l.modules||(l.modules=[]),void 0!==this._draggedItem.layoutChildIndex){const t=this._draggedItem.rowIndex,a=this._draggedItem.columnIndex,s=this._draggedItem.moduleIndex,d=this._draggedItem.layoutChildIndex;if(t===e&&a===o&&s===i){if(d===n)return;const t=l.modules.splice(d,1)[0];let e=n;d<n&&(e=n-1),l.modules.splice(e,0,t),this._updateLayout(r),console.log("Layout child module reordered successfully")}else{const e=r.rows[t].columns[a].modules[s];if(e&&this._isLayoutModule(e.type)&&e.modules){const t=e.modules.splice(d,1)[0];l.modules.splice(n,0,t),this._updateLayout(r),console.log("Module moved from one layout to another successfully")}}}else{const t=JSON.parse(JSON.stringify(this._draggedItem.data));l.modules.splice(n,0,t);const e=r.rows[this._draggedItem.rowIndex];e&&e.columns[this._draggedItem.columnIndex]&&e.columns[this._draggedItem.columnIndex].modules.splice(this._draggedItem.moduleIndex,1),this._updateLayout(r),console.log("Module moved from column to layout position successfully")}this._draggedItem=null,this._dropTarget=null,this.requestUpdate()}else console.log("Invalid drop - target is not a layout module")}_onLayoutAppendDragEnter(t,e,o,i){if(t.preventDefault(),t.stopPropagation(),!this._draggedItem||"module"!==this._draggedItem.type)return;this._dropTarget={type:"layout-append",rowIndex:e,columnIndex:o,moduleIndex:i};const n=t.currentTarget;n.style.borderColor="var(--primary-color)",n.style.backgroundColor="rgba(var(--rgb-primary-color), 0.1)",this.requestUpdate()}_onLayoutAppendDrop(t,e,o,i){t.preventDefault(),t.stopPropagation();const n=t.currentTarget;if(n.style.borderColor="transparent",n.style.backgroundColor="transparent",!this._draggedItem||"module"!==this._draggedItem.type)return void console.log("Invalid drop - not a module or no dragged item");if(void 0===e||void 0===o||void 0===i)return void console.log("Invalid drop - missing coordinates");const a=this._ensureLayout(),r=JSON.parse(JSON.stringify(a)),l=r.rows[e].columns[o].modules[i];if(l&&this._isLayoutModule(l.type))if(l.modules||(l.modules=[]),void 0!==this._draggedItem.layoutChildIndex&&this._draggedItem.rowIndex===e&&this._draggedItem.columnIndex===o&&this._draggedItem.moduleIndex===i){const t=this._draggedItem.layoutChildIndex,e=l.modules.splice(t,1)[0];l.modules.push(e),this._updateLayout(r),console.log("Layout child module moved to end successfully")}else{const t=JSON.parse(JSON.stringify(this._draggedItem.data));if(l.modules.push(t),void 0===this._draggedItem.layoutChildIndex){const t=r.rows[this._draggedItem.rowIndex];t&&t.columns[this._draggedItem.columnIndex]&&t.columns[this._draggedItem.columnIndex].modules.splice(this._draggedItem.moduleIndex,1)}this._updateLayout(r),console.log("Module successfully moved to end of layout module")}this._draggedItem=null,this._dropTarget=null,this.requestUpdate()}_openLayoutModuleSelector(t,e,o){console.log("Opening layout module selector for:",t,e,o),this._selectedRowIndex=t,this._selectedColumnIndex=e,this._selectedLayoutModuleIndex=o,this._showModuleSelector=!0}_openLayoutChildSettings(t,e,o,i){console.log("Opening layout child settings:",t,e,o,i),this._selectedLayoutChild={parentRowIndex:t,parentColumnIndex:e,parentModuleIndex:o,childIndex:i},this._showLayoutChildSettings=!0}_duplicateLayoutChildModule(t,e,o,i){console.log("Duplicating layout child module:",t,e,o,i);const n=this._ensureLayout(),a=n.rows[t];if(!a||!a.columns[e])return;const r=a.columns[e];if(!r.modules||!r.modules[o])return;const l=r.modules[o];if(!l.modules||!l.modules[i])return;const s=l.modules[i],d=JSON.parse(JSON.stringify(s)),c={rows:n.rows.map(((n,a)=>a===t?Object.assign(Object.assign({},n),{columns:n.columns.map(((t,n)=>n===e?Object.assign(Object.assign({},t),{modules:t.modules.map(((t,e)=>{if(e===o){const e=t,o=[...e.modules];return o.splice(i+1,0,d),Object.assign(Object.assign({},e),{modules:o})}return t}))}):t))}):n))};this._updateLayout(c),console.log("Layout child module duplicated successfully")}_deleteLayoutChildModule(t,e,o,i){if(console.log("Deleting layout child module:",t,e,o,i),!confirm("Are you sure you want to delete this module?"))return;const n=this._ensureLayout(),a=n.rows[t];if(!a||!a.columns[e])return;const r=a.columns[e];if(!r.modules||!r.modules[o])return;const l=r.modules[o];if(!l.modules||!l.modules[i])return;const s={rows:n.rows.map(((n,a)=>a===t?Object.assign(Object.assign({},n),{columns:n.columns.map(((t,n)=>n===e?Object.assign(Object.assign({},t),{modules:t.modules.map(((t,e)=>{if(e===o){const e=t;return Object.assign(Object.assign({},e),{modules:e.modules.filter(((t,e)=>e!==i))})}return t}))}):t))}):n))};this._updateLayout(s),console.log("Layout child module deleted successfully")}_getModuleDisplayName(t){const e=t;if(e.module_name&&e.module_name.trim())return e.module_name;switch(t.type){case"text":return"Text Module";case"image":return"Image Module";case"icon":return"Icon Module";case"bar":return"Bar Module";case"info":return"Info Module";case"button":return"Button Module";case"separator":return"Separator Module";case"markdown":return"Markdown Module";default:return t.type.charAt(0).toUpperCase()+t.type.slice(1)+" Module"}}_getRowDisplayName(t,e){const o=t.row_name;return o&&o.trim()?o:`Row ${e+1}`}_getColumnDisplayName(t,e){const o=t.column_name;return o&&o.trim()?o:`Column ${e+1}`}_generateModuleInfo(t){var e,o,i,n;const a=t;switch(t.type){case"text":return a.text&&a.text.trim()?a.text.length>50?`${a.text.substring(0,50)}...`:a.text:"No text configured";case"image":if(a.image_entity)return`Entity: ${a.image_entity}`;if(a.image_url){const t=a.image_url;if(t.startsWith("data:image/"))return"Uploaded image";const e=t.split("/").pop()||t;return e.length>30?`${e.substring(0,30)}...`:e}if(a.image_path){const t=a.image_path,e=t.split("/").pop()||t;return e.length>30?`${e.substring(0,30)}...`:e}return"No image configured";case"icon":const r=(null===(e=a.icons)||void 0===e?void 0:e.length)||0;if(r>1)return`${r} icons configured`;if(1===r){const t=a.icons[0];return(null==t?void 0:t.entity)?`Entity: ${t.entity}`:(null==t?void 0:t.icon)?`Icon: ${t.icon}`:"Icon configured"}return"No icons configured";case"bar":return a.entity?`Entity: ${a.entity}`:"Entity: sensor.battery_level";case"info":if(null===(o=a.info_entities)||void 0===o?void 0:o.length){const t=a.info_entities[0];if(null==t?void 0:t.entity)return a.info_entities.length>1?`${t.entity} + ${a.info_entities.length-1} more`:`Entity: ${t.entity}`}return a.entity?`Entity: ${a.entity}`:(null===(i=a.entities)||void 0===i?void 0:i.length)?`${a.entities.length} entities configured`:"No entity configured";case"button":return a.button_text&&a.button_text.trim()?a.button_text:a.text&&a.text.trim()?a.text:a.label&&a.label.trim()?a.label:"No button text configured";case"markdown":const l=a.content||a.markdown_content;if(l&&l.trim()){const t=l.replace(/[#*`>\-\[\]]/g,"").trim().split(" ").slice(0,8).join(" ");return t.length>40?`${t.substring(0,40)}...`:t}return"This is a markdown module that supports italic and bold text...";case"separator":const s=[];return a.separator_style&&s.push(`Style: ${a.separator_style}`),a.thickness&&s.push(`${a.thickness}px thick`),a.width_percent&&100!==a.width_percent&&s.push(`${a.width_percent}% width`),s.length>0?s.join(" • "):"Visual separator";default:return a.entity?`Entity: ${a.entity}`:(null===(n=a.entities)||void 0===n?void 0:n.length)?`${a.entities.length} entities`:void 0!==a.value?`Value: ${a.value}`:a.text?`Text: ${a.text.length>20?a.text.substring(0,20)+"...":a.text}`:`${t.type.charAt(0).toUpperCase()}${t.type.slice(1)} module`}}_renderSingleModuleWithAnimation(t){var e,o,i,n;te.setHass(this.hass);const a=te.evaluateDisplayConditions(t.display_conditions||[],t.display_mode||"always"),r=t,l=te.evaluateLogicProperties({logic_entity:null===(e=r.design)||void 0===e?void 0:e.logic_entity,logic_attribute:null===(o=r.design)||void 0===o?void 0:o.logic_attribute,logic_operator:null===(i=r.design)||void 0===i?void 0:i.logic_operator,logic_value:null===(n=r.design)||void 0===n?void 0:n.logic_value}),s=Kt().getModule(t.type),d=!a||!l;let c;c=s?s.renderPreview(t,this.hass):V`
        <div class="module-placeholder">
          <ha-icon icon="mdi:help-circle"></ha-icon>
          <span>Unknown Module: ${t.type}</span>
        </div>
      `;const p=this._getPreviewAnimationData(r);return V`
      <div class="module-with-logic ${d?"logic-hidden":""}">
        ${p.class?V`
              <div
                class="${p.class}"
                style="display: inherit; width: inherit; height: inherit; flex: inherit; animation-duration: ${p.duration};"
              >
                ${c}
              </div>
            `:c}
        ${d?V`
              <div class="logic-overlay">
                <ha-icon icon="mdi:eye-off-outline"></ha-icon>
                <span>Hidden by Logic</span>
              </div>
            `:""}
      </div>
    `}_getPreviewAnimationData(t){var e,o,i,n,a,r;const l=t.animation_type||(null===(e=t.design)||void 0===e?void 0:e.animation_type);if(!l||"none"===l)return{class:"",duration:"2s"};const s=t.animation_duration||(null===(o=t.design)||void 0===o?void 0:o.animation_duration)||"2s",d=t.animation_entity||(null===(i=t.design)||void 0===i?void 0:i.animation_entity),c=t.animation_trigger_type||(null===(n=t.design)||void 0===n?void 0:n.animation_trigger_type)||"state",p=t.animation_attribute||(null===(a=t.design)||void 0===a?void 0:a.animation_attribute),u=t.animation_state||(null===(r=t.design)||void 0===r?void 0:r.animation_state);if(!d)return{class:`animation-${l}`,duration:s};if(u&&this.hass){const t=this.hass.states[d];if(t){let e=!1;if("attribute"===c&&p){const o=t.attributes[p];e=String(o)===u}else e=t.state===u;if(e)return{class:`animation-${l}`,duration:s}}}return{class:"",duration:s}}_getRowPreviewAnimationData(t){const e=t.design||{},o=e.animation_type;if(!o||"none"===o)return{class:"",duration:"2s"};const i=e.animation_duration||"2s",n=e.animation_entity,a=e.animation_trigger_type||"state",r=e.animation_attribute,l=e.animation_state;if(!n)return{class:`animation-${o}`,duration:i};if(l&&this.hass){const t=this.hass.states[n];if(t){let e=!1;if("attribute"===a&&r){const o=t.attributes[r];e=String(o)===l}else e=t.state===l;if(e)return{class:`animation-${o}`,duration:i}}}return{class:"",duration:i}}_getColumnPreviewAnimationData(t){const e=t.design||{},o=e.animation_type;if(!o||"none"===o)return{class:"",duration:"2s"};const i=e.animation_duration||"2s",n=e.animation_entity,a=e.animation_trigger_type||"state",r=e.animation_attribute,l=e.animation_state;if(!n)return{class:`animation-${o}`,duration:i};if(l&&this.hass){const t=this.hass.states[n];if(t){let e=!1;if("attribute"===a&&r){const o=t.attributes[r];e=String(o)===l}else e=t.state===l;if(e)return{class:`animation-${o}`,duration:i}}}return{class:"",duration:i}}_renderRowPreview(t){const e=this._getRowPreviewAnimationData(t),o=V`
      <div
        class="row-preview-content"
        style="background: ${t.background_color||"var(--ha-card-background, var(--card-background-color, #fff))"};gap: ${t.gap||16}px;"
      >
        ${t.columns.map(((t,e)=>V`<div class="column-preview">Column ${e+1}</div>`))}
      </div>
    `;return V`
      <div class="module-preview">
        <div class="preview-header">Live Preview</div>
        <div class="preview-content">
          ${e.class?V`
                <div
                  class="${e.class}"
                  style="display: inherit; width: inherit; height: inherit; flex: inherit; animation-duration: ${e.duration};"
                >
                  ${o}
                </div>
              `:o}
        </div>
      </div>
    `}_renderColumnPreview(t){var e;const o=this._getColumnPreviewAnimationData(t),i=V`
      <div class="column-preview-content">
        <p>Column Preview</p>
        <div class="module-count">${(null===(e=t.modules)||void 0===e?void 0:e.length)||0} modules</div>
      </div>
    `;return V`
      <div class="module-preview">
        <div class="preview-header">Live Preview</div>
        <div class="preview-content">
          ${o.class?V`
                <div
                  class="${o.class}"
                  style="display: inherit; width: inherit; height: inherit; flex: inherit; animation-duration: ${o.duration};"
                >
                  ${i}
                </div>
              `:i}
        </div>
      </div>
    `}_renderModuleSettings(){var t,e,o;if(!this._selectedModule)return V``;const{rowIndex:i,columnIndex:n,moduleIndex:a}=this._selectedModule,r=null===(o=null===(e=null===(t=this.config.layout)||void 0===t?void 0:t.rows[i])||void 0===e?void 0:e.columns[n])||void 0===o?void 0:o.modules[a];if(!r)return V``;const l=Kt().getModule(r.type),s=l&&"function"==typeof l.renderActionsTab,d=l&&"function"==typeof l.renderOtherTab;return("actions"===this._activeModuleTab&&!s||"other"===this._activeModuleTab&&!d)&&(this._activeModuleTab="general"),V`
      <div class="module-settings-popup">
        <div class="popup-overlay"></div>
        <div class="popup-content">
          <div class="popup-header">
            <h3>Module Settings - ${r.type.charAt(0).toUpperCase()+r.type.slice(1)}</h3>
            <div class="header-actions">
              <button
                class="action-button duplicate-button"
                @click=${()=>{this._selectedModule&&(this._duplicateModule(this._selectedModule.rowIndex,this._selectedModule.columnIndex,this._selectedModule.moduleIndex),this._closeModuleSettings())}}
                title="Duplicate Module"
              >
                <ha-icon icon="mdi:content-copy"></ha-icon>
              </button>
              <button
                class="action-button delete-button"
                @click=${()=>{this._selectedModule&&(this._deleteModule(this._selectedModule.rowIndex,this._selectedModule.columnIndex,this._selectedModule.moduleIndex),this._closeModuleSettings())}}
                title="Delete Module"
              >
                <ha-icon icon="mdi:delete"></ha-icon>
              </button>
              <button class="close-button" @click=${()=>this._closeModuleSettings()}>×</button>
            </div>
          </div>

          ${this._renderModulePreview()}

          <div class="module-tabs">
            <button
              class="module-tab ${"general"===this._activeModuleTab?"active":""}"
              @click=${()=>this._activeModuleTab="general"}
            >
              General
            </button>
            ${s?V`
                  <button
                    class="module-tab ${"actions"===this._activeModuleTab?"active":""}"
                    @click=${()=>this._activeModuleTab="actions"}
                  >
                    Actions
                  </button>
                `:""}
            ${d?V`
                  <button
                    class="module-tab ${"other"===this._activeModuleTab?"active":""}"
                    @click=${()=>this._activeModuleTab="other"}
                  >
                    Other
                  </button>
                `:""}
            <button
              class="module-tab ${"logic"===this._activeModuleTab?"active":""}"
              @click=${()=>this._activeModuleTab="logic"}
            >
              Logic
            </button>
            <button
              class="module-tab ${"design"===this._activeModuleTab?"active":""}"
              @click=${()=>this._activeModuleTab="design"}
            >
              Design
            </button>
          </div>

          <div class="module-tab-content">
            ${"general"===this._activeModuleTab?this._renderGeneralTab(r):""}
            ${"actions"===this._activeModuleTab&&s?this._renderActionsTab(r):""}
            ${"other"===this._activeModuleTab&&d?this._renderOtherTab(r):""}
            ${"logic"===this._activeModuleTab?this._renderLogicTab(r):""}
            ${"design"===this._activeModuleTab?this._renderDesignTab(r):""}
          </div>
        </div>
      </div>
    `}_renderLayoutChildSettings(){if(!this._selectedLayoutChild)return V``;const{parentRowIndex:t,parentColumnIndex:e,parentModuleIndex:o,childIndex:i}=this._selectedLayoutChild,n=this._ensureLayout().rows[t];if(!n||!n.columns[e])return V``;const a=n.columns[e];if(!a.modules||!a.modules[o])return V``;const r=a.modules[o];if(!r.modules||!r.modules[i])return V``;const l=r.modules[i],s=Kt().getModule(l.type),d=s&&"function"==typeof s.renderActionsTab,c=s&&"function"==typeof s.renderOtherTab;return("actions"===this._activeModuleTab&&!d||"other"===this._activeModuleTab&&!c)&&(this._activeModuleTab="general"),V`
      <div class="module-settings-popup">
        <div class="popup-overlay" @click=${()=>this._closeLayoutChildSettings()}></div>
        <div class="popup-content">
          <div class="popup-header">
            <h3>
              Child Module Settings -
              ${l.type.charAt(0).toUpperCase()+l.type.slice(1)}
            </h3>
            <div class="header-actions">
              <button
                class="action-button duplicate-button"
                @click=${()=>{this._selectedLayoutChild&&(this._duplicateLayoutChildModule(this._selectedLayoutChild.parentRowIndex,this._selectedLayoutChild.parentColumnIndex,this._selectedLayoutChild.parentModuleIndex,this._selectedLayoutChild.childIndex),this._closeLayoutChildSettings())}}
                title="Duplicate Child Module"
              >
                <ha-icon icon="mdi:content-copy"></ha-icon>
              </button>
              <button
                class="action-button delete-button"
                @click=${()=>{this._selectedLayoutChild&&(this._deleteLayoutChildModule(this._selectedLayoutChild.parentRowIndex,this._selectedLayoutChild.parentColumnIndex,this._selectedLayoutChild.parentModuleIndex,this._selectedLayoutChild.childIndex),this._closeLayoutChildSettings())}}
                title="Delete Child Module"
              >
                <ha-icon icon="mdi:delete"></ha-icon>
              </button>
              <button class="close-button" @click=${()=>this._closeLayoutChildSettings()}>
                ×
              </button>
            </div>
          </div>

          <!-- Child module preview -->
          <div class="module-preview">
            <div class="preview-header">Live Preview</div>
            <div class="preview-content">${this._renderSingleModuleWithAnimation(l)}</div>
          </div>

          <div class="module-tabs">
            <button
              class="module-tab ${"general"===this._activeModuleTab?"active":""}"
              @click=${()=>this._activeModuleTab="general"}
            >
              General
            </button>
            ${d?V`
                  <button
                    class="module-tab ${"actions"===this._activeModuleTab?"active":""}"
                    @click=${()=>this._activeModuleTab="actions"}
                  >
                    Actions
                  </button>
                `:""}
            ${c?V`
                  <button
                    class="module-tab ${"other"===this._activeModuleTab?"active":""}"
                    @click=${()=>this._activeModuleTab="other"}
                  >
                    Other
                  </button>
                `:""}
            <button
              class="module-tab ${"logic"===this._activeModuleTab?"active":""}"
              @click=${()=>this._activeModuleTab="logic"}
            >
              Logic
            </button>
            <button
              class="module-tab ${"design"===this._activeModuleTab?"active":""}"
              @click=${()=>this._activeModuleTab="design"}
            >
              Design
            </button>
          </div>

          <div class="module-tab-content">
            ${"general"===this._activeModuleTab?this._renderLayoutChildGeneralTab(l):""}
            ${"actions"===this._activeModuleTab&&d?this._renderLayoutChildActionsTab(l):""}
            ${"other"===this._activeModuleTab&&c?this._renderLayoutChildOtherTab(l):""}
            ${"logic"===this._activeModuleTab?this._renderLayoutChildLogicTab(l):""}
            ${"design"===this._activeModuleTab?this._renderLayoutChildDesignTab(l):""}
          </div>
        </div>
      </div>
    `}_renderLayoutChildGeneralTab(t){const e=Kt().getModule(t.type),o=V`
      <div class="settings-section">
        <label>Module Name:</label>
        <input
          type="text"
          .value=${t.module_name||""}
          @input=${t=>this._updateLayoutChildModule({module_name:t.target.value})}
          placeholder="Give this module a custom name to make it easier to identify in the editor."
          class="module-name-input"
        />
        <div class="field-help">
          Give this module a custom name to make it easier to identify in the editor.
        </div>
      </div>
    `;if(e){const i=e.renderGeneralTab(t,this.hass,this.config,(t=>this._updateLayoutChildModule(t)));return V` ${o} ${i} `}return V`
      ${o}
      <div class="settings-section">
        <div class="error-message">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <span>No settings available for module type: ${t.type}</span>
        </div>
      </div>
    `}_renderLayoutChildActionsTab(t){const e=Kt().getModule(t.type);return e&&"function"==typeof e.renderActionsTab?e.renderActionsTab(t,this.hass,this.config,(t=>this._updateLayoutChildModule(t))):V`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>This module does not have action settings</span>
        </div>
      </div>
    `}_renderLayoutChildOtherTab(t){const e=Kt().getModule(t.type);return e&&"function"==typeof e.renderOtherTab?e.renderOtherTab(t,this.hass,this.config,(t=>this._updateLayoutChildModule(t))):V`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>This module does not have other settings</span>
        </div>
      </div>
    `}_renderLayoutChildLogicTab(t){const e=this._selectedModule;this._selectedModule={rowIndex:0,columnIndex:0,moduleIndex:0};const o=this._updateModule.bind(this);this._updateModule=t=>{this._updateLayoutChildModule(t)};const i=this._renderLogicTab(t);return this._selectedModule=e,this._updateModule=o,i}_renderLayoutChildDesignTab(t){const e=this._updateModule.bind(this),o=this._updateModuleDesign.bind(this);this._updateModule=t=>{this._updateLayoutChildModule(t)},this._updateModuleDesign=t=>{this._updateLayoutChildModule({design:t})};const i=this._renderDesignTab(t);return this._updateModule=e,this._updateModuleDesign=o,i}_renderRowSettings(){var t;if(-1===this._selectedRowForSettings)return V``;const e=null===(t=this.config.layout)||void 0===t?void 0:t.rows[this._selectedRowForSettings];return e?V`
      <div class="settings-popup">
        <div class="popup-overlay" @click=${()=>this._showRowSettings=!1}></div>
        <div class="popup-content">
          <div class="popup-header">
            <h3>Row Settings</h3>
            <div class="header-actions">
              <button
                class="action-button duplicate-button"
                @click=${()=>{this._duplicateRow(this._selectedRowForSettings),this._showRowSettings=!1}}
                title="Duplicate Row"
              >
                <ha-icon icon="mdi:content-copy"></ha-icon>
              </button>
              <button
                class="action-button delete-button"
                @click=${()=>{this._deleteRow(this._selectedRowForSettings),this._showRowSettings=!1}}
                title="Delete Row"
              >
                <ha-icon icon="mdi:delete"></ha-icon>
              </button>
              <button class="close-button" @click=${()=>this._showRowSettings=!1}>
                ×
              </button>
            </div>
          </div>

          ${this._renderRowPreview(e)}

          <div class="settings-tabs">
            <button
              class="settings-tab ${"general"===this._activeRowTab?"active":""}"
              @click=${()=>this._activeRowTab="general"}
            >
              General
            </button>
            <button
              class="settings-tab ${"logic"===this._activeRowTab?"active":""}"
              @click=${()=>this._activeRowTab="logic"}
            >
              Logic
            </button>
            <button
              class="settings-tab ${"design"===this._activeRowTab?"active":""}"
              @click=${()=>this._activeRowTab="design"}
            >
              Design
            </button>
          </div>

          <div class="settings-tab-content">
            ${"general"===this._activeRowTab?this._renderRowGeneralTab(e):""}
            ${"logic"===this._activeRowTab?this._renderRowLogicTab(e):""}
            ${"design"===this._activeRowTab?this._renderRowDesignTab(e):""}
          </div>
        </div>
      </div>
    `:V``}_renderColumnSettings(){var t,e;if(!this._selectedColumnForSettings)return V``;const{rowIndex:o,columnIndex:i}=this._selectedColumnForSettings,n=null===(e=null===(t=this.config.layout)||void 0===t?void 0:t.rows[o])||void 0===e?void 0:e.columns[i];return n?V`
      <div class="settings-popup">
        <div class="popup-overlay" @click=${()=>this._showColumnSettings=!1}></div>
        <div class="popup-content">
          <div class="popup-header">
            <h3>Column Settings</h3>
            <div class="header-actions">
              <button
                class="action-button duplicate-button"
                @click=${()=>{this._selectedColumnForSettings&&(this._duplicateColumn(this._selectedColumnForSettings.rowIndex,this._selectedColumnForSettings.columnIndex),this._showColumnSettings=!1)}}
                title="Duplicate Column"
              >
                <ha-icon icon="mdi:content-copy"></ha-icon>
              </button>
              <button
                class="action-button delete-button"
                @click=${()=>{this._selectedColumnForSettings&&(this._deleteColumn(this._selectedColumnForSettings.rowIndex,this._selectedColumnForSettings.columnIndex),this._showColumnSettings=!1)}}
                title="Delete Column"
              >
                <ha-icon icon="mdi:delete"></ha-icon>
              </button>
              <button class="close-button" @click=${()=>this._showColumnSettings=!1}>
                ×
              </button>
            </div>
          </div>

          ${this._renderColumnPreview(n)}

          <div class="settings-tabs">
            <button
              class="settings-tab ${"general"===this._activeColumnTab?"active":""}"
              @click=${()=>this._activeColumnTab="general"}
            >
              General
            </button>
            <button
              class="settings-tab ${"logic"===this._activeColumnTab?"active":""}"
              @click=${()=>this._activeColumnTab="logic"}
            >
              Logic
            </button>
            <button
              class="settings-tab ${"design"===this._activeColumnTab?"active":""}"
              @click=${()=>this._activeColumnTab="design"}
            >
              Design
            </button>
          </div>

          <div class="settings-tab-content">
            ${"general"===this._activeColumnTab?this._renderColumnGeneralTab(n):""}
            ${"logic"===this._activeColumnTab?this._renderColumnLogicTab(n):""}
            ${"design"===this._activeColumnTab?this._renderColumnDesignTab(n):""}
          </div>
        </div>
      </div>
    `:V``}_renderRowGeneralTab(t){return V`
      <div class="settings-section">
        <label>Row Name:</label>
        <input
          type="text"
          .value=${t.row_name||""}
          @input=${t=>this._updateRow({row_name:t.target.value})}
          placeholder="Give this row a custom name to make it easier to identify in the editor."
          class="row-name-input"
        />
        <div class="field-help">
          Give this row a custom name to make it easier to identify in the editor.
        </div>
      </div>
      <div class="settings-section">
        <ultra-color-picker
          .label=${"Row Background Color"}
          .value=${t.background_color||""}
          .defaultValue=${"var(--ha-card-background, var(--card-background-color, #fff))"}
          .hass=${this.hass}
          @value-changed=${t=>{const e=t.detail.value;this._updateRow({background_color:e})}}
        ></ultra-color-picker>
      </div>
      <div class="settings-section">
        <label>Column Gap (px):</label>
        <input
          type="number"
          min="0"
          max="50"
          .value=${t.gap||16}
          @change=${t=>this._updateRow({gap:Number(t.target.value)})}
        />
      </div>
    `}_renderRowLogicTab(t){const e=t.display_conditions||[],o=t.display_mode||"always",i=t.template_mode||!1;return V`
      <div class="logic-tab-content">
        <!-- Conditions Section (only shown when template mode is disabled) -->
        ${i?V`
              <div class="template-mode-notice">
                <p>
                  <em>Advanced Template Mode is enabled. Basic conditions above are ignored.</em>
                </p>
              </div>
            `:V`
              <div class="logic-section">
                <div class="section-header">
                  <h3>Display this Row</h3>
                </div>

                <div class="display-mode-selector">
                  <select
                    .value=${o}
                    @change=${t=>{const e=t.target.value;this._updateRow({display_mode:e})}}
                    class="display-mode-dropdown"
                  >
                    <option value="always">Always</option>
                    <option value="every">If EVERY condition below is met</option>
                    <option value="any">If ANY condition below is met</option>
                  </select>
                </div>
              </div>

              <!-- Conditions Section -->
              ${"always"!==o?V`
                    <div class="conditions-section">
                      <div class="conditions-header">
                        <h4>Conditions</h4>
                        <button
                          type="button"
                          class="add-condition-btn"
                          @click=${()=>this._addRowCondition(t)}
                        >
                          Add Condition
                        </button>
                      </div>

                      <div class="conditions-list">
                        ${e.map(((e,o)=>this._renderRowCondition(t,e,o)))}
                      </div>

                      ${0===e.length?V`
                            <div class="no-conditions">
                              <p>No conditions added yet. Click "Add Condition" to get started.</p>
                            </div>
                          `:""}
                    </div>
                  `:""}
            `}

        <!-- Advanced Template Mode Section -->
        <div class="template-section">
          <div class="switch-container">
            <span class="switch-label">Advanced Template Mode</span>
            <label class="switch">
              <input
                type="checkbox"
                .checked=${i}
                @change=${t=>{const e=t.target.checked;this._updateRow({template_mode:e,display_mode:e?"always":o})}}
              />
              <span class="slider"></span>
            </label>
          </div>
          <div class="template-description">
            Use Jinja2 templates for advanced conditional logic. When enabled, the conditions above
            are ignored.
          </div>

          ${i?V`
                <div class="template-content">
                  <textarea
                    .value=${t.template||""}
                    @input=${t=>this._updateRow({template:t.target.value})}
                    placeholder="{% if states('binary_sensor.example') == 'on' %}true{% else %}false{% endif %}"
                    class="template-editor"
                    rows="6"
                  ></textarea>
                  <div class="template-help">
                    <p><strong>Template should return a boolean value:</strong></p>
                    <ul>
                      <li>
                        <code>true</code>, <code>on</code>, <code>yes</code>, <code>1</code> → Show
                        row
                      </li>
                      <li>
                        <code>false</code>, <code>off</code>, <code>no</code>, <code>0</code> → Hide
                        row
                      </li>
                    </ul>
                  </div>
                </div>
              `:""}
        </div>
      </div>
    `}_renderRowDesignTab(t){var e,o,i,n,a,r,l,s,d,c,p,u,m,g,h,v,b,f,y,_,x,w,$,k,C,S,z,I,T,A,P,M;const L=Object.assign(Object.assign({},t.design),{background_color:(null===(e=t.design)||void 0===e?void 0:e.background_color)||t.background_color,padding_top:(null===(o=t.design)||void 0===o?void 0:o.padding_top)||(null===(i=t.padding)||void 0===i?void 0:i.toString()),padding_bottom:(null===(n=t.design)||void 0===n?void 0:n.padding_bottom)||(null===(a=t.padding)||void 0===a?void 0:a.toString()),padding_left:(null===(r=t.design)||void 0===r?void 0:r.padding_left)||(null===(l=t.padding)||void 0===l?void 0:l.toString()),padding_right:(null===(s=t.design)||void 0===s?void 0:s.padding_right)||(null===(d=t.padding)||void 0===d?void 0:d.toString()),border_radius:(null===(c=t.design)||void 0===c?void 0:c.border_radius)||(null===(p=t.border_radius)||void 0===p?void 0:p.toString()),border_color:(null===(u=t.design)||void 0===u?void 0:u.border_color)||t.border_color,border_width:(null===(m=t.design)||void 0===m?void 0:m.border_width)||(null===(g=t.border_width)||void 0===g?void 0:g.toString()),margin_top:(null===(h=t.design)||void 0===h?void 0:h.margin_top)||(null===(v=t.margin)||void 0===v?void 0:v.toString()),margin_bottom:(null===(b=t.design)||void 0===b?void 0:b.margin_bottom)||(null===(f=t.margin)||void 0===f?void 0:f.toString()),margin_left:(null===(y=t.design)||void 0===y?void 0:y.margin_left)||(null===(_=t.margin)||void 0===_?void 0:_.toString()),margin_right:(null===(x=t.design)||void 0===x?void 0:x.margin_right)||(null===(w=t.margin)||void 0===w?void 0:w.toString()),animation_type:null===($=t.design)||void 0===$?void 0:$.animation_type,animation_entity:null===(k=t.design)||void 0===k?void 0:k.animation_entity,animation_trigger_type:null===(C=t.design)||void 0===C?void 0:C.animation_trigger_type,animation_attribute:null===(S=t.design)||void 0===S?void 0:S.animation_attribute,animation_state:null===(z=t.design)||void 0===z?void 0:z.animation_state,animation_duration:null===(I=t.design)||void 0===I?void 0:I.animation_duration,intro_animation:null===(T=t.design)||void 0===T?void 0:T.intro_animation,outro_animation:null===(A=t.design)||void 0===A?void 0:A.outro_animation,animation_delay:null===(P=t.design)||void 0===P?void 0:P.animation_delay,animation_timing:null===(M=t.design)||void 0===M?void 0:M.animation_timing});return console.log("🔄 LayoutTab: Rendering row design tab with properties:",L),V`
      <ultra-global-design-tab
        .hass=${this.hass}
        .designProperties=${L}
        @design-changed=${e=>{console.log("🔄 LayoutTab: Received design-changed event for ROW:",e.detail),console.log("🔄 LayoutTab: Current row design before update:",t.design);const o=e.detail,i=Object.assign(Object.assign({},t.design),o);console.log("🔄 LayoutTab: Updated row design:",i),this._updateRow({design:i})}}
      ></ultra-global-design-tab>
    `}_renderColumnGeneralTab(t){return V`
      <div class="settings-section">
        <label>Column Name:</label>
        <input
          type="text"
          .value=${t.column_name||""}
          @input=${t=>this._updateColumn({column_name:t.target.value})}
          placeholder="Give this column a custom name to make it easier to identify in the editor."
          class="column-name-input"
        />
        <div class="field-help">
          Give this column a custom name to make it easier to identify in the editor.
        </div>
      </div>
      <div class="settings-section">
        <label>Vertical Alignment:</label>
        <select
          .value=${t.vertical_alignment||"center"}
          @change=${t=>this._updateColumn({vertical_alignment:t.target.value})}
        >
          <option value="top">Top</option>
          <option value="center">Center</option>
          <option value="bottom">Bottom</option>
          <option value="stretch">Stretch</option>
        </select>
      </div>
      <div class="settings-section">
        <label>Horizontal Alignment:</label>
        <select
          .value=${t.horizontal_alignment||"center"}
          @change=${t=>this._updateColumn({horizontal_alignment:t.target.value})}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="stretch">Stretch</option>
        </select>
      </div>
    `}_renderColumnLogicTab(t){const e=t.display_conditions||[],o=t.display_mode||"always",i=t.template_mode||!1;return V`
      <div class="logic-tab-content">
        <!-- Conditions Section (only shown when template mode is disabled) -->
        ${i?V`
              <div class="template-mode-notice">
                <p>
                  <em>Advanced Template Mode is enabled. Basic conditions above are ignored.</em>
                </p>
              </div>
            `:V`
              <div class="logic-section">
                <div class="section-header">
                  <h3>Display this Column</h3>
                </div>

                <div class="display-mode-selector">
                  <select
                    .value=${o}
                    @change=${t=>{const e=t.target.value;this._updateColumn({display_mode:e})}}
                    class="display-mode-dropdown"
                  >
                    <option value="always">Always</option>
                    <option value="every">If EVERY condition below is met</option>
                    <option value="any">If ANY condition below is met</option>
                  </select>
                </div>
              </div>

              <!-- Conditions Section -->
              ${"always"!==o?V`
                    <div class="conditions-section">
                      <div class="conditions-header">
                        <h4>Conditions</h4>
                        <button
                          type="button"
                          class="add-condition-btn"
                          @click=${()=>this._addColumnCondition(t)}
                        >
                          Add Condition
                        </button>
                      </div>

                      <div class="conditions-list">
                        ${e.map(((e,o)=>this._renderColumnCondition(t,e,o)))}
                      </div>

                      ${0===e.length?V`
                            <div class="no-conditions">
                              <p>No conditions added yet. Click "Add Condition" to get started.</p>
                            </div>
                          `:""}
                    </div>
                  `:""}
            `}

        <!-- Advanced Template Mode Section -->
        <div class="template-section">
          <div class="switch-container">
            <span class="switch-label">Advanced Template Mode</span>
            <label class="switch">
              <input
                type="checkbox"
                .checked=${i}
                @change=${t=>{const e=t.target.checked;this._updateColumn({template_mode:e,display_mode:e?"always":o})}}
              />
              <span class="slider"></span>
            </label>
          </div>
          <div class="template-description">
            Use Jinja2 templates for advanced conditional logic. When enabled, the conditions above
            are ignored.
          </div>

          ${i?V`
                <div class="template-content">
                  <textarea
                    .value=${t.template||""}
                    @input=${t=>this._updateColumn({template:t.target.value})}
                    placeholder="{% if states('binary_sensor.example') == 'on' %}true{% else %}false{% endif %}"
                    class="template-editor"
                    rows="6"
                  ></textarea>
                  <div class="template-help">
                    <p><strong>Template should return a boolean value:</strong></p>
                    <ul>
                      <li>
                        <code>true</code>, <code>on</code>, <code>yes</code>, <code>1</code> → Show
                        column
                      </li>
                      <li>
                        <code>false</code>, <code>off</code>, <code>no</code>, <code>0</code> → Hide
                        column
                      </li>
                    </ul>
                  </div>
                </div>
              `:""}
        </div>
      </div>
    `}_renderColumnDesignTab(t){var e,o,i,n,a,r,l,s,d,c,p,u,m,g,h,v,b,f,y,_,x,w,$,k,C,S,z,I,T,A,P,M;const L=Object.assign(Object.assign({},t.design),{background_color:(null===(e=t.design)||void 0===e?void 0:e.background_color)||t.background_color,padding_top:(null===(o=t.design)||void 0===o?void 0:o.padding_top)||(null===(i=t.padding)||void 0===i?void 0:i.toString()),padding_bottom:(null===(n=t.design)||void 0===n?void 0:n.padding_bottom)||(null===(a=t.padding)||void 0===a?void 0:a.toString()),padding_left:(null===(r=t.design)||void 0===r?void 0:r.padding_left)||(null===(l=t.padding)||void 0===l?void 0:l.toString()),padding_right:(null===(s=t.design)||void 0===s?void 0:s.padding_right)||(null===(d=t.padding)||void 0===d?void 0:d.toString()),border_radius:(null===(c=t.design)||void 0===c?void 0:c.border_radius)||(null===(p=t.border_radius)||void 0===p?void 0:p.toString()),border_color:(null===(u=t.design)||void 0===u?void 0:u.border_color)||t.border_color,border_width:(null===(m=t.design)||void 0===m?void 0:m.border_width)||(null===(g=t.border_width)||void 0===g?void 0:g.toString()),margin_top:(null===(h=t.design)||void 0===h?void 0:h.margin_top)||(null===(v=t.margin)||void 0===v?void 0:v.toString()),margin_bottom:(null===(b=t.design)||void 0===b?void 0:b.margin_bottom)||(null===(f=t.margin)||void 0===f?void 0:f.toString()),margin_left:(null===(y=t.design)||void 0===y?void 0:y.margin_left)||(null===(_=t.margin)||void 0===_?void 0:_.toString()),margin_right:(null===(x=t.design)||void 0===x?void 0:x.margin_right)||(null===(w=t.margin)||void 0===w?void 0:w.toString()),animation_type:null===($=t.design)||void 0===$?void 0:$.animation_type,animation_entity:null===(k=t.design)||void 0===k?void 0:k.animation_entity,animation_trigger_type:null===(C=t.design)||void 0===C?void 0:C.animation_trigger_type,animation_attribute:null===(S=t.design)||void 0===S?void 0:S.animation_attribute,animation_state:null===(z=t.design)||void 0===z?void 0:z.animation_state,animation_duration:null===(I=t.design)||void 0===I?void 0:I.animation_duration,intro_animation:null===(T=t.design)||void 0===T?void 0:T.intro_animation,outro_animation:null===(A=t.design)||void 0===A?void 0:A.outro_animation,animation_delay:null===(P=t.design)||void 0===P?void 0:P.animation_delay,animation_timing:null===(M=t.design)||void 0===M?void 0:M.animation_timing});return console.log("🔄 LayoutTab: Rendering column design tab with properties:",L),V`
      <ultra-global-design-tab
        .hass=${this.hass}
        .designProperties=${L}
        @design-changed=${e=>{console.log("🔄 LayoutTab: Received design-changed event for COLUMN:",e.detail),console.log("🔄 LayoutTab: Current column design before update:",t.design);const o=e.detail,i=Object.assign(Object.assign({},t.design),o);console.log("🔄 LayoutTab: Updated column design:",i),this._updateColumn({design:i})}}
      ></ultra-global-design-tab>
    `}_renderGeneralTab(t){const e=Kt().getModule(t.type),o=V`
      <div class="settings-section">
        <label>Module Name:</label>
        <input
          type="text"
          .value=${t.module_name||""}
          @input=${t=>this._updateModule({module_name:t.target.value})}
          placeholder="Give this module a custom name to make it easier to identify in the editor."
          class="module-name-input"
        />
        <div class="field-help">
          Give this module a custom name to make it easier to identify in the editor.
        </div>
      </div>
    `;if(e){const i=e.renderGeneralTab(t,this.hass,this.config,(t=>this._updateModule(t)));return t.type,V` ${o} ${i} `}return V`
      ${o}
      <div class="settings-section">
        <div class="error-message">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <span>No settings available for module type: ${t.type}</span>
        </div>
      </div>
    `}_renderActionsTab(t){const e=Kt().getModule(t.type);return e&&"function"==typeof e.renderActionsTab?e.renderActionsTab(t,this.hass,this.config,(t=>this._updateModule(t))):V`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>This module does not have action settings</span>
        </div>
      </div>
    `}_renderOtherTab(t){const e=Kt().getModule(t.type);return e&&"function"==typeof e.renderOtherTab?e.renderOtherTab(t,this.hass,this.config,(t=>this._updateModule(t))):V`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>This module does not have other settings</span>
        </div>
      </div>
    `}_addCondition(t){const e={id:`condition-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"entity_state",entity:"",operator:"=",value:"",enabled:!0},o=[...t.display_conditions||[],e];this._updateModule({display_conditions:o})}_addRowCondition(t){const e={id:`condition-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"entity_state",entity:"",operator:"=",value:"",enabled:!0},o=[...t.display_conditions||[],e];this._updateRow({display_conditions:o})}_addColumnCondition(t){const e={id:`condition-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"entity_state",entity:"",operator:"=",value:"",enabled:!0},o=[...t.display_conditions||[],e];this._updateColumn({display_conditions:o})}_removeCondition(t,e){const o=(t.display_conditions||[]).filter(((t,o)=>o!==e));this._updateModule({display_conditions:o})}_updateCondition(t,e,o){const i=(t.display_conditions||[]).map(((t,i)=>i===e?Object.assign(Object.assign({},t),o):t));this._updateModule({display_conditions:i})}_duplicateCondition(t,e){const o=t.display_conditions||[],i=o[e];if(i){const t=Object.assign(Object.assign({},i),{id:`condition-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}),n=[...o.slice(0,e+1),t,...o.slice(e+1)];this._updateModule({display_conditions:n})}}_renderRowCondition(t,e,o){return this._renderConditionGeneric(e,o,(e=>{const i=(t.display_conditions||[]).map(((t,i)=>i===o?Object.assign(Object.assign({},t),e):t));this._updateRow({display_conditions:i})}),(()=>{const e=(t.display_conditions||[]).filter(((t,e)=>e!==o));this._updateRow({display_conditions:e})}))}_renderColumnCondition(t,e,o){return this._renderConditionGeneric(e,o,(e=>{const i=(t.display_conditions||[]).map(((t,i)=>i===o?Object.assign(Object.assign({},t),e):t));this._updateColumn({display_conditions:i})}),(()=>{const e=(t.display_conditions||[]).filter(((t,e)=>e!==o));this._updateColumn({display_conditions:e})}))}_renderConditionGeneric(t,e,o,i){return V`
      <div class="condition-item ${t.enabled?"enabled":"disabled"}">
        <div class="condition-header">
          <div class="condition-header-left">
            <button type="button" class="condition-toggle ${"expanded"}">
              <ha-icon icon="mdi:chevron-${"down"}"></ha-icon>
            </button>
            <span class="condition-label">
              ${"entity_state"===t.type?t.entity||"Select Entity State":"entity_attribute"===t.type?t.entity||"Select Entity Attribute":"time"===t.type?"Time Condition":"Template Condition"}
            </span>
          </div>

          <div class="condition-actions">
            <button
              type="button"
              class="condition-action-btn delete"
              @click=${i}
              title="Delete"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </button>
          </div>
        </div>

        ${V`
              <div class="condition-content">
                <!-- Condition Type Selector -->
                <div class="condition-field">
                  <label>Condition Type:</label>
                  <select
                    .value=${t.type}
                    @change=${t=>{const e=t.target.value;o({type:e,entity:"",operator:"=",value:""})}}
                  >
                    <option value="entity_state">Entity State</option>
                    <option value="entity_attribute">Entity Attribute</option>
                    <option value="time">Date/Time</option>
                    <option value="template">Template</option>
                  </select>
                </div>

                ${"entity_state"===t.type?this._renderEntityConditionGeneric(t,o):""}
                ${"entity_attribute"===t.type?this._renderEntityAttributeConditionGeneric(t,o):""}

                <!-- Enable/Disable Toggle -->
                <div class="condition-field">
                  <label class="condition-enable-toggle">
                    <input
                      type="checkbox"
                      .checked=${!1!==t.enabled}
                      @change=${t=>o({enabled:t.target.checked})}
                    />
                    Enable this condition
                  </label>
                </div>
              </div>
            `}
      </div>
    `}_renderEntityConditionGeneric(t,e){return V`
      <div class="entity-condition-fields">
        <!-- Entity Picker -->
        <div class="condition-field">
          <label>Entity:</label>
          <ha-form
            .hass=${this.hass}
            .data=${{entity:t.entity||""}}
            .schema=${[{name:"entity",selector:{entity:{}}}]}
            @value-changed=${t=>e({entity:t.detail.value.entity})}
          ></ha-form>
        </div>

        <!-- Operator -->
        <div class="condition-field">
          <label>Operator:</label>
          <select
            .value=${t.operator||"="}
            @change=${t=>e({operator:t.target.value})}
          >
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">&gt;</option>
            <option value=">=">&gt;=</option>
            <option value="<">&lt;</option>
            <option value="<=">&lt;=</option>
            <option value="has_value">Has a value</option>
            <option value="no_value">Doesn't have a value</option>
          </select>
        </div>

        <!-- Value (if not has_value/no_value) -->
        ${"has_value"!==t.operator&&"no_value"!==t.operator?V`
              <div class="condition-field">
                <label>Value:</label>
                <input
                  type="text"
                  .value=${t.value||""}
                  @input=${t=>e({value:t.target.value})}
                  placeholder="Enter value to compare"
                />
              </div>
            `:""}
      </div>
    `}_renderEntityAttributeConditionGeneric(t,e){return V`
      <div class="entity-attribute-fields">
        <!-- Entity Picker -->
        <div class="condition-field">
          <label>Entity:</label>
          <ha-form
            .hass=${this.hass}
            .data=${{entity:t.entity||""}}
            .schema=${[{name:"entity",selector:{entity:{}}}]}
            @value-changed=${t=>e({entity:t.detail.value.entity})}
          ></ha-form>
        </div>

        <!-- Attribute Selector -->
        <div class="condition-field">
          <label>Attribute Name:</label>
          <input
            type="text"
            .value=${t.attribute||""}
            @input=${t=>e({attribute:t.target.value})}
            placeholder="Enter attribute name (e.g., battery_level, friendly_name)"
          />
          <div class="field-help">
            Enter the exact attribute name from the entity. Common examples: battery_level,
            friendly_name, unit_of_measurement
          </div>
        </div>

        <!-- Operator -->
        <div class="condition-field">
          <label>Operator:</label>
          <select
            .value=${t.operator||"="}
            @change=${t=>e({operator:t.target.value})}
          >
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">&gt;</option>
            <option value=">=">&gt;=</option>
            <option value="<">&lt;</option>
            <option value="<=">&lt;=</option>
            <option value="has_value">Has a value</option>
            <option value="no_value">Doesn't have a value</option>
          </select>
        </div>

        <!-- Value (if not has_value/no_value) -->
        ${"has_value"!==t.operator&&"no_value"!==t.operator?V`
              <div class="condition-field">
                <label>Value:</label>
                <input
                  type="text"
                  .value=${t.value||""}
                  @input=${t=>e({value:t.target.value})}
                  placeholder="Enter value to compare"
                />
              </div>
            `:""}
      </div>
    `}_renderCondition(t,e,o){return V`
      <div class="condition-item ${e.enabled?"enabled":"disabled"}">
        <div class="condition-header">
          <div class="condition-header-left">
            <button
              type="button"
              class="condition-toggle ${"expanded"}"
              @click=${()=>{}}
            >
              <ha-icon icon="mdi:chevron-${"down"}"></ha-icon>
            </button>
            <span class="condition-label">
              ${"entity_state"===e.type?e.entity||"Select Entity State":"entity_attribute"===e.type?e.entity||"Select Entity Attribute":"time"===e.type?"Time Condition":"Template Condition"}
            </span>
          </div>

          <div class="condition-actions">
            <button
              type="button"
              class="condition-action-btn"
              @click=${()=>this._duplicateCondition(t,o)}
              title="Duplicate"
            >
              <ha-icon icon="mdi:content-copy"></ha-icon>
            </button>
            <button
              type="button"
              class="condition-action-btn delete"
              @click=${()=>this._removeCondition(t,o)}
              title="Delete"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </button>
            <button type="button" class="condition-drag-handle" title="Drag to reorder">
              <ha-icon icon="mdi:drag"></ha-icon>
            </button>
          </div>
        </div>

        ${V`
              <div class="condition-content">
                <!-- Condition Type Selector -->
                <div class="condition-field">
                  <label>Condition Type:</label>
                  <select
                    .value=${e.type}
                    @change=${e=>{const i=e.target.value;this._updateCondition(t,o,{type:i,entity:"",operator:"=",value:""})}}
                  >
                    <option value="entity_state">Entity State</option>
                    <option value="entity_attribute">Entity Attribute</option>
                    <option value="time">Date/Time</option>
                    <option value="template">Template</option>
                  </select>
                </div>

                ${"entity_state"===e.type?this._renderEntityCondition(t,e,o):""}
                ${"entity_attribute"===e.type?this._renderEntityAttributeCondition(t,e,o):""}
                ${"time"===e.type?this._renderTimeCondition(t,e,o):""}
                ${"template"===e.type?this._renderTemplateCondition(t,e,o):""}

                <!-- Enable/Disable Toggle -->
                <div class="condition-field">
                  <label class="condition-enable-toggle">
                    <input
                      type="checkbox"
                      .checked=${!1!==e.enabled}
                      @change=${e=>this._updateCondition(t,o,{enabled:e.target.checked})}
                    />
                    Enable this condition
                  </label>
                </div>
              </div>
            `}
      </div>
    `}_renderEntityCondition(t,e,o){return V`
      <div class="entity-condition-fields">
        <!-- Entity Picker -->
        <div class="condition-field">
          <label>Entity:</label>
          <ha-form
            .hass=${this.hass}
            .data=${{entity:e.entity||""}}
            .schema=${[{name:"entity",selector:{entity:{}}}]}
            @value-changed=${e=>this._updateCondition(t,o,{entity:e.detail.value.entity})}
          ></ha-form>
        </div>

        <!-- Operator -->
        <div class="condition-field">
          <label>Operator:</label>
          <select
            .value=${e.operator||"="}
            @change=${e=>this._updateCondition(t,o,{operator:e.target.value})}
          >
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">&gt;</option>
            <option value=">=">&gt;=</option>
            <option value="<">&lt;</option>
            <option value="<=">&lt;=</option>
            <option value="has_value">Has a value</option>
            <option value="no_value">Doesn't have a value</option>
          </select>
        </div>

        <!-- Value (if not has_value/no_value) -->
        ${"has_value"!==e.operator&&"no_value"!==e.operator?V`
              <div class="condition-field">
                <label>Value:</label>
                <input
                  type="text"
                  .value=${e.value||""}
                  @input=${e=>this._updateCondition(t,o,{value:e.target.value})}
                  placeholder="Enter value to compare"
                />
              </div>
            `:""}
      </div>
    `}_renderEntityAttributeCondition(t,e,o){return V`
      <div class="entity-attribute-fields">
        <!-- Entity Picker -->
        <div class="condition-field">
          <label>Entity:</label>
          <ha-form
            .hass=${this.hass}
            .data=${{entity:e.entity||""}}
            .schema=${[{name:"entity",selector:{entity:{}}}]}
            @value-changed=${e=>this._updateCondition(t,o,{entity:e.detail.value.entity})}
          ></ha-form>
        </div>

        <!-- Attribute Selector -->
        <div class="condition-field">
          <label>Attribute Name:</label>
          <input
            type="text"
            .value=${e.attribute||""}
            @input=${e=>this._updateCondition(t,o,{attribute:e.target.value})}
            placeholder="Enter attribute name (e.g., battery_level, friendly_name)"
          />
          <div class="field-help">
            Enter the exact attribute name from the entity. Common examples: battery_level,
            friendly_name, unit_of_measurement
          </div>
        </div>

        <!-- Operator -->
        <div class="condition-field">
          <label>Operator:</label>
          <select
            .value=${e.operator||"="}
            @change=${e=>this._updateCondition(t,o,{operator:e.target.value})}
          >
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">&gt;</option>
            <option value=">=">&gt;=</option>
            <option value="<">&lt;</option>
            <option value="<=">&lt;=</option>
            <option value="has_value">Has a value</option>
            <option value="no_value">Doesn't have a value</option>
          </select>
        </div>

        <!-- Value (if not has_value/no_value) -->
        ${"has_value"!==e.operator&&"no_value"!==e.operator?V`
              <div class="condition-field">
                <label>Value:</label>
                <input
                  type="text"
                  .value=${e.value||""}
                  @input=${e=>this._updateCondition(t,o,{value:e.target.value})}
                  placeholder="Enter value to compare"
                />
              </div>
            `:""}
      </div>
    `}_renderTimeCondition(t,e,o){return V`
      <div class="time-condition-fields">
        <p class="condition-info">Local time is ${(new Date).toLocaleString()}</p>

        <div class="time-inputs">
          <div class="condition-field">
            <label>From Time:</label>
            <input
              type="time"
              .value=${e.time_from||""}
              @input=${e=>this._updateCondition(t,o,{time_from:e.target.value})}
            />
          </div>

          <div class="condition-field">
            <label>To Time:</label>
            <input
              type="time"
              .value=${e.time_to||""}
              @input=${e=>this._updateCondition(t,o,{time_to:e.target.value})}
            />
          </div>
        </div>
      </div>
    `}_renderTemplateCondition(t,e,o){return V`
      <div class="template-condition">
        <div class="condition-field">
          <label>Template:</label>
          <textarea
            .value=${e.template||""}
            @input=${e=>this._updateCondition(t,o,{template:e.target.value})}
            placeholder="{% if states('sensor.example') == 'on' %}true{% else %}false{% endif %}"
            rows="3"
          ></textarea>
        </div>
        <div class="template-help">Template should return 'true' or 'false'</div>
      </div>
    `}_renderLogicTab(t){const e=t.display_conditions||[],o=t.display_mode||"always",i=t.template_mode||!1;return V`
      <div class="logic-tab-content">
        <!-- Basic Conditions Section -->
        <div
          class="logic-section"
          style="opacity: ${i?"0.5":"1"}; pointer-events: ${i?"none":"auto"}"
        >
          <div class="section-header">
            <h3>Display this Element</h3>
            ${i?V`<span class="disabled-note">Disabled - Using Advanced Template Mode</span>`:""}
          </div>

          <div class="display-mode-selector">
            <select
              .value=${o}
              @change=${t=>{const e=t.target.value;this._updateModule({display_mode:e})}}
              class="display-mode-dropdown"
              .disabled=${i}
            >
              <option value="always">Always</option>
              <option value="every">If EVERY condition below is met</option>
              <option value="any">If ANY condition below is met</option>
            </select>
          </div>
        </div>

        <!-- Conditions Section -->
        ${"always"!==o?V`
              <div
                class="conditions-section"
                style="opacity: ${i?"0.5":"1"}; pointer-events: ${i?"none":"auto"}"
              >
                <div class="conditions-header">
                  <h4>Conditions</h4>
                  ${i?V`<span class="disabled-note"
                        >Disabled - Using Advanced Template Mode</span
                      >`:""}
                  <button
                    type="button"
                    class="add-condition-btn"
                    @click=${()=>this._addCondition(t)}
                    .disabled=${i}
                  >
                    Add Condition
                  </button>
                </div>

                <div class="conditions-list">
                  ${e.map(((e,o)=>this._renderCondition(t,e,o)))}
                </div>

                ${0===e.length?V`
                      <div class="no-conditions">
                        <p>No conditions added yet. Click "Add Condition" to get started.</p>
                      </div>
                    `:""}
              </div>
            `:""}

        <!-- Advanced Template Mode Section -->
        <div class="template-section">
          <div class="template-header">
            <div class="switch-container">
              <label class="switch-label">Advanced Template Mode</label>
              <label class="switch">
                <input
                  type="checkbox"
                  .checked=${i}
                  @change=${t=>{const e=t.target.checked;this._updateModule({template_mode:e,display_mode:e?"always":o})}}
                />
                <span class="slider round"></span>
              </label>
            </div>
            <div class="template-description">
              Use Jinja2 templates for advanced conditional logic. When enabled, the conditions
              above are ignored.
            </div>
          </div>

          ${i?V`
                <div class="template-content">
                  <textarea
                    .value=${t.template||""}
                    @input=${t=>this._updateModule({template:t.target.value})}
                    placeholder="{% if states('binary_sensor.example') == 'on' %}true{% else %}false{% endif %}"
                    class="template-editor"
                    rows="6"
                  ></textarea>
                  <div class="template-help">
                    <p><strong>Template should return a boolean value:</strong></p>
                    <ul>
                      <li>
                        <code>true</code>, <code>on</code>, <code>yes</code>, <code>1</code> → Show
                        element
                      </li>
                      <li>
                        <code>false</code>, <code>off</code>, <code>no</code>, <code>0</code> → Hide
                        element
                      </li>
                    </ul>
                    <p><strong>Examples:</strong></p>
                    <ul>
                      <li><code>{{ states('sensor.temperature') | float > 20 }}</code></li>
                      <li>
                        <code>{% if is_state('binary_sensor.motion', 'on') %}true{% endif %}</code>
                      </li>
                      <li><code>{{ state_attr('sensor.weather', 'humidity') > 50 }}</code></li>
                    </ul>
                  </div>
                </div>
              `:""}
        </div>
      </div>
    `}_renderDesignTab(t){var e,o,i,n,a,r,l,s,d,c,p,u,m,g,h,v,b,f,y,_,x,w,$,k,C;const S={color:t.color,text_align:t.text_align||t.alignment,font_size:null===(e=t.font_size)||void 0===e?void 0:e.toString(),line_height:null===(o=t.line_height)||void 0===o?void 0:o.toString(),letter_spacing:t.letter_spacing,font_family:t.font_family,font_weight:t.font_weight,text_transform:t.text_transform,font_style:t.font_style,background_color:t.background_color,background_image:t.background_image,background_image_type:t.background_image_type,background_image_entity:t.background_image_entity,backdrop_filter:t.backdrop_filter,width:t.width,height:t.height,max_width:t.max_width,max_height:t.max_height,min_width:t.min_width,min_height:t.min_height,margin_top:(null===(n=null===(i=t.margin)||void 0===i?void 0:i.top)||void 0===n?void 0:n.toString())||t.margin_top,margin_bottom:(null===(r=null===(a=t.margin)||void 0===a?void 0:a.bottom)||void 0===r?void 0:r.toString())||t.margin_bottom,margin_left:(null===(s=null===(l=t.margin)||void 0===l?void 0:l.left)||void 0===s?void 0:s.toString())||t.margin_left,margin_right:(null===(c=null===(d=t.margin)||void 0===d?void 0:d.right)||void 0===c?void 0:c.toString())||t.margin_right,padding_top:(null===(u=null===(p=t.padding)||void 0===p?void 0:p.top)||void 0===u?void 0:u.toString())||t.padding_top,padding_bottom:(null===(g=null===(m=t.padding)||void 0===m?void 0:m.bottom)||void 0===g?void 0:g.toString())||t.padding_bottom,padding_left:(null===(v=null===(h=t.padding)||void 0===h?void 0:h.left)||void 0===v?void 0:v.toString())||t.padding_left,padding_right:(null===(f=null===(b=t.padding)||void 0===b?void 0:b.right)||void 0===f?void 0:f.toString())||t.padding_right,border_radius:(null===(_=null===(y=t.border)||void 0===y?void 0:y.radius)||void 0===_?void 0:_.toString())||(null===(x=t.border_radius)||void 0===x?void 0:x.toString()),border_style:(null===(w=t.border)||void 0===w?void 0:w.style)||t.border_style,border_width:(null===(k=null===($=t.border)||void 0===$?void 0:$.width)||void 0===k?void 0:k.toString())||t.border_width,border_color:(null===(C=t.border)||void 0===C?void 0:C.color)||t.border_color,position:t.position,top:t.top,bottom:t.bottom,left:t.left,right:t.right,z_index:t.z_index,text_shadow_h:t.text_shadow_h,text_shadow_v:t.text_shadow_v,text_shadow_blur:t.text_shadow_blur,text_shadow_color:t.text_shadow_color,box_shadow_h:t.box_shadow_h,box_shadow_v:t.box_shadow_v,box_shadow_blur:t.box_shadow_blur,box_shadow_spread:t.box_shadow_spread,box_shadow_color:t.box_shadow_color,overflow:t.overflow,clip_path:t.clip_path,animation_type:t.animation_type,animation_entity:t.animation_entity,animation_trigger_type:t.animation_trigger_type,animation_attribute:t.animation_attribute,animation_state:t.animation_state,intro_animation:t.intro_animation,outro_animation:t.outro_animation,animation_duration:t.animation_duration,animation_delay:t.animation_delay,animation_timing:t.animation_timing};return console.log("🔄 LayoutTab: Rendering module design tab with properties:",S),V`
      <ultra-global-design-tab
        .hass=${this.hass}
        .designProperties=${S}
        .onUpdate=${t=>{console.log("🔄 LayoutTab: Received onUpdate callback for MODULE:",t),console.log("🔄 LayoutTab: Current selected module:",this._selectedModule),this._updateModuleDesign(t)}}
      ></ultra-global-design-tab>
    `}_renderTextDesignTab(t){if("text"===t.type){const e=t;return V`
        <!-- Text Color Section -->
        <div class="settings-section">
          <ultra-color-picker
            .label=${"Text Color"}
            .value=${e.color||""}
            .defaultValue=${"var(--primary-text-color)"}
            .hass=${this.hass}
            @value-changed=${t=>{const o=t.detail.value;this._updateModule({color:o}),this._loadGoogleFont(e.font_family)}}
          ></ultra-color-picker>
        </div>

        <!-- Font Family Dropdown -->
        <div class="settings-section">
          <label>Font:</label>
          <select
            .value=${e.font_family||"default"}
            @change=${t=>{const e=t.target.value;this._updateModule({font_family:e}),this._loadGoogleFont(e)}}
            class="font-dropdown"
          >
            ${pe.map((t=>V`
                <option value="${t.value}" ?selected=${e.font_family===t.value}>
                  ${t.label}
                </option>
              `))}
            <optgroup label="Fonts from Typography settings">
              ${ue.map((t=>V`
                  <option value="${t.value}" ?selected=${e.font_family===t.value}>
                    ${t.label}
                  </option>
                `))}
            </optgroup>
            <optgroup label="Web safe font combinations (do not need to be loaded)">
              ${me.map((t=>V`
                  <option value="${t.value}" ?selected=${e.font_family===t.value}>
                    ${t.label}
                  </option>
                `))}
            </optgroup>
          </select>
        </div>

        <!-- Font Size -->
        <div class="settings-section">
          <label>Font Size (px):</label>
          <input
            type="number"
            min="8"
            max="72"
            .value=${e.font_size||16}
            @input=${t=>this._updateModule({font_size:Number(t.target.value)})}
            class="font-size-input"
          />
        </div>

        <!-- Text Alignment -->
        <div class="settings-section">
          <label>Text Alignment:</label>
          <div class="alignment-buttons">
            ${["left","center","right"].map((t=>V`
                <button
                  class="alignment-btn ${e.alignment===t?"active":""}"
                  @click=${()=>this._updateModule({alignment:t})}
                >
                  <ha-icon icon="mdi:format-align-${t}"></ha-icon>
                </button>
              `))}
          </div>
        </div>

        <!-- Text Formatting -->
        <div class="settings-section">
          <label>Text Formatting:</label>
          <div class="format-buttons">
            <button
              class="format-btn ${e.bold?"active":""}"
              @click=${()=>this._updateModule({bold:!e.bold})}
            >
              <ha-icon icon="mdi:format-bold"></ha-icon>
            </button>
            <button
              class="format-btn ${e.italic?"active":""}"
              @click=${()=>this._updateModule({italic:!e.italic})}
            >
              <ha-icon icon="mdi:format-italic"></ha-icon>
            </button>
            <button
              class="format-btn ${e.uppercase?"active":""}"
              @click=${()=>this._updateModule({uppercase:!e.uppercase})}
            >
              <ha-icon icon="mdi:format-letter-case-upper"></ha-icon>
            </button>
            <button
              class="format-btn ${e.strikethrough?"active":""}"
              @click=${()=>this._updateModule({strikethrough:!e.strikethrough})}
            >
              <ha-icon icon="mdi:format-strikethrough"></ha-icon>
            </button>
          </div>
        </div>
      `}if("separator"===t.type)return V`
        <div class="settings-section">
          <ultra-color-picker
            .label=${"Separator Color"}
            .value=${t.color||""}
            .defaultValue=${"var(--divider-color)"}
            .hass=${this.hass}
            @value-changed=${t=>{const e=t.detail.value;this._updateModule({color:e})}}
          ></ultra-color-picker>
        </div>
      `;if("bar"===t.type){const e=t;return V`
        <!-- Bar Colors -->
        <div class="settings-section">
          <ultra-color-picker
            .label=${"Bar Color"}
            .value=${e.bar_color||""}
            .defaultValue=${"var(--primary-color)"}
            .hass=${this.hass}
            @value-changed=${t=>{const e=t.detail.value;this._updateModule({bar_color:e})}}
          ></ultra-color-picker>
        </div>

        <div class="settings-section">
          <ultra-color-picker
            .label=${"Background Color"}
            .value=${e.background_color||""}
            .defaultValue=${"var(--secondary-background-color)"}
            .hass=${this.hass}
            @value-changed=${t=>{const e=t.detail.value;this._updateModule({background_color:e})}}
          ></ultra-color-picker>
        </div>

        <!-- Bar Dimensions -->
        <div class="settings-section">
          <label>Bar Height (px):</label>
          <input
            type="number"
            min="10"
            max="100"
            step="5"
            .value=${e.height||20}
            @input=${t=>this._updateModule({height:Number(t.target.value)})}
            class="number-input"
          />
        </div>

        <div class="settings-section">
          <label>Border Radius (px):</label>
          <input
            type="number"
            min="0"
            max="50"
            .value=${e.border_radius||10}
            @input=${t=>this._updateModule({border_radius:Number(t.target.value)})}
            class="number-input"
          />
        </div>

        <!-- Value Display Options -->
        <div class="settings-section">
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              .checked=${!1!==e.show_value}
              @change=${t=>this._updateModule({show_value:t.target.checked})}
            />
            Show Value
          </label>
        </div>

        ${e.show_value?V`
              <div class="settings-section">
                <label>Value Position:</label>
                <div class="value-position-buttons">
                  ${["inside","outside","none"].map((t=>V`
                      <button
                        class="position-btn ${e.value_position===t?"active":""}"
                        @click=${()=>this._updateModule({value_position:t})}
                      >
                        ${t.charAt(0).toUpperCase()+t.slice(1)}
                      </button>
                    `))}
                </div>
              </div>
            `:""}

        <div class="settings-section">
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              .checked=${!1!==e.show_percentage}
              @change=${t=>this._updateModule({show_percentage:t.target.checked})}
            />
            Show as Percentage
          </label>
        </div>

        <div class="settings-section">
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              .checked=${!1!==e.animation}
              @change=${t=>this._updateModule({animation:t.target.checked})}
            />
            Animation
          </label>
        </div>
      `}if("image"===t.type){const e=t;return V`
        <!-- Image Alignment -->
        <div class="settings-section">
          <label>Image Alignment:</label>
          <div class="alignment-buttons">
            ${["left","center","right"].map((t=>V`
                <button
                  class="alignment-btn ${e.alignment===t?"active":""}"
                  @click=${()=>this._updateModule({alignment:t})}
                >
                  <ha-icon icon="mdi:format-align-${t}"></ha-icon>
                </button>
              `))}
          </div>
        </div>

        <!-- Image Dimensions -->
        <div class="settings-section">
          <label>Width (px):</label>
          <input
            type="number"
            min="50"
            max="500"
            step="10"
            .value=${e.image_width||100}
            @input=${t=>this._updateModule({image_width:Number(t.target.value)})}
            class="number-input"
          />
        </div>

        <div class="settings-section">
          <label>Height (px):</label>
          <input
            type="number"
            min="50"
            max="500"
            step="10"
            .value=${e.image_height||100}
            @input=${t=>this._updateModule({image_height:Number(t.target.value)})}
            class="number-input"
          />
        </div>

        <div class="settings-section">
          <label>Border Radius (px):</label>
          <input
            type="number"
            min="0"
            max="50"
            .value=${e.border_radius||8}
            @input=${t=>this._updateModule({border_radius:Number(t.target.value)})}
            class="number-input"
          />
        </div>

        <div class="settings-section">
          <label>Image Fit:</label>
          <div class="value-position-buttons">
            ${["cover","contain","fill","none"].map((t=>V`
                <button
                  class="position-btn ${e.image_fit===t?"active":""}"
                  @click=${()=>this._updateModule({image_fit:t})}
                >
                  ${t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              `))}
          </div>
        </div>
      `}return V`<div class="settings-section">
      <p>Design options not available for ${t.type} modules.</p>
    </div>`}_renderBackgroundDesignTab(t){return V`
      <div class="settings-section">
        <ultra-color-picker
          .label=${"Background Color"}
          .value=${t.background_color||""}
          .defaultValue=${"var(--ha-card-background, var(--card-background-color, #fff))"}
          .hass=${this.hass}
          @value-changed=${t=>{const e=t.detail.value;this._updateModule({background_color:e})}}
        ></ultra-color-picker>
      </div>
    `}_renderSpacingDesignTab(t){var e,o,i,n,a,r,l,s;return V`
      <div class="spacing-grid">
        <div class="spacing-section">
          <h4>Margin</h4>
          <div class="spacing-cross">
            <input
              type="number"
              placeholder="Top"
              .value=${(null===(e=t.margin)||void 0===e?void 0:e.top)||0}
              @input=${e=>this._updateModule({margin:Object.assign(Object.assign({},t.margin),{top:Number(e.target.value)})})}
            />
            <div class="spacing-row">
              <input
                type="number"
                placeholder="Left"
                .value=${(null===(o=t.margin)||void 0===o?void 0:o.left)||0}
                @input=${e=>this._updateModule({margin:Object.assign(Object.assign({},t.margin),{left:Number(e.target.value)})})}
              />
              <span class="spacing-center">M</span>
              <input
                type="number"
                placeholder="Right"
                .value=${(null===(i=t.margin)||void 0===i?void 0:i.right)||0}
                @input=${e=>this._updateModule({margin:Object.assign(Object.assign({},t.margin),{right:Number(e.target.value)})})}
              />
            </div>
            <input
              type="number"
              placeholder="Bottom"
              .value=${(null===(n=t.margin)||void 0===n?void 0:n.bottom)||0}
              @input=${e=>this._updateModule({margin:Object.assign(Object.assign({},t.margin),{bottom:Number(e.target.value)})})}
            />
          </div>
        </div>

        <div class="spacing-section">
          <h4>Padding</h4>
          <div class="spacing-cross">
            <input
              type="number"
              placeholder="Top"
              .value=${(null===(a=t.padding)||void 0===a?void 0:a.top)||0}
              @input=${e=>this._updateModule({padding:Object.assign(Object.assign({},t.padding),{top:Number(e.target.value)})})}
            />
            <div class="spacing-row">
              <input
                type="number"
                placeholder="Left"
                .value=${(null===(r=t.padding)||void 0===r?void 0:r.left)||0}
                @input=${e=>this._updateModule({padding:Object.assign(Object.assign({},t.padding),{left:Number(e.target.value)})})}
              />
              <span class="spacing-center">P</span>
              <input
                type="number"
                placeholder="Right"
                .value=${(null===(l=t.padding)||void 0===l?void 0:l.right)||0}
                @input=${e=>this._updateModule({padding:Object.assign(Object.assign({},t.padding),{right:Number(e.target.value)})})}
              />
            </div>
            <input
              type="number"
              placeholder="Bottom"
              .value=${(null===(s=t.padding)||void 0===s?void 0:s.bottom)||0}
              @input=${e=>this._updateModule({padding:Object.assign(Object.assign({},t.padding),{bottom:Number(e.target.value)})})}
            />
          </div>
        </div>
      </div>
    `}firstUpdated(t){super.firstUpdated(t),this._loadCollapseState()}updated(t){super.updated(t)}_renderBorderDesignTab(t){var e;return V`
      <div class="settings-section">
        <label>Border Radius (px):</label>
        <input
          type="number"
          min="0"
          max="50"
          .value=${(null===(e=t.border)||void 0===e?void 0:e.radius)||0}
          @input=${e=>this._updateModule({border:Object.assign(Object.assign({},t.border),{radius:Number(e.target.value)})})}
        />
      </div>
    `}render(){const t=this._ensureLayout();return V`
      <div class="layout-builder">
        ${this.isFullScreen?V`
              <div class="fullscreen-header">
                <button
                  class="add-row-btn fullscreen-add-btn"
                  @click=${t=>{t.stopPropagation(),this._addRow()}}
                >
                  <ha-icon icon="mdi:plus"></ha-icon>
                  Add Row
                </button>
              </div>
            `:V`
              <div class="builder-header">
                <div class="builder-title">
                  <h3>Layout Builder</h3>
                </div>
                <button
                  class="add-row-btn"
                  @click=${t=>{t.stopPropagation(),this._addRow()}}
                >
                  Add Row
                </button>
              </div>
            `}

        <div class="rows-container">
          ${t.rows.map(((t,e)=>{var o,i;return V`
              <div
                class="row-builder ${this._isRowCollapsed(e)?"collapsed":""} ${"row"===(null===(o=this._dropTarget)||void 0===o?void 0:o.type)&&(null===(i=this._dropTarget)||void 0===i?void 0:i.rowIndex)===e?"drop-target":""}"
                draggable="true"
                @dragstart=${t=>this._onDragStart(t,"row",e)}
                @dragend=${this._onDragEnd}
                @dragover=${this._onDragOver}
                @dragenter=${t=>this._onDragEnter(t,"row",e)}
                @dragleave=${this._onDragLeave}
                @drop=${t=>this._onDrop(t,"row",e)}
              >
                <div class="row-header">
                  <div class="row-title">
                    <div class="row-drag-handle" title="Drag to move row">
                      <ha-icon icon="mdi:drag"></ha-icon>
                    </div>
                    <button
                      class="row-collapse-btn"
                      @click=${t=>{t.stopPropagation(),this._toggleRowCollapse(e)}}
                      @mousedown=${t=>t.stopPropagation()}
                      @dragstart=${t=>t.preventDefault()}
                      title="${this._isRowCollapsed(e)?"Expand Row":"Collapse Row"}"
                    >
                      <ha-icon
                        icon="mdi:chevron-${this._isRowCollapsed(e)?"right":"down"}"
                      ></ha-icon>
                    </button>
                    <span>${this._getRowDisplayName(t,e)}</span>
                    <button
                      class="column-layout-btn"
                      @click=${t=>{t.stopPropagation(),this._openColumnLayoutSelector(e)}}
                      @mousedown=${t=>t.stopPropagation()}
                      @dragstart=${t=>t.preventDefault()}
                      title="Change Column Layout"
                    >
                      <span class="layout-icon">${this._getCurrentLayoutDisplay(t)}</span>
                    </button>
                  </div>
                  <div class="row-actions">
                    <button
                      class="row-duplicate-btn"
                      @click=${t=>{t.stopPropagation(),this._duplicateRow(e)}}
                      @mousedown=${t=>t.stopPropagation()}
                      @dragstart=${t=>t.preventDefault()}
                      title="Duplicate Row"
                    >
                      <ha-icon icon="mdi:content-copy"></ha-icon>
                    </button>
                    <button
                      class="row-settings-btn"
                      @click=${t=>{t.stopPropagation(),this._openRowSettings(e)}}
                      @mousedown=${t=>t.stopPropagation()}
                      @dragstart=${t=>t.preventDefault()}
                      title="Row Settings"
                    >
                      <ha-icon icon="mdi:cog"></ha-icon>
                    </button>
                    <button
                      class="delete-row-btn"
                      @click=${t=>{t.stopPropagation(),this._deleteRow(e)}}
                      @mousedown=${t=>t.stopPropagation()}
                      @dragstart=${t=>t.preventDefault()}
                      title="Delete Row"
                      style="margin-left: 8px;"
                    >
                      <ha-icon icon="mdi:delete"></ha-icon>
                    </button>
                  </div>
                </div>
                ${this._isRowCollapsed(e)?"":V`
                      <div
                        class="columns-container"
                        data-layout="${t.column_layout||"1-2-1-2"}"
                        style="${this.isFullScreen?`display: grid !important; grid-template-columns: ${this._getGridTemplateColumns(t.column_layout||"1-2-1-2",t.columns.length)}; gap: 16px; align-items: flex-start;`:""}"
                      >
                        ${t.columns&&t.columns.length>0?t.columns.map(((t,o)=>{var i,n,a,r,l,s;return V`
                                <div
                                  class="column-builder ${this._isColumnCollapsed(e,o)?"collapsed":""} ${"column"===(null===(i=this._dropTarget)||void 0===i?void 0:i.type)&&(null===(n=this._dropTarget)||void 0===n?void 0:n.rowIndex)===e&&(null===(a=this._dropTarget)||void 0===a?void 0:a.columnIndex)===o?"drop-target":""}"
                                  draggable="true"
                                  @dragstart=${t=>this._onDragStart(t,"column",e,o)}
                                  @dragend=${this._onDragEnd}
                                  @dragover=${this._onDragOver}
                                  @dragenter=${t=>this._onDragEnter(t,"column",e,o)}
                                  @dragleave=${this._onDragLeave}
                                  @drop=${t=>this._onDrop(t,"column",e,o)}
                                >
                                  <div class="column-header">
                                    <div class="column-title">
                                      <div class="column-drag-handle" title="Drag to move column">
                                        <ha-icon icon="mdi:drag"></ha-icon>
                                      </div>
                                      <button
                                        class="column-collapse-btn"
                                        @click=${t=>{t.stopPropagation(),this._toggleColumnCollapse(e,o)}}
                                        @mousedown=${t=>t.stopPropagation()}
                                        @dragstart=${t=>t.preventDefault()}
                                        title="${this._isColumnCollapsed(e,o)?"Expand Column":"Collapse Column"}"
                                      >
                                        <ha-icon
                                          icon="mdi:chevron-${this._isColumnCollapsed(e,o)?"right":"down"}"
                                        ></ha-icon>
                                      </button>
                                      <span
                                        >${this._getColumnDisplayName(t,o)}</span
                                      >
                                    </div>
                                    <div class="column-actions">
                                      <button
                                        class="column-duplicate-btn"
                                        @click=${t=>{t.stopPropagation(),this._duplicateColumn(e,o)}}
                                        @mousedown=${t=>t.stopPropagation()}
                                        @dragstart=${t=>t.preventDefault()}
                                        title="Duplicate Column"
                                      >
                                        <ha-icon icon="mdi:content-copy"></ha-icon>
                                      </button>
                                      <button
                                        class="column-settings-btn"
                                        @click=${t=>{t.stopPropagation(),this._openColumnSettings(e,o)}}
                                        @mousedown=${t=>t.stopPropagation()}
                                        @dragstart=${t=>t.preventDefault()}
                                        title="Column Settings"
                                      >
                                        <ha-icon icon="mdi:cog"></ha-icon>
                                      </button>
                                      <button
                                        class="column-delete-btn"
                                        @click=${t=>{t.stopPropagation(),this._deleteColumn(e,o)}}
                                        @mousedown=${t=>t.stopPropagation()}
                                        @dragstart=${t=>t.preventDefault()}
                                        title="Delete Column"
                                        style="margin-left: 8px;"
                                      >
                                        <ha-icon icon="mdi:delete"></ha-icon>
                                      </button>
                                    </div>
                                  </div>
                                  ${this._isColumnCollapsed(e,o)?"":V`
                                        <div
                                          class="modules-container ${"column"===(null===(r=this._dropTarget)||void 0===r?void 0:r.type)&&(null===(l=this._dropTarget)||void 0===l?void 0:l.rowIndex)===e&&(null===(s=this._dropTarget)||void 0===s?void 0:s.columnIndex)===o?"drop-target":""}"
                                          @dragover=${this._onDragOver}
                                          @dragenter=${t=>this._onDragEnter(t,"column",e,o)}
                                          @dragleave=${this._onDragLeave}
                                          @drop=${t=>this._onDrop(t,"column",e,o)}
                                        >
                                          ${t.modules.map(((t,i)=>{var n,a,r,l;return V`
                                              <div
                                                class="module-item"
                                                draggable="true"
                                                @dragstart=${t=>this._onDragStart(t,"module",e,o,i)}
                                                @dragend=${this._onDragEnd}
                                                @dragover=${this._onDragOver}
                                                @dragenter=${t=>this._onDragEnter(t,"module",e,o,i)}
                                                @dragleave=${this._onDragLeave}
                                                @drop=${t=>this._onDrop(t,"module",e,o,i)}
                                                class="${"module"===(null===(n=this._dropTarget)||void 0===n?void 0:n.type)&&(null===(a=this._dropTarget)||void 0===a?void 0:a.rowIndex)===e&&(null===(r=this._dropTarget)||void 0===r?void 0:r.columnIndex)===o&&(null===(l=this._dropTarget)||void 0===l?void 0:l.moduleIndex)===i?"drop-target":""}"
                                              >
                                                <div
                                                  class="module-content"
                                                  @click=${()=>this._openModuleSettings(e,o,i)}
                                                >
                                                  ${this._renderSingleModule(t,e,o,i)}
                                                </div>
                                              </div>
                                            `}))}
                                          <button
                                            class="add-module-btn"
                                            @click=${t=>{t.stopPropagation(),this._openModuleSelector(e,o)}}
                                          >
                                            <ha-icon icon="mdi:plus"></ha-icon>
                                            Add Module
                                          </button>
                                        </div>
                                      `}
                                </div>
                              `})):V`
                              <div class="empty-row-message">
                                <p>This row has no columns.</p>
                                <button
                                  class="add-module-btn"
                                  @click=${t=>{t.stopPropagation(),this._openModuleSelector(e,0)}}
                                  style="margin-top: 8px;"
                                >
                                  <ha-icon icon="mdi:plus"></ha-icon>
                                  Add Module (will create column automatically)
                                </button>
                              </div>
                            `}
                        <div class="add-column-container">
                          <button
                            class="add-column-btn"
                            @click=${t=>{t.stopPropagation(),this._addColumn(e)}}
                            title="Add Column"
                          >
                            <ha-icon icon="mdi:plus"></ha-icon>
                            Add Column
                          </button>
                        </div>
                      </div>
                    `}
              </div>
            `}))}
        </div>

        ${this._showModuleSelector?this._renderModuleSelector():""}
        ${this._showModuleSettings?this._renderModuleSettings():""}
        ${this._showLayoutChildSettings?this._renderLayoutChildSettings():""}
        ${this._showRowSettings?this._renderRowSettings():""}
        ${this._showColumnSettings?this._renderColumnSettings():""}
        ${this._showColumnLayoutSelector?this._renderColumnLayoutSelector():""}
      </div>
    `}_renderModuleSelector(){const t=Kt().getAllModules(),e=this._selectedLayoutModuleIndex>=0,o=t.filter((t=>"layout"===t.metadata.category)),i=t.filter((t=>"layout"!==t.metadata.category));return V`
      <div class="module-selector-popup">
        <div class="popup-overlay" @click=${()=>this._showModuleSelector=!1}></div>
        <div class="selector-content">
          <div class="selector-header">
            <h3>Add Module</h3>
            ${e?V`<p class="selector-subtitle">
                  Adding to layout module (only content modules allowed)
                </p>`:""}
          </div>

          <div class="selector-body">
            ${!e&&o.length>0?V`
                  <div class="module-category">
                    <h4 class="category-title">Layout Containers</h4>
                    <p class="category-description">Create containers to organize your modules</p>
                    <div class="module-types layout-modules">
                      ${o.map((t=>{const e=t.metadata,o="horizontal"===e.type,i="vertical"===e.type;return V`
                          <button
                            class="module-type-btn layout-module ${o?"horizontal-layout":""} ${i?"vertical-layout":""}"
                            @click=${()=>this._addModule(e.type)}
                            title="${e.description}"
                          >
                            <div class="layout-badge">Layout</div>
                            <ha-icon icon="${e.icon}"></ha-icon>
                            <div class="module-info">
                              <span class="module-title">${e.title}</span>
                              <span class="module-description">${e.description}</span>
                            </div>
                          </button>
                        `}))}
                    </div>
                  </div>
                `:""}
            ${i.length>0?V`
                  <div class="module-category">
                    <h4 class="category-title">Content Modules</h4>
                    <p class="category-description">Add content and interactive elements</p>
                    <div class="module-types content-modules">
                      ${i.map((t=>{const e=t.metadata;return V`
                          <button
                            class="module-type-btn content-module"
                            @click=${()=>this._addModule(e.type)}
                            title="${e.description}"
                          >
                            <ha-icon icon="${e.icon}"></ha-icon>
                            <div class="module-info">
                              <span class="module-title">${e.title}</span>
                              <span class="module-description">${e.description}</span>
                            </div>
                          </button>
                        `}))}
                    </div>
                  </div>
                `:""}
          </div>
        </div>
      </div>
    `}_formatCategoryTitle(t){return t.charAt(0).toUpperCase()+t.slice(1)}_isLayoutModule(t){return["horizontal","vertical"].includes(t)}_shouldAutoOpenSettings(t){return!this._isLayoutModule(t)}_getLayoutModuleColor(t){return this._isLayoutModule(t)?"var(--success-color, #4caf50)":"var(--accent-color, var(--orange-color, #ff9800))"}_renderColumnLayoutSelector(){const t=this._ensureLayout().rows[this._selectedRowForLayout],e=t?t.columns.length:1,o=(null==t?void 0:t.column_layout)||"1-col",i=this._migrateLegacyLayoutId(o),n=this._getLayoutsForColumnCount(e);return V`
      <div class="column-layout-selector-popup">
        <div class="popup-overlay" @click=${()=>this._showColumnLayoutSelector=!1}></div>
        <div class="selector-content">
          <div class="selector-header">
            <h3>Choose Column Layout</h3>
            <p>
              Select any layout for ${e}
              column${1!==e?"s":""} (Currently: ${e}
              column${1!==e?"s":""})
            </p>
          </div>

          <div class="layout-options">
            ${n.map((t=>V`
                <button
                  class="layout-option-btn ${t.id===o||t.id===i?"current":""}"
                  @click=${()=>this._changeColumnLayout(t.id)}
                  title="${t.name}"
                >
                  <div class="layout-visual">
                    <div class="layout-icon-large">
                      ${re(this._createColumnIconHTML(t.proportions))}
                    </div>
                  </div>
                  <div class="layout-name">${t.name}</div>
                  ${t.id===o||t.id===i?V`<div class="current-badge">Current</div>`:""}
                </button>
              `))}
          </div>
        </div>
      </div>
    `}static get styles(){return a`
      :host {
        --accent-color: var(--orange-color, #ff9800);
        --orange-color: #ff9800;
        --secondary-color: var(--orange-color, #ff9800);
      }

      /* Hide unwanted form labels with underscores and slots */
      [slot='label'] {
        display: none !important;
      }

      ha-form .mdc-form-field > label,
      ha-form .mdc-text-field > label,
      ha-form .mdc-floating-label,
      ha-form .mdc-notched-outline__leading,
      ha-form .mdc-notched-outline__notch,
      ha-form .mdc-notched-outline__trailing,
      ha-form .mdc-floating-label--float-above,
      ha-form label[for],
      ha-form .ha-form-label,
      ha-form .form-label {
        display: none !important;
      }

      /* Hide any labels containing underscores */
      ha-form label[data-label*='_'],
      ha-form .label-text:contains('_'),
      label:contains('_') {
        display: none !important;
      }

      /* Additional safeguards for underscore labels */
      ha-form .mdc-text-field-character-counter,
      ha-form .mdc-text-field-helper-text,
      ha-form mwc-formfield,
      ha-form .formfield {
        display: none !important;
      }

      .layout-builder {
        padding: 12px;
        background: var(--card-background-color);
        border-radius: 8px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      /* Mobile responsive adjustments for layout builder */
      @media (max-width: 768px) {
        .layout-builder {
          padding: 8px;
          border-radius: 4px;
        }

        .builder-header {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }

        .builder-header h3 {
          text-align: center;
          font-size: 16px;
        }

        .add-row-btn {
          width: 100%;
          justify-content: center;
          padding: 12px 16px;
          font-size: 16px;
        }

        .row-builder {
          margin-bottom: 12px;
        }

        .row-builder.collapsed {
          margin-bottom: 8px;
        }

        .row-header {
          padding: 8px 10px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .row-title {
          flex: 1;
          min-width: 0;
        }

        .row-actions {
          flex-wrap: wrap;
          gap: 6px;
        }

        .row-duplicate-btn,
        .row-add-column-btn,
        .row-settings-btn,
        .delete-row-btn,
        .row-collapse-btn {
          width: 32px;
          height: 32px;
          padding: 6px;
        }

        .column-header {
          padding: 6px 8px;
          flex-wrap: wrap;
          gap: 6px;
        }

        .column-title {
          flex: 1;
          min-width: 0;
        }

        .column-actions {
          flex-wrap: wrap;
          gap: 4px;
        }

        .column-add-module-btn,
        .column-duplicate-btn,
        .column-settings-btn,
        .column-delete-btn,
        .column-collapse-btn {
          width: 28px;
          height: 28px;
          padding: 4px;
        }

        .modules-container {
          padding: 8px;
        }

        .module-item {
          margin-bottom: 6px;
        }

        .add-module-btn,
        .add-column-btn {
          padding: 12px;
          font-size: 14px;
          min-height: 44px;
        }

        /* Better popup sizing on mobile */
        .selector-content {
          width: 95%;
          max-height: 85vh;
          padding: 16px;
        }

        .module-types {
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .module-type-btn {
          padding: 12px;
          min-height: 56px;
        }

        /* Touch-friendly collapse buttons */
        .row-collapse-btn {
          min-width: 32px;
          min-height: 32px;
          width: 32px;
          height: 32px;
        }

        .column-collapse-btn {
          min-width: 28px;
          min-height: 28px;
          width: 28px;
          height: 28px;
        }
      }

      /* Extra small screens */
      @media (max-width: 480px) {
        .layout-builder {
          padding: 4px;
        }

        .builder-header {
          margin-bottom: 8px;
          padding-bottom: 8px;
        }

        .row-builder.collapsed {
          margin-bottom: 6px;
        }

        .row-header {
          padding: 6px 8px;
        }

        .column-header {
          padding: 4px 6px;
        }

        .modules-container {
          padding: 6px;
        }

        /* Even larger touch targets for very small screens */
        .row-collapse-btn,
        .column-collapse-btn {
          min-width: 36px;
          min-height: 36px;
        }

        .selector-content {
          width: 98%;
          padding: 12px;
        }
      }

      .builder-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--divider-color);
        flex-wrap: wrap;
        gap: 8px;
        flex-shrink: 0;
      }

      .builder-header h3 {
        margin: 0;
        flex: 1;
        min-width: 120px;
        font-size: 18px;
      }

      .add-row-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        white-space: nowrap;
        font-weight: 500;
        transition: all 0.2s ease;
        min-height: 40px;
      }

      .add-row-btn:hover {
        background: var(--primary-color-dark, var(--primary-color));
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .row-builder {
        margin-bottom: 16px;
        border: 2px solid var(--primary-color);
        border-radius: 8px;
        background: var(--card-background-color);
        width: 100%;
        box-sizing: border-box;
        position: static;
        transition: all 0.2s ease;
        overflow: visible;
      }

      .row-builder:hover:not([draggable='true']) {
        border-color: var(--primary-color);
        box-shadow: 0 2px 12px rgba(var(--rgb-primary-color), 0.2);
        transform: translateY(-1px);
      }

      .row-builder:last-child {
        margin-bottom: 0;
      }

      /* Collapsed row styling - maintain spacing and visual distinction */
      .row-builder.collapsed {
        margin-bottom: 12px;
        opacity: 0.85;
        transform: scale(0.98);
        transition: all 0.2s ease;
      }

      .row-builder.collapsed:hover {
        opacity: 1;
        transform: scale(1);
      }

      .row-builder.collapsed:last-child {
        margin-bottom: 0;
      }

      .row-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        background: var(--primary-color);
        color: white;
        font-weight: 500;
        border-bottom: 2px solid var(--primary-color);
        position: static;
        z-index: 2;
      }

      .row-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .row-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        color: rgba(255, 255, 255, 0.7);
        cursor: grab;
        opacity: 0.8;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 16px;
      }

      .row-drag-handle:hover {
        opacity: 1;
      }

      .row-drag-handle:active {
        cursor: grabbing;
      }

      .row-collapse-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        --mdc-icon-size: 16px;
      }

      .row-collapse-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        transform: scale(1.1);
      }

      .layout-module-collapse-btn {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        border-radius: 4px;
        padding: 2px;
        margin-right: 8px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        --mdc-icon-size: 16px;
      }

      .layout-module-collapse-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        transform: scale(1.1);
      }

      .column-layout-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
        color: white;
        font-size: 14px;
        transition: all 0.2s ease;
        min-width: 32px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .column-layout-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
      }

      .layout-icon {
        font-family: monospace;
        font-weight: bold;
        letter-spacing: 1px;
      }

      .row-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .row-duplicate-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .row-duplicate-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .row-add-column-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .row-add-column-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .row-settings-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }

      .row-settings-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .delete-row-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .delete-row-btn:hover {
        background: rgba(255, 100, 100, 0.8);
        color: white;
      }

      .rows-container {
        flex: 1;
        min-height: 0;
        width: 100%;
        box-sizing: border-box;
      }

      .columns-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        padding: 12px;
        box-sizing: border-box;
        background: var(--card-background-color);
        transition: all 0.3s ease;
      }

      /* Full screen mode - display columns using CSS Grid to respect proportions */
      :host([isFullScreen]) .columns-container {
        display: grid !important;
        gap: 16px !important;
        align-items: flex-start !important;
        /* Grid template columns will be set dynamically via inline styles */
      }

      /* In fullscreen mode, columns should not use flex sizing */
      :host([isFullScreen]) .column-builder {
        width: 100%;
        min-width: 0;
        flex: none;
      }

      /* Full screen mode layout builder adjustments */
      :host([isFullScreen]) .layout-builder {
        max-width: none;
        width: 100%;
        padding: 0;
      }

      :host([isFullScreen]) .rows-container {
        max-width: none;
        width: 100%;
      }

      :host([isFullScreen]) .row-builder {
        max-width: none;
        width: 100%;
      }

      /* Builder header styling */
      .builder-title {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .builder-title h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .fullscreen-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
        background: var(--primary-color);
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
      }

      .fullscreen-indicator ha-icon {
        --mdc-icon-size: 14px;
      }

      /* Fullscreen header styling */
      .fullscreen-header {
        display: flex;
        justify-content: center;
        padding: 16px 0;
        margin-bottom: 16px;
      }

      .fullscreen-add-btn {
        background: var(--primary-color) !important;
        color: white !important;
        border: none !important;
        border-radius: 12px !important;
        padding: 12px 24px !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        box-shadow: 0 2px 8px rgba(var(--rgb-primary-color), 0.3) !important;
        transition: all 0.2s ease !important;
        cursor: pointer !important;
      }

      .fullscreen-add-btn:hover {
        background: var(--primary-color) !important;
        opacity: 0.9 !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 12px rgba(var(--rgb-primary-color), 0.4) !important;
      }

      .fullscreen-add-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Editor view: Force single column layout for better usability */
      .columns-container[data-layout='1-col'],
      .columns-container[data-layout='1-2-1-2'],
      .columns-container[data-layout='1-3-2-3'],
      .columns-container[data-layout='2-3-1-3'],
      .columns-container[data-layout='2-5-3-5'],
      .columns-container[data-layout='3-5-2-5'],
      .columns-container[data-layout='1-3-1-3-1-3'],
      .columns-container[data-layout='1-4-1-2-1-4'],
      .columns-container[data-layout='1-5-3-5-1-5'],
      .columns-container[data-layout='1-6-2-3-1-6'],
      .columns-container[data-layout='1-4-1-4-1-4-1-4'],
      .columns-container[data-layout='1-5-1-5-1-5-1-5'],
      .columns-container[data-layout='1-6-1-6-1-6-1-6'],
      .columns-container[data-layout='1-8-1-4-1-4-1-8'],
      .columns-container[data-layout='1-5-1-5-1-5-1-5'],
      .columns-container[data-layout='1-6-1-6-1-3-1-6-1-6'],
      .columns-container[data-layout='1-8-1-4-1-4-1-4-1-8'],
      .columns-container[data-layout='1-6-1-6-1-6-1-6-1-6-1-6'],
      /* Legacy support */
      .columns-container[data-layout='50-50'],
      .columns-container[data-layout='30-70'],
      .columns-container[data-layout='70-30'],
      .columns-container[data-layout='33-33-33'],
      .columns-container[data-layout='25-50-25'],
      .columns-container[data-layout='20-60-20'],
      .columns-container[data-layout='25-25-25-25'] {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
      }

      /* Full screen mode overrides - use grid layout for all data-layout types */
      :host([isFullScreen]) .columns-container[data-layout='1-col'],
      :host([isFullScreen]) .columns-container[data-layout='1-2-1-2'],
      :host([isFullScreen]) .columns-container[data-layout='1-3-2-3'],
      :host([isFullScreen]) .columns-container[data-layout='2-3-1-3'],
      :host([isFullScreen]) .columns-container[data-layout='2-5-3-5'],
      :host([isFullScreen]) .columns-container[data-layout='3-5-2-5'],
      :host([isFullScreen]) .columns-container[data-layout='1-3-1-3-1-3'],
      :host([isFullScreen]) .columns-container[data-layout='1-4-1-2-1-4'],
      :host([isFullScreen]) .columns-container[data-layout='1-5-3-5-1-5'],
      :host([isFullScreen]) .columns-container[data-layout='1-6-2-3-1-6'],
      :host([isFullScreen]) .columns-container[data-layout='1-4-1-4-1-4-1-4'],
      :host([isFullScreen]) .columns-container[data-layout='1-5-1-5-1-5-1-5'],
      :host([isFullScreen]) .columns-container[data-layout='1-6-1-6-1-6-1-6'],
      :host([isFullScreen]) .columns-container[data-layout='1-8-1-4-1-4-1-8'],
      :host([isFullScreen]) .columns-container[data-layout='1-5-1-5-1-5-1-5'],
      :host([isFullScreen]) .columns-container[data-layout='1-6-1-6-1-3-1-6-1-6'],
      :host([isFullScreen]) .columns-container[data-layout='1-8-1-4-1-4-1-4-1-8'],
      :host([isFullScreen]) .columns-container[data-layout='1-6-1-6-1-6-1-6-1-6-1-6'],
      /* Legacy support */
      :host([isFullScreen]) .columns-container[data-layout='50-50'],
      :host([isFullScreen]) .columns-container[data-layout='30-70'],
      :host([isFullScreen]) .columns-container[data-layout='70-30'],
      :host([isFullScreen]) .columns-container[data-layout='33-33-33'],
      :host([isFullScreen]) .columns-container[data-layout='25-50-25'],
      :host([isFullScreen]) .columns-container[data-layout='20-60-20'],
      :host([isFullScreen]) .columns-container[data-layout='25-25-25-25'] {
        display: grid !important;
        gap: 16px !important;
        align-items: flex-start !important;
        margin-bottom: 16px;
        /* Grid template columns set via inline styles */
      }

      .column-builder {
        border: 2px solid var(--accent-color, var(--orange-color, #ff9800));
        border-radius: 8px;
        background: var(--card-background-color);
        width: 100%;
        box-sizing: border-box;
        overflow: visible;
        position: static;
        transition: all 0.2s ease;
      }

      .column-builder:hover:not([draggable='true']) {
        border-color: var(--accent-color, var(--orange-color, #ff9800));
        box-shadow: 0 2px 12px rgba(255, 152, 0, 0.2);
        transform: translateY(-1px);
      }

      .column-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        padding: 8px 12px;
        background: var(--accent-color, var(--orange-color, #ff9800));
        color: white;
        border-bottom: 2px solid var(--accent-color, var(--orange-color, #ff9800));
        position: static;
        z-index: 2;
        border-radius: 6px 6px 0px 0px;
      }

      /* When column is collapsed, round the bottom corners of the header */
      .column-builder.collapsed .column-header {
        border-radius: 6px;
        border-bottom: none;
      }

      /* Collapsed column styling - match row behavior */
      .column-builder.collapsed {
        opacity: 0.85;
        transform: scale(0.98);
        transition: all 0.2s ease;
      }

      .column-builder.collapsed:hover {
        opacity: 1;
        transform: scale(1);
      }

      .column-actions {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .column-add-module-btn,
      .column-duplicate-btn,
      .column-settings-btn,
      .column-delete-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        padding: 6px 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
        font-size: 12px;
        min-width: 28px;
        min-height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .column-add-module-btn:hover,
      .column-duplicate-btn:hover,
      .column-settings-btn:hover {
        background: rgba(255, 255, 255, 0.25);
        color: white;
        transform: scale(1.05);
      }

      .column-delete-btn:hover:not([disabled]) {
        background: rgba(255, 100, 100, 0.9);
        color: white;
        transform: scale(1.05);
      }

      .column-delete-btn[disabled] {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
      }

      .column-delete-btn[disabled]:hover {
        background: none;
        transform: none;
      }

      .column-actions ha-icon {
        --mdc-icon-size: 16px;
      }

      .column-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .column-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        color: rgba(255, 255, 255, 0.7);
        cursor: grab;
        opacity: 0.8;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 14px;
      }

      .column-drag-handle:hover {
        opacity: 1;
      }

      .column-drag-handle:active {
        cursor: grabbing;
      }

      .column-collapse-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        --mdc-icon-size: 14px;
      }

      .column-collapse-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        transform: scale(1.1);
      }

      .modules-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
        box-sizing: border-box;
        padding: 12px;
        background: var(--card-background-color);
        border: 1px solid var(--secondary-color, var(--accent-color, #ff9800));
        border-top: none;
        border-radius: 0px 0px 6px 6px;
        margin-top: 0;
        position: static;
        overflow: visible;
      }

      .module-item {
        position: relative;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        margin-bottom: 8px;
        width: 100%;
        min-height: 60px;
        transition: border-color 0.2s ease;
        box-sizing: border-box;
        overflow: visible;
      }

      .module-item:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 12px rgba(var(--rgb-primary-color), 0.2);
        transform: translateY(-1px);
      }

      .module-content {
        padding: 8px;
        cursor: pointer;
        width: 100%;
        box-sizing: border-box;
        overflow: hidden;
        word-wrap: break-word;
        word-break: break-word;
        pointer-events: auto;
        position: relative;
        z-index: 1;

        /* Ensure content doesn't interfere with hover actions positioning */
        contain: layout style;
      }

      /* Simplified Module Styles */
      .simplified-module {
        padding: 12px;
        border-radius: 6px;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #e0e0e0);
        width: 100%;
        box-sizing: border-box;
        transition: all 0.2s ease;
      }

      .simplified-module-header {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
      }

      .simplified-module-drag-handle {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color, #757575);
        cursor: grab;
        opacity: 0.6;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 16px;
      }

      .simplified-module:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 12px rgba(var(--rgb-primary-color), 0.2);
        transform: translateY(-1px);
      }

      .simplified-module:hover .simplified-module-drag-handle {
        opacity: 1;
      }

      .simplified-module-drag-handle:active {
        cursor: grabbing;
      }

      .simplified-module-icon {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color, #2196f3);
        color: white;
        border-radius: 6px;
        --mdc-icon-size: 20px;
      }

      .simplified-module-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .simplified-module-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color, #212121);
        line-height: 1.3;
        margin: 0;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      .simplified-module-info {
        font-size: 12px;
        color: var(--secondary-text-color, #757575);
        line-height: 1.2;
        margin: 0;
        opacity: 0.8;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      .simplified-module-actions {
        display: flex;
        gap: 4px;
        align-items: center;
        flex-shrink: 0;
      }

      .simplified-action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
      }

      .simplified-action-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .simplified-action-btn.edit-btn {
        color: var(--primary-color, #2196f3);
        border-color: var(--primary-color, #2196f3);
      }

      .simplified-action-btn.edit-btn:hover {
        background: var(--primary-color, #2196f3);
        color: white;
      }

      .simplified-action-btn.duplicate-btn {
        color: var(--info-color, #2196f3);
        border-color: var(--info-color, #2196f3);
      }

      .simplified-action-btn.duplicate-btn:hover {
        background: var(--info-color, #2196f3);
        color: white;
      }

      .simplified-action-btn.delete-btn {
        color: var(--error-color, #f44336);
        border-color: var(--error-color, #f44336);
      }

      .simplified-action-btn.delete-btn:hover {
        background: var(--error-color, #f44336);
        color: white;
      }

      .simplified-action-btn ha-icon {
        --mdc-icon-size: 14px;
      }

      /* Disable animations within layout builder modules */
      .module-content * {
        max-width: 100%;
        box-sizing: border-box;
        animation: none !important;
        transition: none !important;
      }

      .module-content *:hover {
        transform: none !important;
        animation: none !important;
        transition: none !important;
      }

      .module-content img {
        max-width: 100%;
        height: auto;
        display: block;
      }

      .add-module-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px;
        border: 2px dashed var(--divider-color);
        border-radius: 4px;
        background: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        width: 100%;
        box-sizing: border-box;
        font-size: 13px;
        min-height: 36px;
      }

      .add-module-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .add-column-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px 12px 12px 12px;
        width: 100%;
        box-sizing: border-box;
      }

      .add-column-btn {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px 12px;
        border: 2px dashed var(--secondary-text-color);
        border-radius: 6px;
        background: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 13px;
        width: 100%;
        min-height: 40px;
        box-sizing: border-box;
      }

      .add-column-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: var(--primary-color-light, rgba(33, 150, 243, 0.05));
      }

      .add-column-btn ha-icon {
        --mdc-icon-size: 20px;
      }

      /* Empty Row Message */
      .empty-row-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 16px;
        border: 2px dashed var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        text-align: center;
        min-height: 120px;
      }

      .empty-row-message p {
        margin: 0 0 8px 0;
        font-size: 14px;
        opacity: 0.8;
      }

      /* Module Selector Popup */
      .module-selector-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .popup-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
      }

      .selector-content {
        position: relative;
        background: var(--card-background-color);
        border-radius: 12px;
        width: 90%;
        max-width: 800px;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      }

      /* Sticky Header */
      .selector-header {
        position: sticky;
        top: 0;
        z-index: 10;
        background: #1e88e5;
        color: white;
        padding: 20px 24px;
        border-radius: 12px 12px 0 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .selector-header h3 {
        margin: 0 0 4px 0;
        font-size: 20px;
        font-weight: 600;
        color: white;
      }

      .selector-subtitle {
        margin: 0;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.4;
      }

      /* Scrollable Body */
      .selector-body {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
      }

      .module-category {
        margin-bottom: 32px;
      }

      .category-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: var(--primary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .category-description {
        font-size: 14px;
        color: var(--secondary-text-color);
        margin: 0 0 16px 0;
        line-height: 1.4;
      }

      .module-types {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 16px;
      }

      .module-type-btn {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        width: 100%;
        min-height: 70px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .module-type-btn:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      /* Ensure text elements are white on hover */
      .module-type-btn:hover .module-title,
      .module-type-btn:hover .module-description {
        color: white !important;
      }

      .module-type-btn ha-icon {
        font-size: 32px;
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        color: white;
        border-radius: 8px;
      }

      .module-type-btn:hover ha-icon {
        background: white;
        color: var(--primary-color);
      }

      .module-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
        flex: 1;
      }

      .module-title {
        font-weight: 500;
        font-size: 16px;
        color: var(--primary-text-color);
      }

      .module-description {
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 1.3;
      }

      .module-author,
      .module-version {
        display: none; /* Hide for cleaner look */
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        .selector-content {
          width: 95%;
          max-width: 480px;
          max-height: 90vh;
        }

        .selector-header {
          padding: 16px 20px;
        }

        .selector-header h3 {
          font-size: 18px;
        }

        .selector-body {
          padding: 20px;
        }

        .module-types {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .module-type-btn {
          min-height: 60px;
          padding: 14px;
        }

        .module-type-btn ha-icon {
          width: 40px;
          height: 40px;
          font-size: 24px;
        }

        .module-title {
          font-size: 15px;
        }

        .module-description {
          font-size: 13px;
        }

        .category-title {
          font-size: 15px;
        }
      }

      /* Layout Module Specific Styles */
      .layout-modules .module-type-btn.layout-module {
        position: relative;
        border: 2px solid var(--success-color, #4caf50);
        background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.1));
      }

      .layout-modules .module-type-btn.horizontal-layout {
        border-color: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.vertical-layout {
        border-color: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.layout-module:hover {
        border-color: var(--success-color, #4caf50);
        background: var(--success-color, #4caf50);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      }

      .layout-modules .module-type-btn.horizontal-layout:hover {
        border-color: var(--success-color, #4caf50);
        background: var(--success-color, #4caf50);
        color: white;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      }

      .layout-modules .module-type-btn.vertical-layout:hover {
        border-color: var(--success-color, #4caf50);
        background: var(--success-color, #4caf50);
        color: white;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      }

      /* Ensure layout module text is white on hover */
      .layout-modules .module-type-btn.layout-module:hover .module-title,
      .layout-modules .module-type-btn.layout-module:hover .module-description,
      .layout-modules .module-type-btn.horizontal-layout:hover .module-title,
      .layout-modules .module-type-btn.horizontal-layout:hover .module-description,
      .layout-modules .module-type-btn.vertical-layout:hover .module-title,
      .layout-modules .module-type-btn.vertical-layout:hover .module-description {
        color: white !important;
      }

      .layout-modules .module-type-btn.layout-module ha-icon {
        background: var(--success-color, #4caf50);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.2);
      }

      .layout-modules .module-type-btn.horizontal-layout ha-icon {
        background: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.vertical-layout ha-icon {
        background: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.layout-module:hover ha-icon {
        background: white;
        color: var(--success-color, #4caf50);
        border-color: rgba(0, 0, 0, 0.1);
      }

      .layout-modules .module-type-btn.horizontal-layout:hover ha-icon {
        color: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.vertical-layout:hover ha-icon {
        color: var(--success-color, #4caf50);
      }

      .layout-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        background: var(--success-color, #4caf50);
        color: white;
        font-size: 9px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.9;
      }

      .layout-modules .module-type-btn.horizontal-layout .layout-badge {
        background: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.vertical-layout .layout-badge {
        background: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.layout-module:hover .layout-badge {
        background: rgba(255, 255, 255, 0.2);
        opacity: 1;
      }

      /* Content Module Styles */
      .content-modules .module-type-btn.content-module {
        border: 1px solid var(--divider-color);
      }

      .content-modules .module-type-btn.content-module:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
      }

      /* Ensure content module text is white on hover */
      .content-modules .module-type-btn.content-module:hover .module-title,
      .content-modules .module-type-btn.content-module:hover .module-description {
        color: white !important;
      }

      /* Column Layout Selector Popup */
      .column-layout-selector-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1001;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .layout-options {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-top: 16px;
      }

      .layout-option-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px 12px;
        border: 2px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
        min-height: 80px;
        gap: 8px;
      }

      .layout-option-btn:hover {
        border-color: var(--primary-color);
        background: var(--primary-color-light, rgba(33, 150, 243, 0.1));
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .layout-option-btn.current {
        border-color: var(--primary-color);
        background: var(--primary-color-light, rgba(33, 150, 243, 0.1));
        position: relative;
      }

      .layout-option-btn.current .layout-icon-large {
        color: var(--primary-color);
      }

      .current-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        background: var(--primary-color);
        color: white;
        font-size: 8px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .layout-visual {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 32px;
      }

      .layout-icon-large {
        font-family: monospace;
        font-weight: bold;
        font-size: 20px;
        letter-spacing: 2px;
        color: var(--primary-color);
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .layout-name {
        font-size: 12px;
        font-weight: 500;
        color: var(--primary-text-color);
        line-height: 1.2;
      }

      .module-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 16px;
        border: 1px dashed var(--divider-color);
        border-radius: 4px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: var(--error-color);
        color: white;
        border-radius: 4px;
        font-size: 14px;
      }

      /* General Settings Popup Styles */
      .settings-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1002;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 20px;
        overflow-y: auto;
      }

      .settings-tabs {
        display: flex;
        border-bottom: 1px solid var(--divider-color);
      }

      .settings-tab {
        flex: 1;
        padding: 12px 16px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 14px;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
      }

      .settings-tab:hover {
        color: var(--primary-color);
      }

      .settings-tab.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .settings-tab-content {
        padding: 24px;
        max-height: 400px;
        overflow-y: auto;
      }

      /* Module Settings Popup */
      .module-settings-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1001;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 20px;
        overflow-y: auto;
      }

      .popup-content {
        position: relative;
        background: var(--card-background-color);
        border-radius: 8px;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
      }

      .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid var(--divider-color);
      }

      .close-button {
        background: none;
        border: none;
        font-size: 32px;
        cursor: pointer;
        color: var(--secondary-text-color);
        padding: 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }

      .close-button:hover {
        color: var(--primary-color);
      }

      .action-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .action-button ha-icon {
        --mdc-icon-size: 20px;
      }

      .duplicate-button {
        color: var(--primary-color);
      }

      .duplicate-button:hover {
        background: var(--primary-color);
        color: white;
      }

      .delete-button {
        color: var(--error-color);
      }

      .delete-button:hover {
        background: var(--error-color);
        color: white;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* Module Preview */
      .module-preview {
        margin: 16px 24px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
      }

      .preview-header {
        padding: 12px 16px;
        background: var(--secondary-background-color);
        font-weight: 500;
        font-size: 14px;
      }

      .preview-content {
        padding: 16px;
        min-height: 60px;
        display: block;
      }

      /* Module Tabs */
      .module-tabs {
        display: flex;
        border-bottom: 1px solid var(--divider-color);
      }

      .module-tab {
        flex: 1;
        padding: 12px 16px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 14px;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
      }

      .module-tab:hover {
        color: var(--primary-color);
      }

      .module-tab.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .module-tab-content {
        padding: 24px;
        max-height: 400px;
        overflow-y: auto;
        width: 100%;
        box-sizing: border-box;
        overflow-x: hidden;
      }

      /* Design Subtabs */
      .design-subtabs {
        display: flex;
        margin-bottom: 16px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        overflow: hidden;
      }

      .design-subtab {
        flex: 1;
        padding: 8px 12px;
        background: var(--secondary-background-color);
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .design-subtab:hover {
        color: var(--primary-color);
      }

      .design-subtab.active {
        background: var(--primary-color);
        color: white;
      }

      /* Settings Sections */
      .settings-section {
        margin-bottom: 20px;
        width: 100%;
        box-sizing: border-box;
      }

      .settings-section label {
        display: block;
        font-weight: 500;
        margin-bottom: 8px;
        font-size: 14px;
        color: var(--primary-text-color);
        width: 100%;
        box-sizing: border-box;
      }

      /* Color Section Styling */
      .color-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .color-picker-wrapper {
        display: flex;
        align-items: center;
      }

      .color-picker-wrapper ultra-color-picker {
        width: 100%;
        max-width: 300px;
      }

      /* Font Dropdown Styling */
      .font-dropdown {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-family: inherit;
      }

      .font-dropdown:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .font-dropdown optgroup {
        font-weight: 600;
        color: var(--secondary-text-color);
        background: var(--card-background-color);
        padding: 4px 0;
      }

      .font-dropdown option {
        padding: 4px 8px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      /* Font Size Input Styling */
      .font-size-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .font-size-input:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      /* Enhanced Alignment Buttons */
      .alignment-buttons {
        display: flex;
        gap: 6px;
        margin-top: 4px;
      }

      .alignment-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: 0;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .alignment-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .alignment-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .alignment-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      .settings-section input,
      .settings-section select,
      .settings-section textarea {
        width: 100%;
        max-width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
      }

      .settings-section textarea {
        min-height: 60px;
        resize: vertical;
      }

      /* Ensure form elements fit properly */
      .settings-section ha-form {
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      /* Ensure color pickers fit properly */
      .settings-section ultra-color-picker {
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      /* Consistent styling for all module settings */
      .module-tab-content .settings-section,
      .settings-tab-content .settings-section {
        border-radius: 8px;
        padding: 16px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        margin-bottom: 16px;
      }

      .module-tab-content .settings-section:last-child,
      .settings-tab-content .settings-section:last-child {
        margin-bottom: 0;
      }

      /* Enhanced input field styling for consistency */
      .module-tab-content input[type='number'],
      .module-tab-content input[type='text'],
      .module-tab-content input[type='color'],
      .module-tab-content select,
      .module-tab-content textarea,
      .settings-tab-content input[type='number'],
      .settings-tab-content input[type='text'],
      .settings-tab-content input[type='color'],
      .settings-tab-content select,
      .settings-tab-content textarea {
        width: 100%;
        max-width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-family: inherit;
        box-sizing: border-box;
        transition: border-color 0.2s ease;
      }

      .module-tab-content input:focus,
      .module-tab-content select:focus,
      .module-tab-content textarea:focus,
      .settings-tab-content input:focus,
      .settings-tab-content select:focus,
      .settings-tab-content textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      /* Range sliders consistent styling */
      .module-tab-content input[type='range'],
      .settings-tab-content input[type='range'] {
        width: 100%;
        height: 6px;
        border-radius: 3px;
        background: var(--divider-color);
        outline: none;
        -webkit-appearance: none;
      }

      .module-tab-content input[type='range']::-webkit-slider-thumb,
      .settings-tab-content input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
      }

      /* Checkbox and radio button styling */
      .module-tab-content input[type='checkbox'],
      .module-tab-content input[type='radio'],
      .settings-tab-content input[type='checkbox'],
      .settings-tab-content input[type='radio'] {
        width: auto;
        margin-right: 8px;
        accent-color: var(--primary-color);
      }

      /* Label styling for form elements */
      .module-tab-content label,
      .settings-tab-content label {
        display: block;
        font-weight: 500;
        margin-bottom: 8px;
        font-size: 14px;
        color: var(--primary-text-color);
        line-height: 1.4;
      }

      /* Field groups */
      .module-tab-content .field-group,
      .settings-tab-content .field-group {
        gap: 12px;
        align-items: flex-end;
      }

      .module-tab-content .field-group > div,
      .settings-tab-content .field-group > div {
        flex: 1;
      }

      /* Button Groups */
      .alignment-buttons,
      .format-buttons {
        display: flex;
        gap: 4px;
      }

      .alignment-btn,
      .format-btn {
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .alignment-btn:hover,
      .format-btn:hover {
        border-color: var(--primary-color);
      }

      .alignment-btn.active,
      .format-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      /* Value Position Buttons for Bar Module */
      .value-position-buttons {
        display: flex;
        gap: 8px;
      }

      .position-btn {
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .position-btn:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .position-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      /* Spacing Grid */
      .spacing-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }

      .spacing-section h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 500;
      }

      .spacing-cross {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
        align-items: center;
        max-width: 120px;
        margin: 0 auto;
      }

      .spacing-row {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 8px;
        align-items: center;
      }

      .spacing-center {
        width: 32px;
        height: 32px;
        background: var(--primary-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-weight: bold;
        font-size: 12px;
      }

      .spacing-cross input {
        width: 60px;
        text-align: center;
        padding: 4px 8px;
        font-size: 12px;
      }

      /* Module Rendering */
      .text-module {
        word-wrap: break-word;
      }

      .separator-module {
        width: 100%;
      }

      .image-module {
        text-align: center;
      }

      .image-placeholder {
        padding: 20px;
        border: 2px dashed var(--divider-color);
        border-radius: 4px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .module-placeholder {
        padding: 20px;
        text-align: center;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      /* Logic Tab Styles */
      .logic-tab-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 16px;
      }

      .logic-section {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
      }

      .section-header h3 {
        margin: 0 0 16px 0;
        color: var(--primary-text-color);
        font-size: 18px;
        font-weight: 600;
      }

      .display-mode-dropdown {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        min-height: 48px;
      }

      /* Conditions Section */
      .conditions-section {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
      }

      .conditions-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .conditions-header h4 {
        margin: 0;
        color: var(--primary-text-color);
        font-size: 16px;
        font-weight: 600;
      }

      .add-condition-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .add-condition-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      .add-condition-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      .conditions-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .no-conditions {
        text-align: center;
        padding: 32px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      /* Individual Condition Item */
      .condition-item {
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 0;
        transition: all 0.2s ease;
      }

      .condition-item.disabled {
        opacity: 0.6;
      }

      .condition-item:hover {
        border-color: var(--primary-color);
      }

      .condition-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: var(--card-background-color);
        border-radius: 8px 8px 0 0;
        border-bottom: 1px solid var(--divider-color);
      }

      .condition-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .condition-toggle {
        background: none;
        border: none;
        color: var(--primary-text-color);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background 0.2s ease;
      }

      .condition-toggle:hover {
        background: var(--secondary-background-color);
      }

      .condition-toggle ha-icon {
        --mdc-icon-size: 18px;
        transition: transform 0.2s ease;
      }

      .condition-toggle.expanded ha-icon {
        transform: rotate(0deg);
      }

      .condition-label {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .condition-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .condition-action-btn {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 6px;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .condition-action-btn:hover {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .condition-action-btn.delete:hover {
        background: var(--error-color);
        color: white;
      }

      .condition-action-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      .condition-drag-handle {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: grab;
        padding: 6px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .condition-drag-handle:hover {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .condition-drag-handle:active {
        cursor: grabbing;
      }

      /* Condition Content */
      .condition-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .condition-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .condition-field label {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .condition-field select,
      .condition-field input,
      .condition-field textarea {
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        transition: border-color 0.2s ease;
      }

      .condition-field select:focus,
      .condition-field input:focus,
      .condition-field textarea:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .condition-enable-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: normal !important;
        cursor: pointer;
      }

      /* Condition Type Specific Styles */
      .entity-condition-fields,
      .time-condition-fields,
      .custom-field-condition,
      .template-condition {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .time-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .condition-info {
        margin: 0;
        padding: 8px 12px;
        background: var(--info-color, #2196f3);
        color: white;
        border-radius: 6px;
        font-size: 12px;
        text-align: center;
      }

      .template-help {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-style: italic;
        margin-top: 4px;
      }

      /* Template Section */
      .template-section {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
      }

      .template-header {
        margin-bottom: 16px;
      }

      .template-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: var(--primary-text-color);
        cursor: pointer;
      }

      .template-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .template-editor {
        min-height: 120px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
        resize: vertical;
      }

      @media (max-width: 768px) {
        .columns-container {
          flex-direction: column;
        }

        .column-builder {
          border-right: none;
          border-bottom: 1px solid var(--divider-color);
        }

        .column-builder:last-child {
          border-bottom: none;
        }

        .module-types {
          grid-template-columns: repeat(2, 1fr);
        }

        .spacing-grid {
          grid-template-columns: 1fr;
        }

        .time-inputs {
          grid-template-columns: 1fr;
        }
      }

      /* Logic Module Dimming */
      .module-with-logic {
        position: relative;
      }

      .module-with-logic.logic-hidden {
        opacity: 0.4;
        filter: grayscale(50%);
      }

      .logic-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: 500;
        border-radius: 4px;
        pointer-events: none;
        z-index: 10;
      }

      .logic-overlay ha-icon {
        --mdc-icon-size: 20px;
        margin-bottom: 4px;
      }

      .logic-overlay span {
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      }

      /* Toggle Switch Styles */
      .switch-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
      }

      .switch-label {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 16px;
      }

      .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }

      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--switch-unchecked-color, #ccc);
        transition: 0.3s;
        border-radius: 24px;
      }

      .slider:before {
        position: absolute;
        content: '';
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      input:checked + .slider {
        background-color: var(--primary-color);
      }

      input:focus + .slider {
        box-shadow: 0 0 1px var(--primary-color);
      }

      input:checked + .slider:before {
        transform: translateX(26px);
      }

      .slider.round {
        border-radius: 24px;
      }

      .slider.round:before {
        border-radius: 50%;
      }

      /* Disabled state for conditions */
      .disabled-note {
        font-size: 12px;
        color: var(--warning-color, #ff9800);
        font-style: italic;
        font-weight: normal;
      }

      .template-description {
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 1.4;
        margin-top: 4px;
      }

      /* Animation keyframes and classes for preview windows */
      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      @keyframes vibrate {
        0%,
        100% {
          transform: translateX(0);
        }
        10%,
        30%,
        50%,
        70%,
        90% {
          transform: translateX(-2px);
        }
        20%,
        40%,
        60%,
        80% {
          transform: translateX(2px);
        }
      }

      @keyframes rotate-left {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(-360deg);
        }
      }

      @keyframes rotate-right {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes hover {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      @keyframes fade {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      @keyframes scale {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }

      @keyframes bounce {
        0%,
        20%,
        50%,
        80%,
        100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-10px);
        }
        60% {
          transform: translateY(-5px);
        }
      }

      @keyframes shake {
        0%,
        100% {
          transform: translateX(0);
        }
        10%,
        30%,
        50%,
        70%,
        90% {
          transform: translateX(-5px);
        }
        20%,
        40%,
        60%,
        80% {
          transform: translateX(5px);
        }
      }

      @keyframes tada {
        0% {
          transform: scale(1);
        }
        10%,
        20% {
          transform: scale(0.9) rotate(-3deg);
        }
        30%,
        50%,
        70%,
        90% {
          transform: scale(1.1) rotate(3deg);
        }
        40%,
        60%,
        80% {
          transform: scale(1.1) rotate(-3deg);
        }
        100% {
          transform: scale(1) rotate(0);
        }
      }

      .animation-pulse {
        animation-name: pulse;
        animation-iteration-count: infinite;
      }

      .animation-vibrate {
        animation-name: vibrate;
        animation-iteration-count: infinite;
      }

      .animation-rotate-left {
        animation-name: rotate-left;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }

      .animation-rotate-right {
        animation-name: rotate-right;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }

      .animation-hover {
        animation-name: hover;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }

      .animation-fade {
        animation-name: fade;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }

      .animation-scale {
        animation-name: scale;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }

      .animation-bounce {
        animation-name: bounce;
        animation-iteration-count: infinite;
      }

      .animation-shake {
        animation-name: shake;
        animation-timing-function: cubic-bezier(0.36, 0.07, 0.19, 0.97);
        animation-iteration-count: infinite;
      }

      .animation-tada {
        animation-name: tada;
        animation-iteration-count: infinite;
      }

      /* Row and Column Preview Styles */
      .row-preview-content {
        display: flex;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        min-height: 60px;
        align-items: center;
        justify-content: space-around;
      }

      .column-preview {
        flex: 1;
        padding: 12px;
        margin: 0 4px;
        background: var(--accent-color);
        color: white;
        border-radius: 4px;
        text-align: center;
        font-size: 14px;
        font-weight: 500;
      }

      .column-preview-content {
        padding: 16px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        text-align: center;
        background: var(--secondary-background-color);
        min-height: 60px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .column-preview-content p {
        margin: 0 0 8px 0;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .module-count {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      /* Drag and Drop Styles */
      .row-builder[draggable='true'],
      .column-builder[draggable='true'],
      .module-item[draggable='true'] {
        cursor: grab;
      }

      .row-builder[draggable='true']:hover {
        cursor: grab;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--rgb-primary-color), 0.2);
        border-color: var(--primary-color);
      }

      .column-builder[draggable='true']:hover {
        cursor: grab;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
        border-color: var(--accent-color, var(--orange-color, #ff9800));
      }

      .module-item[draggable='true']:hover {
        cursor: grab;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--rgb-primary-color), 0.2);
        border-color: var(--primary-color);
      }

      .row-builder[draggable='true']:active,
      .column-builder[draggable='true']:active,
      .module-item[draggable='true']:active {
        cursor: grabbing;
        transform: scale(0.98);
      }

      /* Invalid drop target indication */
      :host([dragging-column]) .module-item,
      :host([dragging-row]) .module-item,
      :host([dragging-row]) .column-builder {
        cursor: not-allowed !important;
        opacity: 0.5;
        pointer-events: auto;
      }

      .drop-target {
        box-shadow: 0 0 20px rgba(var(--rgb-primary-color), 0.6) !important;
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        transform: scale(1.02) !important;
        transition: all 0.2s ease !important;
      }

      .drop-target.row-builder {
        border-color: var(--primary-color) !important;
        border-width: 3px !important;
        border-style: dashed !important;
      }

      .drop-target.column-builder {
        border-color: var(--primary-color) !important;
        border-width: 3px !important;
        border-style: dashed !important;
      }

      .drop-target.module-item {
        border-color: var(--primary-color) !important;
        border-width: 2px !important;
        border-style: dashed !important;
      }

      /* Removed duplicate drag handle indicators - using proper HTML drag handles instead */

      /* Module item hover effect - consolidated with action display */
      .module-item:hover {
        border-color: var(--primary-color) !important;
      }

      /* Visual feedback during drag */
      .row-builder[draggable='true'][style*='opacity: 0.5'] {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        border: 2px dashed var(--primary-color) !important;
      }

      .column-builder[draggable='true'][style*='opacity: 0.5'] {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        border: 2px dashed var(--primary-color) !important;
      }

      .module-item[draggable='true'][style*='opacity: 0.5'] {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        border: 2px dashed var(--primary-color) !important;
      }

      /* Enhanced modules container styling */
      .modules-container {
        min-height: 80px;
        position: relative;
        transition: all 0.2s ease;
      }

      /* Name Field Styling */
      .module-name-input,
      .row-name-input,
      .column-name-input {
        width: 100%;
        max-width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-family: inherit;
        box-sizing: border-box;
      }

      .module-name-input:focus,
      .row-name-input:focus,
      .column-name-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      .field-help {
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.4;
        margin-top: 4px;
        font-style: italic;
      }

      /* Note: Image module still shows "Image Name" field from the registry.
         This will need to be addressed in the image module itself to remove
         the duplicate field since we now have universal "Module Name" above. */

      .modules-container:empty {
        border: 2px dashed var(--divider-color);
        background: var(--secondary-background-color);
      }

      .modules-container:empty::before {
        content: 'Drop modules here or click Add Module';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--secondary-text-color);
        font-style: italic;
        font-size: 13px;
        pointer-events: none;
        text-align: center;
      }

      .modules-container::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px dashed transparent;
        border-radius: 6px;
        pointer-events: none;
        transition: all 0.2s ease;
        z-index: 1;
      }

      .column-builder.drop-target .modules-container::after {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.1);
      }

      /* Layout Module Styles - Column-like appearance */
      .layout-module-container {
        border: 2px solid var(--success-color, #4caf50);
        border-radius: 6px;
        background: var(--card-background-color);
        width: 100%;
        box-sizing: border-box;
        overflow: visible;
        margin-bottom: 8px;
      }

      .layout-module-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        padding: 8px 12px;
        background: var(--success-color, #4caf50);
        color: white;
        border-bottom: 2px solid var(--success-color, #4caf50);
        border-radius: 0px;
      }

      .layout-module-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .layout-module-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        color: rgba(255, 255, 255, 0.7);
        cursor: grab;
        opacity: 0.8;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 14px;
      }

      .layout-module-drag-handle:hover {
        opacity: 1;
      }

      .layout-module-drag-handle:active {
        cursor: grabbing;
      }

      .layout-module-actions {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .layout-module-add-btn,
      .layout-module-settings-btn,
      .layout-module-duplicate-btn,
      .layout-module-delete-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        --mdc-icon-size: 16px;
      }

      .layout-module-add-btn:hover,
      .layout-module-settings-btn:hover,
      .layout-module-duplicate-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .layout-module-delete-btn:hover {
        background: rgba(255, 100, 100, 0.8);
        color: white;
      }

      .layout-modules-container {
        background: var(--card-background-color);
        border: 2px dashed var(--divider-color);
        border-radius: 4px;
        margin: 8px;
        transition: all 0.2s ease;
        position: relative;
      }

      .layout-modules-container:hover {
        border-color: var(--success-color, #4caf50);
        background: rgba(76, 175, 80, 0.05);
      }

      .layout-modules-container.layout-drop-target {
        border-color: var(--primary-color) !important;
        border-width: 3px !important;
        border-style: dashed !important;
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        box-shadow: 0 0 20px rgba(var(--rgb-primary-color), 0.3) !important;
      }

      .layout-module-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--secondary-text-color);
        font-style: italic;
        text-align: center;
        padding: 24px;
        width: 100%;
      }

      .layout-module-empty ha-icon {
        --mdc-icon-size: 32px;
        opacity: 0.7;
      }

      .layout-child-module-wrapper {
        width: 100%;
        box-sizing: border-box;
        cursor: grab;
      }

      .layout-child-module-wrapper:active {
        cursor: grabbing;
      }

      /* Simplified layout child module styling */
      .layout-child-simplified-module {
        width: 100%;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        transition: all 0.2s ease;
        cursor: pointer;
        box-sizing: border-box;
        margin-bottom: 8px;
      }

      .layout-child-simplified-module:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 12px rgba(var(--rgb-primary-color), 0.2);
        transform: translateY(-1px);
      }

      .layout-child-simplified-module:hover .layout-child-content {
        color: var(--primary-text-color);
      }

      .layout-child-simplified-module:active {
        cursor: grabbing;
        transform: scale(0.98);
      }

      .layout-child-module-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        min-height: 40px;
        box-sizing: border-box;
      }

      .layout-child-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
        flex-shrink: 0;
      }

      .layout-child-content {
        flex: 1;
        min-width: 0;
      }

      .layout-child-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 2px;
      }

      .layout-child-info {
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .layout-child-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        color: var(--secondary-text-color);
        cursor: grab;
        opacity: 0.6;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 14px;
      }

      .layout-child-drag-handle:hover {
        opacity: 1;
        color: var(--primary-color);
      }

      .layout-child-drag-handle:active {
        cursor: grabbing;
      }

      .layout-child-actions {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .layout-child-action-btn {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        --mdc-icon-size: 14px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .layout-child-action-btn.edit-btn:hover {
        background: var(--primary-color);
        color: white;
      }

      .layout-child-action-btn.duplicate-btn:hover {
        background: var(--info-color, #2196f3);
        color: white;
      }

      .layout-child-action-btn.delete-btn:hover {
        background: var(--error-color);
        color: white;
      }

      /* Removed duplicate drag handle indicators */

      /* Touch device optimizations */
      @media (hover: none) {
        /* On touch devices, show action buttons on tap/focus */
        .module-item:active .module-hover-overlay,
        .module-item:focus-within .module-hover-overlay {
          opacity: 1;
          visibility: visible;
        }

        .module-action-btn {
          width: 36px;
          height: 36px;
        }

        .module-action-btn ha-icon {
          --mdc-icon-size: 20px;
        }
      }
    `}};ce([mt({attribute:!1})],ge.prototype,"hass",void 0),ce([mt({attribute:!1})],ge.prototype,"config",void 0),ce([mt({attribute:!1})],ge.prototype,"isFullScreen",void 0),ce([gt()],ge.prototype,"_showModuleSelector",void 0),ce([gt()],ge.prototype,"_selectedRowIndex",void 0),ce([gt()],ge.prototype,"_selectedColumnIndex",void 0),ce([gt()],ge.prototype,"_showModuleSettings",void 0),ce([gt()],ge.prototype,"_selectedModule",void 0),ce([gt()],ge.prototype,"_activeModuleTab",void 0),ce([gt()],ge.prototype,"_activeDesignSubtab",void 0),ce([gt()],ge.prototype,"_showRowSettings",void 0),ce([gt()],ge.prototype,"_selectedRowForSettings",void 0),ce([gt()],ge.prototype,"_activeRowTab",void 0),ce([gt()],ge.prototype,"_showColumnSettings",void 0),ce([gt()],ge.prototype,"_selectedColumnForSettings",void 0),ce([gt()],ge.prototype,"_activeColumnTab",void 0),ce([gt()],ge.prototype,"_showColumnLayoutSelector",void 0),ce([gt()],ge.prototype,"_selectedRowForLayout",void 0),ce([gt()],ge.prototype,"_draggedItem",void 0),ce([gt()],ge.prototype,"_dropTarget",void 0),ce([gt()],ge.prototype,"_selectedLayoutModuleIndex",void 0),ce([gt()],ge.prototype,"_showLayoutChildSettings",void 0),ce([gt()],ge.prototype,"_selectedLayoutChild",void 0),ce([gt()],ge.prototype,"_collapsedRows",void 0),ce([gt()],ge.prototype,"_collapsedColumns",void 0),ce([gt()],ge.prototype,"_collapsedLayoutModules",void 0),ge=ce([ct("ultra-layout-tab")],ge);var he=function(t,e,o,i){var n,a=arguments.length,r=a<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,o,i);else for(var l=t.length-1;l>=0;l--)(n=t[l])&&(r=(a<3?n(r):a>3?n(e,o,r):n(e,o))||r);return a>3&&r&&Object.defineProperty(e,o,r),r};let ve=class extends st{constructor(){super(...arguments),this._activeTab="layout",this._isFullScreen=!1,this._isMobile=!1}setConfig(t){this.config=t||{type:"custom:ultra-card",layout:{rows:[]}}}connectedCallback(){super.connectedCallback(),this.addEventListener("config-changed",this._handleConfigChanged),this.addEventListener("keydown",this._handleKeyDown),this._checkMobileDevice(),this._resizeListener=this._checkMobileDevice.bind(this),window.addEventListener("resize",this._resizeListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("config-changed",this._handleConfigChanged),this.removeEventListener("keydown",this._handleKeyDown),this._resizeListener&&window.removeEventListener("resize",this._resizeListener),document.body.classList.remove("ultra-card-fullscreen")}_checkMobileDevice(){const t=window.innerWidth<=768,e=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),o=this._isMobile;this._isMobile=t||e,this._isMobile&&!o&&this._isFullScreen&&this._toggleFullScreen()}_handleConfigChanged(t){if(t.stopPropagation(),t.detail&&t.detail.config&&(this.config=t.detail.config,!t.detail.isInternal)){const e=new CustomEvent("config-changed",{detail:{config:t.detail.config,isInternal:!0},bubbles:!0,composed:!0});this.dispatchEvent(e)}}_handleKeyDown(t){"Escape"===t.key&&this._isFullScreen&&(t.preventDefault(),this._toggleFullScreen())}_updateConfig(t){const e=Object.assign(Object.assign({},this.config),t);this._configDebounceTimeout&&clearTimeout(this._configDebounceTimeout),this._configDebounceTimeout=window.setTimeout((()=>{const t=oe.validateAndCorrectConfig(e);if(!t.valid){console.error("❌ Ultra Card Editor: Config validation failed",{errors:t.errors,warnings:t.warnings});const o=new CustomEvent("config-changed",{detail:{config:e,isInternal:!0},bubbles:!0,composed:!0});return void this.dispatchEvent(o)}const o=oe.validateUniqueModuleIds(t.correctedConfig);let i=t.correctedConfig;o.valid||(console.warn("⚠️  Ultra Card Editor: Duplicate module IDs detected, fixing...",{duplicates:o.duplicates}),i=oe.fixDuplicateModuleIds(i)),t.warnings.length>0&&console.info("ℹ️  Ultra Card: Config corrected with warnings",{warnings:t.warnings.length});const n=new CustomEvent("config-changed",{detail:{config:i,isInternal:!0},bubbles:!0,composed:!0});this.dispatchEvent(n)}),100)}_toggleFullScreen(){this._isFullScreen=!this._isFullScreen,this._isFullScreen?(document.body.classList.add("ultra-card-fullscreen"),"layout"!==this._activeTab&&(this._activeTab="layout")):document.body.classList.remove("ultra-card-fullscreen")}render(){return this.hass&&this.config?V`
      <div class="card-config ${this._isFullScreen?"fullscreen":""}">
        <div class="tabs">
          <button
            class="tab ${"layout"===this._activeTab?"active":""}"
            @click=${()=>this._activeTab="layout"}
          >
            ${this._isFullScreen?"Ultra Card Layout Builder":"Layout Builder"}
          </button>
          ${this._isFullScreen?"":V`
                <button
                  class="tab ${"settings"===this._activeTab?"active":""}"
                  @click=${()=>this._activeTab="settings"}
                >
                  Settings
                </button>
                <button
                  class="tab ${"about"===this._activeTab?"active":""}"
                  @click=${()=>this._activeTab="about"}
                >
                  About
                </button>
              `}
          ${this._isMobile?"":V`
                <button
                  class="fullscreen-toggle"
                  @click=${this._toggleFullScreen}
                  title=${this._isFullScreen?"Return to Dashboard":"Enter Full Screen"}
                >
                  ${this._isFullScreen?V`
                        <svg viewBox="0 0 24 24" class="arrow-icon">
                          <path d="M15.41,7.41L14,6L8,12L14,18L15.41,16.59L10.83,12L15.41,7.41Z" />
                        </svg>
                        <span class="dashboard-text">Dashboard</span>
                      `:V`
                        <svg viewBox="0 0 24 24" class="arrow-icon">
                          <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                        </svg>
                      `}
                </button>
              `}
        </div>

        <div class="tab-content">
          ${"layout"===this._activeTab?V`<ultra-layout-tab
                .hass=${this.hass}
                .config=${this.config}
                .isFullScreen=${this._isFullScreen}
              ></ultra-layout-tab>`:"settings"===this._activeTab?this._renderSettingsTab():V`<ultra-about-tab .hass=${this.hass}></ultra-about-tab>`}
        </div>
      </div>
    `:V`<div>Loading...</div>`}_renderSettingsTab(){const t="var(--card-background-color)";return V`
      <div class="settings-tab">
        <div class="settings-header">
          <h3>Card Settings</h3>
          <p>Configure global card appearance and behavior.</p>
        </div>

        <div class="settings-container">
          <!-- Appearance Section -->
          <div class="settings-section">
            <div class="section-header">
              <h4>Appearance</h4>
              <p>Control the visual appearance of your card</p>
            </div>

            <div class="settings-grid">
              <div class="setting-item">
                <label>Card Background Color</label>
                <div class="setting-description">The background color of the entire card</div>
                <ultra-color-picker
                  .label=${"Card Background Color"}
                  .value=${this.config.card_background||t}
                  .defaultValue=${t}
                  .hass=${this.hass}
                  @value-changed=${t=>this._updateConfig({card_background:t.detail.value})}
                ></ultra-color-picker>
              </div>

              <div class="setting-item">
                <label>Border Radius</label>
                <div class="setting-description">Rounded corners for the card (in pixels)</div>
                <div class="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    .value=${this.config.card_border_radius||8}
                    @change=${t=>this._updateConfig({card_border_radius:Number(t.target.value)})}
                  />
                  <span class="unit">px</span>
                  <button
                    class="reset-btn"
                    @click=${()=>this._updateConfig({card_border_radius:8})}
                    title="Reset to default (8px)"
                  >
                    ↺
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Spacing Section -->
          <div class="settings-section">
            <div class="section-header">
              <h4>Spacing</h4>
              <p>Control the spacing and positioning of your card</p>
            </div>

            <div class="settings-grid">
              <div class="setting-item">
                <label>Card Padding</label>
                <div class="setting-description">Internal spacing within the card</div>
                <div class="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    .value=${this.config.card_padding||16}
                    @change=${t=>this._updateConfig({card_padding:Number(t.target.value)})}
                  />
                  <span class="unit">px</span>
                  <button
                    class="reset-btn"
                    @click=${()=>this._updateConfig({card_padding:16})}
                    title="Reset to default (16px)"
                  >
                    ↺
                  </button>
                </div>
              </div>

              <div class="setting-item">
                <label>Card Margin</label>
                <div class="setting-description">External spacing around the card</div>
                <div class="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    .value=${this.config.card_margin||0}
                    @change=${t=>this._updateConfig({card_margin:Number(t.target.value)})}
                  />
                  <span class="unit">px</span>
                  <button
                    class="reset-btn"
                    @click=${()=>this._updateConfig({card_margin:0})}
                    title="Reset to default (0px)"
                  >
                    ↺
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `}static get styles(){return a`
      /* Global styles for hiding preview in full screen */
      :host {
        --ultra-editor-transition: all 0.3s ease;
      }

      .card-config {
        padding: 16px;
        max-width: 100%;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
        transition: var(--ultra-editor-transition);
      }

      /* Full screen mode styles */
      .card-config.fullscreen {
        max-width: none !important;
        width: 100vw !important;
        margin: 0 !important;
        padding: 20px !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        height: 100vh !important;
        z-index: 10000 !important;
        background: var(--card-background-color) !important;
        overflow-y: auto !important;
        box-sizing: border-box !important;
      }

      /* Full screen mode tab content */
      .card-config.fullscreen .tab-content {
        min-height: calc(100vh - 120px) !important;
        width: 100% !important;
        max-width: none !important;
      }

      /* Full screen mode header adjustments */
      .card-config.fullscreen .tabs {
        border: none;
        background: var(--card-background-color);
        padding: 16px;
        position: sticky;
        top: 0;
        z-index: 100;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      /* Remove the gradient line in fullscreen */
      .card-config.fullscreen .tabs::before {
        display: none;
      }

      /* Center the single tab in fullscreen mode and remove borders */
      .card-config.fullscreen .tab {
        flex: none;
        min-width: auto;
        justify-content: center;
        border: none;
        border-radius: 12px;
        background: var(--primary-color);
        color: white;
        padding: 12px 24px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(var(--rgb-primary-color), 0.3);
      }

      .card-config.fullscreen .tab:hover {
        background: var(--primary-color);
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--rgb-primary-color), 0.4);
      }

      /* Hide Home Assistant preview when in full screen mode */
      :global(body.ultra-card-fullscreen) {
        overflow: hidden !important;
      }

      :global(body.ultra-card-fullscreen *) {
        .element-preview,
        .element-preview-container,
        .preview-container,
        .card-preview,
        .preview-pane,
        hui-card-preview,
        .card-config > div:last-child:not(.card-config),
        .card-config-row > div:last-child,
        .mdc-dialog .mdc-dialog__container .mdc-dialog__surface > div:last-child:not(.card-config) {
          display: none !important;
        }

        .card-config-container,
        .editor-container,
        .card-config-row,
        .mdc-dialog .mdc-dialog__container .mdc-dialog__surface {
          width: 100% !important;
          max-width: none !important;
        }

        /* Override HA dialog sizing */
        .mdc-dialog .mdc-dialog__container {
          max-width: 100vw !important;
          width: 100vw !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          z-index: 9999 !important;
        }

        .mdc-dialog .mdc-dialog__surface {
          max-width: 100vw !important;
          width: 100vw !important;
          max-height: 100vh !important;
          height: 100vh !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          margin: 0 !important;
          border-radius: 0 !important;
        }

        /* Hide the backdrop */
        .mdc-dialog .mdc-dialog__scrim {
          display: none !important;
        }
      }

      /* Hide unwanted form labels with underscores and slots */
      [slot='label'] {
        display: none !important;
      }

      ha-form .mdc-form-field > label,
      ha-form .mdc-text-field > label,
      ha-form .mdc-floating-label,
      ha-form .mdc-notched-outline__leading,
      ha-form .mdc-notched-outline__notch,
      ha-form .mdc-notched-outline__trailing,
      ha-form .mdc-floating-label--float-above,
      ha-form label[for],
      ha-form .ha-form-label,
      ha-form .form-label {
        display: none !important;
      }

      /* Hide any labels containing underscores */
      ha-form label[data-label*='_'],
      ha-form .label-text:contains('_'),
      label:contains('_') {
        display: none !important;
      }

      /* Additional safeguards for underscore labels */
      ha-form .mdc-text-field-character-counter,
      ha-form .mdc-text-field-helper-text,
      ha-form mwc-formfield,
      ha-form .formfield {
        display: none !important;
      }

      /* Mobile responsive adjustments */
      @media (max-width: 768px) {
        .card-config {
          padding: 8px;
        }

        /* Hide fullscreen toggle on mobile as additional safeguard */
        .fullscreen-toggle {
          display: none !important;
        }
      }

      .tabs {
        display: flex;
        border-bottom: 2px solid var(--divider-color);
        margin-bottom: 16px;
      }

      .tab {
        background: none;
        border: none;
        padding: 12px 16px;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 14px;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
        flex: 1;
        text-align: center;
      }

      .tab:hover {
        color: var(--primary-color);
      }

      .tab.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .fullscreen-toggle {
        background: none;
        border: none;
        padding: 8px 12px;
        cursor: pointer;
        color: var(--secondary-text-color);
        margin-left: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: var(--ultra-editor-transition);
        position: relative;
        min-width: 40px;
        height: 40px;
        gap: 6px;
      }

      .fullscreen-toggle:hover {
        background: var(--divider-color);
        color: var(--primary-color);
      }

      .fullscreen-toggle:active {
        transform: scale(0.95);
      }

      /* Active fullscreen state - Dashboard button styling */
      .card-config.fullscreen .fullscreen-toggle {
        background: rgba(var(--rgb-primary-color), 0.1);
        color: var(--primary-color);
        border: 1px solid rgba(var(--rgb-primary-color), 0.2);
        padding: 8px 16px;
        min-width: auto;
        height: auto;
      }

      .card-config.fullscreen .fullscreen-toggle:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
        transform: translateX(-2px);
      }

      .arrow-icon {
        width: 20px;
        height: 20px;
        fill: currentColor;
        transition: var(--ultra-editor-transition);
        flex-shrink: 0;
      }

      .dashboard-text {
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
      }

      .tab-content {
        min-height: 400px;
        transition: var(--ultra-editor-transition);
      }

      /* Full screen mode tab content */
      .card-config.fullscreen .tab-content {
        min-height: calc(100vh - 120px);
      }

      .settings-tab {
        padding: 12px;
        background: var(--card-background-color);
        border-radius: 8px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .settings-header {
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .settings-header h3 {
        margin: 0 0 8px 0;
        color: var(--primary-text-color);
        font-size: 18px;
        font-weight: 600;
      }

      .settings-header p {
        margin: 0;
        color: var(--secondary-text-color);
        font-size: 14px;
        line-height: 1.4;
      }

      .settings-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        flex: 1;
      }

      .settings-section {
        background: var(--secondary-background-color);
        border: 2px solid var(--primary-color);
        border-radius: 8px;
        padding: 20px;
        box-sizing: border-box;
      }

      .section-header {
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);
      }

      .section-header h4 {
        margin: 0 0 6px 0;
        color: var(--primary-text-color);
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .section-header p {
        margin: 0;
        color: var(--secondary-text-color);
        font-size: 13px;
        line-height: 1.4;
      }

      .settings-grid {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .setting-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .setting-item label {
        color: var(--primary-text-color);
        font-size: 14px;
        font-weight: 500;
        margin: 0;
      }

      .setting-description {
        color: var(--secondary-text-color);
        font-size: 12px;
        line-height: 1.3;
        margin-bottom: 4px;
      }

      .input-with-unit {
        display: flex;
        align-items: center;
        gap: 8px;
        max-width: 200px;
      }

      .input-with-unit input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        transition: all 0.2s ease;
        min-width: 0;
      }

      .input-with-unit input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
      }

      .input-with-unit .unit {
        color: var(--secondary-text-color);
        font-size: 12px;
        font-weight: 500;
        min-width: 20px;
        text-align: center;
      }

      .reset-btn {
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        color: var(--secondary-text-color);
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        padding: 0;
        flex-shrink: 0;
      }

      .reset-btn:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
        transform: scale(1.05);
      }

      .reset-btn:active {
        transform: scale(0.95);
      }

      .setting-item ultra-color-picker {
        max-width: 300px;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .settings-tab {
          padding: 16px 12px;
        }

        .settings-section {
          padding: 16px;
        }

        .settings-grid {
          gap: 16px;
        }
      }

      /* Full screen mode responsive behavior for builder columns */
      .card-config.fullscreen {
        /* Allow horizontal layout components to display side by side */
        ::slotted(ultra-layout-tab) {
          --layout-columns-display: flex;
          --layout-columns-direction: row;
          --layout-columns-gap: 16px;
        }

        /* Style for layout builder in full screen */
        ultra-layout-tab {
          --columns-layout: horizontal;
        }
      }

      /* Default preview mode - stack columns vertically */
      .card-config:not(.fullscreen) {
        ::slotted(ultra-layout-tab) {
          --layout-columns-display: flex;
          --layout-columns-direction: column;
          --layout-columns-gap: 12px;
        }

        ultra-layout-tab {
          --columns-layout: vertical;
        }
      }

      /* Enhanced mobile behavior */
      @media (max-width: 768px) {
        .card-config.fullscreen {
          width: 100vw;
          height: 100vh;
          padding: 12px;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
          background: var(--card-background-color);
        }

        .fullscreen-toggle {
          padding: 6px 10px;
          min-width: 36px;
          height: 36px;
        }

        .arrow-icon {
          width: 16px;
          height: 16px;
        }
      }
    `}};he([mt({attribute:!1})],ve.prototype,"hass",void 0),he([mt({attribute:!1})],ve.prototype,"config",void 0),he([gt()],ve.prototype,"_activeTab",void 0),he([gt()],ve.prototype,"_configDebounceTimeout",void 0),he([gt()],ve.prototype,"_isFullScreen",void 0),he([gt()],ve.prototype,"_isMobile",void 0),ve=he([ct("ultra-card-editor")],ve);var be=function(t,e,o,i){var n,a=arguments.length,r=a<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,o,i);else for(var l=t.length-1;l>=0;l--)(n=t[l])&&(r=(a<3?n(r):a>3?n(e,o,r):n(e,o))||r);return a>3&&r&&Object.defineProperty(e,o,r),r};let fe=class extends st{constructor(){super(...arguments),this._moduleVisibilityState=new Map,this._animatingModules=new Set,this._lastHassChangeTime=0}willUpdate(t){if(t.has("config")){const e=t.get("config"),o=this.config;e&&JSON.stringify(e.layout)===JSON.stringify(null==o?void 0:o.layout)||(this._moduleVisibilityState.clear(),this._animatingModules.clear()),this.requestUpdate()}if(t.has("hass")){const t=Date.now();t-this._lastHassChangeTime>100&&(this._lastHassChangeTime=t,this.hass&&te.setHass(this.hass),this.requestUpdate())}}setConfig(t){if(!t)throw new Error("Invalid configuration");const e=oe.validateAndCorrectConfig(t);if(!e.valid)throw console.error("❌ Ultra Card: Config validation failed",{errors:e.errors,warnings:e.warnings}),new Error(`Invalid configuration: ${e.errors.join(", ")}`);const o=oe.validateUniqueModuleIds(e.correctedConfig);let i=e.correctedConfig;o.valid||(console.warn("⚠️  Ultra Card: Duplicate module IDs detected, fixing...",{duplicates:o.duplicates}),i=oe.fixDuplicateModuleIds(i)),e.warnings.length>0&&console.info("ℹ️  Ultra Card: Config corrected with warnings",{warnings:e.warnings,totalModules:this._countTotalModules(i)}),this.config=Object.assign({},i),this.requestUpdate()}static getConfigElement(){return document.createElement("ultra-card-editor")}static getStubConfig(){return{type:"custom:ultra-card",layout:{rows:[{id:"row1",columns:[{id:"col1",modules:[{type:"text",text:"Ultra Card",font_size:24,color:"#2196f3",alignment:"center"}]}]}]}}}render(){if(!this.config||!this.hass)return V`<div>Loading...</div>`;const t=this._getCardStyle();return this.config.layout&&this.config.layout.rows&&0!==this.config.layout.rows.length?V`
      <div class="card-container" style="${t}">
        ${this.config.layout.rows.map((t=>this._renderRow(t)))}
      </div>
    `:V`
        <div class="card-container" style="${t}">
          <div class="welcome-text">
            <h2>Ultra Card</h2>
            <p>Modular card builder for Home Assistant</p>
            <p>Configure using the visual editor</p>
          </div>
        </div>
      `}_getCardStyle(){if(!this.config)return"";const t=[];return this.config.card_background&&t.push(`background: ${this.config.card_background}`),void 0!==this.config.card_border_radius&&t.push(`border-radius: ${this.config.card_border_radius}px`),void 0!==this.config.card_padding&&t.push(`padding: ${this.config.card_padding}px`),void 0!==this.config.card_margin&&t.push(`margin: ${this.config.card_margin}px`),t.join("; ")}_renderRow(t){var e,o,i,n,a,r,l;this.hass&&te.setHass(this.hass);const s=te.evaluateRowVisibility(t),d=t,c=te.evaluateLogicProperties({logic_entity:null===(e=d.design)||void 0===e?void 0:e.logic_entity,logic_attribute:null===(o=d.design)||void 0===o?void 0:o.logic_attribute,logic_operator:null===(i=d.design)||void 0===i?void 0:i.logic_operator,logic_value:null===(n=d.design)||void 0===n?void 0:n.logic_value});if(!s||!c)return V``;const p=this._getStateBasedAnimationClass(t.design),u=this._generateRowStyles(t),m=V`
      <div class="card-row" style=${u}>
        ${t.columns.map((t=>this._renderColumn(t)))}
      </div>
    `;if(p){const e=(null===(a=t.design)||void 0===a?void 0:a.animation_duration)||"2s",o=(null===(r=t.design)||void 0===r?void 0:r.animation_delay)||"0s",i=(null===(l=t.design)||void 0===l?void 0:l.animation_timing)||"ease";return V`
        <div
          class="row-animation-wrapper ${p}"
          style="
            --animation-duration: ${e};
            --animation-delay: ${o};
            --animation-timing: ${i};
          "
        >
          ${m}
        </div>
      `}return m}_renderColumn(t){var e,o,i,n,a,r,l;const s=te.evaluateColumnVisibility(t),d=t,c=te.evaluateLogicProperties({logic_entity:null===(e=d.design)||void 0===e?void 0:e.logic_entity,logic_attribute:null===(o=d.design)||void 0===o?void 0:o.logic_attribute,logic_operator:null===(i=d.design)||void 0===i?void 0:i.logic_operator,logic_value:null===(n=d.design)||void 0===n?void 0:n.logic_value});if(!s||!c)return V``;const p=this._getStateBasedAnimationClass(t.design),u=this._generateColumnStyles(t),m=V`
      <div class="card-column" style=${u}>
        ${t.modules.map((t=>this._renderModule(t)))}
      </div>
    `;if(p){const e=(null===(a=t.design)||void 0===a?void 0:a.animation_duration)||"2s",o=(null===(r=t.design)||void 0===r?void 0:r.animation_delay)||"0s",i=(null===(l=t.design)||void 0===l?void 0:l.animation_timing)||"ease";return V`
        <div
          class="column-animation-wrapper ${p}"
          style="
            --animation-duration: ${e};
            --animation-delay: ${o};
            --animation-timing: ${i};
          "
        >
          ${m}
        </div>
      `}return m}_renderModule(t){var e,o,i,n,a,r,l,s,d,c,p,u,m,g;const h=te.evaluateModuleVisibility(t),v=t,b=te.evaluateLogicProperties({logic_entity:null===(e=v.design)||void 0===e?void 0:e.logic_entity,logic_attribute:null===(o=v.design)||void 0===o?void 0:o.logic_attribute,logic_operator:null===(i=v.design)||void 0===i?void 0:i.logic_operator,logic_value:null===(n=v.design)||void 0===n?void 0:n.logic_value}),f=h&&b,y=t.id||`${t.type}-${Math.random()}`,_=this._moduleVisibilityState.get(y),x=this._animatingModules.has(y),w=v.intro_animation||(null===(a=v.design)||void 0===a?void 0:a.intro_animation)||"none",$=v.outro_animation||(null===(r=v.design)||void 0===r?void 0:r.outro_animation)||"none",k=v.animation_duration||(null===(l=v.design)||void 0===l?void 0:l.animation_duration)||"2s",C=v.animation_delay||(null===(s=v.design)||void 0===s?void 0:s.animation_delay)||"0s",S=v.animation_timing||(null===(d=v.design)||void 0===d?void 0:d.animation_timing)||"ease",z=v.animation_type||(null===(c=v.design)||void 0===c?void 0:c.animation_type),I=v.animation_entity||(null===(p=v.design)||void 0===p?void 0:p.animation_entity),T=v.animation_trigger_type||(null===(u=v.design)||void 0===u?void 0:u.animation_trigger_type)||"state",A=v.animation_attribute||(null===(m=v.design)||void 0===m?void 0:m.animation_attribute),P=v.animation_state||(null===(g=v.design)||void 0===g?void 0:g.animation_state);let M=!1;if(z&&"none"!==z)if(I){if(P&&this.hass){const t=this.hass.states[I];if(t)if("attribute"===T&&A){const e=t.attributes[A];M=String(e)===P}else M=t.state===P}}else M=!0;let L="",O=!1;if(M&&"none"!==z?L=`animation-${z}`:void 0!==_&&_!==f?f&&"none"!==w?x?L=`animation-${w}`:(L=`animation-${w}`,O=!0,this._animatingModules.add(y),setTimeout((()=>{this._animatingModules.delete(y),this.requestUpdate()}),this._parseAnimationDuration(k)+this._parseAnimationDuration(C))):f||"none"===$||(x?L=`animation-${$}`:(L=`animation-${$}`,O=!0,this._animatingModules.add(y),setTimeout((()=>{this._animatingModules.delete(y),this.requestUpdate()}),this._parseAnimationDuration(k)+this._parseAnimationDuration(C)))):x&&(f&&"none"!==w?L=`animation-${w}`:f||"none"===$||(L=`animation-${$}`)),this._moduleVisibilityState.set(y,f),!f&&!x&&!O)return V``;const D=Kt().getModule(t.type);let E;return E=D&&this.hass?D.renderPreview(t,this.hass):V`
        <div class="unknown-module">
          <span>Unknown Module: ${t.type}</span>
        </div>
      `,L||"none"!==w||"none"!==$||M?V`
        <div
          class="module-animation-wrapper ${L}"
          style="
            --animation-duration: ${k};
            --animation-delay: ${C};
            --animation-timing: ${S};
          "
        >
          ${E}
        </div>
      `:E}_parseAnimationDuration(t){const e=t.match(/^(\d*\.?\d+)(s|ms)?$/);if(!e)return 300;const o=parseFloat(e[1]),i=e[2];return i?"s"===i?1e3*o:o:1e3*o}_getStateBasedAnimationClass(t){if(!t)return"";const e=t.animation_type,o=t.animation_entity,i=t.animation_trigger_type||"state",n=t.animation_attribute,a=t.animation_state;if(!e||"none"===e)return"";if(!o)return`animation-${e}`;if(!a||!this.hass)return"";const r=this.hass.states[o];if(!r)return"";let l=!1;if("attribute"===i&&n){const t=r.attributes[n];l=String(t)===a}else l=r.state===a;return l?`animation-${e}`:""}_countTotalModules(t){return t.layout&&t.layout.rows?t.layout.rows.reduce(((t,e)=>t+e.columns.reduce(((t,e)=>t+e.modules.length),0)),0):0}_getGridTemplateColumns(t,e){return{"1-col":"1fr","1-2-1-2":"1fr 1fr","1-3-2-3":"1fr 2fr","2-3-1-3":"2fr 1fr","2-5-3-5":"2fr 3fr","3-5-2-5":"3fr 2fr","1-3-1-3-1-3":"1fr 1fr 1fr","1-4-1-2-1-4":"1fr 2fr 1fr","1-5-3-5-1-5":"1fr 3fr 1fr","1-6-2-3-1-6":"1fr 4fr 1fr","1-4-1-4-1-4-1-4":"1fr 1fr 1fr 1fr","1-5-1-5-1-5-1-5":"1fr 1fr 1fr 1fr","1-6-1-6-1-6-1-6":"1fr 1fr 1fr 1fr","1-8-1-4-1-4-1-8":"1fr 2fr 2fr 1fr","1-5-1-5-1-5-1-5-1-5":"1fr 1fr 1fr 1fr 1fr","1-6-1-6-1-3-1-6-1-6":"1fr 1fr 2fr 1fr 1fr","1-8-1-4-1-4-1-4-1-8":"1fr 2fr 2fr 2fr 1fr","1-6-1-6-1-6-1-6-1-6-1-6":"1fr 1fr 1fr 1fr 1fr 1fr","50-50":"1fr 1fr","30-70":"3fr 7fr","70-30":"7fr 3fr","40-60":"4fr 6fr","60-40":"6fr 4fr","33-33-33":"1fr 1fr 1fr","25-50-25":"1fr 2fr 1fr","20-60-20":"1fr 3fr 1fr","25-25-25-25":"1fr 1fr 1fr 1fr"}[t]||`repeat(${e}, 1fr)`}_addPixelUnit(t){return t?/^\d+$/.test(t)?`${t}px`:/^[\d\s]+$/.test(t)?t.split(" ").map((t=>t.trim()?`${t}px`:t)).join(" "):t:t}_generateRowStyles(t){const e=t.design||{},o={display:"grid",gridTemplateColumns:this._getGridTemplateColumns(t.column_layout||"1-col",t.columns.length),gap:`${t.gap||16}px`,marginBottom:"16px"},i={padding:e.padding_top||e.padding_bottom||e.padding_left||e.padding_right?`${e.padding_top||"0"} ${e.padding_right||"0"} ${e.padding_bottom||"0"} ${e.padding_left||"0"}`:t.padding?`${t.padding}px`:void 0,margin:e.margin_top||e.margin_bottom||e.margin_left||e.margin_right?`${e.margin_top||"0"} ${e.margin_right||"0"} ${e.margin_bottom||"16px"} ${e.margin_left||"0"}`:t.margin?`${t.margin}px`:void 0,background:e.background_color||t.background_color||"transparent",border:e.border_style&&"none"!==e.border_style?`${e.border_width||"1px"} ${e.border_style} ${e.border_color||"var(--divider-color)"}`:"none",borderRadius:this._addPixelUnit(e.border_radius)||(t.border_radius?`${t.border_radius}px`:"0"),position:e.position||"relative",top:e.top||"auto",bottom:e.bottom||"auto",left:e.left||"auto",right:e.right||"auto",zIndex:e.z_index||"auto",width:e.width||"100%",height:e.height||"auto",maxWidth:e.max_width||"none",maxHeight:e.max_height||"none",minWidth:e.min_width||"none",minHeight:e.min_height||"auto",overflow:e.overflow||"hidden",clipPath:e.clip_path||"none",backdropFilter:e.backdrop_filter||"none",boxShadow:e.box_shadow_h&&e.box_shadow_v?`${e.box_shadow_h||"0"} ${e.box_shadow_v||"0"} ${e.box_shadow_blur||"0"} ${e.box_shadow_spread||"0"} ${e.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"},n=Object.assign(Object.assign({},o),i),a=Object.fromEntries(Object.entries(n).filter((([t,e])=>void 0!==e)));return this._styleObjectToCss(a)}_generateColumnStyles(t){const e=t.design||{},o={display:"flex",flexDirection:"column",gap:"8px",alignItems:"left"===t.horizontal_alignment?"flex-start":"right"===t.horizontal_alignment?"flex-end":"stretch"===t.horizontal_alignment?"stretch":"center",justifyContent:"top"===t.vertical_alignment?"flex-start":"bottom"===t.vertical_alignment?"flex-end":"stretch"===t.vertical_alignment?"stretch":"center"},i={padding:e.padding_top||e.padding_bottom||e.padding_left||e.padding_right?`${e.padding_top||"0"} ${e.padding_right||"0"} ${e.padding_bottom||"0"} ${e.padding_left||"0"}`:t.padding?`${t.padding}px`:void 0,margin:e.margin_top||e.margin_bottom||e.margin_left||e.margin_right?`${e.margin_top||"0"} ${e.margin_right||"0"} ${e.margin_bottom||"0"} ${e.margin_left||"0"}`:t.margin?`${t.margin}px`:void 0,background:e.background_color||t.background_color||"transparent",border:e.border_style&&"none"!==e.border_style?`${e.border_width||"1px"} ${e.border_style} ${e.border_color||"var(--divider-color)"}`:"none",borderRadius:this._addPixelUnit(e.border_radius)||(t.border_radius?`${t.border_radius}px`:"0"),position:e.position||"relative",top:e.top||"auto",bottom:e.bottom||"auto",left:e.left||"auto",right:e.right||"auto",zIndex:e.z_index||"auto",width:e.width||"100%",height:e.height||"auto",maxWidth:e.max_width||"none",maxHeight:e.max_height||"none",minWidth:e.min_width||"none",minHeight:e.min_height||"auto",overflow:e.overflow||"hidden",clipPath:e.clip_path||"none",backdropFilter:e.backdrop_filter||"none",boxShadow:e.box_shadow_h&&e.box_shadow_v?`${e.box_shadow_h||"0"} ${e.box_shadow_v||"0"} ${e.box_shadow_blur||"0"} ${e.box_shadow_spread||"0"} ${e.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"},n=Object.assign(Object.assign({},o),i),a=Object.fromEntries(Object.entries(n).filter((([t,e])=>void 0!==e)));return this._styleObjectToCss(a)}_styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${t.replace(/[A-Z]/g,(t=>`-${t.toLowerCase()}`))}: ${e}`)).join("; ")}static get styles(){return a`
      :host {
        display: block;
      }

      .card-container {
        background: var(--card-background-color, var(--ha-card-background, white));
        border-radius: 8px;
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
        padding: 16px;
        transition: all 0.3s ease;
      }

      .welcome-text {
        text-align: center;
        padding: 24px;
      }

      .welcome-text h2 {
        margin: 0 0 16px 0;
        color: var(--primary-text-color);
      }

      .welcome-text p {
        margin: 8px 0;
        color: var(--secondary-text-color);
      }

      .card-row {
        margin-bottom: 16px;
      }

      .card-row:last-child {
        margin-bottom: 0;
      }

      .card-column {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .unknown-module {
        padding: 16px;
        background: var(--error-color);
        color: white;
        border-radius: 4px;
        text-align: center;
        font-size: 14px;
      }

      /* Animation Wrappers */
      .module-animation-wrapper,
      .row-animation-wrapper,
      .column-animation-wrapper {
        animation-duration: var(--animation-duration, 2s);
        animation-delay: var(--animation-delay, 0s);
        animation-timing-function: var(--animation-timing, ease);
        animation-fill-mode: both;
        /* Inherit width from content */
        display: inherit;
        width: inherit;
        height: inherit;
        flex: inherit;
      }

      /* Intro Animations */
      .animation-fadeIn {
        animation-name: fadeIn;
      }

      .animation-slideInUp {
        animation-name: slideInUp;
      }

      .animation-slideInDown {
        animation-name: slideInDown;
      }

      .animation-slideInLeft {
        animation-name: slideInLeft;
      }

      .animation-slideInRight {
        animation-name: slideInRight;
      }

      .animation-zoomIn {
        animation-name: zoomIn;
      }

      .animation-bounceIn {
        animation-name: bounceIn;
      }

      .animation-flipInX {
        animation-name: flipInX;
      }

      .animation-flipInY {
        animation-name: flipInY;
      }

      .animation-rotateIn {
        animation-name: rotateIn;
      }

      /* Outro Animations */
      .animation-fadeOut {
        animation-name: fadeOut;
      }

      .animation-slideOutUp {
        animation-name: slideOutUp;
      }

      .animation-slideOutDown {
        animation-name: slideOutDown;
      }

      .animation-slideOutLeft {
        animation-name: slideOutLeft;
      }

      .animation-slideOutRight {
        animation-name: slideOutRight;
      }

      .animation-zoomOut {
        animation-name: zoomOut;
      }

      .animation-bounceOut {
        animation-name: bounceOut;
      }

      .animation-flipOutX {
        animation-name: flipOutX;
      }

      .animation-flipOutY {
        animation-name: flipOutY;
      }

      .animation-rotateOut {
        animation-name: rotateOut;
      }

      /* State-based Animations */
      .animation-pulse {
        animation-name: pulse;
        animation-iteration-count: infinite;
      }

      .animation-vibrate {
        animation-name: vibrate;
        animation-iteration-count: infinite;
      }

      .animation-rotate-left {
        animation-name: rotateLeft;
        animation-iteration-count: infinite;
      }

      .animation-rotate-right {
        animation-name: rotateRight;
        animation-iteration-count: infinite;
      }

      .animation-hover {
        animation-name: hover;
        animation-iteration-count: infinite;
      }

      .animation-fade {
        animation-name: fadeInOut;
        animation-iteration-count: infinite;
      }

      .animation-scale {
        animation-name: scale;
        animation-iteration-count: infinite;
      }

      .animation-bounce {
        animation-name: bounce;
        animation-iteration-count: infinite;
      }

      .animation-shake {
        animation-name: shake;
        animation-iteration-count: infinite;
      }

      .animation-tada {
        animation-name: tada;
        animation-iteration-count: infinite;
      }

      /* Animation Keyframes */
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      @keyframes slideInUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideInDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideInLeft {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes zoomIn {
        from {
          transform: scale(0);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes bounceIn {
        0% {
          transform: scale(0.3);
          opacity: 0;
        }
        50% {
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes flipInX {
        from {
          transform: perspective(400px) rotateX(90deg);
          opacity: 0;
        }
        to {
          transform: perspective(400px) rotateX(0deg);
          opacity: 1;
        }
      }

      @keyframes flipInY {
        from {
          transform: perspective(400px) rotateY(90deg);
          opacity: 0;
        }
        to {
          transform: perspective(400px) rotateY(0deg);
          opacity: 1;
        }
      }

      @keyframes rotateIn {
        from {
          transform: rotate(-200deg);
          opacity: 0;
        }
        to {
          transform: rotate(0deg);
          opacity: 1;
        }
      }

      @keyframes slideOutUp {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(-100%);
          opacity: 0;
        }
      }

      @keyframes slideOutDown {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(100%);
          opacity: 0;
        }
      }

      @keyframes slideOutLeft {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(-100%);
          opacity: 0;
        }
      }

      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      @keyframes zoomOut {
        from {
          transform: scale(1);
          opacity: 1;
        }
        to {
          transform: scale(0);
          opacity: 0;
        }
      }

      @keyframes bounceOut {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        25% {
          transform: scale(0.95);
        }
        50% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(0);
          opacity: 0;
        }
      }

      @keyframes flipOutX {
        from {
          transform: perspective(400px) rotateX(0deg);
          opacity: 1;
        }
        to {
          transform: perspective(400px) rotateX(90deg);
          opacity: 0;
        }
      }

      @keyframes flipOutY {
        from {
          transform: perspective(400px) rotateY(0deg);
          opacity: 1;
        }
        to {
          transform: perspective(400px) rotateY(90deg);
          opacity: 0;
        }
      }

      @keyframes rotateOut {
        from {
          transform: rotate(0deg);
          opacity: 1;
        }
        to {
          transform: rotate(200deg);
          opacity: 0;
        }
      }

      /* State-based Animation Keyframes */
      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      @keyframes vibrate {
        0%,
        100% {
          transform: translateX(0);
        }
        10%,
        30%,
        50%,
        70%,
        90% {
          transform: translateX(-2px);
        }
        20%,
        40%,
        60%,
        80% {
          transform: translateX(2px);
        }
      }

      @keyframes rotateLeft {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(-360deg);
        }
      }

      @keyframes rotateRight {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes hover {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      @keyframes fadeInOut {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      @keyframes scale {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }

      @keyframes bounce {
        0%,
        20%,
        53%,
        80%,
        100% {
          transform: translateY(0);
        }
        40%,
        43% {
          transform: translateY(-15px);
        }
        70% {
          transform: translateY(-7px);
        }
        90% {
          transform: translateY(-3px);
        }
      }

      @keyframes shake {
        0%,
        100% {
          transform: translateX(0);
        }
        10%,
        30%,
        50%,
        70%,
        90% {
          transform: translateX(-5px);
        }
        20%,
        40%,
        60%,
        80% {
          transform: translateX(5px);
        }
      }

      @keyframes tada {
        0% {
          transform: scale(1);
        }
        10%,
        20% {
          transform: scale(0.9) rotate(-3deg);
        }
        30%,
        50%,
        70%,
        90% {
          transform: scale(1.1) rotate(3deg);
        }
        40%,
        60%,
        80% {
          transform: scale(1.1) rotate(-3deg);
        }
        100% {
          transform: scale(1) rotate(0);
        }
      }

      @keyframes slideOutUp {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(-100%);
          opacity: 0;
        }
      }

      @keyframes slideInDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideOutDown {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(100%);
          opacity: 0;
        }
      }

      @keyframes slideInLeft {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOutLeft {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(-100%);
          opacity: 0;
        }
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      @keyframes zoomIn {
        from {
          transform: scale(0.3);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes zoomOut {
        from {
          transform: scale(1);
          opacity: 1;
        }
        to {
          transform: scale(0.3);
          opacity: 0;
        }
      }

      @keyframes bounceIn {
        0% {
          transform: scale(0.3);
          opacity: 0;
        }
        50% {
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes bounceOut {
        20% {
          transform: scale(0.9);
        }
        50%,
        55% {
          transform: scale(1.05);
          opacity: 1;
        }
        100% {
          transform: scale(0.3);
          opacity: 0;
        }
      }

      @keyframes flipInX {
        from {
          transform: perspective(400px) rotateX(90deg);
          opacity: 0;
        }
        40% {
          transform: perspective(400px) rotateX(-20deg);
        }
        60% {
          transform: perspective(400px) rotateX(10deg);
        }
        80% {
          transform: perspective(400px) rotateX(-5deg);
        }
        to {
          transform: perspective(400px) rotateX(0deg);
          opacity: 1;
        }
      }

      @keyframes flipOutX {
        from {
          transform: perspective(400px) rotateX(0deg);
          opacity: 1;
        }
        to {
          transform: perspective(400px) rotateX(90deg);
          opacity: 0;
        }
      }

      @keyframes flipInY {
        from {
          transform: perspective(400px) rotateY(90deg);
          opacity: 0;
        }
        40% {
          transform: perspective(400px) rotateY(-20deg);
        }
        60% {
          transform: perspective(400px) rotateY(10deg);
        }
        80% {
          transform: perspective(400px) rotateY(-5deg);
        }
        to {
          transform: perspective(400px) rotateY(0deg);
          opacity: 1;
        }
      }

      @keyframes flipOutY {
        from {
          transform: perspective(400px) rotateY(0deg);
          opacity: 1;
        }
        to {
          transform: perspective(400px) rotateY(90deg);
          opacity: 0;
        }
      }

      @keyframes rotateIn {
        from {
          transform: rotate(-200deg);
          opacity: 0;
        }
        to {
          transform: rotate(0);
          opacity: 1;
        }
      }

      @keyframes rotateOut {
        from {
          transform: rotate(0);
          opacity: 1;
        }
        to {
          transform: rotate(200deg);
          opacity: 0;
        }
      }
    `}};be([mt({attribute:!1})],fe.prototype,"hass",void 0),be([mt({attribute:!1,type:Object})],fe.prototype,"config",void 0),be([gt()],fe.prototype,"_moduleVisibilityState",void 0),be([gt()],fe.prototype,"_animatingModules",void 0),fe=be([ct("ultra-card")],fe),setTimeout((()=>{if(!customElements.get("ultra-card")){console.warn("🔧 Ultra Card element not found, attempting manual registration...");try{customElements.define("ultra-card",fe),console.log("✅ Ultra Card manually registered successfully")}catch(t){console.error("❌ Failed to manually register Ultra Card:",t)}}}),0);var ye=function(t,e,o,i){var n,a=arguments.length,r=a<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,o,i);else for(var l=t.length-1;l>=0;l--)(n=t[l])&&(r=(a<3?n(r):a>3?n(e,o,r):n(e,o))||r);return a>3&&r&&Object.defineProperty(e,o,r),r};let _e=class extends st{constructor(){super(...arguments),this.value="",this.label="Navigation Target",this.disabled=!1}_valueChanged(t){const e=t.detail.value;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}render(){return V`
      <div class="navigation-picker">
        ${this.label?V`<label class="label">${this.label}</label>`:""}
        ${this.helper?V`<div class="helper">${this.helper}</div>`:""}

        <ha-selector
          .hass=${this.hass}
          .selector=${{navigation:{}}}
          .value=${this.value}
          .disabled=${this.disabled}
          @value-changed=${this._valueChanged}
        ></ha-selector>
      </div>
    `}};_e.styles=a`
    :host {
      display: block;
    }

    .navigation-picker {
      width: 100%;
    }

    .label {
      display: block;
      font-weight: 500;
      color: var(--primary-text-color);
      margin-bottom: 8px;
    }

    .helper {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 8px;
    }

    ha-selector {
      width: 100%;
      display: block;
    }
  `,ye([mt({attribute:!1})],_e.prototype,"hass",void 0),ye([mt()],_e.prototype,"value",void 0),ye([mt()],_e.prototype,"label",void 0),ye([mt()],_e.prototype,"helper",void 0),ye([mt({type:Boolean})],_e.prototype,"disabled",void 0),_e=ye([ct("ultra-navigation-picker")],_e);const xe="1.0.0-alpha4",we=Kt();console.log(`🚀 Ultra Card v${xe} loaded with ${we.getRegistryStats().totalModules} modules`),window.customCards=window.customCards||[],window.customCards.push({type:"ultra-card",name:"Ultra Card",description:"A modular card system for Home Assistant with dynamic layouts and powerful customization options.",preview:!0,documentationURL:"https://github.com/WJDDesigns/Ultra-Card",version:xe}),console.log("✅ Ultra Card registered with Home Assistant card picker")})();