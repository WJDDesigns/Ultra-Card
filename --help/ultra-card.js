/*! For license information please see ultra-card.js.LICENSE.txt */
(()=>{"use strict";const e=globalThis,t=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),i=new WeakMap;class r{constructor(e,t,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const o=this.t;if(t&&void 0===e){const t=void 0!==o&&1===o.length;t&&(e=i.get(o)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&i.set(o,e))}return e}toString(){return this.cssText}}const a=(e,...t)=>{const i=1===e.length?e[0]:t.reduce(((t,o,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+e[i+1]),e[0]);return new r(i,e,o)},s=(o,i)=>{if(t)o.adoptedStyleSheets=i.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet));else for(const t of i){const i=document.createElement("style"),r=e.litNonce;void 0!==r&&i.setAttribute("nonce",r),i.textContent=t.cssText,o.appendChild(i)}},n=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const o of e.cssRules)t+=o.cssText;return(e=>new r("string"==typeof e?e:e+"",void 0,o))(t)})(e):e,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:p,getOwnPropertySymbols:u,getPrototypeOf:h}=Object,g=globalThis,b=g.trustedTypes,v=b?b.emptyScript:"",m=g.reactiveElementPolyfillSupport,f=(e,t)=>e,y={toAttribute(e,t){switch(t){case Boolean:e=e?v:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let o=e;switch(t){case Boolean:o=null!==e;break;case Number:o=null===e?null:Number(e);break;case Object:case Array:try{o=JSON.parse(e)}catch(e){o=null}}return o}},x=(e,t)=>!l(e,t),_={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:x};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;class $ extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=_){if(t.state&&(t.attribute=!1),this._$Ei(),this.elementProperties.set(e,t),!t.noAccessor){const o=Symbol(),i=this.getPropertyDescriptor(e,o,t);void 0!==i&&d(this.prototype,e,i)}}static getPropertyDescriptor(e,t,o){const{get:i,set:r}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get(){return i?.call(this)},set(t){const a=i?.call(this);r.call(this,t),this.requestUpdate(e,a,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??_}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const e=h(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const e=this.properties,t=[...p(e),...u(e)];for(const o of t)this.createProperty(o,e[o])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,o]of t)this.elementProperties.set(e,o)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const o=this._$Eu(e,t);void 0!==o&&this._$Eh.set(o,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const o=new Set(e.flat(1/0).reverse());for(const e of o)t.unshift(n(e))}else void 0!==e&&t.push(n(e));return t}static _$Eu(e,t){const o=t.attribute;return!1===o?void 0:"string"==typeof o?o:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((e=>e(this)))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const o of t.keys())this.hasOwnProperty(o)&&(e.set(o,this[o]),delete this[o]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((e=>e.hostConnected?.()))}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach((e=>e.hostDisconnected?.()))}attributeChangedCallback(e,t,o){this._$AK(e,o)}_$EC(e,t){const o=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,o);if(void 0!==i&&!0===o.reflect){const r=(void 0!==o.converter?.toAttribute?o.converter:y).toAttribute(t,o.type);this._$Em=e,null==r?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(e,t){const o=this.constructor,i=o._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=o.getPropertyOptions(i),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:y;this._$Em=i,this[i]=r.fromAttribute(t,e.type),this._$Em=null}}requestUpdate(e,t,o){if(void 0!==e){if(o??=this.constructor.getPropertyOptions(e),!(o.hasChanged??x)(this[e],t))return;this.P(e,t,o)}!1===this.isUpdatePending&&(this._$ES=this._$ET())}P(e,t,o){this._$AL.has(e)||this._$AL.set(e,t),!0===o.reflect&&this._$Em!==e&&(this._$Ej??=new Set).add(e)}async _$ET(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,o]of e)!0!==o.wrapped||this._$AL.has(t)||void 0===this[t]||this.P(t,this[t],o)}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach((e=>e.hostUpdate?.())),this.update(t)):this._$EU()}catch(t){throw e=!1,this._$EU(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach((e=>e.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Ej&&=this._$Ej.forEach((e=>this._$EC(e,this[e]))),this._$EU()}updated(e){}firstUpdated(e){}}$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[f("elementProperties")]=new Map,$[f("finalized")]=new Map,m?.({ReactiveElement:$}),(g.reactiveElementVersions??=[]).push("2.0.4");const w=globalThis,k=w.trustedTypes,C=k?k.createPolicy("lit-html",{createHTML:e=>e}):void 0,S="$lit$",A=`lit$${Math.random().toFixed(9).slice(2)}$`,M="?"+A,E=`<${M}>`,T=document,P=()=>T.createComment(""),O=e=>null===e||"object"!=typeof e&&"function"!=typeof e,R=Array.isArray,j="[ \t\n\f\r]",D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,U=/-->/g,N=/>/g,z=RegExp(`>|${j}(?:([^\\s"'>=/]+)(${j}*=${j}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),I=/'/g,H=/"/g,L=/^(?:script|style|textarea|title)$/i,B=e=>(t,...o)=>({_$litType$:e,strings:t,values:o}),F=B(1),G=(B(2),B(3),Symbol.for("lit-noChange")),V=Symbol.for("lit-nothing"),W=new WeakMap,q=T.createTreeWalker(T,129);function J(e,t){if(!R(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==C?C.createHTML(t):t}const K=(e,t)=>{const o=e.length-1,i=[];let r,a=2===t?"<svg>":3===t?"<math>":"",s=D;for(let t=0;t<o;t++){const o=e[t];let n,l,d=-1,c=0;for(;c<o.length&&(s.lastIndex=c,l=s.exec(o),null!==l);)c=s.lastIndex,s===D?"!--"===l[1]?s=U:void 0!==l[1]?s=N:void 0!==l[2]?(L.test(l[2])&&(r=RegExp("</"+l[2],"g")),s=z):void 0!==l[3]&&(s=z):s===z?">"===l[0]?(s=r??D,d=-1):void 0===l[1]?d=-2:(d=s.lastIndex-l[2].length,n=l[1],s=void 0===l[3]?z:'"'===l[3]?H:I):s===H||s===I?s=z:s===U||s===N?s=D:(s=z,r=void 0);const p=s===z&&e[t+1].startsWith("/>")?" ":"";a+=s===D?o+E:d>=0?(i.push(n),o.slice(0,d)+S+o.slice(d)+A+p):o+A+(-2===d?t:p)}return[J(e,a+(e[o]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]};class Z{constructor({strings:e,_$litType$:t},o){let i;this.parts=[];let r=0,a=0;const s=e.length-1,n=this.parts,[l,d]=K(e,t);if(this.el=Z.createElement(l,o),q.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=q.nextNode())&&n.length<s;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(S)){const t=d[a++],o=i.getAttribute(e).split(A),s=/([.?@])?(.*)/.exec(t);n.push({type:1,index:r,name:s[2],strings:o,ctor:"."===s[1]?te:"?"===s[1]?oe:"@"===s[1]?ie:ee}),i.removeAttribute(e)}else e.startsWith(A)&&(n.push({type:6,index:r}),i.removeAttribute(e));if(L.test(i.tagName)){const e=i.textContent.split(A),t=e.length-1;if(t>0){i.textContent=k?k.emptyScript:"";for(let o=0;o<t;o++)i.append(e[o],P()),q.nextNode(),n.push({type:2,index:++r});i.append(e[t],P())}}}else if(8===i.nodeType)if(i.data===M)n.push({type:2,index:r});else{let e=-1;for(;-1!==(e=i.data.indexOf(A,e+1));)n.push({type:7,index:r}),e+=A.length-1}r++}}static createElement(e,t){const o=T.createElement("template");return o.innerHTML=e,o}}function Y(e,t,o=e,i){if(t===G)return t;let r=void 0!==i?o._$Co?.[i]:o._$Cl;const a=O(t)?void 0:t._$litDirective$;return r?.constructor!==a&&(r?._$AO?.(!1),void 0===a?r=void 0:(r=new a(e),r._$AT(e,o,i)),void 0!==i?(o._$Co??=[])[i]=r:o._$Cl=r),void 0!==r&&(t=Y(e,r._$AS(e,t.values),r,i)),t}class Q{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:o}=this._$AD,i=(e?.creationScope??T).importNode(t,!0);q.currentNode=i;let r=q.nextNode(),a=0,s=0,n=o[0];for(;void 0!==n;){if(a===n.index){let t;2===n.type?t=new X(r,r.nextSibling,this,e):1===n.type?t=new n.ctor(r,n.name,n.strings,this,e):6===n.type&&(t=new re(r,this,e)),this._$AV.push(t),n=o[++s]}a!==n?.index&&(r=q.nextNode(),a++)}return q.currentNode=T,i}p(e){let t=0;for(const o of this._$AV)void 0!==o&&(void 0!==o.strings?(o._$AI(e,o,t),t+=o.strings.length-2):o._$AI(e[t])),t++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,o,i){this.type=2,this._$AH=V,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=o,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Y(this,e,t),O(e)?e===V||null==e||""===e?(this._$AH!==V&&this._$AR(),this._$AH=V):e!==this._$AH&&e!==G&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>R(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==V&&O(this._$AH)?this._$AA.nextSibling.data=e:this.T(T.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:o}=e,i="number"==typeof o?this._$AC(e):(void 0===o.el&&(o.el=Z.createElement(J(o.h,o.h[0]),this.options)),o);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new Q(i,this),o=e.u(this.options);e.p(t),this.T(o),this._$AH=e}}_$AC(e){let t=W.get(e.strings);return void 0===t&&W.set(e.strings,t=new Z(e)),t}k(e){R(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let o,i=0;for(const r of e)i===t.length?t.push(o=new X(this.O(P()),this.O(P()),this,this.options)):o=t[i],o._$AI(r),i++;i<t.length&&(this._$AR(o&&o._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e&&e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ee{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,o,i,r){this.type=1,this._$AH=V,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=r,o.length>2||""!==o[0]||""!==o[1]?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=V}_$AI(e,t=this,o,i){const r=this.strings;let a=!1;if(void 0===r)e=Y(this,e,t,0),a=!O(e)||e!==this._$AH&&e!==G,a&&(this._$AH=e);else{const i=e;let s,n;for(e=r[0],s=0;s<r.length-1;s++)n=Y(this,i[o+s],t,s),n===G&&(n=this._$AH[s]),a||=!O(n)||n!==this._$AH[s],n===V?e=V:e!==V&&(e+=(n??"")+r[s+1]),this._$AH[s]=n}a&&!i&&this.j(e)}j(e){e===V?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===V?void 0:e}}class oe extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==V)}}class ie extends ee{constructor(e,t,o,i,r){super(e,t,o,i,r),this.type=5}_$AI(e,t=this){if((e=Y(this,e,t,0)??V)===G)return;const o=this._$AH,i=e===V&&o!==V||e.capture!==o.capture||e.once!==o.once||e.passive!==o.passive,r=e!==V&&(o===V||i);i&&this.element.removeEventListener(this.name,this,o),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class re{constructor(e,t,o){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(e){Y(this,e)}}const ae=w.litHtmlPolyfillSupport;ae?.(Z,X),(w.litHtmlVersions??=[]).push("3.2.1");class se extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,o)=>{const i=o?.renderBefore??t;let r=i._$litPart$;if(void 0===r){const e=o?.renderBefore??null;i._$litPart$=r=new X(t.insertBefore(P(),e),e,void 0,o??{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}}se._$litElement$=!0,se.finalized=!0,globalThis.litElementHydrateSupport?.({LitElement:se});const ne=globalThis.litElementPolyfillSupport;ne?.({LitElement:se}),(globalThis.litElementVersions??=[]).push("4.1.1");const le=e=>(t,o)=>{void 0!==o?o.addInitializer((()=>{customElements.define(e,t)})):customElements.define(e,t)},de={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:x},ce=(e=de,t,o)=>{const{kind:i,metadata:r}=o;let a=globalThis.litPropertyMetadata.get(r);if(void 0===a&&globalThis.litPropertyMetadata.set(r,a=new Map),a.set(o.name,e),"accessor"===i){const{name:i}=o;return{set(o){const r=t.get.call(this);t.set.call(this,o),this.requestUpdate(i,r,e)},init(t){return void 0!==t&&this.P(i,void 0,e),t}}}if("setter"===i){const{name:i}=o;return function(o){const r=this[i];t.call(this,o),this.requestUpdate(i,r,e)}}throw Error("Unsupported decorator location: "+i)};function pe(e){return(t,o)=>"object"==typeof o?ce(e,t,o):((e,t,o)=>{const i=t.hasOwnProperty(o);return t.constructor.createProperty(o,i?{...e,wrapped:!0}:e),i?Object.getOwnPropertyDescriptor(t,o):void 0})(e,t,o)}function ue(e){return pe({...e,state:!0,attribute:!1})}var he=function(e,t,o,i){var r,a=arguments.length,s=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,i);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,o,s):r(t,o))||s);return a>3&&s&&Object.defineProperty(t,o,s),s};let ge=class extends se{setConfig(e){if(!e)throw new Error("Invalid configuration");this.config=Object.assign({},e)}render(){return this.config&&this.hass?F`
      <div class="card-container">
        <div class="welcome-text">
          <h2>Ultra Card</h2>
          <p>Modular card builder for Home Assistant</p>
          <p>Configure using the visual editor</p>
        </div>
      </div>
    `:F`<div>Loading...</div>`}static get styles(){return a`
      :host {
        display: block;
      }

      .card-container {
        background: var(--ha-card-background, white);
        border-radius: var(--ha-card-border-radius, 8px);
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1));
        padding: 24px;
        text-align: center;
      }

      .welcome-text h2 {
        margin: 0 0 16px 0;
        color: var(--primary-text-color);
      }

      .welcome-text p {
        margin: 8px 0;
        color: var(--secondary-text-color);
      }
    `}};he([pe({attribute:!1})],ge.prototype,"hass",void 0),he([pe({attribute:!1})],ge.prototype,"config",void 0),ge=he([le("ultra-card")],ge);var be=function(e,t,o,i){var r,a=arguments.length,s=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,i);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,o,s):r(t,o))||s);return a>3&&s&&Object.defineProperty(t,o,s),s};let ve=class extends se{render(){return F`
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
    `}};ve.styles=a`
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
  `,be([pe({attribute:!1})],ve.prototype,"hass",void 0),ve=be([le("about-tab")],ve);var me=function(e,t,o,i){var r,a=arguments.length,s=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,i);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,o,s):r(t,o))||s);return a>3&&s&&Object.defineProperty(t,o,s),s};let fe=class extends se{constructor(){super(...arguments),this.showResetButton=!0}_getDisplayColor(e){var t;let o="string"==typeof e?e:void 0;if("object"==typeof e&&null!==e){const t=Object.keys(e);1===t.length&&"string"==typeof e[t[0]]?(o=e[t[0]],console.warn("ColorPicker received object, extracting value:",o)):(console.warn("ColorPicker received unexpected object:",e),o=void 0)}if(!o)return"#CCCCCC";if(o.startsWith("var(--"))try{const e=document.createElement("div");e.style.display="none",e.style.color=o,document.body.appendChild(e);const t=getComputedStyle(e).color;if(document.body.removeChild(e),t&&t.startsWith("rgb")){const e=t.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);if(e){const[t,o,i,r]=e;return this._rgbToHex(parseInt(o),parseInt(i),parseInt(r))}}return t||"#CCCCCC"}catch(e){console.warn("Error computing color from variable:",e);const i=null===(t=o.match(/var\(([^,)]+)/))||void 0===t?void 0:t[1];if(i){if(i.includes("--primary-text-color"))return"#FFFFFF";if(i.includes("--secondary-text-color"))return"#A0A0A0";if(i.includes("--primary-color"))return"#03A9F4";if(i.includes("--card-background-color"))return"#1C1C1C"}return"#CCCCCC"}return o}_rgbToHex(e,t,o){return"#"+[e,t,o].map((e=>{const t=e.toString(16);return 1===t.length?"0"+t:t})).join("")}_onColorChanged(e){let t=e.target.value;t||(t="#CCCCCC"),t!==this.value&&(this.value=t,this._fireChangeEvent())}_fireChangeEvent(){this.configValue?this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{[this.configValue]:this.value}},bubbles:!0,composed:!0})):this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.value},bubbles:!0,composed:!0}))}_resetColor(){this.configValue&&this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{[this.configValue]:void 0}},bubbles:!0,composed:!0}))}render(){const e=this._getDisplayColor(this.value);return F`
      ${this.label?F`<div class="color-picker-label">${this.label}</div>`:""}
      <div class="color-picker-row">
        <input
          type="color"
          .value=${e}
          @change=${this._onColorChanged}
          class="color-input"
          aria-label=${this.label||"Color picker"}
        />
        ${this.showResetButton?F`
              <ha-icon-button
                class="reset-button"
                @click=${this._resetColor}
                title="Reset to default color"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </ha-icon-button>
            `:""}
      </div>
    `}static get styles(){return a`
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .color-picker-label {
        font-weight: 500;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .color-picker-row {
        display: flex;
        align-items: center;
        width: 100%;
        height: 40px;
        gap: 8px;
      }

      .color-input {
        flex: 1;
        height: 40px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: none;
        cursor: pointer;
        padding: 0;
      }

      .reset-button {
        --mdc-icon-button-size: 36px;
        color: var(--secondary-text-color);
        opacity: 0.8;
        flex-shrink: 0;
      }

      .reset-button:hover {
        opacity: 1;
        color: var(--primary-color);
      }

      /* Special handling for Webkit browsers */
      .color-input::-webkit-color-swatch-wrapper {
        padding: 0;
      }

      .color-input::-webkit-color-swatch {
        border: none;
        border-radius: 4px;
      }
    `}};me([pe()],fe.prototype,"value",void 0),me([pe()],fe.prototype,"label",void 0),me([pe()],fe.prototype,"configValue",void 0),me([pe({type:Boolean})],fe.prototype,"showResetButton",void 0),fe=me([le("color-picker")],fe);var ye=function(e,t,o,i){var r,a=arguments.length,s=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,i);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,o,s):r(t,o))||s);return a>3&&s&&Object.defineProperty(t,o,s),s};const xe=[{value:"default",label:"– Default –",category:"default"}],_e=[{value:"Montserrat",label:"Montserrat (used as default font)",category:"typography"}],$e=[{value:"Georgia, serif",label:"Georgia, serif",category:"websafe"},{value:"Palatino Linotype, Book Antiqua, Palatino, serif",label:"Palatino Linotype, Book Antiqua, Palatino, serif",category:"websafe"},{value:"Times New Roman, Times, serif",label:"Times New Roman, Times, serif",category:"websafe"},{value:"Arial, Helvetica, sans-serif",label:"Arial, Helvetica, sans-serif",category:"websafe"},{value:"Impact, Charcoal, sans-serif",label:"Impact, Charcoal, sans-serif",category:"websafe"},{value:"Lucida Sans Unicode, Lucida Grande, sans-serif",label:"Lucida Sans Unicode, Lucida Grande, sans-serif",category:"websafe"},{value:"Tahoma, Geneva, sans-serif",label:"Tahoma, Geneva, sans-serif",category:"websafe"},{value:"Trebuchet MS, Helvetica, sans-serif",label:"Trebuchet MS, Helvetica, sans-serif",category:"websafe"},{value:"Verdana, Geneva, sans-serif",label:"Verdana, Geneva, sans-serif",category:"websafe"},{value:"Courier New, Courier, monospace",label:"Courier New, Courier, monospace",category:"websafe"},{value:"Lucida Console, Monaco, monospace",label:"Lucida Console, Monaco, monospace",category:"websafe"}];let we=class extends se{constructor(){super(...arguments),this._showModuleSelector=!1,this._selectedRowIndex=-1,this._selectedColumnIndex=-1,this._showModuleSettings=!1,this._selectedModule=null,this._activeModuleTab="general",this._activeDesignSubtab="text"}_configChanged(e){const t=new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0});this.dispatchEvent(t)}_updateConfig(e){const t=Object.assign(Object.assign({},this.config),e);this._configChanged(t)}_updateLayout(e){this._updateConfig({layout:e})}_addRow(){const e=this.config.layout||{rows:[]},t={id:`row-${Date.now()}`,columns:[{id:`col-${Date.now()}`,modules:[],vertical_alignment:"center",horizontal_alignment:"center"}],column_layout:"1-col"};e.rows.push(t),this._updateLayout(e)}_deleteRow(e){const t=this.config.layout||{rows:[]};t.rows.splice(e,1),this._updateLayout(t)}_openModuleSelector(e,t){this._selectedRowIndex=e,this._selectedColumnIndex=t,this._showModuleSelector=!0}_addModule(e){if(-1===this._selectedRowIndex||-1===this._selectedColumnIndex)return;const t=this.config.layout||{rows:[]},o=t.rows[this._selectedRowIndex].columns[this._selectedColumnIndex];let i;switch(e){case"text":i={id:`text-${Date.now()}`,type:"text",text:"Sample Text",font_size:16,font_family:"Roboto",color:"var(--primary-text-color)",alignment:"center"};break;case"separator":i={id:`separator-${Date.now()}`,type:"separator",separator_style:"line",thickness:1,color:"var(--divider-color)"};break;case"image":i={id:`image-${Date.now()}`,type:"image",image_type:"url",image:"",image_width:100};break;case"info":i={id:`info-${Date.now()}`,type:"info",info_entities:[{id:`entity-${Date.now()}`,entity:"",name:"Entity Name"}]};break;case"bar":i={id:`bar-${Date.now()}`,type:"bar",entity:"",name:"Progress"};break;case"icon":i={id:`icon-${Date.now()}`,type:"icon",icons:[{id:`icon-item-${Date.now()}`,entity:"",icon_inactive:"mdi:home",icon_active:"mdi:home-variant"}]};break;default:return}o.modules.push(i),this._updateLayout(t),this._showModuleSelector=!1}_openModuleSettings(e,t,o){this._selectedModule={rowIndex:e,columnIndex:t,moduleIndex:o},this._showModuleSettings=!0}_updateModule(e){if(!this._selectedModule)return;const t=this.config.layout||{rows:[]},o=t.rows[this._selectedModule.rowIndex].columns[this._selectedModule.columnIndex].modules[this._selectedModule.moduleIndex];Object.assign(o,e),this._updateLayout(t)}_loadGoogleFont(e){if(!e||"default"===e||$e.some((t=>t.value===e)))return;if(document.querySelector(`link[href*="${e.replace(/\s+/g,"+")}"]`))return;const t=document.createElement("link");t.rel="stylesheet",t.href=`https://fonts.googleapis.com/css2?family=${e.replace(/\s+/g,"+")}:wght@300;400;500;600;700&display=swap`,document.head.appendChild(t)}_renderModulePreview(){var e,t,o;if(!this._selectedModule)return F``;const{rowIndex:i,columnIndex:r,moduleIndex:a}=this._selectedModule,s=null===(o=null===(t=null===(e=this.config.layout)||void 0===e?void 0:e.rows[i])||void 0===t?void 0:t.columns[r])||void 0===o?void 0:o.modules[a];return s?F`
      <div class="module-preview">
        <div class="preview-header">Live Preview</div>
        <div class="preview-content">${this._renderSingleModule(s)}</div>
      </div>
    `:F``}_renderSingleModule(e){switch(e.type){case"text":const t=e;return F`
          <div
            class="text-module"
            style="
              font-size: ${t.font_size||16}px;
              font-family: ${t.font_family||"Roboto"};
              color: ${t.color||"var(--primary-text-color)"};
              text-align: ${t.alignment||"center"};
              font-weight: ${t.bold?"bold":"normal"};
              font-style: ${t.italic?"italic":"normal"};
              text-transform: ${t.uppercase?"uppercase":"none"};
              text-decoration: ${t.strikethrough?"line-through":"none"};
            "
          >
            ${t.text||"Sample Text"}
          </div>
        `;case"separator":const o=e;return F`
          <div
            class="separator-module"
            style="
            border-top: ${o.thickness||1}px ${"dotted"===o.separator_style?"dotted":"solid"} ${o.color||"var(--divider-color)"};
            width: 100%;
            margin: 8px 0;
          "
          ></div>
        `;case"image":const i=e;return F`
          <div class="image-module">
            ${i.image?F`<img
                  src="${i.image}"
                  style="max-width: ${i.image_width||100}px;"
                />`:F`<div class="image-placeholder">No Image</div>`}
          </div>
        `;default:return F`<div class="module-placeholder">${e.type} Module</div>`}}_renderModuleSettings(){var e,t,o;if(!this._selectedModule)return F``;const{rowIndex:i,columnIndex:r,moduleIndex:a}=this._selectedModule,s=null===(o=null===(t=null===(e=this.config.layout)||void 0===e?void 0:e.rows[i])||void 0===t?void 0:t.columns[r])||void 0===o?void 0:o.modules[a];return s?F`
      <div class="module-settings-popup">
        <div class="popup-overlay"></div>
        <div class="popup-content">
          <div class="popup-header">
            <h3>Module Settings - ${s.type.charAt(0).toUpperCase()+s.type.slice(1)}</h3>
            <button class="close-button" @click=${()=>this._showModuleSettings=!1}>
              ×
            </button>
          </div>

          ${this._renderModulePreview()}

          <div class="module-tabs">
            <button
              class="module-tab ${"general"===this._activeModuleTab?"active":""}"
              @click=${()=>this._activeModuleTab="general"}
            >
              General
            </button>
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
            ${"general"===this._activeModuleTab?this._renderGeneralTab(s):""}
            ${"logic"===this._activeModuleTab?this._renderLogicTab(s):""}
            ${"design"===this._activeModuleTab?this._renderDesignTab(s):""}
          </div>
        </div>
      </div>
    `:F``}_renderGeneralTab(e){switch(e.type){case"text":return F`
          <div class="settings-section">
            <label>Text Content:</label>
            <textarea
              .value=${e.text||""}
              @input=${e=>this._updateModule({text:e.target.value})}
              placeholder="Enter text content..."
            ></textarea>
          </div>
        `;case"separator":const t=e;return F`
          <div class="settings-section">
            <label>Style:</label>
            <select
              .value=${t.separator_style||"line"}
              @change=${e=>this._updateModule({separator_style:e.target.value})}
            >
              <option value="line">Solid Line</option>
              <option value="dotted">Dotted Line</option>
              <option value="double_line">Double Line</option>
              <option value="shadow">Shadow</option>
              <option value="blank">Blank Space</option>
            </select>
          </div>
          <div class="settings-section">
            <label>Thickness (px):</label>
            <input
              type="number"
              min="1"
              max="10"
              .value=${t.thickness||1}
              @input=${e=>this._updateModule({thickness:Number(e.target.value)})}
            />
          </div>
        `;default:return F`<div>General settings for ${e.type}</div>`}}_renderLogicTab(e){if("text"===e.type||"image"===e.type){const t=e,o="template_mode"in t;return F`
        <div class="settings-section">
          <label>
            <input
              type="checkbox"
              .checked=${o&&t.template_mode||!1}
              @change=${e=>this._updateModule({template_mode:e.target.checked})}
            />
            Enable Template Mode
          </label>
        </div>
        ${o&&t.template_mode?F`
              <div class="settings-section">
                <label>Template:</label>
                <textarea
                  .value=${t.template||""}
                  @input=${e=>this._updateModule({template:e.target.value})}
                  placeholder="{% if states('sensor.example') == 'on' %}Show this text{% endif %}"
                ></textarea>
              </div>
            `:""}
      `}return F`<div class="settings-section">
      <p>Logic settings not available for ${e.type} modules.</p>
    </div>`}_renderDesignTab(e){return F`
      <div class="design-subtabs">
        <button
          class="design-subtab ${"text"===this._activeDesignSubtab?"active":""}"
          @click=${()=>this._activeDesignSubtab="text"}
        >
          Text
        </button>
        <button
          class="design-subtab ${"background"===this._activeDesignSubtab?"active":""}"
          @click=${()=>this._activeDesignSubtab="background"}
        >
          Background
        </button>
        <button
          class="design-subtab ${"spacing"===this._activeDesignSubtab?"active":""}"
          @click=${()=>this._activeDesignSubtab="spacing"}
        >
          Spacing
        </button>
        <button
          class="design-subtab ${"border"===this._activeDesignSubtab?"active":""}"
          @click=${()=>this._activeDesignSubtab="border"}
        >
          Border
        </button>
      </div>

      <div class="design-subtab-content">
        ${"text"===this._activeDesignSubtab?this._renderTextDesignTab(e):""}
        ${"background"===this._activeDesignSubtab?this._renderBackgroundDesignTab(e):""}
        ${"spacing"===this._activeDesignSubtab?this._renderSpacingDesignTab(e):""}
        ${"border"===this._activeDesignSubtab?this._renderBorderDesignTab(e):""}
      </div>
    `}_renderTextDesignTab(e){if("text"===e.type){const t=e;return F`
        <!-- Text Color Section -->
        <div class="settings-section">
          <div class="color-section">
            <label>Color</label>
            <div class="color-picker-wrapper">
              <color-picker
                .value=${t.color||"var(--primary-text-color)"}
                .configValue=${"color"}
                .showResetButton=${!1}
                @value-changed=${e=>{var o;const i=(null===(o=e.detail.value)||void 0===o?void 0:o.color)||e.detail.value;this._updateModule({color:i}),this._loadGoogleFont(t.font_family)}}
              ></color-picker>
            </div>
          </div>
        </div>

        <!-- Font Family Dropdown -->
        <div class="settings-section">
          <label>Font:</label>
          <select
            .value=${t.font_family||"default"}
            @change=${e=>{const t=e.target.value;this._updateModule({font_family:t}),this._loadGoogleFont(t)}}
            class="font-dropdown"
          >
            ${xe.map((e=>F`
                <option value="${e.value}" ?selected=${t.font_family===e.value}>
                  ${e.label}
                </option>
              `))}
            <optgroup label="Fonts from Typography settings">
              ${_e.map((e=>F`
                  <option value="${e.value}" ?selected=${t.font_family===e.value}>
                    ${e.label}
                  </option>
                `))}
            </optgroup>
            <optgroup label="Web safe font combinations (do not need to be loaded)">
              ${$e.map((e=>F`
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
            ${["left","center","right"].map((e=>F`
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
      `}return"separator"===e.type?F`
        <div class="settings-section">
          <color-picker
            .label=${"Separator Color"}
            .value=${e.color||"var(--divider-color)"}
            .configValue=${"color"}
            @value-changed=${e=>{var t;const o=(null===(t=e.detail.value)||void 0===t?void 0:t.color)||e.detail.value;this._updateModule({color:o})}}
          ></color-picker>
        </div>
      `:F`<div class="settings-section">
      <p>Text design options not available for ${e.type} modules.</p>
    </div>`}_renderBackgroundDesignTab(e){return F`
      <div class="settings-section">
        <color-picker
          .label=${"Background Color"}
          .value=${e.background_color||"transparent"}
          @value-changed=${e=>{const t=e.detail.value;this._updateModule({background_color:t})}}
        ></color-picker>
      </div>
    `}_renderSpacingDesignTab(e){var t,o,i,r,a,s,n,l;return F`
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
              .value=${(null===(r=e.margin)||void 0===r?void 0:r.bottom)||0}
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
                .value=${(null===(s=e.padding)||void 0===s?void 0:s.left)||0}
                @input=${t=>this._updateModule({padding:Object.assign(Object.assign({},e.padding),{left:Number(t.target.value)})})}
              />
              <span class="spacing-center">P</span>
              <input
                type="number"
                placeholder="Right"
                .value=${(null===(n=e.padding)||void 0===n?void 0:n.right)||0}
                @input=${t=>this._updateModule({padding:Object.assign(Object.assign({},e.padding),{right:Number(t.target.value)})})}
              />
            </div>
            <input
              type="number"
              placeholder="Bottom"
              .value=${(null===(l=e.padding)||void 0===l?void 0:l.bottom)||0}
              @input=${t=>this._updateModule({padding:Object.assign(Object.assign({},e.padding),{bottom:Number(t.target.value)})})}
            />
          </div>
        </div>
      </div>
    `}_renderBorderDesignTab(e){var t;return F`
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
    `}render(){const e=this.config.layout||{rows:[]};return F`
      <div class="layout-builder">
        <div class="builder-header">
          <h3>Layout Builder</h3>
          <button class="add-row-btn" @click=${this._addRow}>
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Row
          </button>
        </div>

        <div class="rows-container">
          ${e.rows.map(((e,t)=>F`
              <div class="row-builder">
                <div class="row-header">
                  <span>Row ${t+1}</span>
                  <button class="delete-row-btn" @click=${()=>this._deleteRow(t)}>
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                </div>
                <div class="columns-container">
                  ${e.columns.map(((e,o)=>F`
                      <div class="column-builder">
                        <div class="column-header">
                          <span>Column ${o+1}</span>
                        </div>
                        <div class="modules-container">
                          ${e.modules.map(((e,i)=>F`
                              <div
                                class="module-item"
                                @click=${()=>this._openModuleSettings(t,o,i)}
                              >
                                ${this._renderSingleModule(e)}
                                <div class="module-overlay">
                                  <ha-icon icon="mdi:cog"></ha-icon>
                                </div>
                              </div>
                            `))}
                          <button
                            class="add-module-btn"
                            @click=${()=>this._openModuleSelector(t,o)}
                          >
                            <ha-icon icon="mdi:plus"></ha-icon>
                            Add Module
                          </button>
                        </div>
                      </div>
                    `))}
                </div>
              </div>
            `))}
        </div>

        ${this._showModuleSelector?this._renderModuleSelector():""}
        ${this._showModuleSettings?this._renderModuleSettings():""}
      </div>
    `}_renderModuleSelector(){return F`
      <div class="module-selector-popup">
        <div class="popup-overlay" @click=${()=>this._showModuleSelector=!1}></div>
        <div class="selector-content">
          <h3>Select Module Type</h3>
          <div class="module-types">
            ${[{type:"text",icon:"mdi:format-text",label:"Text"},{type:"separator",icon:"mdi:minus",label:"Separator"},{type:"image",icon:"mdi:image",label:"Image"},{type:"info",icon:"mdi:information",label:"Info"},{type:"bar",icon:"mdi:chart-bar",label:"Bar"},{type:"icon",icon:"mdi:home",label:"Icon"}].map((e=>F`
                <button class="module-type-btn" @click=${()=>this._addModule(e.type)}>
                  <ha-icon icon="${e.icon}"></ha-icon>
                  <span>${e.label}</span>
                </button>
              `))}
          </div>
        </div>
      </div>
    `}static get styles(){return a`
      .layout-builder {
        padding: 16px;
        background: var(--card-background-color);
        border-radius: 8px;
      }

      .builder-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .add-row-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .row-builder {
        margin-bottom: 16px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
      }

      .row-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: var(--secondary-background-color);
        font-weight: 500;
      }

      .delete-row-btn {
        background: none;
        border: none;
        color: var(--error-color);
        cursor: pointer;
        padding: 4px;
      }

      .columns-container {
        display: flex;
        min-height: 100px;
      }

      .column-builder {
        flex: 1;
        border-right: 1px solid var(--divider-color);
        padding: 16px;
      }

      .column-builder:last-child {
        border-right: none;
      }

      .column-header {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 12px;
        color: var(--secondary-text-color);
      }

      .modules-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .module-item {
        position: relative;
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .module-item:hover {
        border-color: var(--primary-color);
      }

      .module-item:hover .module-overlay {
        opacity: 1;
      }

      .module-overlay {
        position: absolute;
        top: 4px;
        right: 4px;
        background: var(--primary-color);
        color: white;
        padding: 4px;
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .add-module-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px;
        border: 2px dashed var(--divider-color);
        border-radius: 4px;
        background: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .add-module-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
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
        max-width: 400px;
        width: 90%;
      }

      .module-types {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-top: 16px;
      }

      .module-type-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--secondary-background-color);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .module-type-btn:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
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
        font-size: 24px;
        cursor: pointer;
        color: var(--secondary-text-color);
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .close-button:hover {
        color: var(--primary-color);
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
        display: flex;
        align-items: center;
        justify-content: center;
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
      }

      .settings-section label {
        display: block;
        font-weight: 500;
        margin-bottom: 8px;
        font-size: 14px;
        color: var(--primary-text-color);
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

      .color-picker-wrapper color-picker {
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
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .settings-section textarea {
        min-height: 60px;
        resize: vertical;
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
      }
    `}};ye([pe({attribute:!1})],we.prototype,"hass",void 0),ye([pe({attribute:!1})],we.prototype,"config",void 0),ye([ue()],we.prototype,"_showModuleSelector",void 0),ye([ue()],we.prototype,"_selectedRowIndex",void 0),ye([ue()],we.prototype,"_selectedColumnIndex",void 0),ye([ue()],we.prototype,"_showModuleSettings",void 0),ye([ue()],we.prototype,"_selectedModule",void 0),ye([ue()],we.prototype,"_activeModuleTab",void 0),ye([ue()],we.prototype,"_activeDesignSubtab",void 0),we=ye([le("layout-tab")],we);var ke=function(e,t,o,i){var r,a=arguments.length,s=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,i);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,o,s):r(t,o))||s);return a>3&&s&&Object.defineProperty(t,o,s),s};let Ce=class extends se{constructor(){super(...arguments),this._activeTab="layout"}setConfig(e){this.config=e||{type:"ultra-card",layout:{rows:[]}}}_configChanged(e){const t=new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0});this.dispatchEvent(t)}_updateConfig(e){const t=Object.assign(Object.assign({},this.config),e);this._configChanged(t)}render(){return this.hass&&this.config?F`
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
          ${"layout"===this._activeTab?F`<layout-tab .hass=${this.hass} .config=${this.config}></layout-tab>`:"settings"===this._activeTab?this._renderSettingsTab():F`<about-tab .hass=${this.hass}></about-tab>`}
        </div>
      </div>
    `:F`<div>Loading...</div>`}_renderSettingsTab(){return F`
      <div class="settings-tab">
        <div class="settings-section">
          <h3>Card Settings</h3>
          <p>Configure global card appearance and behavior.</p>

          <div class="form-row">
            <label>Card Background Color:</label>
            <input
              type="color"
              .value=${this.config.card_background||"#ffffff"}
              @change=${e=>this._updateConfig({card_background:e.target.value})}
            />
          </div>

          <div class="form-row">
            <label>Card Border Radius (px):</label>
            <input
              type="number"
              min="0"
              max="50"
              .value=${this.config.card_border_radius||8}
              @change=${e=>this._updateConfig({card_border_radius:Number(e.target.value)})}
            />
          </div>

          <div class="form-row">
            <label>Card Padding (px):</label>
            <input
              type="number"
              min="0"
              max="100"
              .value=${this.config.card_padding||16}
              @change=${e=>this._updateConfig({card_padding:Number(e.target.value)})}
            />
          </div>
        </div>
      </div>
    `}static get styles(){return a`
      .card-config {
        padding: 16px;
        max-width: 1200px;
        margin: 0 auto;
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
        padding: 16px 0;
      }

      .settings-section {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
      }

      .settings-section h3 {
        margin-top: 0;
        color: var(--primary-text-color);
      }

      .form-row {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        gap: 12px;
      }

      .form-row label {
        min-width: 180px;
        color: var(--primary-text-color);
        font-size: 14px;
        font-weight: 500;
      }

      .form-row input {
        flex: 1;
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
      }

      .form-row input[type='color'] {
        width: 60px;
        height: 36px;
        cursor: pointer;
      }
    `}};ke([pe({attribute:!1})],Ce.prototype,"hass",void 0),ke([pe({attribute:!1})],Ce.prototype,"config",void 0),ke([ue()],Ce.prototype,"_activeTab",void 0),Ce=ke([le("ultra-card-editor")],Ce);var Se=function(e,t,o,i){var r,a=arguments.length,s=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,i);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,o,s):r(t,o))||s);return a>3&&s&&Object.defineProperty(t,o,s),s};let Ae=class extends se{static get styles(){return a`
      ha-entity-picker {
        width: 100%;
        display: block;
      }
    `}render(){return F`
      <ha-entity-picker
        .hass=${this.hass}
        .label=${this.label}
        .value=${this.value||""}
        .entityFilter=${this.entityFilter}
        @value-changed=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>
    `}_valueChanged(e){const t=e.detail.value;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t},bubbles:!0,composed:!0}))}};Se([pe({attribute:!1})],Ae.prototype,"hass",void 0),Se([pe()],Ae.prototype,"label",void 0),Se([pe()],Ae.prototype,"value",void 0),Se([pe()],Ae.prototype,"entityFilter",void 0),Ae=Se([le("ultra-entity-picker")],Ae);var Me=function(e,t,o,i){var r,a=arguments.length,s=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,i);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(s=(a<3?r(s):a>3?r(t,o,s):r(t,o))||s);return a>3&&s&&Object.defineProperty(t,o,s),s};let Ee=class extends se{constructor(){super(...arguments),this.value="",this.label="Navigation Target",this.disabled=!1}_valueChanged(e){const t=e.detail.value;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t},bubbles:!0,composed:!0}))}render(){return F`
      <div class="navigation-picker">
        ${this.label?F`<label class="label">${this.label}</label>`:""}
        ${this.helper?F`<div class="helper">${this.helper}</div>`:""}

        <ha-selector
          .hass=${this.hass}
          .selector=${{navigation:{}}}
          .value=${this.value}
          .disabled=${this.disabled}
          @value-changed=${this._valueChanged}
        ></ha-selector>
      </div>
    `}};Ee.styles=a`
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
  `,Me([pe({attribute:!1})],Ee.prototype,"hass",void 0),Me([pe()],Ee.prototype,"value",void 0),Me([pe()],Ee.prototype,"label",void 0),Me([pe()],Ee.prototype,"helper",void 0),Me([pe({type:Boolean})],Ee.prototype,"disabled",void 0),Ee=Me([le("navigation-picker")],Ee),window.customCards=window.customCards||[],window.customCards.push({type:"ultra-card",name:"Ultra Card",description:"A modular card builder for Home Assistant with professional layout tools and conditional logic.",preview:!0,documentationURL:"https://github.com/WJDDesigns/Ultra-Card",version:"1.0.0"})})();