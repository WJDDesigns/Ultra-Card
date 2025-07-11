/*! For license information please see ultra-card.js.LICENSE.txt */
(()=>{"use strict";const e=globalThis,t=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),i=new WeakMap;class n{constructor(e,t,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const o=this.t;if(t&&void 0===e){const t=void 0!==o&&1===o.length;t&&(e=i.get(o)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&i.set(o,e))}return e}toString(){return this.cssText}}const a=(e,...t)=>{const i=1===e.length?e[0]:t.reduce(((t,o,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+e[i+1]),e[0]);return new n(i,e,o)},r=(o,i)=>{if(t)o.adoptedStyleSheets=i.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet));else for(const t of i){const i=document.createElement("style"),n=e.litNonce;void 0!==n&&i.setAttribute("nonce",n),i.textContent=t.cssText,o.appendChild(i)}},l=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const o of e.cssRules)t+=o.cssText;return(e=>new n("string"==typeof e?e:e+"",void 0,o))(t)})(e):e,{is:s,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:p,getOwnPropertySymbols:u,getPrototypeOf:m}=Object,g=globalThis,h=g.trustedTypes,v=h?h.emptyScript:"",b=g.reactiveElementPolyfillSupport,f=(e,t)=>e,y={toAttribute(e,t){switch(t){case Boolean:e=e?v:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let o=e;switch(t){case Boolean:o=null!==e;break;case Number:o=null===e?null:Number(e);break;case Object:case Array:try{o=JSON.parse(e)}catch(e){o=null}}return o}},_=(e,t)=>!s(e,t),x={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:_};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;class w extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=x){if(t.state&&(t.attribute=!1),this._$Ei(),this.elementProperties.set(e,t),!t.noAccessor){const o=Symbol(),i=this.getPropertyDescriptor(e,o,t);void 0!==i&&d(this.prototype,e,i)}}static getPropertyDescriptor(e,t,o){const{get:i,set:n}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get(){return i?.call(this)},set(t){const a=i?.call(this);n.call(this,t),this.requestUpdate(e,a,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??x}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const e=m(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const e=this.properties,t=[...p(e),...u(e)];for(const o of t)this.createProperty(o,e[o])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,o]of t)this.elementProperties.set(e,o)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const o=this._$Eu(e,t);void 0!==o&&this._$Eh.set(o,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const o=new Set(e.flat(1/0).reverse());for(const e of o)t.unshift(l(e))}else void 0!==e&&t.push(l(e));return t}static _$Eu(e,t){const o=t.attribute;return!1===o?void 0:"string"==typeof o?o:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((e=>e(this)))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const o of t.keys())this.hasOwnProperty(o)&&(e.set(o,this[o]),delete this[o]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return r(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((e=>e.hostConnected?.()))}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach((e=>e.hostDisconnected?.()))}attributeChangedCallback(e,t,o){this._$AK(e,o)}_$EC(e,t){const o=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,o);if(void 0!==i&&!0===o.reflect){const n=(void 0!==o.converter?.toAttribute?o.converter:y).toAttribute(t,o.type);this._$Em=e,null==n?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(e,t){const o=this.constructor,i=o._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=o.getPropertyOptions(i),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:y;this._$Em=i,this[i]=n.fromAttribute(t,e.type),this._$Em=null}}requestUpdate(e,t,o){if(void 0!==e){if(o??=this.constructor.getPropertyOptions(e),!(o.hasChanged??_)(this[e],t))return;this.P(e,t,o)}!1===this.isUpdatePending&&(this._$ES=this._$ET())}P(e,t,o){this._$AL.has(e)||this._$AL.set(e,t),!0===o.reflect&&this._$Em!==e&&(this._$Ej??=new Set).add(e)}async _$ET(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,o]of e)!0!==o.wrapped||this._$AL.has(t)||void 0===this[t]||this.P(t,this[t],o)}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach((e=>e.hostUpdate?.())),this.update(t)):this._$EU()}catch(t){throw e=!1,this._$EU(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach((e=>e.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Ej&&=this._$Ej.forEach((e=>this._$EC(e,this[e]))),this._$EU()}updated(e){}firstUpdated(e){}}w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[f("elementProperties")]=new Map,w[f("finalized")]=new Map,b?.({ReactiveElement:w}),(g.reactiveElementVersions??=[]).push("2.0.4");const $=globalThis,k=$.trustedTypes,C=k?k.createPolicy("lit-html",{createHTML:e=>e}):void 0,S="$lit$",I=`lit$${Math.random().toFixed(9).slice(2)}$`,z="?"+I,T=`<${z}>`,P=document,A=()=>P.createComment(""),L=e=>null===e||"object"!=typeof e&&"function"!=typeof e,O=Array.isArray,M=e=>O(e)||"function"==typeof e?.[Symbol.iterator],D="[ \t\n\f\r]",E=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,j=/-->/g,F=/>/g,R=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),U=/'/g,N=/"/g,B=/^(?:script|style|textarea|title)$/i,H=e=>(t,...o)=>({_$litType$:e,strings:t,values:o}),V=H(1),G=(H(2),H(3),Symbol.for("lit-noChange")),W=Symbol.for("lit-nothing"),q=new WeakMap,Y=P.createTreeWalker(P,129);function X(e,t){if(!O(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==C?C.createHTML(t):t}const J=(e,t)=>{const o=e.length-1,i=[];let n,a=2===t?"<svg>":3===t?"<math>":"",r=E;for(let t=0;t<o;t++){const o=e[t];let l,s,d=-1,c=0;for(;c<o.length&&(r.lastIndex=c,s=r.exec(o),null!==s);)c=r.lastIndex,r===E?"!--"===s[1]?r=j:void 0!==s[1]?r=F:void 0!==s[2]?(B.test(s[2])&&(n=RegExp("</"+s[2],"g")),r=R):void 0!==s[3]&&(r=R):r===R?">"===s[0]?(r=n??E,d=-1):void 0===s[1]?d=-2:(d=r.lastIndex-s[2].length,l=s[1],r=void 0===s[3]?R:'"'===s[3]?N:U):r===N||r===U?r=R:r===j||r===F?r=E:(r=R,n=void 0);const p=r===R&&e[t+1].startsWith("/>")?" ":"";a+=r===E?o+T:d>=0?(i.push(l),o.slice(0,d)+S+o.slice(d)+I+p):o+I+(-2===d?t:p)}return[X(e,a+(e[o]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]};class K{constructor({strings:e,_$litType$:t},o){let i;this.parts=[];let n=0,a=0;const r=e.length-1,l=this.parts,[s,d]=J(e,t);if(this.el=K.createElement(s,o),Y.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=Y.nextNode())&&l.length<r;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(S)){const t=d[a++],o=i.getAttribute(e).split(I),r=/([.?@])?(.*)/.exec(t);l.push({type:1,index:n,name:r[2],strings:o,ctor:"."===r[1]?oe:"?"===r[1]?ie:"@"===r[1]?ne:te}),i.removeAttribute(e)}else e.startsWith(I)&&(l.push({type:6,index:n}),i.removeAttribute(e));if(B.test(i.tagName)){const e=i.textContent.split(I),t=e.length-1;if(t>0){i.textContent=k?k.emptyScript:"";for(let o=0;o<t;o++)i.append(e[o],A()),Y.nextNode(),l.push({type:2,index:++n});i.append(e[t],A())}}}else if(8===i.nodeType)if(i.data===z)l.push({type:2,index:n});else{let e=-1;for(;-1!==(e=i.data.indexOf(I,e+1));)l.push({type:7,index:n}),e+=I.length-1}n++}}static createElement(e,t){const o=P.createElement("template");return o.innerHTML=e,o}}function Z(e,t,o=e,i){if(t===G)return t;let n=void 0!==i?o._$Co?.[i]:o._$Cl;const a=L(t)?void 0:t._$litDirective$;return n?.constructor!==a&&(n?._$AO?.(!1),void 0===a?n=void 0:(n=new a(e),n._$AT(e,o,i)),void 0!==i?(o._$Co??=[])[i]=n:o._$Cl=n),void 0!==n&&(t=Z(e,n._$AS(e,t.values),n,i)),t}class Q{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:o}=this._$AD,i=(e?.creationScope??P).importNode(t,!0);Y.currentNode=i;let n=Y.nextNode(),a=0,r=0,l=o[0];for(;void 0!==l;){if(a===l.index){let t;2===l.type?t=new ee(n,n.nextSibling,this,e):1===l.type?t=new l.ctor(n,l.name,l.strings,this,e):6===l.type&&(t=new ae(n,this,e)),this._$AV.push(t),l=o[++r]}a!==l?.index&&(n=Y.nextNode(),a++)}return Y.currentNode=P,i}p(e){let t=0;for(const o of this._$AV)void 0!==o&&(void 0!==o.strings?(o._$AI(e,o,t),t+=o.strings.length-2):o._$AI(e[t])),t++}}class ee{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,o,i){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=o,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Z(this,e,t),L(e)?e===W||null==e||""===e?(this._$AH!==W&&this._$AR(),this._$AH=W):e!==this._$AH&&e!==G&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):M(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==W&&L(this._$AH)?this._$AA.nextSibling.data=e:this.T(P.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:o}=e,i="number"==typeof o?this._$AC(e):(void 0===o.el&&(o.el=K.createElement(X(o.h,o.h[0]),this.options)),o);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new Q(i,this),o=e.u(this.options);e.p(t),this.T(o),this._$AH=e}}_$AC(e){let t=q.get(e.strings);return void 0===t&&q.set(e.strings,t=new K(e)),t}k(e){O(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let o,i=0;for(const n of e)i===t.length?t.push(o=new ee(this.O(A()),this.O(A()),this,this.options)):o=t[i],o._$AI(n),i++;i<t.length&&(this._$AR(o&&o._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e&&e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class te{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,o,i,n){this.type=1,this._$AH=W,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=n,o.length>2||""!==o[0]||""!==o[1]?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=W}_$AI(e,t=this,o,i){const n=this.strings;let a=!1;if(void 0===n)e=Z(this,e,t,0),a=!L(e)||e!==this._$AH&&e!==G,a&&(this._$AH=e);else{const i=e;let r,l;for(e=n[0],r=0;r<n.length-1;r++)l=Z(this,i[o+r],t,r),l===G&&(l=this._$AH[r]),a||=!L(l)||l!==this._$AH[r],l===W?e=W:e!==W&&(e+=(l??"")+n[r+1]),this._$AH[r]=l}a&&!i&&this.j(e)}j(e){e===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class oe extends te{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===W?void 0:e}}class ie extends te{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==W)}}class ne extends te{constructor(e,t,o,i,n){super(e,t,o,i,n),this.type=5}_$AI(e,t=this){if((e=Z(this,e,t,0)??W)===G)return;const o=this._$AH,i=e===W&&o!==W||e.capture!==o.capture||e.once!==o.once||e.passive!==o.passive,n=e!==W&&(o===W||i);i&&this.element.removeEventListener(this.name,this,o),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ae{constructor(e,t,o){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(e){Z(this,e)}}const re={M:S,P:I,A:z,C:1,L:J,R:Q,D:M,V:Z,I:ee,H:te,N:ie,U:ne,B:oe,F:ae},le=$.litHtmlPolyfillSupport;le?.(K,ee),($.litHtmlVersions??=[]).push("3.2.1");class se extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,o)=>{const i=o?.renderBefore??t;let n=i._$litPart$;if(void 0===n){const e=o?.renderBefore??null;i._$litPart$=n=new ee(t.insertBefore(A(),e),e,void 0,o??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}}se._$litElement$=!0,se.finalized=!0,globalThis.litElementHydrateSupport?.({LitElement:se});const de=globalThis.litElementPolyfillSupport;de?.({LitElement:se}),(globalThis.litElementVersions??=[]).push("4.1.1");const ce=e=>(t,o)=>{void 0!==o?o.addInitializer((()=>{customElements.define(e,t)})):customElements.define(e,t)},pe={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:_},ue=(e=pe,t,o)=>{const{kind:i,metadata:n}=o;let a=globalThis.litPropertyMetadata.get(n);if(void 0===a&&globalThis.litPropertyMetadata.set(n,a=new Map),a.set(o.name,e),"accessor"===i){const{name:i}=o;return{set(o){const n=t.get.call(this);t.set.call(this,o),this.requestUpdate(i,n,e)},init(t){return void 0!==t&&this.P(i,void 0,e),t}}}if("setter"===i){const{name:i}=o;return function(o){const n=this[i];t.call(this,o),this.requestUpdate(i,n,e)}}throw Error("Unsupported decorator location: "+i)};function me(e){return(t,o)=>"object"==typeof o?ue(e,t,o):((e,t,o)=>{const i=t.hasOwnProperty(o);return t.constructor.createProperty(o,i?{...e,wrapped:!0}:e),i?Object.getOwnPropertyDescriptor(t,o):void 0})(e,t,o)}function ge(e){return me({...e,state:!0,attribute:!1})}class he{validate(e){const t=[];return e.id||t.push("Module ID is required"),e.type||t.push("Module type is required"),{valid:0===t.length,errors:t}}generateId(e){return`${e}-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}renderFormField(e,t,o){return V`
      <div class="form-field">
        <label class="form-label">${e}</label>
        ${t} ${o?V`<div class="form-description">${o}</div>`:""}
      </div>
    `}renderColorPicker(e,t,o,i){return this.renderFormField(e,V`
        <input
          type="color"
          .value=${t||"#000000"}
          @change=${e=>o(e.target.value)}
        />
      `,i)}renderNumberInput(e,t,o,i={},n){return this.renderFormField(e,V`
        <input
          type="number"
          .value=${t||0}
          min=${i.min||0}
          max=${i.max||1e3}
          step=${i.step||1}
          @input=${e=>o(Number(e.target.value))}
        />
      `,n)}renderTextInput(e,t,o,i,n){return this.renderFormField(e,V`
        <input
          type="text"
          .value=${t||""}
          placeholder=${i||""}
          @input=${e=>o(e.target.value)}
        />
      `,n)}renderEntityPicker(e,t,o,i,n,a,r){return this.renderFormField("",V`
        <ha-form
          .hass=${i}
          .data=${{entity:t||""}}
          .schema=${[{name:"entity",selector:{entity:{}},label:e,description:a||""}]}
          .computeLabel=${e=>e.label||e.name}
          .computeDescription=${e=>e.description||""}
          @value-changed=${e=>o(e.detail.value.entity)}
        ></ha-form>
      `,"")}renderTextArea(e,t,o,i,n){return this.renderFormField(e,V`
        <textarea
          .value=${t||""}
          placeholder=${i||""}
          rows="3"
          @input=${e=>o(e.target.value)}
        ></textarea>
      `,n)}renderSelect(e,t,o,i,n){return this.renderFormField(e,V`
        <select
          .value=${t||""}
          @change=${e=>i(e.target.value)}
        >
          ${o.map((e=>V`<option value="${e.value}">${e.label}</option>`))}
        </select>
      `,n)}renderCheckbox(e,t,o,i){return this.renderFormField("",V`
        <label class="checkbox-wrapper">
          <input
            type="checkbox"
            .checked=${t||!1}
            @change=${e=>o(e.target.checked)}
          />
          ${e}
        </label>
      `,i)}renderConditionalFieldsGroup(e,t){return V`
      <div class="conditional-fields-group">
        <div class="conditional-fields-header">${e}</div>
        <div class="conditional-fields-content">${t}</div>
      </div>
    `}}class ve{static render(e,t,o,i="Link Configuration"){var n,a,r;return V`
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
          ${ve.renderCleanForm(e,{action:(null===(n=t.tap_action)||void 0===n?void 0:n.action)||"default"},[{name:"action",selector:{select:{options:[{value:"default",label:"Default"},{value:"more-info",label:"More info"},{value:"toggle",label:"Toggle"},{value:"navigate",label:"Navigate"},{value:"url",label:"URL"},{value:"perform-action",label:"Perform action"},{value:"assist",label:"Assist"},{value:"nothing",label:"Nothing"}],mode:"dropdown"}}}],(e=>{const i=Object.assign(Object.assign({},t.tap_action),{action:e.detail.value.action});o({tap_action:i})}))}
          ${ve.renderActionFields(e,t.tap_action||{action:"default"},(e=>{const i=Object.assign(Object.assign({},t.tap_action),e);o({tap_action:i})}))}
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
          ${ve.renderCleanForm(e,{action:(null===(a=t.hold_action)||void 0===a?void 0:a.action)||"default"},[{name:"action",selector:{select:{options:[{value:"default",label:"Default"},{value:"more-info",label:"More info"},{value:"toggle",label:"Toggle"},{value:"navigate",label:"Navigate"},{value:"url",label:"URL"},{value:"perform-action",label:"Perform action"},{value:"assist",label:"Assist"},{value:"nothing",label:"Nothing"}],mode:"dropdown"}}}],(e=>{const i=Object.assign(Object.assign({},t.hold_action),{action:e.detail.value.action});o({hold_action:i})}))}
          ${ve.renderActionFields(e,t.hold_action||{action:"default"},(e=>{const i=Object.assign(Object.assign({},t.hold_action),e);o({hold_action:i})}))}
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
          ${ve.renderCleanForm(e,{action:(null===(r=t.double_tap_action)||void 0===r?void 0:r.action)||"default"},[{name:"action",selector:{select:{options:[{value:"default",label:"Default"},{value:"more-info",label:"More info"},{value:"toggle",label:"Toggle"},{value:"navigate",label:"Navigate"},{value:"url",label:"URL"},{value:"perform-action",label:"Perform action"},{value:"assist",label:"Assist"},{value:"nothing",label:"Nothing"}],mode:"dropdown"}}}],(e=>{const i=Object.assign(Object.assign({},t.double_tap_action),{action:e.detail.value.action});o({double_tap_action:i})}))}
          ${ve.renderActionFields(e,t.double_tap_action||{action:"default"},(e=>{const i=Object.assign(Object.assign({},t.double_tap_action),e);o({double_tap_action:i})}))}
        </div>
      </div>
    `}static renderCleanForm(e,t,o,i){return V`
      <div class="ultra-clean-form">
        <ha-form .hass=${e} .data=${t} .schema=${o} @value-changed=${i}></ha-form>
      </div>
    `}static renderActionFields(e,t,o){switch(t.action){case"more-info":case"toggle":return V`
          <div style="margin-top: 16px;">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
              Entity
            </div>
            <div
              class="field-description"
              style="font-size: 12px; font-weight: 400; margin-bottom: 8px; color: var(--secondary-text-color);"
            >
              Select the entity to
              ${"more-info"===t.action?"show more info for":"toggle"}.
            </div>
            ${ve.renderCleanForm(e,{entity:t.entity||""},[{name:"entity",selector:{entity:{}}}],(e=>o({entity:e.detail.value.entity})))}
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
            ${ve.renderNavigationPicker(e,t.navigation_path||"",(e=>o({navigation_path:e})))}
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
            ${ve.renderCleanForm(e,{url_path:t.url_path||""},[{name:"url_path",selector:{text:{}}}],(e=>o({url_path:e.detail.value.url_path})))}
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
            ${ve.renderCleanForm(e,{service:t.service||""},[{name:"service",selector:{text:{}}}],(e=>o({service:e.detail.value.service})))}

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
              ${ve.renderCleanForm(e,{service_data:t.service_data?JSON.stringify(t.service_data,null,2):""},[{name:"service_data",selector:{text:{multiline:!0,type:"text"}}}],(e=>{try{const t=e.detail.value.service_data?JSON.parse(e.detail.value.service_data):void 0;o({service_data:t})}catch(e){}}))}
            </div>
          </div>
        `;default:return V``}}static renderNavigationPicker(e,t,o){const i=[{value:"/lovelace",label:"Overview (/lovelace)"},{value:"/config",label:"Settings (/config)"},{value:"/config/dashboard",label:"Dashboards (/config/dashboard)"},{value:"/config/entities",label:"Entities (/config/entities)"},{value:"/config/devices",label:"Devices (/config/devices)"},{value:"/config/automations",label:"Automations (/config/automations)"},{value:"/config/scripts",label:"Scripts (/config/scripts)"},{value:"/config/scenes",label:"Scenes (/config/scenes)"},{value:"/developer-tools",label:"Developer Tools (/developer-tools)"},...Object.keys(e.panels).filter((t=>e.panels[t].url_path||"lovelace"===t)).map((t=>({value:e.panels[t].url_path||`/lovelace/${t}`,label:`${e.panels[t].title||t} (${e.panels[t].url_path||`/lovelace/${t}`})`})))];return ve.renderCleanForm(e,{navigation_path:t},[{name:"navigation_path",selector:{select:{options:[{value:"",label:"Custom path..."},...i],mode:"dropdown",custom_value:!0}}}],(e=>o(e.detail.value.navigation_path)))}static getDefaultConfig(){return{tap_action:{action:"default"},hold_action:{action:"default"},double_tap_action:{action:"default"}}}static handleAction(e,t,o){switch(e.action){case"more-info":if(e.entity){const t=new CustomEvent("hass-more-info",{bubbles:!0,composed:!0,detail:{entityId:e.entity}});null==o||o.dispatchEvent(t)}break;case"toggle":e.entity&&t.callService("homeassistant","toggle",{entity_id:e.entity});break;case"navigate":if(e.navigation_path){window.history.pushState(null,"",e.navigation_path);const t=new CustomEvent("location-changed",{bubbles:!0,composed:!0,detail:{replace:!1}});window.dispatchEvent(t)}break;case"url":e.url_path&&window.open(e.url_path,"_blank");break;case"perform-action":if(e.service){const[o,i]=e.service.split(".");o&&i&&t.callService(o,i,e.service_data||{})}break;case"assist":const i=new CustomEvent("hass-assist",{bubbles:!0,composed:!0});null==o||o.dispatchEvent(i)}}}class be{static renderCleanForm(e,t,o,i){const n=`clean-form-${Math.random().toString(36).substr(2,9)}`;return setTimeout((()=>{const e=document.getElementById(n);e&&(be.setupFormObserver(e,n),be.aggressiveCleanup(e))}),0),setTimeout((()=>{const e=document.getElementById(n);e&&be.aggressiveCleanup(e)}),100),V`
      <div class="ultra-clean-form" id="${n}">
        <ha-form
          .hass=${e}
          .data=${t}
          .schema=${o}
          @value-changed=${e=>{i(e),setTimeout((()=>{const e=document.getElementById(n);e&&be.aggressiveCleanup(e)}),0)}}
        ></ha-form>
      </div>
    `}static setupFormObserver(e,t){var o;be.activeObservers.has(t)&&(null===(o=be.activeObservers.get(t))||void 0===o||o.disconnect());const i=new MutationObserver((o=>{let i=!1;o.forEach((e=>{"childList"===e.type&&e.addedNodes.forEach((e=>{e.nodeType===Node.ELEMENT_NODE&&(i=!0)}))})),i&&!be.cleanupQueue.has(t)&&(be.cleanupQueue.add(t),setTimeout((()=>{be.aggressiveCleanup(e),be.cleanupQueue.delete(t)}),10))}));i.observe(e,{childList:!0,subtree:!0,characterData:!0}),be.activeObservers.set(t,i),setTimeout((()=>{document.contains(e)||(i.disconnect(),be.activeObservers.delete(t))}),3e4)}static aggressiveCleanup(e){var t;if(!e)return;const o=["action","entity","template_mode","icon","name","value","text","url","path","attribute","state","condition","enabled","disabled","template","mode","type","size","color","style","width","height","radius","opacity","service","data","latitude","longitude","navigation_path","show_icon","label","button"],i=e.querySelector("ha-form");if(!i)return;const n=document.createTreeWalker(i,NodeFilter.SHOW_TEXT,null),a=[];let r;for(;r=n.nextNode();){const e=null===(t=r.textContent)||void 0===t?void 0:t.trim().toLowerCase();e&&o.includes(e)&&a.push(r)}a.forEach((e=>{var t;const o=e.parentElement;if(o){const i=o.querySelector("input, select, ha-entity-picker, ha-selector, mwc-select, mwc-textfield");e.textContent&&e.textContent.trim().length<30&&(i||(null===(t=o.parentElement)||void 0===t?void 0:t.querySelector("input, select, ha-entity-picker, ha-selector")))&&e.remove()}})),i.querySelectorAll("*").forEach((e=>{var t,i;const n=null===(t=e.textContent)||void 0===t?void 0:t.trim().toLowerCase();n&&o.includes(n)&&0===e.children.length&&(null===(i=e.parentElement)||void 0===i?void 0:i.querySelector("input, select, ha-entity-picker, ha-selector"))&&(e.style.cssText="display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; width: 0 !important; margin: 0 !important; padding: 0 !important;")})),['div[role="group"] > div:first-child:not([class])','div[role="group"] > span:first-child:not([class])',".mdc-form-field__label",".mdc-text-field__label",".mdc-select__label","label:not([for])","div:not([class]):not([id])","span:not([class]):not([id])"].forEach((e=>{try{i.querySelectorAll(e).forEach((e=>{var t;const i=null===(t=e.textContent)||void 0===t?void 0:t.trim().toLowerCase();i&&o.includes(i)&&(e.style.cssText="display: none !important;")}))}catch(e){}})),i.querySelectorAll('[class*="mdc-"]').forEach((e=>{var t;const i=null===(t=e.textContent)||void 0===t?void 0:t.trim().toLowerCase();i&&o.includes(i)&&0===e.children.length&&(e.classList.contains("mdc-floating-label")||e.classList.contains("mdc-form-field__label")||e.classList.contains("mdc-text-field__label"))&&(e.style.cssText="display: none !important;")})),setTimeout((()=>{var e;const t=document.createTreeWalker(i,NodeFilter.SHOW_TEXT,null),n=[];let a;for(;a=t.nextNode();){const t=null===(e=a.textContent)||void 0===e?void 0:e.trim().toLowerCase();t&&o.includes(t)&&n.push(a)}n.forEach((e=>{e.parentNode&&(e.textContent="")}))}),50)}static getCleanFormStyles(){return"\n      /* Ultra-aggressive label hiding */\n      .ultra-clean-form ha-form label,\n      .ultra-clean-form ha-form .label,\n      .ultra-clean-form ha-form .mdc-floating-label,\n      .ultra-clean-form ha-form .mdc-text-field__label,\n      .ultra-clean-form ha-form .mdc-select__label,\n      .ultra-clean-form ha-form .mdc-form-field__label,\n      .ultra-clean-form ha-form .ha-form-label,\n      .ultra-clean-form ha-form .mdc-notched-outline__leading,\n      .ultra-clean-form ha-form .mdc-notched-outline__notch,\n      .ultra-clean-form ha-form .mdc-notched-outline__trailing,\n      .ultra-clean-form ha-form .mdc-line-ripple {\n        display: none !important;\n        visibility: hidden !important;\n        opacity: 0 !important;\n        height: 0 !important;\n        width: 0 !important;\n        margin: 0 !important;\n        padding: 0 !important;\n        font-size: 0 !important;\n        line-height: 0 !important;\n      }\n\n      /* Override any existing label styles completely */\n      .ultra-clean-form label,\n      .ultra-clean-form .ultra-clean-form label *,\n      .ultra-clean-form ha-form label,\n      .ultra-clean-form ha-form label * {\n        display: none !important;\n        visibility: hidden !important;\n        opacity: 0 !important;\n        height: 0 !important;\n        width: 0 !important;\n        margin: 0 !important;\n        padding: 0 !important;\n        border: none !important;\n        outline: none !important;\n        background: none !important;\n        font-size: 0 !important;\n        line-height: 0 !important;\n        position: absolute !important;\n        left: -9999px !important;\n        top: -9999px !important;\n        z-index: -1 !important;\n        pointer-events: none !important;\n      }\n\n      /* Hide any text that could be a redundant label */\n      .ultra-clean-form ha-form div:not([class]):not([id]),\n      .ultra-clean-form ha-form span:not([class]):not([id]),\n      .ultra-clean-form ha-form p:not([class]):not([id]) {\n        font-size: 0 !important;\n        line-height: 0 !important;\n        color: transparent !important;\n        height: 0 !important;\n        overflow: hidden !important;\n      }\n\n      /* Make sure form inputs still work */\n      .ultra-clean-form ha-form input,\n      .ultra-clean-form ha-form select,\n      .ultra-clean-form ha-form textarea,\n      .ultra-clean-form ha-form ha-entity-picker,\n      .ultra-clean-form ha-form ha-icon-picker,\n      .ultra-clean-form ha-form ha-selector,\n      .ultra-clean-form ha-form .mdc-text-field,\n      .ultra-clean-form ha-form .mdc-select,\n      .ultra-clean-form ha-form .mdc-switch {\n        font-size: 14px !important;\n        line-height: normal !important;\n        color: var(--primary-text-color) !important;\n        height: auto !important;\n        width: auto !important;\n        margin-top: 0 !important;\n        border-radius: 8px !important;\n      }\n\n      /* Ensure dropdowns work */\n      .ultra-clean-form ha-form .mdc-select__selected-text,\n      .ultra-clean-form ha-form .mdc-select__dropdown-icon {\n        font-size: 14px !important;\n        color: var(--primary-text-color) !important;\n        opacity: 1 !important;\n        height: auto !important;\n        width: auto !important;\n      }\n\n      /* Style field titles and descriptions consistently */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n        color: var(--primary-text-color) !important;\n        margin-bottom: 4px !important;\n        display: block !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        display: block !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n    "}static cleanupRedundantLabels(e){be.aggressiveCleanup(e)}static renderField(e,t,o,i,n,a){return V`
      <div class="form-field-container">
        <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
          ${e}
        </div>
        <div
          class="field-description"
          style="font-size: 13px; font-weight: 400; margin-bottom: 12px; color: var(--secondary-text-color);"
        >
          ${t}
        </div>
        ${be.renderCleanForm(o,i,n,a)}
      </div>
    `}static createSchemaItem(e,t){return{name:e,selector:t}}static renderSection(e,t,o){return V`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
        >
          ${e}
        </div>
        ${t?V`
              <div
                class="field-description"
                style="font-size: 13px; font-weight: 400; margin-bottom: 16px; color: var(--secondary-text-color);"
              >
                ${t}
              </div>
            `:""}
        ${o.map((e=>V`
            <div style="margin-bottom: 16px;">
              ${be.renderField(e.title,e.description,e.hass,e.data,e.schema,e.onChange)}
            </div>
          `))}
      </div>
    `}static injectCleanFormStyles(){return V`
      <style>
        ${be.getCleanFormStyles()}
      </style>
    `}}be.activeObservers=new Map,be.cleanupQueue=new Set;class fe extends he{constructor(){super(...arguments),this.metadata={type:"text",title:"Text Module",description:"Display custom text content",author:"WJD Designs",version:"1.0.0",icon:"mdi:format-text",category:"content",tags:["text","content","typography","template"]},this.clickTimeout=null,this.holdTimeout=null,this.isHolding=!1}createDefault(e){return{id:e||this.generateId("text"),type:"text",text:"Sample Text",link:"",hide_if_no_link:!1,tap_action:{action:"default"},hold_action:{action:"default"},double_tap_action:{action:"default"},icon:"",icon_position:"before",template_mode:!1,template:""}}renderGeneralTab(e,t,o,i){const n=e;return V`
      ${be.injectCleanFormStyles()}
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
          ${be.renderField("Text Content","Enter the text content to display in this module.",t,{text:n.text||""},[be.createSchemaItem("text",{text:{}})],(e=>i({text:e.detail.value.text})))}
        </div>

        <!-- Link Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          ${ve.render(t,{tap_action:n.tap_action||{action:"default"},hold_action:n.hold_action||{action:"default"},double_tap_action:n.double_tap_action||{action:"default"}},(e=>{const t={};e.tap_action&&(t.tap_action=e.tap_action),e.hold_action&&(t.hold_action=e.hold_action),e.double_tap_action&&(t.double_tap_action=e.double_tap_action),i(t)}),"Link Configuration")}
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
          ${be.renderField("Icon","Choose an icon to display alongside the text. Leave empty for no icon.",t,{icon:n.icon||""},[be.createSchemaItem("icon",{icon:{}})],(e=>i({icon:e.detail.value.icon})))}
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
                      <div style="display: flex; gap: 8px; justify-content: flex-start;">
                        <button
                          type="button"
                          style="padding: 8px 12px; border: 2px solid ${"before"===(n.icon_position||"before")?"var(--primary-color)":"var(--divider-color)"}; background: ${"before"===(n.icon_position||"before")?"var(--primary-color)":"transparent"}; color: ${"before"===(n.icon_position||"before")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                          @click=${()=>i({icon_position:"before"})}
                        >
                          <ha-icon icon="mdi:format-align-left" style="font-size: 16px;"></ha-icon>
                          Before Text
                        </button>
                        <button
                          type="button"
                          style="padding: 8px 12px; border: 2px solid ${"after"===(n.icon_position||"before")?"var(--primary-color)":"var(--divider-color)"}; background: ${"after"===(n.icon_position||"before")?"var(--primary-color)":"transparent"}; color: ${"after"===(n.icon_position||"before")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                          @click=${()=>i({icon_position:"after"})}
                        >
                          <ha-icon icon="mdi:format-align-right" style="font-size: 16px;"></ha-icon>
                          After Text
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
            ${be.renderCleanForm(t,{template_mode:n.template_mode||!1},[be.createSchemaItem("template_mode",{boolean:{}})],(e=>i({template_mode:e.detail.value.template_mode})))}
          </div>

          ${n.template_mode?this.renderConditionalFieldsGroup("Template Settings",V`
                  ${be.renderField("Template Code","Enter the Jinja2 template code. Example: {{ states('sensor.temperature') }}°C",t,{template:n.template||""},[be.createSchemaItem("template",{text:{multiline:!0}})],(e=>i({template:e.detail.value.template})))}
                `):V`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  Enable template mode to use dynamic content
                </div>
              `}
        </div>
      </div>
    `}renderPreview(e,t){const o=e;if(o.hide_if_no_link&&!this.hasActiveLink(o))return V`<div class="text-module-hidden">Hidden (no link)</div>`;const i=o,n={fontSize:i.font_size?`${i.font_size}px`:"16px",fontFamily:i.font_family||"Roboto",color:i.color||"var(--primary-text-color)",textAlign:i.text_align||"center",fontWeight:i.font_weight||"normal",fontStyle:i.font_style||"normal",textTransform:i.text_transform||"none",textDecoration:"none",lineHeight:i.line_height||"1.4",letterSpacing:i.letter_spacing||"normal",margin:"0",display:"flex",alignItems:"center",justifyContent:i.text_align||"center",gap:"8px",textShadow:i.text_shadow_h&&i.text_shadow_v?`${i.text_shadow_h||"0"} ${i.text_shadow_v||"0"} ${i.text_shadow_blur||"0"} ${i.text_shadow_color||"rgba(0,0,0,0.5)"}`:"none",boxShadow:i.box_shadow_h&&i.box_shadow_v?`${i.box_shadow_h||"0"} ${i.box_shadow_v||"0"} ${i.box_shadow_blur||"0"} ${i.box_shadow_spread||"0"} ${i.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none"},a=o.icon?V`<ha-icon icon="${o.icon}"></ha-icon>`:"",r=V`<span>${o.text||"Sample Text"}</span>`;let l;l="before"!==o.icon_position&&o.icon_position?"after"===o.icon_position?V`${r}${a}`:r:V`${a}${r}`;const s=this.hasActiveLink(o)?V`<div
          class="text-module-clickable"
          style="color: inherit; text-decoration: inherit; cursor: pointer;"
          @click=${e=>this.handleClick(e,o,t)}
          @dblclick=${e=>this.handleDoubleClick(e,o,t)}
          @mousedown=${e=>this.handleMouseDown(e,o,t)}
          @mouseup=${e=>this.handleMouseUp(e,o,t)}
          @mouseleave=${e=>this.handleMouseLeave(e,o,t)}
          @touchstart=${e=>this.handleTouchStart(e,o,t)}
          @touchend=${e=>this.handleTouchEnd(e,o,t)}
        >
          ${l}
        </div>`:l,d={padding:i.padding_top||i.padding_bottom||i.padding_left||i.padding_right?`${this.addPixelUnit(i.padding_top)||"8px"} ${this.addPixelUnit(i.padding_right)||"0px"} ${this.addPixelUnit(i.padding_bottom)||"8px"} ${this.addPixelUnit(i.padding_left)||"0px"}`:"8px 0",margin:i.margin_top||i.margin_bottom||i.margin_left||i.margin_right?`${this.addPixelUnit(i.margin_top)||"0px"} ${this.addPixelUnit(i.margin_right)||"0px"} ${this.addPixelUnit(i.margin_bottom)||"0px"} ${this.addPixelUnit(i.margin_left)||"0px"}`:"0",background:i.background_color&&"transparent"!==i.background_color?i.background_color:"transparent",backgroundImage:this.getBackgroundImageCSS(i,t),backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",border:i.border_style&&"none"!==i.border_style?`${i.border_width||"1px"} ${i.border_style} ${i.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(i.border_radius)||"0",position:i.position||"static",top:i.top||"auto",bottom:i.bottom||"auto",left:i.left||"auto",right:i.right||"auto",zIndex:i.z_index||"auto",width:i.width||"100%",height:i.height||"auto",maxWidth:i.max_width||"none",maxHeight:i.max_height||"none",minWidth:i.min_width||"none",minHeight:i.min_height||"auto",overflow:i.overflow||"visible",clipPath:i.clip_path||"none",backdropFilter:i.backdrop_filter||"none",boxShadow:i.box_shadow_h&&i.box_shadow_v?`${i.box_shadow_h||"0"} ${i.box_shadow_v||"0"} ${i.box_shadow_blur||"0"} ${i.box_shadow_spread||"0"} ${i.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"};return V`
      <div class="text-module-container" style=${this.styleObjectToCss(d)}>
        <div class="text-module-preview" style=${this.styleObjectToCss(n)}>${s}</div>
      </div>
    `}validate(e){const t=e,o=[...super.validate(e).errors];if(t.text&&""!==t.text.trim()||o.push("Text content is required"),t.icon&&""!==t.icon.trim()&&(t.icon.includes(":")||o.push('Icon must be in format "mdi:icon-name" or "hass:icon-name"')),t.link&&""!==t.link.trim())try{new URL(t.link)}catch(e){t.link.startsWith("/")||t.link.startsWith("#")||o.push('Link must be a valid URL or start with "/" for relative paths')}return t.tap_action&&"default"!==t.tap_action.action&&"nothing"!==t.tap_action.action&&o.push(...this.validateAction(t.tap_action)),t.hold_action&&"default"!==t.hold_action.action&&"nothing"!==t.hold_action.action&&o.push(...this.validateAction(t.hold_action)),t.double_tap_action&&"default"!==t.double_tap_action.action&&"nothing"!==t.double_tap_action.action&&o.push(...this.validateAction(t.double_tap_action)),!t.template_mode||t.template&&""!==t.template.trim()||o.push("Template code is required when template mode is enabled"),{valid:0===o.length,errors:o}}hasActiveLink(e){const t=e.link&&""!==e.link.trim(),o=e.tap_action&&"default"!==e.tap_action.action&&"nothing"!==e.tap_action.action,i=e.hold_action&&"default"!==e.hold_action.action&&"nothing"!==e.hold_action.action,n=e.double_tap_action&&"default"!==e.double_tap_action.action&&"nothing"!==e.double_tap_action.action;return t||o||i||n}validateAction(e){const t=[];switch(e.action){case"more-info":case"toggle":e.entity||t.push(`Entity is required for ${e.action} action`);break;case"navigate":e.navigation_path||t.push("Navigation path is required for navigate action");break;case"url":e.url_path||t.push("URL path is required for url action");break;case"perform-action":e.service||t.push("Service is required for perform-action")}return t}handleClick(e,t,o){e.preventDefault(),this.clickTimeout&&clearTimeout(this.clickTimeout),this.clickTimeout=setTimeout((()=>{this.handleTapAction(e,t,o)}),300)}handleDoubleClick(e,t,o){e.preventDefault(),this.clickTimeout&&(clearTimeout(this.clickTimeout),this.clickTimeout=null),this.handleDoubleAction(e,t,o)}handleMouseDown(e,t,o){this.startHold(e,t,o)}handleMouseUp(e,t,o){this.endHold(e,t,o)}handleMouseLeave(e,t,o){this.endHold(e,t,o)}handleTouchStart(e,t,o){this.startHold(e,t,o)}handleTouchEnd(e,t,o){this.endHold(e,t,o)}startHold(e,t,o){this.isHolding=!1,this.holdTimeout=setTimeout((()=>{this.isHolding=!0,this.handleHoldAction(e,t,o)}),500)}endHold(e,t,o){this.holdTimeout&&(clearTimeout(this.holdTimeout),this.holdTimeout=null),this.isHolding=!1}handleTapAction(e,t,o){this.isHolding||(t.link&&""!==t.link.trim()?t.link.startsWith("http")||t.link.startsWith("https")?window.open(t.link,"_blank"):window.location.href=t.link:t.tap_action&&"default"!==t.tap_action.action&&"nothing"!==t.tap_action.action&&ve.handleAction(t.tap_action,o,e.target))}handleDoubleAction(e,t,o){t.double_tap_action&&"default"!==t.double_tap_action.action&&"nothing"!==t.double_tap_action.action&&ve.handleAction(t.double_tap_action,o,e.target)}handleHoldAction(e,t,o){t.hold_action&&"default"!==t.hold_action.action&&"nothing"!==t.hold_action.action&&ve.handleAction(t.hold_action,o,e.target)}getStyles(){return"\n      .text-module-preview {\n        min-height: 20px;\n        word-wrap: break-word;\n      }\n      \n      .text-module-hidden {\n        color: var(--secondary-text-color);\n        font-style: italic;\n        text-align: center;\n        padding: 12px;\n        background: var(--secondary-background-color);\n        border-radius: 4px;\n      }\n      \n      /* Field styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n        color: var(--primary-text-color) !important;\n        margin-bottom: 4px !important;\n        display: block !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        display: block !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      .settings-section {\n        margin-bottom: 16px;\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Conditional Fields Grouping CSS */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n      }\n\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      @keyframes slideInFromLeft {\n        from { \n          opacity: 0; \n          transform: translateX(-10px); \n        }\n        to { \n          opacity: 1; \n          transform: translateX(0); \n        }\n      }\n\n      /* Icon picker specific styling */\n      ha-icon-picker {\n        --ha-icon-picker-width: 100%;\n        --ha-icon-picker-height: 56px;\n      }\n\n      /* Text field and select consistency */\n      ha-textfield,\n      ha-select {\n        --mdc-shape-small: 8px;\n        --mdc-theme-primary: var(--primary-color);\n      }\n\n      code {\n        background: var(--secondary-background-color);\n        padding: 2px 6px;\n        border-radius: 4px;\n        font-family: 'Courier New', monospace;\n        font-size: 0.9em;\n        color: var(--primary-color);\n      }\n    "}getBackgroundImageCSS(e,t){const o=e.background_image_type,i=e.background_image,n=e.background_image_entity;switch(o){case"upload":if(i)return i.startsWith("/api/image/serve/")?`url("${this.getImageUrl(t,i)}")`:(i.startsWith("data:image/"),`url("${i}")`);break;case"entity":if(n&&t){const e=t.states[n];if(e){const t=e.attributes.entity_picture||e.attributes.image||e.state;if(t&&"unknown"!==t&&"unavailable"!==t)return`url("${t}")`}}break;case"url":if(i)return`url("${i}")`;break;default:return"none"}return"none"}getImageUrl(e,t){if(!t)return"";if(t.startsWith("http"))return t;if(t.startsWith("data:image/"))return t;if(t.includes("/api/image/serve/")){const o=t.match(/\/api\/image\/serve\/([^\/]+)/);if(o&&o[1]){const i=o[1];try{return`${(e.hassUrl?e.hassUrl():"").replace(/\/$/,"")}/api/image/serve/${i}/original`}catch(e){return t}}return t}return t.startsWith("/")?`${(e.hassUrl?e.hassUrl():"").replace(/\/$/,"")}${t}`:t}styleObjectToCss(e){return Object.entries(e).map((([e,t])=>`${this.camelToKebab(e)}: ${t}`)).join("; ")}camelToKebab(e){return e.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}addPixelUnit(e){return e?/^\d+$/.test(e)?`${e}px`:/^[\d\s]+$/.test(e)?e.split(" ").map((e=>e.trim()?`${e}px`:e)).join(" "):e:e}}class ye extends he{constructor(){super(...arguments),this.metadata={type:"separator",title:"Separator Module",description:"Visual dividers and spacing",author:"WJD Designs",version:"1.0.0",icon:"mdi:minus",category:"layout",tags:["separator","divider","spacing","layout"]}}createDefault(e){return{id:e||this.generateId("separator"),type:"separator",separator_style:"line",thickness:1,width_percent:100,color:"var(--divider-color)",show_title:!1,title:"",title_size:14,title_color:"var(--secondary-text-color)",title_bold:!1,title_italic:!1,title_uppercase:!1,title_strikethrough:!1,title_underline:!1}}renderGeneralTab(e,t,o,i){const n=e;return V`
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
            .hass=${t}
            .data=${{separator_style:n.separator_style||"line"}}
            .schema=${[{name:"separator_style",selector:{select:{options:[{value:"line",label:"Solid Line"},{value:"double_line",label:"Double Line"},{value:"dotted",label:"Dotted Line"},{value:"double_dotted",label:"Double Dotted"},{value:"shadow",label:"Shadow"},{value:"blank",label:"Blank Space"}],mode:"dropdown"}},label:""}]}
            @value-changed=${e=>i({separator_style:e.detail.value.separator_style})}
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
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Thickness (px)
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    Thickness of the separator line.
                  </div>
                  <ha-form
                    .hass=${t}
                    .data=${{thickness:n.thickness||1}}
                    .schema=${[{name:"thickness",selector:{number:{min:1,max:20,step:1,mode:"slider"}},label:""}]}
                    @value-changed=${e=>i({thickness:e.detail.value.thickness})}
                  ></ha-form>
                </div>

                <!-- Width -->
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Width (%)
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    Width of the separator as percentage of container.
                  </div>
                  <ha-form
                    .hass=${t}
                    .data=${{width_percent:n.width_percent||100}}
                    .schema=${[{name:"width_percent",selector:{number:{min:10,max:100,step:5,mode:"slider"}},label:""}]}
                    @value-changed=${e=>i({width_percent:e.detail.value.width_percent})}
                  ></ha-form>
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
                    .hass=${t}
                    @value-changed=${e=>{const t=e.detail.value;i({color:t})}}
                  ></ultra-color-picker>
                </div>
              </div>
            `:""}

        <!-- Text in Separator -->
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
              Text in Separator
            </div>
            <ha-form
              .hass=${t}
              .data=${{show_title:n.show_title||!1}}
              .schema=${[{name:"show_title",selector:{boolean:{}},label:""}]}
              @value-changed=${e=>i({show_title:e.detail.value.show_title})}
            ></ha-form>
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 16px;"
          >
            Add text in the middle of the separator line (e.g., ------ Text ------).
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
                    .hass=${t}
                    .data=${{title:n.title||""}}
                    .schema=${[{name:"title",selector:{text:{}},label:""}]}
                    @value-changed=${e=>i({title:e.detail.value.title})}
                  ></ha-form>
                </div>

                <!-- Font Size -->
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Font Size
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    Size of the text in pixels.
                  </div>
                  <ha-form
                    .hass=${t}
                    .data=${{title_size:n.title_size||14}}
                    .schema=${[{name:"title_size",selector:{number:{min:8,max:48,step:1,mode:"slider"}},label:""}]}
                    @value-changed=${e=>i({title_size:e.detail.value.title_size})}
                  ></ha-form>
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
                    .hass=${t}
                    @value-changed=${e=>{const t=e.detail.value;i({title_color:t})}}
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
                  <div class="format-buttons" style="display: flex; gap: 8px;">
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
    `}renderPreview(e,t){const o=e,i=o,n={padding:i.padding_top||i.padding_bottom||i.padding_left||i.padding_right?`${i.padding_top||"8"}px ${i.padding_right||"0"}px ${i.padding_bottom||"8"}px ${i.padding_left||"0"}px`:"8px 0",margin:i.margin_top||i.margin_bottom||i.margin_left||i.margin_right?`${i.margin_top||"0"}px ${i.margin_right||"0"}px ${i.margin_bottom||"0"}px ${i.margin_left||"0"}px`:"0",background:i.background_color||"transparent",backgroundImage:this.getBackgroundImageCSS(i,t),backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",border:i.border_style&&"none"!==i.border_style?`${i.border_width||"1px"} ${i.border_style} ${i.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(i.border_radius)||"0",position:i.position||"relative",top:i.top||"auto",bottom:i.bottom||"auto",left:i.left||"auto",right:i.right||"auto",zIndex:i.z_index||"auto",width:i.width||"100%",height:i.height||"auto",maxWidth:i.max_width||"100%",maxHeight:i.max_height||"none",minWidth:i.min_width||"none",minHeight:i.min_height||"auto",overflow:i.overflow||"visible",clipPath:i.clip_path||"none",backdropFilter:i.backdrop_filter||"none",boxShadow:i.box_shadow_h&&i.box_shadow_v?`${i.box_shadow_h||"0"} ${i.box_shadow_v||"0"} ${i.box_shadow_blur||"0"} ${i.box_shadow_spread||"0"} ${i.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"};if("blank"===o.separator_style)return V`
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
    `}validate(e){const t=e,o=[...super.validate(e).errors];return t.thickness&&(t.thickness<1||t.thickness>50)&&o.push("Thickness must be between 1 and 50 pixels"),t.width_percent&&(t.width_percent<1||t.width_percent>100)&&o.push("Width must be between 1 and 100 percent"),!t.show_title||t.title&&""!==t.title.trim()||o.push("Title text is required when show title is enabled"),{valid:0===o.length,errors:o}}getStyles(){return"\n      .separator-preview {\n        min-height: 20px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n      }\n      \n      .blank-separator {\n        background: transparent;\n        border: 1px dashed var(--divider-color);\n        opacity: 0.5;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        min-height: 20px;\n      }\n      \n      .separator-with-title {\n        position: relative;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        width: 100%;\n      }\n      \n      .separator-title {\n        margin: 0;\n        line-height: 1.2;\n        background: var(--card-background-color);\n        padding: 0 8px;\n        position: relative;\n        z-index: 1;\n        white-space: nowrap;\n      }\n      \n      .separator-line,\n      .separator-line-left,\n      .separator-line-right {\n        display: block;\n      }\n      \n      .separator-line-left,\n      .separator-line-right {\n        flex: 1;\n      }\n      \n      /* Format button styles */\n      .format-buttons {\n        display: flex;\n        gap: 8px;\n        flex-wrap: wrap;\n      }\n      \n      .format-btn {\n        padding: 8px;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        min-width: 36px;\n        min-height: 36px;\n      }\n      \n      .format-btn:hover {\n        transform: translateY(-1px);\n        box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n      }\n      \n      .format-btn ha-icon {\n        font-size: 16px;\n      }\n      \n      /* Settings section styling */\n      .settings-section {\n        background: var(--secondary-background-color);\n        border-radius: 8px;\n        padding: 16px;\n        margin-bottom: 32px;\n      }\n      \n      .section-title {\n        font-size: 18px;\n        font-weight: 700;\n        text-transform: uppercase;\n        color: var(--primary-color);\n        margin-bottom: 16px;\n        padding-bottom: 0;\n        border-bottom: none;\n        letter-spacing: 0.5px;\n      }\n      \n      .field-title {\n        font-size: 16px;\n        font-weight: 600;\n        margin-bottom: 4px;\n      }\n      \n      .field-description {\n        font-size: 13px;\n        font-weight: 400;\n        margin-bottom: 12px;\n        color: var(--secondary-text-color);\n      }\n      \n      .field-group {\n        margin-bottom: 16px;\n      }\n    "}getSeparatorStyles(e){const t={width:`${e.width_percent||100}%`,height:`${e.thickness||1}px`,margin:"0 auto"};switch(e.separator_style){case"line":t.backgroundColor=e.color||"var(--divider-color)";break;case"double_line":t.borderTop=`${e.thickness||1}px solid ${e.color||"var(--divider-color)"}`,t.borderBottom=`${e.thickness||1}px solid ${e.color||"var(--divider-color)"}`,t.height=3*(e.thickness||1)+"px";break;case"dotted":t.borderTop=`${e.thickness||1}px dotted ${e.color||"var(--divider-color)"}`,t.height="0";break;case"double_dotted":t.borderTop=`${e.thickness||1}px dotted ${e.color||"var(--divider-color)"}`,t.borderBottom=`${e.thickness||1}px dotted ${e.color||"var(--divider-color)"}`,t.height=3*(e.thickness||1)+"px";break;case"shadow":t.boxShadow=`0 ${e.thickness||1}px ${2*(e.thickness||1)}px ${e.color||"rgba(0,0,0,0.2)"}`,t.height="0"}return Object.entries(t).map((([e,t])=>`${this.camelToKebab(e)}: ${t}`)).join("; ")}getSeparatorLineStyles(e,t){const o={flex:"1",height:`${e.thickness||1}px`,margin:"0"};switch(e.separator_style){case"line":o.backgroundColor=e.color||"var(--divider-color)";break;case"double_line":o.borderTop=`${e.thickness||1}px solid ${e.color||"var(--divider-color)"}`,o.borderBottom=`${e.thickness||1}px solid ${e.color||"var(--divider-color)"}`,o.height=3*(e.thickness||1)+"px";break;case"dotted":o.borderTop=`${e.thickness||1}px dotted ${e.color||"var(--divider-color)"}`,o.height="0";break;case"double_dotted":o.borderTop=`${e.thickness||1}px dotted ${e.color||"var(--divider-color)"}`,o.borderBottom=`${e.thickness||1}px dotted ${e.color||"var(--divider-color)"}`,o.height=3*(e.thickness||1)+"px";break;case"shadow":o.boxShadow=`0 ${e.thickness||1}px ${2*(e.thickness||1)}px ${e.color||"rgba(0,0,0,0.2)"}`,o.height="0"}return Object.entries(o).map((([e,t])=>`${this.camelToKebab(e)}: ${t}`)).join("; ")}getTitleStyles(e){const t={fontSize:`${e.title_size||14}px`,color:e.title_color||"var(--secondary-text-color)",fontWeight:e.title_bold?"bold":"normal",fontStyle:e.title_italic?"italic":"normal",textTransform:e.title_uppercase?"uppercase":"none",margin:"0",padding:"0 8px",backgroundColor:"var(--card-background-color)",position:"relative",zIndex:"1"},o=[];return e.title_strikethrough&&o.push("line-through"),e.title_underline&&o.push("underline"),t.textDecoration=o.length>0?o.join(" "):"none",Object.entries(t).map((([e,t])=>`${this.camelToKebab(e)}: ${t}`)).join("; ")}camelToKebab(e){return e.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}getBackgroundImageCSS(e,t){var o,i;if(!e.background_image_type||"none"===e.background_image_type)return"none";switch(e.background_image_type){case"upload":case"url":if(e.background_image)return`url("${e.background_image}")`;break;case"entity":if(e.background_image_entity&&(null==t?void 0:t.states[e.background_image_entity])){const n=t.states[e.background_image_entity];let a="";if((null===(o=n.attributes)||void 0===o?void 0:o.entity_picture)?a=n.attributes.entity_picture:(null===(i=n.attributes)||void 0===i?void 0:i.image)?a=n.attributes.image:n.state&&"string"==typeof n.state&&(n.state.startsWith("/")||n.state.startsWith("http"))&&(a=n.state),a)return a.startsWith("/local/")||a.startsWith("/media/")||a.startsWith("/"),`url("${a}")`}}return"none"}styleObjectToCss(e){return Object.entries(e).map((([e,t])=>`${e.replace(/[A-Z]/g,(e=>`-${e.toLowerCase()}`))}: ${t}`)).join("; ")}addPixelUnit(e){return e?/^\d+$/.test(e)?`${e}px`:/^[\d\s]+$/.test(e)?e.split(" ").map((e=>e.trim()?`${e}px`:e)).join(" "):e:e}}var _e=function(e,t,o,i){var n,a=arguments.length,r=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,i);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(r=(a<3?n(r):a>3?n(t,o,r):n(t,o))||r);return a>3&&r&&Object.defineProperty(t,o,r),r};const xe=["#000000","#333333","#666666","#999999","#CCCCCC","#FFFFFF","#FF0000","#FF3333","#FF6666","#FF9999","#FFCCCC","#FF6600","#FF8833","#FFAA66","#FFCC99","#FFE6CC","#FFFF00","#FFFF33","#FFFF66","#FFFF99","#FFFFCC","#00FF00","#33FF33","#66FF66","#99FF99","#CCFFCC","#0000FF","#3333FF","#6666FF","#9999FF","#CCCCFF","#9900FF","#AA33FF","#BB66FF","#CC99FF","#DDCCFF","var(--primary-color)","var(--accent-color)","var(--error-color)","var(--warning-color)","var(--success-color)","var(--info-color)","var(--primary-text-color)","var(--secondary-text-color)","var(--disabled-text-color)","var(--divider-color)"];let we=class extends se{constructor(){super(...arguments),this.disabled=!1,this._showPalette=!1}firstUpdated(){this._currentValue=this.value,this._textInputValue=this.value,document.addEventListener("click",this._handleDocumentClick.bind(this))}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._handleDocumentClick.bind(this))}_handleDocumentClick(e){var t;if(!this._showPalette)return;const o=e.target;(null===(t=this.shadowRoot)||void 0===t?void 0:t.contains(o))||o instanceof HTMLInputElement&&"color"===o.type||(this._showPalette=!1)}updated(e){e.has("value")&&(this._currentValue=this.value,this._textInputValue=this.value)}_togglePalette(e){e.stopPropagation(),this.disabled||(this._showPalette=!this._showPalette,console.log(`🎨 UltraColorPicker: Toggled palette to ${this._showPalette}`))}_selectColor(e,t){t.stopPropagation(),this._currentValue=e,this._showPalette=!1;const o=new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0});this.dispatchEvent(o)}_handleNativeColorChange(e){e.stopPropagation();const t=e.target.value;this._selectColor(t,e)}_handleTextInputChange(e){const t=e.target;this._textInputValue=t.value}_handleTextInputKeyDown(e){"Enter"===e.key?(e.preventDefault(),this._applyTextInputValue()):"Escape"===e.key&&(e.preventDefault(),this._textInputValue=this._currentValue,this._showPalette=!1)}_applyTextInputValue(){void 0!==this._textInputValue&&this._selectColor(this._textInputValue,new Event("change"))}_isValidColor(e){return!!e&&([/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/,/^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/,/^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/,/^var\(--[\w-]+\)$/].some((t=>t.test(e)))||["transparent","red","blue","green","yellow","orange","purple","pink","brown","black","white","gray","grey"].includes(e.toLowerCase()))}_resetToDefault(){const e=this.defaultValue||"";this._currentValue=e;const t=new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0});this.dispatchEvent(t)}_getDisplayValue(){return this._currentValue&&""!==this._currentValue?this._currentValue:this.defaultValue||""}_getColorForNativeInput(){const e=this._getDisplayValue();if(e.startsWith("var(--")){const t=document.createElement("div");t.style.color=e,document.body.appendChild(t);const o=getComputedStyle(t).color;if(document.body.removeChild(t),o&&o.startsWith("rgb")){const e=o.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);if(e){const[t,o,i,n]=e,a=e=>e.toString(16).padStart(2,"0");return`#${a(parseInt(o))}${a(parseInt(i))}${a(parseInt(n))}`}}return e.includes("--primary-color")?"#03a9f4":e.includes("--primary-text-color")?"#ffffff":"#000000"}return e.startsWith("#")?e:"#000000"}_isDefaultValue(){return!this._currentValue||""===this._currentValue||this._currentValue===this.defaultValue}render(){const e=this._getDisplayValue(),t=this._getColorForNativeInput();return V`
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
            @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._togglePalette(e))}}
          >
            <span class="color-value">${e}</span>
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
                        .value=${t}
                        @change=${this._handleNativeColorChange}
                        @click=${e=>e.stopPropagation()}
                        @focus=${e=>e.stopPropagation()}
                        @blur=${e=>e.stopPropagation()}
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
                      @click=${e=>{e.stopPropagation(),this._applyTextInputValue()}}
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
                  ${xe.map((e=>V`
                      <div
                        class="color-swatch ${this._currentValue===e?"selected":""}"
                        style="background-color: ${e}"
                        @click=${t=>this._selectColor(e,t)}
                        title="${e}"
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
    `}};_e([me({attribute:!1})],we.prototype,"hass",void 0),_e([me()],we.prototype,"value",void 0),_e([me()],we.prototype,"label",void 0),_e([me()],we.prototype,"defaultValue",void 0),_e([me({type:Boolean})],we.prototype,"disabled",void 0),_e([ge()],we.prototype,"_currentValue",void 0),_e([ge()],we.prototype,"_showPalette",void 0),_e([ge()],we.prototype,"_textInputValue",void 0),we=_e([ce("ultra-color-picker")],we);class $e extends he{constructor(){super(...arguments),this.metadata={type:"image",title:"Images",description:"Display images and photos",author:"WJD Designs",version:"1.0.0",icon:"mdi:image",category:"media",tags:["image","picture","media","photo"]}}createDefault(e){return{id:e||this.generateId("image"),type:"image",image_type:"default",image_url:"",entity:"",image_entity:"",image_attribute:"",width:100,height:200,aspect_ratio:"auto",object_fit:"cover",alignment:"center",tap_action:{action:"default"},hold_action:{action:"default"},double_tap_action:{action:"default"},filter_blur:0,filter_brightness:100,filter_contrast:100,filter_saturate:100,filter_hue_rotate:0,filter_opacity:100,border_radius:8,border_width:0,border_color:"var(--divider-color)",box_shadow:"none",hover_enabled:!1,hover_effect:"scale",hover_scale:105,hover_rotate:5,hover_opacity:90,hover_blur:0,hover_brightness:110,hover_shadow:"none",hover_translate_x:0,hover_translate_y:0,hover_transition:300}}renderGeneralTab(e,t,o,i){const n=e;return V`
      ${be.injectCleanFormStyles()}
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
          ${be.renderField("Image Source Type","Choose how you want to specify the image source.",t,{image_type:n.image_type||"default"},[be.createSchemaItem("image_type",{select:{options:[{value:"default",label:"Default Image"},{value:"url",label:"Image URL"},{value:"upload",label:"Upload Image"},{value:"entity",label:"Entity Image"},{value:"attribute",label:"Entity Attribute"}],mode:"dropdown"}})],(e=>i({image_type:e.detail.value.image_type})))}

          <!-- URL Image Source -->
          ${"url"===n.image_type?this.renderConditionalFieldsGroup("Image URL Configuration",V`
                  ${be.renderField("Image URL","Enter the direct URL to the image you want to display.",t,{image_url:n.image_url||""},[be.createSchemaItem("image_url",{text:{}})],(e=>i({image_url:e.detail.value.image_url})))}
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
                    @change=${e=>this.handleFileUpload(e,i)}
                  />
                `):""}

          <!-- Entity Image Source -->
          ${"entity"===n.image_type?this.renderConditionalFieldsGroup("Entity Image Configuration",V`
                  ${be.renderField("Entity","Select an entity that has an image (e.g., person, camera entities).",t,{image_entity:n.image_entity||""},[be.createSchemaItem("image_entity",{entity:{}})],(e=>i({image_entity:e.detail.value.image_entity})))}
                `):""}

          <!-- Attribute Image Source -->
          ${"attribute"===n.image_type?this.renderConditionalFieldsGroup("Entity Attribute Configuration",V`
                  ${be.renderField("Entity","Select the entity that contains the image URL in one of its attributes.",t,{image_entity:n.image_entity||""},[be.createSchemaItem("image_entity",{entity:{}})],(e=>i({image_entity:e.detail.value.image_entity})))}

                  <div style="margin-top: 16px;">
                    ${be.renderField("Attribute Name","Enter the name of the attribute that contains the image URL.",t,{image_attribute:n.image_attribute||""},[be.createSchemaItem("image_attribute",{text:{}})],(e=>i({image_attribute:e.detail.value.image_attribute})))}
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
            ${be.renderField("Width (%)","Set the width as a percentage of the container.",t,{width:n.width||100},[be.createSchemaItem("width",{number:{min:10,max:100,step:5,mode:"slider"}})],(e=>i({width:e.detail.value.width})))}
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
                      style="padding: 8px 12px; border: 2px solid ${"left"===(n.alignment||"center")?"var(--primary-color)":"var(--divider-color)"}; background: ${"left"===(n.alignment||"center")?"var(--primary-color)":"transparent"}; color: ${"left"===(n.alignment||"center")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                      @click=${()=>i({alignment:"left"})}
                    >
                      <ha-icon icon="mdi:format-align-left" style="font-size: 16px;"></ha-icon>
                      Left
                    </button>
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${"center"===(n.alignment||"center")?"var(--primary-color)":"var(--divider-color)"}; background: ${"center"===(n.alignment||"center")?"var(--primary-color)":"transparent"}; color: ${"center"===(n.alignment||"center")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                      @click=${()=>i({alignment:"center"})}
                    >
                      <ha-icon icon="mdi:format-align-center" style="font-size: 16px;"></ha-icon>
                      Center
                    </button>
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${"right"===(n.alignment||"center")?"var(--primary-color)":"var(--divider-color)"}; background: ${"right"===(n.alignment||"center")?"var(--primary-color)":"transparent"}; color: ${"right"===(n.alignment||"center")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                      @click=${()=>i({alignment:"right"})}
                    >
                      <ha-icon icon="mdi:format-align-right" style="font-size: 16px;"></ha-icon>
                      Right
                    </button>
                  </div>
                </div>
              `:""}

          <!-- Height -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${be.renderField("Height (px)","Set the height in pixels.",t,{height:n.height||200},[be.createSchemaItem("height",{number:{min:50,max:800,step:10,mode:"slider"}})],(e=>i({height:e.detail.value.height})))}
          </div>

          <!-- Object Fit -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${be.renderField("Crop & Fit","Control how the image fits within its container.",t,{object_fit:n.object_fit||"cover"},[be.createSchemaItem("object_fit",{select:{options:[{value:"cover",label:"Cover (crop to fill)"},{value:"contain",label:"Contain (fit entire image)"},{value:"fill",label:"Fill (stretch to fit)"},{value:"scale-down",label:"Scale Down"},{value:"none",label:"None (original size)"}],mode:"dropdown"}})],(e=>i({object_fit:e.detail.value.object_fit})))}
          </div>

          <!-- Border Radius -->
          <div class="field-group">
            ${be.renderField("Border Radius","Control the rounded corners of the image.",t,{border_radius:n.border_radius||8},[be.createSchemaItem("border_radius",{number:{min:0,max:50,step:1,mode:"slider"}})],(e=>i({border_radius:e.detail.value.border_radius})))}
          </div>
        </div>

        <!-- Tap Actions Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          ${ve.render(t,{tap_action:n.tap_action||{action:"default"},hold_action:n.hold_action||{action:"default"},double_tap_action:n.double_tap_action||{action:"default"}},(e=>{i(e)}),"Tap Actions")}
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
            ${be.renderField("Blur","Apply a blur effect to your image.",t,{filter_blur:n.filter_blur||0},[be.createSchemaItem("filter_blur",{number:{min:0,max:10,step:.1,mode:"slider"}})],(e=>i({filter_blur:e.detail.value.filter_blur})))}
          </div>

          <!-- Brightness -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${be.renderField("Brightness (%)","Adjust the brightness of your image.",t,{filter_brightness:n.filter_brightness||100},[be.createSchemaItem("filter_brightness",{number:{min:0,max:200,step:5,mode:"slider"}})],(e=>i({filter_brightness:e.detail.value.filter_brightness})))}
          </div>

          <!-- Contrast -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${be.renderField("Contrast (%)","Modify the contrast of your image.",t,{filter_contrast:n.filter_contrast||100},[be.createSchemaItem("filter_contrast",{number:{min:0,max:200,step:5,mode:"slider"}})],(e=>i({filter_contrast:e.detail.value.filter_contrast})))}
          </div>

          <!-- Saturation -->
          <div class="field-group">
            ${be.renderField("Saturation (%)","Adjust the saturation of your image.",t,{filter_saturate:n.filter_saturate||100},[be.createSchemaItem("filter_saturate",{number:{min:0,max:200,step:5,mode:"slider"}})],(e=>i({filter_saturate:e.detail.value.filter_saturate})))}
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
            ${be.renderField("Hover Effects Enabled","Enable hover effects for this image.",t,{enabled:n.hover_enabled||!1},[be.createSchemaItem("enabled",{boolean:{}})],(e=>i({hover_enabled:e.detail.value.enabled})))}
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
                    ${be.renderField("Effect Type","Choose the type of hover effect.",t,{effect:n.hover_effect||"scale"},[be.createSchemaItem("effect",{select:{options:[{value:"scale",label:"Scale (zoom in/out)"},{value:"rotate",label:"Rotate"},{value:"fade",label:"Fade (opacity change)"},{value:"blur",label:"Blur"},{value:"brightness",label:"Brightness"},{value:"glow",label:"Glow (box shadow)"},{value:"slide",label:"Slide (translate)"}],mode:"dropdown"}})],(e=>i({hover_effect:e.detail.value.effect})))}
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
                          ${be.renderField("Scale (%)","Adjust the scale of the image on hover.",t,{scale:n.hover_scale||105},[be.createSchemaItem("scale",{number:{min:50,max:150,step:5,mode:"slider"}})],(e=>i({hover_scale:e.detail.value.scale})))}
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
                          ${be.renderField("Rotation (°)","Rotate the image on hover.",t,{rotate:n.hover_rotate||5},[be.createSchemaItem("rotate",{number:{min:-180,max:180,step:5,mode:"slider"}})],(e=>i({hover_rotate:e.detail.value.rotate})))}
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
                          ${be.renderField("Opacity (%)","Change the opacity of the image on hover.",t,{opacity:n.hover_opacity||90},[be.createSchemaItem("opacity",{number:{min:0,max:100,step:5,mode:"slider"}})],(e=>i({hover_opacity:e.detail.value.opacity})))}
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
                          ${be.renderField("Blur (px)","Apply a blur effect to the image on hover.",t,{blur:n.hover_blur||2},[be.createSchemaItem("blur",{number:{min:0,max:10,step:.5,mode:"slider"}})],(e=>i({hover_blur:e.detail.value.blur})))}
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
                          ${be.renderField("Brightness (%)","Adjust the brightness of the image on hover.",t,{brightness:n.hover_brightness||110},[be.createSchemaItem("brightness",{number:{min:50,max:200,step:5,mode:"slider"}})],(e=>i({hover_brightness:e.detail.value.brightness})))}
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
                          ${be.renderField("Glow Intensity","Choose the intensity of the glow effect on hover.",t,{shadow:n.hover_shadow||"medium"},[be.createSchemaItem("shadow",{select:{options:[{value:"light",label:"Light Glow"},{value:"medium",label:"Medium Glow"},{value:"heavy",label:"Heavy Glow"},{value:"custom",label:"Custom Shadow"}],mode:"dropdown"}})],(e=>i({hover_shadow:e.detail.value.shadow})))}
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
                          ${be.renderField("Horizontal (px)","Translate the image horizontally on hover.",t,{translate_x:n.hover_translate_x||0},[be.createSchemaItem("translate_x",{number:{min:-50,max:50,step:2,mode:"slider"}})],(e=>i({hover_translate_x:e.detail.value.translate_x})))}
                        </div>

                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                          >
                            Vertical (px)
                          </div>
                          ${be.renderField("Vertical (px)","Translate the image vertically on hover.",t,{translate_y:n.hover_translate_y||0},[be.createSchemaItem("translate_y",{number:{min:-50,max:50,step:2,mode:"slider"}})],(e=>i({hover_translate_y:e.detail.value.translate_y})))}
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
                    ${be.renderField("Duration (ms)","Set the duration for hover effects.",t,{transition:n.hover_transition||300},[be.createSchemaItem("transition",{number:{min:100,max:1e3,step:50,mode:"slider"}})],(e=>i({hover_transition:e.detail.value.transition})))}
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
    `}renderPreview(e,t){var o,i;const n=e;let a="";switch(n.image_type){case"default":default:a="/hacsfiles/Ultra-Card/assets/Ultra.jpg";break;case"url":case"upload":a=n.image_url||"";break;case"entity":if(n.image_entity&&(null==t?void 0:t.states[n.image_entity])){const e=t.states[n.image_entity];(null===(o=e.attributes)||void 0===o?void 0:o.entity_picture)?a=e.attributes.entity_picture:e.state&&e.state.startsWith("http")&&(a=e.state)}break;case"attribute":if(n.image_entity&&n.image_attribute&&(null==t?void 0:t.states[n.image_entity])){const e=null===(i=t.states[n.image_entity].attributes)||void 0===i?void 0:i[n.image_attribute];e&&"string"==typeof e&&(a=e)}}const r=[];n.filter_blur&&n.filter_blur>0&&r.push(`blur(${n.filter_blur}px)`),n.filter_brightness&&100!==n.filter_brightness&&r.push(`brightness(${n.filter_brightness}%)`),n.filter_contrast&&100!==n.filter_contrast&&r.push(`contrast(${n.filter_contrast}%)`),n.filter_saturate&&100!==n.filter_saturate&&r.push(`saturate(${n.filter_saturate}%)`);const l=r.length>0?r.join(" "):"none";let s="";const d=n.hover_enabled?`${n.hover_transition||300}ms`:"none";if(n.hover_enabled)switch(n.hover_effect||"scale"){case"scale":const e=(n.hover_scale||105)/100;s=`transform: scale(${e});`;break;case"rotate":s=`transform: rotate(${n.hover_rotate||5}deg);`;break;case"fade":s=`opacity: ${(n.hover_opacity||90)/100};`;break;case"blur":s=`filter: blur(${n.hover_blur||2}px);`;break;case"brightness":s=`filter: brightness(${n.hover_brightness||110}%);`;break;case"glow":let t="";switch(n.hover_shadow||"medium"){case"light":t="0 0 10px rgba(var(--rgb-primary-color), 0.5)";break;case"medium":t="0 0 20px rgba(var(--rgb-primary-color), 0.7)";break;case"heavy":t="0 0 30px rgba(var(--rgb-primary-color), 1)";break;case"custom":t=n.hover_shadow||"0 0 20px rgba(var(--rgb-primary-color), 0.7)"}s=`box-shadow: ${t};`;break;case"slide":const o=n.hover_translate_x||0,i=n.hover_translate_y||0;s=`transform: translate(${o}px, ${i}px);`}const c=`\n      width: ${n.width||100}%;\n      height: ${n.height||200}px;\n      object-fit: ${n.object_fit||"cover"};\n      border-radius: ${n.border_radius||8}px;\n      filter: ${l};\n      transition: ${n.hover_enabled?`transform ${d} ease, filter ${d} ease, opacity ${d} ease, box-shadow ${d} ease`:"none"};\n      cursor: pointer;\n      display: block;\n      border: ${n.border_width?`${n.border_width}px solid ${n.border_color}`:"none"};\n    `;let p="center";switch(n.alignment){case"left":p="flex-start";break;case"center":p="center";break;case"right":p="flex-end"}const u=n,m={padding:u.padding_top||u.padding_bottom||u.padding_left||u.padding_right?`${this.addPixelUnit(u.padding_top)||"0px"} ${this.addPixelUnit(u.padding_right)||"0px"} ${this.addPixelUnit(u.padding_bottom)||"0px"} ${this.addPixelUnit(u.padding_left)||"0px"}`:"0",margin:u.margin_top||u.margin_bottom||u.margin_left||u.margin_right?`${this.addPixelUnit(u.margin_top)||"0px"} ${this.addPixelUnit(u.margin_right)||"0px"} ${this.addPixelUnit(u.margin_bottom)||"0px"} ${this.addPixelUnit(u.margin_left)||"0px"}`:"0",background:u.background_color||"transparent",backgroundImage:this.getBackgroundImageCSS(u,t),backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",border:u.border_style&&"none"!==u.border_style?`${u.border_width||"1px"} ${u.border_style} ${u.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(u.border_radius)||"0",position:u.position||"relative",top:u.top||"auto",bottom:u.bottom||"auto",left:u.left||"auto",right:u.right||"auto",zIndex:u.z_index||"auto",width:u.width||"100%",height:u.height||"auto",maxWidth:u.max_width||"100%",maxHeight:u.max_height||"none",minWidth:u.min_width||"none",minHeight:u.min_height||"auto",overflow:u.overflow||"visible",clipPath:u.clip_path||"none",backdropFilter:u.backdrop_filter||"none",boxShadow:u.box_shadow_h&&u.box_shadow_v?`${u.box_shadow_h||"0"} ${u.box_shadow_v||"0"} ${u.box_shadow_blur||"0"} ${u.box_shadow_spread||"0"} ${u.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"},g=V`
      <div class="image-module-container" style=${this.styleObjectToCss(m)}>
        <div class="image-module-preview">
          <!-- Image Container with Alignment -->
          <div style="display: flex; justify-content: ${p}; width: 100%;">
            ${a?V`
                  <img
                    src="${a}"
                    alt="Image"
                    style="${c}"
                    @mouseover=${e=>{if(n.hover_enabled&&s){const t=e.target;t.style.transition,t.style.cssText+=s}}}
                    @mouseout=${e=>{if(n.hover_enabled){const t=e.target;t.style.transform="",t.style.opacity="",t.style.filter=l,t.style.boxShadow=""}}}
                    @click=${e=>{const o=n.tap_action||{action:"default"};ve.handleAction(o,t,e.target)}}
                    @contextmenu=${e=>{e.preventDefault();const o=n.hold_action||{action:"default"};ve.handleAction(o,t,e.target)}}
                    @dblclick=${e=>{const o=n.double_tap_action||{action:"default"};ve.handleAction(o,t,e.target)}}
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
    `;return g}async handleFileUpload(e,t){var o,i;const n=null===(o=e.target.files)||void 0===o?void 0:o[0];if(n)try{const e=new FormData;e.append("file",n);const o=await fetch("/api/media_source/local/upload",{method:"POST",body:e,headers:{Authorization:`Bearer ${(null===(i=window.hassTokens)||void 0===i?void 0:i.access_token)||""}`}});if(o.ok){const e=(await o.json()).media_content_id||`/media/local/${n.name}`;t({image_url:e,image_type:"upload"})}else{console.error("Upload failed:",o.statusText);const e=new FileReader;e.onload=e=>{var o;const i=null===(o=e.target)||void 0===o?void 0:o.result;t({image_url:i,image_type:"upload"})},e.readAsDataURL(n)}}catch(e){console.error("Error uploading file:",e);const o=new FileReader;o.onload=e=>{var o;const i=null===(o=e.target)||void 0===o?void 0:o.result;t({image_url:i,image_type:"upload"})},o.readAsDataURL(n)}}validate(e){const t=e,o=[...super.validate(e).errors];switch(t.image_type){case"url":t.image_url&&""!==t.image_url.trim()||o.push("Image URL is required when using URL type");break;case"upload":t.image_url&&""!==t.image_url.trim()||o.push("Uploaded image is required when using upload type");break;case"entity":t.image_entity&&""!==t.image_entity.trim()||o.push("Image entity is required when using entity type");break;case"attribute":t.image_entity&&""!==t.image_entity.trim()||o.push("Entity is required when using attribute type"),t.image_attribute&&""!==t.image_attribute.trim()||o.push("Attribute name is required when using attribute type")}return t.link_enabled&&!t.link_url&&o.push("Link URL is required when link is enabled"),t.width&&(t.width<1||t.width>100)&&o.push("Width must be between 1 and 100 percent"),t.height&&(t.height<50||t.height>800)&&o.push("Height must be between 50 and 800 pixels"),{valid:0===o.length,errors:o}}getBackgroundImageCSS(e,t){var o,i;if(!e.background_image_type||"none"===e.background_image_type)return"none";switch(e.background_image_type){case"upload":case"url":if(e.background_image)return`url("${e.background_image}")`;break;case"entity":if(e.background_image_entity&&(null==t?void 0:t.states[e.background_image_entity])){const n=t.states[e.background_image_entity];let a="";if((null===(o=n.attributes)||void 0===o?void 0:o.entity_picture)?a=n.attributes.entity_picture:(null===(i=n.attributes)||void 0===i?void 0:i.image)?a=n.attributes.image:n.state&&"string"==typeof n.state&&(n.state.startsWith("/")||n.state.startsWith("http"))&&(a=n.state),a)return a.startsWith("/local/")||a.startsWith("/media/")||a.startsWith("/"),`url("${a}")`}}return"none"}styleObjectToCss(e){return Object.entries(e).map((([e,t])=>`${e.replace(/[A-Z]/g,(e=>`-${e.toLowerCase()}`))}: ${t}`)).join("; ")}getStyles(){return"\n      .image-module-preview {\n        max-width: 100%;\n        overflow: hidden;\n        box-sizing: border-box;\n      }\n\n\n\n      .image-module-preview img {\n        max-width: 100%;\n        height: auto;\n        display: block;\n      }\n\n      /* Conditional Fields Grouping CSS */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n      }\n\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      @keyframes slideInFromLeft {\n        from { \n          opacity: 0; \n          transform: translateX(-10px); \n        }\n        to { \n          opacity: 1; \n          transform: translateX(0); \n        }\n      }\n\n      /* Field styling - ensure vertical stacking, no columns */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n        color: var(--primary-text-color) !important;\n        margin-bottom: 4px !important;\n        display: block !important;\n        width: 100% !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        display: block !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n        width: 100% !important;\n      }\n\n      .field-group {\n        display: flex !important;\n        flex-direction: column !important;\n        width: 100% !important;\n        margin-bottom: 16px !important;\n      }\n\n      .field-group ha-form {\n        width: 100% !important;\n        display: block !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      .settings-section {\n        margin-bottom: 16px;\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n    "}addPixelUnit(e){return e?/^\d+$/.test(e)?`${e}px`:/^[\d\s]+$/.test(e)?e.split(" ").map((e=>e.trim()?`${e}px`:e)).join(" "):e:e}}class ke extends he{constructor(){super(...arguments),this.metadata={type:"info",title:"Info Items",description:"Show entity information values",author:"WJD Designs",version:"1.0.0",icon:"mdi:information",category:"data",tags:["info","entity","data","sensors"]}}createDefault(e){return{id:e||this.generateId("info"),type:"info",info_entities:[{id:this.generateId("entity"),entity:"",name:"Entity Name",icon:"",show_icon:!0,show_name:!0,text_size:14,name_size:12,icon_size:18,text_bold:!1,text_italic:!1,text_uppercase:!1,text_strikethrough:!1,name_bold:!1,name_italic:!1,name_uppercase:!1,name_strikethrough:!1,icon_color:"var(--primary-color)",name_color:"var(--secondary-text-color)",text_color:"var(--primary-text-color)",click_action:"more-info",navigation_path:"",url:"",service:"",service_data:{},template_mode:!1,template:"",dynamic_icon_template_mode:!1,dynamic_icon_template:"",dynamic_color_template_mode:!1,dynamic_color_template:"",icon_position:"left",icon_alignment:"center",content_alignment:"start",overall_alignment:"center",icon_gap:8}],alignment:"left",vertical_alignment:"center",columns:1,gap:12,allow_wrap:!0}}renderGeneralTab(e,t,o,i){var n,a,r;const l=e,s=l.info_entities[0]||this.createDefault().info_entities[0];return V`
      <div class="module-general-settings">
        <!-- Entity Configuration -->
        <div class="settings-section">
          <ha-form
            .hass=${t}
            .data=${{entity:s.entity||""}}
            .schema=${[{name:"entity",label:"Entity",description:"Select the entity to display",selector:{entity:{}}}]}
            .computeLabel=${e=>e.label||e.name}
            .computeDescription=${e=>e.description||""}
            @value-changed=${e=>this._handleEntityChange(l,0,e.detail.value.entity,t,i)}
          ></ha-form>
        </div>

        <!-- Custom Name -->
        <div class="settings-section">
          <ha-form
            .hass=${t}
            .data=${{name:s.name||""}}
            .schema=${[{name:"name",label:"Name",description:"Custom display name for this entity",selector:{text:{}}}]}
            .computeLabel=${e=>e.label||e.name}
            .computeDescription=${e=>e.description||""}
            @value-changed=${e=>this._updateEntity(l,0,{name:e.detail.value.name},i)}
          ></ha-form>
        </div>

        <!-- Show Icon -->
        <div class="settings-section">
          <ha-form
            .hass=${t}
            .data=${{show_icon:!1!==s.show_icon}}
            .schema=${[{name:"show_icon",label:"Show Icon",description:"Display an icon next to the entity value",selector:{boolean:{}}}]}
            .computeLabel=${e=>e.label||e.name}
            .computeDescription=${e=>e.description||""}
            @value-changed=${e=>this._updateEntity(l,0,{show_icon:e.detail.value.show_icon},i)}
          ></ha-form>
        </div>

        <!-- Icon Selection -->
        ${!1!==s.show_icon?V`
              <div class="settings-section">
                <ha-form
                  .hass=${t}
                  .data=${{icon:s.icon||""}}
                  .schema=${[{name:"icon",label:"Icon",description:"Choose an icon to display",selector:{icon:{}}}]}
                  .computeLabel=${e=>e.label||e.name}
                  .computeDescription=${e=>e.description||""}
                  @value-changed=${e=>this._updateEntity(l,0,{icon:e.detail.value.icon},i)}
                ></ha-form>
              </div>
            `:""}

        <!-- Show Name -->
        <div class="settings-section">
          <ha-form
            .hass=${t}
            .data=${{show_name:!1!==s.show_name}}
            .schema=${[{name:"show_name",label:"Show Name",description:"Display the entity name above the value",selector:{boolean:{}}}]}
            .computeLabel=${e=>e.label||e.name}
            .computeDescription=${e=>e.description||""}
            @value-changed=${e=>this._updateEntity(l,0,{show_name:e.detail.value.show_name},i)}
          ></ha-form>
        </div>

        <!-- Click Action -->
        <div class="settings-section">
          <ha-form
            .hass=${t}
            .data=${{click_action:s.click_action||"more-info"}}
            .schema=${[{name:"click_action",label:"Click Action",description:"Action to perform when clicking the entity",selector:{select:{options:[{value:"none",label:"No Action"},{value:"more-info",label:"More Info"},{value:"toggle",label:"Toggle"},{value:"navigate",label:"Navigate"},{value:"url",label:"Open URL"},{value:"service",label:"Call Service"}],mode:"dropdown"}}}]}
            .computeLabel=${e=>e.label||e.name}
            .computeDescription=${e=>e.description||""}
            @value-changed=${e=>this._updateEntity(l,0,{click_action:e.detail.value.click_action},i)}
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
                  .hass=${t}
                  @value-changed=${e=>this._updateEntity(l,0,{icon_color:e.detail.value},i)}
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
            .hass=${t}
            @value-changed=${e=>this._updateEntity(l,0,{text_color:e.detail.value},i)}
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
              .hass=${t}
              .data=${{template_mode:s.template_mode||!1}}
              .schema=${[{name:"template_mode",label:"Template Mode",description:"Use Home Assistant templating syntax to format the value",selector:{boolean:{}}}]}
              .computeLabel=${e=>e.label||e.name}
              .computeDescription=${e=>e.description||""}
              @value-changed=${e=>this._updateEntity(l,0,{template_mode:e.detail.value.template_mode},i)}
            ></ha-form>
          </div>

          ${s.template_mode?V`
                <div class="field-group" style="margin-bottom: 16px;">
                  <ha-form
                    .hass=${t}
                    .data=${{template:s.template||""}}
                    .schema=${[{name:"template",label:"Value Template",description:"Template to format the entity value using Jinja2 syntax",selector:{text:{multiline:!0}}}]}
                    .computeLabel=${e=>e.label||e.name}
                    .computeDescription=${e=>e.description||""}
                    @value-changed=${e=>this._updateEntity(l,0,{template:e.detail.value.template},i)}
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
                  <div class="field-group">
                    <ha-form
                      .hass=${t}
                      .data=${{icon_size:Number(s.icon_size)||18}}
                      .schema=${[{name:"icon_size",label:"Icon Size",description:"Size of the icon in pixels",selector:{number:{min:12,max:48,step:1,mode:"slider"}}}]}
                      .computeLabel=${e=>e.label||e.name}
                      .computeDescription=${e=>e.description||""}
                      @value-changed=${e=>this._updateEntity(l,0,{icon_size:Number(e.detail.value.icon_size)},i)}
                    ></ha-form>
                  </div>
                `:""}
            ${!1!==s.show_name?V`
                  <div class="field-group">
                    <ha-form
                      .hass=${t}
                      .data=${{name_size:s.name_size||12}}
                      .schema=${[{name:"name_size",label:"Name Size",description:"Size of the entity name text in pixels",selector:{number:{min:8,max:32,step:1,mode:"slider"}}}]}
                      .computeLabel=${e=>e.label||e.name}
                      .computeDescription=${e=>e.description||""}
                      @value-changed=${e=>this._updateEntity(l,0,{name_size:e.detail.value.name_size},i)}
                    ></ha-form>
                  </div>
                `:""}

            <div class="field-group">
              <ha-form
                .hass=${t}
                .data=${{text_size:s.text_size||14}}
                .schema=${[{name:"text_size",label:"Value Size",description:"Size of the entity value text in pixels",selector:{number:{min:8,max:32,step:1,mode:"slider"}}}]}
                .computeLabel=${e=>e.label||e.name}
                .computeDescription=${e=>e.description||""}
                @value-changed=${e=>this._updateEntity(l,0,{text_size:e.detail.value.text_size},i)}
              ></ha-form>
            </div>

            ${!1!==s.show_icon?V`
                  <div class="field-group">
                    <ha-form
                      .hass=${t}
                      .data=${{icon_gap:s.icon_gap||8}}
                      .schema=${[{name:"icon_gap",label:"Icon Gap",description:"Space between the icon and content in pixels",selector:{number:{min:0,max:32,step:1,mode:"slider"}}}]}
                      .computeLabel=${e=>e.label||e.name}
                      .computeDescription=${e=>e.description||""}
                      @value-changed=${e=>this._updateEntity(l,0,{icon_gap:e.detail.value.icon_gap},i)}
                    ></ha-form>
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
              style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0px; max-width: 240px;"
            >
              ${[{value:"left",icon:"mdi:format-align-left"},{value:"top",icon:"mdi:format-align-top"},{value:"right",icon:"mdi:format-align-right"},{value:"bottom",icon:"mdi:format-align-bottom"}].map((e=>V`
                  <button
                    type="button"
                    class="control-btn ${(s.icon_position||"left")===e.value?"active":""}"
                    @click=${()=>this._updateEntity(l,0,{icon_position:e.value},i)}
                    title="${e.value.charAt(0).toUpperCase()+e.value.slice(1)}"
                  >
                    <ha-icon icon="${e.icon}"></ha-icon>
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
              style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0px; max-width: 180px;"
            >
              ${[{value:"left",icon:"mdi:format-align-left"},{value:"center",icon:"mdi:format-align-center"},{value:"right",icon:"mdi:format-align-right"}].map((e=>V`
                  <button
                    type="button"
                    class="control-btn ${(s.overall_alignment||"center")===e.value?"active":""}"
                    @click=${()=>this._updateEntity(l,0,{overall_alignment:e.value},i)}
                    title="${e.value.charAt(0).toUpperCase()+e.value.slice(1)}"
                  >
                    <ha-icon icon="${e.icon}"></ha-icon>
                  </button>
                `))}
            </div>
          </div>

          <!-- Icon and Content Alignment Side by Side -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
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
                style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0px;"
              >
                ${[{value:"start",icon:"mdi:format-align-left"},{value:"center",icon:"mdi:format-align-center"},{value:"end",icon:"mdi:format-align-right"}].map((e=>V`
                    <button
                      type="button"
                      class="control-btn ${(s.icon_alignment||"center")===e.value?"active":""}"
                      @click=${()=>this._updateEntity(l,0,{icon_alignment:e.value},i)}
                      title="${e.value.charAt(0).toUpperCase()+e.value.slice(1)}"
                    >
                      <ha-icon icon="${e.icon}"></ha-icon>
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
                style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0px;"
              >
                ${[{value:"start",icon:"mdi:format-align-left"},{value:"center",icon:"mdi:format-align-center"},{value:"end",icon:"mdi:format-align-right"}].map((e=>V`
                    <button
                      type="button"
                      class="control-btn ${(s.content_alignment||"start")===e.value?"active":""}"
                      @click=${()=>this._updateEntity(l,0,{content_alignment:e.value},i)}
                      title="${e.value.charAt(0).toUpperCase()+e.value.slice(1)}"
                    >
                      <ha-icon icon="${e.icon}"></ha-icon>
                    </button>
                  `))}
              </div>
            </div>
          </div>
        </div>
      </div>
    `}renderPreview(e,t){const o=e,i=o,n={padding:i.padding_top||i.padding_bottom||i.padding_left||i.padding_right?`${i.padding_top||"8"}px ${i.padding_right||"0"}px ${i.padding_bottom||"8"}px ${i.padding_left||"0"}px`:"8px 0",margin:i.margin_top||i.margin_bottom||i.margin_left||i.margin_right?`${i.margin_top||"0"}px ${i.margin_right||"0"}px ${i.margin_bottom||"0"}px ${i.margin_left||"0"}px`:"0",background:i.background_color||"transparent",backgroundImage:this.getBackgroundImageCSS(i,t),backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",border:i.border_style&&"none"!==i.border_style?`${i.border_width||"1px"} ${i.border_style} ${i.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(i.border_radius)||"0",position:i.position||"relative",top:i.top||"auto",bottom:i.bottom||"auto",left:i.left||"auto",right:i.right||"auto",zIndex:i.z_index||"auto",width:i.width||"100%",height:i.height||"auto",maxWidth:i.max_width||"100%",maxHeight:i.max_height||"none",minWidth:i.min_width||"none",minHeight:i.min_height||"auto",overflow:i.overflow||"visible",clipPath:i.clip_path||"none",backdropFilter:i.backdrop_filter||"none",boxShadow:i.box_shadow_h&&i.box_shadow_v?`${i.box_shadow_h||"0"} ${i.box_shadow_v||"0"} ${i.box_shadow_blur||"0"} ${i.box_shadow_spread||"0"} ${i.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"};return V`
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
            ${o.info_entities.slice(0,3).map((e=>{var o,i,n;const a=null==t?void 0:t.states[e.entity],r=a?a.state:"N/A",l=e.name||(null===(o=null==a?void 0:a.attributes)||void 0===o?void 0:o.friendly_name)||e.entity,s=e.icon||(null===(i=null==a?void 0:a.attributes)||void 0===i?void 0:i.icon)||"mdi:help-circle",d=e.icon_position||"left",c=e.icon_alignment||"center",p=e.content_alignment||"start",u=e.overall_alignment||"center",m=e.icon_gap||8,g=e.show_icon?V`
                    <ha-icon
                      icon="${s}"
                      class="entity-icon"
                      style="color: ${e.icon_color||"var(--primary-color)"}; font-size: ${Number(e.icon_size)||18}px;"
                    ></ha-icon>
                  `:"",h=V`
                <div
                  class="entity-content"
                  style="
                  align-items: ${"start"===p?"flex-start":"end"===p?"flex-end":"center"};
                  text-align: ${"start"===p?"left":"end"===p?"right":"center"};
                "
                >
                  ${e.show_name?V`
                        <div
                          class="entity-name"
                          style="
                    color: ${e.name_color||"var(--secondary-text-color)"};
                    font-size: ${e.name_size||12}px;
                    font-weight: ${e.name_bold?"bold":"normal"};
                    font-style: ${e.name_italic?"italic":"normal"};
                    text-transform: ${e.name_uppercase?"uppercase":"none"};
                    text-decoration: ${e.name_strikethrough?"line-through":"none"};
                  "
                        >
                          ${l}
                        </div>
                      `:""}

                  <div
                    class="entity-value"
                    style="
                  color: ${e.text_color||"var(--primary-text-color)"};
                  font-size: ${e.text_size||14}px;
                  font-weight: ${e.text_bold?"bold":"normal"};
                  font-style: ${e.text_italic?"italic":"normal"};
                  text-transform: ${e.text_uppercase?"uppercase":"none"};
                  text-decoration: ${e.text_strikethrough?"line-through":"none"};
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
    `}validate(e){const t=e,o=[...super.validate(e).errors];return t.info_entities&&0!==t.info_entities.length||o.push("At least one info entity is required"),t.info_entities.forEach(((e,t)=>{e.entity&&""!==e.entity.trim()||o.push(`Entity ${t+1}: Entity ID is required`)})),{valid:0===o.length,errors:o}}getStyles(){return"\n      .info-module-preview {\n        padding: 8px;\n        min-height: 40px;\n      }\n      \n      .info-entities {\n        width: 100%;\n      }\n      \n      .info-entity-item {\n        min-width: 0;\n        flex: 1;\n      }\n      \n      .entity-content {\n        display: flex;\n        flex-direction: column;\n        gap: 2px;\n        min-width: 0;\n        flex: 1;\n      }\n      \n      .entity-icon {\n        flex-shrink: 0;\n      }\n      \n      .entity-name {\n        font-size: 12px;\n        line-height: 1.2;\n      }\n      \n      .entity-value {\n        font-size: 14px;\n        font-weight: 500;\n        line-height: 1.2;\n      }\n      \n      .more-entities {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        padding: 8px;\n        color: var(--secondary-text-color);\n        font-size: 12px;\n        font-style: italic;\n      }\n      \n      .info-entities-section,\n      .layout-section {\n        margin-top: 16px;\n        padding-top: 16px;\n        border-top: 1px solid var(--divider-color);\n      }\n      \n      .info-entities-section:first-child {\n        margin-top: 0;\n        padding-top: 0;\n        border-top: none;\n      }\n      \n      .info-entities-section h4,\n      .layout-section h4 {\n        margin: 0 0 12px 0;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n      }\n      \n      .entity-item {\n        border: 1px solid var(--divider-color);\n        border-radius: 8px;\n        padding: 12px;\n        margin-bottom: 12px;\n        background: var(--card-background-color);\n      }\n      \n      .entity-header {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        margin-bottom: 12px;\n        font-weight: 500;\n        font-size: 14px;\n      }\n      \n      .remove-entity-btn {\n        background: none;\n        border: none;\n        color: var(--error-color);\n        cursor: pointer;\n        padding: 4px;\n        border-radius: 4px;\n        font-size: 14px;\n      }\n      \n      .remove-entity-btn:disabled {\n        opacity: 0.3;\n        cursor: not-allowed;\n      }\n      \n      .add-entity-btn {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n        width: 100%;\n        padding: 12px;\n        border: 2px dashed var(--primary-color);\n        border-radius: 8px;\n        background: none;\n        color: var(--primary-color);\n        cursor: pointer;\n        font-size: 14px;\n        font-weight: 500;\n      }\n      \n      .add-entity-btn:hover {\n        background: var(--primary-color);\n        color: white;\n      }\n      \n      .entity-display-options {\n        display: grid;\n        grid-template-columns: 1fr 1fr;\n        gap: 8px;\n        margin: 8px 0;\n      }\n      \n      /* Control button styles */\n      .control-btn {\n        padding: 8px 4px;\n        border: 1px solid var(--divider-color);\n        background: var(--card-background-color);\n        color: var(--primary-text-color);\n        border-radius: 4px;\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        user-select: none;\n        font-size: 10px;\n      }\n      \n      .control-btn:hover:not(.active) {\n        border-color: var(--primary-color) !important;\n        background: var(--primary-color) !important;\n        color: white !important;\n        opacity: 0.8;\n      }\n      \n      .control-btn.active {\n        border-color: var(--primary-color);\n        background: var(--primary-color);\n        color: white;\n      }\n      \n      .control-btn ha-icon {\n        font-size: 14px;\n      }\n      \n      .control-button-group {\n        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n        border-radius: 4px;\n        overflow: hidden;\n      }\n      \n      .control-button-group .control-btn:not(:last-child) {\n        border-right: none;\n      }\n      \n      .control-button-group .control-btn:first-child {\n        border-radius: 4px 0 0 4px;\n      }\n      \n      .control-button-group .control-btn:last-child {\n        border-radius: 0 4px 4px 0;\n      }\n      \n      .control-button-group .control-btn:only-child {\n        border-radius: 4px;\n      }\n      \n      /* Position-specific layout styles */\n      .position-left {\n        flex-direction: row;\n      }\n      \n      .position-right {\n        flex-direction: row-reverse;\n      }\n      \n      .position-top {\n        flex-direction: column;\n      }\n      \n      .position-bottom {\n        flex-direction: column-reverse;\n      }\n    "}_addEntity(e,t){const o={id:this.generateId("entity"),entity:"",name:"Entity Name",icon:"",show_icon:!0,show_name:!0,text_size:14,name_size:12,icon_size:18,text_bold:!1,text_italic:!1,text_uppercase:!1,text_strikethrough:!1,name_bold:!1,name_italic:!1,name_uppercase:!1,name_strikethrough:!1,icon_color:"var(--primary-color)",name_color:"var(--secondary-text-color)",text_color:"var(--primary-text-color)",click_action:"more-info",navigation_path:"",url:"",service:"",service_data:{},template_mode:!1,template:"",dynamic_icon_template_mode:!1,dynamic_icon_template:"",dynamic_color_template_mode:!1,dynamic_color_template:"",icon_position:"left",icon_alignment:"center",content_alignment:"start",overall_alignment:"center",icon_gap:8};t({info_entities:[...e.info_entities,o]})}_removeEntity(e,t,o){if(e.info_entities.length<=1)return;const i=e.info_entities.filter(((e,o)=>o!==t));o({info_entities:i})}_handleEntityChange(e,t,o,i,n){var a,r;const l={entity:o};if(o&&(null==i?void 0:i.states[o])){const n=(null===(a=i.states[o].attributes)||void 0===a?void 0:a.friendly_name)||o.split(".").pop()||"",s=null===(r=e.info_entities)||void 0===r?void 0:r[t];(null==s?void 0:s.name)&&"Entity Name"!==s.name&&s.name!==s.entity||(l.name=n)}this._updateEntity(e,t,l,n)}_updateEntity(e,t,o,i){if(!e.info_entities||0===e.info_entities.length){const t=this.createDefault().info_entities[0];return e.info_entities=[Object.assign(Object.assign({},t),o)],void i({info_entities:e.info_entities})}if(t>=e.info_entities.length){const o=this.createDefault().info_entities[0];for(;e.info_entities.length<=t;)e.info_entities.push(Object.assign({},o))}const n=e.info_entities.map(((e,i)=>i===t?Object.assign(Object.assign({},e),o):e));i({info_entities:n})}getBackgroundImageCSS(e,t){var o,i;if(!e.background_image_type||"none"===e.background_image_type)return"none";switch(e.background_image_type){case"upload":case"url":if(e.background_image)return`url("${e.background_image}")`;break;case"entity":if(e.background_image_entity&&(null==t?void 0:t.states[e.background_image_entity])){const n=t.states[e.background_image_entity];let a="";if((null===(o=n.attributes)||void 0===o?void 0:o.entity_picture)?a=n.attributes.entity_picture:(null===(i=n.attributes)||void 0===i?void 0:i.image)?a=n.attributes.image:n.state&&"string"==typeof n.state&&(n.state.startsWith("/")||n.state.startsWith("http"))&&(a=n.state),a)return a.startsWith("/local/")||a.startsWith("/media/")||a.startsWith("/"),`url("${a}")`}}return"none"}styleObjectToCss(e){return Object.entries(e).map((([e,t])=>`${e.replace(/[A-Z]/g,(e=>`-${e.toLowerCase()}`))}: ${t}`)).join("; ")}addPixelUnit(e){return e?/^\d+$/.test(e)?`${e}px`:/^[\d\s]+$/.test(e)?e.split(" ").map((e=>e.trim()?`${e}px`:e)).join(" "):e:e}}const Ce=e=>(...t)=>({_$litDirective$:e,values:t});class Se{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,o){this._$Ct=e,this._$AM=t,this._$Ci=o}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}const{I:Ie}=re,ze=()=>document.createComment(""),Te=(e,t,o)=>{const i=e._$AA.parentNode,n=void 0===t?e._$AB:t._$AA;if(void 0===o){const t=i.insertBefore(ze(),n),a=i.insertBefore(ze(),n);o=new Ie(t,a,e,e.options)}else{const t=o._$AB.nextSibling,a=o._$AM,r=a!==e;if(r){let t;o._$AQ?.(e),o._$AM=e,void 0!==o._$AP&&(t=e._$AU)!==a._$AU&&o._$AP(t)}if(t!==n||r){let e=o._$AA;for(;e!==t;){const t=e.nextSibling;i.insertBefore(e,n),e=t}}}return o},Pe=(e,t,o=e)=>(e._$AI(t,o),e),Ae={},Le=e=>{e._$AP?.(!1,!0);let t=e._$AA;const o=e._$AB.nextSibling;for(;t!==o;){const e=t.nextSibling;t.remove(),t=e}},Oe=(e,t,o)=>{const i=new Map;for(let n=t;n<=o;n++)i.set(e[n],n);return i},Me=Ce(class extends Se{constructor(e){if(super(e),2!==e.type)throw Error("repeat() can only be used in text expressions")}dt(e,t,o){let i;void 0===o?o=t:void 0!==t&&(i=t);const n=[],a=[];let r=0;for(const t of e)n[r]=i?i(t,r):r,a[r]=o(t,r),r++;return{values:a,keys:n}}render(e,t,o){return this.dt(e,t,o).values}update(e,[t,o,i]){const n=(e=>e._$AH)(e),{values:a,keys:r}=this.dt(t,o,i);if(!Array.isArray(n))return this.ut=r,a;const l=this.ut??=[],s=[];let d,c,p=0,u=n.length-1,m=0,g=a.length-1;for(;p<=u&&m<=g;)if(null===n[p])p++;else if(null===n[u])u--;else if(l[p]===r[m])s[m]=Pe(n[p],a[m]),p++,m++;else if(l[u]===r[g])s[g]=Pe(n[u],a[g]),u--,g--;else if(l[p]===r[g])s[g]=Pe(n[p],a[g]),Te(e,s[g+1],n[p]),p++,g--;else if(l[u]===r[m])s[m]=Pe(n[u],a[m]),Te(e,n[p],n[u]),u--,m++;else if(void 0===d&&(d=Oe(r,m,g),c=Oe(l,p,u)),d.has(l[p]))if(d.has(l[u])){const t=c.get(r[m]),o=void 0!==t?n[t]:null;if(null===o){const t=Te(e,n[p]);Pe(t,a[m]),s[m]=t}else s[m]=Pe(o,a[m]),Te(e,n[p],o),n[t]=null;m++}else Le(n[u]),u--;else Le(n[p]),p++;for(;m<=g;){const t=Te(e,s[g+1]);Pe(t,a[m]),s[m++]=t}for(;p<=u;){const e=n[p++];null!==e&&Le(e)}return this.ut=r,((e,t=Ae)=>{e._$AH=t})(e,s),G}});var De=function(e,t,o,i){var n,a=arguments.length,r=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,i);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(r=(a<3?n(r):a>3?n(t,o,r):n(t,o))||r);return a>3&&r&&Object.defineProperty(t,o,r),r};function Ee(e,t,o){const i=je(e),n=je(t);return i&&n?function(e,t,o){return`#${((1<<24)+(e<<16)+(t<<8)+o).toString(16).slice(1)}`}(Math.round(i.r+(n.r-i.r)*o),Math.round(i.g+(n.g-i.g)*o),Math.round(i.b+(n.b-i.b)*o)):e}function je(e){const t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?{r:parseInt(t[1],16),g:parseInt(t[2],16),b:parseInt(t[3],16)}:null}function Fe(e){if(!e||0===e.length)return"";const t=[...e].sort(((e,t)=>e.position-t.position));return t.map((e=>`${e.color} ${e.position}%`)).join(", ")}let Re=4,Ue=class extends se{constructor(){super(...arguments),this.stops=[{id:"1",position:0,color:"#ff0000"},{id:"2",position:50,color:"#ffff00"},{id:"3",position:100,color:"#00ff00"}],this.barSize="regular",this.barRadius="round",this.barStyle="flat",this._draggedIndex=null}render(){const e=[...this.stops].sort(((e,t)=>e.position-t.position)),t=Fe(e);return V`
      <!-- Gradient Preview -->
      <div
        class="gradient-preview bar-size-${this.barSize} bar-radius-${this.barRadius} bar-style-${this.barStyle}"
      >
        <div
          class="gradient-preview-fill bar-style-${this.barStyle}"
          style="background: linear-gradient(to right, ${t})"
        ></div>
      </div>

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
        ${Me(e,(e=>e.id),((t,o)=>this._renderStopItem(t,o,e.length)))}
      </div>
    `}_renderStopItem(e,t,o){const i=0===e.position||100===e.position,n=this._draggedIndex===t,a=o>2&&!i;return V`
      <div
        class="stop-item ${i?"boundary":""} ${n?"dragging":""}"
        draggable="true"
        @dragstart=${e=>this._handleDragStart(e,t)}
        @dragend=${this._handleDragEnd}
        @dragover=${this._handleDragOver}
        @drop=${e=>this._handleDrop(e,t)}
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
        <div class="color-preview" style="background-color: ${e.color}">
          <ultra-color-picker
            .value=${e.color}
            .defaultValue=${e.color}
            .showResetButton=${!1}
            style="width: 100%; height: 100%; border-radius: 50%; overflow: hidden;"
            @value-changed=${t=>this._handleColorChange(e.id,t.detail.value)}
          ></ultra-color-picker>
        </div>

        <!-- Percentage Input -->
        <input
          type="number"
          class="percentage-input"
          .value=${e.position.toString()}
          min="0"
          max="100"
          @input=${t=>this._handlePositionChange(e.id,parseFloat(t.target.value)||0)}
          @blur=${this._validateAndSortStops}
        />

        <!-- Stop Info -->
        <div class="stop-info">
          <span>${e.position}%</span>
        </div>

        <!-- Delete Button -->
        <button
          class="delete-button"
          ?disabled=${!a}
          @click=${()=>this._deleteStop(e.id)}
          title=${a?"Delete stop":"Cannot delete boundary stops"}
        >
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
            />
          </svg>
        </button>
      </div>
    `}_addStop(){const e=function(e){if(!e||e.length<2)return{id:"stop-"+Re++,position:50,color:"#808080"};const t=[...e].sort(((e,t)=>e.position-t.position));let o=0,i=50,n="#808080";for(let e=0;e<t.length-1;e++){const a=t[e+1].position-t[e].position;a>o&&(o=a,i=t[e].position+a/2,n=Ee(t[e].color,t[e+1].color,.5))}return{id:"stop-"+Re++,position:Math.round(i),color:n}}(this.stops);this.stops=[...this.stops,e],this._notifyChange()}_resetStops(){this.stops=[{id:"1",position:0,color:"#ff0000"},{id:"2",position:50,color:"#ffff00"},{id:"3",position:100,color:"#00ff00"}],Re=4,this._notifyChange(),this._dispatchResetEvent()}_deleteStop(e){if(this.stops.length<=2)return;const t=this.stops.find((t=>t.id===e));t&&0!==t.position&&100!==t.position&&(this.stops=this.stops.filter((t=>t.id!==e)),this._notifyChange())}_handleColorChange(e,t){this.stops=this.stops.map((o=>o.id===e?Object.assign(Object.assign({},o),{color:t}):o)),this._notifyChange()}_handlePositionChange(e,t){t=Math.max(0,Math.min(100,t)),this.stops=this.stops.map((o=>o.id===e?Object.assign(Object.assign({},o),{position:t}):o)),this.requestUpdate()}_validateAndSortStops(){this.stops=this.stops.map((e=>0===e.position||"1"===e.id&&e.position<50?Object.assign(Object.assign({},e),{position:0}):100===e.position||"3"===e.id&&e.position>50?Object.assign(Object.assign({},e),{position:100}):e)),this._notifyChange()}_notifyChange(){this.dispatchEvent(new CustomEvent("gradient-changed",{detail:{stops:this.stops},bubbles:!0,composed:!0}))}_dispatchResetEvent(){this.dispatchEvent(new CustomEvent("gradient-stop-reset",{bubbles:!0,composed:!0}))}_handleDragStart(e,t){this._draggedIndex=t,e.dataTransfer&&(e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/html",t.toString()))}_handleDragEnd(){this._draggedIndex=null}_handleDragOver(e){e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect="move")}_handleDrop(e,t){if(e.preventDefault(),null===this._draggedIndex||this._draggedIndex===t)return;const o=[...this.stops].sort(((e,t)=>e.position-t.position)),i=o[this._draggedIndex],n=o[t];this.stops=this.stops.map((e=>e.id===i.id?Object.assign(Object.assign({},e),{position:n.position}):e.id===n.id?Object.assign(Object.assign({},e),{position:i.position}):e)),this._draggedIndex=null,this._notifyChange()}};Ue.styles=a`
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
  `,De([me({type:Array})],Ue.prototype,"stops",void 0),De([me({type:String})],Ue.prototype,"barSize",void 0),De([me({type:String})],Ue.prototype,"barRadius",void 0),De([me({type:String})],Ue.prototype,"barStyle",void 0),De([ge()],Ue.prototype,"_draggedIndex",void 0),Ue=De([ce("uc-gradient-editor")],Ue);class Ne extends he{constructor(){super(...arguments),this.metadata={type:"bar",title:"Bars",description:"Progress bars for values",author:"WJD Designs",version:"1.0.0",icon:"mdi:chart-bar",category:"data",tags:["bar","progress","chart","value","sensor"]}}createDefault(e){return{id:e||this.generateId("bar"),type:"bar",entity:"",name:"My First Bar",percentage_type:"entity",percentage_entity:"",percentage_attribute_entity:"",percentage_attribute_name:"",percentage_current_entity:"",percentage_total_entity:"",percentage_template:"",bar_size:"medium",bar_radius:"round",bar_style:"flat",bar_width:100,bar_alignment:"center",height:20,border_radius:10,label_alignment:"space-between",show_percentage:!0,percentage_text_size:14,show_value:!0,value_position:"inside",left_title:"",left_entity:"",left_condition_type:"none",left_condition_entity:"",left_condition_state:"",left_template_mode:!1,left_template:"",left_title_size:14,left_value_size:14,left_title_color:"var(--primary-text-color)",left_value_color:"var(--primary-text-color)",left_enabled:!1,right_title:"",right_entity:"",right_enabled:!1,right_condition_type:"none",right_condition_entity:"",right_condition_state:"",right_template_mode:!1,right_template:"",right_title_size:14,right_value_size:14,right_title_color:"var(--primary-text-color)",right_value_color:"var(--primary-text-color)",bar_color:"var(--primary-color)",bar_background_color:"var(--secondary-background-color)",bar_border_color:"var(--divider-color)",percentage_text_color:"var(--primary-text-color)",use_gradient:!1,gradient_display_mode:"cropped",gradient_stops:[{id:"1",position:0,color:"#ff0000"},{id:"2",position:50,color:"#ffff00"},{id:"3",position:100,color:"#00ff00"}],limit_entity:"",limit_color:"var(--warning-color)",animation:!0,template_mode:!1,template:""}}renderGeneralTab(e,t,o,i){const n=e;return V`
      ${be.injectCleanFormStyles()}
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

          <!-- Bar Name -->
          ${be.renderField("Bar Name","Give this bar a custom name to make it easier to identify in the editor and arrangement views.",t,{name:n.name||""},[be.createSchemaItem("name",{text:{}})],(e=>i({name:e.detail.value.name})))}

          <!-- Percentage Calculation -->
          <div style="margin-top: 24px;">
            ${be.renderField("Percentage Calculation","Configure how the bar's percentage fill level is calculated using one of the options below.",t,{percentage_type:n.percentage_type||"entity"},[be.createSchemaItem("percentage_type",{select:{options:[{value:"entity",label:"Entity (0-100)"},{value:"attribute",label:"Entity Attribute"},{value:"difference",label:"Difference"},{value:"template",label:"Template"}],mode:"dropdown"}})],(e=>i({percentage_type:e.detail.value.percentage_type})))}
          </div>

          <!-- Entity Attribute Fields -->
          ${"attribute"===n.percentage_type?this.renderConditionalFieldsGroup("Entity Attribute Configuration",V`
                  ${be.renderField("Attribute Entity","Select the entity that contains the attribute with the percentage value.",t,{percentage_attribute_entity:n.percentage_attribute_entity||""},[be.createSchemaItem("percentage_attribute_entity",{entity:{}})],(e=>i({percentage_attribute_entity:e.detail.value.percentage_attribute_entity})))}

                  <div style="margin-top: 16px;">
                    ${be.renderField("Attribute Name",'Enter the name of the attribute that contains the percentage value (e.g., "battery_level").',t,{percentage_attribute_name:n.percentage_attribute_name||""},[be.createSchemaItem("percentage_attribute_name",{text:{}})],(e=>i({percentage_attribute_name:e.detail.value.percentage_attribute_name})))}
                  </div>
                `):""}

          <!-- Difference Fields -->
          ${"difference"===n.percentage_type?this.renderConditionalFieldsGroup("Difference Calculation Configuration",V`
                  ${be.renderField("Current Value Entity","Entity representing the current/used amount (e.g., fuel used, battery consumed).",t,{percentage_current_entity:n.percentage_current_entity||""},[be.createSchemaItem("percentage_current_entity",{entity:{}})],(e=>i({percentage_current_entity:e.detail.value.percentage_current_entity})))}

                  <div style="margin-top: 16px;">
                    ${be.renderField("Total Value Entity","Entity representing the total/maximum amount (e.g., fuel capacity, battery capacity).",t,{percentage_total_entity:n.percentage_total_entity||""},[be.createSchemaItem("percentage_total_entity",{entity:{}})],(e=>i({percentage_total_entity:e.detail.value.percentage_total_entity})))}
                  </div>
                `):""}

          <!-- Template Field -->
          ${"template"===n.percentage_type?this.renderConditionalFieldsGroup("Template Configuration",V`
                  ${be.renderField("Percentage Template","Enter a Jinja2 template that returns a number between 0-100 for the percentage. Example: {{ (states('sensor.battery_level') | float) * 100 }}",t,{percentage_template:n.percentage_template||""},[be.createSchemaItem("percentage_template",{text:{multiline:!0,type:"text"}})],(e=>i({percentage_template:e.detail.value.percentage_template})))}
                `):""}

          <!-- Bar Percentage Entity -->
          <div style="margin-top: 24px;">
            ${be.renderField("Bar Percentage Entity","Select the entity that provides the percentage value for the bar.",t,{entity:n.entity||""},[be.createSchemaItem("entity",{entity:{}})],(e=>i({entity:e.detail.value.entity})))}
          </div>

          <!-- Limit Value Entity -->
          <div style="margin-top: 24px;">
            ${be.renderField("Limit Value Entity (optional)","Optional: Add a vertical indicator line on the bar (e.g. charge limit for EV battery).",t,{limit_entity:n.limit_entity||""},[be.createSchemaItem("limit_entity",{entity:{}})],(e=>i({limit_entity:e.detail.value.limit_entity})))}
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
          <div class="field-group" style="margin-bottom: 16px;">
            ${be.renderField("Bar Size","Adjust the thickness of the progress bar.",t,{height:n.height||20},[be.createSchemaItem("height",{number:{min:8,max:60,step:2,mode:"slider"}})],(e=>i({height:e.detail.value.height})))}
          </div>

          <!-- Border Radius -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${be.renderField("Border Radius","Control the rounded corners of the bar.",t,{border_radius:n.border_radius||10},[be.createSchemaItem("border_radius",{number:{min:0,max:50,step:1,mode:"slider"}})],(e=>i({border_radius:e.detail.value.border_radius})))}
          </div>

          <!-- Bar Style -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${be.renderField("Bar Style","Choose the visual style of the progress bar.",t,{bar_style:n.bar_style||"flat"},[be.createSchemaItem("bar_style",{select:{options:[{value:"flat",label:"Flat"},{value:"raised",label:"Raised"},{value:"inset",label:"Inset"}],mode:"dropdown"}})],(e=>i({bar_style:e.detail.value.bar_style})))}
          </div>

          <!-- Bar Width -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${be.renderField("Bar Width","Set the width of the bar as a percentage of the container.",t,{bar_width:n.bar_width||100},[be.createSchemaItem("bar_width",{number:{min:10,max:100,step:5,mode:"slider"}})],(e=>i({bar_width:e.detail.value.bar_width})))}
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
                  <div style="display: flex; gap: 8px; justify-content: flex-start;">
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${"left"===(n.bar_alignment||"center")?"var(--primary-color)":"var(--divider-color)"}; background: ${"left"===(n.bar_alignment||"center")?"var(--primary-color)":"transparent"}; color: ${"left"===(n.bar_alignment||"center")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                      @click=${()=>i({bar_alignment:"left"})}
                    >
                      <ha-icon icon="mdi:format-align-left" style="font-size: 16px;"></ha-icon>
                      Left
                    </button>
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${"center"===(n.bar_alignment||"center")?"var(--primary-color)":"var(--divider-color)"}; background: ${"center"===(n.bar_alignment||"center")?"var(--primary-color)":"transparent"}; color: ${"center"===(n.bar_alignment||"center")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                      @click=${()=>i({bar_alignment:"center"})}
                    >
                      <ha-icon icon="mdi:format-align-center" style="font-size: 16px;"></ha-icon>
                      Center
                    </button>
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${"right"===(n.bar_alignment||"center")?"var(--primary-color)":"var(--divider-color)"}; background: ${"right"===(n.bar_alignment||"center")?"var(--primary-color)":"transparent"}; color: ${"right"===(n.bar_alignment||"center")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                      @click=${()=>i({bar_alignment:"right"})}
                    >
                      <ha-icon icon="mdi:format-align-right" style="font-size: 16px;"></ha-icon>
                      Right
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
              .hass=${t}
              .data=${{label_alignment:n.label_alignment||"space-between"}}
              .schema=${[{name:"label_alignment",selector:{select:{options:[{value:"left",label:"Left"},{value:"center",label:"Center"},{value:"right",label:"Right"},{value:"space-between",label:"Space Between"}],mode:"dropdown"}},label:""}]}
              @value-changed=${e=>i({label_alignment:e.detail.value.label_alignment})}
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
              .hass=${t}
              .data=${{show_percentage:!1!==n.show_percentage}}
              .schema=${[{name:"show_percentage",selector:{boolean:{}},label:""}]}
              @value-changed=${e=>i({show_percentage:e.detail.value.show_percentage})}
            ></ha-form>
          </div>

          ${!1!==n.show_percentage?V`
                <div class="field-group">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Text Size
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                  >
                    Adjust the size of the percentage text displayed on the bar.
                  </div>
                  <ha-form
                    .hass=${t}
                    .data=${{percentage_text_size:n.percentage_text_size||14}}
                    .schema=${[{name:"percentage_text_size",selector:{number:{min:8,max:32,step:1,mode:"slider"}},label:""}]}
                    @value-changed=${e=>i({percentage_text_size:e.detail.value.percentage_text_size})}
                  ></ha-form>
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
              .hass=${t}
              .data=${{enable_left:n.left_enabled||!1}}
              .schema=${[{name:"enable_left",selector:{boolean:{}},label:""}]}
              @value-changed=${e=>{e.detail.value.enable_left?i({left_enabled:!0,left_title:n.left_title||"Fuel",left_entity:n.left_entity||"",left_template_mode:n.left_template_mode||!1,left_title_size:n.left_title_size||14,left_value_size:n.left_value_size||14,left_title_color:n.left_title_color||"var(--primary-text-color)",left_value_color:n.left_value_color||"var(--primary-text-color)"}):i({left_enabled:!1,left_title:"",left_entity:"",left_template_mode:!1,left_template:""})}}
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
                    .hass=${t}
                    .data=${{left_title:n.left_title||""}}
                    .schema=${[{name:"left_title",selector:{text:{}},label:""}]}
                    @value-changed=${e=>i({left_title:e.detail.value.left_title})}
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
                    .hass=${t}
                    .data=${{left_entity:n.left_entity||""}}
                    .schema=${[{name:"left_entity",selector:{entity:{}},label:""}]}
                    @value-changed=${e=>i({left_entity:e.detail.value.left_entity})}
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
                    .hass=${t}
                    .data=${{left_template_mode:n.left_template_mode||!1}}
                    .schema=${[{name:"left_template_mode",selector:{boolean:{}},label:""}]}
                    @value-changed=${e=>i({left_template_mode:e.detail.value.left_template_mode})}
                  ></ha-form>
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Title Size
                  </div>
                  <ha-form
                    .hass=${t}
                    .data=${{left_title_size:n.left_title_size||14}}
                    .schema=${[{name:"left_title_size",selector:{number:{min:8,max:32,step:1,mode:"slider"}},label:""}]}
                    @value-changed=${e=>i({left_title_size:e.detail.value.left_title_size})}
                  ></ha-form>
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Value Size
                  </div>
                  <ha-form
                    .hass=${t}
                    .data=${{left_value_size:n.left_value_size||14}}
                    .schema=${[{name:"left_value_size",selector:{number:{min:8,max:32,step:1,mode:"slider"}},label:""}]}
                    @value-changed=${e=>i({left_value_size:e.detail.value.left_value_size})}
                  ></ha-form>
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
              .hass=${t}
              .data=${{enable_right:n.right_enabled||!1}}
              .schema=${[{name:"enable_right",selector:{boolean:{}},label:""}]}
              @value-changed=${e=>{e.detail.value.enable_right?i({right_enabled:!0,right_title:n.right_title||"Range",right_entity:n.right_entity||"",right_template_mode:n.right_template_mode||!1,right_title_size:n.right_title_size||14,right_value_size:n.right_value_size||14,right_title_color:n.right_title_color||"var(--primary-text-color)",right_value_color:n.right_value_color||"var(--primary-text-color)"}):i({right_enabled:!1,right_title:"",right_entity:"",right_template_mode:!1,right_template:""})}}
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
                    .hass=${t}
                    .data=${{right_title:n.right_title||""}}
                    .schema=${[{name:"right_title",selector:{text:{}},label:""}]}
                    @value-changed=${e=>i({right_title:e.detail.value.right_title})}
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
                    .hass=${t}
                    .data=${{right_entity:n.right_entity||""}}
                    .schema=${[{name:"right_entity",selector:{entity:{}},label:""}]}
                    @value-changed=${e=>i({right_entity:e.detail.value.right_entity})}
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
                    .hass=${t}
                    .data=${{right_template_mode:n.right_template_mode||!1}}
                    .schema=${[{name:"right_template_mode",selector:{boolean:{}},label:""}]}
                    @value-changed=${e=>i({right_template_mode:e.detail.value.right_template_mode})}
                  ></ha-form>
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Title Size
                  </div>
                  <ha-form
                    .hass=${t}
                    .data=${{right_title_size:n.right_title_size||14}}
                    .schema=${[{name:"right_title_size",selector:{number:{min:8,max:32,step:1,mode:"slider"}},label:""}]}
                    @value-changed=${e=>i({right_title_size:e.detail.value.right_title_size})}
                  ></ha-form>
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Value Size
                  </div>
                  <ha-form
                    .hass=${t}
                    .data=${{right_value_size:n.right_value_size||14}}
                    .schema=${[{name:"right_value_size",selector:{number:{min:8,max:32,step:1,mode:"slider"}},label:""}]}
                    @value-changed=${e=>i({right_value_size:e.detail.value.right_value_size})}
                  ></ha-form>
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
                  .hass=${t}
                  @value-changed=${e=>i({bar_color:e.detail.value})}
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
                  .hass=${t}
                  @value-changed=${e=>i({bar_background_color:e.detail.value})}
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
                  .hass=${t}
                  @value-changed=${e=>i({bar_border_color:e.detail.value})}
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
                  .hass=${t}
                  @value-changed=${e=>i({limit_color:e.detail.value})}
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
                  .hass=${t}
                  @value-changed=${e=>i({percentage_text_color:e.detail.value})}
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
                    style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;"
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
                        .hass=${t}
                        @value-changed=${e=>i({left_title_color:e.detail.value})}
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
                        .hass=${t}
                        @value-changed=${e=>i({left_value_color:e.detail.value})}
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
                    style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;"
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
                        .hass=${t}
                        @value-changed=${e=>i({right_title_color:e.detail.value})}
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
                        .hass=${t}
                        @value-changed=${e=>i({right_value_color:e.detail.value})}
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
            .hass=${t}
            .data=${{use_gradient:n.use_gradient||!1}}
            .schema=${[{name:"use_gradient",selector:{boolean:{}},label:""}]}
            @value-changed=${e=>i({use_gradient:e.detail.value.use_gradient})}
          ></ha-form>

          ${n.use_gradient?V`
                <div
                  class="field-title"
                  style="font-size: 16px !important; font-weight: 600 !important;"
                >
                  Gradient Display Mode
                </div>
                <ha-form
                  .hass=${t}
                  .data=${{gradient_display_mode:n.gradient_display_mode||"cropped"}}
                  .schema=${[{name:"gradient_display_mode",selector:{select:{options:[{value:"full",label:"Full"},{value:"cropped",label:"Cropped"}],mode:"dropdown"}},label:""}]}
                  @value-changed=${e=>i({gradient_display_mode:e.detail.value.gradient_display_mode})}
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
                  @gradient-changed=${e=>{i({gradient_stops:e.detail.stops})}}
                ></uc-gradient-editor>
              `:""}
        </div>
      </div>
    `}renderPreview(e,t){var o,i,n,a,r,l,s,d;const c=e,p=null==t?void 0:t.states[c.entity];let u=0,m=100,g="";p&&(u=parseFloat(p.state)||0,g=(null===(o=p.attributes)||void 0===o?void 0:o.unit_of_measurement)||"",(null===(i=p.attributes)||void 0===i?void 0:i.max)?m=parseFloat(p.attributes.max):("%"===g||"battery"===(null===(n=p.attributes)||void 0===n?void 0:n.device_class))&&(m=100));const h=Math.min(Math.max(u/m*100,0),100);let v="",b="";if(c.left_entity&&(null==t?void 0:t.states[c.left_entity])){const e=t.states[c.left_entity];v=e.state,b=(null===(a=e.attributes)||void 0===a?void 0:a.unit_of_measurement)||""}let f="",y="";if(c.right_entity&&(null==t?void 0:t.states[c.right_entity])){const e=t.states[c.right_entity];f=e.state,y=(null===(r=e.attributes)||void 0===r?void 0:r.unit_of_measurement)||""}let _=0;if(c.limit_entity&&(null==t?void 0:t.states[c.limit_entity])){const e=t.states[c.limit_entity],o=parseFloat(e.state)||0;_=Math.min(Math.max(o/m*100,0),100)}const x=c,w=c.height||20,$=c.border_radius||10;let k=c.bar_color||"var(--primary-color)",C="";if(c.use_gradient&&c.gradient_stops&&c.gradient_stops.length>0){const e=Fe(c.gradient_stops);if("full"===c.gradient_display_mode)C=`linear-gradient(to right, ${e})`,k=`linear-gradient(to right, ${e})`;else{const e=[...c.gradient_stops].sort(((e,t)=>e.position-t.position)),t=e.filter((e=>e.position<=h)).map(((e,t,o)=>{const i=1===o.length?0:e.position/h*100;return`${e.color} ${Math.min(i,100)}%`}));t.length>0&&(k=`linear-gradient(to right, ${t.join(", ")})`)}}let S="",I="";switch(c.bar_style){case"flat":S="box-shadow: none;";break;case"glossy":I=`\n          background: linear-gradient(to bottom, ${k}, ${k} 50%, rgba(0,0,0,0.1) 51%, ${k});\n          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);\n        `;break;case"embossed":S="\n          box-shadow: inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.8);\n          border: 1px solid rgba(0,0,0,0.1);\n        ",I="\n          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1);\n        ";break;case"inset":S="\n          box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);\n          border: 1px solid rgba(0,0,0,0.2);\n        ";break;case"gradient-overlay":I=`\n          background: linear-gradient(to bottom, \n            ${k} 0%, \n            rgba(255,255,255,0) 100%\n          );\n        `;break;case"neon-glow":I=`\n          box-shadow: 0 0 10px ${k}, 0 0 20px ${k}, 0 0 30px ${k};\n          filter: brightness(1.2);\n        `,S="\n          box-shadow: inset 0 0 10px rgba(0,0,0,0.5);\n        ";break;case"outline":S=`\n          border: 2px solid ${c.bar_border_color||"var(--primary-color)"};\n          background-color: transparent !important;\n        `,I=`\n          border: 2px solid ${k};\n          background-color: transparent !important;\n        `;break;case"glass":S="\n          backdrop-filter: blur(10px);\n          background-color: rgba(255,255,255,0.1) !important;\n          border: 1px solid rgba(255,255,255,0.2);\n        ",I="\n          backdrop-filter: blur(5px);\n          background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1)) !important;\n        ";break;case"metallic":I=`\n          background: linear-gradient(to bottom, \n            rgba(255,255,255,0.4) 0%, \n            ${k} 20%, \n            ${k} 80%, \n            rgba(0,0,0,0.2) 100%);\n          box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.3);\n        `;break;case"neumorphic":S="\n          box-shadow: inset 2px 2px 4px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(255,255,255,0.1);\n        ",I="\n          box-shadow: 2px 2px 4px rgba(0,0,0,0.1), -2px -2px 4px rgba(255,255,255,0.1);\n        ";break;case"dashed":I=`\n          background-image: repeating-linear-gradient(\n            90deg,\n            ${k} 0px,\n            ${k} 8px,\n            transparent 8px,\n            transparent 12px\n          );\n        `}const z={padding:x.padding_top||x.padding_bottom||x.padding_left||x.padding_right?`${this.addPixelUnit(x.padding_top)||"16px"} ${this.addPixelUnit(x.padding_right)||"16px"} ${this.addPixelUnit(x.padding_bottom)||"16px"} ${this.addPixelUnit(x.padding_left)||"16px"}`:"16px",margin:x.margin_top||x.margin_bottom||x.margin_left||x.margin_right?`${this.addPixelUnit(x.margin_top)||"0px"} ${this.addPixelUnit(x.margin_right)||"0px"} ${this.addPixelUnit(x.margin_bottom)||"16px"} ${this.addPixelUnit(x.margin_left)||"0px"}`:"0 0 16px 0",background:x.background_color||"transparent",backgroundImage:this.getBackgroundImageCSS(x,t),backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",border:x.border_style&&"none"!==x.border_style?`${x.border_width||"1px"} ${x.border_style} ${x.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(x.border_radius)||"0",position:x.position||"relative",top:x.top||"auto",bottom:x.bottom||"auto",left:x.left||"auto",right:x.right||"auto",zIndex:x.z_index||"auto",width:x.width||"100%",height:x.height||"auto",maxWidth:x.max_width||"100%",maxHeight:x.max_height||"none",minWidth:x.min_width||"none",minHeight:x.min_height||"auto",clipPath:x.clip_path||"none",backdropFilter:x.backdrop_filter||"none",boxSizing:"border-box"},T=`${c.bar_width||100}%`;let P="flex-start";switch(c.bar_alignment){case"left":P="flex-start";break;case"center":P="center";break;case"right":P="flex-end"}return V`
      <div class="bar-module-preview" style=${this.styleObjectToCss(z)}>
        ${c.name?V`<div
              class="bar-name"
              style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 8px; display: block;"
            >
              ${c.name}
            </div>`:""}

        <!-- Bar Container -->
        <div style="display: flex; justify-content: ${P}; width: 100%;">
          <div
            class="bar-container"
            style="
              width: ${T}; 
              height: ${w}px; 
              background: ${C||c.bar_background_color||"var(--secondary-background-color)"};
              border-radius: ${$}px;
              overflow: hidden;
              position: relative;
              transition: ${!1!==c.animation?"all 0.3s ease":"none"};
              border: ${c.bar_border_color&&"outline"!==c.bar_style?`1px solid ${c.bar_border_color}`:"none"};
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
                ${I}
              "
            ></div>

            <!-- Limit Indicator -->
            ${c.limit_entity&&(null==t?void 0:t.states[c.limit_entity])&&_>=0?V`
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
                    title="Limit: ${(null===(l=t.states[c.limit_entity])||void 0===l?void 0:l.state)||"N/A"}${(null===(d=null===(s=t.states[c.limit_entity])||void 0===s?void 0:s.attributes)||void 0===d?void 0:d.unit_of_measurement)||""}"
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
                    color: ${c.percentage_text_color||"white"};
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
                          style="font-size: ${c.left_title_size||14}px; color: ${c.left_title_color||"var(--primary-text-color)"};"
                        >
                          ${c.left_title}:
                        </span>
                        <span
                          style="font-size: ${c.left_value_size||14}px; font-weight: 600; color: ${c.left_value_color||"var(--primary-text-color)"}; margin-left: 4px;"
                        >
                          ${v}${b}
                        </span>
                      </div>
                    `:V`<div></div>`}
                ${c.right_enabled?V`
                      <div class="right-side-below" style="text-align: right;">
                        <span
                          style="font-size: ${c.right_title_size||14}px; color: ${c.right_title_color||"var(--primary-text-color)"};"
                        >
                          ${c.right_title}:
                        </span>
                        <span
                          style="font-size: ${c.right_value_size||14}px; font-weight: 600; color: ${c.right_value_color||"var(--primary-text-color)"}; margin-left: 4px;"
                        >
                          ${f}${y}
                        </span>
                      </div>
                    `:V`<div></div>`}
              </div>
            `:""}
      </div>
    `}validate(e){const t=e,o=[...super.validate(e).errors];return t.entity&&""!==t.entity.trim()||o.push("Entity ID is required"),t.height&&(t.height<5||t.height>200)&&o.push("Bar height must be between 5 and 200 pixels"),t.border_radius&&(t.border_radius<0||t.border_radius>100)&&o.push("Border radius must be between 0 and 100 pixels"),t.limit_entity&&""!==t.limit_entity.trim()&&(t.limit_entity.includes(".")||o.push("Limit entity must be a valid entity ID (e.g., sensor.battery_limit)")),{valid:0===o.length,errors:o}}getStyles(){return'\n      .bar-module-preview {\n        max-width: 100%;\n        overflow: hidden;\n        box-sizing: border-box;\n      }\n      \n      .bar-container {\n        width: 100%;\n        position: relative;\n        display: block;\n        box-sizing: border-box;\n      }\n      \n      .bar-fill {\n        position: relative;\n        z-index: 1;\n      }\n      \n      .bar-limit-line {\n        opacity: 0.9;\n        transition: opacity 0.2s ease;\n      }\n      \n      .bar-limit-line:hover {\n        opacity: 1;\n      }\n      \n      .bar-name {\n        font-size: 16px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n        margin-bottom: 8px;\n        user-select: none;\n        word-wrap: break-word;\n      }\n      \n      .bar-value {\n        user-select: none;\n        text-shadow: 0 1px 2px rgba(0,0,0,0.1);\n      }\n      \n      .bar-value-outside {\n        user-select: none;\n        text-align: center;\n        font-weight: 600;\n        color: var(--primary-text-color);\n      }\n      \n      .entity-error {\n        font-size: 12px;\n        color: var(--error-color);\n        margin-top: 6px;\n        font-style: italic;\n        opacity: 0.8;\n      }\n      \n      .settings-section {\n        margin-bottom: 16px;\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n      \n      .settings-section * {\n        box-sizing: border-box;\n      }\n      \n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        margin-bottom: 12px !important;\n        padding-bottom: 0 !important;\n        border-bottom: none !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n      \n      .settings-section label {\n        display: block;\n        font-weight: 500;\n        margin-bottom: 4px;\n        color: var(--primary-text-color);\n      }\n      \n      .settings-section input,\n      .settings-section select {\n        width: 100%;\n        max-width: 100%;\n        padding: 8px;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--card-background-color);\n        color: var(--primary-text-color);\n        font-size: 14px;\n        box-sizing: border-box;\n      }\n      \n      .settings-section .checkbox-wrapper {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        font-weight: 500;\n      }\n      \n      .settings-section .checkbox-wrapper input[type="checkbox"] {\n        width: auto;\n        margin: 0;\n      }\n      \n      .help-text {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        margin: 4px 0 0 0;\n        opacity: 0.8;\n        word-wrap: break-word;\n      }\n      \n      .number-input,\n      .text-input,\n      .entity-input,\n      .select-input {\n        transition: border-color 0.2s ease;\n      }\n      \n      .number-input:focus,\n      .text-input:focus,\n      .entity-input:focus,\n      .select-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 1px var(--primary-color);\n      }\n      \n      /* Fix padding overflow */\n      .module-general-settings {\n        max-width: 100%;\n        overflow: hidden;\n      }\n      \n      .module-general-settings > * {\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Conditional Fields Grouping CSS */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n      }\n\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      @keyframes slideInFromLeft {\n        from { \n          opacity: 0; \n          transform: translateX(-10px); \n        }\n        to { \n          opacity: 1; \n          transform: translateX(0); \n        }\n      }\n\n      /* Proper form field arrangement: Title -> Description -> Field */\n      .settings-section ha-form {\n        --ha-form-field-margin: 8px 0;\n      }\n\n      .settings-section ha-form::part(field) {\n        margin-bottom: 8px;\n      }\n\n      .settings-section ha-form .ha-form-label {\n        font-size: 14px;\n        font-weight: 500;\n        color: var(--primary-text-color);\n        margin-bottom: 4px;\n        display: block;\n      }\n\n      .settings-section ha-form .ha-form-description {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        margin-bottom: 8px;\n        display: block;\n        opacity: 0.8;\n        line-height: 1.4;\n      }\n\n      .settings-section ha-form mwc-formfield {\n        --mdc-typography-body2-font-size: 14px;\n      }\n\n      .settings-section ha-form ha-switch {\n        --switch-checked-color: var(--primary-color);\n        --switch-unchecked-color: var(--disabled-color);\n      }\n\n      /* Field arrangement styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n        color: var(--primary-text-color) !important;\n        margin-bottom: 4px !important;\n        padding-bottom: 0 !important;\n        border-bottom: none !important;\n        display: block !important;\n        line-height: 1.2 !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        display: block !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n        font-weight: 400 !important;\n      }\n\n      /* Remove labels from ultra-color-picker when using external titles */\n      .settings-section ultra-color-picker .color-label {\n        display: none;\n      }\n\n      /* Prevent form fields from going off screen */\n      .property-input, .property-select {\n        max-width: 500px;\n      }\n\n      /* Apply max-width to ha-form elements */\n      .settings-section ha-form {\n        max-width: 500px;\n      }\n\n      /* Apply max-width to form inputs and selects */\n      .settings-section input,\n      .settings-section select,\n      .settings-section ha-textfield,\n      .settings-section ha-select {\n        max-width: 500px;\n      }\n\n      /* Fix slider and input field layouts */\n      .settings-section .field-group {\n        max-width: 100%;\n        overflow: visible;\n      }\n\n      /* Ensure slider containers don\'t get cut off */\n      .settings-section ha-form[style*="flex: 1"] {\n        min-width: 200px;\n        flex: 1 1 200px;\n      }\n\n      /* Fix input field containers */\n      .settings-section input[type="number"] {\n        min-width: 60px;\n        max-width: 80px;\n        flex-shrink: 0;\n      }\n\n      /* Ensure proper spacing for slider + input combos */\n      .settings-section div[style*="display: flex; gap: 8px"] {\n        gap: 8px !important;\n        align-items: center !important;\n        flex-wrap: nowrap !important;\n        min-width: 0;\n      }\n\n      .settings-section div[style*="display: flex; gap: 12px"] {\n        gap: 12px !important;\n        align-items: center !important;\n        flex-wrap: nowrap !important;\n        min-width: 0;\n      }\n\n      /* Prevent overflow in gradient editor */\n      .gradient-editor {\n        max-width: 100%;\n        overflow: visible;\n      }\n\n      .gradient-stop {\n        max-width: 100%;\n        overflow: visible;\n        position: relative;\n      }\n\n      /* Gradient stop drag handle styling */\n      .gradient-stop .drag-handle {\n        transition: all 0.2s ease;\n      }\n\n      .gradient-stop:hover .drag-handle {\n        color: var(--primary-color) !important;\n        transform: scale(1.1);\n      }\n\n      /* Ultra color picker sizing */\n      ultra-color-picker {\n        min-width: 40px;\n        max-width: 60px;\n        flex-shrink: 0;\n      }\n\n      /* Ensure gradient controls don\'t overflow */\n      .gradient-stops {\n        max-width: 100%;\n        overflow: visible;\n      }\n\n      /* Hide automatic value displays from ha-form sliders to prevent cut-off */\n      .settings-section ha-form ha-slider::part(value-display),\n      .settings-section ha-form mwc-slider::part(value-display),\n      .settings-section ha-form ha-slider .value-display,\n      .settings-section ha-form mwc-slider .value-display {\n        display: none !important;\n      }\n\n      /* Hide any automatic number displays that might appear next to sliders */\n      .settings-section ha-form .slider-value,\n      .settings-section ha-form .current-value,\n      .settings-section ha-form .number-display {\n        display: none !important;\n      }\n\n      /* Override any default slider value display styles */\n      .settings-section ha-form[data-field*="size"] .mdc-slider-value-indicator,\n      .settings-section ha-form[data-field*="size"] .value-indicator {\n        display: none !important;\n      }\n\n      /* More comprehensive hiding of slider value displays */\n      .settings-section ha-form ha-textfield[type="number"],\n      .settings-section ha-form mwc-textfield[type="number"],\n      .settings-section ha-form .number-input-display {\n        display: none !important;\n      }\n\n      /* Target specific Home Assistant slider value containers */\n      .settings-section ha-form .form-group .number-display,\n      .settings-section ha-form .ha-form-number .display-value,\n      .settings-section ha-form [role="slider"] + *:not(.mdc-slider-track),\n      .settings-section ha-form .mdc-slider + .value-display {\n        display: none !important;\n      }\n\n      /* Ensure sliders take full width without value displays */\n      .settings-section ha-form .mdc-slider,\n      .settings-section ha-form ha-slider {\n        width: 100% !important;\n        max-width: 100% !important;\n      }\n\n      /* Hide any text elements that might display current values */\n      .settings-section ha-form .field-wrapper > span:last-child,\n      .settings-section ha-form .form-control > span:last-child,\n      .settings-section ha-form .slider-container > span:last-child {\n        display: none !important;\n      }\n\n      /* Specifically target number displays in form groups */\n      .settings-section ha-form .form-group > *:last-child:not(ha-slider):not(.mdc-slider):not(input[type="range"]) {\n        display: none !important;\n      }\n\n      /* Conditional Fields Grouping - Reusable Pattern */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n        border-left-color: var(--primary-color);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n        margin: 0;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n        background: transparent;\n      }\n\n      /* Remove top margin from first field in conditional groups */\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      /* Ensure proper spacing within conditional field groups */\n      .conditional-fields-content .field-title {\n        color: var(--primary-text-color);\n      }\n\n      .conditional-fields-content .field-description {\n        color: var(--secondary-text-color);\n        opacity: 0.9;\n      }\n\n      /* Animation for conditional fields appearing */\n      .conditional-fields-group {\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      @keyframes slideInFromLeft {\n        from {\n          opacity: 0;\n          transform: translateX(-10px);\n        }\n        to {\n          opacity: 1;\n          transform: translateX(0);\n        }\n      }\n\n      /* Make conditional fields responsive */\n      @media (max-width: 768px) {\n        .conditional-fields-group {\n          border-left-width: 3px;\n        }\n        \n        .conditional-fields-header {\n          padding: 10px 12px;\n          font-size: 13px;\n        }\n        \n        .conditional-fields-content {\n          padding: 12px;\n        }\n      }\n    '}styleObjectToCss(e){return Object.entries(e).map((([e,t])=>`${this.camelToKebab(e)}: ${t}`)).join("; ")}camelToKebab(e){return e.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}getBackgroundImageCSS(e,t){const o=e.background_image_type,i=e.background_image,n=e.background_image_entity;switch(o){case"upload":if(i)return i.startsWith("/api/image/serve/")?`url("${this.getImageUrl(t,i)}")`:(i.startsWith("data:image/"),`url("${i}")`);break;case"entity":if(n&&t){const e=t.states[n];if(e){const t=e.attributes.entity_picture||e.attributes.image||e.state;if(t&&"unknown"!==t&&"unavailable"!==t)return`url("${t}")`}}break;case"url":if(i)return`url("${i}")`;break;default:return"none"}return"none"}getImageUrl(e,t){if(!t)return"";if(t.startsWith("http"))return t;if(t.startsWith("data:image/"))return t;if(t.includes("/api/image/serve/")){const o=t.match(/\/api\/image\/serve\/([^\/]+)/);if(o&&o[1]){const i=o[1];try{return`${(e.hassUrl?e.hassUrl():"").replace(/\/$/,"")}/api/image/serve/${i}/original`}catch(e){return t}}return t}return t.startsWith("/")?`${(e.hassUrl?e.hassUrl():"").replace(/\/$/,"")}${t}`:t}getBarSizeFromHeight(e){return e<=12?"thin":e<=20?"regular":e<=30?"thick":"thiccc"}getBarRadiusFromStyle(e){return 0===e?"square":e<8?"rounded-square":"round"}addPixelUnit(e){return e?/^\d+$/.test(e)?`${e}px`:/^[\d\s]+$/.test(e)?e.split(" ").map((e=>e.trim()?`${e}px`:e)).join(" "):e:e}}class Be extends he{constructor(){super(...arguments),this.metadata={type:"icon",title:"Icons",description:"Interactive icon buttons",author:"WJD Designs",version:"1.0.0",icon:"mdi:circle",category:"interactive",tags:["icon","button","interactive","control"]}}createDefault(e){return{id:e||this.generateId("icon"),type:"icon",icons:[{id:this.generateId("icon-item"),entity:"weather.forecast_home",name:"Forecast",icon_inactive:"mdi:weather-partly-cloudy",icon_active:"mdi:weather-partly-cloudy",inactive_state:"off",active_state:"on",custom_inactive_state_text:"",custom_active_state_text:"",inactive_template_mode:!1,inactive_template:"",active_template_mode:!1,active_template:"",use_entity_color_for_icon:!1,color_inactive:"var(--secondary-text-color)",color_active:"var(--primary-color)",inactive_icon_color:"var(--secondary-text-color)",active_icon_color:"var(--primary-color)",inactive_name_color:"var(--primary-text-color)",active_name_color:"var(--primary-text-color)",inactive_state_color:"var(--secondary-text-color)",active_state_color:"var(--secondary-text-color)",show_name_when_inactive:!0,show_state_when_inactive:!0,show_icon_when_inactive:!0,show_name_when_active:!0,show_state_when_active:!0,show_icon_when_active:!0,show_state:!0,show_name:!0,show_units:!1,icon_size:24,text_size:12,icon_background:"none",use_entity_color_for_icon_background:!1,icon_background_color:"transparent",inactive_icon_animation:"none",active_icon_animation:"none",vertical_alignment:"center",container_width:void 0,container_background_shape:"none",tap_action:{action:"toggle"},hold_action:{action:"default"},double_tap_action:{action:"default"},click_action:"toggle",double_click_action:"none",hold_action_legacy:"none",navigation_path:"",url:"",service:"",service_data:{},template_mode:!1,template:"",dynamic_icon_template_mode:!1,dynamic_icon_template:"",dynamic_color_template_mode:!1,dynamic_color_template:""}],alignment:"center",vertical_alignment:"center",columns:3,gap:16}}renderGeneralTab(e,t,o,i){const n=e;return V`
      ${be.injectCleanFormStyles()}
      <div class="module-general-settings">
        ${n.icons.map(((e,o)=>V`
            <div
              class="settings-section"
              style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
            >
              <!-- Entity Selection -->
              ${be.renderField("Entity","Select the Home Assistant entity this icon will represent. Icon will auto-select from entity if available.",t,{entity:e.entity||""},[be.createSchemaItem("entity",{entity:{}})],(a=>{var r,l;const s=a.detail.value.entity,d={entity:s};if(s&&(null==t?void 0:t.states[s])){const o=t.states[s],i=null===(r=o.attributes)||void 0===r?void 0:r.icon;!i||e.icon_inactive&&"mdi:lightbulb-outline"!==e.icon_inactive&&"mdi:weather-partly-cloudy"!==e.icon_inactive||(d.icon_inactive=i,d.icon_active=i),!(null===(l=o.attributes)||void 0===l?void 0:l.friendly_name)||e.name&&"Sample Icon"!==e.name&&"Forecast"!==e.name&&"Icon"!==e.name||(d.name=o.attributes.friendly_name)}this._updateIcon(n,o,d,i)}))}

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
                    ${be.renderField("Active State",'Define when this icon should be considered "active"',t,{active_state:e.active_state||"on"},[be.createSchemaItem("active_state",{text:{}})],(e=>this._updateIcon(n,o,{active_state:e.detail.value.active_state},i)))}

                    <!-- Active Icon Picker -->
                    <div style="margin-top: 16px;">
                      ${be.renderField("Active Icon","Icon to show when the entity is in the active state",t,{icon_active:e.icon_active||"mdi:lightbulb"},[be.createSchemaItem("icon_active",{icon:{}})],(e=>this._updateIcon(n,o,{icon_active:e.detail.value.icon_active},i)))}
                    </div>

                    <!-- Custom Active State Text -->
                    <div style="margin-top: 16px;">
                      ${be.renderField("Custom Active State Text","Override the displayed state text when active",t,{custom_active_state_text:e.custom_active_state_text||""},[be.createSchemaItem("custom_active_state_text",{text:{}})],(e=>this._updateIcon(n,o,{custom_active_state_text:e.detail.value.custom_active_state_text},i)))}
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
                          ${be.renderField("","",t,{show_name_when_active:!1!==e.show_name_when_active},[be.createSchemaItem("show_name_when_active",{boolean:{}})],(e=>this._updateIcon(n,o,{show_name_when_active:e.detail.value.show_name_when_active},i)))}
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
                          ${be.renderField("","",t,{show_state_when_active:!1!==e.show_state_when_active},[be.createSchemaItem("show_state_when_active",{boolean:{}})],(e=>this._updateIcon(n,o,{show_state_when_active:e.detail.value.show_state_when_active},i)))}
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
                          ${be.renderField("","",t,{show_icon_when_active:!1!==e.show_icon_when_active},[be.createSchemaItem("show_icon_when_active",{boolean:{}})],(e=>this._updateIcon(n,o,{show_icon_when_active:e.detail.value.show_icon_when_active},i)))}
                        </div>
                      </div>
                    </div>

                    <!-- Icon Animation -->
                    <div style="margin-top: 16px;">
                      ${be.renderField("Icon Animation","Animation to apply to the icon when active",t,{active_icon_animation:e.active_icon_animation||"none"},[be.createSchemaItem("active_icon_animation",{select:{options:[{value:"none",label:"None"},{value:"pulse",label:"Pulse"},{value:"spin",label:"Spin"},{value:"bounce",label:"Bounce"},{value:"flash",label:"Flash"},{value:"shake",label:"Shake"},{value:"vibrate",label:"Vibrate"},{value:"rotate-left",label:"Rotate Left"},{value:"rotate-right",label:"Rotate Right"},{value:"fade",label:"Fade"},{value:"scale",label:"Scale"},{value:"tada",label:"Tada"}]}})],(e=>this._updateIcon(n,o,{active_icon_animation:e.detail.value.active_icon_animation},i)))}
                    </div>

                    <!-- Template Mode -->
                    <div style="margin-top: 16px;">
                      ${be.renderField("Template Mode","Use a template to determine when this icon should be active. Templates allow you to use Home Assistant templating syntax for complex conditions. (This disables regular state condition)",t,{active_template_mode:e.active_template_mode||!1},[be.createSchemaItem("active_template_mode",{boolean:{}})],(e=>this._updateIcon(n,o,{active_template_mode:e.detail.value.active_template_mode},i)))}
                      ${e.active_template_mode?this.renderConditionalFieldsGroup("Active Template Settings",V`
                              ${be.renderField("Active Template","Enter template code that returns true/false to determine active state",t,{active_template:e.active_template||""},[be.createSchemaItem("active_template",{text:{multiline:!0}})],(e=>this._updateIcon(n,o,{active_template:e.detail.value.active_template},i)))}
                            `):""}
                    </div>

                    <!-- Icon Size -->
                    <div style="margin-top: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        Active Icon Size
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                      >
                        Size of the icon when active (in pixels)
                      </div>
                      ${be.renderField("","",t,{active_icon_size:e.active_icon_size||24},[be.createSchemaItem("active_icon_size",{number:{min:12,max:72,step:2,mode:"slider"}})],(e=>this._updateIcon(n,o,{active_icon_size:Number(e.detail.value.active_icon_size)},i)))}
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
                      ${be.renderField("","",t,{active_icon_background:e.active_icon_background||"none"},[be.createSchemaItem("active_icon_background",{select:{options:[{value:"none",label:"None"},{value:"rounded-square",label:"Rounded Square"},{value:"circle",label:"Circle"}]}})],(e=>this._updateIcon(n,o,{active_icon_background:e.detail.value.active_icon_background},i)))}
                    </div>

                    <!-- Use Entity Color for Icon -->
                    <div style="margin-top: 16px;">
                      ${be.renderField("Use Entity Color for Icon","Use the color provided by the entity instead of custom colors",t,{use_entity_color_for_icon:e.use_entity_color_for_icon||!1},[be.createSchemaItem("use_entity_color_for_icon",{boolean:{}})],(e=>this._updateIcon(n,o,{use_entity_color_for_icon:e.detail.value.use_entity_color_for_icon},i)))}
                    </div>

                    <!-- Color Pickers (if not using entity color) -->
                    ${e.use_entity_color_for_icon?"":this.renderConditionalFieldsGroup("Active Color Settings",V`
                            <div style="display: flex; flex-direction: column; gap: 16px;">
                              <ultra-color-picker
                                .label=${"Active Icon Color"}
                                .value=${e.active_icon_color||"var(--primary-color)"}
                                .defaultValue=${"var(--primary-color)"}
                                .hass=${t}
                                @value-changed=${e=>this._updateIcon(n,o,{active_icon_color:e.detail.value},i)}
                              ></ultra-color-picker>

                              <ultra-color-picker
                                .label=${"Active Name Color"}
                                .value=${e.active_name_color||"var(--primary-text-color)"}
                                .defaultValue=${"var(--primary-text-color)"}
                                .hass=${t}
                                @value-changed=${e=>this._updateIcon(n,o,{active_name_color:e.detail.value},i)}
                              ></ultra-color-picker>

                              <ultra-color-picker
                                .label=${"Active State Color"}
                                .value=${e.active_state_color||"var(--secondary-text-color)"}
                                .defaultValue=${"var(--secondary-text-color)"}
                                .hass=${t}
                                @value-changed=${e=>this._updateIcon(n,o,{active_state_color:e.detail.value},i)}
                              ></ultra-color-picker>
                            </div>

                            <!-- Icon Background Color -->
                            ${"none"!==e.active_icon_background?V`
                                  <div style="margin-top: 16px;">
                                    <ultra-color-picker
                                      .label=${"Active Icon Background Color"}
                                      .value=${e.active_icon_background_color||"var(--card-background-color)"}
                                      .defaultValue=${"var(--card-background-color)"}
                                      .hass=${t}
                                      @value-changed=${e=>this._updateIcon(n,o,{active_icon_background_color:e.detail.value},i)}
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
                    ${be.renderField("Inactive State",'Define when this icon should be considered "inactive"',t,{inactive_state:e.inactive_state||"off"},[be.createSchemaItem("inactive_state",{text:{}})],(e=>this._updateIcon(n,o,{inactive_state:e.detail.value.inactive_state},i)))}

                    <!-- Inactive Icon Picker -->
                    <div style="margin-top: 16px;">
                      ${be.renderField("Inactive Icon","Icon to show when the entity is in the inactive state",t,{icon_inactive:e.icon_inactive||"mdi:lightbulb-outline"},[be.createSchemaItem("icon_inactive",{icon:{}})],(e=>this._updateIcon(n,o,{icon_inactive:e.detail.value.icon_inactive},i)))}
                    </div>

                    <!-- Custom Inactive State Text -->
                    <div style="margin-top: 16px;">
                      ${be.renderField("Custom Inactive State Text","Override the displayed state text when inactive",t,{custom_inactive_state_text:e.custom_inactive_state_text||""},[be.createSchemaItem("custom_inactive_state_text",{text:{}})],(e=>this._updateIcon(n,o,{custom_inactive_state_text:e.detail.value.custom_inactive_state_text},i)))}
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
                          ${be.renderField("","",t,{show_name_when_inactive:!1!==e.show_name_when_inactive},[be.createSchemaItem("show_name_when_inactive",{boolean:{}})],(e=>this._updateIcon(n,o,{show_name_when_inactive:e.detail.value.show_name_when_inactive},i)))}
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
                          ${be.renderField("","",t,{show_state_when_inactive:!1!==e.show_state_when_inactive},[be.createSchemaItem("show_state_when_inactive",{boolean:{}})],(e=>this._updateIcon(n,o,{show_state_when_inactive:e.detail.value.show_state_when_inactive},i)))}
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
                          ${be.renderField("","",t,{show_icon_when_inactive:!1!==e.show_icon_when_inactive},[be.createSchemaItem("show_icon_when_inactive",{boolean:{}})],(e=>this._updateIcon(n,o,{show_icon_when_inactive:e.detail.value.show_icon_when_inactive},i)))}
                        </div>
                      </div>
                    </div>

                    <!-- Icon Animation -->
                    <div style="margin-top: 16px;">
                      ${be.renderField("Icon Animation","Animation to apply to the icon when inactive",t,{inactive_icon_animation:e.inactive_icon_animation||"none"},[be.createSchemaItem("inactive_icon_animation",{select:{options:[{value:"none",label:"None"},{value:"pulse",label:"Pulse"},{value:"spin",label:"Spin"},{value:"bounce",label:"Bounce"},{value:"flash",label:"Flash"},{value:"shake",label:"Shake"},{value:"vibrate",label:"Vibrate"},{value:"rotate-left",label:"Rotate Left"},{value:"rotate-right",label:"Rotate Right"},{value:"fade",label:"Fade"},{value:"scale",label:"Scale"},{value:"tada",label:"Tada"}]}})],(e=>this._updateIcon(n,o,{inactive_icon_animation:e.detail.value.inactive_icon_animation},i)))}
                    </div>

                    <!-- Template Mode -->
                    <div style="margin-top: 16px;">
                      ${be.renderField("Template Mode","Use a template to determine when this icon should be inactive. Templates allow you to use Home Assistant templating syntax for complex conditions. (This disables regular state condition)",t,{inactive_template_mode:e.inactive_template_mode||!1},[be.createSchemaItem("inactive_template_mode",{boolean:{}})],(e=>this._updateIcon(n,o,{inactive_template_mode:e.detail.value.inactive_template_mode},i)))}
                      ${e.inactive_template_mode?this.renderConditionalFieldsGroup("Inactive Template Settings",V`
                              ${be.renderField("Inactive Template","Enter template code that returns true/false to determine inactive state",t,{inactive_template:e.inactive_template||""},[be.createSchemaItem("inactive_template",{text:{multiline:!0}})],(e=>this._updateIcon(n,o,{inactive_template:e.detail.value.inactive_template},i)))}
                            `):""}
                    </div>

                    <!-- Icon Size -->
                    <div style="margin-top: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        Inactive Icon Size
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                      >
                        Size of the icon when inactive (in pixels)
                      </div>
                      ${be.renderField("","",t,{inactive_icon_size:e.inactive_icon_size||24},[be.createSchemaItem("inactive_icon_size",{number:{min:12,max:72,step:2,mode:"slider"}})],(e=>this._updateIcon(n,o,{inactive_icon_size:Number(e.detail.value.inactive_icon_size)},i)))}
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
                      ${be.renderField("","",t,{inactive_icon_background:e.inactive_icon_background||"none"},[be.createSchemaItem("inactive_icon_background",{select:{options:[{value:"none",label:"None"},{value:"rounded-square",label:"Rounded Square"},{value:"circle",label:"Circle"}]}})],(e=>this._updateIcon(n,o,{inactive_icon_background:e.detail.value.inactive_icon_background},i)))}
                    </div>

                    <!-- Use Entity Color for Icon -->
                    <div style="margin-top: 16px;">
                      ${be.renderField("Use Entity Color for Icon","Use the color provided by the entity instead of custom colors",t,{use_entity_color_for_icon:e.use_entity_color_for_icon||!1},[be.createSchemaItem("use_entity_color_for_icon",{boolean:{}})],(e=>this._updateIcon(n,o,{use_entity_color_for_icon:e.detail.value.use_entity_color_for_icon},i)))}
                    </div>

                    <!-- Color Pickers (if not using entity color) -->
                    ${e.use_entity_color_for_icon?"":this.renderConditionalFieldsGroup("Inactive Color Settings",V`
                            <div style="display: flex; flex-direction: column; gap: 16px;">
                              <ultra-color-picker
                                .label=${"Inactive Icon Color"}
                                .value=${e.inactive_icon_color||"var(--secondary-text-color)"}
                                .defaultValue=${"var(--secondary-text-color)"}
                                .hass=${t}
                                @value-changed=${e=>this._updateIcon(n,o,{inactive_icon_color:e.detail.value},i)}
                              ></ultra-color-picker>

                              <ultra-color-picker
                                .label=${"Inactive Name Color"}
                                .value=${e.inactive_name_color||"var(--primary-text-color)"}
                                .defaultValue=${"var(--primary-text-color)"}
                                .hass=${t}
                                @value-changed=${e=>this._updateIcon(n,o,{inactive_name_color:e.detail.value},i)}
                              ></ultra-color-picker>

                              <ultra-color-picker
                                .label=${"Inactive State Color"}
                                .value=${e.inactive_state_color||"var(--secondary-text-color)"}
                                .defaultValue=${"var(--secondary-text-color)"}
                                .hass=${t}
                                @value-changed=${e=>this._updateIcon(n,o,{inactive_state_color:e.detail.value},i)}
                              ></ultra-color-picker>
                            </div>

                            <!-- Icon Background Color -->
                            ${"none"!==e.inactive_icon_background?V`
                                  <div style="margin-top: 16px;">
                                    <ultra-color-picker
                                      .label=${"Inactive Icon Background Color"}
                                      .value=${e.inactive_icon_background_color||"var(--card-background-color)"}
                                      .defaultValue=${"var(--card-background-color)"}
                                      .hass=${t}
                                      @value-changed=${e=>this._updateIcon(n,o,{inactive_icon_background_color:e.detail.value},i)}
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
    `}renderActionsTab(e,t,o,i){const n=e;return V`
      <div class="module-actions-settings">
        ${n.icons.map(((e,o)=>V`
            <div
              class="settings-section"
              style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
            >
              ${ve.render(t,{tap_action:e.tap_action||{action:"default"},hold_action:e.hold_action||{action:"default"},double_tap_action:e.double_tap_action||{action:"default"}},(e=>{const t={};e.tap_action&&(t.tap_action=e.tap_action),e.hold_action&&(t.hold_action=e.hold_action),e.double_tap_action&&(t.double_tap_action=e.double_tap_action),this._updateIcon(n,o,t,i)}),"Link Configuration")}
            </div>
          `))}
      </div>
    `}renderOtherTab(e,t,o,i){const n=e;return V`
      ${be.injectCleanFormStyles()}
      <div class="module-other-settings">
        ${n.icons.map(((e,o)=>V`
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
                ${be.renderField("","",t,{show_units:e.show_units||!1},[be.createSchemaItem("show_units",{boolean:{}})],(e=>this._updateIcon(n,o,{show_units:e.detail.value.show_units},i)))}
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
                  ${be.renderField("","",t,{vertical_alignment:e.vertical_alignment||"center"},[be.createSchemaItem("vertical_alignment",{select:{options:[{value:"top",label:"Top"},{value:"center",label:"Center"},{value:"bottom",label:"Bottom"}]}})],(e=>this._updateIcon(n,o,{vertical_alignment:e.detail.value.vertical_alignment},i)))}
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
                  ${be.renderField("","",t,{container_width:e.container_width||80},[be.createSchemaItem("container_width",{number:{min:40,max:200,step:5,mode:"slider"}})],(e=>this._updateIcon(n,o,{container_width:Number(e.detail.value.container_width)},i)))}
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
                  ${be.renderField("","",t,{container_background_shape:e.container_background_shape||"none"},[be.createSchemaItem("container_background_shape",{select:{options:[{value:"none",label:"None"},{value:"rounded",label:"Rounded"},{value:"square",label:"Square"},{value:"circle",label:"Circle"}]}})],(e=>this._updateIcon(n,o,{container_background_shape:e.detail.value.container_background_shape},i)))}
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
                  ${be.renderField("","",t,{dynamic_icon_template_mode:e.dynamic_icon_template_mode||!1},[be.createSchemaItem("dynamic_icon_template_mode",{boolean:{}})],(e=>this._updateIcon(n,o,{dynamic_icon_template_mode:e.detail.value.dynamic_icon_template_mode},i)))}
                  ${e.dynamic_icon_template_mode?this.renderConditionalFieldsGroup("Dynamic Icon Template Settings",V`
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
                            ${be.renderField("","",t,{dynamic_icon_template:e.dynamic_icon_template||""},[be.createSchemaItem("dynamic_icon_template",{text:{multiline:!0}})],(e=>this._updateIcon(n,o,{dynamic_icon_template:e.detail.value.dynamic_icon_template},i)))}
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
                  ${be.renderField("","",t,{dynamic_color_template_mode:e.dynamic_color_template_mode||!1},[be.createSchemaItem("dynamic_color_template_mode",{boolean:{}})],(e=>this._updateIcon(n,o,{dynamic_color_template_mode:e.detail.value.dynamic_color_template_mode},i)))}
                  ${e.dynamic_color_template_mode?this.renderConditionalFieldsGroup("Dynamic Color Template Settings",V`
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
                            ${be.renderField("","",t,{dynamic_color_template:e.dynamic_color_template||""},[be.createSchemaItem("dynamic_color_template",{text:{multiline:!0}})],(e=>this._updateIcon(n,o,{dynamic_color_template:e.detail.value.dynamic_color_template},i)))}
                          </div>
                        `):""}
                </div>
              </div>
            </div>
          `))}
      </div>
    `}renderPreview(e,t){const o=e,i=o,n={padding:i.padding_top||i.padding_bottom||i.padding_left||i.padding_right?`${i.padding_top||"8"}px ${i.padding_right||"0"}px ${i.padding_bottom||"8"}px ${i.padding_left||"0"}px`:"8px 0",margin:i.margin_top||i.margin_bottom||i.margin_left||i.margin_right?`${i.margin_top||"0"}px ${i.margin_right||"0"}px ${i.margin_bottom||"0"}px ${i.margin_left||"0"}px`:"0",background:i.background_color||"transparent",backgroundImage:this.getBackgroundImageCSS(i,t),backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",border:i.border_style&&"none"!==i.border_style?`${i.border_width||"1px"} ${i.border_style} ${i.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(i.border_radius)||"0",position:i.position||"relative",top:i.top||"auto",bottom:i.bottom||"auto",left:i.left||"auto",right:i.right||"auto",zIndex:i.z_index||"auto",width:i.width||"100%",height:i.height||"auto",maxWidth:i.max_width||"100%",maxHeight:i.max_height||"none",minWidth:i.min_width||"none",minHeight:i.min_height||"auto",overflow:i.overflow||"visible",clipPath:i.clip_path||"none",backdropFilter:i.backdrop_filter||"none",boxShadow:i.box_shadow_h&&i.box_shadow_v?`${i.box_shadow_h||"0"} ${i.box_shadow_v||"0"} ${i.box_shadow_blur||"0"} ${i.box_shadow_spread||"0"} ${i.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"};return V`
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
            ${o.icons.slice(0,6).map((e=>{var o,i,n,a;const r=null==t?void 0:t.states[e.entity],l=(null==r?void 0:r.state)||"unknown",s=l===e.active_state,d=s?!1!==e.show_icon_when_active:!1!==e.show_icon_when_inactive,c=s?!1!==e.show_name_when_active:!1!==e.show_name_when_inactive,p=s?!1!==e.show_state_when_active:!1!==e.show_state_when_inactive;let u=s&&e.icon_active||e.icon_inactive;(null===(o=null==r?void 0:r.attributes)||void 0===o?void 0:o.icon)&&(u=r.attributes.icon);const m=e.use_entity_color_for_icon&&(null===(i=null==r?void 0:r.attributes)||void 0===i?void 0:i.rgb_color)?`rgb(${r.attributes.rgb_color.join(",")})`:s?e.active_icon_color:e.inactive_icon_color,g=s?e.active_name_color:e.inactive_name_color,h=s?e.active_state_color:e.inactive_state_color,v=e.name||(null===(n=null==r?void 0:r.attributes)||void 0===n?void 0:n.friendly_name)||e.entity,b=s?e.custom_active_state_text||l:e.custom_inactive_state_text||l,f=s?e.active_icon_background||e.icon_background:e.inactive_icon_background||e.icon_background,y=s?e.active_icon_background_color||e.icon_background_color:e.inactive_icon_background_color||e.icon_background_color,_="none"!==f?{backgroundColor:e.use_entity_color_for_icon_background&&(null===(a=null==r?void 0:r.attributes)||void 0===a?void 0:a.rgb_color)?`rgb(${r.attributes.rgb_color.join(",")})`:y,borderRadius:"circle"===f?"50%":"rounded-square"===f?"8px":"0",padding:"8px",display:"flex",alignItems:"center",justifyContent:"center"}:{},x=s?"none"!==e.active_icon_animation?`icon-animation-${e.active_icon_animation}`:"":"none"!==e.inactive_icon_animation?`icon-animation-${e.inactive_icon_animation}`:"",w={display:"flex",flexDirection:"column",alignItems:"center",justifyContent:e.vertical_alignment||"center",gap:"4px",padding:"8px",borderRadius:"circle"===e.container_background_shape?"50%":"rounded"===e.container_background_shape?"8px":"square"===e.container_background_shape?"0":"8px",background:"transparent",cursor:"pointer",transition:"all 0.2s ease",width:e.container_width?`${e.container_width}px`:"auto",minWidth:"60px"};return V`
                <div
                  class="icon-item-preview ${x}"
                  style=${this.styleObjectToCss(w)}
                >
                  ${d?V`
                        <div style=${this.styleObjectToCss(_)}>
                          <ha-icon
                            icon="${u||"mdi:help-circle"}"
                            style="
                      color: ${m||"var(--secondary-text-color)"};
                      font-size: ${Number(s?e.active_icon_size||e.icon_size:e.inactive_icon_size||e.icon_size)||24}px;
                      --mdc-icon-size: ${Number(s?e.active_icon_size||e.icon_size:e.inactive_icon_size||e.icon_size)||24}px;
                      width: ${Number(s?e.active_icon_size||e.icon_size:e.inactive_icon_size||e.icon_size)||24}px;
                      height: ${Number(s?e.active_icon_size||e.icon_size:e.inactive_icon_size||e.icon_size)||24}px;
                    "
                          ></ha-icon>
                        </div>
                      `:""}
                  ${c?V`
                        <div
                          class="icon-name"
                          style="
                      font-size: ${e.text_size||12}px;
                        color: ${g||"var(--primary-text-color)"};
                      text-align: center;
                      line-height: 1.2;
                        max-width: 80px;
                      word-wrap: break-word;
                    "
                        >
                          ${v}
                        </div>
                      `:""}
                  ${p?V`
                        <div
                          class="icon-state"
                          style="
                      font-size: ${Math.max((e.text_size||12)-2,10)}px;
                        color: ${h||"var(--secondary-text-color)"};
                      text-align: center;
                    "
                        >
                          ${b}
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
    `}validate(e){const t=e,o=[...super.validate(e).errors];return t.icons&&0!==t.icons.length||o.push("At least one icon is required"),t.icons.forEach(((e,t)=>{e.entity&&""!==e.entity.trim()||o.push(`Icon ${t+1}: Entity ID is required`),e.icon_inactive&&""!==e.icon_inactive.trim()||o.push(`Icon ${t+1}: Inactive icon is required`)})),{valid:0===o.length,errors:o}}getStyles(){return'\n      .icon-module-preview {\n        padding: 8px;\n        min-height: 60px;\n      }\n      \n      .icon-grid {\n        width: 100%;\n      }\n      \n      .icon-item-preview:hover {\n        background: var(--primary-color) !important;\n        color: white;\n        transform: scale(1.05);\n      }\n      \n      .icon-item-preview:hover ha-icon {\n        color: white !important;\n      }\n      \n      .icon-item-preview:hover .icon-name,\n      .icon-item-preview:hover .icon-state {\n        color: white !important;\n      }\n      \n      /* Field styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n        color: var(--primary-text-color) !important;\n        margin-bottom: 4px !important;\n        display: block !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        display: block !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      .settings-section {\n        margin-bottom: 16px;\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Conditional Fields Grouping CSS */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n      }\n\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      @keyframes slideInFromLeft {\n        from { \n          opacity: 0; \n          transform: translateX(-10px); \n        }\n        to { \n          opacity: 1; \n          transform: translateX(0); \n        }\n      }\n\n      /* Expandable details styling */\n      details > summary {\n        list-style: none;\n      }\n\n      details > summary::-webkit-details-marker {\n        display: none;\n      }\n\n      details[open] > summary ha-icon {\n        transform: rotate(90deg);\n      }\n\n      details > summary:hover {\n        background: rgba(var(--rgb-primary-color), 0.1) !important;\n      }\n\n      /* Icon animations */\n      .icon-animation-pulse {\n        animation: iconPulse 2s ease-in-out infinite;\n      }\n\n      .icon-animation-spin {\n        animation: iconSpin 2s linear infinite;\n      }\n\n      .icon-animation-bounce {\n        animation: iconBounce 1s ease-in-out infinite;\n      }\n\n      .icon-animation-flash {\n        animation: iconFlash 1s ease-in-out infinite;\n      }\n\n      .icon-animation-shake {\n        animation: iconShake 0.5s ease-in-out infinite;\n      }\n\n      @keyframes iconPulse {\n        0%, 100% { opacity: 1; transform: scale(1); }\n        50% { opacity: 0.7; transform: scale(1.1); }\n      }\n\n      @keyframes iconSpin {\n        from { transform: rotate(0deg); }\n        to { transform: rotate(360deg); }\n      }\n\n      @keyframes iconBounce {\n        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }\n        40% { transform: translateY(-10px); }\n        60% { transform: translateY(-5px); }\n      }\n\n      @keyframes iconFlash {\n        0%, 50%, 100% { opacity: 1; }\n        25%, 75% { opacity: 0.3; }\n      }\n\n      @keyframes iconShake {\n        0%, 100% { transform: translateX(0); }\n        10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }\n        20%, 40%, 60%, 80% { transform: translateX(2px); }\n      }\n\n      /* Add icon button styling */\n      .add-icon-btn:hover {\n        background: var(--primary-color);\n        color: white;\n      }\n      \n      /* Remove icon button styling */\n      .remove-icon-btn:disabled {\n        opacity: 0.3;\n        cursor: not-allowed;\n      }\n\n      /* Icon picker specific styling */\n      ha-icon-picker {\n        --ha-icon-picker-width: 100%;\n        --ha-icon-picker-height: 56px;\n      }\n\n      /* Text field and select consistency */\n      ha-textfield,\n      ha-select {\n        --mdc-shape-small: 8px;\n        --mdc-theme-primary: var(--primary-color);\n      }\n\n      /* Grid styling for layout options */\n      .settings-section[style*="grid"] > div {\n        min-width: 0;\n      }\n\n      /* Responsive adjustments */\n      @media (max-width: 768px) {\n        .settings-section[style*="grid-template-columns: 1fr 1fr 1fr"] {\n          grid-template-columns: 1fr !important;\n          gap: 12px !important;\n        }\n\n        .settings-section[style*="grid-template-columns: 1fr 1fr"] {\n          grid-template-columns: 1fr !important;\n          gap: 12px !important;\n        }\n\n        .conditional-fields-group {\n          border-left-width: 3px;\n        }\n        \n        .conditional-fields-header {\n          padding: 10px 12px;\n          font-size: 13px;\n        }\n        \n        .conditional-fields-content {\n        padding: 12px;\n        }\n      }\n\n      /* Ensure form elements don\'t overflow */\n      .settings-section ha-form {\n        max-width: 100%;\n        overflow: visible;\n      }\n\n      /* Color picker adjustments */\n      .settings-section ha-form[data-field*="color"] {\n        min-height: 56px;\n      }\n\n      /* Boolean toggle adjustments */\n      .settings-section ha-form[data-field*="mode"] {\n        display: flex;\n        align-items: center;\n        min-height: auto;\n      }\n\n      /* Number slider adjustments */\n      .settings-section ha-form[data-field*="size"] .mdc-slider,\n      .settings-section ha-form[data-field*="gap"] .mdc-slider,\n      .settings-section ha-form[data-field*="columns"] .mdc-slider {\n        width: 100%;\n        max-width: 100%;\n      }\n    '}_addIcon(e,t){const o={id:this.generateId("icon-item"),entity:"weather.forecast_home",name:"Forecast",icon_inactive:"mdi:weather-partly-cloudy",icon_active:"mdi:weather-partly-cloudy",inactive_state:"off",active_state:"on",custom_inactive_state_text:"",custom_active_state_text:"",inactive_template_mode:!1,inactive_template:"",active_template_mode:!1,active_template:"",use_entity_color_for_icon:!1,color_inactive:"var(--secondary-text-color)",color_active:"var(--primary-color)",inactive_icon_color:"var(--secondary-text-color)",active_icon_color:"var(--primary-color)",inactive_name_color:"var(--primary-text-color)",active_name_color:"var(--primary-text-color)",inactive_state_color:"var(--secondary-text-color)",active_state_color:"var(--secondary-text-color)",show_name_when_inactive:!0,show_state_when_inactive:!0,show_icon_when_inactive:!0,show_name_when_active:!0,show_state_when_active:!0,show_icon_when_active:!0,show_state:!0,show_name:!0,icon_size:24,text_size:12,active_icon_size:24,inactive_icon_size:24,icon_background:"none",use_entity_color_for_icon_background:!1,icon_background_color:"transparent",active_icon_background:"none",inactive_icon_background:"none",active_icon_background_color:"transparent",inactive_icon_background_color:"transparent",inactive_icon_animation:"none",active_icon_animation:"none",show_units:!1,vertical_alignment:"center",container_width:void 0,container_background_shape:"none",tap_action:{action:"toggle"},hold_action:{action:"default"},double_tap_action:{action:"default"},click_action:"toggle",double_click_action:"none",hold_action_legacy:"none",navigation_path:"",url:"",service:"",service_data:{},template_mode:!1,template:"",dynamic_icon_template_mode:!1,dynamic_icon_template:"",dynamic_color_template_mode:!1,dynamic_color_template:""};t({icons:[...e.icons,o]})}_removeIcon(e,t,o){if(e.icons.length<=1)return;const i=e.icons.filter(((e,o)=>o!==t));o({icons:i})}_updateIcon(e,t,o,i){const n=e.icons.map(((e,i)=>i===t?Object.assign(Object.assign({},e),o):e));i({icons:n})}getBackgroundImageCSS(e,t){var o,i;if(!e.background_image_type||"none"===e.background_image_type)return"none";switch(e.background_image_type){case"upload":case"url":if(e.background_image)return`url("${e.background_image}")`;break;case"entity":if(e.background_image_entity&&(null==t?void 0:t.states[e.background_image_entity])){const n=t.states[e.background_image_entity];let a="";if((null===(o=n.attributes)||void 0===o?void 0:o.entity_picture)?a=n.attributes.entity_picture:(null===(i=n.attributes)||void 0===i?void 0:i.image)?a=n.attributes.image:n.state&&"string"==typeof n.state&&(n.state.startsWith("/")||n.state.startsWith("http"))&&(a=n.state),a)return a.startsWith("/local/")||a.startsWith("/media/")||a.startsWith("/"),`url("${a}")`}}return"none"}styleObjectToCss(e){return Object.entries(e).map((([e,t])=>`${e.replace(/[A-Z]/g,(e=>`-${e.toLowerCase()}`))}: ${t}`)).join("; ")}addPixelUnit(e){return e?/^\d+$/.test(e)?`${e}px`:/^[\d\s]+$/.test(e)?e.split(" ").map((e=>e.trim()?`${e}px`:e)).join(" "):e:e}}class He{static getInstance(){return He.instance||(He.instance=new He),He.instance}setHass(e){this.hass=e}async executeAction(e){if(this.hass&&e.action_type&&"none"!==e.action_type)try{if(e.confirmation&&!confirm(e.confirmation.text||"Are you sure?"))return;switch(e.action_type){case"toggle":e.entity&&await this.hass.callService("homeassistant","toggle",{entity_id:e.entity});break;case"show_more_info":if(e.entity){const t=new CustomEvent("hass-more-info",{detail:{entityId:e.entity},bubbles:!0,composed:!0});document.dispatchEvent(t)}break;case"navigate":if(e.navigation_path){history.pushState(null,"",e.navigation_path);const t=new CustomEvent("location-changed",{detail:{replace:!1},bubbles:!0,composed:!0});window.dispatchEvent(t)}break;case"url":if(e.url||e.url_path){const t=e.url||e.url_path||"";window.open(t,"_blank")}break;case"call_service":if(e.service){const[t,o]=e.service.split(".");t&&o&&await this.hass.callService(t,o,e.service_data,e.target)}break;case"perform_action":if(e.custom_action){const t=new CustomEvent("action",{detail:{action:"tap",config:e.custom_action},bubbles:!0,composed:!0});document.dispatchEvent(t)}break;case"show_map":if(e.latitude&&e.longitude){const t=`/map?latitude=${e.latitude}&longitude=${e.longitude}`;history.pushState(null,"",t);const o=new CustomEvent("location-changed",{detail:{replace:!1},bubbles:!0,composed:!0});window.dispatchEvent(o)}break;case"voice_assistant":if(!1!==e.start_listening){const e=new CustomEvent("hass-start-voice-conversation",{bubbles:!0,composed:!0});document.dispatchEvent(e)}break;case"trigger":e.entity&&await this.hass.callService("automation","trigger",{entity_id:e.entity});break;default:console.warn("Unknown action type:",e.action_type)}}catch(e){console.error("Error executing action:",e)}}getActionTypeOptions(){return[{value:"none",label:"No Action"},{value:"toggle",label:"Toggle"},{value:"show_more_info",label:"Show More Info"},{value:"navigate",label:"Navigate to Path"},{value:"url",label:"Open URL"},{value:"call_service",label:"Call Service"},{value:"perform_action",label:"Perform Action"},{value:"show_map",label:"Show Map"},{value:"voice_assistant",label:"Voice Assistant"},{value:"trigger",label:"Trigger"}]}validateAction(e){const t=[];if(!e.action_type||"none"===e.action_type)return{valid:!0,errors:[]};switch(e.action_type){case"toggle":case"show_more_info":case"trigger":e.entity||t.push("Entity is required for this action type");break;case"navigate":e.navigation_path||t.push("Navigation path is required");break;case"url":e.url||e.url_path||t.push("URL is required");break;case"call_service":e.service?e.service.includes(".")||t.push("Service must be in domain.service format"):t.push("Service is required");break;case"show_map":void 0!==e.latitude&&void 0!==e.longitude||t.push("Latitude and longitude are required for map action")}return{valid:0===t.length,errors:t}}renderActionForm(e,t,o){return{action:t,actionTypes:this.getActionTypeOptions(),onUpdate:o,validate:()=>this.validateAction(t)}}}const Ve=He.getInstance();class Ge extends he{constructor(){super(...arguments),this.metadata={type:"button",title:"Button",description:"Interactive buttons with actions",author:"WJD Designs",version:"1.0.0",icon:"mdi:gesture-tap-button",category:"interactive",tags:["button","action","click","interactive"]}}createDefault(e){return{id:e||this.generateId("button"),type:"button",label:"Click Me",action:{action_type:"none"},style:"flat",alignment:"center",icon:"",icon_position:"before",show_icon:!1,background_color:"var(--primary-color)",text_color:"white"}}getButtonStyles(){return[{value:"flat",label:"Flat (Default)"},{value:"glossy",label:"Glossy"},{value:"embossed",label:"Embossed"},{value:"inset",label:"Inset"},{value:"gradient-overlay",label:"Gradient Overlay"},{value:"neon-glow",label:"Neon Glow"},{value:"outline",label:"Outline"},{value:"glass",label:"Glass"},{value:"metallic",label:"Metallic"},{value:"neumorphic",label:"Neumorphic"},{value:"dashed",label:"Dashed"}]}getAlignmentOptions(){return[{value:"left",label:"Left"},{value:"center",label:"Center"},{value:"right",label:"Right"},{value:"justify",label:"Full Width"}]}getIconPositionOptions(){return[{value:"before",label:"Before Text"},{value:"after",label:"After Text"}]}renderGeneralTab(e,t,o,i){const n=e;return V`
      ${be.injectCleanFormStyles()}
      <div class="button-module-settings">
        <!-- Button Label Section -->
        <div class="settings-section" style="margin-bottom: 16px;">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin-bottom: 16px;"
          >
            Button Label
          </div>

          ${be.renderField("Button Text","The text displayed on the button",t,{label:n.label||"Click Me"},[be.createSchemaItem("label",{text:{}})],(e=>i({label:e.detail.value.label})))}
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

          ${this.renderLinkActionForm(n.action||{action_type:"none"},t,(e=>i({action:e})))}
        </div>

        <!-- Button Style Section -->
        <div class="settings-section" style="margin-bottom: 16px;">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin-bottom: 16px;"
          >
            Style
          </div>

          ${be.renderField("Button Style","Choose the visual style of the button",t,{style:n.style||"flat"},[be.createSchemaItem("style",{select:{options:this.getButtonStyles(),mode:"dropdown"}})],(e=>i({style:e.detail.value.style})))}
        </div>

        <!-- Background Color Section -->
        <div class="settings-section" style="margin-bottom: 16px;">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin-bottom: 16px;"
          >
            Colors
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <ultra-color-picker
              .label=${"Background Color"}
              .value=${n.background_color||"var(--primary-color)"}
              .defaultValue=${"var(--primary-color)"}
              .hass=${t}
              @value-changed=${e=>i({background_color:e.detail.value})}
            ></ultra-color-picker>

            <ultra-color-picker
              .label=${"Text Color"}
              .value=${n.text_color||"white"}
              .defaultValue=${"white"}
              .hass=${t}
              @value-changed=${e=>i({text_color:e.detail.value})}
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

          <div style="display: flex; gap: 8px; justify-content: flex-start;">
            ${this.getAlignmentOptions().map((e=>V`
                <button
                  type="button"
                  style="padding: 8px 12px; border: 2px solid ${(n.alignment||"center")===e.value?"var(--primary-color)":"var(--divider-color)"}; background: ${(n.alignment||"center")===e.value?"var(--primary-color)":"transparent"}; color: ${(n.alignment||"center")===e.value?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                  @click=${()=>i({alignment:e.value})}
                >
                  <ha-icon
                    icon="mdi:format-align-${"justify"===e.value?"center":e.value}"
                    style="font-size: 16px;"
                  ></ha-icon>
                  ${e.label}
                </button>
              `))}
          </div>
        </div>

        <!-- Icon Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;"
          >
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; color: var(--primary-color);"
            >
              Icon
            </div>
            ${be.renderCleanForm(t,{show_icon:n.show_icon||!1},[be.createSchemaItem("show_icon",{boolean:{}})],(e=>i({show_icon:e.detail.value.show_icon})))}
          </div>

          ${n.show_icon?V`
                <div class="field-group" style="margin-bottom: 16px;">
                  ${be.renderField("Icon","Choose an icon for the button",t,{icon:n.icon||""},[be.createSchemaItem("icon",{icon:{}})],(e=>i({icon:e.detail.value.icon})))}
                </div>

                <div class="field-group">
                  <div class="field-title" style="margin-bottom: 8px;">Icon Position</div>
                  <div style="display: flex; gap: 8px;">
                    ${this.getIconPositionOptions().map((e=>V`
                        <button
                          type="button"
                          style="padding: 8px 12px; border: 2px solid ${(n.icon_position||"before")===e.value?"var(--primary-color)":"var(--divider-color)"}; background: ${(n.icon_position||"before")===e.value?"var(--primary-color)":"transparent"}; color: ${(n.icon_position||"before")===e.value?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer;"
                          @click=${()=>i({icon_position:e.value})}
                        >
                          ${e.label}
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
    `}renderLinkActionForm(e,t,o){const i=Ve.getActionTypeOptions();return V`
      <div class="link-action-form">
        <!-- Action Type -->
        <div class="field-group" style="margin-bottom: 16px;">
          ${be.renderField("Action Type","Choose what happens when the button is clicked",t,{action_type:e.action_type||"none"},[be.createSchemaItem("action_type",{select:{options:i,mode:"dropdown"}})],(t=>o(Object.assign(Object.assign({},e),{action_type:t.detail.value.action_type}))))}
        </div>

        ${this.renderActionTypeSpecificFields(e,t,o)}
      </div>
    `}renderActionTypeSpecificFields(e,t,o){switch(e.action_type){case"toggle":case"show_more_info":case"trigger":return be.renderField("Entity","Select the entity to interact with",t,{entity:e.entity||""},[be.createSchemaItem("entity",{entity:{}})],(t=>o(Object.assign(Object.assign({},e),{entity:t.detail.value.entity}))));case"navigate":return be.renderField("Navigation Path","Path to navigate to (e.g., /dashboard/energy)",t,{navigation_path:e.navigation_path||""},[be.createSchemaItem("navigation_path",{text:{}})],(t=>o(Object.assign(Object.assign({},e),{navigation_path:t.detail.value.navigation_path}))));case"url":return be.renderField("URL","URL to open (e.g., https://example.com)",t,{url:e.url||""},[be.createSchemaItem("url",{text:{}})],(t=>o(Object.assign(Object.assign({},e),{url:t.detail.value.url}))));case"call_service":return V`
          <div class="field-group" style="margin-bottom: 16px;">
            ${be.renderField("Service","Service to call (e.g., light.turn_on)",t,{service:e.service||""},[be.createSchemaItem("service",{text:{}})],(t=>o(Object.assign(Object.assign({},e),{service:t.detail.value.service}))))}
          </div>

          <div class="field-group">
            ${be.renderField("Service Data (JSON)","Additional data for the service call in JSON format",t,{service_data:JSON.stringify(e.service_data||{},null,2)},[be.createSchemaItem("service_data",{text:{multiline:!0}})],(t=>{try{const i=JSON.parse(t.detail.value.service_data||"{}");o(Object.assign(Object.assign({},e),{service_data:i}))}catch(e){console.warn("Invalid JSON in service data")}}))}
          </div>
        `;case"show_map":return V`
          <div class="field-group" style="margin-bottom: 16px;">
            ${be.renderField("Latitude","Latitude coordinate for the map location",t,{latitude:e.latitude||0},[be.createSchemaItem("latitude",{number:{min:-90,max:90,step:1e-6}})],(t=>o(Object.assign(Object.assign({},e),{latitude:t.detail.value.latitude}))))}
          </div>

          <div class="field-group">
            ${be.renderField("Longitude","Longitude coordinate for the map location",t,{longitude:e.longitude||0},[be.createSchemaItem("longitude",{number:{min:-180,max:180,step:1e-6}})],(t=>o(Object.assign(Object.assign({},e),{longitude:t.detail.value.longitude}))))}
          </div>
        `;default:return V``}}renderPreview(e,t){const o=e,i=o,n={backgroundColor:i.background_color||o.background_color||"var(--primary-color)",textColor:i.color||o.text_color||"white",fontSize:i.font_size?`${i.font_size}px`:"14px",fontFamily:i.font_family||"inherit",fontWeight:i.font_weight||"500",fontStyle:i.font_style||"normal",textTransform:i.text_transform||"none",textShadow:this.getTextShadowCSS(i)},a=this.getButtonStyleCSS(o.style||"flat",n.backgroundColor,n.textColor,n.fontSize,n.fontFamily,n.fontWeight,n.textTransform,n.fontStyle,n.textShadow),r=this.getAlignmentCSS(o.alignment||"center"),l={padding:i.padding_top||i.padding_bottom||i.padding_left||i.padding_right?`${i.padding_top||"0"}px ${i.padding_right||"0"}px ${i.padding_bottom||"0"}px ${i.padding_left||"0"}px`:"0",margin:i.margin_top||i.margin_bottom||i.margin_left||i.margin_right?`${i.margin_top||"0"}px ${i.margin_right||"0"}px ${i.margin_bottom||"0"}px ${i.margin_left||"0"}px`:"0",background:i.background_color&&i.background_color!==n.backgroundColor?i.background_color:"transparent",backgroundImage:this.getBackgroundImageCSS(i,t),backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",border:i.border_style&&"none"!==i.border_style?`${i.border_width||"1px"} ${i.border_style} ${i.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(i.border_radius)||"0",position:i.position||"relative",top:i.top||"auto",bottom:i.bottom||"auto",left:i.left||"auto",right:i.right||"auto",zIndex:i.z_index||"auto",width:i.width||"100%",height:i.height||"auto",maxWidth:i.max_width||"100%",maxHeight:i.max_height||"none",minWidth:i.min_width||"none",minHeight:i.min_height||"auto",overflow:i.overflow||"visible",clipPath:i.clip_path||"none",backdropFilter:i.backdrop_filter||"none",boxShadow:i.box_shadow_h&&i.box_shadow_v?`${i.box_shadow_h||"0"} ${i.box_shadow_v||"0"} ${i.box_shadow_blur||"0"} ${i.box_shadow_spread||"0"} ${i.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"};return V`
      <div class="button-module-container" style=${this.styleObjectToCss(l)}>
        <div class="button-module-preview" style="${r}">
          <button
            class="ultra-button ${o.style||"flat"} ${"justify"===o.alignment?"justify":""}"
            style="${a} ${"justify"===o.alignment?"width: 100%;":""}"
            @click=${()=>{o.action&&(Ve.setHass(t),Ve.executeAction(o.action))}}
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
    `}getButtonStyleCSS(e,t="var(--primary-color)",o="white",i="14px",n="inherit",a="500",r="none",l="normal",s="none"){const d=`\n      padding: 12px 24px;\n      border-radius: 6px;\n      border: none;\n      cursor: pointer;\n      font-size: ${i};\n      font-family: ${n};\n      font-weight: ${a};\n      font-style: ${l};\n      text-transform: ${r};\n      text-shadow: ${s};\n      transition: all 0.2s ease;\n      display: inline-flex;\n      align-items: center;\n      justify-content: center;\n      min-height: 40px;\n      text-decoration: none;\n      background: ${t};\n      color: ${o};\n    `;let c="",p="";switch(e){case"flat":c="box-shadow: none;";break;case"glossy":p=`\n          background: linear-gradient(to bottom, ${t}, ${t} 50%, rgba(0,0,0,0.1) 51%, ${t}) !important;\n          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);\n        `;break;case"embossed":c="\n          box-shadow: inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.8);\n          border: 1px solid rgba(0,0,0,0.1);\n        ",p="\n          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1);\n        ";break;case"inset":c="\n          box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);\n          border: 1px solid rgba(0,0,0,0.2);\n        ";break;case"gradient-overlay":p=`\n          background: linear-gradient(to bottom, \n            ${t} 0%, \n            rgba(255,255,255,0) 100%\n          ) !important;\n        `;break;case"neon-glow":p=`\n          box-shadow: 0 0 10px ${t}, 0 0 20px ${t}, 0 0 30px ${t};\n          filter: brightness(1.2);\n        `,c="\n          box-shadow: inset 0 0 10px rgba(0,0,0,0.5);\n        ";break;case"outline":c=`\n          border: 2px solid ${t};\n          background-color: transparent !important;\n          color: ${t} !important;\n        `;break;case"glass":c="\n          backdrop-filter: blur(10px);\n          background-color: rgba(255,255,255,0.1) !important;\n          border: 1px solid rgba(255,255,255,0.2);\n        ",p="\n          backdrop-filter: blur(5px);\n          background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1)) !important;\n        ";break;case"metallic":p=`\n          background: linear-gradient(to bottom, \n            rgba(255,255,255,0.4) 0%, \n            ${t} 20%, \n            ${t} 80%, \n            rgba(0,0,0,0.2) 100%) !important;\n          box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.3);\n        `;break;case"neumorphic":c="\n          box-shadow: inset 2px 2px 4px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(255,255,255,0.1);\n        ",p="\n          box-shadow: 2px 2px 4px rgba(0,0,0,0.1), -2px -2px 4px rgba(255,255,255,0.1);\n        ";break;case"dashed":c=`\n          border: 2px dashed ${t};\n          background-color: transparent !important;\n          color: ${t} !important;\n        `}return`${d} ${c} ${p}`}getAlignmentCSS(e){switch(e){case"left":return"display: flex; justify-content: flex-start;";case"center":default:return"display: flex; justify-content: center;";case"right":return"display: flex; justify-content: flex-end;";case"justify":return"display: flex; width: 100%;"}}validate(e){const t=e,o=[...super.validate(e).errors];if(t.label&&""!==t.label.trim()||o.push("Button label is required"),t.action){const e=Ve.validateAction(t.action);o.push(...e.errors)}return{valid:0===o.length,errors:o}}getTextShadowCSS(e){return e.text_shadow_h||e.text_shadow_v||e.text_shadow_blur||e.text_shadow_color?`${e.text_shadow_h||"0px"} ${e.text_shadow_v||"0px"} ${e.text_shadow_blur||"0px"} ${e.text_shadow_color||"rgba(0,0,0,0.5)"}`:"none"}styleObjectToCss(e){return Object.entries(e).map((([e,t])=>`${this.camelToKebab(e)}: ${t}`)).join("; ")}camelToKebab(e){return e.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}getBackgroundImageCSS(e,t){var o,i;if(!e.background_image_type||"none"===e.background_image_type)return"none";switch(e.background_image_type){case"upload":case"url":if(e.background_image)return`url("${e.background_image}")`;break;case"entity":if(e.background_image_entity&&(null==t?void 0:t.states[e.background_image_entity])){const n=t.states[e.background_image_entity];let a="";if((null===(o=n.attributes)||void 0===o?void 0:o.entity_picture)?a=n.attributes.entity_picture:(null===(i=n.attributes)||void 0===i?void 0:i.image)?a=n.attributes.image:n.state&&"string"==typeof n.state&&(n.state.startsWith("/")||n.state.startsWith("http"))&&(a=n.state),a)return`url("${a}")`}}return"none"}addPixelUnit(e){return e?/^\d+$/.test(e)?`${e}px`:/^[\d\s]+$/.test(e)?e.split(" ").map((e=>e.trim()?`${e}px`:e)).join(" "):e:e}getStyles(){return"\n      .button-module-preview {\n        width: 100%;\n        box-sizing: border-box;\n      }\n      \n      .ultra-button:hover {\n        transform: translateY(-1px);\n        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);\n      }\n      \n      .ultra-button:active {\n        transform: translateY(0);\n      }\n      \n      .ultra-button.justify {\n        width: 100%;\n      }\n    "}}class We extends he{constructor(){super(...arguments),this.metadata={type:"markdown",title:"Markdown Module",description:"Display rich markdown content",author:"WJD Designs",version:"1.0.0",icon:"mdi:language-markdown",category:"content",tags:["markdown","content","rich-text","formatting","template"]}}createDefault(e){return{id:e||this.generateId("markdown"),type:"markdown",markdown_content:"# Welcome to Markdown\n\nThis is a **markdown** module that supports:\n\n- *Italic* and **bold** text\n- [Links](https://example.com)\n- `inline code`\n- Lists and more!\n\n## Features\n1. Headers (H1-H6)\n2. Tables\n3. Code blocks\n4. And much more...\n\n> This is a blockquote example",link:"",hide_if_no_link:!1,template_mode:!1,template:"",enable_html:!1,enable_tables:!0,enable_code_highlighting:!0,max_height:"none",overflow_behavior:"visible"}}renderGeneralTab(e,t,o,i){const n=e;return V`
      <div class="module-general-settings">
        <!-- Content Section -->
        <div class="wpbakery-section">
          <h4>Markdown Content</h4>
          <div class="ha-form-field">
            <ha-form
              .hass=${t}
              .data=${{markdown_content:n.markdown_content||""}}
              .schema=${[{name:"markdown_content",label:"Content",description:"Enter your markdown content with full formatting support",selector:{text:{multiline:!0}}}]}
              .computeLabel=${e=>e.label||e.name}
              .computeDescription=${e=>e.description||""}
              @value-changed=${e=>i({markdown_content:e.detail.value.markdown_content})}
            ></ha-form>
          </div>
        </div>

        <!-- Link & Behavior Section -->
        <div class="wpbakery-section">
          <h4>Link & Behavior</h4>
          <div class="two-column-grid">
            <div class="ha-form-field">
              <ha-form
                .hass=${t}
                .data=${{link:n.link||""}}
                .schema=${[{name:"link",label:"Link URL",description:"Optional URL to make the markdown clickable",selector:{text:{}}}]}
                .computeLabel=${e=>e.label||e.name}
                .computeDescription=${e=>e.description||""}
                @value-changed=${e=>i({link:e.detail.value.link})}
              ></ha-form>
            </div>
            <div class="ha-form-field">
              <ha-form
                .hass=${t}
                .data=${{hide_if_no_link:n.hide_if_no_link||!1}}
                .schema=${[{name:"hide_if_no_link",label:"Hide if No Link",description:"Hide module when no link is provided",selector:{boolean:{}}}]}
                .computeLabel=${e=>e.label||e.name}
                .computeDescription=${e=>e.description||""}
                @value-changed=${e=>i({hide_if_no_link:e.detail.value.hide_if_no_link})}
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
                .hass=${t}
                .data=${{max_height:n.max_height||"none"}}
                .schema=${[{name:"max_height",label:"Max Height",description:"Maximum height (e.g., 300px, 50vh, none)",selector:{text:{}}}]}
                .computeLabel=${e=>e.label||e.name}
                .computeDescription=${e=>e.description||""}
                @value-changed=${e=>i({max_height:e.detail.value.max_height})}
              ></ha-form>
            </div>
            <div class="ha-form-field">
              <ha-form
                .hass=${t}
                .data=${{overflow_behavior:n.overflow_behavior||"visible"}}
                .schema=${[{name:"overflow_behavior",label:"Overflow Behavior",selector:{select:{options:[{value:"visible",label:"Visible"},{value:"scroll",label:"Scroll"},{value:"hidden",label:"Hidden"}],mode:"dropdown"}}}]}
                .computeLabel=${e=>e.label||e.name}
                @value-changed=${e=>i({overflow_behavior:e.detail.value.overflow_behavior})}
              ></ha-form>
            </div>
          </div>

          <!-- Feature Toggles -->
          <div class="three-column-grid">
            <ha-form
              .hass=${t}
              .data=${{enable_html:n.enable_html||!1}}
              .schema=${[{name:"enable_html",label:"Enable HTML",description:"Allow HTML tags in markdown",selector:{boolean:{}}}]}
              .computeLabel=${e=>e.label||e.name}
              .computeDescription=${e=>e.description||""}
              @value-changed=${e=>i({enable_html:e.detail.value.enable_html})}
            ></ha-form>

            <ha-form
              .hass=${t}
              .data=${{enable_tables:!1!==n.enable_tables}}
              .schema=${[{name:"enable_tables",label:"Enable Tables",description:"Support for markdown tables",selector:{boolean:{}}}]}
              .computeLabel=${e=>e.label||e.name}
              .computeDescription=${e=>e.description||""}
              @value-changed=${e=>i({enable_tables:e.detail.value.enable_tables})}
            ></ha-form>

            <ha-form
              .hass=${t}
              .data=${{enable_code_highlighting:!1!==n.enable_code_highlighting}}
              .schema=${[{name:"enable_code_highlighting",label:"Code Highlighting",description:"Syntax highlighting for code blocks",selector:{boolean:{}}}]}
              .computeLabel=${e=>e.label||e.name}
              .computeDescription=${e=>e.description||""}
              @value-changed=${e=>i({enable_code_highlighting:e.detail.value.enable_code_highlighting})}
            ></ha-form>
          </div>
        </div>

        <!-- Template Mode Section -->
        <div class="wpbakery-section">
          <h4>Template Mode</h4>

          <ha-form
            .hass=${t}
            .data=${{template_mode:n.template_mode||!1}}
            .schema=${[{name:"template_mode",label:"Enable Template Mode",description:"Use Home Assistant Jinja2 templates for dynamic content",selector:{boolean:{}}}]}
            .computeLabel=${e=>e.label||e.name}
            .computeDescription=${e=>e.description||""}
            @value-changed=${e=>i({template_mode:e.detail.value.template_mode})}
          ></ha-form>

          ${n.template_mode?V`
                <div style="margin-top: 16px;">
                  <ha-form
                    .hass=${t}
                    .data=${{template:n.template||""}}
                    .schema=${[{name:"template",label:"Template",description:'Jinja2 template for dynamic content (e.g., {{ states("sensor.temperature") }}°C)',selector:{text:{multiline:!0}}}]}
                    .computeLabel=${e=>e.label||e.name}
                    .computeDescription=${e=>e.description||""}
                    @value-changed=${e=>i({template:e.detail.value.template})}
                  ></ha-form>
                </div>
              `:""}
        </div>
      </div>
    `}renderPreview(e,t){const o=e;if(o.hide_if_no_link&&(!o.link||""===o.link.trim()))return V`<div class="markdown-module-hidden">Hidden (no link)</div>`;const i=o,n={padding:i.padding_top||i.padding_bottom||i.padding_left||i.padding_right?`${i.padding_top||"8"}px ${i.padding_right||"0"}px ${i.padding_bottom||"8"}px ${i.padding_left||"0"}px`:"8px 0",margin:i.margin_top||i.margin_bottom||i.margin_left||i.margin_right?`${i.margin_top||"0"}px ${i.margin_right||"0"}px ${i.margin_bottom||"0"}px ${i.margin_left||"0"}px`:"0",background:i.background_color&&"transparent"!==i.background_color?i.background_color:"transparent",backgroundImage:this.getBackgroundImageCSS(i,t),backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",border:i.border_style&&"none"!==i.border_style?`${i.border_width||"1px"} ${i.border_style} ${i.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(i.border_radius)||"0",position:i.position||"static",top:i.top||"auto",bottom:i.bottom||"auto",left:i.left||"auto",right:i.right||"auto",zIndex:i.z_index||"auto",width:i.width||"100%",height:i.height||"auto",maxWidth:i.max_width||"100%",maxHeight:i.max_height||"none",minWidth:i.min_width||"none",minHeight:i.min_height||"auto",overflow:i.overflow||"visible",clipPath:i.clip_path||"none",backdropFilter:i.backdrop_filter||"none",boxShadow:i.box_shadow_h&&i.box_shadow_v?`${i.box_shadow_h||"0"} ${i.box_shadow_v||"0"} ${i.box_shadow_blur||"0"} ${i.box_shadow_spread||"0"} ${i.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"},a={fontSize:i.font_size?`${i.font_size}px`:`${o.font_size||14}px`,fontFamily:i.font_family||o.font_family||"Roboto",color:i.color||o.color||"var(--primary-text-color)",textAlign:i.text_align||o.alignment||"left",lineHeight:i.line_height||o.line_height||1.6,letterSpacing:i.letter_spacing||o.letter_spacing||"normal",padding:i.padding_top||i.padding_bottom||i.padding_left||i.padding_right?`${i.padding_top||"8"}px ${i.padding_right||"0"}px ${i.padding_bottom||"8"}px ${i.padding_left||"0"}px`:"8px 0",maxHeight:o.max_height&&"none"!==o.max_height?o.max_height:"none",overflow:o.max_height&&"none"!==o.max_height&&o.overflow_behavior||"visible",textShadow:i.text_shadow_h&&i.text_shadow_v?`${i.text_shadow_h||"0"} ${i.text_shadow_v||"0"} ${i.text_shadow_blur||"0"} ${i.text_shadow_color||"rgba(0,0,0,0.5)"}`:"none",boxShadow:i.box_shadow_h&&i.box_shadow_v?`${i.box_shadow_h||"0"} ${i.box_shadow_v||"0"} ${i.box_shadow_blur||"0"} ${i.box_shadow_spread||"0"} ${i.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none"},r=o.template_mode&&o.template?`Template: ${o.template}`:(e=>{if(!e)return"";let t=e.replace(/^#{6} (.*$)/gim,"<h6>$1</h6>").replace(/^#{5} (.*$)/gim,"<h5>$1</h5>").replace(/^#{4} (.*$)/gim,"<h4>$1</h4>").replace(/^#{3} (.*$)/gim,"<h3>$1</h3>").replace(/^#{2} (.*$)/gim,"<h2>$1</h2>").replace(/^#{1} (.*$)/gim,"<h1>$1</h1>").replace(/\*\*\*(.*?)\*\*\*/g,"<strong><em>$1</em></strong>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>").replace(/`(.*?)`/g,"<code>$1</code>").replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>').replace(/^> (.*$)/gim,"<blockquote>$1</blockquote>").replace(/^---$/gim,"<hr>").replace(/^\*\*\*$/gim,"<hr>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br/>");return t="<p>"+t+"</p>",t=t.replace(/<p><\/p>/g,""),t=t.replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g,"$1"),t=t.replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/g,"$1"),t=t.replace(/<p>(<hr>)<\/p>/g,"$1"),t=t.replace(/^[-*+] (.*$)/gim,"<li>$1</li>"),t=t.replace(/^(\d+)\. (.*$)/gim,"<li>$2</li>"),t=t.replace(/(<li>[\s\S]*?<\/li>(?:\s*<li>[\s\S]*?<\/li>)*)/g,"<ul>$1</ul>"),t})(o.markdown_content||""),l=o.link&&""!==o.link.trim()?V`<a href="${o.link}" style="color: inherit; text-decoration: inherit;">
            <div class="markdown-content" .innerHTML=${r}></div>
          </a>`:V`<div class="markdown-content" .innerHTML=${r}></div>`;return V`
      <div class="markdown-module-container" style=${this.styleObjectToCss(n)}>
        <div class="markdown-module-preview" style=${this.styleObjectToCss(a)}>
          ${l}
        </div>
      </div>
    `}validate(e){const t=e,o=[...super.validate(e).errors];if(t.markdown_content&&""!==t.markdown_content.trim()||o.push("Markdown content is required"),t.font_size&&(t.font_size<1||t.font_size>200)&&o.push("Font size must be between 1 and 200 pixels"),t.link&&""!==t.link.trim())try{new URL(t.link)}catch(e){t.link.startsWith("/")||t.link.startsWith("#")||o.push('Link must be a valid URL or start with "/" for relative paths')}return{valid:0===o.length,errors:o}}getStyles(){return"\n      .markdown-module-preview {\n        min-height: 20px;\n        word-wrap: break-word;\n      }\n      \n      .markdown-module-hidden {\n        color: var(--secondary-text-color);\n        font-style: italic;\n        text-align: center;\n        padding: 12px;\n        background: var(--secondary-background-color);\n        border-radius: 4px;\n      }\n\n      .markdown-content {\n        width: 100%;\n      }\n      \n             /* Module-specific grid layouts */\n       .two-column-grid {\n         display: grid;\n         grid-template-columns: 1fr 1fr;\n         gap: 20px;\n         margin-bottom: 20px;\n       }\n\n       .three-column-grid {\n         display: grid;\n         grid-template-columns: 1fr 1fr 1fr;\n         gap: 16px;\n         margin-bottom: 20px;\n       }\n       \n       @media (max-width: 768px) {\n         .two-column-grid,\n         .three-column-grid {\n           grid-template-columns: 1fr;\n           gap: 16px;\n         }\n       }\n\n      .markdown-content h1,\n      .markdown-content h2,\n      .markdown-content h3,\n      .markdown-content h4,\n      .markdown-content h5,\n      .markdown-content h6 {\n        margin: 16px 0 8px 0;\n        font-weight: 600;\n        line-height: 1.2;\n      }\n\n      .markdown-content h1 { font-size: 2em; }\n      .markdown-content h2 { font-size: 1.5em; }\n      .markdown-content h3 { font-size: 1.25em; }\n      .markdown-content h4 { font-size: 1.1em; }\n      .markdown-content h5 { font-size: 1em; font-weight: 700; }\n      .markdown-content h6 { font-size: 0.9em; font-weight: 700; }\n\n      .markdown-content p {\n        margin: 8px 0;\n        line-height: inherit;\n      }\n\n      .markdown-content ul,\n      .markdown-content ol {\n        margin: 8px 0;\n        padding-left: 20px;\n      }\n\n      .markdown-content li {\n        margin: 4px 0;\n        line-height: inherit;\n      }\n\n      .markdown-content code {\n        background: var(--secondary-background-color);\n        padding: 2px 4px;\n        border-radius: 3px;\n        font-family: 'Courier New', monospace;\n        font-size: 0.9em;\n      }\n\n      .markdown-content blockquote {\n        border-left: 4px solid var(--primary-color);\n        margin: 16px 0;\n        padding: 8px 16px;\n        background: var(--secondary-background-color);\n        font-style: italic;\n      }\n\n      .markdown-content a {\n        color: var(--primary-color);\n        text-decoration: none;\n      }\n\n      .markdown-content a:hover {\n        text-decoration: underline;\n      }\n\n      .markdown-content strong {\n        font-weight: 600;\n      }\n\n      .markdown-content em {\n        font-style: italic;\n      }\n\n      .markdown-content br {\n        line-height: inherit;\n      }\n      \n      .markdown-content hr {\n        border: none;\n        border-top: 1px solid var(--divider-color);\n        margin: 16px 0;\n      }\n      \n      .markdown-content table {\n        border-collapse: collapse;\n        width: 100%;\n        margin: 16px 0;\n      }\n      \n      .markdown-content th,\n      .markdown-content td {\n        border: 1px solid var(--divider-color);\n        padding: 8px 12px;\n        text-align: left;\n      }\n      \n      .markdown-content th {\n        background: var(--secondary-background-color);\n        font-weight: 600;\n      }\n    "}styleObjectToCss(e){return Object.entries(e).map((([e,t])=>`${this.camelToKebab(e)}: ${t}`)).join("; ")}camelToKebab(e){return e.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}getBackgroundImageCSS(e,t){var o,i;if(!e.background_image_type||"none"===e.background_image_type)return"none";switch(e.background_image_type){case"upload":case"url":if(e.background_image)return`url("${e.background_image}")`;break;case"entity":if(e.background_image_entity&&(null==t?void 0:t.states[e.background_image_entity])){const n=t.states[e.background_image_entity];let a="";if((null===(o=n.attributes)||void 0===o?void 0:o.entity_picture)?a=n.attributes.entity_picture:(null===(i=n.attributes)||void 0===i?void 0:i.image)?a=n.attributes.image:n.state&&"string"==typeof n.state&&(n.state.startsWith("/")||n.state.startsWith("http"))&&(a=n.state),a)return a.startsWith("/local/")||a.startsWith("/media/")||a.startsWith("/"),`url("${a}")`}}return"none"}addPixelUnit(e){return e?/^\d+$/.test(e)?`${e}px`:/^[\d\s]+$/.test(e)?e.split(" ").map((e=>e.trim()?`${e}px`:e)).join(" "):e:e}}class qe extends he{constructor(){super(...arguments),this.metadata={type:"horizontal",title:"Horizontal Layout",description:"Arrange modules in rows",author:"Ultra Card Team",version:"1.0.0",icon:"mdi:view-sequential",category:"layout",tags:["layout","horizontal","alignment","container"]}}createDefault(e){return{id:e||this.generateId("horizontal"),type:"horizontal",alignment:"left",gap:.7,wrap:!1,modules:[]}}renderGeneralTab(e,t,o,i){var n;const a=e;return V`
      <div class="module-general-settings">
        <!-- Horizontal Alignment -->
        <div class="form-group">
          <label class="form-label">Items Horizontal Alignment</label>
          <div class="alignment-buttons horizontal-alignment">
            ${[{value:"left",label:"Left"},{value:"center",label:"Center"},{value:"right",label:"Right"},{value:"space-between",label:"Space Between"},{value:"space-around",label:"Space Around"},{value:"justify",label:"Justify"}].map((e=>V`
                <button
                  type="button"
                  class="alignment-button ${a.alignment===e.value?"active":""}"
                  @click=${()=>i({alignment:e.value})}
                  title="${e.label}"
                >
                  ${this.getHorizontalAlignmentIcon(e.value)}
                </button>
              `))}
          </div>
        </div>

        <!-- Gap between Items -->
        <div class="form-group">
          <label class="form-label">Gap between Items</label>
          <div class="gap-control">
            ${this.renderSelect("",(null===(n=a.gap)||void 0===n?void 0:n.toString())||"0.7",[{value:"0",label:"0rem"},{value:"0.2",label:"0.2rem"},{value:"0.4",label:"0.4rem"},{value:"0.6",label:"0.6rem"},{value:"0.7",label:"0.7rem"},{value:"0.8",label:"0.8rem"},{value:"1.0",label:"1.0rem"},{value:"1.2",label:"1.2rem"},{value:"1.5",label:"1.5rem"},{value:"2.0",label:"2.0rem"}],(e=>i({gap:parseFloat(e)})),"Space between horizontal items")}
            <div class="gap-slider">
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                .value=${a.gap.toString()}
                @input=${e=>{const t=e.target;i({gap:parseFloat(t.value)})}}
                class="gap-range"
              />
            </div>
          </div>
        </div>

        <!-- Allow Wrap -->
        ${this.renderCheckbox("Allow move items to the next line",a.wrap||!1,(e=>i({wrap:e})),"Allow items to wrap to the next line if they don't fit")}
      </div>
    `}renderPreview(e,t){const o=e,i=o.modules&&o.modules.length>0;return V`
      <div class="horizontal-module-preview">
        <div
          class="horizontal-preview-content"
          style="
            display: flex;
            flex-direction: row;
            justify-content: ${this.getJustifyContent(o.alignment)};
            gap: ${o.gap||.7}rem;
            flex-wrap: ${o.wrap?"wrap":"nowrap"};
            align-items: flex-start;
            width: 100%;
            min-height: 60px;
            padding: 8px;
          "
        >
          ${i?o.modules.map(((e,o)=>V`
                  <div
                    class="child-module-preview"
                    style="max-width: 100%; overflow: hidden; flex-shrink: 1;"
                  >
                    ${this._renderChildModulePreview(e,t)}
                  </div>
                `)):V`
                <div class="empty-layout-message">
                  <span>No modules added yet</span>
                  <small>Add modules in the layout builder to see them here</small>
                </div>
              `}
        </div>
      </div>
    `}_renderChildModulePreview(e,t){const o=Ze().getModule(e.type);return o?o.renderPreview(e,t):V`
      <div class="unknown-child-module">
        <ha-icon icon="mdi:help-circle"></ha-icon>
        <span>Unknown Module: ${e.type}</span>
      </div>
    `}_getModuleTitle(e){const t=e;return t.name?t.name:t.text?t.text.length>15?`${t.text.substring(0,15)}...`:t.text:`${e.type.charAt(0).toUpperCase()+e.type.slice(1)} Module`}_getModuleIcon(e){return{text:"mdi:text",image:"mdi:image",icon:"mdi:star",bar:"mdi:chart-box",button:"mdi:gesture-tap-button",separator:"mdi:minus",info:"mdi:information",markdown:"mdi:language-markdown"}[e]||"mdi:puzzle"}validate(e){const t=e,o=[...super.validate(e).errors];if(t.gap&&(t.gap<0||t.gap>10)&&o.push("Gap must be between 0 and 10 rem"),t.modules&&t.modules.length>0)for(const e of t.modules)"vertical"===e.type&&o.push("Vertical layout modules cannot be placed inside horizontal layout modules"),"horizontal"===e.type&&o.push("Horizontal layout modules cannot be nested inside other horizontal layout modules");return{valid:0===o.length,errors:o}}getHorizontalAlignmentIcon(e){switch(e){case"left":default:return V`<ha-icon icon="mdi:format-align-left"></ha-icon>`;case"center":return V`<ha-icon icon="mdi:format-align-center"></ha-icon>`;case"right":return V`<ha-icon icon="mdi:format-align-right"></ha-icon>`;case"justify":return V`<ha-icon icon="mdi:format-align-justify"></ha-icon>`}}getJustifyContent(e){switch(e){case"left":default:return"flex-start";case"center":return"center";case"right":return"flex-end";case"justify":return"space-between"}}getAlignItems(e){switch(e){case"top":default:return"flex-start";case"center":return"center";case"bottom":return"flex-end"}}_onDragOver(e){e.preventDefault(),e.stopPropagation()}_onDragEnter(e){e.preventDefault(),e.stopPropagation()}_onDragLeave(e){e.preventDefault(),e.stopPropagation()}_onDrop(e){e.preventDefault(),e.stopPropagation(),console.log("Module dropped into horizontal layout")}_onModuleDragStart(e,t){e.stopPropagation(),console.log("Module drag started:",t)}_onDragEnd(e){e.preventDefault(),e.stopPropagation(),console.log("Drag ended")}_onAddModuleClick(e){e.preventDefault(),e.stopPropagation(),console.log("Add module clicked")}getStyles(){return"\n      /* Container Module Specific Variables */\n      .container-module {\n        --container-primary-color: #9c27b0; /* Purple for layout modules */\n        --container-secondary-color: #e1bee7; /* Light purple */\n        --container-accent-color: #7b1fa2; /* Dark purple */\n        --container-border-color: #ba68c8; /* Medium purple */\n      }\n      \n      .horizontal-module-preview.container-module {\n        border: 2px solid var(--container-border-color);\n        border-radius: 8px;\n        background: var(--card-background-color);\n        overflow: hidden;\n        position: relative;\n      }\n      \n      .container-header {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 12px 16px;\n        background: var(--container-primary-color);\n        color: white;\n        font-weight: 500;\n        border-bottom: 2px solid var(--container-primary-color);\n      }\n      \n      .container-drag-handle {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        width: 20px;\n        height: 20px;\n        color: rgba(255, 255, 255, 0.8);\n        cursor: grab;\n        transition: opacity 0.2s ease;\n        --mdc-icon-size: 16px;\n      }\n      \n      .container-drag-handle:hover {\n        color: white;\n      }\n      \n      .container-drag-handle:active {\n        cursor: grabbing;\n      }\n      \n      .container-badge {\n        background: rgba(255, 255, 255, 0.2);\n        color: white;\n        padding: 2px 8px;\n        border-radius: 12px;\n        font-size: 10px;\n        font-weight: 600;\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n        margin-left: auto;\n      }\n      \n      .container-content {\n        padding: 16px;\n        min-height: 120px;\n        display: flex;\n        border: 2px dashed var(--container-secondary-color);\n        margin: 8px;\n        border-radius: 6px;\n        background: rgba(156, 39, 176, 0.05);\n      }\n      \n      .horizontal-preview {\n        flex-direction: row;\n        width: 100%;\n      }\n      \n      .container-child-item {\n        position: relative;\n        padding: 8px;\n        background: rgba(255, 255, 255, 0.9);\n        border: 1px solid var(--container-border-color);\n        border-radius: 4px;\n        transition: all 0.2s ease;\n      }\n      \n      .container-child-item:hover {\n        background: white;\n        border-color: var(--container-primary-color);\n        transform: translateY(-1px);\n        box-shadow: 0 2px 8px rgba(156, 39, 176, 0.2);\n      }\n      \n      .child-module-preview {\n        padding: 4px;\n      }\n      \n      .child-module-summary {\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        font-size: 12px;\n      }\n      \n      .child-module-title {\n        font-weight: 500;\n        color: var(--primary-text-color);\n      }\n      \n\n      \n      .container-placeholder {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n        color: var(--container-primary-color);\n        font-size: 14px;\n        width: 100%;\n        min-height: 80px;\n        text-align: center;\n      }\n      \n      .container-placeholder ha-icon {\n        --mdc-icon-size: 32px;\n        opacity: 0.7;\n      }\n      \n      .container-placeholder small {\n        font-size: 12px;\n        opacity: 0.8;\n        color: var(--secondary-text-color);\n      }\n      \n\n      \n      /* Form Styling */\n      .alignment-buttons {\n        display: flex;\n        gap: 4px;\n        background: var(--secondary-background-color);\n        padding: 4px;\n        border-radius: 8px;\n        border: 1px solid var(--divider-color);\n      }\n      \n      .alignment-button {\n        flex: 1;\n        padding: 8px 12px;\n        border: none;\n        background: transparent;\n        border-radius: 4px;\n        cursor: pointer;\n        color: var(--secondary-text-color);\n        transition: all 0.2s ease;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n      }\n      \n      .alignment-button:hover {\n        background: var(--card-background-color);\n        color: var(--primary-text-color);\n      }\n      \n      .alignment-button.active {\n        background: var(--container-primary-color);\n        color: white;\n      }\n      \n      .gap-control {\n        display: flex;\n        flex-direction: column;\n        gap: 12px;\n      }\n      \n      .gap-slider {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n      \n      .gap-range {\n        flex: 1;\n        height: 6px;\n        border-radius: 3px;\n        background: var(--secondary-background-color);\n        outline: none;\n        appearance: none;\n      }\n      \n      .gap-range::-webkit-slider-thumb {\n        appearance: none;\n        width: 18px;\n        height: 18px;\n        border-radius: 50%;\n        background: var(--container-primary-color);\n        cursor: pointer;\n        border: 2px solid var(--card-background-color);\n        box-shadow: 0 2px 4px rgba(0,0,0,0.2);\n      }\n      \n      .gap-range::-moz-range-thumb {\n        width: 18px;\n        height: 18px;\n        border-radius: 50%;\n        background: var(--container-primary-color);\n        cursor: pointer;\n        border: 2px solid var(--card-background-color);\n        box-shadow: 0 2px 4px rgba(0,0,0,0.2);\n      }\n      \n      .form-group {\n        margin-bottom: 16px;\n      }\n      \n      .form-label {\n        display: block;\n        margin-bottom: 8px;\n        font-weight: 500;\n        color: var(--primary-text-color);\n      }\n      \n      /* Layout Module Container - Styled like columns in layout builder */\n      .layout-module-container {\n        border: 2px solid var(--accent-color, var(--orange-color, #ff9800));\n        border-radius: 6px;\n        background: var(--card-background-color);\n        width: 100%;\n        box-sizing: border-box;\n        overflow: visible;\n        margin-bottom: 8px;\n      }\n      \n      .layout-module-header {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        font-size: 14px;\n        font-weight: 500;\n        padding: 8px 12px;\n        background: var(--accent-color, var(--orange-color, #ff9800));\n        color: white;\n        border-bottom: 2px solid var(--accent-color, var(--orange-color, #ff9800));\n        border-radius: 6px 6px 0px 0px;\n      }\n      \n      .layout-module-title {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n      }\n      \n      .layout-module-drag-handle {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        width: 18px;\n        height: 18px;\n        color: rgba(255, 255, 255, 0.7);\n        cursor: grab;\n        opacity: 0.8;\n        transition: opacity 0.2s ease;\n        --mdc-icon-size: 14px;\n      }\n      \n      .layout-module-drag-handle:hover {\n        opacity: 1;\n      }\n      \n      .layout-module-drag-handle:active {\n        cursor: grabbing;\n      }\n      \n      .layout-module-actions {\n        display: flex;\n        gap: 4px;\n        align-items: center;\n      }\n      \n      .layout-module-settings-btn {\n        background: none;\n        border: none;\n        color: rgba(255, 255, 255, 0.9);\n        cursor: pointer;\n        padding: 6px 8px;\n        border-radius: 4px;\n        transition: all 0.2s ease;\n        font-size: 12px;\n        min-width: 28px;\n        min-height: 28px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        --mdc-icon-size: 16px;\n      }\n      \n      .layout-module-settings-btn:hover {\n        background: rgba(255, 255, 255, 0.25);\n        color: white;\n        transform: scale(1.05);\n      }\n      \n      .layout-modules-container {\n        display: flex;\n        gap: 6px;\n        width: 100%;\n        box-sizing: border-box;\n        padding: 12px;\n        background: var(--card-background-color);\n        border: 1px solid var(--secondary-color, var(--accent-color, #ff9800));\n        border-top: none;\n        border-radius: 0px 0px 6px 6px;\n        margin-top: 0;\n        min-height: 100px;\n        position: relative;\n        overflow: visible;\n      }\n      \n      .layout-modules-container.drop-target {\n        background: var(--primary-color-light, rgba(33, 150, 243, 0.1));\n        border-color: var(--primary-color);\n      }\n      \n      .layout-module-item {\n        position: relative;\n        background: var(--secondary-background-color);\n        border: 1px solid var(--divider-color);\n        border-radius: 6px;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n      \n      .layout-module-item:hover {\n        border-color: var(--primary-color);\n        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\n        transform: translateY(-1px);\n      }\n      \n      .layout-module-item.dragging {\n        opacity: 0.6;\n        transform: scale(0.95);\n      }\n      \n      .layout-module-content {\n        padding: 8px;\n      }\n      \n      .layout-module-placeholder {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n        color: var(--secondary-text-color);\n        font-style: italic;\n        padding: 20px;\n        border: 2px dashed var(--divider-color);\n        border-radius: 6px;\n        text-align: center;\n        flex: 1;\n        min-height: 60px;\n      }\n      \n      .layout-module-placeholder ha-icon {\n        --mdc-icon-size: 24px;\n        opacity: 0.7;\n      }\n      \n      .layout-add-module-btn {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 6px;\n        padding: 8px 12px;\n        background: none;\n        border: 2px dashed var(--divider-color);\n        border-radius: 6px;\n        cursor: pointer;\n        color: var(--secondary-text-color);\n        font-size: 12px;\n        transition: all 0.2s ease;\n        min-width: 80px;\n        min-height: 40px;\n        flex-shrink: 0;\n      }\n      \n      .layout-add-module-btn:hover {\n        border-color: var(--primary-color);\n        color: var(--primary-color);\n        background: var(--primary-color-light, rgba(33, 150, 243, 0.1));\n      }\n      \n      .layout-add-module-btn ha-icon {\n        --mdc-icon-size: 16px;\n      }\n      \n      /* Clean Preview Styles */\n      .horizontal-module-preview {\n        width: 100%;\n        min-height: 60px;\n      }\n      \n      .horizontal-preview-content {\n        background: var(--secondary-background-color);\n        border-radius: 6px;\n        border: 1px solid var(--divider-color);\n      }\n      \n      .child-module-preview {\n        background: var(--card-background-color);\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        padding: 6px;\n        transition: all 0.2s ease;\n      }\n      \n      .child-module-preview:hover {\n        border-color: var(--primary-color);\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n      }\n      \n      .empty-layout-message {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        gap: 4px;\n        color: var(--secondary-text-color);\n        font-style: italic;\n        text-align: center;\n        width: 100%;\n        padding: 20px;\n      }\n      \n      .empty-layout-message span {\n        font-size: 14px;\n        font-weight: 500;\n      }\n      \n      .empty-layout-message small {\n        font-size: 12px;\n        opacity: 0.8;\n      }\n    "}}class Ye extends he{constructor(){super(...arguments),this.metadata={type:"vertical",title:"Vertical Layout",description:"Arrange modules in columns",author:"Ultra Card Team",version:"1.0.0",icon:"mdi:view-agenda",category:"layout",tags:["layout","vertical","alignment","container"]}}createDefault(e){return{id:e||this.generateId("vertical"),type:"vertical",alignment:"top",gap:1.2,modules:[]}}renderGeneralTab(e,t,o,i){var n;const a=e;return V`
      <div class="module-general-settings">
        <!-- Vertical Alignment -->
        <div class="form-group">
          <label class="form-label">Items Vertical Alignment</label>
          ${this.renderSelect("",a.alignment||"top",[{value:"top",label:"Top"},{value:"center",label:"Center"},{value:"bottom",label:"Bottom"},{value:"space-between",label:"Space Between"},{value:"space-around",label:"Space Around"}],(e=>i({alignment:e})),"Vertical alignment of items within the vertical container")}
        </div>

        <!-- Gap between Items -->
        <div class="form-group">
          <label class="form-label">Gap between Items</label>
          <div class="gap-control">
            ${this.renderSelect("",(null===(n=a.gap)||void 0===n?void 0:n.toString())||"1.2",[{value:"0",label:"0rem"},{value:"0.2",label:"0.2rem"},{value:"0.4",label:"0.4rem"},{value:"0.6",label:"0.6rem"},{value:"0.8",label:"0.8rem"},{value:"1.0",label:"1.0rem"},{value:"1.2",label:"1.2rem"},{value:"1.5",label:"1.5rem"},{value:"2.0",label:"2.0rem"},{value:"2.5",label:"2.5rem"}],(e=>i({gap:parseFloat(e)})),"Space between vertical items")}
            <div class="gap-slider">
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                .value=${(a.gap||1.2).toString()}
                @input=${e=>{const t=e.target;i({gap:parseFloat(t.value)})}}
                class="gap-range"
              />
            </div>
          </div>
        </div>
      </div>
    `}renderPreview(e,t){const o=e,i=o.modules&&o.modules.length>0;return V`
      <div class="vertical-module-preview">
        <div
          class="vertical-preview-content"
          style="
            display: flex;
            flex-direction: column;
            justify-content: ${this.getJustifyContent(o.alignment)};
            gap: ${o.gap||1.2}rem;
            align-items: flex-start;
            width: 100%;
            min-height: 60px;
            padding: 8px;
          "
        >
          ${i?o.modules.map(((e,o)=>V`
                  <div
                    class="child-module-preview"
                    style="max-width: 100%; overflow: hidden; width: 100%; box-sizing: border-box;"
                  >
                    ${this._renderChildModulePreview(e,t)}
                  </div>
                `)):V`
                <div class="empty-layout-message">
                  <span>No modules added yet</span>
                  <small>Add modules in the layout builder to see them here</small>
                </div>
              `}
        </div>
      </div>
    `}_renderChildModulePreview(e,t){const o=Ze().getModule(e.type);return o?o.renderPreview(e,t):V`
      <div class="unknown-child-module">
        <ha-icon icon="mdi:help-circle"></ha-icon>
        <span>Unknown Module: ${e.type}</span>
      </div>
    `}_getModuleTitle(e){const t=e;return t.name?t.name:t.text?t.text.length>15?`${t.text.substring(0,15)}...`:t.text:`${e.type.charAt(0).toUpperCase()+e.type.slice(1)} Module`}_getModuleIcon(e){return{text:"mdi:text",image:"mdi:image",icon:"mdi:star",bar:"mdi:chart-box",button:"mdi:gesture-tap-button",separator:"mdi:minus",info:"mdi:information",markdown:"mdi:language-markdown"}[e]||"mdi:puzzle"}validate(e){const t=e,o=[...super.validate(e).errors];if(t.gap&&(t.gap<0||t.gap>10)&&o.push("Gap must be between 0 and 10 rem"),t.modules&&t.modules.length>0)for(const e of t.modules)"horizontal"===e.type&&o.push("Horizontal layout modules cannot be placed inside vertical layout modules"),"vertical"===e.type&&o.push("Vertical layout modules cannot be nested inside other vertical layout modules");return{valid:0===o.length,errors:o}}getJustifyContent(e){switch(e){case"top":default:return"flex-start";case"center":return"center";case"bottom":return"flex-end";case"space-between":return"space-between";case"space-around":return"space-around"}}_onDragOver(e){e.preventDefault(),e.stopPropagation()}_onDragEnter(e){e.preventDefault(),e.stopPropagation()}_onDragLeave(e){e.preventDefault(),e.stopPropagation()}_onDrop(e){e.preventDefault(),e.stopPropagation(),console.log("Module dropped into vertical layout")}_onModuleDragStart(e,t){e.stopPropagation(),console.log("Module drag started:",t)}_onDragEnd(e){e.preventDefault(),e.stopPropagation(),console.log("Drag ended")}_onAddModuleClick(e){e.preventDefault(),e.stopPropagation(),console.log("Add module clicked")}getStyles(){return"\n      /* Container Module Specific Variables - Different color for vertical */\n      .container-module {\n        --container-primary-color: #3f51b5; /* Indigo for vertical layout modules */\n        --container-secondary-color: #c5cae9; /* Light indigo */\n        --container-accent-color: #303f9f; /* Dark indigo */\n        --container-border-color: #7986cb; /* Medium indigo */\n      }\n      \n      .vertical-module-preview.container-module {\n        border: 2px solid var(--container-border-color);\n        border-radius: 8px;\n        background: var(--card-background-color);\n        overflow: hidden;\n        position: relative;\n      }\n      \n      .container-header {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 12px 16px;\n        background: var(--container-primary-color);\n        color: white;\n        font-weight: 500;\n        border-bottom: 2px solid var(--container-primary-color);\n      }\n      \n      .container-drag-handle {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        width: 20px;\n        height: 20px;\n        color: rgba(255, 255, 255, 0.8);\n        cursor: grab;\n        transition: opacity 0.2s ease;\n        --mdc-icon-size: 16px;\n      }\n      \n      .container-drag-handle:hover {\n        color: white;\n      }\n      \n      .container-drag-handle:active {\n        cursor: grabbing;\n      }\n      \n      .container-badge {\n        background: rgba(255, 255, 255, 0.2);\n        color: white;\n        padding: 2px 8px;\n        border-radius: 12px;\n        font-size: 10px;\n        font-weight: 600;\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n        margin-left: auto;\n      }\n      \n      .container-content {\n        padding: 16px;\n        min-height: 120px;\n        display: flex;\n        border: 2px dashed var(--container-secondary-color);\n        margin: 8px;\n        border-radius: 6px;\n        background: rgba(63, 81, 181, 0.05);\n      }\n      \n      .vertical-preview {\n        flex-direction: column;\n        width: 100%;\n      }\n      \n      .container-child-item {\n        position: relative;\n        padding: 8px;\n        background: rgba(255, 255, 255, 0.9);\n        border: 1px solid var(--container-border-color);\n        border-radius: 4px;\n        transition: all 0.2s ease;\n      }\n      \n      .container-child-item:hover {\n        background: white;\n        border-color: var(--container-primary-color);\n        transform: translateY(-1px);\n        box-shadow: 0 2px 8px rgba(63, 81, 181, 0.2);\n      }\n      \n      .child-module-preview {\n        padding: 4px;\n      }\n      \n      .child-module-summary {\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        font-size: 12px;\n      }\n      \n      .child-module-title {\n        font-weight: 500;\n        color: var(--primary-text-color);\n      }\n      \n\n      \n      .container-placeholder {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n        color: var(--container-primary-color);\n        font-size: 14px;\n        width: 100%;\n        min-height: 80px;\n        text-align: center;\n      }\n      \n      .container-placeholder ha-icon {\n        --mdc-icon-size: 32px;\n        opacity: 0.7;\n      }\n      \n      .container-placeholder small {\n        font-size: 12px;\n        opacity: 0.8;\n        color: var(--secondary-text-color);\n      }\n      \n\n      \n      /* Form Styling */\n      .gap-control {\n        display: flex;\n        flex-direction: column;\n        gap: 12px;\n      }\n      \n      .gap-slider {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n      \n      .gap-range {\n        flex: 1;\n        height: 6px;\n        border-radius: 3px;\n        background: var(--secondary-background-color);\n        outline: none;\n        appearance: none;\n      }\n      \n      .gap-range::-webkit-slider-thumb {\n        appearance: none;\n        width: 18px;\n        height: 18px;\n        border-radius: 50%;\n        background: var(--container-primary-color);\n        cursor: pointer;\n        border: 2px solid var(--card-background-color);\n        box-shadow: 0 2px 4px rgba(0,0,0,0.2);\n      }\n      \n      .gap-range::-moz-range-thumb {\n        width: 18px;\n        height: 18px;\n        border-radius: 50%;\n        background: var(--container-primary-color);\n        cursor: pointer;\n        border: 2px solid var(--card-background-color);\n        box-shadow: 0 2px 4px rgba(0,0,0,0.2);\n      }\n      \n      .form-group {\n        margin-bottom: 16px;\n      }\n      \n      .form-label {\n        display: block;\n        margin-bottom: 8px;\n        font-weight: 500;\n        color: var(--primary-text-color);\n      }\n      \n      /* Layout Module Container - Styled like columns in layout builder */\n      .layout-module-container {\n        border: 2px solid var(--accent-color, var(--orange-color, #ff9800));\n        border-radius: 6px;\n        background: var(--card-background-color);\n        width: 100%;\n        box-sizing: border-box;\n        overflow: visible;\n        margin-bottom: 8px;\n      }\n      \n      .layout-module-header {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        font-size: 14px;\n        font-weight: 500;\n        padding: 8px 12px;\n        background: var(--accent-color, var(--orange-color, #ff9800));\n        color: white;\n        border-bottom: 2px solid var(--accent-color, var(--orange-color, #ff9800));\n        border-radius: 6px 6px 0px 0px;\n      }\n      \n      .layout-module-title {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n      }\n      \n      .layout-module-drag-handle {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        width: 18px;\n        height: 18px;\n        color: rgba(255, 255, 255, 0.7);\n        cursor: grab;\n        opacity: 0.8;\n        transition: opacity 0.2s ease;\n        --mdc-icon-size: 14px;\n      }\n      \n      .layout-module-drag-handle:hover {\n        opacity: 1;\n      }\n      \n      .layout-module-drag-handle:active {\n        cursor: grabbing;\n      }\n      \n      .layout-module-actions {\n        display: flex;\n        gap: 4px;\n        align-items: center;\n      }\n      \n      .layout-module-settings-btn {\n        background: none;\n        border: none;\n        color: rgba(255, 255, 255, 0.9);\n        cursor: pointer;\n        padding: 6px 8px;\n        border-radius: 4px;\n        transition: all 0.2s ease;\n        font-size: 12px;\n        min-width: 28px;\n        min-height: 28px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        --mdc-icon-size: 16px;\n      }\n      \n      .layout-module-settings-btn:hover {\n        background: rgba(255, 255, 255, 0.25);\n        color: white;\n        transform: scale(1.05);\n      }\n      \n      .layout-modules-container {\n        display: flex;\n        gap: 6px;\n        width: 100%;\n        box-sizing: border-box;\n        padding: 12px;\n        background: var(--card-background-color);\n        border: 1px solid var(--secondary-color, var(--accent-color, #ff9800));\n        border-top: none;\n        border-radius: 0px 0px 6px 6px;\n        margin-top: 0;\n        min-height: 100px;\n        position: relative;\n        overflow: visible;\n      }\n      \n      .layout-modules-container.drop-target {\n        background: var(--primary-color-light, rgba(33, 150, 243, 0.1));\n        border-color: var(--primary-color);\n      }\n      \n      .layout-module-item {\n        position: relative;\n        background: var(--secondary-background-color);\n        border: 1px solid var(--divider-color);\n        border-radius: 6px;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n      \n      .layout-module-item:hover {\n        border-color: var(--primary-color);\n        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\n        transform: translateY(-1px);\n      }\n      \n      .layout-module-item.dragging {\n        opacity: 0.6;\n        transform: scale(0.95);\n      }\n      \n      .layout-module-content {\n        padding: 8px;\n      }\n      \n      .layout-module-placeholder {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n        color: var(--secondary-text-color);\n        font-style: italic;\n        padding: 20px;\n        border: 2px dashed var(--divider-color);\n        border-radius: 6px;\n        text-align: center;\n        flex: 1;\n        min-height: 60px;\n      }\n      \n      .layout-module-placeholder ha-icon {\n        --mdc-icon-size: 24px;\n        opacity: 0.7;\n      }\n      \n      .layout-add-module-btn {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 6px;\n        padding: 8px 12px;\n        background: none;\n        border: 2px dashed var(--divider-color);\n        border-radius: 6px;\n        cursor: pointer;\n        color: var(--secondary-text-color);\n        font-size: 12px;\n        transition: all 0.2s ease;\n        min-width: 80px;\n        min-height: 40px;\n        flex-shrink: 0;\n      }\n      \n      .layout-add-module-btn:hover {\n        border-color: var(--primary-color);\n        color: var(--primary-color);\n        background: var(--primary-color-light, rgba(33, 150, 243, 0.1));\n      }\n      \n      .layout-add-module-btn ha-icon {\n        --mdc-icon-size: 16px;\n      }\n      \n      /* Clean Preview Styles */\n      .vertical-module-preview {\n        width: 100%;\n        min-height: 60px;\n      }\n      \n      .vertical-preview-content {\n        background: var(--secondary-background-color);\n        border-radius: 6px;\n        border: 1px solid var(--divider-color);\n      }\n      \n      .child-module-preview {\n        background: var(--card-background-color);\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        padding: 6px;\n        transition: all 0.2s ease;\n        width: 100%;\n      }\n      \n      .child-module-preview:hover {\n        border-color: var(--primary-color);\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n      }\n      \n      .empty-layout-message {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        gap: 4px;\n        color: var(--secondary-text-color);\n        font-style: italic;\n        text-align: center;\n        width: 100%;\n        padding: 20px;\n      }\n      \n      .empty-layout-message span {\n        font-size: 14px;\n        font-weight: 500;\n      }\n      \n      .empty-layout-message small {\n        font-size: 12px;\n        opacity: 0.8;\n      }\n    "}}class Xe{static render(e,t,o,i){return V`<div>Link Configuration (${i})</div>`}static handleAction(e,t,o){if("more-info"===e.action&&e.entity){const t=new CustomEvent("hass-more-info",{detail:{entityId:e.entity},bubbles:!0,composed:!0});o.dispatchEvent(t)}}}class Je extends he{constructor(){super(...arguments),this.metadata={type:"camera",title:"Camera Module",description:"Display live camera feeds with comprehensive control options",author:"WJD Designs",version:"1.0.0",icon:"mdi:camera",category:"content",tags:["camera","live","feed","security","surveillance"]},this.clickTimeout=null,this.holdTimeout=null,this.isHolding=!1}createDefault(e){return{id:e||this.generateId("camera"),type:"camera",entity:"",camera_name:"",show_name:!0,aspect_ratio:"16:9",image_fit:"cover",border_radius:"8",show_controls:!1,auto_refresh:!0,refresh_interval:30,image_quality:"high",live_view:!1,show_unavailable:!0,fallback_image:"",tap_action:{action:"more-info"},hold_action:{action:"default"},double_tap_action:{action:"default"},template_mode:!1,template:""}}renderGeneralTab(e,t,o,i){const n=e;return V`
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

          ${be.renderField("Camera Entity","Select the camera entity to display. This should be a camera or mjpeg entity from Home Assistant.",t,{entity:n.entity||""},[be.createSchemaItem("entity",{entity:{domain:["camera"]}})],(e=>i({entity:e.detail.value.entity})))}
          ${be.renderField("Camera Name","Custom name for the camera. Leave empty to use entity name.",t,{camera_name:n.camera_name||""},[be.createSchemaItem("camera_name",{text:{}})],(e=>i({camera_name:e.detail.value.camera_name})))}

          <div style="display: flex; align-items: center; gap: 16px; margin-top: 16px;">
            <span class="field-title">Show Camera Name</span>
            ${be.renderCleanForm(t,{show_name:!1!==n.show_name},[be.createSchemaItem("show_name",{boolean:{}})],(e=>i({show_name:e.detail.value.show_name})))}
          </div>
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

          ${be.renderField("Aspect Ratio","Set the aspect ratio for the camera display.",t,{aspect_ratio:n.aspect_ratio||"16:9"},[be.createSchemaItem("aspect_ratio",{select:{options:[{value:"16:9",label:"16:9 (Widescreen)"},{value:"4:3",label:"4:3 (Standard)"},{value:"1:1",label:"1:1 (Square)"},{value:"auto",label:"Auto (Original)"}]}})],(e=>i({aspect_ratio:e.detail.value.aspect_ratio})))}
          ${be.renderField("Image Fit","How the camera image should fit within the container.",t,{image_fit:n.image_fit||"cover"},[be.createSchemaItem("image_fit",{select:{options:[{value:"cover",label:"Cover (Fill container, may crop)"},{value:"contain",label:"Contain (Fit entirely, may have bars)"},{value:"fill",label:"Fill (Stretch to fit)"},{value:"scale-down",label:"Scale Down (Shrink if needed)"}]}})],(e=>i({image_fit:e.detail.value.image_fit})))}
          ${be.renderField("Border Radius (px)","Rounded corners for the camera image. 0 for sharp corners.",t,{border_radius:n.border_radius||"8"},[be.createSchemaItem("border_radius",{number:{min:0,max:50,mode:"box"}})],(e=>{var t;return i({border_radius:null===(t=e.detail.value.border_radius)||void 0===t?void 0:t.toString()})}))}
        </div>

        <!-- Camera Controls Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            Camera Controls
          </div>

          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <span class="field-title">Show Controls</span>
            ${be.renderCleanForm(t,{show_controls:n.show_controls||!1},[be.createSchemaItem("show_controls",{boolean:{}})],(e=>i({show_controls:e.detail.value.show_controls})))}
          </div>

          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <span class="field-title">Auto Refresh</span>
            ${be.renderCleanForm(t,{auto_refresh:!1!==n.auto_refresh},[be.createSchemaItem("auto_refresh",{boolean:{}})],(e=>i({auto_refresh:e.detail.value.auto_refresh})))}
          </div>

          ${!1!==n.auto_refresh?V`
                <div style="margin-top: 16px;">
                  ${this.renderConditionalFieldsGroup("Auto Refresh Settings",V`
                      ${be.renderField("Refresh Interval (seconds)","How often to refresh the camera image automatically.",t,{refresh_interval:n.refresh_interval||30},[be.createSchemaItem("refresh_interval",{number:{min:5,max:300,mode:"box"}})],(e=>i({refresh_interval:e.detail.value.refresh_interval})))}
                    `)}
                </div>
              `:""}
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

          ${be.renderField("Image Quality","Quality setting for the camera stream. Higher quality uses more bandwidth.",t,{image_quality:n.image_quality||"high"},[be.createSchemaItem("image_quality",{select:{options:[{value:"high",label:"High Quality"},{value:"medium",label:"Medium Quality"},{value:"low",label:"Low Quality (Faster)"}]}})],(e=>i({image_quality:e.detail.value.image_quality})))}

          <div style="display: flex; align-items: center; gap: 16px; margin: 16px 0;">
            <span class="field-title">Live View</span>
            ${be.renderCleanForm(t,{live_view:n.live_view||!1},[be.createSchemaItem("live_view",{boolean:{}})],(e=>i({live_view:e.detail.value.live_view})))}
          </div>
          <div
            style="margin-bottom: 16px; color: var(--secondary-text-color); font-size: 12px; font-style: italic;"
          >
            Enable to show live camera stream (requires stream integration). When disabled, shows
            still image snapshots.
          </div>

          <div style="display: flex; align-items: center; gap: 16px; margin: 16px 0;">
            <span class="field-title">Show Unavailable State</span>
            ${be.renderCleanForm(t,{show_unavailable:!1!==n.show_unavailable},[be.createSchemaItem("show_unavailable",{boolean:{}})],(e=>i({show_unavailable:e.detail.value.show_unavailable})))}
          </div>

          ${be.renderField("Fallback Image URL","Optional image to show when camera is unavailable. Can be a URL or local path.",t,{fallback_image:n.fallback_image||""},[be.createSchemaItem("fallback_image",{text:{}})],(e=>i({fallback_image:e.detail.value.fallback_image})))}
        </div>

        <!-- Link Configuration Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          ${Xe.render(t,{tap_action:n.tap_action||{action:"more-info"},hold_action:n.hold_action||{action:"default"},double_tap_action:n.double_tap_action||{action:"default"}},(e=>{const t={};e.tap_action&&(t.tap_action=e.tap_action),e.hold_action&&(t.hold_action=e.hold_action),e.double_tap_action&&(t.double_tap_action=e.double_tap_action),i(t)}),"Link Configuration")}
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
            ${be.renderCleanForm(t,{template_mode:n.template_mode||!1},[be.createSchemaItem("template_mode",{boolean:{}})],(e=>i({template_mode:e.detail.value.template_mode})))}
          </div>

          ${n.template_mode?this.renderConditionalFieldsGroup("Template Settings",V`
                  ${be.renderField("Template Code",'Enter Jinja2 template code to dynamically set camera entity. Example: {{ states.camera.front_door.entity_id if is_state("input_boolean.show_front", "on") else states.camera.back_yard.entity_id }}',t,{template:n.template||""},[be.createSchemaItem("template",{text:{multiline:!0}})],(e=>i({template:e.detail.value.template})))}
                `):V`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  Enable template mode to use dynamic camera selection
                </div>
              `}
        </div>
      </div>
    `}renderPreview(e,t){const o=e,i=o;let n=o.entity;if(o.template_mode&&o.template)try{n=o.entity}catch(e){console.warn("Template evaluation failed:",e)}const a=n?t.states[n]:null,r=!a||"unavailable"===a.state,l=o.camera_name||(a?a.attributes.friendly_name||a.entity_id:"Camera"),s={padding:this.getPaddingCSS(i),margin:this.getMarginCSS(i),background:this.getBackgroundCSS(i),backgroundImage:this.getBackgroundImageCSS(i,t),border:this.getBorderCSS(i),borderRadius:this.addPixelUnit(i.border_radius)||"0px",width:"100%",maxWidth:"100%",boxSizing:"border-box"},d={borderRadius:this.addPixelUnit(o.border_radius)||"8px",objectFit:o.image_fit||"cover",width:"100%",height:"200px",display:"block"},c=this.getAspectRatioStyle(o.aspect_ratio),p=V`
      <div class="camera-module-container" style=${this.styleObjectToCss(s)}>
        ${!1!==o.show_name?V`
              <div
                class="camera-name"
                style="margin-bottom: 8px; font-weight: 500; color: var(--primary-text-color);"
              >
                ${l}
              </div>
            `:""}

        <div class="camera-image-container" style=${c}>
          ${n?r?V`
                  <div
                    class="camera-unavailable"
                    style=${this.styleObjectToCss(Object.assign(Object.assign({},d),{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",backgroundColor:"var(--error-color, #f44336)",color:"white"}))}
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
                          <span style="font-weight: 500;">Camera Unavailable</span>
                          <span style="font-size: 12px; margin-top: 4px; opacity: 0.9;"
                            >Entity: ${n}</span
                          >
                        `}
                  </div>
                `:V`
                  <!-- Use HA's native camera image component - same as picture-glance card -->
                  <hui-image
                    .hass=${t}
                    .cameraImage=${n}
                    .cameraView=${o.live_view?"live":"auto"}
                    style=${this.styleObjectToCss(d)}
                    class="camera-image"
                    @error=${e=>console.log("🎥 HA hui-image error:",e)}
                    @load=${()=>console.log("🎥 HA hui-image loaded successfully")}
                  ></hui-image>
                  ${o.show_controls?V`
                        <div class="camera-controls">
                          <button
                            class="camera-control-btn"
                            title="Refresh Camera"
                            @click=${()=>this.refreshCamera(n,t)}
                          >
                            <ha-icon icon="mdi:refresh"></ha-icon>
                          </button>
                        </div>
                      `:""}
                `:V`
                <div
                  class="camera-unavailable"
                  style=${this.styleObjectToCss(Object.assign(Object.assign({},d),{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",backgroundColor:"var(--warning-color, #ff9800)",color:"white"}))}
                >
                  <ha-icon
                    icon="mdi:camera-plus"
                    style="font-size: 48px; margin-bottom: 8px;"
                  ></ha-icon>
                  <span style="font-weight: 500;">No Camera Selected</span>
                  <span style="font-size: 12px; margin-top: 4px; opacity: 0.9;"
                    >Choose a camera entity below</span
                  >
                </div>
              `}
        </div>
      </div>
    `;return this.hasActiveLink(o)?V`<div
          class="camera-module-clickable"
          @click=${e=>this.handleClick(e,o,t)}
          @dblclick=${e=>this.handleDoubleClick(e,o,t)}
          @mousedown=${e=>this.handleMouseDown(e,o,t)}
          @mouseup=${e=>this.handleMouseUp(e,o,t)}
          @mouseleave=${e=>this.handleMouseLeave(e,o,t)}
          @touchstart=${e=>this.handleTouchStart(e,o,t)}
          @touchend=${e=>this.handleTouchEnd(e,o,t)}
        >
          ${p}
        </div>`:p}validate(e){const t=e,o=[...super.validate(e).errors];return t.template_mode||t.entity&&""!==t.entity.trim()||o.push("Camera entity is required when not using template mode"),!t.template_mode||t.template&&""!==t.template.trim()||o.push("Template code is required when template mode is enabled"),!1!==t.auto_refresh&&t.refresh_interval&&(t.refresh_interval<5||t.refresh_interval>300)&&o.push("Refresh interval must be between 5 and 300 seconds"),t.border_radius&&isNaN(Number(t.border_radius))&&o.push("Border radius must be a number"),t.tap_action&&t.tap_action.action&&o.push(...this.validateAction(t.tap_action)),t.hold_action&&t.hold_action.action&&o.push(...this.validateAction(t.hold_action)),t.double_tap_action&&t.double_tap_action.action&&o.push(...this.validateAction(t.double_tap_action)),{valid:0===o.length,errors:o}}handleClick(e,t,o){e.preventDefault(),this.clickTimeout&&clearTimeout(this.clickTimeout),this.clickTimeout=setTimeout((()=>{this.handleTapAction(e,t,o)}),300)}handleDoubleClick(e,t,o){e.preventDefault(),this.clickTimeout&&(clearTimeout(this.clickTimeout),this.clickTimeout=null),this.handleDoubleAction(e,t,o)}handleMouseDown(e,t,o){this.isHolding=!1,this.holdTimeout=setTimeout((()=>{this.isHolding=!0,this.handleHoldAction(e,t,o)}),500)}handleMouseUp(e,t,o){this.holdTimeout&&(clearTimeout(this.holdTimeout),this.holdTimeout=null)}handleMouseLeave(e,t,o){this.holdTimeout&&(clearTimeout(this.holdTimeout),this.holdTimeout=null),this.isHolding=!1}handleTouchStart(e,t,o){this.handleMouseDown(e,t,o)}handleTouchEnd(e,t,o){this.handleMouseUp(e,t,o)}handleTapAction(e,t,o){if(!this.isHolding)if(t.tap_action){const i="default"===t.tap_action.action?{action:"more-info",entity:t.entity}:t.tap_action;Xe.handleAction(i,o,e.target)}else t.entity&&Xe.handleAction({action:"more-info",entity:t.entity},o,e.target)}handleHoldAction(e,t,o){t.hold_action&&"nothing"!==t.hold_action.action&&Xe.handleAction(t.hold_action,o,e.target)}handleDoubleAction(e,t,o){t.double_tap_action&&"nothing"!==t.double_tap_action.action&&Xe.handleAction(t.double_tap_action,o,e.target)}hasActiveLink(e){const t=e.tap_action&&"nothing"!==e.tap_action.action,o=e.hold_action&&"nothing"!==e.hold_action.action,i=e.double_tap_action&&"nothing"!==e.double_tap_action.action;return t||o||i||!!e.entity}refreshCamera(e,t){console.log("🎥 Manual refresh triggered for camera:",e),document.querySelectorAll('hui-image[class*="camera-image"]').forEach((o=>{o.cameraImage===e&&o.hass===t&&(console.log("🎥 Refreshing hui-image component"),o.hass=Object.assign({},t),o.requestUpdate())}))}getCameraImageUrl(e,t,o){var i,n,a;if(!e||!t)return console.log("🎥 Camera URL: Missing entity or hass",{entity:e,hasHass:!!t}),"";let r;try{r=t.hassUrl?`${t.hassUrl()}/api/camera_proxy/${e}`:`/api/camera_proxy/${e}`;const o=r.includes("?")?"&":"?";r+=`${o}token=${Date.now()}`}catch(t){console.warn("🎥 Error generating camera URL:",t),r=`/api/camera_proxy/${e}?token=${Date.now()}`}return console.log("🎥 Camera URL (HA native method):",{entity:e,finalUrl:r,cameraState:null===(i=t.states[e])||void 0===i?void 0:i.state,supportedFeatures:null===(a=null===(n=t.states[e])||void 0===n?void 0:n.attributes)||void 0===a?void 0:a.supported_features}),r}async getCameraImageBlob(e,t,o){try{console.log("🎥 Trying authenticated blob approach for camera:",e);const o=`/api/camera_proxy/${e}?t=${Date.now()}`,i=await fetch(o,{method:"GET",credentials:"include",headers:{Accept:"image/*","Cache-Control":"no-cache",Pragma:"no-cache"}});if(!i.ok)return console.log(`🎥 Blob fetch failed with status ${i.status}:`,i.statusText),await this.getCameraImageViaWebSocket(e,t);const n=await i.blob(),a=URL.createObjectURL(n);return console.log("🎥 Blob URL created successfully:",{blobUrl:a,blobSize:n.size,blobType:n.type}),a}catch(o){return console.error("🎥 Blob method failed:",o),await this.getCameraImageViaWebSocket(e,t)}}async getCameraImageViaWebSocket(e,t){try{console.log("🎥 Attempting WebSocket camera image fetch");const o=t.connection;if(!o)throw new Error("No WebSocket connection available");const i=await o.sendMessagePromise({type:"camera_thumbnail",entity_id:e});if(i&&i.content){const e=atob(i.content),t=new Array(e.length);for(let o=0;o<e.length;o++)t[o]=e.charCodeAt(o);const o=new Uint8Array(t),n=new Blob([o],{type:"image/jpeg"}),a=URL.createObjectURL(n);return console.log("🎥 WebSocket camera image successful:",{blobUrl:a,blobSize:n.size}),a}throw new Error("No image content received from WebSocket")}catch(e){return console.error("🎥 WebSocket camera image failed:",e),""}}getAspectRatioStyle(e){return e&&"auto"!==e?`\n      position: relative;\n      width: 100%;\n      padding-bottom: ${{"16:9":"56.25%","4:3":"75%","1:1":"100%"}[e]||"56.25%"};\n      overflow: hidden;\n    `:"width: 100%;"}async handleImageError(e,t){var o,i,n,a,r,l,s,d,c;const p=e.target;if(console.log("🎥 Camera Image Error:",{entity:t.entity,originalSrc:p.src,error:e}),!p.dataset.triedBlob&&t.entity){p.dataset.triedBlob="true",console.log("🎥 Trying authenticated blob approach...");try{const e=(null===(o=document.querySelector("home-assistant"))||void 0===o?void 0:o.hass)||(null===(i=document.querySelector("ha-panel-lovelace"))||void 0===i?void 0:i.hass)||(null===(n=window.hassConnection)||void 0===n?void 0:n.hass);if(e){const o=await this.getCameraImageBlob(t.entity,e,t.image_quality);if(o)return console.log("🎥 Successfully got blob URL, updating image"),void(p.src=o)}else console.log("🎥 Could not find hass instance for blob approach")}catch(e){console.error("🎥 Blob approach failed:",e)}}if(t.fallback_image)console.log("🎥 Using fallback image"),p.src=t.fallback_image;else{console.log("🎥 No fallback image, showing error message"),p.style.display="none";const e=p.closest(".camera-image-container");if(e){const o=t.entity?null===(l=null===(r=null===(a=document.querySelector("home-assistant"))||void 0===a?void 0:a.hass)||void 0===r?void 0:r.states)||void 0===l?void 0:l[t.entity]:null,i=(null===(s=null==o?void 0:o.attributes)||void 0===s?void 0:s.brand)||(null===(d=null==o?void 0:o.attributes)||void 0===d?void 0:d.model)||"Unknown";if(e.innerHTML=`\n          <div style="\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            flex-direction: column;\n            background-color: var(--warning-color, #ff9800);\n            color: white;\n            padding: 20px;\n            border-radius: 8px;\n            text-align: center;\n            min-height: 150px;\n            border: 1px solid rgba(255,255,255,0.2);\n          ">\n            <ha-icon icon="mdi:camera-off" style="font-size: 48px; margin-bottom: 12px; opacity: 0.9;"></ha-icon>\n            <span style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">Camera Load Failed</span>\n            <span style="font-size: 13px; margin-bottom: 8px; opacity: 0.9;">Entity: ${t.entity}</span>\n            <span style="font-size: 12px; margin-bottom: 12px; opacity: 0.8;">Camera Type: ${i}</span>\n            <div style="font-size: 11px; opacity: 0.8; line-height: 1.4; margin-bottom: 12px;">\n              <div style="margin-bottom: 6px;">• Check camera entity is working in HA</div>\n              <div style="margin-bottom: 6px;">• Verify RTSP credentials in HA config</div>\n              <div>• Try refreshing the browser</div>\n            </div>\n            <button \n              onclick="window.retryCamera_${null===(c=t.entity)||void 0===c?void 0:c.replace(/\./g,"_")}"\n              style="\n                background: rgba(255,255,255,0.2);\n                border: 1px solid rgba(255,255,255,0.3);\n                color: white;\n                padding: 8px 16px;\n                border-radius: 4px;\n                cursor: pointer;\n                font-size: 12px;\n                transition: all 0.2s ease;\n              "\n              onmouseover="this.style.background='rgba(255,255,255,0.3)'"\n              onmouseout="this.style.background='rgba(255,255,255,0.2)'"\n            >\n              🔄 Retry Camera Load\n            </button>\n          </div>\n        `,t.entity){const o=`retryCamera_${t.entity.replace(/\./g,"_")}`;window[o]=async()=>{var o;if(console.log("🎥 Manual retry triggered for camera:",t.entity),null===(o=document.querySelector("home-assistant"))||void 0===o?void 0:o.hass)try{const o=Date.now(),i=`/api/camera_proxy/${t.entity}?t=${o}`,n=document.createElement("img");n.className="camera-image",n.style.cssText=`\n                  position: absolute;\n                  top: 0;\n                  left: 0;\n                  width: 100%;\n                  height: 100%;\n                  object-fit: ${t.image_fit||"cover"};\n                  border-radius: inherit;\n                `,n.onerror=e=>this.handleImageError(e,t),n.onload=()=>{console.log("🎥 Retry successful!"),e&&(e.innerHTML="",e.appendChild(n))},n.src=i,e&&(e.innerHTML='\n                    <div style="\n                      display: flex;\n                      align-items: center;\n                      justify-content: center;\n                      flex-direction: column;\n                      background-color: var(--primary-color);\n                      color: white;\n                      padding: 20px;\n                      border-radius: 8px;\n                      text-align: center;\n                      min-height: 150px;\n                    ">\n                      <div style="\n                        width: 32px;\n                        height: 32px;\n                        border: 3px solid rgba(255,255,255,0.3);\n                        border-top: 3px solid white;\n                        border-radius: 50%;\n                        animation: spin 1s linear infinite;\n                        margin-bottom: 12px;\n                      "></div>\n                      <span style="font-weight: 500; font-size: 14px;">Retrying Camera Load...</span>\n                      <style>\n                        @keyframes spin {\n                          0% { transform: rotate(0deg); }\n                          100% { transform: rotate(360deg); }\n                        }\n                      </style>\n                    </div>\n                  ')}catch(e){console.error("🎥 Retry failed:",e)}}}}}}renderConditionalFieldsGroup(e,t){return V`
      <div
        class="conditional-fields-group"
        style="margin-top: 16px; padding: 16px; border-left: 4px solid var(--primary-color); background: rgba(var(--rgb-primary-color), 0.08); border-radius: 0 8px 8px 0;"
      >
        <div
          style="font-weight: 600; color: var(--primary-color); margin-bottom: 12px; font-size: 14px;"
        >
          ${e}
        </div>
        ${t}
      </div>
    `}styleObjectToCss(e){return Object.entries(e).filter((([e,t])=>null!=t&&""!==t)).map((([e,t])=>`${this.camelToKebab(e)}: ${t}`)).join("; ")}camelToKebab(e){return e.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}addPixelUnit(e){return e&&/^\d+$/.test(e)?`${e}px`:e}getPaddingCSS(e){return e.padding_top||e.padding_bottom||e.padding_left||e.padding_right?`${this.addPixelUnit(e.padding_top)||"8px"} ${this.addPixelUnit(e.padding_right)||"12px"} ${this.addPixelUnit(e.padding_bottom)||"8px"} ${this.addPixelUnit(e.padding_left)||"12px"}`:"8px 12px"}getMarginCSS(e){return e.margin_top||e.margin_bottom||e.margin_left||e.margin_right?`${this.addPixelUnit(e.margin_top)||"0px"} ${this.addPixelUnit(e.margin_right)||"0px"} ${this.addPixelUnit(e.margin_bottom)||"0px"} ${this.addPixelUnit(e.margin_left)||"0px"}`:"0px"}getBackgroundCSS(e){return e.background_color||"transparent"}getBackgroundImageCSS(e,t){return"url"===e.background_image_type&&e.background_image?`url('${e.background_image}')`:"entity"===e.background_image_type&&e.background_image_entity&&t.states[e.background_image_entity]?`url('/api/camera_proxy/${e.background_image_entity}')`:""}getBorderCSS(e){return e.border_width&&e.border_style&&e.border_color?`${e.border_width} ${e.border_style} ${e.border_color}`:""}validateAction(e){const t=[];return"navigate"!==e.action||e.navigation_path||t.push("Navigation path is required for navigate action"),"call-service"!==e.action||e.service&&e.service_data||t.push("Service and service data are required for call-service action"),t}getStyles(){return"\n      .camera-module-container {\n        width: 100%;\n        box-sizing: border-box;\n      }\n      \n      .camera-name {\n        font-size: 16px;\n        font-weight: 500;\n        color: var(--primary-text-color);\n        margin-bottom: 8px;\n        text-align: center;\n      }\n      \n      .camera-image-container {\n        position: relative;\n        width: 100%;\n        overflow: hidden;\n      }\n      \n      .camera-image {\n        position: absolute;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        object-fit: cover;\n        border-radius: inherit;\n      }\n      \n      .camera-unavailable {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        flex-direction: column;\n        background-color: var(--disabled-color, #f5f5f5);\n        color: var(--secondary-text-color);\n        min-height: 150px;\n      }\n      \n      .camera-controls {\n        position: absolute;\n        top: 8px;\n        right: 8px;\n        display: flex;\n        gap: 4px;\n      }\n      \n      .camera-control-btn {\n        background: rgba(0, 0, 0, 0.6);\n        border: none;\n        border-radius: 50%;\n        width: 32px;\n        height: 32px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        color: white;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n      \n      .camera-control-btn:hover {\n        background: rgba(0, 0, 0, 0.8);\n        transform: scale(1.1);\n      }\n      \n      .camera-module-clickable {\n        cursor: pointer;\n        transition: transform 0.2s ease;\n      }\n      \n      .camera-module-clickable:hover {\n        transform: scale(1.02);\n      }\n      \n      .camera-module-clickable:active {\n        transform: scale(0.98);\n      }\n\n      /* Standard field styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n        color: var(--primary-text-color) !important;\n        margin-bottom: 4px !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      /* Conditional fields grouping */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      @keyframes slideInFromLeft {\n        from {\n          opacity: 0;\n          transform: translateX(-10px);\n        }\n        to {\n          opacity: 1;\n          transform: translateX(0);\n        }\n      }\n    "}}class Ke{constructor(){this.modules=new Map,this.modulesByCategory=new Map,this.registerCoreModules()}static getInstance(){return Ke.instance||(Ke.instance=new Ke),Ke.instance}registerCoreModules(){this.registerModule(new fe),this.registerModule(new ye),this.registerModule(new $e),this.registerModule(new ke),this.registerModule(new Ne),this.registerModule(new Be),this.registerModule(new Ge),this.registerModule(new We),this.registerModule(new qe),this.registerModule(new Ye),this.registerModule(new Je)}registerModule(e){const t=e.metadata.type;this.modules.has(t)&&console.warn(`Module with type "${t}" is already registered. Overriding...`),this.modules.set(t,e),this.updateCategoryMap(e),console.log(`✅ Registered module: ${e.metadata.title} v${e.metadata.version} by ${e.metadata.author}`)}unregisterModule(e){return!!this.modules.get(e)&&(this.modules.delete(e),this.updateCategoryMaps(),console.log(`❌ Unregistered module: ${e}`),!0)}getModule(e){return this.modules.get(e)}getAllModules(){return Array.from(this.modules.values())}getModulesByCategory(e){return this.modulesByCategory.get(e)||[]}getCategories(){return Array.from(this.modulesByCategory.keys())}getAllModuleMetadata(){return this.getAllModules().map((e=>e.metadata))}searchModules(e){const t=e.toLowerCase();return this.getAllModules().filter((e=>{const o=e.metadata;return o.title.toLowerCase().includes(t)||o.description.toLowerCase().includes(t)||o.tags.some((e=>e.toLowerCase().includes(t)))||o.type.toLowerCase().includes(t)}))}createDefaultModule(e,t){console.log(`Creating default module for type: ${e}`);const o=this.getModule(e);if(!o)return console.error(`Module type "${e}" not found in registry`),console.log("Available module types:",Array.from(this.modules.keys())),null;try{const e=o.createDefault(t);return console.log("Successfully created default module:",e),e}catch(t){return console.error(`Error creating default module for type "${e}":`,t),null}}validateModule(e){const t=this.getModule(e.type);return t?t.validate(e):{valid:!1,errors:[`Unknown module type: ${e.type}`]}}getAllModuleStyles(){let e="";for(const t of this.getAllModules())t.getStyles&&(e+=`\n/* Styles for ${t.metadata.title} */\n`,e+=t.getStyles(),e+="\n");return e+=this.getCommonFormStyles(),e}isModuleRegistered(e){return this.modules.has(e)}getRegistryStats(){const e=this.getAllModules(),t={},o=new Set;return e.forEach((e=>{const i=e.metadata.category;t[i]=(t[i]||0)+1,o.add(e.metadata.author)})),{totalModules:e.length,modulesByCategory:t,authors:Array.from(o)}}updateCategoryMap(e){const t=e.metadata.category;this.modulesByCategory.has(t)||this.modulesByCategory.set(t,[]);const o=this.modulesByCategory.get(t),i=o.findIndex((t=>t.metadata.type===e.metadata.type));i>=0?o[i]=e:o.push(e)}updateCategoryMaps(){this.modulesByCategory.clear(),this.getAllModules().forEach((e=>this.updateCategoryMap(e)))}getCommonFormStyles(){return'\n      /* Common form styles for all modules */\n      .module-general-settings {\n        padding: 0;\n      }\n      \n      .form-field {\n        margin-bottom: 16px;\n      }\n      \n      .form-label {\n        display: block;\n        font-weight: 500;\n        margin-bottom: 4px;\n        font-size: 14px;\n        color: var(--primary-text-color);\n      }\n      \n      .form-description {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        margin-top: 4px;\n        line-height: 1.3;\n      }\n\n      /* Container Module Global Styles */\n      .container-module {\n        --container-drag-handle-opacity: 0.8;\n        --container-badge-opacity: 0.9;\n      }\n\n      .container-module:hover {\n        --container-drag-handle-opacity: 1;\n        --container-badge-opacity: 1;\n      }\n\n      /* Container-specific colors that can be overridden by individual modules */\n      .horizontal-module-preview.container-module {\n        --container-primary-color: #9c27b0; /* Purple for horizontal */\n        --container-secondary-color: #e1bee7;\n        --container-accent-color: #7b1fa2;\n        --container-border-color: #ba68c8;\n      }\n\n      .vertical-module-preview.container-module {\n        --container-primary-color: #3f51b5; /* Indigo for vertical */\n        --container-secondary-color: #c5cae9;\n        --container-accent-color: #303f9f;\n        --container-border-color: #7986cb;\n      }\n      \n      .form-field input[type="text"],\n      .form-field input[type="number"],\n      .form-field select,\n      .form-field textarea {\n        width: 100%;\n        padding: 8px 12px;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 14px;\n        font-family: inherit;\n        box-sizing: border-box;\n      }\n      \n      .form-field input[type="color"] {\n        width: 60px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        cursor: pointer;\n        background: none;\n      }\n      \n      .form-field input:focus,\n      .form-field select:focus,\n      .form-field textarea:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 1px var(--primary-color);\n      }\n      \n      .form-field textarea {\n        resize: vertical;\n        min-height: 60px;\n        font-family: monospace;\n      }\n      \n      .checkbox-wrapper {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        font-size: 14px;\n        cursor: pointer;\n        color: var(--primary-text-color);\n      }\n      \n      .checkbox-wrapper input[type="checkbox"] {\n        margin: 0;\n        cursor: pointer;\n      }\n      \n      .checkbox-group {\n        display: grid;\n        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));\n        gap: 8px;\n        margin-top: 8px;\n      }\n    '}}const Ze=()=>Ke.getInstance();class Qe{constructor(e){this.hass=e,this._templateSubscriptions=new Map,this._templateResults=new Map,this._evaluationCache=new Map,this.CACHE_TTL=1e3}getTemplateResult(e){const t=this._evaluationCache.get(e);return t&&Date.now()-t.timestamp<this.CACHE_TTL?t.value:this._templateResults.get(e)}hasTemplateSubscription(e){return this._templateSubscriptions.has(e)}getAllTemplateResults(){return this._templateResults}async evaluateTemplate(e){var t;if(!e||!this.hass)return!1;const o=e.trim();if(!o)return!1;const i=`eval_${o}`,n=this._evaluationCache.get(i);if(n&&Date.now()-n.timestamp<this.CACHE_TTL)return n.value;try{const e=await this.hass.callApi("POST","template",{template:o}),t=e.toLowerCase().trim();let n;if(["true","on","yes","1"].includes(t))n=!0;else if(["false","off","no","0","unavailable","unknown","none",""].includes(t))n=!1;else{const o=parseFloat(t);isNaN(o)?(console.warn(`[UltraVehicleCard] Template evaluated to ambiguous string '${e}', interpreting as false.`),n=!1):n=0!==o}return this._evaluationCache.set(i,{value:n,timestamp:Date.now(),stringValue:e}),n}catch(e){const i=(null===(t=e.error)||void 0===t?void 0:t.message)||e.message||String(e);return console.error(`[UltraVehicleCard] Error evaluating template via API: ${o}. Error: ${i}`),!1}}async subscribeToTemplate(e,t,o){if(e&&this.hass){if(this._templateSubscriptions.has(t)){try{const e=this._templateSubscriptions.get(t);if(e){const t=await e;t&&"function"==typeof t&&await t()}}catch(e){}this._templateSubscriptions.delete(t)}try{const i=new Promise(((i,n)=>{i(this.hass.connection.subscribeMessage((e=>{const i=e.result;this.hass.__uvc_template_strings||(this.hass.__uvc_template_strings={}),this.hass.__uvc_template_strings[t]=i;const n=this.parseTemplateResult(i,t);n!==this._templateResults.get(t)&&o&&o(),this._templateResults.set(t,n),this._evaluationCache.set(t,{value:n,timestamp:Date.now(),stringValue:i})}),{type:"render_template",template:e}))}));this._templateSubscriptions.set(t,i)}catch(t){console.error(`[UltraVehicleCard] Failed to subscribe to template: ${e}`,t)}}}parseTemplateResult(e,t){if(t&&t.startsWith("info_entity_"))return!0;if(t&&t.startsWith("state_text_"))return!0;if(null==e)return!1;if("boolean"==typeof e)return e;if("number"==typeof e)return 0!==e;if("string"==typeof e){const t=e.toLowerCase().trim();return"true"===t||"on"===t||"yes"===t||"active"===t||"home"===t||"1"===t||"open"===t||"unlocked"===t||"false"!==t&&"off"!==t&&"no"!==t&&"inactive"!==t&&"not_home"!==t&&"away"!==t&&"0"!==t&&"closed"!==t&&"locked"!==t&&"unavailable"!==t&&"unknown"!==t&&""!==t}return console.warn(`[UltraVehicleCard] Template evaluated to ambiguous type '${typeof e}', interpreting as false.`),!1}async unsubscribeAllTemplates(){for(const[e,t]of this._templateSubscriptions.entries())try{if(t){const e=await Promise.resolve(t).catch((e=>null));if(e&&"function"==typeof e)try{await e()}catch(e){}}}catch(e){}this._templateSubscriptions.clear(),this._templateResults.clear(),this._evaluationCache.clear()}updateHass(e){this.hass=e,this._evaluationCache.clear()}}class et{constructor(){this.hass=null,this.templateService=null}static getInstance(){return et.instance||(et.instance=new et),et.instance}setHass(e){this.hass=e,e&&(this.templateService=new Qe(e))}evaluateDisplayConditions(e,t="always"){if(!this.hass)return console.warn("[LogicService] HomeAssistant instance not available"),!0;if("always"===t||!e||0===e.length)return!0;const o=e.filter((e=>!1!==e.enabled));if(0===o.length)return!0;const i=o.map((e=>this.evaluateSingleCondition(e)));switch(t){case"every":return i.every((e=>e));case"any":return i.some((e=>e));default:return!0}}evaluateModuleVisibility(e){if(!this.hass)return console.warn("[LogicService] HomeAssistant instance not available"),!0;if(e.template_mode&&e.template){const t={id:`template_${e.id}`,type:"template",template:e.template,enabled:!0};return this.evaluateTemplateCondition(t)}return this.evaluateDisplayConditions(e.display_conditions||[],e.display_mode||"always")}evaluateRowVisibility(e){if(!this.hass)return console.warn("[LogicService] HomeAssistant instance not available"),!0;if(e.template_mode&&e.template){const t={id:`template_${e.id}`,type:"template",template:e.template,enabled:!0};return this.evaluateTemplateCondition(t)}return this.evaluateDisplayConditions(e.display_conditions||[],e.display_mode||"always")}evaluateColumnVisibility(e){if(!this.hass)return console.warn("[LogicService] HomeAssistant instance not available"),!0;if(e.template_mode&&e.template){const t={id:`template_${e.id}`,type:"template",template:e.template,enabled:!0};return this.evaluateTemplateCondition(t)}return this.evaluateDisplayConditions(e.display_conditions||[],e.display_mode||"always")}evaluateSingleCondition(e){if(!e.enabled)return!0;switch(e.type){case"entity_state":return this.evaluateEntityStateCondition(e);case"entity_attribute":return this.evaluateEntityAttributeCondition(e);case"time":return this.evaluateTimeCondition(e);case"template":return this.evaluateTemplateCondition(e);case"entity":return console.log("[LogicService] Migrating legacy entity condition to entity_state"),this.evaluateEntityStateCondition(e);default:return console.warn("[LogicService] Unknown condition type:",e.type),!0}}evaluateEntityStateCondition(e){if(!e.entity||!this.hass)return!0;const t=this.hass.states[e.entity];if(!t)return console.warn(`[LogicService] Entity not found: ${e.entity}`),!0;const o=e.operator||"=",i=e.value,n=t.state;switch(o){case"=":return n===String(i);case"!=":return n!==String(i);case">":const e=this.tryParseNumber(n),t=this.tryParseNumber(i);return null!==e&&null!==t&&e>t;case">=":const a=this.tryParseNumber(n),r=this.tryParseNumber(i);return null!==a&&null!==r&&a>=r;case"<":const l=this.tryParseNumber(n),s=this.tryParseNumber(i);return null!==l&&null!==s&&l<s;case"<=":const d=this.tryParseNumber(n),c=this.tryParseNumber(i);return null!==d&&null!==c&&d<=c;case"contains":return String(n).toLowerCase().includes(String(i).toLowerCase());case"not_contains":return!String(n).toLowerCase().includes(String(i).toLowerCase());case"has_value":return null!=n&&""!==n;case"no_value":return null==n||""===n;default:return console.warn(`[LogicService] Unknown operator: ${o}`),!0}}evaluateEntityAttributeCondition(e){if(!e.entity||!e.attribute||!this.hass)return!0;const t=this.hass.states[e.entity];if(!t)return console.warn(`[LogicService] Entity not found: ${e.entity}`),!0;const o=t.attributes[e.attribute];if(void 0===o)return console.warn(`[LogicService] Attribute '${e.attribute}' not found on entity '${e.entity}'`),!0;const i=e.operator||"=",n=e.value,a=o;switch(i){case"=":return String(a)===String(n);case"!=":return String(a)!==String(n);case">":const e=this.tryParseNumber(a),t=this.tryParseNumber(n);return null!==e&&null!==t&&e>t;case">=":const o=this.tryParseNumber(a),r=this.tryParseNumber(n);return null!==o&&null!==r&&o>=r;case"<":const l=this.tryParseNumber(a),s=this.tryParseNumber(n);return null!==l&&null!==s&&l<s;case"<=":const d=this.tryParseNumber(a),c=this.tryParseNumber(n);return null!==d&&null!==c&&d<=c;case"contains":return String(a).toLowerCase().includes(String(n).toLowerCase());case"not_contains":return!String(a).toLowerCase().includes(String(n).toLowerCase());case"has_value":return null!=a&&""!==a;case"no_value":return null==a||""===a;default:return console.warn(`[LogicService] Unknown operator: ${i}`),!0}}evaluateTimeCondition(e){if(!e.time_from||!e.time_to)return!0;const t=new Date,o=60*t.getHours()+t.getMinutes(),[i,n]=e.time_from.split(":").map(Number),[a,r]=e.time_to.split(":").map(Number),l=60*i+n,s=60*a+r;return l<=s?o>=l&&o<=s:o>=l||o<=s}evaluateTemplateCondition(e){if(!e.template||!this.hass)return!0;try{const t=`logic_condition_${e.id}_${e.template}`;if(this.templateService)if(this.templateService.hasTemplateSubscription(t)){const e=this.templateService.getTemplateResult(t);if(void 0!==e)return e}else this.templateService.subscribeToTemplate(e.template,t,(()=>{}));this.hass.callApi&&this.hass.callApi("POST","template",{template:e.template}).then((e=>{const o=e.toLowerCase().trim();let i;if(["true","on","yes","1"].includes(o))i=!0;else if(["false","off","no","0","unavailable","unknown","none",""].includes(o))i=!1;else{const e=parseFloat(o);i=!isNaN(e)&&0!==e}this.templateService&&this.templateService._templateResults.set(t,i)})).catch((e=>{console.warn("[LogicService] Error evaluating template via API:",e)}));const o=e.template;if(o.includes("{% if ")&&o.includes(" %}")){const e=o.match(/\{\%\s*if\s+(.+?)\s*\%\}/);if(e){const t=e[1].match(/states\(['"]([^'"]+)['"]\)\s*(==|!=)\s*['"]([^'"]+)['"]/);if(t){const e=t[1],o=t[2],i=t[3],n=this.hass.states[e];if(n){const e=n.state;if("=="===o)return e===i;if("!="===o)return e!==i}}}}const i=/\{\{\s*states\(['"]([^'"]+)['"]\)\s*\}\}/g;let n,a=o;for(;null!==(n=i.exec(o));){const e=n[1],t=this.hass.states[e],o=t?t.state:"unknown";a=a.replace(n[0],o)}if(a!==o){const e=a.toLowerCase().trim();if(["true","on","yes","1"].includes(e))return!0;if(["false","off","no","0","unavailable","unknown","none",""].includes(e))return!1}return console.log(`[LogicService] Template condition evaluation fallback for: ${o}`),!0}catch(e){return console.warn("[LogicService] Error evaluating template condition:",e),!0}}tryParseNumber(e){if("number"==typeof e)return e;if("string"==typeof e){const t=parseFloat(e);return isNaN(t)?null:t}return null}evaluateLogicProperties(e){if(!e.logic_entity||!this.hass)return!0;const t={id:"logic-property",type:e.logic_attribute?"entity_attribute":"entity_state",entity:e.logic_entity,attribute:e.logic_attribute,operator:e.logic_operator||"=",value:e.logic_value,enabled:!0};return this.evaluateSingleCondition(t)}}const tt=et.getInstance();class ot{static getInstance(){return ot.instance||(ot.instance=new ot),ot.instance}validateAndCorrectConfig(e){const t=[],o=[];let i;try{i=JSON.parse(JSON.stringify(e))}catch(e){return{valid:!1,errors:["Invalid JSON structure"],warnings:[]}}i.type||(i.type="custom:ultra-card",o.push("Added missing card type")),"custom:ultra-card"!==i.type&&t.push(`Invalid card type: ${i.type}`),i.layout||(i.layout={rows:[]},o.push("Added missing layout structure")),i.layout.rows||(i.layout.rows=[],o.push("Added missing rows array")),i.layout.rows=i.layout.rows.map(((e,i)=>{const n=this.validateAndCorrectRow(e,i);return t.push(...n.errors),o.push(...n.warnings),n.correctedRow})),i.layout.rows=i.layout.rows.filter((e=>null!==e));const n={valid:0===t.length,errors:t,warnings:o,correctedConfig:i};return n.valid?o.length>0&&console.log("✅ Config validation passed with corrections",{warnings:o.length,rows:i.layout.rows.length,totalModules:this.countTotalModules(i)}):console.error("❌ Config validation failed",{errors:t,warnings:o}),n}validateAndCorrectRow(e,t){const o=[],i=[];return e.id||(e.id=`row-${Date.now()}-${t}`,i.push(`Row ${t}: Added missing ID`)),e.columns&&Array.isArray(e.columns)||(e.columns=[{id:`col-${Date.now()}-0`,modules:[]}],i.push(`Row ${t}: Added missing columns array`)),e.columns=e.columns.map(((e,n)=>{const a=this.validateAndCorrectColumn(e,t,n);return o.push(...a.errors),i.push(...a.warnings),a.correctedColumn})).filter((e=>null!==e)),0===e.columns.length&&(e.columns=[{id:`col-${Date.now()}-fallback`,modules:[]}],i.push(`Row ${t}: Added fallback column`)),{correctedRow:e,errors:o,warnings:i}}validateAndCorrectColumn(e,t,o){const i=[],n=[];return e.id||(e.id=`col-${Date.now()}-${t}-${o}`,n.push(`Row ${t}, Column ${o}: Added missing ID`)),e.modules&&Array.isArray(e.modules)||(e.modules=[],n.push(`Row ${t}, Column ${o}: Added missing modules array`)),e.modules=e.modules.map(((e,a)=>{const r=this.validateAndCorrectModule(e,t,o,a);return r.valid?r.correctedModule?(n.push(...r.warnings||[]),r.correctedModule):e:(i.push(...r.errors),null)})).filter((e=>null!==e)),{correctedColumn:e,errors:i,warnings:n}}validateAndCorrectModule(e,t,o,i){const n=[],a=[],r=Ze();if(e.id||(e.id=`${e.type||"unknown"}-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,a.push("Module: Added missing ID")),!e.type)return n.push(`Module ${e.id}: Missing type`),{valid:!1,errors:n,warnings:a};if(!r.isModuleRegistered(e.type))return n.push(`Module ${e.id}: Unknown module type "${e.type}"`),{valid:!1,errors:n,warnings:a};const l=r.getModule(e.type);if(l){const t=l.validate(e);if(!t.valid)return n.push(...t.errors.map((t=>`Module ${e.id}: ${t}`))),{valid:!1,errors:n,warnings:a};const o=l.createDefault(e.id);return{valid:!0,errors:[],warnings:a,correctedModule:this.mergeWithDefaults(e,o)}}return{valid:!1,errors:[`Module ${e.id}: No handler found for type "${e.type}"`],warnings:a}}mergeWithDefaults(e,t){const o=Object.assign({},t);return Object.keys(e).forEach((i=>{void 0!==e[i]&&null!==e[i]&&("object"!=typeof e[i]||Array.isArray(e[i])||"object"!=typeof t[i]?o[i]=e[i]:o[i]=Object.assign(Object.assign({},t[i]),e[i]))})),o}countTotalModules(e){return e.layout.rows.reduce(((e,t)=>e+t.columns.reduce(((e,t)=>e+t.modules.length),0)),0)}validateUniqueModuleIds(e){const t=new Set,o=[];for(const i of e.layout.rows)for(const e of i.columns)for(const i of e.modules)t.has(i.id)?o.push(i.id):t.add(i.id);return{valid:0===o.length,duplicates:o}}fixDuplicateModuleIds(e){const t=new Set,o=JSON.parse(JSON.stringify(e));for(const e of o.layout.rows)for(const o of e.columns)for(const e of o.modules){if(t.has(e.id)){let o=`${e.type}-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;for(;t.has(o);)o=`${e.type}-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;console.warn(`🔧 Fixed duplicate module ID: ${e.id} → ${o}`),e.id=o}t.add(e.id)}return o}}const it=ot.getInstance();var nt=function(e,t,o,i){var n,a=arguments.length,r=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,i);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(r=(a<3?n(r):a>3?n(t,o,r):n(t,o))||r);return a>3&&r&&Object.defineProperty(t,o,r),r};let at=class extends se{render(){return V`
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
    `}};at.styles=a`
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
  `,nt([me({attribute:!1})],at.prototype,"hass",void 0),at=nt([ce("ultra-about-tab")],at);class rt extends Se{constructor(e){if(super(e),this.it=W,2!==e.type)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===W||null==e)return this._t=void 0,this.it=e;if(e===G)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}rt.directiveName="unsafeHTML",rt.resultType=1;const lt=Ce(rt);var st,dt=function(e,t,o,i){var n,a=arguments.length,r=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,i);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(r=(a<3?n(r):a>3?n(t,o,r):n(t,o))||r);return a>3&&r&&Object.defineProperty(t,o,r),r};let ct=st=class extends se{constructor(){super(...arguments),this.designProperties={},this._expandedSections=new Set,this._marginLocked=!1,this._paddingLocked=!1,this._clipboardProperties=null}connectedCallback(){super.connectedCallback(),this._loadClipboardFromStorage(),this._storageEventListener=this._handleStorageEvent.bind(this),window.addEventListener("storage",this._storageEventListener)}disconnectedCallback(){super.disconnectedCallback(),this._storageEventListener&&window.removeEventListener("storage",this._storageEventListener)}_handleStorageEvent(e){e.key===st.CLIPBOARD_KEY&&this._loadClipboardFromStorage()}_loadClipboardFromStorage(){try{const e=localStorage.getItem(st.CLIPBOARD_KEY);if(e){const t=JSON.parse(e);t&&"object"==typeof t&&(this._clipboardProperties=t,this.requestUpdate())}}catch(e){console.warn("Failed to load design clipboard from localStorage:",e),this._clipboardProperties=null}}_saveClipboardToStorage(e){try{localStorage.setItem(st.CLIPBOARD_KEY,JSON.stringify(e))}catch(e){console.warn("Failed to save design clipboard to localStorage:",e)}}_clearClipboardFromStorage(){try{localStorage.removeItem(st.CLIPBOARD_KEY)}catch(e){console.warn("Failed to clear design clipboard from localStorage:",e)}}_toggleSection(e){this._expandedSections.has(e)?this._expandedSections.delete(e):(this._expandedSections.clear(),this._expandedSections.add(e)),this.requestUpdate()}_updateProperty(e,t){const o={[e]:t};if(console.log(`🔧 GlobalDesignTab: Updating property ${e} =`,t),console.log("🔧 GlobalDesignTab: onUpdate callback exists:",!!this.onUpdate),this.onUpdate)console.log("🔧 GlobalDesignTab: Using callback approach for property update"),this.onUpdate(o);else{console.log("🔧 GlobalDesignTab: Using event approach for property update");const e=new CustomEvent("design-changed",{detail:o,bubbles:!0,composed:!0});console.log("🔧 GlobalDesignTab: Dispatching design-changed event:",e),this.dispatchEvent(e)}console.log(`🔧 GlobalDesignTab: Property update complete for ${e}`)}_updateSpacing(e,t,o){const i="margin"===e?this._marginLocked:this._paddingLocked;let n;if(n=i?{[`${e}_top`]:o,[`${e}_bottom`]:o,[`${e}_left`]:o,[`${e}_right`]:o}:{[`${e}_${t}`]:o},console.log(`🔧 GlobalDesignTab: Updating spacing ${e}-${t} =`,o,`(locked: ${i})`),console.log("🔧 GlobalDesignTab: Spacing updates:",n),console.log("🔧 GlobalDesignTab: onUpdate callback exists:",!!this.onUpdate),this.onUpdate)console.log("🔧 GlobalDesignTab: Using callback approach for spacing update"),this.onUpdate(n);else{console.log("🔧 GlobalDesignTab: Using event approach for spacing update");const e=new CustomEvent("design-changed",{detail:n,bubbles:!0,composed:!0});console.log("🔧 GlobalDesignTab: Dispatching spacing design-changed event:",e),this.dispatchEvent(e)}}_handleNumericKeydown(e,t,o){if("ArrowUp"!==e.key&&"ArrowDown"!==e.key)return;e.preventDefault();const i=t.match(/^(-?\d*\.?\d*)(.*)$/);if(!i)return;const n=i[1],a=i[2].trim()||"px";let r=parseFloat(n)||0,l=1;"rem"===a||"em"===a?l=.1:"%"===a?l=5:"px"===a&&(l=1),e.shiftKey?l*=10:e.altKey&&(l/=10),"ArrowUp"===e.key?r+=l:r-=l;let s=0;"rem"===a||"em"===a?s=e.altKey?3:1:"%"===a&&e.altKey&&(s=1),o(`${parseFloat(r.toFixed(s))}${a}`)}_toggleSpacingLock(e){"margin"===e?this._marginLocked=!this._marginLocked:this._paddingLocked=!this._paddingLocked,this.requestUpdate()}_resetSection(e){console.log(`🔄 GlobalDesignTab: RESET SECTION CALLED for: ${e}`),console.log("🔄 GlobalDesignTab: Current designProperties:",this.designProperties),console.log("🔄 GlobalDesignTab: onUpdate callback exists:",!!this.onUpdate);const t={};switch(e){case"text":t.color=void 0,t.text_align=void 0,t.font_size=void 0,t.line_height=void 0,t.letter_spacing=void 0,t.font_family=void 0,t.font_weight=void 0,t.text_transform=void 0,t.font_style=void 0;break;case"background":t.background_color=void 0,t.background_image=void 0,t.background_image_type=void 0,t.background_image_entity=void 0,t.backdrop_filter=void 0;break;case"sizes":t.width=void 0,t.height=void 0,t.max_width=void 0,t.max_height=void 0,t.min_width=void 0,t.min_height=void 0;break;case"spacing":t.margin_top=void 0,t.margin_bottom=void 0,t.margin_left=void 0,t.margin_right=void 0,t.padding_top=void 0,t.padding_bottom=void 0,t.padding_left=void 0,t.padding_right=void 0;break;case"border":t.border_radius=void 0,t.border_style=void 0,t.border_width=void 0,t.border_color=void 0;break;case"position":t.position=void 0,t.top=void 0,t.bottom=void 0,t.left=void 0,t.right=void 0,t.z_index=void 0;break;case"text-shadow":t.text_shadow_h=void 0,t.text_shadow_v=void 0,t.text_shadow_blur=void 0,t.text_shadow_color=void 0;break;case"box-shadow":t.box_shadow_h=void 0,t.box_shadow_v=void 0,t.box_shadow_blur=void 0,t.box_shadow_spread=void 0,t.box_shadow_color=void 0;break;case"overflow":t.overflow=void 0,t.clip_path=void 0;break;case"animations":t.animation_type=void 0,t.animation_entity=void 0,t.animation_trigger_type=void 0,t.animation_attribute=void 0,t.animation_state=void 0,t.intro_animation=void 0,t.outro_animation=void 0,t.animation_duration=void 0,t.animation_delay=void 0,t.animation_timing=void 0}if(console.log(`🔄 GlobalDesignTab: Reset properties for ${e}:`,t),this.onUpdate){console.log("🔄 GlobalDesignTab: Using callback approach for section reset");try{this.onUpdate(t),console.log(`🔄 GlobalDesignTab: Callback executed successfully for ${e}`)}catch(t){console.error(`🔄 GlobalDesignTab: Callback error for ${e}:`,t)}}else{console.log("🔄 GlobalDesignTab: Using event approach for section reset");const e=new CustomEvent("design-changed",{detail:t,bubbles:!0,composed:!0});console.log("🔄 GlobalDesignTab: Dispatching reset design-changed event:",e);const o=this.dispatchEvent(e);console.log("🔄 GlobalDesignTab: Event dispatched successfully:",o)}console.log(`🔄 GlobalDesignTab: Requesting update for section ${e}`),this.requestUpdate(),setTimeout((()=>{console.log(`🔄 GlobalDesignTab: Delayed update for section ${e} UI indicators`),this.requestUpdate()}),50),console.log(`✅ GlobalDesignTab: Reset complete for ${e}`)}_copyDesign(){this._clipboardProperties=Object.assign({},this.designProperties),this._saveClipboardToStorage(this._clipboardProperties);const e=Object.keys(this._clipboardProperties).filter((e=>this._clipboardProperties[e])).length;console.log(`Design properties copied to cross-card clipboard (${e} properties)`),this.requestUpdate()}_pasteDesign(){this._clipboardProperties||this._loadClipboardFromStorage(),this._clipboardProperties?(this.onUpdate?this.onUpdate(this._clipboardProperties):this.dispatchEvent(new CustomEvent("design-changed",{detail:this._clipboardProperties,bubbles:!0,composed:!0})),console.log("Design properties pasted from cross-card clipboard")):console.log("No design properties in cross-card clipboard")}_resetAllDesign(){console.log("🔄 GlobalDesignTab: RESET ALL DESIGN CALLED"),console.log("🔄 GlobalDesignTab: Current designProperties:",this.designProperties),console.log("🔄 GlobalDesignTab: onUpdate callback exists:",!!this.onUpdate);const e={color:void 0,text_align:void 0,font_size:void 0,line_height:void 0,letter_spacing:void 0,font_family:void 0,font_weight:void 0,text_transform:void 0,font_style:void 0,background_color:void 0,background_image:void 0,background_image_type:void 0,background_image_entity:void 0,backdrop_filter:void 0,width:void 0,height:void 0,max_width:void 0,max_height:void 0,min_width:void 0,min_height:void 0,margin_top:void 0,margin_bottom:void 0,margin_left:void 0,margin_right:void 0,padding_top:void 0,padding_bottom:void 0,padding_left:void 0,padding_right:void 0,border_radius:void 0,border_style:void 0,border_width:void 0,border_color:void 0,position:void 0,top:void 0,bottom:void 0,left:void 0,right:void 0,z_index:void 0,text_shadow_h:void 0,text_shadow_v:void 0,text_shadow_blur:void 0,text_shadow_color:void 0,box_shadow_h:void 0,box_shadow_v:void 0,box_shadow_blur:void 0,box_shadow_spread:void 0,box_shadow_color:void 0,overflow:void 0,clip_path:void 0,animation_type:void 0,animation_entity:void 0,animation_trigger_type:void 0,animation_attribute:void 0,animation_state:void 0,intro_animation:void 0,outro_animation:void 0,animation_duration:void 0,animation_delay:void 0,animation_timing:void 0};if(console.log("🔄 GlobalDesignTab: Reset properties for ALL sections:",e),this.onUpdate){console.log("🔄 GlobalDesignTab: Using callback approach for reset all");try{this.onUpdate(e),console.log("🔄 GlobalDesignTab: Reset all callback executed successfully")}catch(e){console.error("🔄 GlobalDesignTab: Reset all callback error:",e)}}else{console.log("🔄 GlobalDesignTab: Using event approach for reset all");const t=new CustomEvent("design-changed",{detail:e,bubbles:!0,composed:!0});console.log("🔄 GlobalDesignTab: Dispatching reset all design-changed event:",t);const o=this.dispatchEvent(t);console.log("🔄 GlobalDesignTab: Reset all event dispatched successfully:",o)}console.log("🔄 GlobalDesignTab: Requesting update for reset all"),this.requestUpdate(),setTimeout((()=>{console.log("🔄 GlobalDesignTab: Delayed update for reset all UI indicators"),this.requestUpdate()}),50),console.log("✅ GlobalDesignTab: All design properties reset to default")}_clearClipboard(){this._clipboardProperties=null,this._clearClipboardFromStorage(),console.log("Cross-card clipboard cleared"),this.requestUpdate()}async _handleBackgroundImageUpload(e){var t;const o=null===(t=e.target.files)||void 0===t?void 0:t[0];if(o&&this.hass)try{const e=await async function(e,t){var o;if(!t)throw console.error("[UPLOAD] Missing file."),new Error("No file provided for upload.");if(!(e&&e.auth&&e.auth.data&&e.auth.data.access_token))throw console.error("[UPLOAD] Missing Home Assistant authentication details."),new Error("Authentication details are missing.");const i=new FormData;i.append("file",t);let n="";n=e.connection&&"string"==typeof(null===(o=e.connection.options)||void 0===o?void 0:o.url)?e.connection.options.url.replace(/^ws/,"http"):"function"==typeof e.hassUrl?e.hassUrl():`${window.location.protocol}//${window.location.host}`;const a=`${n.replace(/\/$/,"")}/api/image/upload`;try{const t=await fetch(a,{method:"POST",headers:{Authorization:`Bearer ${e.auth.data.access_token}`},body:i});if(!t.ok){const e=await t.text();throw console.error(`[UPLOAD] Failed to upload image via ${a}: ${t.status} ${t.statusText}`,e),new Error(`Failed to upload image via ${a}: ${t.statusText}`)}const o=await t.json();if(!o||!o.id)throw console.error(`[UPLOAD] Invalid response from ${a}: missing id`,o),new Error(`Invalid response from ${a}: missing id`);return`/api/image/serve/${o.id}`}catch(e){throw console.error(`[UPLOAD] Error during fetch to ${a}:`,e),new Error(`Upload via ${a} failed: ${e instanceof Error?e.message:"Unknown network error"}`)}}(this.hass,o),t={background_image:e,background_image_type:"upload"};this.onUpdate?this.onUpdate(t):this.dispatchEvent(new CustomEvent("design-changed",{detail:t,bubbles:!0,composed:!0}))}catch(e){console.error("Background image upload failed:",e),alert(`Upload failed: ${e instanceof Error?e.message:"Unknown error"}`)}}_truncatePath(e){return e?e.length<=30?e:"..."+e.slice(-27):""}_getStateValueHint(e){if(!this.hass||!e)return"Enter the state value to trigger animation";const t=this.hass.states[e];return t?t.state&&"unknown"!==t.state&&"unavailable"!==t.state?`Current state: ${t.state}`:"Enter the state value to trigger animation":"Entity not found"}_getAttributeNameHint(e){if(!this.hass||!e)return"Enter the attribute name to monitor";const t=this.hass.states[e];if(!t||!t.attributes)return"Entity not found or has no attributes";const o=Object.keys(t.attributes).filter((e=>!e.startsWith("_")&&"object"!=typeof t.attributes[e])).slice(0,3);return o.length>0?`Available attributes: ${o.join(", ")}${Object.keys(t.attributes).length>3?", ...":""}`:"Enter the attribute name to monitor"}_getAttributeValueHint(e,t){if(!this.hass||!e)return"Enter the attribute value to trigger animation";if(!t)return"Select an attribute first";const o=this.hass.states[e];if(!o||!o.attributes)return"Entity not found or has no attributes";const i=o.attributes[t];if(null!=i){const e=String(i);return`Current value: ${e.length>30?`${e.slice(0,27)}...`:e}`}return"Attribute not found - check the attribute name"}_hasModifiedProperties(e){const t=this.designProperties,o=e=>null!=e&&""!==e;switch(e){case"text":return!!(o(t.color)||o(t.text_align)||o(t.font_size)||o(t.line_height)||o(t.letter_spacing)||o(t.font_family)||o(t.font_weight)||o(t.text_transform)||o(t.font_style));case"background":return!!(o(t.background_color)||o(t.background_image)||o(t.background_image_type)||o(t.background_image_entity)||o(t.backdrop_filter));case"sizes":return!!(o(t.width)||o(t.height)||o(t.max_width)||o(t.max_height)||o(t.min_width)||o(t.min_height));case"spacing":return!!(o(t.margin_top)||o(t.margin_bottom)||o(t.margin_left)||o(t.margin_right)||o(t.padding_top)||o(t.padding_bottom)||o(t.padding_left)||o(t.padding_right));case"border":return!!(o(t.border_radius)||o(t.border_style)||o(t.border_width)||o(t.border_color));case"position":return!!(o(t.position)||o(t.top)||o(t.bottom)||o(t.left)||o(t.right)||o(t.z_index));case"text-shadow":return!!(o(t.text_shadow_h)||o(t.text_shadow_v)||o(t.text_shadow_blur)||o(t.text_shadow_color));case"box-shadow":return!!(o(t.box_shadow_h)||o(t.box_shadow_v)||o(t.box_shadow_blur)||o(t.box_shadow_spread)||o(t.box_shadow_color));case"overflow":return!(!o(t.overflow)&&!o(t.clip_path));case"animations":return!!(o(t.animation_type)&&"none"!==t.animation_type||o(t.animation_entity)||o(t.animation_trigger_type)||o(t.animation_attribute)||o(t.animation_state)||o(t.intro_animation)&&"none"!==t.intro_animation||o(t.outro_animation)&&"none"!==t.outro_animation||o(t.animation_duration)||o(t.animation_delay)||o(t.animation_timing)&&"ease"!==t.animation_timing);default:return!1}}_renderAccordion(e,t,o){const i=this._expandedSections.has(o),n=this._hasModifiedProperties(o);return V`
      <div class="accordion-section">
        <div class="accordion-header ${i?"expanded":""}">
          <button class="accordion-toggle" @click=${()=>this._toggleSection(o)}>
            <span class="accordion-title">
              ${e} ${n?V`<span class="edit-indicator"></span>`:""}
            </span>
          </button>
          <div class="accordion-actions">
            ${n?V`
                  <button
                    class="reset-button"
                    @click=${e=>{e.stopPropagation(),this._resetSection(o)}}
                    title="Reset ${e} settings to default"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                `:""}
            <button class="expand-button" @click=${()=>this._toggleSection(o)}>
              <ha-icon icon="mdi:chevron-${i?"up":"down"}"></ha-icon>
            </button>
          </div>
        </div>
        ${i?V`<div class="accordion-content">${t}</div>`:""}
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
                @value-changed=${e=>this._updateProperty("color",e.detail.value)}
              ></ultra-color-picker>
            </div>

            <div class="property-group">
              <label>Alignment:</label>
              <div class="button-group">
                ${["left","center","right","justify"].map((e=>V`
                    <button
                      class="property-btn ${this.designProperties.text_align===e?"active":""}"
                      @click=${()=>this._updateProperty("text_align",e)}
                    >
                      <ha-icon icon="mdi:format-align-${e}"></ha-icon>
                    </button>
                  `))}
              </div>
            </div>

            <div class="property-group">
              <label>Font Size:</label>
              <input
                type="text"
                .value=${this.designProperties.font_size||""}
                @input=${e=>this._updateProperty("font_size",e.target.value)}
                placeholder="16px, 1.2rem, max(1rem, 1.5vw)"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Line Height:</label>
              <input
                type="text"
                .value=${this.designProperties.line_height||""}
                @input=${e=>this._updateProperty("line_height",e.target.value)}
                placeholder="28px, 1.7"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Letter Spacing:</label>
              <input
                type="text"
                .value=${this.designProperties.letter_spacing||""}
                @input=${e=>this._updateProperty("letter_spacing",e.target.value)}
                placeholder="1px, -0.04em"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Font:</label>
              <select
                .value=${this.designProperties.font_family||""}
                @change=${e=>this._updateProperty("font_family",e.target.value)}
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
                @change=${e=>this._updateProperty("font_weight",e.target.value)}
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
                @change=${e=>this._updateProperty("text_transform",e.target.value)}
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
                @change=${e=>this._updateProperty("font_style",e.target.value)}
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
                @value-changed=${e=>this._updateProperty("background_color",e.detail.value)}
              ></ultra-color-picker>
            </div>

            <div class="property-group">
              <label>Background Image Type:</label>
              <select
                .value=${this.designProperties.background_image_type||"none"}
                @change=${e=>this._updateProperty("background_image_type",e.target.value)}
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
                      @value-changed=${e=>this._updateProperty("background_image_entity",e.detail.value)}
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
                      @input=${e=>this._updateProperty("background_image",e.target.value)}
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
                @input=${e=>this._updateProperty("backdrop_filter",e.target.value)}
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
                @input=${e=>this._updateProperty("width",e.target.value)}
                @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.width||"",(e=>this._updateProperty("width",e)))}
                placeholder="200px, 100%, 14rem, 10vw"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Height:</label>
              <input
                type="text"
                .value=${this.designProperties.height||""}
                @input=${e=>this._updateProperty("height",e.target.value)}
                @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.height||"",(e=>this._updateProperty("height",e)))}
                placeholder="200px, 15rem, 10vh"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Max Width:</label>
              <input
                type="text"
                .value=${this.designProperties.max_width||""}
                @input=${e=>this._updateProperty("max_width",e.target.value)}
                @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.max_width||"",(e=>this._updateProperty("max_width",e)))}
                placeholder="200px, 100%, 14rem, 10vw"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Max Height:</label>
              <input
                type="text"
                .value=${this.designProperties.max_height||""}
                @input=${e=>this._updateProperty("max_height",e.target.value)}
                placeholder="200px, 15rem, 10vh"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Min Width:</label>
              <input
                type="text"
                .value=${this.designProperties.min_width||""}
                @input=${e=>this._updateProperty("min_width",e.target.value)}
                placeholder="200px, 100%, 14rem, 10vw"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Min Height:</label>
              <input
                type="text"
                .value=${this.designProperties.min_height||""}
                @input=${e=>this._updateProperty("min_height",e.target.value)}
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
                    @input=${e=>this._updateSpacing("margin","top",e.target.value)}
                    @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.margin_top||"",(e=>this._updateSpacing("margin","top",e)))}
                    class="spacing-input"
                  />
                </div>
                <div class="spacing-field">
                  <label>Right</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this.designProperties.margin_right||""}
                    @input=${e=>this._updateSpacing("margin","right",e.target.value)}
                    @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.margin_right||"",(e=>this._updateSpacing("margin","right",e)))}
                    class="spacing-input"
                  />
                </div>
                <div class="spacing-field">
                  <label>Bottom</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this.designProperties.margin_bottom||""}
                    @input=${e=>this._updateSpacing("margin","bottom",e.target.value)}
                    @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.margin_bottom||"",(e=>this._updateSpacing("margin","bottom",e)))}
                    class="spacing-input"
                  />
                </div>
                <div class="spacing-field">
                  <label>Left</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this.designProperties.margin_left||""}
                    @input=${e=>this._updateSpacing("margin","left",e.target.value)}
                    @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.margin_left||"",(e=>this._updateSpacing("margin","left",e)))}
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
                    @input=${e=>this._updateSpacing("padding","top",e.target.value)}
                    @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.padding_top||"",(e=>this._updateSpacing("padding","top",e)))}
                    class="spacing-input"
                  />
                </div>
                <div class="spacing-field">
                  <label>Right</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this.designProperties.padding_right||""}
                    @input=${e=>this._updateSpacing("padding","right",e.target.value)}
                    @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.padding_right||"",(e=>this._updateSpacing("padding","right",e)))}
                    class="spacing-input"
                  />
                </div>
                <div class="spacing-field">
                  <label>Bottom</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this.designProperties.padding_bottom||""}
                    @input=${e=>this._updateSpacing("padding","bottom",e.target.value)}
                    @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.padding_bottom||"",(e=>this._updateSpacing("padding","bottom",e)))}
                    class="spacing-input"
                  />
                </div>
                <div class="spacing-field">
                  <label>Left</label>
                  <input
                    type="text"
                    placeholder="0px, 1rem, 5%"
                    .value=${this.designProperties.padding_left||""}
                    @input=${e=>this._updateSpacing("padding","left",e.target.value)}
                    @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.padding_left||"",(e=>this._updateSpacing("padding","left",e)))}
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
                @input=${e=>this._updateProperty("border_radius",e.target.value)}
                @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.border_radius||"",(e=>this._updateProperty("border_radius",e)))}
                placeholder="5px, 50%, 0.3em, 12px 0"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Border Style:</label>
              <select
                .value=${this.designProperties.border_style||""}
                @change=${e=>this._updateProperty("border_style",e.target.value)}
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
                @input=${e=>this._updateProperty("border_width",e.target.value)}
                @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.border_width||"",(e=>this._updateProperty("border_width",e)))}
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
                @value-changed=${e=>this._updateProperty("border_color",e.detail.value)}
              ></ultra-color-picker>
            </div>
          `,"border")}
        ${this._renderAccordion("Position",V`
            <div class="property-group">
              <label>Position:</label>
              <select
                .value=${this.designProperties.position||""}
                @change=${e=>this._updateProperty("position",e.target.value)}
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
                      @input=${e=>this._updateProperty("top",e.target.value)}
                      @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.top||"",(e=>this._updateProperty("top",e)))}
                    />
                    <div class="position-row">
                      <input
                        type="text"
                        placeholder="Left"
                        .value=${this.designProperties.left||""}
                        @input=${e=>this._updateProperty("left",e.target.value)}
                        @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.left||"",(e=>this._updateProperty("left",e)))}
                      />
                      <div class="position-center">POS</div>
                      <input
                        type="text"
                        placeholder="Right"
                        .value=${this.designProperties.right||""}
                        @input=${e=>this._updateProperty("right",e.target.value)}
                        @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.right||"",(e=>this._updateProperty("right",e)))}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Bottom"
                      .value=${this.designProperties.bottom||""}
                      @input=${e=>this._updateProperty("bottom",e.target.value)}
                      @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.bottom||"",(e=>this._updateProperty("bottom",e)))}
                    />
                  </div>

                  <div class="property-group">
                    <label>Z-Index:</label>
                    <input
                      type="text"
                      .value=${this.designProperties.z_index||""}
                      @input=${e=>this._updateProperty("z_index",e.target.value)}
                      @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.z_index||"",(e=>this._updateProperty("z_index",e)))}
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
                @input=${e=>this._updateProperty("text_shadow_h",e.target.value)}
                @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.text_shadow_h||"",(e=>this._updateProperty("text_shadow_h",e)))}
                placeholder="0, 3px, 0.05em, 2rem"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Vertical Shift:</label>
              <input
                type="text"
                .value=${this.designProperties.text_shadow_v||""}
                @input=${e=>this._updateProperty("text_shadow_v",e.target.value)}
                @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.text_shadow_v||"",(e=>this._updateProperty("text_shadow_v",e)))}
                placeholder="0, 3px, 0.05em, 2rem"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Blur:</label>
              <input
                type="text"
                .value=${this.designProperties.text_shadow_blur||""}
                @input=${e=>this._updateProperty("text_shadow_blur",e.target.value)}
                @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.text_shadow_blur||"",(e=>this._updateProperty("text_shadow_blur",e)))}
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
                @value-changed=${e=>this._updateProperty("text_shadow_color",e.detail.value)}
              ></ultra-color-picker>
            </div>
          `,"text-shadow")}
        ${this._renderAccordion("Box Shadow",V`
            <div class="property-group">
              <label>Horizontal Shift:</label>
              <input
                type="text"
                .value=${this.designProperties.box_shadow_h||""}
                @input=${e=>this._updateProperty("box_shadow_h",e.target.value)}
                @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.box_shadow_h||"",(e=>this._updateProperty("box_shadow_h",e)))}
                placeholder="0, 3px, 0.05em, 2rem"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Vertical Shift:</label>
              <input
                type="text"
                .value=${this.designProperties.box_shadow_v||""}
                @input=${e=>this._updateProperty("box_shadow_v",e.target.value)}
                @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.box_shadow_v||"",(e=>this._updateProperty("box_shadow_v",e)))}
                placeholder="0, 3px, 0.05em, 2rem"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Blur:</label>
              <input
                type="text"
                .value=${this.designProperties.box_shadow_blur||""}
                @input=${e=>this._updateProperty("box_shadow_blur",e.target.value)}
                @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.box_shadow_blur||"",(e=>this._updateProperty("box_shadow_blur",e)))}
                placeholder="0, 3px, 0.05em, 2rem"
                class="property-input"
              />
            </div>

            <div class="property-group">
              <label>Spread:</label>
              <input
                type="text"
                .value=${this.designProperties.box_shadow_spread||""}
                @input=${e=>this._updateProperty("box_shadow_spread",e.target.value)}
                @keydown=${e=>this._handleNumericKeydown(e,this.designProperties.box_shadow_spread||"",(e=>this._updateProperty("box_shadow_spread",e)))}
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
                @value-changed=${e=>this._updateProperty("box_shadow_color",e.detail.value)}
              ></ultra-color-picker>
            </div>
          `,"box-shadow")}
        ${this._renderAccordion("Overflow",V`
            <div class="property-group">
              <label>Overflow:</label>
              <select
                .value=${this.designProperties.overflow||""}
                @change=${e=>this._updateProperty("overflow",e.target.value)}
                class="property-select"
              >
                <option value="">– Default –</option>
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
                <option value="scroll">Scroll</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div class="property-group">
              <label>Clip-path:</label>
              <input
                type="text"
                .value=${this.designProperties.clip_path||""}
                @input=${e=>this._updateProperty("clip_path",e.target.value)}
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
                  @change=${e=>this._updateProperty("animation_type",e.target.value)}
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
                  @input=${e=>this._updateProperty("animation_duration",e.target.value)}
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
                        @value-changed=${e=>this._updateProperty("animation_entity",e.detail.value.entity)}
                      ></ha-form>
                    </div>

                    ${this.designProperties.animation_entity?V`
                          <div class="property-group">
                            <label>Animation Trigger Type:</label>
                            <select
                              id="animation-trigger-type-select"
                              .value=${this.designProperties.animation_trigger_type||"state"}
                              @change=${e=>{const t=e.target.value;console.log("Animation trigger type changing to:",t);const o={animation_trigger_type:t,animation_state:"",animation_attribute:""};this.onUpdate?this.onUpdate(o):this.dispatchEvent(new CustomEvent("design-changed",{detail:o,bubbles:!0,composed:!0})),this.designProperties=Object.assign(Object.assign({},this.designProperties),o),this.requestUpdate()}}
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

                          ${(()=>{const e=this.designProperties.animation_trigger_type||"state",t="attribute"===e;return console.log("TRIGGER TYPE DETECTION:",{currentTriggerType:e,isAttributeMode:t,entitySelected:!!this.designProperties.animation_entity,attributeSelected:!!this.designProperties.animation_attribute,stateValue:this.designProperties.animation_state}),t?(console.log("🟢 RENDERING ATTRIBUTE MODE UI"),console.log("Rendering attribute mode UI"),V`
                                <div class="property-group attribute-mode-container">
                                  <div class="property-group">
                                    <label>
                                      <ha-icon icon="mdi:format-list-checks"></ha-icon>
                                      Attribute Name:
                                    </label>
                                    <input
                                      type="text"
                                      .value=${this.designProperties.animation_attribute||""}
                                      @input=${e=>{const t=e.target.value;console.log("Animation attribute changed to:",t),console.log("Current entity:",this.designProperties.animation_entity),console.log("Current trigger type:",this.designProperties.animation_trigger_type);const o=e.target;o.classList.add("change-success");const i={animation_attribute:t,animation_state:""};this.onUpdate?this.onUpdate(i):this.dispatchEvent(new CustomEvent("design-changed",{detail:i,bubbles:!0,composed:!0})),setTimeout((()=>{console.log("First UI refresh after attribute change (50ms)"),this.requestUpdate()}),50),setTimeout((()=>{console.log("Second UI refresh after attribute change (150ms)"),this.requestUpdate()}),150),setTimeout((()=>{console.log("Third UI refresh after attribute change (300ms)"),this.requestUpdate()}),300),setTimeout((()=>{console.log("Final UI refresh after attribute change (500ms)"),this.requestUpdate(),o.classList.remove("change-success")}),500)}}
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
                                      @input=${e=>this._updateProperty("animation_state",e.target.value)}
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
                                    @input=${e=>this._updateProperty("animation_state",e.target.value)}
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
                    @change=${e=>this._updateProperty("intro_animation",e.target.value)}
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
                    @change=${e=>this._updateProperty("outro_animation",e.target.value)}
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
                    @input=${e=>this._updateProperty("animation_duration",e.target.value)}
                    placeholder="0.3s, 500ms"
                    class="property-input"
                  />
                </div>

                <div class="property-group">
                  <label>Delay:</label>
                  <input
                    type="text"
                    .value=${this.designProperties.animation_delay||""}
                    @input=${e=>this._updateProperty("animation_delay",e.target.value)}
                    placeholder="0s, 100ms"
                    class="property-input"
                  />
                </div>

                <div class="property-group">
                  <label>Timing:</label>
                  <select
                    .value=${this.designProperties.animation_timing||"ease"}
                    @change=${e=>this._updateProperty("animation_timing",e.target.value)}
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
    `}};ct.CLIPBOARD_KEY="ultra-card-design-clipboard",ct._lastAnimationTriggerType=null,dt([me({attribute:!1})],ct.prototype,"hass",void 0),dt([me({attribute:!1})],ct.prototype,"designProperties",void 0),dt([me({type:Function})],ct.prototype,"onUpdate",void 0),dt([ge()],ct.prototype,"_expandedSections",void 0),dt([ge()],ct.prototype,"_marginLocked",void 0),dt([ge()],ct.prototype,"_paddingLocked",void 0),dt([ge()],ct.prototype,"_clipboardProperties",void 0),ct=st=dt([ce("ultra-global-design-tab")],ct);var pt=function(e,t,o,i){var n,a=arguments.length,r=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,i);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(r=(a<3?n(r):a>3?n(t,o,r):n(t,o))||r);return a>3&&r&&Object.defineProperty(t,o,r),r};const ut=[{value:"default",label:"– Default –",category:"default"}],mt=[{value:"Montserrat",label:"Montserrat (used as default font)",category:"typography"}],gt=[{value:"Georgia, serif",label:"Georgia, serif",category:"websafe"},{value:"Palatino Linotype, Book Antiqua, Palatino, serif",label:"Palatino Linotype, Book Antiqua, Palatino, serif",category:"websafe"},{value:"Times New Roman, Times, serif",label:"Times New Roman, Times, serif",category:"websafe"},{value:"Arial, Helvetica, sans-serif",label:"Arial, Helvetica, sans-serif",category:"websafe"},{value:"Impact, Charcoal, sans-serif",label:"Impact, Charcoal, sans-serif",category:"websafe"},{value:"Lucida Sans Unicode, Lucida Grande, sans-serif",label:"Lucida Sans Unicode, Lucida Grande, sans-serif",category:"websafe"},{value:"Tahoma, Geneva, sans-serif",label:"Tahoma, Geneva, sans-serif",category:"websafe"},{value:"Trebuchet MS, Helvetica, sans-serif",label:"Trebuchet MS, Helvetica, sans-serif",category:"websafe"},{value:"Verdana, Geneva, sans-serif",label:"Verdana, Geneva, sans-serif",category:"websafe"},{value:"Courier New, Courier, monospace",label:"Courier New, Courier, monospace",category:"websafe"},{value:"Lucida Console, Monaco, monospace",label:"Lucida Console, Monaco, monospace",category:"websafe"}];let ht=class extends se{constructor(){super(...arguments),this._showModuleSelector=!1,this._selectedRowIndex=-1,this._selectedColumnIndex=-1,this._showModuleSettings=!1,this._selectedModule=null,this._activeModuleTab="general",this._activeDesignSubtab="text",this._showRowSettings=!1,this._selectedRowForSettings=-1,this._activeRowTab="general",this._showColumnSettings=!1,this._selectedColumnForSettings=null,this._activeColumnTab="general",this._showColumnLayoutSelector=!1,this._selectedRowForLayout=-1,this._draggedItem=null,this._dropTarget=null,this._selectedLayoutModuleIndex=-1,this._showLayoutChildSettings=!1,this._selectedLayoutChild=null,this._collapsedRows=new Set,this._collapsedColumns=new Set,this.COLUMN_LAYOUTS=[{id:"1-col",name:"1",proportions:[1],columnCount:1},{id:"1-2-1-2",name:"1/2 + 1/2",proportions:[1,1],columnCount:2},{id:"1-3-2-3",name:"1/3 + 2/3",proportions:[1,2],columnCount:2},{id:"2-3-1-3",name:"2/3 + 1/3",proportions:[2,1],columnCount:2},{id:"2-5-3-5",name:"2/5 + 3/5",proportions:[2,3],columnCount:2},{id:"3-5-2-5",name:"3/5 + 2/5",proportions:[3,2],columnCount:2},{id:"1-3-1-3-1-3",name:"1/3 + 1/3 + 1/3",proportions:[1,1,1],columnCount:3},{id:"1-4-1-2-1-4",name:"1/4 + 1/2 + 1/4",proportions:[1,2,1],columnCount:3},{id:"1-5-3-5-1-5",name:"1/5 + 3/5 + 1/5",proportions:[1,3,1],columnCount:3},{id:"1-6-2-3-1-6",name:"1/6 + 2/3 + 1/6",proportions:[1,4,1],columnCount:3},{id:"1-4-1-4-1-4-1-4",name:"1/4 + 1/4 + 1/4 + 1/4",proportions:[1,1,1,1],columnCount:4},{id:"1-5-1-5-1-5-1-5",name:"1/5 + 1/5 + 1/5 + 1/5",proportions:[1,1,1,1],columnCount:4},{id:"1-6-1-6-1-6-1-6",name:"1/6 + 1/6 + 1/6 + 1/6",proportions:[1,1,1,1],columnCount:4},{id:"1-8-1-4-1-4-1-8",name:"1/8 + 1/4 + 1/4 + 1/8",proportions:[1,2,2,1],columnCount:4},{id:"1-5-1-5-1-5-1-5-1-5",name:"1/5 + 1/5 + 1/5 + 1/5 + 1/5",proportions:[1,1,1,1,1],columnCount:5},{id:"1-6-1-6-1-3-1-6-1-6",name:"1/6 + 1/6 + 1/3 + 1/6 + 1/6",proportions:[1,1,2,1,1],columnCount:5},{id:"1-8-1-4-1-4-1-4-1-8",name:"1/8 + 1/4 + 1/4 + 1/4 + 1/8",proportions:[1,2,2,2,1],columnCount:5},{id:"1-6-1-6-1-6-1-6-1-6-1-6",name:"1/6 + 1/6 + 1/6 + 1/6 + 1/6 + 1/6",proportions:[1,1,1,1,1,1],columnCount:6}]}_createColumnIconHTML(e){const t=e.reduce(((e,t)=>e+t),0);return`<div style="display: flex; width: 100%; height: 16px; gap: 2px;">${e.map(((e,o)=>`<div style="width: ${e/t*100}%; height: 16px; background: #2196F3; border-radius: 2px; ${o>0?"margin-left: 2px;":""}"></div>`)).join("")}</div>`}_createSimpleIcon(e){return e.map((e=>"█".repeat(e))).join(" ")}_getLayoutsForColumnCount(e){const t=Math.min(e,6);return this.COLUMN_LAYOUTS.filter((e=>e.columnCount===t))}_migrateLegacyLayoutId(e){return{"50-50":"1-2-1-2","30-70":"1-3-2-3","70-30":"2-3-1-3","33-33-33":"1-3-1-3-1-3","25-50-25":"1-4-1-2-1-4","20-60-20":"1-5-3-5-1-5","25-25-25-25":"1-4-1-4-1-4-1-4"}[e]||e}_ensureLayout(){return this.config.layout&&this.config.layout.rows?this._migrateLayoutNames(this.config.layout):{rows:[{id:`row-${Date.now()}`,row_name:"Row 1",columns:[{id:`col-${Date.now()}`,modules:[],vertical_alignment:"center",horizontal_alignment:"center",column_name:"Column 1"}],column_layout:"1-col"}]}}_migrateLayoutNames(e){return{rows:e.rows.map(((e,t)=>{const o=e,i=Object.assign(Object.assign({},o),{row_name:o.row_name||`Row ${t+1}`});if(e.columns){const t=e.columns.map(((e,t)=>{const o=e;return Object.assign(Object.assign({},o),{column_name:o.column_name||`Column ${t+1}`})}));i.columns=t}return i}))}}_updateConfig(e){const t=Object.assign(Object.assign({},this.config),e),o=new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0});this.dispatchEvent(o)}_updateLayout(e){this._updateConfig({layout:e})}_toggleRowCollapse(e){this._collapsedRows.has(e)?this._collapsedRows.delete(e):this._collapsedRows.add(e),this._collapsedRows=new Set(this._collapsedRows),this._saveCollapseState()}_toggleColumnCollapse(e,t){const o=`${e}-${t}`;this._collapsedColumns.has(o)?this._collapsedColumns.delete(o):this._collapsedColumns.add(o),this._collapsedColumns=new Set(this._collapsedColumns),this._saveCollapseState()}_isRowCollapsed(e){return this._collapsedRows.has(e)}_isColumnCollapsed(e,t){const o=`${e}-${t}`;return this._collapsedColumns.has(o)}_saveCollapseState(){try{const e={collapsedRows:Array.from(this._collapsedRows),collapsedColumns:Array.from(this._collapsedColumns)};localStorage.setItem("ultra-card-layout-collapse-state",JSON.stringify(e))}catch(e){console.warn("Failed to save collapse state:",e)}}_loadCollapseState(){try{const e=localStorage.getItem("ultra-card-layout-collapse-state");if(e){const t=JSON.parse(e);this._collapsedRows=new Set(t.collapsedRows||[]),this._collapsedColumns=new Set(t.collapsedColumns||[])}}catch(e){console.warn("Failed to load collapse state:",e)}}_addRow(){console.log("Adding new row...");const e=this._ensureLayout(),t=e.rows.length,o={id:`row-${Date.now()}`,columns:[],column_layout:"1-col",row_name:`Row ${t+1}`},i={rows:[...e.rows,o]};this._updateLayout(i),console.log("Row added successfully (empty row)")}_deleteRow(e){console.log("Deleting row:",e);const t=this._ensureLayout();if(t.rows.length>1){const o={rows:t.rows.filter(((t,o)=>o!==e))};this._updateLayout(o),console.log("Row deleted successfully")}else console.log("Cannot delete the last remaining row")}_duplicateRow(e){console.log("Duplicating row:",e);const t=this._ensureLayout(),o=t.rows[e];if(!o)return void console.error("Row to copy not found at index:",e);const i=e+1,n=Object.assign(Object.assign({},JSON.parse(JSON.stringify(o))),{id:`row-${Date.now()}`,row_name:`Row ${i+1}`,columns:o.columns.map(((e,t)=>Object.assign(Object.assign({},JSON.parse(JSON.stringify(e))),{id:`col-${Date.now()}-${t}-${Math.random().toString(36).substr(2,9)}`,column_name:`Column ${t+1}`,modules:e.modules.map(((e,t)=>Object.assign(Object.assign({},JSON.parse(JSON.stringify(e))),{id:`${e.type}-${Date.now()}-${t}-${Math.random().toString(36).substr(2,9)}`})))})))}),a=JSON.parse(JSON.stringify(t));a.rows.splice(e+1,0,n),this._updateLayout(a),console.log("Row duplicated successfully. New layout has",a.rows.length,"rows")}_addColumn(e){console.log("Adding column to row:",e);const t=this._ensureLayout(),o=t.rows[e];if(!o)return void console.error("Row not found at index:",e);if(o.columns.length>=6)return void console.log("Cannot add more than 6 columns to a row");const i=o.columns.length,n={id:`col-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,modules:[],vertical_alignment:"center",horizontal_alignment:"center",column_name:`Column ${i+1}`},a={rows:t.rows.map(((t,o)=>o===e?Object.assign(Object.assign({},t),{columns:[...t.columns,n]}):t))};this._updateLayout(a),console.log("Column added successfully. Row now has",a.rows[e].columns.length,"columns")}_addColumnAfter(e,t){console.log("Adding column after:",e,t);const o=this._ensureLayout(),i=o.rows[e];if(!i)return;if(i.columns.length>=6)return void console.log("Cannot add more than 6 columns to a row");const n=t+1,a={id:`col-${Date.now()}`,modules:[],vertical_alignment:"center",horizontal_alignment:"center",column_name:`Column ${n+1}`},r={rows:o.rows.map(((o,i)=>{if(i===e){const e=[...o.columns];return e.splice(t+1,0,a),Object.assign(Object.assign({},o),{columns:e})}return o}))};this._updateLayout(r),console.log("Column added after successfully")}_duplicateColumn(e,t){console.log("Duplicating column:",e,t);const o=this._ensureLayout(),i=o.rows[e];if(!i||!i.columns[t])return void console.error("Row or column not found:",e,t);if(i.columns.length>=6)return void console.log("Cannot duplicate column: maximum 6 columns already reached");const n=i.columns[t],a=t+1,r=Object.assign(Object.assign({},JSON.parse(JSON.stringify(n))),{id:`col-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,column_name:`Column ${a+1}`,modules:n.modules.map(((e,t)=>Object.assign(Object.assign({},JSON.parse(JSON.stringify(e))),{id:`${e.type}-${Date.now()}-${t}-${Math.random().toString(36).substr(2,9)}`})))}),l=JSON.parse(JSON.stringify(o));l.rows[e].columns.splice(t+1,0,r),this._updateLayout(l),console.log("Column duplicated successfully. Row now has",l.rows[e].columns.length,"columns")}_deleteColumn(e,t){console.log("Deleting column:",e,t);const o=this._ensureLayout(),i=o.rows[e];if(!i)return void console.error("Row not found at index:",e);if(!i.columns[t])return void console.error("Column not found at index:",t);const n={rows:o.rows.map(((o,i)=>i===e?Object.assign(Object.assign({},o),{columns:o.columns.filter(((e,o)=>o!==t))}):o))};this._updateLayout(n),console.log("Column deleted successfully. Row now has",n.rows[e].columns.length,"columns")}_openColumnLayoutSelector(e){this._selectedRowForLayout=e,this._showColumnLayoutSelector=!0}_changeColumnLayout(e){if(-1===this._selectedRowForLayout)return;const t=this._ensureLayout(),o=t.rows[this._selectedRowForLayout];if(!o)return;const i=this.COLUMN_LAYOUTS.find((t=>t.id===e));if(!i)return;const n=i.columnCount,a=o.columns.length;console.log(`Changing layout from ${a} to ${n} columns`);const r=JSON.parse(JSON.stringify(t)),l=r.rows[this._selectedRowForLayout];if(n===a)l.column_layout=e;else if(n>a){const t=[...l.columns];for(let e=a;e<n;e++)t.push({id:`col-${Date.now()}-${e}-${Math.random().toString(36).substr(2,9)}`,modules:[],vertical_alignment:"center",horizontal_alignment:"center",column_name:`Column ${e+1}`});l.columns=t,l.column_layout=e}else{const t=[],o=[];l.columns.forEach((e=>{e.modules&&e.modules.length>0&&o.push(...e.modules)}));for(let e=0;e<n;e++)e<a?t.push(Object.assign(Object.assign({},l.columns[e]),{modules:[]})):t.push({id:`col-${Date.now()}-${e}-${Math.random().toString(36).substr(2,9)}`,modules:[],vertical_alignment:"center",horizontal_alignment:"center",column_name:`Column ${e+1}`});o.length>0&&(1===n?t[0].modules=o:o.forEach(((e,o)=>{t[o%n].modules.push(e)}))),l.columns=t,l.column_layout=e}this._updateLayout(r),console.log(`Layout changed successfully. Row now has ${n} columns`),this._showColumnLayoutSelector=!1,this._selectedRowForLayout=-1}_getCurrentLayoutDisplay(e){const t=e.columns.length,o=e.column_layout,i=this.COLUMN_LAYOUTS.find((e=>e.id===o));if(i)return this._createSimpleIcon(i.proportions);switch(t){case 1:return"█";case 2:return"█ █";case 3:return"█ █ █";case 4:return"█ █ █ █";default:return"█ ".repeat(Math.min(t,6)).trim()}}_openModuleSelector(e,t){console.log("Opening module selector for:",{rowIndex:e,columnIndex:t});const o=this._ensureLayout().rows[e];o&&o.columns&&0!==o.columns.length||(console.log("Row has no columns, automatically adding one"),this._addColumn(e),t=0),this._selectedRowIndex=e,this._selectedColumnIndex=t,this._showModuleSelector=!0}_addModule(e){if(console.log("Adding module of type:",e),-1===this._selectedRowIndex||-1===this._selectedColumnIndex)return void console.error("No row or column selected");const t=this._ensureLayout();if(!t.rows[this._selectedRowIndex])return void console.error("Selected row does not exist:",this._selectedRowIndex);const o=t.rows[this._selectedRowIndex];if(!o.columns[this._selectedColumnIndex])return void console.error("Selected column does not exist:",this._selectedColumnIndex);const i=o.columns[this._selectedColumnIndex];let n,a;switch(e){case"text":n={id:`text-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"text",text:"Sample Text",font_size:16,color:"var(--primary-text-color)"},delete n.name,delete n.title;break;case"separator":n={id:`separator-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"separator",thickness:1,color:"var(--divider-color)"},delete n.name,delete n.title,delete n.label;break;case"image":n={id:`image-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"image",image_type:"none"},delete n.name,delete n.title,delete n.label;break;case"markdown":n={id:`markdown-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"markdown",content:"This is a markdown module that supports:\n\n- Italic and bold text\n- Links\n- inline code\n- Lists and more!",markdown_content:"This is a markdown module that supports:\n\n- Italic and bold text\n- Links\n- inline code\n- Lists and more!"},delete n.name,delete n.title,delete n.label;break;case"bar":n={id:`bar-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"bar",entity:"sensor.battery_level",bar_color:"var(--primary-color)",background_color:"var(--secondary-background-color)",height:20,show_value:!0},delete n.name,delete n.title,delete n.label;break;case"button":n={id:`button-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"button",label:"Click Me",button_text:"Click Me",tap_action:{action:"more-info"}},delete n.name,delete n.title;break;case"info":n={id:`info-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"info",info_entities:[{entity:"sensor.temperature",name:"Temperature",icon:"mdi:thermometer"}]},delete n.name,delete n.title,delete n.label;break;default:try{const t=Ze().createDefaultModule(e);if(t){n=t,delete n.name,delete n.title,delete n.label;break}}catch(e){console.error("Module registry failed:",e)}n={id:`text-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"text",text:"Unknown Module Type",font_size:16,color:"var(--primary-text-color)"}}if(console.log("Created module:",n),a=this._selectedLayoutModuleIndex>=0?{rows:t.rows.map(((e,t)=>t===this._selectedRowIndex?Object.assign(Object.assign({},e),{columns:e.columns.map(((e,t)=>t===this._selectedColumnIndex?Object.assign(Object.assign({},e),{modules:e.modules.map(((e,t)=>{if(t===this._selectedLayoutModuleIndex){const t=e;return Object.assign(Object.assign({},t),{modules:[...t.modules||[],n]})}return e}))}):e))}):e))}:{rows:t.rows.map(((e,t)=>t===this._selectedRowIndex?Object.assign(Object.assign({},e),{columns:e.columns.map(((e,t)=>t===this._selectedColumnIndex?Object.assign(Object.assign({},e),{modules:[...e.modules||[],n]}):e))}):e))},this._updateLayout(a),this._showModuleSelector=!1,this._shouldAutoOpenSettings(e))if(this._selectedLayoutModuleIndex>=0);else{const e=i.modules.length;this._openModuleSettings(this._selectedRowIndex,this._selectedColumnIndex,e)}this._selectedRowIndex=-1,this._selectedColumnIndex=-1,this._selectedLayoutModuleIndex=-1,console.log("Module added successfully")}_duplicateModule(e,t,o){console.log("Duplicating module:",e,t,o);const i=this._ensureLayout(),n=i.rows[e];if(!n||!n.columns[t])return;const a=n.columns[t];if(!a.modules||!a.modules[o])return;const r=a.modules[o],l=Object.assign(Object.assign({},JSON.parse(JSON.stringify(r))),{id:`${r.type}-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}),s={rows:i.rows.map(((i,n)=>n===e?Object.assign(Object.assign({},i),{columns:i.columns.map(((e,i)=>{if(i===t){const t=[...e.modules];return t.splice(o+1,0,l),Object.assign(Object.assign({},e),{modules:t})}return e}))}):i))};this._updateLayout(s),console.log("Module duplicated successfully")}_deleteModule(e,t,o){console.log("Deleting module:",e,t,o);const i=this._ensureLayout(),n=i.rows[e];if(!n||!n.columns[t])return;const a=n.columns[t];if(!a.modules||!a.modules[o])return;const r={rows:i.rows.map(((i,n)=>n===e?Object.assign(Object.assign({},i),{columns:i.columns.map(((e,i)=>i===t?Object.assign(Object.assign({},e),{modules:e.modules.filter(((e,t)=>t!==o))}):e))}):i))};this._updateLayout(r),console.log("Module deleted successfully")}_openModuleSettings(e,t,o){this._selectedModule={rowIndex:e,columnIndex:t,moduleIndex:o},this._showModuleSettings=!0}_updateModule(e){if(console.log("🔄 LayoutTab: _updateModule called with updates:",e),!this._selectedModule)return void console.log("🔄 LayoutTab: No selected module, returning early");const t=this._ensureLayout(),{rowIndex:o,columnIndex:i,moduleIndex:n}=this._selectedModule;console.log(`🔄 LayoutTab: Updating module at row ${o}, column ${i}, module ${n}`);const a={rows:t.rows.map(((t,a)=>a===o?Object.assign(Object.assign({},t),{columns:t.columns.map(((t,o)=>o===i?Object.assign(Object.assign({},t),{modules:t.modules.map(((t,o)=>{if(o===n){console.log("🔄 LayoutTab: Original module:",t);const o=Object.assign({},t);for(const[t,i]of Object.entries(e))void 0===i?(console.log(`🔄 LayoutTab: DELETING property ${t} from module`),delete o[t]):(console.log(`🔄 LayoutTab: SETTING property ${t} =`,i),o[t]=i);return console.log("🔄 LayoutTab: Updated module:",o),o}return t}))}):t))}):t))};console.log("🔄 LayoutTab: Calling _updateLayout with new layout"),this._updateLayout(a),console.log("🔄 LayoutTab: Layout updated successfully")}_updateLayoutChildModule(e){if(console.log("🔄 LayoutTab: _updateLayoutChildModule called with updates:",e),!this._selectedLayoutChild)return void console.log("🔄 LayoutTab: No selected layout child, returning early");const{parentRowIndex:t,parentColumnIndex:o,parentModuleIndex:i,childIndex:n}=this._selectedLayoutChild,a=this._ensureLayout(),r=JSON.parse(JSON.stringify(a)),l=r.rows[t];if(!l||!l.columns[o])return;const s=l.columns[o];if(!s.modules||!s.modules[i])return;const d=s.modules[i];if(!d.modules||!d.modules[n])return;const c=d.modules[n];console.log("🔄 LayoutTab: Original child module:",c);const p=Object.assign({},c);for(const[t,o]of Object.entries(e))void 0===o?(console.log(`🔄 LayoutTab: DELETING property ${t} from child module`),delete p[t]):(console.log(`🔄 LayoutTab: SETTING child module property ${t} =`,o),p[t]=o);d.modules[n]=p,console.log("🔄 LayoutTab: Updated child module:",p),this._updateLayout(r),console.log("🔄 LayoutTab: Layout child module updated successfully")}_updateModuleDesign(e){var t,o,i,n,a,r,l,s,d,c,p,u,m,g,h,v,b,f;if(console.log("🔄 LayoutTab: _updateModuleDesign called with updates:",e),console.log("🔄 LayoutTab: _selectedModule:",this._selectedModule),!this._selectedModule)return void console.log("🔄 LayoutTab: No selected module, returning early");const y={};if(e.hasOwnProperty("color")&&(y.color=e.color),e.hasOwnProperty("text_align")&&(y.text_align=e.text_align),e.hasOwnProperty("font_size")&&(y.font_size=e.font_size?parseFloat(e.font_size):void 0),e.hasOwnProperty("line_height")&&(y.line_height=e.line_height),e.hasOwnProperty("letter_spacing")&&(y.letter_spacing=e.letter_spacing),e.hasOwnProperty("font_family")&&(y.font_family=e.font_family),e.hasOwnProperty("font_weight")&&(y.font_weight=e.font_weight),e.hasOwnProperty("text_transform")&&(y.text_transform=e.text_transform),e.hasOwnProperty("font_style")&&(y.font_style=e.font_style),e.hasOwnProperty("background_color")&&(y.background_color=e.background_color),e.hasOwnProperty("background_image")&&(y.background_image=e.background_image),e.hasOwnProperty("background_image_type")&&(y.background_image_type=e.background_image_type),e.hasOwnProperty("background_image_entity")&&(y.background_image_entity=e.background_image_entity),e.hasOwnProperty("backdrop_filter")&&(y.backdrop_filter=e.backdrop_filter),e.hasOwnProperty("width")&&(y.width=e.width),e.hasOwnProperty("height")&&(y.height=e.height),e.hasOwnProperty("max_width")&&(y.max_width=e.max_width),e.hasOwnProperty("max_height")&&(y.max_height=e.max_height),e.hasOwnProperty("min_width")&&(y.min_width=e.min_width),e.hasOwnProperty("min_height")&&(y.min_height=e.min_height),e.hasOwnProperty("position")&&(y.position=e.position),e.hasOwnProperty("top")&&(y.top=e.top),e.hasOwnProperty("bottom")&&(y.bottom=e.bottom),e.hasOwnProperty("left")&&(y.left=e.left),e.hasOwnProperty("right")&&(y.right=e.right),e.hasOwnProperty("z_index")&&(y.z_index=e.z_index),e.hasOwnProperty("text_shadow_h")&&(y.text_shadow_h=e.text_shadow_h),e.hasOwnProperty("text_shadow_v")&&(y.text_shadow_v=e.text_shadow_v),e.hasOwnProperty("text_shadow_blur")&&(y.text_shadow_blur=e.text_shadow_blur),e.hasOwnProperty("text_shadow_color")&&(y.text_shadow_color=e.text_shadow_color),e.hasOwnProperty("box_shadow_h")&&(y.box_shadow_h=e.box_shadow_h),e.hasOwnProperty("box_shadow_v")&&(y.box_shadow_v=e.box_shadow_v),e.hasOwnProperty("box_shadow_blur")&&(y.box_shadow_blur=e.box_shadow_blur),e.hasOwnProperty("box_shadow_spread")&&(y.box_shadow_spread=e.box_shadow_spread),e.hasOwnProperty("box_shadow_color")&&(y.box_shadow_color=e.box_shadow_color),e.hasOwnProperty("overflow")&&(y.overflow=e.overflow),e.hasOwnProperty("clip_path")&&(y.clip_path=e.clip_path),e.hasOwnProperty("margin_top")&&(y.margin_top=e.margin_top),e.hasOwnProperty("margin_bottom")&&(y.margin_bottom=e.margin_bottom),e.hasOwnProperty("margin_left")&&(y.margin_left=e.margin_left),e.hasOwnProperty("margin_right")&&(y.margin_right=e.margin_right),e.hasOwnProperty("padding_top")&&(y.padding_top=e.padding_top),e.hasOwnProperty("padding_bottom")&&(y.padding_bottom=e.padding_bottom),e.hasOwnProperty("padding_left")&&(y.padding_left=e.padding_left),e.hasOwnProperty("padding_right")&&(y.padding_right=e.padding_right),e.hasOwnProperty("border_radius")&&(y.border_radius=e.border_radius),e.hasOwnProperty("border_style")&&(y.border_style=e.border_style),e.hasOwnProperty("border_width")&&(y.border_width=e.border_width),e.hasOwnProperty("border_color")&&(y.border_color=e.border_color),e.hasOwnProperty("animation_type")&&(y.animation_type=e.animation_type),e.hasOwnProperty("animation_entity")&&(y.animation_entity=e.animation_entity),e.hasOwnProperty("animation_trigger_type")&&(y.animation_trigger_type=e.animation_trigger_type),e.hasOwnProperty("animation_attribute")&&(y.animation_attribute=e.animation_attribute),e.hasOwnProperty("animation_state")&&(y.animation_state=e.animation_state),e.hasOwnProperty("intro_animation")&&(y.intro_animation=e.intro_animation),e.hasOwnProperty("outro_animation")&&(y.outro_animation=e.outro_animation),e.hasOwnProperty("animation_duration")&&(y.animation_duration=e.animation_duration),e.hasOwnProperty("animation_delay")&&(y.animation_delay=e.animation_delay),e.hasOwnProperty("animation_timing")&&(y.animation_timing=e.animation_timing),e.hasOwnProperty("margin_top")||e.hasOwnProperty("margin_bottom")||e.hasOwnProperty("margin_left")||e.hasOwnProperty("margin_right")){const{rowIndex:l,columnIndex:s,moduleIndex:d}=this._selectedModule,c=null===(o=null===(t=this._ensureLayout().rows[l])||void 0===t?void 0:t.columns[s])||void 0===o?void 0:o.modules[d];if(c){const t=e.hasOwnProperty("margin_top")?e.margin_top:null===(i=c.margin)||void 0===i?void 0:i.top,o=e.hasOwnProperty("margin_bottom")?e.margin_bottom:null===(n=c.margin)||void 0===n?void 0:n.bottom,l=e.hasOwnProperty("margin_left")?e.margin_left:null===(a=c.margin)||void 0===a?void 0:a.left,s=e.hasOwnProperty("margin_right")?e.margin_right:null===(r=c.margin)||void 0===r?void 0:r.right;if(void 0===t&&void 0===o&&void 0===l&&void 0===s)y.margin=void 0;else{const e=c.margin||{};y.margin={top:void 0!==t?parseFloat(t)||0:e.top||0,bottom:void 0!==o?parseFloat(o)||0:e.bottom||0,left:void 0!==l?parseFloat(l)||0:e.left||0,right:void 0!==s?parseFloat(s)||0:e.right||0}}}}if(e.hasOwnProperty("padding_top")||e.hasOwnProperty("padding_bottom")||e.hasOwnProperty("padding_left")||e.hasOwnProperty("padding_right")){const{rowIndex:t,columnIndex:o,moduleIndex:i}=this._selectedModule,n=null===(s=null===(l=this._ensureLayout().rows[t])||void 0===l?void 0:l.columns[o])||void 0===s?void 0:s.modules[i];if(n){const t=e.hasOwnProperty("padding_top")?e.padding_top:null===(d=n.padding)||void 0===d?void 0:d.top,o=e.hasOwnProperty("padding_bottom")?e.padding_bottom:null===(c=n.padding)||void 0===c?void 0:c.bottom,i=e.hasOwnProperty("padding_left")?e.padding_left:null===(p=n.padding)||void 0===p?void 0:p.left,a=e.hasOwnProperty("padding_right")?e.padding_right:null===(u=n.padding)||void 0===u?void 0:u.right;if(void 0===t&&void 0===o&&void 0===i&&void 0===a)y.padding=void 0;else{const e=n.padding||{};y.padding={top:void 0!==t?parseFloat(t)||0:e.top||0,bottom:void 0!==o?parseFloat(o)||0:e.bottom||0,left:void 0!==i?parseFloat(i)||0:e.left||0,right:void 0!==a?parseFloat(a)||0:e.right||0}}}}if(e.hasOwnProperty("border_radius")||e.hasOwnProperty("border_style")||e.hasOwnProperty("border_width")||e.hasOwnProperty("border_color")){const{rowIndex:t,columnIndex:o,moduleIndex:i}=this._selectedModule,n=null===(g=null===(m=this._ensureLayout().rows[t])||void 0===m?void 0:m.columns[o])||void 0===g?void 0:g.modules[i];if(n){const t=e.hasOwnProperty("border_radius")?e.border_radius:null===(h=n.border)||void 0===h?void 0:h.radius,o=e.hasOwnProperty("border_style")?e.border_style:null===(v=n.border)||void 0===v?void 0:v.style,i=e.hasOwnProperty("border_width")?e.border_width:null===(b=n.border)||void 0===b?void 0:b.width,a=e.hasOwnProperty("border_color")?e.border_color:null===(f=n.border)||void 0===f?void 0:f.color;if(void 0===t&&void 0===o&&void 0===i&&void 0===a)y.border=void 0;else{const e=n.border||{};y.border={radius:void 0!==t?parseFloat(t)||0:e.radius||0,style:void 0!==o?o:e.style||"none",width:void 0!==i?i:e.width||"1px",color:void 0!==a?a:e.color||"var(--divider-color)"}}}}console.log("🔄 LayoutTab: Final moduleUpdates being applied:",y),this._updateModule(y),console.log("🔄 LayoutTab: _updateModule called successfully")}_closeModuleSettings(){this._showModuleSettings=!1,this._selectedModule=null,this.requestUpdate()}_closeLayoutChildSettings(){this._showLayoutChildSettings=!1,this._selectedLayoutChild=null,this.requestUpdate()}_onDragStart(e,t,o,i,n){var a,r,l;if(!e.dataTransfer)return;e.stopPropagation();const s=this._ensureLayout();let d;switch(t){case"module":void 0!==i&&void 0!==n&&(d=null===(r=null===(a=s.rows[o])||void 0===a?void 0:a.columns[i])||void 0===r?void 0:r.modules[n]);break;case"column":void 0!==i&&(d=null===(l=s.rows[o])||void 0===l?void 0:l.columns[i]);break;case"row":d=s.rows[o]}this._draggedItem={type:t,rowIndex:o,columnIndex:i,moduleIndex:n,data:d},e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/plain",JSON.stringify({type:t,rowIndex:o,columnIndex:i,moduleIndex:n}));const c=e.currentTarget;c&&(c.style.opacity="0.6",c.style.transform="scale(0.95)"),"column"===t?this.setAttribute("dragging-column",""):"row"===t&&this.setAttribute("dragging-row","")}_onDragEnd(e){const t=e.currentTarget;t&&(t.style.opacity="",t.style.transform=""),this.removeAttribute("dragging-column"),this.removeAttribute("dragging-row"),this._draggedItem=null,this._dropTarget=null,this.requestUpdate()}_onDragOver(e){this._draggedItem&&(e.preventDefault(),e.stopPropagation(),e.dataTransfer&&(e.dataTransfer.dropEffect="move"))}_onDragEnter(e,t,o,i,n){if(e.preventDefault(),e.stopPropagation(),!this._draggedItem)return;if(this._draggedItem.type===t&&this._draggedItem.rowIndex===o&&this._draggedItem.columnIndex===i&&this._draggedItem.moduleIndex===n)return;if(void 0!==this._draggedItem.layoutChildIndex&&"layout"===t&&this._draggedItem.rowIndex===o&&this._draggedItem.columnIndex===i&&this._draggedItem.moduleIndex===n)return;if(!this._isValidDropTarget(this._draggedItem.type,t))return;this._dropTarget={type:t,rowIndex:o,columnIndex:i,moduleIndex:n};const a=e.currentTarget;a&&(a.style.borderColor="var(--primary-color)",a.style.backgroundColor="rgba(var(--rgb-primary-color), 0.1)"),this.requestUpdate()}_onDragLeave(e){const t=e.currentTarget;t&&(t.style.borderColor="",t.style.backgroundColor=""),e.relatedTarget&&e.currentTarget&&!e.currentTarget.contains(e.relatedTarget)&&(this._dropTarget=null,this.requestUpdate())}_onDrop(e,t,o,i,n){e.preventDefault(),e.stopPropagation();const a=e.currentTarget;a&&(a.style.borderColor="",a.style.backgroundColor=""),this._draggedItem&&(this._draggedItem.type===t&&this._draggedItem.rowIndex===o&&this._draggedItem.columnIndex===i&&this._draggedItem.moduleIndex===n||this._isValidDropTarget(this._draggedItem.type,t)&&(this._performMove(this._draggedItem,{type:t,rowIndex:o,columnIndex:i,moduleIndex:n}),this._draggedItem=null,this._dropTarget=null,this.requestUpdate()))}_isValidDropTarget(e,t){var o;return(null===(o={module:["module","column","layout","layout-child"],column:["column","row"],row:["row"]}[e])||void 0===o?void 0:o.includes(t))||!1}_performMove(e,t){const o=this._ensureLayout(),i=JSON.parse(JSON.stringify(o));switch(e.type){case"module":this._moveModule(i,e,t);break;case"column":this._moveColumn(i,e,t);break;case"row":this._moveRow(i,e,t)}this._updateLayout(i)}_moveModule(e,t,o){let i;if(void 0!==t.layoutChildIndex&&"layout-child"===o.type){const i=t.rowIndex,n=t.columnIndex,a=t.moduleIndex,r=t.layoutChildIndex,l=o.rowIndex,s=o.columnIndex,d=o.moduleIndex,c=o.childIndex;if(i===l&&n===s&&a===d){if(r===c)return;const t=e.rows[i].columns[n].modules[a];if(t&&this._isLayoutModule(t.type)&&t.modules){const e=t.modules.splice(r,1)[0];let o=c;r<c&&(o=c-1),t.modules.splice(o,0,e)}return}}if(void 0!==t.layoutChildIndex){const o=e.rows[t.rowIndex].columns[t.columnIndex].modules[t.moduleIndex];i=o.modules[t.layoutChildIndex],o.modules.splice(t.layoutChildIndex,1)}else i=e.rows[t.rowIndex].columns[t.columnIndex].modules[t.moduleIndex];if("layout"!==o.type)if("layout-child"!==o.type)if(void 0===t.layoutChildIndex&&e.rows[t.rowIndex].columns[t.columnIndex].modules.splice(t.moduleIndex,1),"module"===o.type){let n=o.moduleIndex||0;t.rowIndex===o.rowIndex&&t.columnIndex===o.columnIndex&&o.moduleIndex>t.moduleIndex&&n--,e.rows[o.rowIndex].columns[o.columnIndex].modules.splice(n,0,i)}else"column"===o.type&&e.rows[o.rowIndex].columns[o.columnIndex].modules.push(i);else{const n=e.rows[o.rowIndex].columns[o.columnIndex].modules[o.moduleIndex];if(n&&this._isLayoutModule(n.type)){n.modules||(n.modules=[]);const a=o.childIndex||0;n.modules.splice(a,0,i),void 0===t.layoutChildIndex&&e.rows[t.rowIndex].columns[t.columnIndex].modules.splice(t.moduleIndex,1)}}else{const n=e.rows[o.rowIndex].columns[o.columnIndex].modules[o.moduleIndex];n&&this._isLayoutModule(n.type)&&(n.modules||(n.modules=[]),n.modules.push(i),void 0===t.layoutChildIndex&&e.rows[t.rowIndex].columns[t.columnIndex].modules.splice(t.moduleIndex,1))}}_moveColumn(e,t,o){const i=e.rows[t.rowIndex].columns[t.columnIndex];e.rows[t.rowIndex].columns.splice(t.columnIndex,1),"column"===o.type?e.rows[o.rowIndex].columns.splice(o.columnIndex||0,0,i):"row"===o.type&&e.rows[o.rowIndex].columns.push(i)}_moveRow(e,t,o){const i=e.rows[t.rowIndex];e.rows.splice(t.rowIndex,1);const n=o.rowIndex;e.rows.splice(n,0,i)}_openRowSettings(e){this._selectedRowForSettings=e,this._showRowSettings=!0}_updateRow(e){if(console.log("🔄 LayoutTab: _updateRow called with updates:",e),-1===this._selectedRowForSettings)return void console.log("🔄 LayoutTab: No selected row for settings, returning early");const t=this._ensureLayout(),o=JSON.parse(JSON.stringify(t)),i=o.rows[this._selectedRowForSettings];console.log("🔄 LayoutTab: Original row:",i);for(const[t,o]of Object.entries(e))void 0===o?(console.log(`🔄 LayoutTab: DELETING property ${t} from row`),delete i[t]):(console.log(`🔄 LayoutTab: SETTING row property ${t} =`,o),i[t]=o);console.log("🔄 LayoutTab: Updated row:",i),this._updateLayout(o),console.log("🔄 LayoutTab: Row updated successfully")}_openColumnSettings(e,t){this._selectedColumnForSettings={rowIndex:e,columnIndex:t},this._showColumnSettings=!0}_updateColumn(e){if(console.log("🔄 LayoutTab: _updateColumn called with updates:",e),!this._selectedColumnForSettings)return void console.log("🔄 LayoutTab: No selected column for settings, returning early");const t=this._ensureLayout(),o=JSON.parse(JSON.stringify(t)),i=o.rows[this._selectedColumnForSettings.rowIndex].columns[this._selectedColumnForSettings.columnIndex];console.log("🔄 LayoutTab: Original column:",i);for(const[t,o]of Object.entries(e))void 0===o?(console.log(`🔄 LayoutTab: DELETING property ${t} from column`),delete i[t]):(console.log(`🔄 LayoutTab: SETTING column property ${t} =`,o),i[t]=o);console.log("🔄 LayoutTab: Updated column:",i),this._updateLayout(o),console.log("🔄 LayoutTab: Column updated successfully")}_loadGoogleFont(e){if(!e||"default"===e||gt.some((t=>t.value===e)))return;if(document.querySelector(`link[href*="${e.replace(/\s+/g,"+")}"]`))return;const t=document.createElement("link");t.rel="stylesheet",t.href=`https://fonts.googleapis.com/css2?family=${e.replace(/\s+/g,"+")}:wght@300;400;500;600;700&display=swap`,document.head.appendChild(t)}_renderModulePreview(){var e,t,o;if(!this._selectedModule)return V``;const{rowIndex:i,columnIndex:n,moduleIndex:a}=this._selectedModule,r=null===(o=null===(t=null===(e=this.config.layout)||void 0===e?void 0:e.rows[i])||void 0===t?void 0:t.columns[n])||void 0===o?void 0:o.modules[a];return r?V`
      <div class="module-preview">
        <div class="preview-header">Live Preview</div>
        <div class="preview-content">${this._renderSingleModuleWithAnimation(r)}</div>
      </div>
    `:V``}_renderSingleModule(e,t,o,i){return this._renderSimplifiedModule(e,t,o,i)}_renderSimplifiedModule(e,t,o,i){const n=Ze().getModule(e.type),a=(null==n?void 0:n.metadata)||{icon:"mdi:help-circle",title:"Unknown",description:"Unknown module type"};if("horizontal"===e.type||"vertical"===e.type)return this._renderLayoutModuleAsColumn(e,t,o,i,a);const r=this._generateModuleInfo(e),l=this._getModuleDisplayName(e);return V`
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
          ${void 0!==t&&void 0!==o&&void 0!==i?V`
                <div class="simplified-module-actions">
                  <button
                    class="simplified-action-btn edit-btn"
                    @click=${e=>{e.stopPropagation(),this._openModuleSettings(t,o,i)}}
                    @mousedown=${e=>e.stopPropagation()}
                    @dragstart=${e=>e.preventDefault()}
                    title="Edit Module"
                  >
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </button>
                  <button
                    class="simplified-action-btn duplicate-btn"
                    @click=${e=>{e.stopPropagation(),this._duplicateModule(t,o,i)}}
                    @mousedown=${e=>e.stopPropagation()}
                    @dragstart=${e=>e.preventDefault()}
                    title="Duplicate Module"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </button>
                  <button
                    class="simplified-action-btn delete-btn"
                    @click=${e=>{e.stopPropagation(),this._deleteModule(t,o,i)}}
                    @mousedown=${e=>e.stopPropagation()}
                    @dragstart=${e=>e.preventDefault()}
                    title="Delete Module"
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                </div>
              `:""}
        </div>
      </div>
    `}_renderLayoutModuleAsColumn(e,t,o,i,n){const a=e,r=a.modules&&a.modules.length>0,l="horizontal"===e.type;return e.type,V`
      <div class="layout-module-container">
        <div class="layout-module-header">
          <div class="layout-module-title">
            <div class="layout-module-drag-handle" title="Drag to move layout module">
              <ha-icon icon="mdi:drag"></ha-icon>
            </div>
            <ha-icon icon="${(null==n?void 0:n.icon)||"mdi:view-sequential"}"></ha-icon>
            <span>${l?"Horizontal Layout":"Vertical Layout"}</span>
          </div>
          <div class="layout-module-actions">
            ${void 0!==t&&void 0!==o&&void 0!==i?V`
                  <button
                    class="layout-module-add-btn"
                    @click=${e=>{e.stopPropagation(),this._openLayoutModuleSelector(t,o,i)}}
                    @mousedown=${e=>e.stopPropagation()}
                    @dragstart=${e=>e.preventDefault()}
                    title="Add Module to Layout"
                  >
                    <ha-icon icon="mdi:plus"></ha-icon>
                  </button>
                  <button
                    class="layout-module-settings-btn"
                    @click=${e=>{e.stopPropagation(),this._openModuleSettings(t,o,i)}}
                    @mousedown=${e=>e.stopPropagation()}
                    @dragstart=${e=>e.preventDefault()}
                    title="Layout Settings"
                  >
                    <ha-icon icon="mdi:cog"></ha-icon>
                  </button>
                  <button
                    class="layout-module-duplicate-btn"
                    @click=${e=>{e.stopPropagation(),this._duplicateModule(t,o,i)}}
                    @mousedown=${e=>e.stopPropagation()}
                    @dragstart=${e=>e.preventDefault()}
                    title="Duplicate Layout"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </button>
                  <button
                    class="layout-module-delete-btn"
                    @click=${e=>{e.stopPropagation(),this._deleteModule(t,o,i)}}
                    @mousedown=${e=>e.stopPropagation()}
                    @dragstart=${e=>e.preventDefault()}
                    title="Delete Layout"
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                `:""}
          </div>
        </div>
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
          @dragenter=${e=>this._onDragEnter(e,"layout",t,o,i)}
          @dragleave=${this._onDragLeave}
          @drop=${e=>this._onDrop(e,"layout",t,o,i)}
        >
          ${r?a.modules.map(((e,n)=>{var a,r,l,s,d;return V`
                  <div
                    class="layout-child-module-wrapper"
                    draggable="true"
                    @dragstart=${e=>this._onLayoutChildDragStart(e,t,o,i,n)}
                    @dragend=${e=>this._onLayoutChildDragEnd(e)}
                    @dragover=${this._onDragOver}
                    @dragenter=${e=>this._onLayoutChildDragEnter(e,t,o,i,n)}
                    @dragleave=${this._onDragLeave}
                    @drop=${e=>this._onLayoutChildDrop(e,t,o,i,n)}
                    class="${"layout-child"===(null===(a=this._dropTarget)||void 0===a?void 0:a.type)&&(null===(r=this._dropTarget)||void 0===r?void 0:r.rowIndex)===t&&(null===(l=this._dropTarget)||void 0===l?void 0:l.columnIndex)===o&&(null===(s=this._dropTarget)||void 0===s?void 0:s.moduleIndex)===i&&(null===(d=this._dropTarget)||void 0===d?void 0:d.childIndex)===n?"drop-target":""}"
                    style="width: 100%; max-width: 100%; box-sizing: border-box; overflow: hidden;"
                  >
                    ${this._renderLayoutChildModule(e,t,o,i,n)}
                  </div>
                `})):V`
                <div class="layout-module-empty">
                  <ha-icon icon="mdi:plus-circle"></ha-icon>
                  <span>Drop modules here</span>
                </div>
              `}
          ${r?V`
                <div
                  class="layout-append-zone"
                  @dragover=${this._onDragOver}
                  @dragenter=${e=>this._onLayoutAppendDragEnter(e,t,o,i)}
                  @dragleave=${this._onDragLeave}
                  @drop=${e=>this._onLayoutAppendDrop(e,t,o,i)}
                  style="
                    min-height: 20px;
                    margin-top: 8px;
                    border: 2px dashed transparent;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--secondary-text-color);
                    font-size: 12px;
                    transition: all 0.2s ease;
                  "
                >
                  Drop here to add to end
                </div>
              `:""}
        </div>
      </div>
    `}_getJustifyContent(e){switch(e){case"left":default:return"flex-start";case"center":return"center";case"right":return"flex-end";case"justify":return"space-between"}}_renderLayoutChildModule(e,t,o,i,n){const a=Ze().getModule(e.type),r=(null==a?void 0:a.metadata)||{icon:"mdi:help-circle",title:"Unknown",description:"Unknown module type"},l=this._generateModuleInfo(e),s=this._getModuleDisplayName(e);return V`
      <div
        class="layout-child-simplified-module"
        @click=${e=>{const a=e.target;a.closest(".layout-child-actions")||a.closest(".layout-child-drag-handle")||(e.stopPropagation(),void 0!==t&&void 0!==o&&void 0!==i&&void 0!==n&&this._openLayoutChildSettings(t,o,i,n))}}
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
          ${void 0!==t&&void 0!==o&&void 0!==i&&void 0!==n?V`
                <div class="layout-child-actions">
                  <button
                    class="layout-child-action-btn edit-btn"
                    @click=${e=>{e.stopPropagation(),this._openLayoutChildSettings(t,o,i,n)}}
                    @mousedown=${e=>e.stopPropagation()}
                    @dragstart=${e=>e.preventDefault()}
                    title="Edit Child Module"
                  >
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </button>
                  <button
                    class="layout-child-action-btn duplicate-btn"
                    @click=${e=>{e.stopPropagation(),this._duplicateLayoutChildModule(t,o,i,n)}}
                    @mousedown=${e=>e.stopPropagation()}
                    @dragstart=${e=>e.preventDefault()}
                    title="Duplicate Child Module"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </button>
                  <button
                    class="layout-child-action-btn delete-btn"
                    @click=${e=>{e.stopPropagation(),this._deleteLayoutChildModule(t,o,i,n)}}
                    @mousedown=${e=>e.stopPropagation()}
                    @dragstart=${e=>e.preventDefault()}
                    title="Delete Child Module"
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                </div>
              `:""}
        </div>
      </div>
    `}_onLayoutModuleDragOver(e,t,o,i){e.preventDefault(),e.stopPropagation(),e.dataTransfer&&(e.dataTransfer.dropEffect="move")}_onLayoutModuleDragEnter(e,t,o,i){e.preventDefault(),e.stopPropagation(),this._draggedItem&&"module"===this._draggedItem.type&&(this._draggedItem.rowIndex===t&&this._draggedItem.columnIndex===o&&this._draggedItem.moduleIndex===i||e.currentTarget.classList.add("layout-drop-target"))}_onLayoutModuleDragLeave(e){e.preventDefault(),e.stopPropagation()}_onLayoutModuleDrop(e,t,o,i){if(e.preventDefault(),e.stopPropagation(),e.currentTarget.classList.remove("layout-drop-target"),!this._draggedItem||"module"!==this._draggedItem.type)return void console.log("Invalid drop - not a module or no dragged item");if(void 0===t||void 0===o||void 0===i)return void console.log("Invalid drop - missing coordinates");const n=this._ensureLayout(),a=n.rows[t];if(!a||!a.columns[o])return void console.log("Invalid drop - target row/column not found");const r=a.columns[o].modules[i];if(!r||!this._isLayoutModule(r.type))return void console.log("Invalid drop - target is not a layout module");r.modules||(r.modules=[]);const l=JSON.parse(JSON.stringify(this._draggedItem.data));if(void 0!==this._draggedItem.layoutChildIndex&&this._draggedItem.rowIndex===t&&this._draggedItem.columnIndex===o&&this._draggedItem.moduleIndex===i)return void console.log("Ignoring layout drop - this should be handled by child reordering");r.modules.push(l);const s=n.rows[this._draggedItem.rowIndex];s&&s.columns[this._draggedItem.columnIndex]&&s.columns[this._draggedItem.columnIndex].modules.splice(this._draggedItem.moduleIndex,1),this._updateLayout(n),console.log("Module successfully moved to layout module"),this._draggedItem=null,this._dropTarget=null}_onLayoutChildDragStart(e,t,o,i,n){var a,r,l;if(!e.dataTransfer)return;e.stopPropagation();const s=null===(r=null===(a=this._ensureLayout().rows[t])||void 0===a?void 0:a.columns[o])||void 0===r?void 0:r.modules[i],d=null===(l=null==s?void 0:s.modules)||void 0===l?void 0:l[n];if(d){this._draggedItem={type:"module",rowIndex:t,columnIndex:o,moduleIndex:i,data:d,layoutChildIndex:n},e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/plain",JSON.stringify({type:"layout-child",parentRowIndex:t,parentColumnIndex:o,parentModuleIndex:i,childIndex:n}));const a=e.currentTarget;a&&(a.style.opacity="0.6",a.style.transform="scale(0.95)")}}_onLayoutChildDragEnd(e){e.preventDefault(),e.stopPropagation();const t=e.currentTarget;t&&(t.style.opacity="",t.style.transform=""),this._draggedItem=null,this._dropTarget=null,this.requestUpdate()}_onLayoutChildDragEnter(e,t,o,i,n){e.preventDefault(),e.stopPropagation(),this._draggedItem&&"module"===this._draggedItem.type&&(void 0!==this._draggedItem.layoutChildIndex&&this._draggedItem.rowIndex===t&&this._draggedItem.columnIndex===o&&this._draggedItem.moduleIndex===i&&this._draggedItem.layoutChildIndex===n||(this._dropTarget={type:"layout-child",rowIndex:t,columnIndex:o,moduleIndex:i,childIndex:n},this.requestUpdate()))}_onLayoutChildDrop(e,t,o,i,n){if(e.preventDefault(),e.stopPropagation(),!this._draggedItem||"module"!==this._draggedItem.type)return void console.log("Invalid drop - not a module or no dragged item");if(void 0===t||void 0===o||void 0===i||void 0===n)return void console.log("Invalid drop - missing coordinates");const a=this._ensureLayout(),r=JSON.parse(JSON.stringify(a)),l=r.rows[t].columns[o].modules[i];if(l&&this._isLayoutModule(l.type)){if(l.modules||(l.modules=[]),void 0!==this._draggedItem.layoutChildIndex){const e=this._draggedItem.rowIndex,a=this._draggedItem.columnIndex,s=this._draggedItem.moduleIndex,d=this._draggedItem.layoutChildIndex;if(e===t&&a===o&&s===i){if(d===n)return;const e=l.modules.splice(d,1)[0];let t=n;d<n&&(t=n-1),l.modules.splice(t,0,e),this._updateLayout(r),console.log("Layout child module reordered successfully")}else{const t=r.rows[e].columns[a].modules[s];if(t&&this._isLayoutModule(t.type)&&t.modules){const e=t.modules.splice(d,1)[0];l.modules.splice(n,0,e),this._updateLayout(r),console.log("Module moved from one layout to another successfully")}}}else{const e=JSON.parse(JSON.stringify(this._draggedItem.data));l.modules.splice(n,0,e);const t=r.rows[this._draggedItem.rowIndex];t&&t.columns[this._draggedItem.columnIndex]&&t.columns[this._draggedItem.columnIndex].modules.splice(this._draggedItem.moduleIndex,1),this._updateLayout(r),console.log("Module moved from column to layout position successfully")}this._draggedItem=null,this._dropTarget=null,this.requestUpdate()}else console.log("Invalid drop - target is not a layout module")}_onLayoutAppendDragEnter(e,t,o,i){if(e.preventDefault(),e.stopPropagation(),!this._draggedItem||"module"!==this._draggedItem.type)return;this._dropTarget={type:"layout-append",rowIndex:t,columnIndex:o,moduleIndex:i};const n=e.currentTarget;n.style.borderColor="var(--primary-color)",n.style.backgroundColor="rgba(var(--rgb-primary-color), 0.1)",this.requestUpdate()}_onLayoutAppendDrop(e,t,o,i){e.preventDefault(),e.stopPropagation();const n=e.currentTarget;if(n.style.borderColor="transparent",n.style.backgroundColor="transparent",!this._draggedItem||"module"!==this._draggedItem.type)return void console.log("Invalid drop - not a module or no dragged item");if(void 0===t||void 0===o||void 0===i)return void console.log("Invalid drop - missing coordinates");const a=this._ensureLayout(),r=JSON.parse(JSON.stringify(a)),l=r.rows[t].columns[o].modules[i];if(l&&this._isLayoutModule(l.type))if(l.modules||(l.modules=[]),void 0!==this._draggedItem.layoutChildIndex&&this._draggedItem.rowIndex===t&&this._draggedItem.columnIndex===o&&this._draggedItem.moduleIndex===i){const e=this._draggedItem.layoutChildIndex,t=l.modules.splice(e,1)[0];l.modules.push(t),this._updateLayout(r),console.log("Layout child module moved to end successfully")}else{const e=JSON.parse(JSON.stringify(this._draggedItem.data));if(l.modules.push(e),void 0===this._draggedItem.layoutChildIndex){const e=r.rows[this._draggedItem.rowIndex];e&&e.columns[this._draggedItem.columnIndex]&&e.columns[this._draggedItem.columnIndex].modules.splice(this._draggedItem.moduleIndex,1)}this._updateLayout(r),console.log("Module successfully moved to end of layout module")}this._draggedItem=null,this._dropTarget=null,this.requestUpdate()}_openLayoutModuleSelector(e,t,o){console.log("Opening layout module selector for:",e,t,o),this._selectedRowIndex=e,this._selectedColumnIndex=t,this._selectedLayoutModuleIndex=o,this._showModuleSelector=!0}_openLayoutChildSettings(e,t,o,i){console.log("Opening layout child settings:",e,t,o,i),this._selectedLayoutChild={parentRowIndex:e,parentColumnIndex:t,parentModuleIndex:o,childIndex:i},this._showLayoutChildSettings=!0}_duplicateLayoutChildModule(e,t,o,i){console.log("Duplicating layout child module:",e,t,o,i);const n=this._ensureLayout(),a=n.rows[e];if(!a||!a.columns[t])return;const r=a.columns[t];if(!r.modules||!r.modules[o])return;const l=r.modules[o];if(!l.modules||!l.modules[i])return;const s=l.modules[i],d=JSON.parse(JSON.stringify(s)),c={rows:n.rows.map(((n,a)=>a===e?Object.assign(Object.assign({},n),{columns:n.columns.map(((e,n)=>n===t?Object.assign(Object.assign({},e),{modules:e.modules.map(((e,t)=>{if(t===o){const t=e,o=[...t.modules];return o.splice(i+1,0,d),Object.assign(Object.assign({},t),{modules:o})}return e}))}):e))}):n))};this._updateLayout(c),console.log("Layout child module duplicated successfully")}_deleteLayoutChildModule(e,t,o,i){console.log("Deleting layout child module:",e,t,o,i);const n=this._ensureLayout(),a=n.rows[e];if(!a||!a.columns[t])return;const r=a.columns[t];if(!r.modules||!r.modules[o])return;const l=r.modules[o];if(!l.modules||!l.modules[i])return;const s={rows:n.rows.map(((n,a)=>a===e?Object.assign(Object.assign({},n),{columns:n.columns.map(((e,n)=>n===t?Object.assign(Object.assign({},e),{modules:e.modules.map(((e,t)=>{if(t===o){const t=e;return Object.assign(Object.assign({},t),{modules:t.modules.filter(((e,t)=>t!==i))})}return e}))}):e))}):n))};this._updateLayout(s),console.log("Layout child module deleted successfully")}_getModuleDisplayName(e){const t=e;if(t.module_name&&t.module_name.trim())return t.module_name;switch(e.type){case"text":return"Text Module";case"image":return"Image Module";case"icon":return"Icon Module";case"bar":return"Bar Module";case"info":return"Info Module";case"button":return"Button Module";case"separator":return"Separator Module";case"markdown":return"Markdown Module";default:return e.type.charAt(0).toUpperCase()+e.type.slice(1)+" Module"}}_getRowDisplayName(e,t){const o=e.row_name;return o&&o.trim()?o:`Row ${t+1}`}_getColumnDisplayName(e,t){const o=e.column_name;return o&&o.trim()?o:`Column ${t+1}`}_generateModuleInfo(e){var t,o,i,n;const a=e;switch(e.type){case"text":return a.text&&a.text.trim()?a.text.length>50?`${a.text.substring(0,50)}...`:a.text:"No text configured";case"image":if(a.image_entity)return`Entity: ${a.image_entity}`;if(a.image_url){const e=a.image_url;if(e.startsWith("data:image/"))return"Uploaded image";const t=e.split("/").pop()||e;return t.length>30?`${t.substring(0,30)}...`:t}if(a.image_path){const e=a.image_path,t=e.split("/").pop()||e;return t.length>30?`${t.substring(0,30)}...`:t}return"No image configured";case"icon":const r=(null===(t=a.icons)||void 0===t?void 0:t.length)||0;if(r>1)return`${r} icons configured`;if(1===r){const e=a.icons[0];return(null==e?void 0:e.entity)?`Entity: ${e.entity}`:(null==e?void 0:e.icon)?`Icon: ${e.icon}`:"Icon configured"}return"No icons configured";case"bar":return a.entity?`Entity: ${a.entity}`:"Entity: sensor.battery_level";case"info":if(null===(o=a.info_entities)||void 0===o?void 0:o.length){const e=a.info_entities[0];if(null==e?void 0:e.entity)return a.info_entities.length>1?`${e.entity} + ${a.info_entities.length-1} more`:`Entity: ${e.entity}`}return a.entity?`Entity: ${a.entity}`:(null===(i=a.entities)||void 0===i?void 0:i.length)?`${a.entities.length} entities configured`:"No entity configured";case"button":return a.button_text&&a.button_text.trim()?a.button_text:a.text&&a.text.trim()?a.text:a.label&&a.label.trim()?a.label:"No button text configured";case"markdown":const l=a.content||a.markdown_content;if(l&&l.trim()){const e=l.replace(/[#*`>\-\[\]]/g,"").trim().split(" ").slice(0,8).join(" ");return e.length>40?`${e.substring(0,40)}...`:e}return"This is a markdown module that supports italic and bold text...";case"separator":const s=[];return a.separator_style&&s.push(`Style: ${a.separator_style}`),a.thickness&&s.push(`${a.thickness}px thick`),a.width_percent&&100!==a.width_percent&&s.push(`${a.width_percent}% width`),s.length>0?s.join(" • "):"Visual separator";default:return a.entity?`Entity: ${a.entity}`:(null===(n=a.entities)||void 0===n?void 0:n.length)?`${a.entities.length} entities`:void 0!==a.value?`Value: ${a.value}`:a.text?`Text: ${a.text.length>20?a.text.substring(0,20)+"...":a.text}`:`${e.type.charAt(0).toUpperCase()}${e.type.slice(1)} module`}}_renderSingleModuleWithAnimation(e){var t,o,i,n;tt.setHass(this.hass);const a=tt.evaluateDisplayConditions(e.display_conditions||[],e.display_mode||"always"),r=e,l=tt.evaluateLogicProperties({logic_entity:null===(t=r.design)||void 0===t?void 0:t.logic_entity,logic_attribute:null===(o=r.design)||void 0===o?void 0:o.logic_attribute,logic_operator:null===(i=r.design)||void 0===i?void 0:i.logic_operator,logic_value:null===(n=r.design)||void 0===n?void 0:n.logic_value}),s=Ze().getModule(e.type),d=!a||!l;let c;c=s?s.renderPreview(e,this.hass):V`
        <div class="module-placeholder">
          <ha-icon icon="mdi:help-circle"></ha-icon>
          <span>Unknown Module: ${e.type}</span>
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
    `}_getPreviewAnimationData(e){var t,o,i,n,a,r;const l=e.animation_type||(null===(t=e.design)||void 0===t?void 0:t.animation_type);if(!l||"none"===l)return{class:"",duration:"2s"};const s=e.animation_duration||(null===(o=e.design)||void 0===o?void 0:o.animation_duration)||"2s",d=e.animation_entity||(null===(i=e.design)||void 0===i?void 0:i.animation_entity),c=e.animation_trigger_type||(null===(n=e.design)||void 0===n?void 0:n.animation_trigger_type)||"state",p=e.animation_attribute||(null===(a=e.design)||void 0===a?void 0:a.animation_attribute),u=e.animation_state||(null===(r=e.design)||void 0===r?void 0:r.animation_state);if(!d)return{class:`animation-${l}`,duration:s};if(u&&this.hass){const e=this.hass.states[d];if(e){let t=!1;if("attribute"===c&&p){const o=e.attributes[p];t=String(o)===u}else t=e.state===u;if(t)return{class:`animation-${l}`,duration:s}}}return{class:"",duration:s}}_getRowPreviewAnimationData(e){const t=e.design||{},o=t.animation_type;if(!o||"none"===o)return{class:"",duration:"2s"};const i=t.animation_duration||"2s",n=t.animation_entity,a=t.animation_trigger_type||"state",r=t.animation_attribute,l=t.animation_state;if(!n)return{class:`animation-${o}`,duration:i};if(l&&this.hass){const e=this.hass.states[n];if(e){let t=!1;if("attribute"===a&&r){const o=e.attributes[r];t=String(o)===l}else t=e.state===l;if(t)return{class:`animation-${o}`,duration:i}}}return{class:"",duration:i}}_getColumnPreviewAnimationData(e){const t=e.design||{},o=t.animation_type;if(!o||"none"===o)return{class:"",duration:"2s"};const i=t.animation_duration||"2s",n=t.animation_entity,a=t.animation_trigger_type||"state",r=t.animation_attribute,l=t.animation_state;if(!n)return{class:`animation-${o}`,duration:i};if(l&&this.hass){const e=this.hass.states[n];if(e){let t=!1;if("attribute"===a&&r){const o=e.attributes[r];t=String(o)===l}else t=e.state===l;if(t)return{class:`animation-${o}`,duration:i}}}return{class:"",duration:i}}_renderRowPreview(e){const t=this._getRowPreviewAnimationData(e),o=V`
      <div
        class="row-preview-content"
        style="background: ${e.background_color||"var(--ha-card-background, var(--card-background-color, #fff))"};gap: ${e.gap||16}px;"
      >
        ${e.columns.map(((e,t)=>V`<div class="column-preview">Column ${t+1}</div>`))}
      </div>
    `;return V`
      <div class="module-preview">
        <div class="preview-header">Live Preview</div>
        <div class="preview-content">
          ${t.class?V`
                <div
                  class="${t.class}"
                  style="display: inherit; width: inherit; height: inherit; flex: inherit; animation-duration: ${t.duration};"
                >
                  ${o}
                </div>
              `:o}
        </div>
      </div>
    `}_renderColumnPreview(e){var t;const o=this._getColumnPreviewAnimationData(e),i=V`
      <div class="column-preview-content">
        <p>Column Preview</p>
        <div class="module-count">${(null===(t=e.modules)||void 0===t?void 0:t.length)||0} modules</div>
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
    `}_renderModuleSettings(){var e,t,o;if(!this._selectedModule)return V``;const{rowIndex:i,columnIndex:n,moduleIndex:a}=this._selectedModule,r=null===(o=null===(t=null===(e=this.config.layout)||void 0===e?void 0:e.rows[i])||void 0===t?void 0:t.columns[n])||void 0===o?void 0:o.modules[a];if(!r)return V``;const l=Ze().getModule(r.type),s=l&&"function"==typeof l.renderActionsTab,d=l&&"function"==typeof l.renderOtherTab;return("actions"===this._activeModuleTab&&!s||"other"===this._activeModuleTab&&!d)&&(this._activeModuleTab="general"),V`
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
    `}_renderLayoutChildSettings(){if(!this._selectedLayoutChild)return V``;const{parentRowIndex:e,parentColumnIndex:t,parentModuleIndex:o,childIndex:i}=this._selectedLayoutChild,n=this._ensureLayout().rows[e];if(!n||!n.columns[t])return V``;const a=n.columns[t];if(!a.modules||!a.modules[o])return V``;const r=a.modules[o];if(!r.modules||!r.modules[i])return V``;const l=r.modules[i],s=Ze().getModule(l.type),d=s&&"function"==typeof s.renderActionsTab,c=s&&"function"==typeof s.renderOtherTab;return("actions"===this._activeModuleTab&&!d||"other"===this._activeModuleTab&&!c)&&(this._activeModuleTab="general"),V`
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
    `}_renderLayoutChildGeneralTab(e){const t=Ze().getModule(e.type),o=V`
      <div class="settings-section">
        <label>Module Name:</label>
        <input
          type="text"
          .value=${e.module_name||""}
          @input=${e=>this._updateLayoutChildModule({module_name:e.target.value})}
          placeholder="Give this module a custom name to make it easier to identify in the editor."
          class="module-name-input"
        />
        <div class="field-help">
          Give this module a custom name to make it easier to identify in the editor.
        </div>
      </div>
    `;if(t){const i=t.renderGeneralTab(e,this.hass,this.config,(e=>this._updateLayoutChildModule(e)));return V` ${o} ${i} `}return V`
      ${o}
      <div class="settings-section">
        <div class="error-message">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <span>No settings available for module type: ${e.type}</span>
        </div>
      </div>
    `}_renderLayoutChildActionsTab(e){const t=Ze().getModule(e.type);return t&&"function"==typeof t.renderActionsTab?t.renderActionsTab(e,this.hass,this.config,(e=>this._updateLayoutChildModule(e))):V`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>This module does not have action settings</span>
        </div>
      </div>
    `}_renderLayoutChildOtherTab(e){const t=Ze().getModule(e.type);return t&&"function"==typeof t.renderOtherTab?t.renderOtherTab(e,this.hass,this.config,(e=>this._updateLayoutChildModule(e))):V`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>This module does not have other settings</span>
        </div>
      </div>
    `}_renderLayoutChildLogicTab(e){const t=this._selectedModule;this._selectedModule={rowIndex:0,columnIndex:0,moduleIndex:0};const o=this._updateModule.bind(this);this._updateModule=e=>{this._updateLayoutChildModule(e)};const i=this._renderLogicTab(e);return this._selectedModule=t,this._updateModule=o,i}_renderLayoutChildDesignTab(e){const t=this._updateModule.bind(this),o=this._updateModuleDesign.bind(this);this._updateModule=e=>{this._updateLayoutChildModule(e)},this._updateModuleDesign=e=>{this._updateLayoutChildModule({design:e})};const i=this._renderDesignTab(e);return this._updateModule=t,this._updateModuleDesign=o,i}_renderRowSettings(){var e;if(-1===this._selectedRowForSettings)return V``;const t=null===(e=this.config.layout)||void 0===e?void 0:e.rows[this._selectedRowForSettings];return t?V`
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

          ${this._renderRowPreview(t)}

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
            ${"general"===this._activeRowTab?this._renderRowGeneralTab(t):""}
            ${"logic"===this._activeRowTab?this._renderRowLogicTab(t):""}
            ${"design"===this._activeRowTab?this._renderRowDesignTab(t):""}
          </div>
        </div>
      </div>
    `:V``}_renderColumnSettings(){var e,t;if(!this._selectedColumnForSettings)return V``;const{rowIndex:o,columnIndex:i}=this._selectedColumnForSettings,n=null===(t=null===(e=this.config.layout)||void 0===e?void 0:e.rows[o])||void 0===t?void 0:t.columns[i];return n?V`
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
    `:V``}_renderRowGeneralTab(e){return V`
      <div class="settings-section">
        <label>Row Name:</label>
        <input
          type="text"
          .value=${e.row_name||""}
          @input=${e=>this._updateRow({row_name:e.target.value})}
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
          .value=${e.background_color||""}
          .defaultValue=${"var(--ha-card-background, var(--card-background-color, #fff))"}
          .hass=${this.hass}
          @value-changed=${e=>{const t=e.detail.value;this._updateRow({background_color:t})}}
        ></ultra-color-picker>
      </div>
      <div class="settings-section">
        <label>Column Gap (px):</label>
        <input
          type="number"
          min="0"
          max="50"
          .value=${e.gap||16}
          @change=${e=>this._updateRow({gap:Number(e.target.value)})}
        />
      </div>
    `}_renderRowLogicTab(e){const t=e.display_conditions||[],o=e.display_mode||"always",i=e.template_mode||!1;return V`
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
                    @change=${e=>{const t=e.target.value;this._updateRow({display_mode:t})}}
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
                          @click=${()=>this._addRowCondition(e)}
                        >
                          <ha-icon icon="mdi:plus"></ha-icon>
                          Add Condition
                        </button>
                      </div>

                      <div class="conditions-list">
                        ${t.map(((t,o)=>this._renderRowCondition(e,t,o)))}
                      </div>

                      ${0===t.length?V`
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
                @change=${e=>{const t=e.target.checked;this._updateRow({template_mode:t,display_mode:t?"always":o})}}
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
                    .value=${e.template||""}
                    @input=${e=>this._updateRow({template:e.target.value})}
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
    `}_renderRowDesignTab(e){var t,o,i,n,a,r,l,s,d,c,p,u,m,g,h,v,b,f,y,_,x,w,$,k,C,S,I,z,T,P,A,L;const O=Object.assign(Object.assign({},e.design),{background_color:(null===(t=e.design)||void 0===t?void 0:t.background_color)||e.background_color,padding_top:(null===(o=e.design)||void 0===o?void 0:o.padding_top)||(null===(i=e.padding)||void 0===i?void 0:i.toString()),padding_bottom:(null===(n=e.design)||void 0===n?void 0:n.padding_bottom)||(null===(a=e.padding)||void 0===a?void 0:a.toString()),padding_left:(null===(r=e.design)||void 0===r?void 0:r.padding_left)||(null===(l=e.padding)||void 0===l?void 0:l.toString()),padding_right:(null===(s=e.design)||void 0===s?void 0:s.padding_right)||(null===(d=e.padding)||void 0===d?void 0:d.toString()),border_radius:(null===(c=e.design)||void 0===c?void 0:c.border_radius)||(null===(p=e.border_radius)||void 0===p?void 0:p.toString()),border_color:(null===(u=e.design)||void 0===u?void 0:u.border_color)||e.border_color,border_width:(null===(m=e.design)||void 0===m?void 0:m.border_width)||(null===(g=e.border_width)||void 0===g?void 0:g.toString()),margin_top:(null===(h=e.design)||void 0===h?void 0:h.margin_top)||(null===(v=e.margin)||void 0===v?void 0:v.toString()),margin_bottom:(null===(b=e.design)||void 0===b?void 0:b.margin_bottom)||(null===(f=e.margin)||void 0===f?void 0:f.toString()),margin_left:(null===(y=e.design)||void 0===y?void 0:y.margin_left)||(null===(_=e.margin)||void 0===_?void 0:_.toString()),margin_right:(null===(x=e.design)||void 0===x?void 0:x.margin_right)||(null===(w=e.margin)||void 0===w?void 0:w.toString()),animation_type:null===($=e.design)||void 0===$?void 0:$.animation_type,animation_entity:null===(k=e.design)||void 0===k?void 0:k.animation_entity,animation_trigger_type:null===(C=e.design)||void 0===C?void 0:C.animation_trigger_type,animation_attribute:null===(S=e.design)||void 0===S?void 0:S.animation_attribute,animation_state:null===(I=e.design)||void 0===I?void 0:I.animation_state,animation_duration:null===(z=e.design)||void 0===z?void 0:z.animation_duration,intro_animation:null===(T=e.design)||void 0===T?void 0:T.intro_animation,outro_animation:null===(P=e.design)||void 0===P?void 0:P.outro_animation,animation_delay:null===(A=e.design)||void 0===A?void 0:A.animation_delay,animation_timing:null===(L=e.design)||void 0===L?void 0:L.animation_timing});return console.log("🔄 LayoutTab: Rendering row design tab with properties:",O),V`
      <ultra-global-design-tab
        .hass=${this.hass}
        .designProperties=${O}
        @design-changed=${t=>{console.log("🔄 LayoutTab: Received design-changed event for ROW:",t.detail),console.log("🔄 LayoutTab: Current row design before update:",e.design);const o=t.detail,i=Object.assign(Object.assign({},e.design),o);console.log("🔄 LayoutTab: Updated row design:",i),this._updateRow({design:i})}}
      ></ultra-global-design-tab>
    `}_renderColumnGeneralTab(e){return V`
      <div class="settings-section">
        <label>Column Name:</label>
        <input
          type="text"
          .value=${e.column_name||""}
          @input=${e=>this._updateColumn({column_name:e.target.value})}
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
          .value=${e.vertical_alignment||"center"}
          @change=${e=>this._updateColumn({vertical_alignment:e.target.value})}
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
          .value=${e.horizontal_alignment||"center"}
          @change=${e=>this._updateColumn({horizontal_alignment:e.target.value})}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="stretch">Stretch</option>
        </select>
      </div>
    `}_renderColumnLogicTab(e){const t=e.display_conditions||[],o=e.display_mode||"always",i=e.template_mode||!1;return V`
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
                    @change=${e=>{const t=e.target.value;this._updateColumn({display_mode:t})}}
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
                          @click=${()=>this._addColumnCondition(e)}
                        >
                          <ha-icon icon="mdi:plus"></ha-icon>
                          Add Condition
                        </button>
                      </div>

                      <div class="conditions-list">
                        ${t.map(((t,o)=>this._renderColumnCondition(e,t,o)))}
                      </div>

                      ${0===t.length?V`
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
                @change=${e=>{const t=e.target.checked;this._updateColumn({template_mode:t,display_mode:t?"always":o})}}
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
                    .value=${e.template||""}
                    @input=${e=>this._updateColumn({template:e.target.value})}
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
    `}_renderColumnDesignTab(e){var t,o,i,n,a,r,l,s,d,c,p,u,m,g,h,v,b,f,y,_,x,w,$,k,C,S,I,z,T,P,A,L;const O=Object.assign(Object.assign({},e.design),{background_color:(null===(t=e.design)||void 0===t?void 0:t.background_color)||e.background_color,padding_top:(null===(o=e.design)||void 0===o?void 0:o.padding_top)||(null===(i=e.padding)||void 0===i?void 0:i.toString()),padding_bottom:(null===(n=e.design)||void 0===n?void 0:n.padding_bottom)||(null===(a=e.padding)||void 0===a?void 0:a.toString()),padding_left:(null===(r=e.design)||void 0===r?void 0:r.padding_left)||(null===(l=e.padding)||void 0===l?void 0:l.toString()),padding_right:(null===(s=e.design)||void 0===s?void 0:s.padding_right)||(null===(d=e.padding)||void 0===d?void 0:d.toString()),border_radius:(null===(c=e.design)||void 0===c?void 0:c.border_radius)||(null===(p=e.border_radius)||void 0===p?void 0:p.toString()),border_color:(null===(u=e.design)||void 0===u?void 0:u.border_color)||e.border_color,border_width:(null===(m=e.design)||void 0===m?void 0:m.border_width)||(null===(g=e.border_width)||void 0===g?void 0:g.toString()),margin_top:(null===(h=e.design)||void 0===h?void 0:h.margin_top)||(null===(v=e.margin)||void 0===v?void 0:v.toString()),margin_bottom:(null===(b=e.design)||void 0===b?void 0:b.margin_bottom)||(null===(f=e.margin)||void 0===f?void 0:f.toString()),margin_left:(null===(y=e.design)||void 0===y?void 0:y.margin_left)||(null===(_=e.margin)||void 0===_?void 0:_.toString()),margin_right:(null===(x=e.design)||void 0===x?void 0:x.margin_right)||(null===(w=e.margin)||void 0===w?void 0:w.toString()),animation_type:null===($=e.design)||void 0===$?void 0:$.animation_type,animation_entity:null===(k=e.design)||void 0===k?void 0:k.animation_entity,animation_trigger_type:null===(C=e.design)||void 0===C?void 0:C.animation_trigger_type,animation_attribute:null===(S=e.design)||void 0===S?void 0:S.animation_attribute,animation_state:null===(I=e.design)||void 0===I?void 0:I.animation_state,animation_duration:null===(z=e.design)||void 0===z?void 0:z.animation_duration,intro_animation:null===(T=e.design)||void 0===T?void 0:T.intro_animation,outro_animation:null===(P=e.design)||void 0===P?void 0:P.outro_animation,animation_delay:null===(A=e.design)||void 0===A?void 0:A.animation_delay,animation_timing:null===(L=e.design)||void 0===L?void 0:L.animation_timing});return console.log("🔄 LayoutTab: Rendering column design tab with properties:",O),V`
      <ultra-global-design-tab
        .hass=${this.hass}
        .designProperties=${O}
        @design-changed=${t=>{console.log("🔄 LayoutTab: Received design-changed event for COLUMN:",t.detail),console.log("🔄 LayoutTab: Current column design before update:",e.design);const o=t.detail,i=Object.assign(Object.assign({},e.design),o);console.log("🔄 LayoutTab: Updated column design:",i),this._updateColumn({design:i})}}
      ></ultra-global-design-tab>
    `}_renderGeneralTab(e){const t=Ze().getModule(e.type),o=V`
      <div class="settings-section">
        <label>Module Name:</label>
        <input
          type="text"
          .value=${e.module_name||""}
          @input=${e=>this._updateModule({module_name:e.target.value})}
          placeholder="Give this module a custom name to make it easier to identify in the editor."
          class="module-name-input"
        />
        <div class="field-help">
          Give this module a custom name to make it easier to identify in the editor.
        </div>
      </div>
    `;if(t){const i=t.renderGeneralTab(e,this.hass,this.config,(e=>this._updateModule(e)));return e.type,V` ${o} ${i} `}return V`
      ${o}
      <div class="settings-section">
        <div class="error-message">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <span>No settings available for module type: ${e.type}</span>
        </div>
      </div>
    `}_renderActionsTab(e){const t=Ze().getModule(e.type);return t&&"function"==typeof t.renderActionsTab?t.renderActionsTab(e,this.hass,this.config,(e=>this._updateModule(e))):V`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>This module does not have action settings</span>
        </div>
      </div>
    `}_renderOtherTab(e){const t=Ze().getModule(e.type);return t&&"function"==typeof t.renderOtherTab?t.renderOtherTab(e,this.hass,this.config,(e=>this._updateModule(e))):V`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>This module does not have other settings</span>
        </div>
      </div>
    `}_addCondition(e){const t={id:`condition-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"entity_state",entity:"",operator:"=",value:"",enabled:!0},o=[...e.display_conditions||[],t];this._updateModule({display_conditions:o})}_addRowCondition(e){const t={id:`condition-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"entity_state",entity:"",operator:"=",value:"",enabled:!0},o=[...e.display_conditions||[],t];this._updateRow({display_conditions:o})}_addColumnCondition(e){const t={id:`condition-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:"entity_state",entity:"",operator:"=",value:"",enabled:!0},o=[...e.display_conditions||[],t];this._updateColumn({display_conditions:o})}_removeCondition(e,t){const o=(e.display_conditions||[]).filter(((e,o)=>o!==t));this._updateModule({display_conditions:o})}_updateCondition(e,t,o){const i=(e.display_conditions||[]).map(((e,i)=>i===t?Object.assign(Object.assign({},e),o):e));this._updateModule({display_conditions:i})}_duplicateCondition(e,t){const o=e.display_conditions||[],i=o[t];if(i){const e=Object.assign(Object.assign({},i),{id:`condition-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}),n=[...o.slice(0,t+1),e,...o.slice(t+1)];this._updateModule({display_conditions:n})}}_renderRowCondition(e,t,o){return this._renderConditionGeneric(t,o,(t=>{const i=(e.display_conditions||[]).map(((e,i)=>i===o?Object.assign(Object.assign({},e),t):e));this._updateRow({display_conditions:i})}),(()=>{const t=(e.display_conditions||[]).filter(((e,t)=>t!==o));this._updateRow({display_conditions:t})}))}_renderColumnCondition(e,t,o){return this._renderConditionGeneric(t,o,(t=>{const i=(e.display_conditions||[]).map(((e,i)=>i===o?Object.assign(Object.assign({},e),t):e));this._updateColumn({display_conditions:i})}),(()=>{const t=(e.display_conditions||[]).filter(((e,t)=>t!==o));this._updateColumn({display_conditions:t})}))}_renderConditionGeneric(e,t,o,i){return V`
      <div class="condition-item ${e.enabled?"enabled":"disabled"}">
        <div class="condition-header">
          <div class="condition-header-left">
            <button type="button" class="condition-toggle ${"expanded"}">
              <ha-icon icon="mdi:chevron-${"down"}"></ha-icon>
            </button>
            <span class="condition-label">
              ${"entity_state"===e.type?e.entity||"Select Entity State":"entity_attribute"===e.type?e.entity||"Select Entity Attribute":"time"===e.type?"Time Condition":"Template Condition"}
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
                    .value=${e.type}
                    @change=${e=>{const t=e.target.value;o({type:t,entity:"",operator:"=",value:""})}}
                  >
                    <option value="entity_state">Entity State</option>
                    <option value="entity_attribute">Entity Attribute</option>
                    <option value="time">Date/Time</option>
                    <option value="template">Template</option>
                  </select>
                </div>

                ${"entity_state"===e.type?this._renderEntityConditionGeneric(e,o):""}
                ${"entity_attribute"===e.type?this._renderEntityAttributeConditionGeneric(e,o):""}

                <!-- Enable/Disable Toggle -->
                <div class="condition-field">
                  <label class="condition-enable-toggle">
                    <input
                      type="checkbox"
                      .checked=${!1!==e.enabled}
                      @change=${e=>o({enabled:e.target.checked})}
                    />
                    Enable this condition
                  </label>
                </div>
              </div>
            `}
      </div>
    `}_renderEntityConditionGeneric(e,t){return V`
      <div class="entity-condition-fields">
        <!-- Entity Picker -->
        <div class="condition-field">
          <label>Entity:</label>
          <ha-form
            .hass=${this.hass}
            .data=${{entity:e.entity||""}}
            .schema=${[{name:"entity",selector:{entity:{}}}]}
            @value-changed=${e=>t({entity:e.detail.value.entity})}
          ></ha-form>
        </div>

        <!-- Operator -->
        <div class="condition-field">
          <label>Operator:</label>
          <select
            .value=${e.operator||"="}
            @change=${e=>t({operator:e.target.value})}
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
                  @input=${e=>t({value:e.target.value})}
                  placeholder="Enter value to compare"
                />
              </div>
            `:""}
      </div>
    `}_renderEntityAttributeConditionGeneric(e,t){return V`
      <div class="entity-attribute-fields">
        <!-- Entity Picker -->
        <div class="condition-field">
          <label>Entity:</label>
          <ha-form
            .hass=${this.hass}
            .data=${{entity:e.entity||""}}
            .schema=${[{name:"entity",selector:{entity:{}}}]}
            @value-changed=${e=>t({entity:e.detail.value.entity})}
          ></ha-form>
        </div>

        <!-- Attribute Selector -->
        <div class="condition-field">
          <label>Attribute Name:</label>
          <input
            type="text"
            .value=${e.attribute||""}
            @input=${e=>t({attribute:e.target.value})}
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
            @change=${e=>t({operator:e.target.value})}
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
                  @input=${e=>t({value:e.target.value})}
                  placeholder="Enter value to compare"
                />
              </div>
            `:""}
      </div>
    `}_renderCondition(e,t,o){return V`
      <div class="condition-item ${t.enabled?"enabled":"disabled"}">
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
              ${"entity_state"===t.type?t.entity||"Select Entity State":"entity_attribute"===t.type?t.entity||"Select Entity Attribute":"time"===t.type?"Time Condition":"Template Condition"}
            </span>
          </div>

          <div class="condition-actions">
            <button
              type="button"
              class="condition-action-btn"
              @click=${()=>this._duplicateCondition(e,o)}
              title="Duplicate"
            >
              <ha-icon icon="mdi:content-copy"></ha-icon>
            </button>
            <button
              type="button"
              class="condition-action-btn delete"
              @click=${()=>this._removeCondition(e,o)}
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
                    .value=${t.type}
                    @change=${t=>{const i=t.target.value;this._updateCondition(e,o,{type:i,entity:"",operator:"=",value:""})}}
                  >
                    <option value="entity_state">Entity State</option>
                    <option value="entity_attribute">Entity Attribute</option>
                    <option value="time">Date/Time</option>
                    <option value="template">Template</option>
                  </select>
                </div>

                ${"entity_state"===t.type?this._renderEntityCondition(e,t,o):""}
                ${"entity_attribute"===t.type?this._renderEntityAttributeCondition(e,t,o):""}
                ${"time"===t.type?this._renderTimeCondition(e,t,o):""}
                ${"template"===t.type?this._renderTemplateCondition(e,t,o):""}

                <!-- Enable/Disable Toggle -->
                <div class="condition-field">
                  <label class="condition-enable-toggle">
                    <input
                      type="checkbox"
                      .checked=${!1!==t.enabled}
                      @change=${t=>this._updateCondition(e,o,{enabled:t.target.checked})}
                    />
                    Enable this condition
                  </label>
                </div>
              </div>
            `}
      </div>
    `}_renderEntityCondition(e,t,o){return V`
      <div class="entity-condition-fields">
        <!-- Entity Picker -->
        <div class="condition-field">
          <label>Entity:</label>
          <ha-form
            .hass=${this.hass}
            .data=${{entity:t.entity||""}}
            .schema=${[{name:"entity",selector:{entity:{}}}]}
            @value-changed=${t=>this._updateCondition(e,o,{entity:t.detail.value.entity})}
          ></ha-form>
        </div>

        <!-- Operator -->
        <div class="condition-field">
          <label>Operator:</label>
          <select
            .value=${t.operator||"="}
            @change=${t=>this._updateCondition(e,o,{operator:t.target.value})}
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
                  @input=${t=>this._updateCondition(e,o,{value:t.target.value})}
                  placeholder="Enter value to compare"
                />
              </div>
            `:""}
      </div>
    `}_renderEntityAttributeCondition(e,t,o){return V`
      <div class="entity-attribute-fields">
        <!-- Entity Picker -->
        <div class="condition-field">
          <label>Entity:</label>
          <ha-form
            .hass=${this.hass}
            .data=${{entity:t.entity||""}}
            .schema=${[{name:"entity",selector:{entity:{}}}]}
            @value-changed=${t=>this._updateCondition(e,o,{entity:t.detail.value.entity})}
          ></ha-form>
        </div>

        <!-- Attribute Selector -->
        <div class="condition-field">
          <label>Attribute Name:</label>
          <input
            type="text"
            .value=${t.attribute||""}
            @input=${t=>this._updateCondition(e,o,{attribute:t.target.value})}
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
            @change=${t=>this._updateCondition(e,o,{operator:t.target.value})}
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
                  @input=${t=>this._updateCondition(e,o,{value:t.target.value})}
                  placeholder="Enter value to compare"
                />
              </div>
            `:""}
      </div>
    `}_renderTimeCondition(e,t,o){return V`
      <div class="time-condition-fields">
        <p class="condition-info">Local time is ${(new Date).toLocaleString()}</p>

        <div class="time-inputs">
          <div class="condition-field">
            <label>From Time:</label>
            <input
              type="time"
              .value=${t.time_from||""}
              @input=${t=>this._updateCondition(e,o,{time_from:t.target.value})}
            />
          </div>

          <div class="condition-field">
            <label>To Time:</label>
            <input
              type="time"
              .value=${t.time_to||""}
              @input=${t=>this._updateCondition(e,o,{time_to:t.target.value})}
            />
          </div>
        </div>
      </div>
    `}_renderTemplateCondition(e,t,o){return V`
      <div class="template-condition">
        <div class="condition-field">
          <label>Template:</label>
          <textarea
            .value=${t.template||""}
            @input=${t=>this._updateCondition(e,o,{template:t.target.value})}
            placeholder="{% if states('sensor.example') == 'on' %}true{% else %}false{% endif %}"
            rows="3"
          ></textarea>
        </div>
        <div class="template-help">Template should return 'true' or 'false'</div>
      </div>
    `}_renderLogicTab(e){const t=e.display_conditions||[],o=e.display_mode||"always",i=e.template_mode||!1;return V`
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
              @change=${e=>{const t=e.target.value;this._updateModule({display_mode:t})}}
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
                    @click=${()=>this._addCondition(e)}
                    .disabled=${i}
                  >
                    <ha-icon icon="mdi:plus"></ha-icon>
                    Add Condition
                  </button>
                </div>

                <div class="conditions-list">
                  ${t.map(((t,o)=>this._renderCondition(e,t,o)))}
                </div>

                ${0===t.length?V`
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
                  @change=${e=>{const t=e.target.checked;this._updateModule({template_mode:t,display_mode:t?"always":o})}}
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
                    .value=${e.template||""}
                    @input=${e=>this._updateModule({template:e.target.value})}
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
    `}_renderDesignTab(e){var t,o,i,n,a,r,l,s,d,c,p,u,m,g,h,v,b,f,y,_,x,w,$,k,C;const S={color:e.color,text_align:e.text_align||e.alignment,font_size:null===(t=e.font_size)||void 0===t?void 0:t.toString(),line_height:null===(o=e.line_height)||void 0===o?void 0:o.toString(),letter_spacing:e.letter_spacing,font_family:e.font_family,font_weight:e.font_weight,text_transform:e.text_transform,font_style:e.font_style,background_color:e.background_color,background_image:e.background_image,background_image_type:e.background_image_type,background_image_entity:e.background_image_entity,backdrop_filter:e.backdrop_filter,width:e.width,height:e.height,max_width:e.max_width,max_height:e.max_height,min_width:e.min_width,min_height:e.min_height,margin_top:(null===(n=null===(i=e.margin)||void 0===i?void 0:i.top)||void 0===n?void 0:n.toString())||e.margin_top,margin_bottom:(null===(r=null===(a=e.margin)||void 0===a?void 0:a.bottom)||void 0===r?void 0:r.toString())||e.margin_bottom,margin_left:(null===(s=null===(l=e.margin)||void 0===l?void 0:l.left)||void 0===s?void 0:s.toString())||e.margin_left,margin_right:(null===(c=null===(d=e.margin)||void 0===d?void 0:d.right)||void 0===c?void 0:c.toString())||e.margin_right,padding_top:(null===(u=null===(p=e.padding)||void 0===p?void 0:p.top)||void 0===u?void 0:u.toString())||e.padding_top,padding_bottom:(null===(g=null===(m=e.padding)||void 0===m?void 0:m.bottom)||void 0===g?void 0:g.toString())||e.padding_bottom,padding_left:(null===(v=null===(h=e.padding)||void 0===h?void 0:h.left)||void 0===v?void 0:v.toString())||e.padding_left,padding_right:(null===(f=null===(b=e.padding)||void 0===b?void 0:b.right)||void 0===f?void 0:f.toString())||e.padding_right,border_radius:(null===(_=null===(y=e.border)||void 0===y?void 0:y.radius)||void 0===_?void 0:_.toString())||(null===(x=e.border_radius)||void 0===x?void 0:x.toString()),border_style:(null===(w=e.border)||void 0===w?void 0:w.style)||e.border_style,border_width:(null===(k=null===($=e.border)||void 0===$?void 0:$.width)||void 0===k?void 0:k.toString())||e.border_width,border_color:(null===(C=e.border)||void 0===C?void 0:C.color)||e.border_color,position:e.position,top:e.top,bottom:e.bottom,left:e.left,right:e.right,z_index:e.z_index,text_shadow_h:e.text_shadow_h,text_shadow_v:e.text_shadow_v,text_shadow_blur:e.text_shadow_blur,text_shadow_color:e.text_shadow_color,box_shadow_h:e.box_shadow_h,box_shadow_v:e.box_shadow_v,box_shadow_blur:e.box_shadow_blur,box_shadow_spread:e.box_shadow_spread,box_shadow_color:e.box_shadow_color,overflow:e.overflow,clip_path:e.clip_path,animation_type:e.animation_type,animation_entity:e.animation_entity,animation_trigger_type:e.animation_trigger_type,animation_attribute:e.animation_attribute,animation_state:e.animation_state,intro_animation:e.intro_animation,outro_animation:e.outro_animation,animation_duration:e.animation_duration,animation_delay:e.animation_delay,animation_timing:e.animation_timing};return console.log("🔄 LayoutTab: Rendering module design tab with properties:",S),V`
      <ultra-global-design-tab
        .hass=${this.hass}
        .designProperties=${S}
        .onUpdate=${e=>{console.log("🔄 LayoutTab: Received onUpdate callback for MODULE:",e),console.log("🔄 LayoutTab: Current selected module:",this._selectedModule),this._updateModuleDesign(e)}}
      ></ultra-global-design-tab>
    `}_renderTextDesignTab(e){if("text"===e.type){const t=e;return V`
        <!-- Text Color Section -->
        <div class="settings-section">
          <ultra-color-picker
            .label=${"Text Color"}
            .value=${t.color||""}
            .defaultValue=${"var(--primary-text-color)"}
            .hass=${this.hass}
            @value-changed=${e=>{const o=e.detail.value;this._updateModule({color:o}),this._loadGoogleFont(t.font_family)}}
          ></ultra-color-picker>
        </div>

        <!-- Font Family Dropdown -->
        <div class="settings-section">
          <label>Font:</label>
          <select
            .value=${t.font_family||"default"}
            @change=${e=>{const t=e.target.value;this._updateModule({font_family:t}),this._loadGoogleFont(t)}}
            class="font-dropdown"
          >
            ${ut.map((e=>V`
                <option value="${e.value}" ?selected=${t.font_family===e.value}>
                  ${e.label}
                </option>
              `))}
            <optgroup label="Fonts from Typography settings">
              ${mt.map((e=>V`
                  <option value="${e.value}" ?selected=${t.font_family===e.value}>
                    ${e.label}
                  </option>
                `))}
            </optgroup>
            <optgroup label="Web safe font combinations (do not need to be loaded)">
              ${gt.map((e=>V`
                  <option value="${e.value}" ?selected=${t.font_family===e.value}>
                    ${e.label}
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
            .value=${t.font_size||16}
            @input=${e=>this._updateModule({font_size:Number(e.target.value)})}
            class="font-size-input"
          />
        </div>

        <!-- Text Alignment -->
        <div class="settings-section">
          <label>Text Alignment:</label>
          <div class="alignment-buttons">
            ${["left","center","right"].map((e=>V`
                <button
                  class="alignment-btn ${t.alignment===e?"active":""}"
                  @click=${()=>this._updateModule({alignment:e})}
                >
                  <ha-icon icon="mdi:format-align-${e}"></ha-icon>
                </button>
              `))}
          </div>
        </div>

        <!-- Text Formatting -->
        <div class="settings-section">
          <label>Text Formatting:</label>
          <div class="format-buttons">
            <button
              class="format-btn ${t.bold?"active":""}"
              @click=${()=>this._updateModule({bold:!t.bold})}
            >
              <ha-icon icon="mdi:format-bold"></ha-icon>
            </button>
            <button
              class="format-btn ${t.italic?"active":""}"
              @click=${()=>this._updateModule({italic:!t.italic})}
            >
              <ha-icon icon="mdi:format-italic"></ha-icon>
            </button>
            <button
              class="format-btn ${t.uppercase?"active":""}"
              @click=${()=>this._updateModule({uppercase:!t.uppercase})}
            >
              <ha-icon icon="mdi:format-letter-case-upper"></ha-icon>
            </button>
            <button
              class="format-btn ${t.strikethrough?"active":""}"
              @click=${()=>this._updateModule({strikethrough:!t.strikethrough})}
            >
              <ha-icon icon="mdi:format-strikethrough"></ha-icon>
            </button>
          </div>
        </div>
      `}if("separator"===e.type)return V`
        <div class="settings-section">
          <ultra-color-picker
            .label=${"Separator Color"}
            .value=${e.color||""}
            .defaultValue=${"var(--divider-color)"}
            .hass=${this.hass}
            @value-changed=${e=>{const t=e.detail.value;this._updateModule({color:t})}}
          ></ultra-color-picker>
        </div>
      `;if("bar"===e.type){const t=e;return V`
        <!-- Bar Colors -->
        <div class="settings-section">
          <ultra-color-picker
            .label=${"Bar Color"}
            .value=${t.bar_color||""}
            .defaultValue=${"var(--primary-color)"}
            .hass=${this.hass}
            @value-changed=${e=>{const t=e.detail.value;this._updateModule({bar_color:t})}}
          ></ultra-color-picker>
        </div>

        <div class="settings-section">
          <ultra-color-picker
            .label=${"Background Color"}
            .value=${t.background_color||""}
            .defaultValue=${"var(--secondary-background-color)"}
            .hass=${this.hass}
            @value-changed=${e=>{const t=e.detail.value;this._updateModule({background_color:t})}}
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
            .value=${t.height||20}
            @input=${e=>this._updateModule({height:Number(e.target.value)})}
            class="number-input"
          />
        </div>

        <div class="settings-section">
          <label>Border Radius (px):</label>
          <input
            type="number"
            min="0"
            max="50"
            .value=${t.border_radius||10}
            @input=${e=>this._updateModule({border_radius:Number(e.target.value)})}
            class="number-input"
          />
        </div>

        <!-- Value Display Options -->
        <div class="settings-section">
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              .checked=${!1!==t.show_value}
              @change=${e=>this._updateModule({show_value:e.target.checked})}
            />
            Show Value
          </label>
        </div>

        ${t.show_value?V`
              <div class="settings-section">
                <label>Value Position:</label>
                <div class="value-position-buttons">
                  ${["inside","outside","none"].map((e=>V`
                      <button
                        class="position-btn ${t.value_position===e?"active":""}"
                        @click=${()=>this._updateModule({value_position:e})}
                      >
                        ${e.charAt(0).toUpperCase()+e.slice(1)}
                      </button>
                    `))}
                </div>
              </div>
            `:""}

        <div class="settings-section">
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              .checked=${!1!==t.show_percentage}
              @change=${e=>this._updateModule({show_percentage:e.target.checked})}
            />
            Show as Percentage
          </label>
        </div>

        <div class="settings-section">
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              .checked=${!1!==t.animation}
              @change=${e=>this._updateModule({animation:e.target.checked})}
            />
            Animation
          </label>
        </div>
      `}if("image"===e.type){const t=e;return V`
        <!-- Image Alignment -->
        <div class="settings-section">
          <label>Image Alignment:</label>
          <div class="alignment-buttons">
            ${["left","center","right"].map((e=>V`
                <button
                  class="alignment-btn ${t.alignment===e?"active":""}"
                  @click=${()=>this._updateModule({alignment:e})}
                >
                  <ha-icon icon="mdi:format-align-${e}"></ha-icon>
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
            .value=${t.image_width||100}
            @input=${e=>this._updateModule({image_width:Number(e.target.value)})}
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
            .value=${t.image_height||100}
            @input=${e=>this._updateModule({image_height:Number(e.target.value)})}
            class="number-input"
          />
        </div>

        <div class="settings-section">
          <label>Border Radius (px):</label>
          <input
            type="number"
            min="0"
            max="50"
            .value=${t.border_radius||8}
            @input=${e=>this._updateModule({border_radius:Number(e.target.value)})}
            class="number-input"
          />
        </div>

        <div class="settings-section">
          <label>Image Fit:</label>
          <div class="value-position-buttons">
            ${["cover","contain","fill","none"].map((e=>V`
                <button
                  class="position-btn ${t.image_fit===e?"active":""}"
                  @click=${()=>this._updateModule({image_fit:e})}
                >
                  ${e.charAt(0).toUpperCase()+e.slice(1)}
                </button>
              `))}
          </div>
        </div>
      `}return V`<div class="settings-section">
      <p>Design options not available for ${e.type} modules.</p>
    </div>`}_renderBackgroundDesignTab(e){return V`
      <div class="settings-section">
        <ultra-color-picker
          .label=${"Background Color"}
          .value=${e.background_color||""}
          .defaultValue=${"var(--ha-card-background, var(--card-background-color, #fff))"}
          .hass=${this.hass}
          @value-changed=${e=>{const t=e.detail.value;this._updateModule({background_color:t})}}
        ></ultra-color-picker>
      </div>
    `}_renderSpacingDesignTab(e){var t,o,i,n,a,r,l,s;return V`
      <div class="spacing-grid">
        <div class="spacing-section">
          <h4>Margin</h4>
          <div class="spacing-cross">
            <input
              type="number"
              placeholder="Top"
              .value=${(null===(t=e.margin)||void 0===t?void 0:t.top)||0}
              @input=${t=>this._updateModule({margin:Object.assign(Object.assign({},e.margin),{top:Number(t.target.value)})})}
            />
            <div class="spacing-row">
              <input
                type="number"
                placeholder="Left"
                .value=${(null===(o=e.margin)||void 0===o?void 0:o.left)||0}
                @input=${t=>this._updateModule({margin:Object.assign(Object.assign({},e.margin),{left:Number(t.target.value)})})}
              />
              <span class="spacing-center">M</span>
              <input
                type="number"
                placeholder="Right"
                .value=${(null===(i=e.margin)||void 0===i?void 0:i.right)||0}
                @input=${t=>this._updateModule({margin:Object.assign(Object.assign({},e.margin),{right:Number(t.target.value)})})}
              />
            </div>
            <input
              type="number"
              placeholder="Bottom"
              .value=${(null===(n=e.margin)||void 0===n?void 0:n.bottom)||0}
              @input=${t=>this._updateModule({margin:Object.assign(Object.assign({},e.margin),{bottom:Number(t.target.value)})})}
            />
          </div>
        </div>

        <div class="spacing-section">
          <h4>Padding</h4>
          <div class="spacing-cross">
            <input
              type="number"
              placeholder="Top"
              .value=${(null===(a=e.padding)||void 0===a?void 0:a.top)||0}
              @input=${t=>this._updateModule({padding:Object.assign(Object.assign({},e.padding),{top:Number(t.target.value)})})}
            />
            <div class="spacing-row">
              <input
                type="number"
                placeholder="Left"
                .value=${(null===(r=e.padding)||void 0===r?void 0:r.left)||0}
                @input=${t=>this._updateModule({padding:Object.assign(Object.assign({},e.padding),{left:Number(t.target.value)})})}
              />
              <span class="spacing-center">P</span>
              <input
                type="number"
                placeholder="Right"
                .value=${(null===(l=e.padding)||void 0===l?void 0:l.right)||0}
                @input=${t=>this._updateModule({padding:Object.assign(Object.assign({},e.padding),{right:Number(t.target.value)})})}
              />
            </div>
            <input
              type="number"
              placeholder="Bottom"
              .value=${(null===(s=e.padding)||void 0===s?void 0:s.bottom)||0}
              @input=${t=>this._updateModule({padding:Object.assign(Object.assign({},e.padding),{bottom:Number(t.target.value)})})}
            />
          </div>
        </div>
      </div>
    `}firstUpdated(e){super.firstUpdated(e),this._loadCollapseState()}updated(e){super.updated(e)}_renderBorderDesignTab(e){var t;return V`
      <div class="settings-section">
        <label>Border Radius (px):</label>
        <input
          type="number"
          min="0"
          max="50"
          .value=${(null===(t=e.border)||void 0===t?void 0:t.radius)||0}
          @input=${t=>this._updateModule({border:Object.assign(Object.assign({},e.border),{radius:Number(t.target.value)})})}
        />
      </div>
    `}render(){const e=this._ensureLayout();return V`
      <div class="layout-builder">
        <div class="builder-header">
          <h3>Layout Builder</h3>
          <button
            class="add-row-btn"
            @click=${e=>{e.stopPropagation(),this._addRow()}}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Row
          </button>
        </div>

        <div class="rows-container">
          ${e.rows.map(((e,t)=>{var o,i;return V`
              <div
                class="row-builder ${this._isRowCollapsed(t)?"collapsed":""} ${"row"===(null===(o=this._dropTarget)||void 0===o?void 0:o.type)&&(null===(i=this._dropTarget)||void 0===i?void 0:i.rowIndex)===t?"drop-target":""}"
                draggable="true"
                @dragstart=${e=>this._onDragStart(e,"row",t)}
                @dragend=${this._onDragEnd}
                @dragover=${this._onDragOver}
                @dragenter=${e=>this._onDragEnter(e,"row",t)}
                @dragleave=${this._onDragLeave}
                @drop=${e=>this._onDrop(e,"row",t)}
              >
                <div class="row-header">
                  <div class="row-title">
                    <div class="row-drag-handle" title="Drag to move row">
                      <ha-icon icon="mdi:drag"></ha-icon>
                    </div>
                    <button
                      class="row-collapse-btn"
                      @click=${e=>{e.stopPropagation(),this._toggleRowCollapse(t)}}
                      @mousedown=${e=>e.stopPropagation()}
                      @dragstart=${e=>e.preventDefault()}
                      title="${this._isRowCollapsed(t)?"Expand Row":"Collapse Row"}"
                    >
                      <ha-icon
                        icon="mdi:chevron-${this._isRowCollapsed(t)?"right":"down"}"
                      ></ha-icon>
                    </button>
                    <span>${this._getRowDisplayName(e,t)}</span>
                    <button
                      class="column-layout-btn"
                      @click=${e=>{e.stopPropagation(),this._openColumnLayoutSelector(t)}}
                      @mousedown=${e=>e.stopPropagation()}
                      @dragstart=${e=>e.preventDefault()}
                      title="Change Column Layout"
                    >
                      <span class="layout-icon">${this._getCurrentLayoutDisplay(e)}</span>
                    </button>
                  </div>
                  <div class="row-actions">
                    <button
                      class="row-add-column-btn"
                      @click=${e=>{e.stopPropagation(),this._addColumn(t)}}
                      @mousedown=${e=>e.stopPropagation()}
                      @dragstart=${e=>e.preventDefault()}
                      title="Add Column to Row"
                    >
                      <ha-icon icon="mdi:plus"></ha-icon>
                    </button>
                    <button
                      class="row-duplicate-btn"
                      @click=${e=>{e.stopPropagation(),this._duplicateRow(t)}}
                      @mousedown=${e=>e.stopPropagation()}
                      @dragstart=${e=>e.preventDefault()}
                      title="Duplicate Row"
                    >
                      <ha-icon icon="mdi:content-copy"></ha-icon>
                    </button>
                    <button
                      class="row-settings-btn"
                      @click=${e=>{e.stopPropagation(),this._openRowSettings(t)}}
                      @mousedown=${e=>e.stopPropagation()}
                      @dragstart=${e=>e.preventDefault()}
                      title="Row Settings"
                    >
                      <ha-icon icon="mdi:cog"></ha-icon>
                    </button>
                    <button
                      class="delete-row-btn"
                      @click=${e=>{e.stopPropagation(),this._deleteRow(t)}}
                      @mousedown=${e=>e.stopPropagation()}
                      @dragstart=${e=>e.preventDefault()}
                      title="Delete Row"
                    >
                      <ha-icon icon="mdi:delete"></ha-icon>
                    </button>
                  </div>
                </div>
                ${this._isRowCollapsed(t)?"":V`
                      <div
                        class="columns-container"
                        data-layout="${e.column_layout||"1-2-1-2"}"
                      >
                        ${e.columns&&e.columns.length>0?e.columns.map(((e,o)=>{var i,n,a,r,l,s;return V`
                                <div
                                  class="column-builder ${this._isColumnCollapsed(t,o)?"collapsed":""} ${"column"===(null===(i=this._dropTarget)||void 0===i?void 0:i.type)&&(null===(n=this._dropTarget)||void 0===n?void 0:n.rowIndex)===t&&(null===(a=this._dropTarget)||void 0===a?void 0:a.columnIndex)===o?"drop-target":""}"
                                  draggable="true"
                                  @dragstart=${e=>this._onDragStart(e,"column",t,o)}
                                  @dragend=${this._onDragEnd}
                                  @dragover=${this._onDragOver}
                                  @dragenter=${e=>this._onDragEnter(e,"column",t,o)}
                                  @dragleave=${this._onDragLeave}
                                  @drop=${e=>this._onDrop(e,"column",t,o)}
                                >
                                  <div class="column-header">
                                    <div class="column-title">
                                      <div class="column-drag-handle" title="Drag to move column">
                                        <ha-icon icon="mdi:drag"></ha-icon>
                                      </div>
                                      <button
                                        class="column-collapse-btn"
                                        @click=${e=>{e.stopPropagation(),this._toggleColumnCollapse(t,o)}}
                                        @mousedown=${e=>e.stopPropagation()}
                                        @dragstart=${e=>e.preventDefault()}
                                        title="${this._isColumnCollapsed(t,o)?"Expand Column":"Collapse Column"}"
                                      >
                                        <ha-icon
                                          icon="mdi:chevron-${this._isColumnCollapsed(t,o)?"right":"down"}"
                                        ></ha-icon>
                                      </button>
                                      <span
                                        >${this._getColumnDisplayName(e,o)}</span
                                      >
                                    </div>
                                    <div class="column-actions">
                                      <button
                                        class="column-add-module-btn"
                                        @click=${e=>{e.stopPropagation(),this._openModuleSelector(t,o)}}
                                        @mousedown=${e=>e.stopPropagation()}
                                        @dragstart=${e=>e.preventDefault()}
                                        title="Add Module to Column"
                                      >
                                        <ha-icon icon="mdi:plus"></ha-icon>
                                      </button>
                                      <button
                                        class="column-duplicate-btn"
                                        @click=${e=>{e.stopPropagation(),this._duplicateColumn(t,o)}}
                                        @mousedown=${e=>e.stopPropagation()}
                                        @dragstart=${e=>e.preventDefault()}
                                        title="Duplicate Column"
                                      >
                                        <ha-icon icon="mdi:content-copy"></ha-icon>
                                      </button>
                                      <button
                                        class="column-settings-btn"
                                        @click=${e=>{e.stopPropagation(),this._openColumnSettings(t,o)}}
                                        @mousedown=${e=>e.stopPropagation()}
                                        @dragstart=${e=>e.preventDefault()}
                                        title="Column Settings"
                                      >
                                        <ha-icon icon="mdi:cog"></ha-icon>
                                      </button>
                                      <button
                                        class="column-delete-btn"
                                        @click=${e=>{e.stopPropagation(),this._deleteColumn(t,o)}}
                                        @mousedown=${e=>e.stopPropagation()}
                                        @dragstart=${e=>e.preventDefault()}
                                        title="Delete Column"
                                      >
                                        <ha-icon icon="mdi:delete"></ha-icon>
                                      </button>
                                    </div>
                                  </div>
                                  ${this._isColumnCollapsed(t,o)?"":V`
                                        <div
                                          class="modules-container ${"column"===(null===(r=this._dropTarget)||void 0===r?void 0:r.type)&&(null===(l=this._dropTarget)||void 0===l?void 0:l.rowIndex)===t&&(null===(s=this._dropTarget)||void 0===s?void 0:s.columnIndex)===o?"drop-target":""}"
                                          @dragover=${this._onDragOver}
                                          @dragenter=${e=>this._onDragEnter(e,"column",t,o)}
                                          @dragleave=${this._onDragLeave}
                                          @drop=${e=>this._onDrop(e,"column",t,o)}
                                        >
                                          ${e.modules.map(((e,i)=>{var n,a,r,l;return V`
                                              <div
                                                class="module-item"
                                                draggable="true"
                                                @dragstart=${e=>this._onDragStart(e,"module",t,o,i)}
                                                @dragend=${this._onDragEnd}
                                                @dragover=${this._onDragOver}
                                                @dragenter=${e=>this._onDragEnter(e,"module",t,o,i)}
                                                @dragleave=${this._onDragLeave}
                                                @drop=${e=>this._onDrop(e,"module",t,o,i)}
                                                class="${"module"===(null===(n=this._dropTarget)||void 0===n?void 0:n.type)&&(null===(a=this._dropTarget)||void 0===a?void 0:a.rowIndex)===t&&(null===(r=this._dropTarget)||void 0===r?void 0:r.columnIndex)===o&&(null===(l=this._dropTarget)||void 0===l?void 0:l.moduleIndex)===i?"drop-target":""}"
                                              >
                                                <div
                                                  class="module-content"
                                                  @click=${()=>this._openModuleSettings(t,o,i)}
                                                >
                                                  ${this._renderSingleModule(e,t,o,i)}
                                                </div>
                                              </div>
                                            `}))}
                                          <button
                                            class="add-module-btn"
                                            @click=${e=>{e.stopPropagation(),this._openModuleSelector(t,o)}}
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
                                  @click=${e=>{e.stopPropagation(),this._openModuleSelector(t,0)}}
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
                            @click=${e=>{e.stopPropagation(),this._addColumn(t)}}
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
    `}_renderModuleSelector(){const e=Ze().getAllModules(),t=this._selectedLayoutModuleIndex>=0,o=e.filter((e=>"layout"===e.metadata.category)),i=e.filter((e=>"layout"!==e.metadata.category));return V`
      <div class="module-selector-popup">
        <div class="popup-overlay" @click=${()=>this._showModuleSelector=!1}></div>
        <div class="selector-content">
          <div class="selector-header">
            <h3>Add Module</h3>
            ${t?V`<p class="selector-subtitle">
                  Adding to layout module (only content modules allowed)
                </p>`:""}
          </div>

          ${!t&&o.length>0?V`
                <div class="module-category">
                  <h4 class="category-title">Layout Containers</h4>
                  <p class="category-description">Create containers to organize your modules</p>
                  <div class="module-types layout-modules">
                    ${o.map((e=>{const t=e.metadata,o="horizontal"===t.type,i="vertical"===t.type;return V`
                        <button
                          class="module-type-btn layout-module ${o?"horizontal-layout":""} ${i?"vertical-layout":""}"
                          @click=${()=>this._addModule(t.type)}
                          title="${t.description}"
                        >
                          <div class="layout-badge">Layout</div>
                          <ha-icon icon="${t.icon}"></ha-icon>
                          <div class="module-info">
                            <span class="module-title">${t.title}</span>
                            <span class="module-description">${t.description}</span>
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
                    ${i.map((e=>{const t=e.metadata;return V`
                        <button
                          class="module-type-btn content-module"
                          @click=${()=>this._addModule(t.type)}
                          title="${t.description}"
                        >
                          <ha-icon icon="${t.icon}"></ha-icon>
                          <div class="module-info">
                            <span class="module-title">${t.title}</span>
                            <span class="module-description">${t.description}</span>
                          </div>
                        </button>
                      `}))}
                  </div>
                </div>
              `:""}
        </div>
      </div>
    `}_formatCategoryTitle(e){return e.charAt(0).toUpperCase()+e.slice(1)}_isLayoutModule(e){return["horizontal","vertical"].includes(e)}_shouldAutoOpenSettings(e){return!this._isLayoutModule(e)}_getLayoutModuleColor(e){return this._isLayoutModule(e)?"var(--success-color, #4caf50)":"var(--accent-color, var(--orange-color, #ff9800))"}_renderColumnLayoutSelector(){const e=this._ensureLayout().rows[this._selectedRowForLayout],t=e?e.columns.length:1,o=(null==e?void 0:e.column_layout)||"1-col",i=this._migrateLegacyLayoutId(o),n=this._getLayoutsForColumnCount(t);return V`
      <div class="column-layout-selector-popup">
        <div class="popup-overlay" @click=${()=>this._showColumnLayoutSelector=!1}></div>
        <div class="selector-content">
          <div class="selector-header">
            <h3>Choose Column Layout</h3>
            <p>
              Select any layout for ${t}
              column${1!==t?"s":""} (Currently: ${t}
              column${1!==t?"s":""})
            </p>
          </div>

          <div class="layout-options">
            ${n.map((e=>V`
                <button
                  class="layout-option-btn ${e.id===o||e.id===i?"current":""}"
                  @click=${()=>this._changeColumnLayout(e.id)}
                  title="${e.name}"
                >
                  <div class="layout-visual">
                    <div class="layout-icon-large">
                      ${lt(this._createColumnIconHTML(e.proportions))}
                    </div>
                  </div>
                  <div class="layout-name">${e.name}</div>
                  ${e.id===o||e.id===i?V`<div class="current-badge">Current</div>`:""}
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
        border-radius: 8px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      }

      .selector-header {
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
        margin-bottom: 16px;
      }

      .selector-header h3 {
        margin: 0 0 4px 0;
      }

      .module-stats {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .module-category {
        margin-bottom: 20px;
      }

      .category-title {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: var(--primary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .module-types {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
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
        min-height: 60px;
      }

      .module-type-btn:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
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

      /* Module Category Styles */
      .module-category {
        margin-bottom: 24px;
      }

      .category-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: var(--primary-text-color);
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

      .row-builder[draggable='true']:hover,
      .column-builder[draggable='true']:hover,
      .module-item[draggable='true']:hover {
        cursor: grab;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
    `}};pt([me({attribute:!1})],ht.prototype,"hass",void 0),pt([me({attribute:!1})],ht.prototype,"config",void 0),pt([ge()],ht.prototype,"_showModuleSelector",void 0),pt([ge()],ht.prototype,"_selectedRowIndex",void 0),pt([ge()],ht.prototype,"_selectedColumnIndex",void 0),pt([ge()],ht.prototype,"_showModuleSettings",void 0),pt([ge()],ht.prototype,"_selectedModule",void 0),pt([ge()],ht.prototype,"_activeModuleTab",void 0),pt([ge()],ht.prototype,"_activeDesignSubtab",void 0),pt([ge()],ht.prototype,"_showRowSettings",void 0),pt([ge()],ht.prototype,"_selectedRowForSettings",void 0),pt([ge()],ht.prototype,"_activeRowTab",void 0),pt([ge()],ht.prototype,"_showColumnSettings",void 0),pt([ge()],ht.prototype,"_selectedColumnForSettings",void 0),pt([ge()],ht.prototype,"_activeColumnTab",void 0),pt([ge()],ht.prototype,"_showColumnLayoutSelector",void 0),pt([ge()],ht.prototype,"_selectedRowForLayout",void 0),pt([ge()],ht.prototype,"_draggedItem",void 0),pt([ge()],ht.prototype,"_dropTarget",void 0),pt([ge()],ht.prototype,"_selectedLayoutModuleIndex",void 0),pt([ge()],ht.prototype,"_showLayoutChildSettings",void 0),pt([ge()],ht.prototype,"_selectedLayoutChild",void 0),pt([ge()],ht.prototype,"_collapsedRows",void 0),pt([ge()],ht.prototype,"_collapsedColumns",void 0),ht=pt([ce("ultra-layout-tab")],ht);var vt=function(e,t,o,i){var n,a=arguments.length,r=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,i);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(r=(a<3?n(r):a>3?n(t,o,r):n(t,o))||r);return a>3&&r&&Object.defineProperty(t,o,r),r};let bt=class extends se{constructor(){super(...arguments),this._activeTab="layout"}setConfig(e){this.config=e||{type:"custom:ultra-card",layout:{rows:[]}}}connectedCallback(){super.connectedCallback(),this.addEventListener("config-changed",this._handleConfigChanged)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("config-changed",this._handleConfigChanged)}_handleConfigChanged(e){if(e.stopPropagation(),e.detail&&e.detail.config&&(this.config=e.detail.config,!e.detail.isInternal)){const t=new CustomEvent("config-changed",{detail:{config:e.detail.config,isInternal:!0},bubbles:!0,composed:!0});this.dispatchEvent(t)}}_updateConfig(e){const t=Object.assign(Object.assign({},this.config),e);this._configDebounceTimeout&&clearTimeout(this._configDebounceTimeout),this._configDebounceTimeout=window.setTimeout((()=>{const e=it.validateAndCorrectConfig(t);if(!e.valid){console.error("❌ Ultra Card Editor: Config validation failed",{errors:e.errors,warnings:e.warnings});const o=new CustomEvent("config-changed",{detail:{config:t,isInternal:!0},bubbles:!0,composed:!0});return void this.dispatchEvent(o)}const o=it.validateUniqueModuleIds(e.correctedConfig);let i=e.correctedConfig;o.valid||(console.warn("⚠️  Ultra Card Editor: Duplicate module IDs detected, fixing...",{duplicates:o.duplicates}),i=it.fixDuplicateModuleIds(i)),e.warnings.length>0&&console.info("ℹ️  Ultra Card: Config corrected with warnings",{warnings:e.warnings.length});const n=new CustomEvent("config-changed",{detail:{config:i,isInternal:!0},bubbles:!0,composed:!0});this.dispatchEvent(n)}),100)}render(){return this.hass&&this.config?V`
      <div class="card-config">
        <div class="tabs">
          <button
            class="tab ${"layout"===this._activeTab?"active":""}"
            @click=${()=>this._activeTab="layout"}
          >
            Layout Builder
          </button>
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
        </div>

        <div class="tab-content">
          ${"layout"===this._activeTab?V`<ultra-layout-tab .hass=${this.hass} .config=${this.config}></ultra-layout-tab>`:"settings"===this._activeTab?this._renderSettingsTab():V`<ultra-about-tab .hass=${this.hass}></ultra-about-tab>`}
        </div>
      </div>
    `:V`<div>Loading...</div>`}_renderSettingsTab(){const e="var(--card-background-color)";return V`
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
                  .value=${this.config.card_background||e}
                  .defaultValue=${e}
                  .hass=${this.hass}
                  @value-changed=${e=>this._updateConfig({card_background:e.detail.value})}
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
                    @change=${e=>this._updateConfig({card_border_radius:Number(e.target.value)})}
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
                    @change=${e=>this._updateConfig({card_padding:Number(e.target.value)})}
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
                    @change=${e=>this._updateConfig({card_margin:Number(e.target.value)})}
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
      .card-config {
        padding: 16px;
        max-width: 100%;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
      }

      /* Mobile responsive adjustments */
      @media (max-width: 768px) {
        .card-config {
          padding: 8px;
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

      .tab-content {
        min-height: 400px;
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
    `}};vt([me({attribute:!1})],bt.prototype,"hass",void 0),vt([me({attribute:!1})],bt.prototype,"config",void 0),vt([ge()],bt.prototype,"_activeTab",void 0),vt([ge()],bt.prototype,"_configDebounceTimeout",void 0),bt=vt([ce("ultra-card-editor")],bt);var ft=function(e,t,o,i){var n,a=arguments.length,r=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,i);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(r=(a<3?n(r):a>3?n(t,o,r):n(t,o))||r);return a>3&&r&&Object.defineProperty(t,o,r),r};let yt=class extends se{constructor(){super(...arguments),this._moduleVisibilityState=new Map,this._animatingModules=new Set,this._lastHassChangeTime=0}willUpdate(e){if(e.has("config")){const t=e.get("config"),o=this.config;t&&JSON.stringify(t.layout)===JSON.stringify(null==o?void 0:o.layout)||(this._moduleVisibilityState.clear(),this._animatingModules.clear()),this.requestUpdate()}if(e.has("hass")){const e=Date.now();e-this._lastHassChangeTime>100&&(this._lastHassChangeTime=e,this.hass&&tt.setHass(this.hass),this.requestUpdate())}}setConfig(e){if(!e)throw new Error("Invalid configuration");const t=it.validateAndCorrectConfig(e);if(!t.valid)throw console.error("❌ Ultra Card: Config validation failed",{errors:t.errors,warnings:t.warnings}),new Error(`Invalid configuration: ${t.errors.join(", ")}`);const o=it.validateUniqueModuleIds(t.correctedConfig);let i=t.correctedConfig;o.valid||(console.warn("⚠️  Ultra Card: Duplicate module IDs detected, fixing...",{duplicates:o.duplicates}),i=it.fixDuplicateModuleIds(i)),t.warnings.length>0&&console.info("ℹ️  Ultra Card: Config corrected with warnings",{warnings:t.warnings,totalModules:this._countTotalModules(i)}),this.config=Object.assign({},i),this.requestUpdate()}static getConfigElement(){return document.createElement("ultra-card-editor")}static getStubConfig(){return{type:"custom:ultra-card",layout:{rows:[{id:"row1",columns:[{id:"col1",modules:[{type:"text",text:"Welcome to Ultra Card",font_size:24,color:"#2196f3",alignment:"center"}]}]}]}}}render(){if(!this.config||!this.hass)return V`<div>Loading...</div>`;const e=this._getCardStyle();return this.config.layout&&this.config.layout.rows&&0!==this.config.layout.rows.length?V`
      <div class="card-container" style="${e}">
        ${this.config.layout.rows.map((e=>this._renderRow(e)))}
      </div>
    `:V`
        <div class="card-container" style="${e}">
          <div class="welcome-text">
            <h2>Ultra Card</h2>
            <p>Modular card builder for Home Assistant</p>
            <p>Configure using the visual editor</p>
          </div>
        </div>
      `}_getCardStyle(){if(!this.config)return"";const e=[];return this.config.card_background&&e.push(`background: ${this.config.card_background}`),void 0!==this.config.card_border_radius&&e.push(`border-radius: ${this.config.card_border_radius}px`),void 0!==this.config.card_padding&&e.push(`padding: ${this.config.card_padding}px`),void 0!==this.config.card_margin&&e.push(`margin: ${this.config.card_margin}px`),e.join("; ")}_renderRow(e){var t,o,i,n,a,r,l;this.hass&&tt.setHass(this.hass);const s=tt.evaluateRowVisibility(e),d=e,c=tt.evaluateLogicProperties({logic_entity:null===(t=d.design)||void 0===t?void 0:t.logic_entity,logic_attribute:null===(o=d.design)||void 0===o?void 0:o.logic_attribute,logic_operator:null===(i=d.design)||void 0===i?void 0:i.logic_operator,logic_value:null===(n=d.design)||void 0===n?void 0:n.logic_value});if(!s||!c)return V``;const p=this._getStateBasedAnimationClass(e.design),u=this._generateRowStyles(e),m=V`
      <div class="card-row" style=${u}>
        ${e.columns.map((e=>this._renderColumn(e)))}
      </div>
    `;if(p){const t=(null===(a=e.design)||void 0===a?void 0:a.animation_duration)||"2s",o=(null===(r=e.design)||void 0===r?void 0:r.animation_delay)||"0s",i=(null===(l=e.design)||void 0===l?void 0:l.animation_timing)||"ease";return V`
        <div
          class="row-animation-wrapper ${p}"
          style="
            --animation-duration: ${t};
            --animation-delay: ${o};
            --animation-timing: ${i};
          "
        >
          ${m}
        </div>
      `}return m}_renderColumn(e){var t,o,i,n,a,r,l;const s=tt.evaluateColumnVisibility(e),d=e,c=tt.evaluateLogicProperties({logic_entity:null===(t=d.design)||void 0===t?void 0:t.logic_entity,logic_attribute:null===(o=d.design)||void 0===o?void 0:o.logic_attribute,logic_operator:null===(i=d.design)||void 0===i?void 0:i.logic_operator,logic_value:null===(n=d.design)||void 0===n?void 0:n.logic_value});if(!s||!c)return V``;const p=this._getStateBasedAnimationClass(e.design),u=this._generateColumnStyles(e),m=V`
      <div class="card-column" style=${u}>
        ${e.modules.map((e=>this._renderModule(e)))}
      </div>
    `;if(p){const t=(null===(a=e.design)||void 0===a?void 0:a.animation_duration)||"2s",o=(null===(r=e.design)||void 0===r?void 0:r.animation_delay)||"0s",i=(null===(l=e.design)||void 0===l?void 0:l.animation_timing)||"ease";return V`
        <div
          class="column-animation-wrapper ${p}"
          style="
            --animation-duration: ${t};
            --animation-delay: ${o};
            --animation-timing: ${i};
          "
        >
          ${m}
        </div>
      `}return m}_renderModule(e){var t,o,i,n,a,r,l,s,d,c,p,u,m,g;const h=tt.evaluateModuleVisibility(e),v=e,b=tt.evaluateLogicProperties({logic_entity:null===(t=v.design)||void 0===t?void 0:t.logic_entity,logic_attribute:null===(o=v.design)||void 0===o?void 0:o.logic_attribute,logic_operator:null===(i=v.design)||void 0===i?void 0:i.logic_operator,logic_value:null===(n=v.design)||void 0===n?void 0:n.logic_value}),f=h&&b,y=e.id||`${e.type}-${Math.random()}`,_=this._moduleVisibilityState.get(y),x=this._animatingModules.has(y),w=v.intro_animation||(null===(a=v.design)||void 0===a?void 0:a.intro_animation)||"none",$=v.outro_animation||(null===(r=v.design)||void 0===r?void 0:r.outro_animation)||"none",k=v.animation_duration||(null===(l=v.design)||void 0===l?void 0:l.animation_duration)||"2s",C=v.animation_delay||(null===(s=v.design)||void 0===s?void 0:s.animation_delay)||"0s",S=v.animation_timing||(null===(d=v.design)||void 0===d?void 0:d.animation_timing)||"ease",I=v.animation_type||(null===(c=v.design)||void 0===c?void 0:c.animation_type),z=v.animation_entity||(null===(p=v.design)||void 0===p?void 0:p.animation_entity),T=v.animation_trigger_type||(null===(u=v.design)||void 0===u?void 0:u.animation_trigger_type)||"state",P=v.animation_attribute||(null===(m=v.design)||void 0===m?void 0:m.animation_attribute),A=v.animation_state||(null===(g=v.design)||void 0===g?void 0:g.animation_state);let L=!1;if(I&&"none"!==I)if(z){if(A&&this.hass){const e=this.hass.states[z];if(e)if("attribute"===T&&P){const t=e.attributes[P];L=String(t)===A}else L=e.state===A}}else L=!0;let O="",M=!1;if(L&&"none"!==I?O=`animation-${I}`:void 0!==_&&_!==f?f&&"none"!==w?x?O=`animation-${w}`:(O=`animation-${w}`,M=!0,this._animatingModules.add(y),setTimeout((()=>{this._animatingModules.delete(y),this.requestUpdate()}),this._parseAnimationDuration(k)+this._parseAnimationDuration(C))):f||"none"===$||(x?O=`animation-${$}`:(O=`animation-${$}`,M=!0,this._animatingModules.add(y),setTimeout((()=>{this._animatingModules.delete(y),this.requestUpdate()}),this._parseAnimationDuration(k)+this._parseAnimationDuration(C)))):x&&(f&&"none"!==w?O=`animation-${w}`:f||"none"===$||(O=`animation-${$}`)),this._moduleVisibilityState.set(y,f),!f&&!x&&!M)return V``;const D=Ze().getModule(e.type);let E;return E=D&&this.hass?D.renderPreview(e,this.hass):V`
        <div class="unknown-module">
          <span>Unknown Module: ${e.type}</span>
        </div>
      `,O||"none"!==w||"none"!==$||L?V`
        <div
          class="module-animation-wrapper ${O}"
          style="
            --animation-duration: ${k};
            --animation-delay: ${C};
            --animation-timing: ${S};
          "
        >
          ${E}
        </div>
      `:E}_parseAnimationDuration(e){const t=e.match(/^(\d*\.?\d+)(s|ms)?$/);if(!t)return 300;const o=parseFloat(t[1]),i=t[2];return i?"s"===i?1e3*o:o:1e3*o}_getStateBasedAnimationClass(e){if(!e)return"";const t=e.animation_type,o=e.animation_entity,i=e.animation_trigger_type||"state",n=e.animation_attribute,a=e.animation_state;if(!t||"none"===t)return"";if(!o)return`animation-${t}`;if(!a||!this.hass)return"";const r=this.hass.states[o];if(!r)return"";let l=!1;if("attribute"===i&&n){const e=r.attributes[n];l=String(e)===a}else l=r.state===a;return l?`animation-${t}`:""}_countTotalModules(e){return e.layout&&e.layout.rows?e.layout.rows.reduce(((e,t)=>e+t.columns.reduce(((e,t)=>e+t.modules.length),0)),0):0}_getGridTemplateColumns(e,t){return{"1-col":"1fr","1-2-1-2":"1fr 1fr","1-3-2-3":"1fr 2fr","2-3-1-3":"2fr 1fr","2-5-3-5":"2fr 3fr","3-5-2-5":"3fr 2fr","1-3-1-3-1-3":"1fr 1fr 1fr","1-4-1-2-1-4":"1fr 2fr 1fr","1-5-3-5-1-5":"1fr 3fr 1fr","1-6-2-3-1-6":"1fr 4fr 1fr","1-4-1-4-1-4-1-4":"1fr 1fr 1fr 1fr","1-5-1-5-1-5-1-5":"1fr 1fr 1fr 1fr","1-6-1-6-1-6-1-6":"1fr 1fr 1fr 1fr","1-8-1-4-1-4-1-8":"1fr 2fr 2fr 1fr","1-5-1-5-1-5-1-5-1-5":"1fr 1fr 1fr 1fr 1fr","1-6-1-6-1-3-1-6-1-6":"1fr 1fr 2fr 1fr 1fr","1-8-1-4-1-4-1-4-1-8":"1fr 2fr 2fr 2fr 1fr","1-6-1-6-1-6-1-6-1-6-1-6":"1fr 1fr 1fr 1fr 1fr 1fr","50-50":"1fr 1fr","30-70":"3fr 7fr","70-30":"7fr 3fr","40-60":"4fr 6fr","60-40":"6fr 4fr","33-33-33":"1fr 1fr 1fr","25-50-25":"1fr 2fr 1fr","20-60-20":"1fr 3fr 1fr","25-25-25-25":"1fr 1fr 1fr 1fr"}[e]||`repeat(${t}, 1fr)`}_addPixelUnit(e){return e?/^\d+$/.test(e)?`${e}px`:/^[\d\s]+$/.test(e)?e.split(" ").map((e=>e.trim()?`${e}px`:e)).join(" "):e:e}_generateRowStyles(e){const t=e.design||{},o={display:"grid",gridTemplateColumns:this._getGridTemplateColumns(e.column_layout||"1-col",e.columns.length),gap:`${e.gap||16}px`,marginBottom:"16px"},i={padding:t.padding_top||t.padding_bottom||t.padding_left||t.padding_right?`${t.padding_top||"0"} ${t.padding_right||"0"} ${t.padding_bottom||"0"} ${t.padding_left||"0"}`:e.padding?`${e.padding}px`:void 0,margin:t.margin_top||t.margin_bottom||t.margin_left||t.margin_right?`${t.margin_top||"0"} ${t.margin_right||"0"} ${t.margin_bottom||"16px"} ${t.margin_left||"0"}`:e.margin?`${e.margin}px`:void 0,background:t.background_color||e.background_color||"transparent",border:t.border_style&&"none"!==t.border_style?`${t.border_width||"1px"} ${t.border_style} ${t.border_color||"var(--divider-color)"}`:"none",borderRadius:this._addPixelUnit(t.border_radius)||(e.border_radius?`${e.border_radius}px`:"0"),position:t.position||"relative",top:t.top||"auto",bottom:t.bottom||"auto",left:t.left||"auto",right:t.right||"auto",zIndex:t.z_index||"auto",width:t.width||"100%",height:t.height||"auto",maxWidth:t.max_width||"none",maxHeight:t.max_height||"none",minWidth:t.min_width||"none",minHeight:t.min_height||"auto",overflow:t.overflow||"visible",clipPath:t.clip_path||"none",backdropFilter:t.backdrop_filter||"none",boxShadow:t.box_shadow_h&&t.box_shadow_v?`${t.box_shadow_h||"0"} ${t.box_shadow_v||"0"} ${t.box_shadow_blur||"0"} ${t.box_shadow_spread||"0"} ${t.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"},n=Object.assign(Object.assign({},o),i),a=Object.fromEntries(Object.entries(n).filter((([e,t])=>void 0!==t)));return this._styleObjectToCss(a)}_generateColumnStyles(e){const t=e.design||{},o={display:"flex",flexDirection:"column",gap:"8px",alignItems:"left"===e.horizontal_alignment?"flex-start":"right"===e.horizontal_alignment?"flex-end":"stretch"===e.horizontal_alignment?"stretch":"center",justifyContent:"top"===e.vertical_alignment?"flex-start":"bottom"===e.vertical_alignment?"flex-end":"stretch"===e.vertical_alignment?"stretch":"center"},i={padding:t.padding_top||t.padding_bottom||t.padding_left||t.padding_right?`${t.padding_top||"0"} ${t.padding_right||"0"} ${t.padding_bottom||"0"} ${t.padding_left||"0"}`:e.padding?`${e.padding}px`:void 0,margin:t.margin_top||t.margin_bottom||t.margin_left||t.margin_right?`${t.margin_top||"0"} ${t.margin_right||"0"} ${t.margin_bottom||"0"} ${t.margin_left||"0"}`:e.margin?`${e.margin}px`:void 0,background:t.background_color||e.background_color||"transparent",border:t.border_style&&"none"!==t.border_style?`${t.border_width||"1px"} ${t.border_style} ${t.border_color||"var(--divider-color)"}`:"none",borderRadius:this._addPixelUnit(t.border_radius)||(e.border_radius?`${e.border_radius}px`:"0"),position:t.position||"relative",top:t.top||"auto",bottom:t.bottom||"auto",left:t.left||"auto",right:t.right||"auto",zIndex:t.z_index||"auto",width:t.width||"100%",height:t.height||"auto",maxWidth:t.max_width||"none",maxHeight:t.max_height||"none",minWidth:t.min_width||"none",minHeight:t.min_height||"auto",overflow:t.overflow||"visible",clipPath:t.clip_path||"none",backdropFilter:t.backdrop_filter||"none",boxShadow:t.box_shadow_h&&t.box_shadow_v?`${t.box_shadow_h||"0"} ${t.box_shadow_v||"0"} ${t.box_shadow_blur||"0"} ${t.box_shadow_spread||"0"} ${t.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"},n=Object.assign(Object.assign({},o),i),a=Object.fromEntries(Object.entries(n).filter((([e,t])=>void 0!==t)));return this._styleObjectToCss(a)}_styleObjectToCss(e){return Object.entries(e).map((([e,t])=>`${e.replace(/[A-Z]/g,(e=>`-${e.toLowerCase()}`))}: ${t}`)).join("; ")}static get styles(){return a`
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
    `}};ft([me({attribute:!1})],yt.prototype,"hass",void 0),ft([me({attribute:!1,type:Object})],yt.prototype,"config",void 0),ft([ge()],yt.prototype,"_moduleVisibilityState",void 0),ft([ge()],yt.prototype,"_animatingModules",void 0),yt=ft([ce("ultra-card")],yt),setTimeout((()=>{if(!customElements.get("ultra-card")){console.warn("🔧 Ultra Card element not found, attempting manual registration...");try{customElements.define("ultra-card",yt),console.log("✅ Ultra Card manually registered successfully")}catch(e){console.error("❌ Failed to manually register Ultra Card:",e)}}}),0);var _t=function(e,t,o,i){var n,a=arguments.length,r=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,i);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(r=(a<3?n(r):a>3?n(t,o,r):n(t,o))||r);return a>3&&r&&Object.defineProperty(t,o,r),r};let xt=class extends se{constructor(){super(...arguments),this.value="",this.label="Navigation Target",this.disabled=!1}_valueChanged(e){const t=e.detail.value;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t},bubbles:!0,composed:!0}))}render(){return V`
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
    `}};xt.styles=a`
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
  `,_t([me({attribute:!1})],xt.prototype,"hass",void 0),_t([me()],xt.prototype,"value",void 0),_t([me()],xt.prototype,"label",void 0),_t([me()],xt.prototype,"helper",void 0),_t([me({type:Boolean})],xt.prototype,"disabled",void 0),xt=_t([ce("ultra-navigation-picker")],xt);const wt="1.0.0-alpha2",$t=Ze();console.log(`🚀 Ultra Card v${wt} loaded with ${$t.getRegistryStats().totalModules} modules`),window.customCards=window.customCards||[],window.customCards.push({type:"ultra-card",name:"Ultra Card",description:"A modular card system for Home Assistant with dynamic layouts and powerful customization options.",preview:!0,documentationURL:"https://github.com/WJDDesigns/Ultra-Card",version:wt}),console.log("✅ Ultra Card registered with Home Assistant card picker")})();