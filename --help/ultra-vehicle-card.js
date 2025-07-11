/*! For license information please see ultra-vehicle-card.js.LICENSE.txt */
(()=>{"use strict";var e,t,i={},n={};function a(e){var t=n[e];if(void 0!==t)return t.exports;var o=n[e]={exports:{}};return i[e](o,o.exports,a),o.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,a.t=function(i,n){if(1&n&&(i=this(i)),8&n)return i;if("object"==typeof i&&i){if(4&n&&i.__esModule)return i;if(16&n&&"function"==typeof i.then)return i}var o=Object.create(null);a.r(o);var r={};e=e||[null,t({}),t([]),t(t)];for(var s=2&n&&i;"object"==typeof s&&!~e.indexOf(s);s=t(s))Object.getOwnPropertyNames(s).forEach((e=>r[e]=()=>i[e]));return r.default=()=>i,a.d(o,r),o},a.d=(e,t)=>{for(var i in t)a.o(t,i)&&!a.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),a.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};const o=globalThis,r=o.ShadowRoot&&(void 0===o.ShadyCSS||o.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),l=new WeakMap;class d{constructor(e,t,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(r&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=l.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&l.set(t,e))}return e}toString(){return this.cssText}}const c=(e,...t)=>{const i=1===e.length?e[0]:t.reduce(((t,i,n)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[n+1]),e[0]);return new d(i,e,s)},p=(e,t)=>{if(r)e.adoptedStyleSheets=t.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet));else for(const i of t){const t=document.createElement("style"),n=o.litNonce;void 0!==n&&t.setAttribute("nonce",n),t.textContent=i.cssText,e.appendChild(t)}},u=r?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new d("string"==typeof e?e:e+"",void 0,s))(t)})(e):e,{is:g,defineProperty:m,getOwnPropertyDescriptor:_,getOwnPropertyNames:h,getOwnPropertySymbols:v,getPrototypeOf:b}=Object,f=globalThis,y=f.trustedTypes,k=y?y.emptyScript:"",w=f.reactiveElementPolyfillSupport,x=(e,t)=>e,S={toAttribute(e,t){switch(t){case Boolean:e=e?k:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},z=(e,t)=>!g(e,t),C={attribute:!0,type:String,converter:S,reflect:!1,hasChanged:z};Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;class T extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=C){if(t.state&&(t.attribute=!1),this._$Ei(),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),n=this.getPropertyDescriptor(e,i,t);void 0!==n&&m(this.prototype,e,n)}}static getPropertyDescriptor(e,t,i){const{get:n,set:a}=_(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get(){return n?.call(this)},set(t){const o=n?.call(this);a.call(this,t),this.requestUpdate(e,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??C}static _$Ei(){if(this.hasOwnProperty(x("elementProperties")))return;const e=b(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(x("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(x("properties"))){const e=this.properties,t=[...h(e),...v(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(u(e))}else void 0!==e&&t.push(u(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((e=>e(this)))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return p(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((e=>e.hostConnected?.()))}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach((e=>e.hostDisconnected?.()))}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$EC(e,t){const i=this.constructor.elementProperties.get(e),n=this.constructor._$Eu(e,i);if(void 0!==n&&!0===i.reflect){const a=(void 0!==i.converter?.toAttribute?i.converter:S).toAttribute(t,i.type);this._$Em=e,null==a?this.removeAttribute(n):this.setAttribute(n,a),this._$Em=null}}_$AK(e,t){const i=this.constructor,n=i._$Eh.get(e);if(void 0!==n&&this._$Em!==n){const e=i.getPropertyOptions(n),a="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:S;this._$Em=n,this[n]=a.fromAttribute(t,e.type),this._$Em=null}}requestUpdate(e,t,i){if(void 0!==e){if(i??=this.constructor.getPropertyOptions(e),!(i.hasChanged??z)(this[e],t))return;this.P(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$ET())}P(e,t,i){this._$AL.has(e)||this._$AL.set(e,t),!0===i.reflect&&this._$Em!==e&&(this._$Ej??=new Set).add(e)}async _$ET(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e)!0!==i.wrapped||this._$AL.has(t)||void 0===this[t]||this.P(t,this[t],i)}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach((e=>e.hostUpdate?.())),this.update(t)):this._$EU()}catch(t){throw e=!1,this._$EU(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach((e=>e.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Ej&&=this._$Ej.forEach((e=>this._$EC(e,this[e]))),this._$EU()}updated(e){}firstUpdated(e){}}T.elementStyles=[],T.shadowRootOptions={mode:"open"},T[x("elementProperties")]=new Map,T[x("finalized")]=new Map,w?.({ReactiveElement:T}),(f.reactiveElementVersions??=[]).push("2.0.4");const A=globalThis,$=A.trustedTypes,I=$?$.createPolicy("lit-html",{createHTML:e=>e}):void 0,j="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,M="?"+E,V=`<${M}>`,L=document,D=()=>L.createComment(""),B=e=>null===e||"object"!=typeof e&&"function"!=typeof e,R=Array.isArray,P=e=>R(e)||"function"==typeof e?.[Symbol.iterator],U="[ \t\n\f\r]",H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,N=/-->/g,O=/>/g,F=RegExp(`>|${U}(?:([^\\s"'>=/]+)(${U}*=${U}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),q=/'/g,K=/"/g,G=/^(?:script|style|textarea|title)$/i,W=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),Z=W(1),J=(W(2),W(3),Symbol.for("lit-noChange")),Q=Symbol.for("lit-nothing"),Y=new WeakMap,X=L.createTreeWalker(L,129);function ee(e,t){if(!R(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==I?I.createHTML(t):t}const te=(e,t)=>{const i=e.length-1,n=[];let a,o=2===t?"<svg>":3===t?"<math>":"",r=H;for(let t=0;t<i;t++){const i=e[t];let s,l,d=-1,c=0;for(;c<i.length&&(r.lastIndex=c,l=r.exec(i),null!==l);)c=r.lastIndex,r===H?"!--"===l[1]?r=N:void 0!==l[1]?r=O:void 0!==l[2]?(G.test(l[2])&&(a=RegExp("</"+l[2],"g")),r=F):void 0!==l[3]&&(r=F):r===F?">"===l[0]?(r=a??H,d=-1):void 0===l[1]?d=-2:(d=r.lastIndex-l[2].length,s=l[1],r=void 0===l[3]?F:'"'===l[3]?K:q):r===K||r===q?r=F:r===N||r===O?r=H:(r=F,a=void 0);const p=r===F&&e[t+1].startsWith("/>")?" ":"";o+=r===H?i+V:d>=0?(n.push(s),i.slice(0,d)+j+i.slice(d)+E+p):i+E+(-2===d?t:p)}return[ee(e,o+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),n]};class ie{constructor({strings:e,_$litType$:t},i){let n;this.parts=[];let a=0,o=0;const r=e.length-1,s=this.parts,[l,d]=te(e,t);if(this.el=ie.createElement(l,i),X.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(n=X.nextNode())&&s.length<r;){if(1===n.nodeType){if(n.hasAttributes())for(const e of n.getAttributeNames())if(e.endsWith(j)){const t=d[o++],i=n.getAttribute(e).split(E),r=/([.?@])?(.*)/.exec(t);s.push({type:1,index:a,name:r[2],strings:i,ctor:"."===r[1]?se:"?"===r[1]?le:"@"===r[1]?de:re}),n.removeAttribute(e)}else e.startsWith(E)&&(s.push({type:6,index:a}),n.removeAttribute(e));if(G.test(n.tagName)){const e=n.textContent.split(E),t=e.length-1;if(t>0){n.textContent=$?$.emptyScript:"";for(let i=0;i<t;i++)n.append(e[i],D()),X.nextNode(),s.push({type:2,index:++a});n.append(e[t],D())}}}else if(8===n.nodeType)if(n.data===M)s.push({type:2,index:a});else{let e=-1;for(;-1!==(e=n.data.indexOf(E,e+1));)s.push({type:7,index:a}),e+=E.length-1}a++}}static createElement(e,t){const i=L.createElement("template");return i.innerHTML=e,i}}function ne(e,t,i=e,n){if(t===J)return t;let a=void 0!==n?i._$Co?.[n]:i._$Cl;const o=B(t)?void 0:t._$litDirective$;return a?.constructor!==o&&(a?._$AO?.(!1),void 0===o?a=void 0:(a=new o(e),a._$AT(e,i,n)),void 0!==n?(i._$Co??=[])[n]=a:i._$Cl=a),void 0!==a&&(t=ne(e,a._$AS(e,t.values),a,n)),t}class ae{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,n=(e?.creationScope??L).importNode(t,!0);X.currentNode=n;let a=X.nextNode(),o=0,r=0,s=i[0];for(;void 0!==s;){if(o===s.index){let t;2===s.type?t=new oe(a,a.nextSibling,this,e):1===s.type?t=new s.ctor(a,s.name,s.strings,this,e):6===s.type&&(t=new ce(a,this,e)),this._$AV.push(t),s=i[++r]}o!==s?.index&&(a=X.nextNode(),o++)}return X.currentNode=L,n}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class oe{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,n){this.type=2,this._$AH=Q,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ne(this,e,t),B(e)?e===Q||null==e||""===e?(this._$AH!==Q&&this._$AR(),this._$AH=Q):e!==this._$AH&&e!==J&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):P(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==Q&&B(this._$AH)?this._$AA.nextSibling.data=e:this.T(L.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,n="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=ie.createElement(ee(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(t);else{const e=new ae(n,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=Y.get(e.strings);return void 0===t&&Y.set(e.strings,t=new ie(e)),t}k(e){R(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,n=0;for(const a of e)n===t.length?t.push(i=new oe(this.O(D()),this.O(D()),this,this.options)):i=t[n],i._$AI(a),n++;n<t.length&&(this._$AR(i&&i._$AB.nextSibling,n),t.length=n)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e&&e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class re{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,n,a){this.type=1,this._$AH=Q,this._$AN=void 0,this.element=e,this.name=t,this._$AM=n,this.options=a,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Q}_$AI(e,t=this,i,n){const a=this.strings;let o=!1;if(void 0===a)e=ne(this,e,t,0),o=!B(e)||e!==this._$AH&&e!==J,o&&(this._$AH=e);else{const n=e;let r,s;for(e=a[0],r=0;r<a.length-1;r++)s=ne(this,n[i+r],t,r),s===J&&(s=this._$AH[r]),o||=!B(s)||s!==this._$AH[r],s===Q?e=Q:e!==Q&&(e+=(s??"")+a[r+1]),this._$AH[r]=s}o&&!n&&this.j(e)}j(e){e===Q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class se extends re{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===Q?void 0:e}}class le extends re{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==Q)}}class de extends re{constructor(e,t,i,n,a){super(e,t,i,n,a),this.type=5}_$AI(e,t=this){if((e=ne(this,e,t,0)??Q)===J)return;const i=this._$AH,n=e===Q&&i!==Q||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,a=e!==Q&&(i===Q||n);n&&this.element.removeEventListener(this.name,this,i),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ce{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){ne(this,e)}}const pe={M:j,P:E,A:M,C:1,L:te,R:ae,D:P,V:ne,I:oe,H:re,N:le,U:de,B:se,F:ce},ue=A.litHtmlPolyfillSupport;ue?.(ie,oe),(A.litHtmlVersions??=[]).push("3.2.1");class ge extends T{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const n=i?.renderBefore??t;let a=n._$litPart$;if(void 0===a){const e=i?.renderBefore??null;n._$litPart$=a=new oe(t.insertBefore(D(),e),e,void 0,i??{})}return a._$AI(e),a})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return J}}ge._$litElement$=!0,ge.finalized=!0,globalThis.litElementHydrateSupport?.({LitElement:ge});const me=globalThis.litElementPolyfillSupport;me?.({LitElement:ge}),(globalThis.litElementVersions??=[]).push("4.1.1");const _e=e=>(t,i)=>{void 0!==i?i.addInitializer((()=>{customElements.define(e,t)})):customElements.define(e,t)},he={attribute:!0,type:String,converter:S,reflect:!1,hasChanged:z},ve=(e=he,t,i)=>{const{kind:n,metadata:a}=i;let o=globalThis.litPropertyMetadata.get(a);if(void 0===o&&globalThis.litPropertyMetadata.set(a,o=new Map),o.set(i.name,e),"accessor"===n){const{name:n}=i;return{set(i){const a=t.get.call(this);t.set.call(this,i),this.requestUpdate(n,a,e)},init(t){return void 0!==t&&this.P(n,void 0,e),t}}}if("setter"===n){const{name:n}=i;return function(i){const a=this[n];t.call(this,i),this.requestUpdate(n,a,e)}}throw Error("Unsupported decorator location: "+n)};function be(e){return(t,i)=>"object"==typeof i?ve(e,t,i):((e,t,i)=>{const n=t.hasOwnProperty(i);return t.constructor.createProperty(i,n?{...e,wrapped:!0}:e),n?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function fe(e){return be({...e,state:!0,attribute:!1})}const ye="/hacsfiles/Ultra-Vehicle-Card/assets/default-car.png",ke=e=>(...t)=>({_$litDirective$:e,values:t});class we{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}const{I:xe}=pe,Se=()=>document.createComment(""),ze=(e,t,i)=>{const n=e._$AA.parentNode,a=void 0===t?e._$AB:t._$AA;if(void 0===i){const t=n.insertBefore(Se(),a),o=n.insertBefore(Se(),a);i=new xe(t,o,e,e.options)}else{const t=i._$AB.nextSibling,o=i._$AM,r=o!==e;if(r){let t;i._$AQ?.(e),i._$AM=e,void 0!==i._$AP&&(t=e._$AU)!==o._$AU&&i._$AP(t)}if(t!==a||r){let e=i._$AA;for(;e!==t;){const t=e.nextSibling;n.insertBefore(e,a),e=t}}}return i},Ce=(e,t,i=e)=>(e._$AI(t,i),e),Te={},Ae=e=>{e._$AP?.(!1,!0);let t=e._$AA;const i=e._$AB.nextSibling;for(;t!==i;){const e=t.nextSibling;t.remove(),t=e}},$e=(e,t,i)=>{const n=new Map;for(let a=t;a<=i;a++)n.set(e[a],a);return n},Ie=ke(class extends we{constructor(e){if(super(e),2!==e.type)throw Error("repeat() can only be used in text expressions")}dt(e,t,i){let n;void 0===i?i=t:void 0!==t&&(n=t);const a=[],o=[];let r=0;for(const t of e)a[r]=n?n(t,r):r,o[r]=i(t,r),r++;return{values:o,keys:a}}render(e,t,i){return this.dt(e,t,i).values}update(e,[t,i,n]){const a=(e=>e._$AH)(e),{values:o,keys:r}=this.dt(t,i,n);if(!Array.isArray(a))return this.ut=r,o;const s=this.ut??=[],l=[];let d,c,p=0,u=a.length-1,g=0,m=o.length-1;for(;p<=u&&g<=m;)if(null===a[p])p++;else if(null===a[u])u--;else if(s[p]===r[g])l[g]=Ce(a[p],o[g]),p++,g++;else if(s[u]===r[m])l[m]=Ce(a[u],o[m]),u--,m--;else if(s[p]===r[m])l[m]=Ce(a[p],o[m]),ze(e,l[m+1],a[p]),p++,m--;else if(s[u]===r[g])l[g]=Ce(a[u],o[g]),ze(e,a[p],a[u]),u--,g++;else if(void 0===d&&(d=$e(r,g,m),c=$e(s,p,u)),d.has(s[p]))if(d.has(s[u])){const t=c.get(r[g]),i=void 0!==t?a[t]:null;if(null===i){const t=ze(e,a[p]);Ce(t,o[g]),l[g]=t}else l[g]=Ce(i,o[g]),ze(e,a[p],i),a[t]=null;g++}else Ae(a[u]),u--;else Ae(a[p]),p++;for(;g<=m;){const t=ze(e,l[m+1]);Ce(t,o[g]),l[g++]=t}for(;p<=u;){const e=a[p++];null!==e&&Ae(e)}return this.ut=r,((e,t=Te)=>{e._$AH=t})(e,l),J}});var je=function(e,t,i,n){var a,o=arguments.length,r=o<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,n);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(r=(o<3?a(r):o>3?a(t,i,r):a(t,i))||r);return o>3&&r&&Object.defineProperty(t,i,r),r};function Ee(e,t,i){const n=Me(e),a=Me(t);return n&&a?function(e,t,i){return`#${((1<<24)+(e<<16)+(t<<8)+i).toString(16).slice(1)}`}(Math.round(n.r+(a.r-n.r)*i),Math.round(n.g+(a.g-n.g)*i),Math.round(n.b+(a.b-n.b)*i)):e}function Me(e){const t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?{r:parseInt(t[1],16),g:parseInt(t[2],16),b:parseInt(t[3],16)}:null}function Ve(e){if(!e||0===e.length)return"";const t=[...e].sort(((e,t)=>e.position-t.position));return t.map((e=>`${e.color} ${e.position}%`)).join(", ")}let Le=3;function De(e){return`linear-gradient(to right, ${Ve(e)})`}function Be(e,t){if(!e||0===e.length)return"#808080";const i=[...e].sort(((e,t)=>e.position-t.position));if(t<=i[0].position)return i[0].color;if(t>=i[i.length-1].position)return i[i.length-1].color;for(let e=0;e<i.length-1;e++){const n=i[e],a=i[e+1];if(t>=n.position&&t<=a.position){const e=(t-n.position)/(a.position-n.position);return Ee(n.color,a.color,e)}}return"#808080"}let Re=class extends ge{constructor(){super(...arguments),this.stops=[{id:"1",position:0,color:"#ff0000"},{id:"2",position:100,color:"#00ff00"}],this.barSize="regular",this.barRadius="round",this.barStyle="flat",this._draggedIndex=null}render(){const e=[...this.stops].sort(((e,t)=>e.position-t.position)),t=Ve(e);return Z`
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
        ${Ie(e,(e=>e.id),((t,i)=>this._renderStopItem(t,i,e.length)))}
      </div>
    `}_renderStopItem(e,t,i){const n=0===e.position||100===e.position,a=this._draggedIndex===t,o=i>2&&!n;return Z`
      <div
        class="stop-item ${n?"boundary":""} ${a?"dragging":""}"
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
          <input
            type="color"
            class="color-input"
            .value=${e.color}
            @input=${t=>this._handleColorChange(e.id,t.target.value)}
          />
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
          ?disabled=${!o}
          @click=${()=>this._deleteStop(e.id)}
          title=${o?"Delete stop":"Cannot delete boundary stops"}
        >
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
            />
          </svg>
        </button>
      </div>
    `}_addStop(){const e=[...this.stops].sort(((e,t)=>e.position-t.position));let t=0,i=50,n="#808080";for(let a=0;a<e.length-1;a++){const o=e[a+1].position-e[a].position;o>t&&(t=o,i=e[a].position+o/2,n=Ee(e[a].color,e[a+1].color,.5))}const a={id:"stop-"+Le++,position:Math.round(i),color:n};this.stops=[...this.stops,a],this._notifyChange()}_resetStops(){this.stops=[{id:"1",position:0,color:"#ff0000"},{id:"2",position:100,color:"#00ff00"}],Le=3,this._notifyChange(),this._dispatchResetEvent()}_deleteStop(e){if(this.stops.length<=2)return;const t=this.stops.find((t=>t.id===e));t&&0!==t.position&&100!==t.position&&(this.stops=this.stops.filter((t=>t.id!==e)),this._notifyChange())}_handleColorChange(e,t){this.stops=this.stops.map((i=>i.id===e?Object.assign(Object.assign({},i),{color:t}):i)),this._notifyChange()}_handlePositionChange(e,t){t=Math.max(0,Math.min(100,t)),this.stops=this.stops.map((i=>i.id===e?Object.assign(Object.assign({},i),{position:t}):i)),this.requestUpdate()}_validateAndSortStops(){this.stops=this.stops.map((e=>0===e.position||"1"===e.id&&e.position<50?Object.assign(Object.assign({},e),{position:0}):100===e.position||"2"===e.id&&e.position>50?Object.assign(Object.assign({},e),{position:100}):e)),this._notifyChange()}_notifyChange(){this.dispatchEvent(new CustomEvent("gradient-changed",{detail:{stops:this.stops},bubbles:!0,composed:!0}))}_dispatchResetEvent(){this.dispatchEvent(new CustomEvent("gradient-stop-reset",{bubbles:!0,composed:!0}))}_handleDragStart(e,t){this._draggedIndex=t,e.dataTransfer&&(e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/html",t.toString()))}_handleDragEnd(){this._draggedIndex=null}_handleDragOver(e){e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect="move")}_handleDrop(e,t){if(e.preventDefault(),null===this._draggedIndex||this._draggedIndex===t)return;const i=[...this.stops].sort(((e,t)=>e.position-t.position)),n=i[this._draggedIndex],a=i[t];this.stops=this.stops.map((e=>e.id===n.id?Object.assign(Object.assign({},e),{position:a.position}):e.id===a.id?Object.assign(Object.assign({},e),{position:n.position}):e)),this._draggedIndex=null,this._notifyChange()}};Re.styles=c`
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

    /* Bar style variants to match actual card bars */
    .gradient-preview-fill.bar-style-glossy {
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.4),
        inset 0 -2px 0 rgba(0, 0, 0, 0.1);
      background-image: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.25) 0%,
        rgba(255, 255, 255, 0.05) 50%,
        rgba(0, 0, 0, 0.05) 51%,
        rgba(0, 0, 0, 0.1) 100%
      );
    }

    .gradient-preview-fill.bar-style-embossed {
      box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.6),
        inset 0 -1px 2px rgba(0, 0, 0, 0.3),
        0 1px 2px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(0, 0, 0, 0.15);
      margin: -1px;
    }

    .gradient-preview.bar-style-outline {
      border: 2px solid var(--primary-color, rgba(var(--rgb-primary-color, 52, 152, 219), 1));
      background-color: var(--disabled-color, rgba(var(--rgb-primary-color, 52, 152, 219), 0.05));
      padding: 2px;
      box-sizing: border-box;
    }

    .gradient-preview.bar-style-outline.bar-size-thin {
      padding: 1px;
      border-width: 1px;
    }

    .gradient-preview-fill.bar-style-inset {
      box-shadow:
        inset 1px 1px 2px var(--divider-color, rgba(0, 0, 0, 0.2)),
        inset -1px -1px 1px rgba(255, 255, 255, 0.1);
    }

    .gradient-preview.bar-style-inset {
      box-shadow:
        inset 1px -1px 5px var(--divider-color, rgba(0, 0, 0, 0.1)),
        0 0 5px var(--divider-color, rgba(0, 0, 0, 0.1));
      padding: 2px;
    }

    .gradient-preview-fill.bar-style-gradient {
      background-image: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.5) 0%,
        rgba(255, 255, 255, 0.1) 40%,
        rgba(0, 0, 0, 0.08) 60%,
        rgba(0, 0, 0, 0.1) 100%
      );
    }

    .gradient-preview-fill.bar-style-neon {
      box-shadow:
        0 0 4px 1px rgba(var(--rgb-primary-color, 52, 152, 219), 0.7),
        0 0 8px 3px rgba(var(--rgb-primary-color, 52, 152, 219), 0.5),
        0 0 12px 5px rgba(var(--rgb-primary-color, 52, 152, 219), 0.3),
        inset 0 0 5px rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(var(--rgb-primary-color, 52, 152, 219), 0.8);
      margin: -1px;
      filter: brightness(1.2);
    }

    .gradient-preview-fill.bar-style-material {
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    }

    .gradient-preview.bar-style-material {
      border: none;
      background-color: rgba(var(--rgb-primary-color, 52, 152, 219), 0.15);
      padding: 0;
    }

    .gradient-preview-fill.bar-style-glass {
      background-image: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.25) 0%,
        rgba(255, 255, 255, 0.1) 100%
      );
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      box-shadow:
        inset 0 0 4px rgba(255, 255, 255, 0.8),
        inset 0 0 8px rgba(255, 255, 255, 0.1);
    }

    .gradient-preview.bar-style-glass {
      background: rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .gradient-preview-fill.bar-style-metallic {
      background-image: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.4) 0%,
        rgba(255, 255, 255, 0.2) 35%,
        rgba(0, 0, 0, 0.1) 50%,
        rgba(0, 0, 0, 0.2) 51%,
        rgba(0, 0, 0, 0.05) 100%
      );
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.6),
        inset 0 -1px 0 rgba(0, 0, 0, 0.25),
        0 1px 1px rgba(0, 0, 0, 0.2);
    }

    .gradient-preview.bar-style-metallic {
      background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%);
    }

    .gradient-preview-fill.bar-style-neumorphic {
      box-shadow:
        inset 1px 1px 3px rgba(0, 0, 0, 0.15),
        inset -1px -1px 3px rgba(255, 255, 255, 0.15);
    }

    .gradient-preview.bar-style-neumorphic {
      background-color: var(--card-background-color, #f0f0f0);
      border: none;
      box-shadow:
        inset 1px 1px 3px rgba(0, 0, 0, 0.1),
        inset -1px -1px 3px rgba(255, 255, 255, 0.1),
        3px 3px 5px rgba(0, 0, 0, 0.05),
        -3px -3px 5px rgba(255, 255, 255, 0.05);
      padding: 2px;
    }

    .gradient-preview-fill.bar-style-dashed {
      mask-image: repeating-linear-gradient(
        90deg,
        black 0px,
        black 3px,
        transparent 3px,
        transparent 6px
      );
      -webkit-mask-image: repeating-linear-gradient(
        90deg,
        black 0px,
        black 3px,
        transparent 3px,
        transparent 6px
      );
      mask-size: 6px 100%;
      -webkit-mask-size: 6px 100%;
      mask-repeat: repeat-x;
      -webkit-mask-repeat: repeat-x;
    }

    .gradient-preview.bar-style-dashed {
      background-color: transparent !important;
      border: none;
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

    .color-input {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
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

    .drop-zone {
      height: 4px;
      background: var(--primary-color);
      border-radius: 2px;
      opacity: 0;
      transition: opacity 0.2s ease;
      margin: 4px 0;
    }

    .drop-zone.active {
      opacity: 1;
    }
  `,je([be({type:Array})],Re.prototype,"stops",void 0),je([be({type:String})],Re.prototype,"barSize",void 0),je([be({type:String})],Re.prototype,"barRadius",void 0),je([be({type:String})],Re.prototype,"barStyle",void 0),je([fe()],Re.prototype,"_draggedIndex",void 0),Re=je([_e("gradient-editor")],Re);const Pe=(e,t)=>{const i=e._$AN;if(void 0===i)return!1;for(const e of i)e._$AO?.(t,!1),Pe(e,t);return!0},Ue=e=>{let t,i;do{if(void 0===(t=e._$AM))break;i=t._$AN,i.delete(e),e=t}while(0===i?.size)},He=e=>{for(let t;t=e._$AM;e=t){let i=t._$AN;if(void 0===i)t._$AN=i=new Set;else if(i.has(e))break;i.add(e),Fe(t)}};function Ne(e){void 0!==this._$AN?(Ue(this),this._$AM=e,He(this)):this._$AM=e}function Oe(e,t=!1,i=0){const n=this._$AH,a=this._$AN;if(void 0!==a&&0!==a.size)if(t)if(Array.isArray(n))for(let e=i;e<n.length;e++)Pe(n[e],!1),Ue(n[e]);else null!=n&&(Pe(n,!1),Ue(n));else Pe(this,e)}const Fe=e=>{2==e.type&&(e._$AP??=Oe,e._$AQ??=Ne)};class qe extends we{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,t,i){super._$AT(e,t,i),He(this),this.isConnected=e._$AU}_$AO(e,t=!0){e!==this.isConnected&&(this.isConnected=e,e?this.reconnected?.():this.disconnected?.()),t&&(Pe(this,e),Ue(this))}setValue(e){if((()=>void 0===this._$Ct.strings)())this._$Ct._$AI(e,this);else{const t=[...this._$Ct._$AH];t[this._$Ci]=e,this._$Ct._$AI(t,this,0)}}disconnected(){}reconnected(){}}class Ke{constructor(e){this.Y=e}disconnect(){this.Y=void 0}reconnect(e){this.Y=e}deref(){return this.Y}}class Ge{constructor(){this.Z=void 0,this.q=void 0}get(){return this.Z}pause(){this.Z??=new Promise((e=>this.q=e))}resume(){this.q?.(),this.Z=this.q=void 0}}const We=e=>!(e=>null===e||"object"!=typeof e&&"function"!=typeof e)(e)&&"function"==typeof e.then,Ze=1073741823,Je=ke(class extends qe{constructor(){super(...arguments),this._$Cwt=Ze,this._$Cbt=[],this._$CK=new Ke(this),this._$CX=new Ge}render(...e){return e.find((e=>!We(e)))??J}update(e,t){const i=this._$Cbt;let n=i.length;this._$Cbt=t;const a=this._$CK,o=this._$CX;this.isConnected||this.disconnected();for(let e=0;e<t.length&&!(e>this._$Cwt);e++){const r=t[e];if(!We(r))return this._$Cwt=e,r;e<n&&r===i[e]||(this._$Cwt=Ze,n=0,Promise.resolve(r).then((async e=>{for(;o.get();)await o.get();const t=a.deref();if(void 0!==t){const i=t._$Cbt.indexOf(r);i>-1&&i<t._$Cwt&&(t._$Cwt=i,t.setValue(e))}})))}return J}disconnected(){this._$CK.disconnect(),this._$CX.pause()}reconnected(){this._$CK.reconnect(this),this._$CX.resume()}});class Qe{constructor(e){this.hass=e,this._templateSubscriptions=new Map,this._templateResults=new Map,this._evaluationCache=new Map,this.CACHE_TTL=1e3}getTemplateResult(e){const t=this._evaluationCache.get(e);return t&&Date.now()-t.timestamp<this.CACHE_TTL?t.value:this._templateResults.get(e)}hasTemplateSubscription(e){return this._templateSubscriptions.has(e)}getAllTemplateResults(){return this._templateResults}async evaluateTemplate(e){var t;if(!e||!this.hass)return!1;const i=e.trim();if(!i)return!1;const n=`eval_${i}`,a=this._evaluationCache.get(n);if(a&&Date.now()-a.timestamp<this.CACHE_TTL)return a.value;try{const e=await this.hass.callApi("POST","template",{template:i}),t=e.toLowerCase().trim();let a;if(["true","on","yes","1"].includes(t))a=!0;else if(["false","off","no","0","unavailable","unknown","none",""].includes(t))a=!1;else{const i=parseFloat(t);isNaN(i)?(console.warn(`[UltraVehicleCard] Template evaluated to ambiguous string '${e}', interpreting as false.`),a=!1):a=0!==i}return this._evaluationCache.set(n,{value:a,timestamp:Date.now(),stringValue:e}),a}catch(e){const n=(null===(t=e.error)||void 0===t?void 0:t.message)||e.message||String(e);return console.error(`[UltraVehicleCard] Error evaluating template via API: ${i}. Error: ${n}`),!1}}async subscribeToTemplate(e,t,i){if(e&&this.hass){if(this._templateSubscriptions.has(t)){try{const e=this._templateSubscriptions.get(t);if(e){const t=await e;t&&"function"==typeof t&&await t()}}catch(e){}this._templateSubscriptions.delete(t)}try{const n=new Promise(((n,a)=>{n(this.hass.connection.subscribeMessage((e=>{const n=e.result;this.hass.__uvc_template_strings||(this.hass.__uvc_template_strings={}),this.hass.__uvc_template_strings[t]=n;const a=this.parseTemplateResult(n,t);a!==this._templateResults.get(t)&&i&&i(),this._templateResults.set(t,a),this._evaluationCache.set(t,{value:a,timestamp:Date.now(),stringValue:n})}),{type:"render_template",template:e}))}));this._templateSubscriptions.set(t,n)}catch(t){console.error(`[UltraVehicleCard] Failed to subscribe to template: ${e}`,t)}}}parseTemplateResult(e,t){if(t&&t.startsWith("info_entity_"))return!0;if(t&&t.startsWith("state_text_"))return!0;if(null==e)return!1;if("boolean"==typeof e)return e;if("number"==typeof e)return 0!==e;if("string"==typeof e){const t=e.toLowerCase().trim();return"true"===t||"on"===t||"yes"===t||"active"===t||"home"===t||"1"===t||"open"===t||"unlocked"===t||"false"!==t&&"off"!==t&&"no"!==t&&"inactive"!==t&&"not_home"!==t&&"away"!==t&&"0"!==t&&"closed"!==t&&"locked"!==t&&"unavailable"!==t&&"unknown"!==t&&""!==t}return console.warn(`[UltraVehicleCard] Template evaluated to ambiguous type '${typeof e}', interpreting as false.`),!1}async unsubscribeAllTemplates(){for(const[e,t]of this._templateSubscriptions.entries())try{if(t){const e=await Promise.resolve(t).catch((e=>null));if(e&&"function"==typeof e)try{await e()}catch(e){}}}catch(e){}this._templateSubscriptions.clear(),this._templateResults.clear(),this._evaluationCache.clear()}updateHass(e){this.hass=e,this._evaluationCache.clear()}}class Ye{constructor(e){this.hass=e,this._colorSubscriptions=new Map,this._colorResults=new Map,this._colorEvaluationCache=new Map,this.CACHE_TTL=1e3}getColorResult(e){const t=this._colorEvaluationCache.get(e);return t&&Date.now()-t.timestamp<this.CACHE_TTL?t.value:this._colorResults.get(e)}hasColorSubscription(e){return this._colorSubscriptions.has(e)}getAllColorResults(){return this._colorResults}async evaluateColorTemplate(e){var t;if(!e||!this.hass)return"var(--primary-color)";const i=e.trim();if(!i)return"var(--primary-color)";const n=`color_eval_${i}`,a=this._colorEvaluationCache.get(n);if(a&&Date.now()-a.timestamp<this.CACHE_TTL)return a.value;try{const e=await this.hass.callApi("POST","template",{template:i}),t=this.parseColorResult(e);return this._colorEvaluationCache.set(n,{value:t,timestamp:Date.now()}),t}catch(e){const n=(null===(t=e.error)||void 0===t?void 0:t.message)||e.message||String(e);return console.error(`[UltraVehicleCard] Error evaluating color template via API: ${i}. Error: ${n}`),"var(--primary-color)"}}async subscribeToColorTemplate(e,t,i){if(e&&this.hass){if(this._colorSubscriptions.has(t)){try{const e=this._colorSubscriptions.get(t);if(e){const t=await e;t&&"function"==typeof t&&await t()}}catch(e){}this._colorSubscriptions.delete(t)}try{const n=new Promise(((n,a)=>{n(this.hass.connection.subscribeMessage((e=>{const n=e.result;this.hass.__uvc_dynamic_colors||(this.hass.__uvc_dynamic_colors={}),this.hass.__uvc_dynamic_colors[t]=n;const a=this.parseColorResult(n);a!==this._colorResults.get(t)&&i&&i(),this._colorResults.set(t,a),this._colorEvaluationCache.set(t,{value:a,timestamp:Date.now()})}),{type:"render_template",template:e}))}));this._colorSubscriptions.set(t,n)}catch(t){console.error(`[UltraVehicleCard] Failed to subscribe to color template: ${e}`,t)}}}parseColorResult(e){if(null==e)return"var(--primary-color)";if("string"==typeof e){const t=e.trim();return this.isValidColor(t)?t:(console.warn(`[UltraVehicleCard] Color template evaluated to invalid color '${t}', using default.`),"var(--primary-color)")}return console.warn(`[UltraVehicleCard] Color template evaluated to non-string type '${typeof e}', using default.`),"var(--primary-color)"}isValidColor(e){return[/^#[0-9A-Fa-f]{3,8}$/,/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i,/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i,/^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/i,/^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/i,/^var\(--[\w-]+\)$/i,/^(red|green|blue|yellow|orange|purple|pink|brown|black|white|gray|grey|transparent)$/i].some((t=>t.test(e)))}async unsubscribeAllColorTemplates(){for(const[e,t]of this._colorSubscriptions.entries())try{if(t){const e=await Promise.resolve(t).catch((e=>null));if(e&&"function"==typeof e)try{await e()}catch(e){}}}catch(e){}this._colorSubscriptions.clear(),this._colorResults.clear(),this._colorEvaluationCache.clear()}updateHass(e){this.hass=e,this._colorEvaluationCache.clear()}}class Xe{constructor(e){this.hass=e,this._iconSubscriptions=new Map,this._iconResults=new Map,this._iconEvaluationCache=new Map,this.CACHE_TTL=1e3}getIconResult(e){const t=this._iconEvaluationCache.get(e);return t&&Date.now()-t.timestamp<this.CACHE_TTL?t.value:this._iconResults.get(e)}hasIconSubscription(e){return this._iconSubscriptions.has(e)}getAllIconResults(){return this._iconResults}async evaluateIconTemplate(e){var t;if(!e||!this.hass)return"mdi:help-circle-outline";const i=e.trim();if(!i)return"mdi:help-circle-outline";const n=`icon_eval_${i}`,a=this._iconEvaluationCache.get(n);if(a&&Date.now()-a.timestamp<this.CACHE_TTL)return a.value;try{const e=await this.hass.callApi("POST","template",{template:i}),t=this.parseIconResult(e);return this._iconEvaluationCache.set(n,{value:t,timestamp:Date.now()}),t}catch(e){const n=(null===(t=e.error)||void 0===t?void 0:t.message)||e.message||String(e);return console.error(`[UltraVehicleCard] Error evaluating icon template via API: ${i}. Error: ${n}`),"mdi:help-circle-outline"}}async subscribeToIconTemplate(e,t,i){if(e&&this.hass){if(this._iconSubscriptions.has(t)){try{const e=this._iconSubscriptions.get(t);if(e){const t=await e;t&&"function"==typeof t&&await t()}}catch(e){}this._iconSubscriptions.delete(t)}try{const n=new Promise(((n,a)=>{n(this.hass.connection.subscribeMessage((e=>{const n=e.result;this.hass.__uvc_dynamic_icons||(this.hass.__uvc_dynamic_icons={}),this.hass.__uvc_dynamic_icons[t]=n;const a=this.parseIconResult(n);a!==this._iconResults.get(t)&&i&&i(),this._iconResults.set(t,a),this._iconEvaluationCache.set(t,{value:a,timestamp:Date.now()})}),{type:"render_template",template:e}))}));this._iconSubscriptions.set(t,n)}catch(t){console.error(`[UltraVehicleCard] Failed to subscribe to icon template: ${e}`,t)}}}parseIconResult(e){if(null==e)return"mdi:help-circle-outline";if("string"==typeof e){const t=e.trim();return this.isValidIcon(t)?t:(console.warn(`[UltraVehicleCard] Icon template evaluated to invalid icon '${t}', using default.`),"mdi:help-circle-outline")}return console.warn(`[UltraVehicleCard] Icon template evaluated to non-string type '${typeof e}', using default.`),"mdi:help-circle-outline"}isValidIcon(e){return[/^mdi:[\w-]+$/i,/^hass:[\w-]+$/i,/^fas:[\w-]+$/i,/^far:[\w-]+$/i,/^fab:[\w-]+$/i,/^fal:[\w-]+$/i,/^phu:[\w-]+$/i,/^si:[\w-]+$/i,/^tabler:[\w-]+$/i,/^[\w-]+:[\w-]+$/i].some((t=>t.test(e)))}getEntityBasedIcon(e){var t;if(!e||!(null===(t=this.hass)||void 0===t?void 0:t.states[e]))return"mdi:help-circle-outline";const i=this.hass.states[e];if(i.attributes.icon)return i.attributes.icon;const n=e.split(".")[0],a=i.attributes.device_class;switch(n){case"binary_sensor":switch(a){case"door":return"mdi:door";case"garage_door":return"mdi:garage";case"window":return"mdi:window-closed";case"motion":return"mdi:motion-sensor";case"battery":return"mdi:battery";case"lock":return"mdi:lock";default:return"mdi:checkbox-marked-circle"}case"sensor":switch(a){case"temperature":return"mdi:thermometer";case"humidity":return"mdi:water-percent";case"battery":return"mdi:battery";case"power":return"mdi:flash";case"energy":return"mdi:lightning-bolt";default:return"mdi:gauge"}case"light":return"mdi:lightbulb";case"switch":return"mdi:toggle-switch-outline";case"climate":return"mdi:thermostat";case"person":return"mdi:account";case"device_tracker":return"mdi:radar";case"cover":return"mdi:window-shutter";case"lock":return"mdi:lock";case"camera":return"mdi:camera";case"media_player":return"mdi:cast";default:return"mdi:help-circle-outline"}}async unsubscribeAllIconTemplates(){for(const[e,t]of this._iconSubscriptions.entries())try{if(t){const e=await Promise.resolve(t).catch((e=>null));if(e&&"function"==typeof e)try{await e()}catch(e){}}}catch(e){}this._iconSubscriptions.clear(),this._iconResults.clear(),this._iconEvaluationCache.clear()}updateHass(e){this.hass=e,this._iconEvaluationCache.clear()}}class et{static getInstance(){return et.instance||(et.instance=new et),et.instance}constructor(){this._highlightedSections=[],this._callbacks=new Set,this._isEnabled=!0,document.addEventListener("uvc-highlight-sections",this._handleHighlightEvent.bind(this)),document.addEventListener("uvc-clear-highlight",this._handleClearEvent.bind(this))}onHighlightChange(e){return this._callbacks.add(e),()=>{this._callbacks.delete(e)}}getHighlightedSections(){return[...this._highlightedSections]}isHighlighted(e){return this._highlightedSections.includes(e)}setEnabled(e){this._isEnabled=e,e||this.clearHighlights()}getHighlightClass(e){return this.isHighlighted(e)?"section-highlighted":""}highlightSections(e,t=!0){this._isEnabled&&(this._highlightTimeout&&(clearTimeout(this._highlightTimeout),this._highlightTimeout=void 0),this._highlightedSections=[...e],this._notifyCallbacks(),document.dispatchEvent(new CustomEvent("uvc-highlight-sections",{detail:{sections:this._highlightedSections,source:"section-highlight-service"},bubbles:!0,composed:!0})),t&&(this._highlightTimeout=window.setTimeout((()=>{this.clearHighlights()}),1e3)))}clearHighlights(){this._highlightTimeout&&(clearTimeout(this._highlightTimeout),this._highlightTimeout=void 0),this._highlightedSections=[],this._notifyCallbacks(),document.dispatchEvent(new CustomEvent("uvc-clear-highlight",{detail:{source:"section-highlight-service"},bubbles:!0,composed:!0}))}getHighlightedSectionsForTab(e,t){var i,n,a;switch(e){case"settings":return["title"];case"images":return["image"];case"info":return["info",...(null===(i=t.info_rows)||void 0===i?void 0:i.map((e=>`info_row_${e.id}`)))||[]];case"bars":return(null===(n=t.bars)||void 0===n?void 0:n.map(((e,t)=>`bar_${t}`)))||["bars"];case"icons":return(null===(a=t.icon_rows)||void 0===a?void 0:a.map((e=>`icon_row_${e.id}`)))||["icons"];default:return[]}}handleTabChange(e,t,i=!0){if(this.setEnabled(i),!i)return;const n=this.getHighlightedSectionsForTab(e,t);this.highlightSections(n)}_handleHighlightEvent(e){var t;null===(t=e.detail)||void 0===t||t.source}_handleClearEvent(e){var t;null===(t=e.detail)||void 0===t||t.source}_notifyCallbacks(){this._callbacks.forEach((e=>{try{e()}catch(e){console.error("[SectionHighlightService] Error in callback:",e)}}))}destroy(){this._highlightTimeout&&clearTimeout(this._highlightTimeout),document.removeEventListener("uvc-highlight-sections",this._handleHighlightEvent.bind(this)),document.removeEventListener("uvc-clear-highlight",this._handleClearEvent.bind(this)),this._callbacks.clear(),et.instance=null}}et.instance=null;const tt="3.0.0-RC2";var it,nt=function(e,t,i,n){var a,o=arguments.length,r=o<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,n);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(r=(o<3?a(r):o>3?a(t,i,r):a(t,i))||r);return o>3&&r&&Object.defineProperty(t,i,r),r};let at=it=class extends ge{constructor(){super(),this._lastRenderTime=0,this._lastImageUrl=null,this._mapPopupData=null,this._iconActiveStates=new Map,this._iconsAwaitingConfirmation=new Map,this._currentTimedImage=null,this._timedImageStartTime=null,this._imageConditionStates=new Map,this._imageTriggerTimes=new Map,this._imageTriggerResults=new Map,this._cardInstanceId="",this._stateRestored=!1,this._templateSubscriptions=new Map,this._templateResults=new Map,this._confirmationCancelListeners=new Map,this._holdTimer=null,this._currentHoldIcon=null,this._singleClickTimers=new Map,this._pendingSingleClicks=new Map,this._touchStartTimes=new Map,this._lastTouchEndTime=new Map,this._currentHoldImage=null,this._pendingSingleImageClicks=new Map,this._imageHoldTimer=null,this._timedImageTimer=null,this._entityStates=new Map,this._entityImageUrls=new Map,this._onHighlightChange=()=>{this.requestUpdate()},this._cardInstanceId=`card_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,it._versionLogged||(console.info(`%c Ultra Vehicle Card %c ${tt} `,"color: white; background: #03a9f4; font-weight: 700; padding: 3px 2px 3px 3px; border-radius: 14px 0 0 14px;","color: white; background: #555555; font-weight: 700; padding: 3px 2px 3px 3px; border-radius: 0 14px 14px 0;"),it._versionLogged=!0),this._imageTriggerTimes=new Map,this._imageTriggerResults=new Map,this._restoreStateFromStorage()}static getConfigElement(){return document.createElement("ultra-vehicle-card-editor")}static getStubConfig(){return{title:"Vehicle Title",title_alignment:"center",title_size:24,title_bold:!0,formatted_entities:!0,show_units:!0,vehicle_image_type:"default",sections_order:["title","image"]}}static get properties(){return{hass:{},config:{}}}static get styles(){return c`
      :host {
        --bar-height: 10px;
        --bar-thickness: var(--bar-height, 10px);
        --bar-radius: 2px;
        --card-padding: 16px;
        --uvc-icon-size-default: 24px; /* Default icon size */
        --uvc-bar-spacing: 8px; /* Default spacing between bars in a row */
      }

      ha-card {
        overflow: hidden;
      }

      .card-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px; /* Gap between sections */
      }

      .card-title {
        color: var(--primary-text-color);
        font-family: var(--ha-card-header-font-family, inherit);
        letter-spacing: -0.012em;
        line-height: 1.2;
        display: block;
        width: 100%;
        margin-top: 8px;
        margin-bottom: 8px;
        position: relative; /* Create stacking context */
        z-index: 2; /* Above vehicle image */
        /* font-size is set via inline style from config */
      }

      .two-column-layout {
        display: grid;
        gap: 0px !important; /* Remove gap to maximize content space */
        height: 100%;
      }

      /* Dashboard Layout Styles */
      .dashboard-layout {
        display: flex;
        flex-direction: column;
        gap: 8px; /* Reduced gap for better space utilization */
        padding: 16px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .dashboard-section {
        position: relative;
        z-index: 2; /* Above vehicle image */
      }

      .dashboard-middle {
        display: flex;
        flex-direction: column;
        gap: 8px; /* Reduced gap for better space utilization */
        position: relative;
      }

      .dashboard-center-row {
        display: grid;
        grid-template-columns: minmax(80px, 0.8fr) minmax(auto, 2fr) minmax(80px, 0.8fr);
        align-items: center;
        width: 100%;
        /* gap is controlled by Middle Spacing setting in editor */
      }

      .left-middle-section {
        justify-self: start;
        width: 100%;
        max-width: 220px; /* Increased from 160px to allow more text space */
        align-self: center;
      }

      .right-middle-section {
        justify-self: end;
        width: 100%;
        max-width: 220px; /* Increased from 160px to allow more text space */
        align-self: center;
      }

      /* Vertical icon stacking for side sections */
      .left-middle-section .icon-rows-container,
      .right-middle-section .icon-rows-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      /* Special handling for info rows in dashboard side sections */
      .left-middle-section .info-rows-container,
      .right-middle-section .info-rows-container {
        display: flex;
        flex-direction: column;
        gap: 6px; /* Reduced gap for info rows */
        width: 100%; /* Ensure full width usage */
      }

      /* Optimize info row layout in dashboard for better text display */
      .left-middle-section .info-row-item,
      .right-middle-section .info-row-item {
        width: 100%;
        gap: 4px !important; /* Override any inline gap settings */
        flex-wrap: wrap !important; /* Always allow wrapping in dashboard */
      }

      /* Force icon rows to be vertical in side sections */
      .left-middle-section .icon-row,
      .left-middle-section .icon-row-grid,
      .right-middle-section .icon-row,
      .right-middle-section .icon-row-grid {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        gap: 8px !important;
      }

      /* Make icons in side sections take full width */
      .left-middle-section .icon-outer-container,
      .right-middle-section .icon-outer-container {
        width: 100% !important;
      }

      .dashboard-center-image {
        justify-self: center;
        max-width: 75%;
        z-index: 2;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 150px;
        /* Background color and border radius removed for clean appearance */
      }

      /* When the image is displayed, make sure it shows in the center */
      .dashboard-layout .vehicle-image-container {
        max-width: 100%;
        z-index: 1; /* Below section content */
      }

      .dashboard-layout .dashboard-center-image .vehicle-image-container {
        position: relative;
        top: auto;
        left: auto;
        transform: none;
        opacity: 1;
        margin: 0 auto;
        height: 100%;
      }

      .dashboard-layout .dashboard-center-image .vehicle-image {
        max-height: 250px;
        width: auto;
        object-fit: contain;
        filter: drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.2));
      }

      .centered-image {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
      }

      .centered-image img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      /* Column width variations */
      .two-column-layout.columns-50-50 {
        grid-template-columns: 1fr 1fr;
      }
      .two-column-layout.columns-30-70 {
        grid-template-columns: 3fr 7fr;
      }
      .two-column-layout.columns-70-30 {
        grid-template-columns: 7fr 3fr;
      }
      .two-column-layout.columns-40-60 {
        grid-template-columns: 4fr 6fr;
      }
      .two-column-layout.columns-60-40 {
        grid-template-columns: 6fr 4fr;
      }

      .column {
        display: flex;
        flex-direction: column;
        /* No gap needed as each section already has its own margins */
        min-width: 0; /* Prevent overflow in grid cells */
      }

      /* Vehicle Info styles */
      .vehicle-info-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: 16px;
        position: relative; /* Create stacking context */
        z-index: 2; /* Above vehicle image */
      }

      .vehicle-info-top {
        display: flex;
        justify-content: center;
        gap: 12px; /* Reduced gap for better space utilization */
        margin-bottom: 8px;
      }

      .info-item-with-icon {
        display: flex;
        align-items: center;
        font-size: 0.85em;
        color: var(--primary-text-color);
        cursor: pointer;
        position: relative; /* Ensure proper stacking */
      }

      .info-item-with-icon ha-icon {
        margin-right: 8px;
        color: var(--secondary-text-color);
        --mdc-icon-size: 20px;
      }

      .info-item-status {
        font-size: 0.85em;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 8px;
      }

      .info-item.info-empty {
        justify-content: center;
        padding: 12px;
        font-style: italic;
        color: var(--secondary-text-color);
      }

      .info-label {
        font-weight: 500;
        color: var(--secondary-text-color);
        margin-right: 8px;
      }

      .info-value {
        font-weight: 400;
        color: var(--primary-text-color);
      }

      /* Vertical centering for two-column layout */
      .two-column-layout .column {
        justify-content: center;
      }

      /* Ensure images in two-column layout don't overflow their columns */
      .column .vehicle-image-container,
      .column .action-image-container {
        max-width: 100%;
      }

      /* Ensure nested elements in columns maintain their styles */
      .column .bars-container,
      .column .icon-rows {
        width: 100%;
        margin: 0 auto;
      }

      /* Center content within columns */
      .column .card-title,
      .column .vehicle-image-container,
      .column .bars-container,
      .column .icon-rows-container {
        align-self: center;
        width: 100%;
      }

      /* Vehicle image */
      .vehicle-image-container {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative; /* Create stacking context */
        z-index: 1; /* Ensure vehicle image stays below interactive elements */
        margin: 8px 0; /* Add default 8px margin on top and bottom for consistency */
      }

      /* Edge-to-edge image styling for images > 100% width */
      .vehicle-image-container.edge-to-edge {
        width: calc(100% + (var(--card-padding, 16px) * 2)); /* Extend full width plus padding */
        box-sizing: border-box;
        margin-left: calc(-1 * var(--card-padding, 16px));
        margin-right: calc(-1 * var(--card-padding, 16px));
        max-width: none; /* Override max-width limits */
      }

      .vehicle-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition:
          transform 0.2s ease,
          opacity 0.2s ease;
      }

      .vehicle-image.image-error {
        opacity: 0.2;
      }

      .vehicle-image.action-image-active {
        /* Add specific styling for action image when active */
      }

      /* Clickable image styles */
      .vehicle-image.clickable {
        cursor: pointer;
        pointer-events: auto; /* Enable clicks */
      }

      .vehicle-image.clickable:hover {
        transform: scale(1.02);
      }

      /* Section highlighting styles for editor */
      .section-highlighted {
        position: relative;
        outline: 2px solid var(--primary-color);
        border-radius: 8px;
        background: rgba(var(--rgb-primary-color), 0.1);
        animation: highlight-pulse 1s ease-in-out;
        z-index: 10;
      }

      @keyframes highlight-pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(var(--rgb-primary-color), 0.7);
        }
        25% {
          box-shadow: 0 0 0 4px rgba(var(--rgb-primary-color), 0.5);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(var(--rgb-primary-color), 0.3);
        }
        75% {
          box-shadow: 0 0 0 4px rgba(var(--rgb-primary-color), 0.5);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(var(--rgb-primary-color), 0.7);
        }
      }

      /* Icon styling */
      .icon-rows-container {
        display: flex;
        flex-direction: column;
        gap: 8px; /* Reduced gap for better space utilization */
        width: 100%;
        position: relative; /* Create stacking context */
        z-index: 2; /* Above vehicle image */
      }

      /* Icon Row with alignment classes */
      .icon-row {
        display: flex;
        flex-direction: row;
        width: 100%;
        padding: 4px 0;
      }

      /* New grid layout for evenly distributed columns */
      .icon-row-grid {
        width: 100%;
        padding: 4px 0;
        /* Grid styles are applied inline */
      }

      /* Ensure icons in grid layout fill their cells */
      .icon-row-grid .icon-outer-container {
        width: 100%;
        box-sizing: border-box;
      }

      /* Alignment classes */
      .align-flex-start {
        justify-content: flex-start;
      }

      .align-center {
        justify-content: center;
      }

      .align-flex-end {
        justify-content: flex-end;
      }

      .align-space-between {
        justify-content: space-between;
      }

      .align-space-around {
        justify-content: space-around;
      }

      .align-space-evenly {
        justify-content: space-evenly;
      }

      /* Icon container */
      .icon-outer-container {
        /* Change to flex and stretch children */
        display: flex;
        align-items: stretch; /* Make children fill height */
      }

      .icon-container {
        display: flex;
        /* flex-direction and align-items set dynamically */
        /* Add width, height, padding, gap, and box-sizing */
        width: 100%;
        height: 100%;
        padding: 8px;
        gap: 0px; /* Consistent gap for both directions initially */
        box-sizing: border-box;
        cursor: pointer;
        position: relative; /* Create stacking context */
        z-index: 2; /* Ensure clickability */
        justify-content: center; /* Default centering for vertical */
      }

      /* Special styling for horizontal (left/right) layout */
      /* REMOVE specific padding here */
      .icon-container[style*='flex-direction: row'],
      .icon-container[style*='flex-direction: row-reverse'] {
        justify-content: space-between; /* Push icon and text apart */
        gap: 8px; /* Add gap for horizontal layouts */
      }

      .icon-container.draggable {
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
      }

      .icon-container:hover {
        background: rgba(var(--rgb-primary-color), 0.1);
      }

      .icon-background {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 4px;
        padding: 8px;
        box-sizing: border-box;
      }

      /* Adjust icon background margin for horizontal layouts */
      /* REMOVE these specific margin adjustments */
      /* .icon-container[style*='flex-direction: row'] .icon-background,
      .icon-container[style*='flex-direction: row-reverse'] .icon-background {
        margin-bottom: 0;
        margin-right: 0;
        margin-left: 0;
      } */

      .icon-container ha-icon {
        --mdc-icon-size: 24px;
      }

      .icon-label {
        font-size: 0.85em;
        margin-top: 4px;
        text-align: center;
        width: 100%;
        overflow: visible !important;
        text-overflow: clip !important;
        white-space: normal !important;
        word-break: break-word;
        line-height: 1.2;
      }

      /* Horizontal layout specific styles for icon labels */
      /* REMOVE these specific margin adjustments */
      /* .icon-container[style*='flex-direction: row'] .icon-label,
      .icon-container[style*='flex-direction: row-reverse'] .icon-label {
        margin-top: 0;
        text-align: left;
        align-self: center;
      } */

      .icon-state {
        font-size: 0.75em;
        color: var(--secondary-text-color);
        text-align: center;
        white-space: normal !important;
        overflow: visible !important;
        text-overflow: clip !important;
        width: 100%;
      }

      /* Horizontal layout specific styles for icon states */
      /* REMOVE these specific margin adjustments */
      /* .icon-container[style*='flex-direction: row'] .icon-state,
      .icon-container[style*='flex-direction: row-reverse'] .icon-state {
        text-align: left;
        align-self: center;
      } */

      .card-header {
        padding: 8px 16px 16px;
        display: flex;
        width: 100%;
      }

      .card-header.left {
        justify-content: flex-start;
      }

      .card-header.center {
        justify-content: center;
      }

      .card-header.right {
        justify-content: flex-end;
      }

      .card-title.left {
        text-align: left;
      }

      .card-title.center {
        text-align: center;
      }

      .card-title.right {
        text-align: right;
      }

      /* Map Popup Styles */
      .map-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: var(--dialog-z-index, 7); /* Just below HA's dialog z-index */
        backdrop-filter: blur(2px);
      }

      .map-popup-content {
        background-color: var(--ha-card-background, var(--card-background-color, white));
        padding: 0; /* Remove padding, header/map handle spacing */
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        width: 90%;
        max-width: 600px;
        overflow: hidden; /* Contain the map */
        position: relative; /* Ensure proper stacking context */
      }

      .map-popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
        background-color: var(--secondary-background-color);
      }

      .map-popup-title {
        display: flex;
        flex-direction: column;
      }

      .map-popup-header h3 {
        margin: 0;
        font-size: 1.2em;
        color: var(--primary-text-color);
      }

      .map-popup-address {
        font-size: 0.9em;
        color: var(--secondary-text-color);
        margin-top: 4px;
        font-weight: normal;
      }

      .map-popup-header ha-icon-button {
        color: var(--secondary-text-color);
      }

      .map-popup-footer {
        padding: 8px 16px;
        border-top: 1px solid var(--divider-color);
        text-align: center;
      }

      .map-popup-footer a {
        color: var(--primary-color);
        text-decoration: none;
        font-size: 0.9em;
      }

      .map-popup-footer a:hover {
        text-decoration: underline;
      }

      /* Progress bar container styles */
      .bars-container {
        display: flex;
        flex-direction: row; /* Changed from column to row */
        flex-wrap: wrap; /* Allow wrapping */
        gap: 8px; /* Add spacing between bars */
        width: 100%;
        position: relative; /* Create stacking context */
        z-index: 2; /* Above vehicle image */
        margin-top: 8px;
        margin-bottom: 8px;
      }

      .progress-bar-wrapper {
        /* New wrapper class */
        display: flex;
        flex-direction: column;
        flex-shrink: 0; /* Prevent shrinking */
        /* width is set via inline style */
        margin-top: 8px;
        margin-bottom: 8px;
      }

      /* Bar wrapper for applying individual section styles */
      .bar-wrapper {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center; /* Vertically center the bar within the wrapper */
      }

      .progress-bar-container {
        margin-bottom: 8px;
      }

      .progress-bar {
        position: relative;
        height: 16px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        overflow: hidden;
        width: 100%;
      }

      /* Bar width classes */
      .progress-bar.width-25 {
        width: 25%;
      }

      .progress-bar.width-50 {
        width: 50%;
      }

      .progress-bar.width-75 {
        width: 75%;
      }

      .progress-bar.width-100 {
        width: 100%;
      }

      .progress-bar.bar-size-thin {
        height: 8px;
        border-radius: 4px;
      }

      .progress-bar.bar-size-regular {
        height: 16px;
        border-radius: 8px;
      }

      .progress-bar.bar-size-thick {
        height: 24px;
        border-radius: 12px;
      }

      .progress-bar.bar-size-thiccc {
        height: 32px;
        border-radius: 16px;
      }

      .progress-bar-fill {
        position: relative;
        height: 100%;
        width: 0;
        transition:
          width 1s ease,
          background-color 1s ease;
      }

      /* Ensure precise matching of border-radius for progress-bar and fill */
      .progress-bar.bar-radius-rounded-square .progress-bar-fill {
        border-radius: 2px 0 0 2px; /* Left corners always 4px by default */
      }

      /* Special case for outline style with rounded-square - use 2px radius for better appearance */
      .progress-bar.bar-style-outline.bar-radius-rounded-square .progress-bar-fill {
        border-radius: 2px 0 0 2px; /* Left corners always 2px for outline style */
      }

      /* When percentage is 100%, use full border radius */
      .progress-bar.bar-radius-rounded-square .progress-bar-fill[style*='width: 100%'] {
        border-radius: 4px; /* Full rounded corners */
      }

      /* When percentage is 100% with outline style, use full 2px radius */
      .progress-bar.bar-style-outline.bar-radius-rounded-square
        .progress-bar-fill[style*='width: 100%'] {
        border-radius: 2px; /* Full rounded corners with 2px for outline style */
      }

      /* Bar Style Presets */
      /* 1. Flat (Default) - No additional styling */

      /* 2. Glossy - Light reflection effect */
      .progress-bar-fill.bar-style-glossy {
        box-shadow:
          inset 0 2px 0 rgba(255, 255, 255, 0.4),
          inset 0 -2px 0 rgba(0, 0, 0, 0.1);
        background-image: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.25) 0%,
          rgba(255, 255, 255, 0.05) 50%,
          rgba(0, 0, 0, 0.05) 51%,
          rgba(0, 0, 0, 0.1) 100%
        );
      }

      /* 3. Embossed - Raised effect */
      .progress-bar-fill.bar-style-embossed {
        box-shadow:
          inset 0 2px 4px rgba(255, 255, 255, 0.6),
          inset 0 -2px 4px rgba(0, 0, 0, 0.3),
          0 2px 4px rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(0, 0, 0, 0.15);
        margin: -1px;
      }

      /* 7. Outline - Clean bordered design */
      .progress-bar-fill.bar-style-outline {
        height: 100%;
        border-radius: inherit;
        margin-right: 0;
        box-shadow: none;
        position: relative;
      }

      .progress-bar.bar-style-outline {
        border: 2px solid var(--primary-color, rgba(var(--rgb-primary-color, 52, 152, 219), 1));
        background-color: var(--disabled-color, rgba(var(--rgb-primary-color, 52, 152, 219), 0.05));
        overflow: hidden;
        border-radius: inherit;
        padding: 4px;
        box-sizing: border-box;
      }

      /* Special case for square bar with outline style to have a small radius matching the padding */
      .progress-bar.bar-size-thin.bar-style-outline.bar-radius-square {
        border-radius: 4px; /* Match padding for thin bars */
      }

      .progress-bar.bar-size-regular.bar-style-outline.bar-radius-square {
        border-radius: 6px; /* Match padding for regular bars */
      }

      .progress-bar.bar-size-thick.bar-style-outline.bar-radius-square {
        border-radius: 8px; /* Match padding for thick bars */
      }

      .progress-bar.bar-size-thiccc.bar-style-outline.bar-radius-square {
        border-radius: 9px; /* Match padding for extra thick bars */
      }

      /* Adjust the padding for thin bars with outline style */
      .progress-bar.bar-size-thin.bar-style-outline {
        padding: 1px;
        border-width: 1px;
      }

      /* 4. Inset - Recessed effect */
      .progress-bar-fill.bar-style-inset {
        box-shadow:
          inset 1px 1px 2px var(--divider-color, rgba(0, 0, 0, 0.2)),
          inset -1px -1px 1px rgba(255, 255, 255, 0.1);
        overflow: hidden;
      }
      .progress-bar.bar-style-inset {
        box-shadow:
          inset 1px -1px 10px var(--divider-color, rgba(0, 0, 0, 0.1)),
          0 0 10px var(--divider-color, rgba(0, 0, 0, 0.1));
        padding: 3px;
      }

      /* 5. Gradient Overlay - Subtle gradient regardless of fill color */
      .progress-bar-fill.bar-style-gradient {
        background-image: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.5) 0%,
          rgba(255, 255, 255, 0.1) 40%,
          rgba(0, 0, 0, 0.08) 60%,
          rgba(0, 0, 0, 0.1) 100%
        );
      }

      /* 6. Neon Glow - Glowing effect */
      .progress-bar-fill.bar-style-neon {
        box-shadow:
          0 0 7px 2px
            rgba(
              var(--glow-color-r, var(--rgb-primary-color-r, 52)),
              var(--glow-color-g, var(--rgb-primary-color-g, 152)),
              var(--glow-color-b, var(--rgb-primary-color-b, 219)),
              0.7
            ),
          0 0 14px 6px
            rgba(
              var(--glow-color-r, var(--rgb-primary-color-r, 52)),
              var(--glow-color-g, var(--rgb-primary-color-g, 152)),
              var(--glow-color-b, var(--rgb-primary-color-b, 219)),
              0.5
            ),
          0 0 20px 10px
            rgba(
              var(--glow-color-r, var(--rgb-primary-color-r, 52)),
              var(--glow-color-g, var(--rgb-primary-color-g, 152)),
              var(--glow-color-b, var(--rgb-primary-color-b, 219)),
              0.3
            ),
          inset 0 0 10px rgba(255, 255, 255, 0.8);
        border: 1px solid
          rgba(
            var(--glow-color-r, var(--rgb-primary-color-r, 52)),
            var(--glow-color-g, var(--rgb-primary-color-g, 152)),
            var(--glow-color-b, var(--rgb-primary-color-b, 219)),
            0.8
          );
        margin: -1px;
        z-index: 2;
        filter: brightness(1.2);
      }

      /* 7. Material - Material design inspired */
      .progress-bar-fill.bar-style-material {
        transition:
          width 0.5s cubic-bezier(0.4, 0, 0.2, 1),
          background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        height: 100% !important;
        border-radius: inherit !important;
      }
      .progress-bar.bar-style-material {
        height: inherit;
        min-height: 6px;
        overflow: hidden;
        border: none;
        background-color: rgba(var(--rgb-primary-color, 52, 152, 219), 0.15);
        padding: 0;
      }

      /* 8. Glass - Transparent look with blur effect */
      .progress-bar-fill.bar-style-glass {
        background-image: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.25) 0%,
          rgba(255, 255, 255, 0.1) 100%
        );
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        box-shadow:
          inset 0 0 8px rgba(255, 255, 255, 0.8),
          inset 0 0 16px rgba(255, 255, 255, 0.1);
      }
      .progress-bar.bar-style-glass {
        background: rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      /* 9. Metallic - Metallic appearance */
      .progress-bar-fill.bar-style-metallic {
        background-image: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.4) 0%,
          rgba(255, 255, 255, 0.2) 35%,
          rgba(0, 0, 0, 0.1) 50%,
          rgba(0, 0, 0, 0.2) 51%,
          rgba(0, 0, 0, 0.05) 100%
        );
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.6),
          inset 0 -1px 0 rgba(0, 0, 0, 0.25),
          0 1px 2px rgba(0, 0, 0, 0.2);
      }
      .progress-bar.bar-style-metallic {
        background-image: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.2) 0%,
          rgba(0, 0, 0, 0.1) 100%
        );
      }

      /* 10. Neumorphic - Soft UI style */
      .progress-bar-fill.bar-style-neumorphic {
        border-radius: inherit !important;
        box-shadow:
          inset 2px 2px 5px rgba(0, 0, 0, 0.15),
          inset -2px -2px 5px rgba(255, 255, 255, 0.15);
      }
      .progress-bar.bar-style-neumorphic {
        background-color: var(--card-background-color, #f0f0f0);
        border: none;
        box-shadow:
          inset 2px 2px 5px rgba(0, 0, 0, 0.1),
          inset -2px -2px 5px rgba(255, 255, 255, 0.1),
          5px 5px 10px rgba(0, 0, 0, 0.05),
          -5px -5px 10px rgba(255, 255, 255, 0.05);
        padding: 3px;
      }

      /* 11. Dashed - Dashed line effect */
      .progress-bar-fill.bar-style-dashed {
        background-image: repeating-linear-gradient(
          90deg,
          currentColor 0px,
          /* Use currentColor instead of var(--bar-color) */ currentColor 5px,
          /* Length of the dash (5px) */ transparent 5px,
          /* Start of the gap */ transparent 10px
            /* End of the gap (5px dash + 5px gap = 10px total) */
        );
        background-size: 10px 100%; /* Width of one dash + gap cycle (5px + 5px) */
        background-color: transparent; /* No solid background */
        box-shadow: none; /* Remove other shadows */
      }

      /* For full/cropped gradients with dashed style, apply a mask pattern */
      .progress-bar-fill.bar-style-dashed[data-mode='full'],
      .progress-bar-fill.bar-style-dashed[data-mode='cropped'] {
        /* Create a mask effect over the gradient background */
        mask-image: repeating-linear-gradient(
          90deg,
          black 0px,
          black 5px,
          transparent 5px,
          transparent 10px
        );
        -webkit-mask-image: repeating-linear-gradient(
          90deg,
          black 0px,
          black 5px,
          transparent 5px,
          transparent 10px
        );
        mask-size: 10px 100%;
        -webkit-mask-size: 10px 100%;
      }

      /* Optional: Styling for the container when dashed */
      .progress-bar.bar-style-dashed {
        background-color: transparent !important; /* Force transparent background for gaps */
        border: none; /* Remove border if you want only dashes */
        /* padding: 1px;  Add padding if border is removed */
      }

      /* NEW: CSS Mask for dashed gradient (full/cropped modes) */
      .progress-bar-fill[data-mask-style='dashed'] {
        mask-image: repeating-linear-gradient(
          90deg,
          black 0px,
          /* Opaque part for the dash */ black 5px,
          /* End of opaque dash */ transparent 5px,
          /* Start of transparent gap */ transparent 10px /* End of transparent gap */
        );
        mask-size: 10px 100%; /* Size of one cycle */
        mask-repeat: repeat-x; /* Repeat horizontally */
        /* Add -webkit- prefix for compatibility */
        -webkit-mask-image: repeating-linear-gradient(
          90deg,
          black 0px,
          black 5px,
          transparent 5px,
          transparent 10px
        );
        -webkit-mask-size: 10px 100%;
        -webkit-mask-repeat: repeat-x;
        /* Ensure no background color interferes with the masked gradient */
        background-color: transparent !important;
      }

      /* Animation classes fix to follow border radius */
      .progress-bar-fill.animate-charging-lines::before,
      .progress-bar-fill.animate-rainbow::before,
      .progress-bar-fill.animate-ripple::before,
      .progress-bar-fill.animate-wave::before,
      .progress-bar-fill.animate-traffic::before,
      .progress-bar-fill.animate-glow::after,
      .progress-bar-fill.animate-bubbles::before,
      .progress-bar-fill.animate-bubbles::after,
      .progress-bar-fill.animate-bubbles span::before,
      .progress-bar-fill.animate-bubbles span::after,
      .progress-bar-fill.animate-progress-spinner::before,
      .progress-bar-fill.animate-shimmer::before {
        border-radius: inherit;
        overflow: hidden;
      }

      /* Gradient styles */
      .progress-bar-fill[has-gradient='true'] {
        z-index: 2;
      }

      /* Full gradient mode */
      .progress-bar-fill[has-gradient='true'][data-mode='full'] {
        background-color: transparent !important;
        background-size: 100% 100% !important;
        background-position: 0% 0% !important;
        background-repeat: no-repeat !important;
      }

      /* Animations for progress bars */
      @keyframes charging-lines {
        0% {
          background-position: 0 0;
        }
        100% {
          background-position: 50px 0;
        } /* Only move horizontally */
      }

      @keyframes pulse {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
        100% {
          opacity: 1;
        }
      }

      @keyframes blinking {
        0% {
          opacity: 1;
        }
        49% {
          opacity: 1;
        }
        50% {
          opacity: 0;
        }
        99% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }

      @keyframes bouncing {
        0% {
          transform: scaleY(1);
        }
        50% {
          transform: scaleY(0.8);
        }
        100% {
          transform: scaleY(1);
        }
      }

      @keyframes glow {
        0% {
          box-shadow:
            0 0 10px 3px
              rgba(
                var(--glow-color-r, var(--rgb-primary-color-r, 52)),
                var(--glow-color-g, var(--rgb-primary-color-g, 152)),
                var(--glow-color-b, var(--rgb-primary-color-b, 219)),
                0.7
              ),
            0 0 20px 6px
              rgba(
                var(--glow-color-r, var(--rgb-primary-color-r, 52)),
                var(--glow-color-g, var(--rgb-primary-color-g, 152)),
                var(--glow-color-b, var(--rgb-primary-color-b, 219)),
                0.4
              );
          opacity: 0.7;
        }
        50% {
          box-shadow:
            0 0 20px 5px
              rgba(
                var(--glow-color-r, var(--rgb-primary-color-r, 52)),
                var(--glow-color-g, var(--rgb-primary-color-g, 152)),
                var(--glow-color-b, var(--rgb-primary-color-b, 219)),
                0.9
              ),
            0 0 40px 10px
              rgba(
                var(--glow-color-r, var(--rgb-primary-color-r, 52)),
                var(--glow-color-g, var(--rgb-primary-color-g, 152)),
                var(--glow-color-b, var(--rgb-primary-color-b, 219)),
                0.6
              );
          opacity: 0.9;
        }
        100% {
          box-shadow:
            0 0 10px 3px
              rgba(
                var(--glow-color-r, var(--rgb-primary-color-r, 52)),
                var(--glow-color-g, var(--rgb-primary-color-g, 152)),
                var(--glow-color-b, var(--rgb-primary-color-b, 219)),
                0.7
              ),
            0 0 20px 6px
              rgba(
                var(--glow-color-r, var(--rgb-primary-color-r, 52)),
                var(--glow-color-g, var(--rgb-primary-color-g, 152)),
                var(--glow-color-b, var(--rgb-primary-color-b, 219)),
                0.4
              );
          opacity: 0.7;
        }
      }

      @keyframes rainbow {
        0% {
          filter: hue-rotate(0deg);
        }
        100% {
          filter: hue-rotate(360deg);
        }
      }

      /* MODIFIED: Keyframes for Fill (changed from fill-pulse) */
      @keyframes fill-grow {
        0% {
          transform: scaleX(0);
        }
        50% {
          transform: scaleX(1);
        } /* Grow full */
        100% {
          transform: scaleX(0);
        } /* Shrink back to loop */
      }

      /* NEW: Keyframes for new animations */
      @keyframes ripple {
        0%,
        100% {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 0%);
        }
        20% {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, transparent 20%);
        }
        40% {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 20%, transparent 40%);
        }
        60% {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 30%, transparent 60%);
        }
        80% {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 40%, transparent 80%);
        }
      }

      @keyframes wave {
        0% {
          clip-path: path('M0,50 Q25,45 50,50 Q75,55 100,50 V100 H0 Z');
        }
        25% {
          clip-path: path('M0,50 Q25,55 50,50 Q75,45 100,50 V100 H0 Z');
        }
        50% {
          clip-path: path('M0,50 Q25,55 50,60 Q75,55 100,50 V100 H0 Z');
        }
        75% {
          clip-path: path('M0,50 Q25,45 50,50 Q75,55 100,50 V100 H0 Z');
        }
        100% {
          clip-path: path('M0,50 Q25,45 50,50 Q75,55 100,50 V100 H0 Z');
        }
      }

      @keyframes traffic {
        0% {
          background-position: 0 0;
        }
        100% {
          background-position: 30px 0;
        }
      }

      @keyframes heartbeat {
        0%,
        100% {
          transform: scale(1);
        }
        15% {
          transform: scale(1.1);
        }
        30% {
          transform: scale(1);
        }
        45% {
          transform: scale(1.15);
        }
        60% {
          transform: scale(1);
        }
      }

      @keyframes slide-in {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(0);
        }
      }

      @keyframes flicker {
        0%,
        100% {
          opacity: 1;
        }
        41%,
        45% {
          opacity: 0.75;
        }
        48%,
        52% {
          opacity: 0.9;
        }
        53%,
        58% {
          opacity: 0.78;
        }
        62%,
        69% {
          opacity: 0.92;
        }
        74%,
        78% {
          opacity: 0.85;
        }
        83%,
        89% {
          opacity: 0.95;
        }
      }

      @keyframes progress-spinner {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes shimmer {
        0% {
          filter: brightness(1);
        }
        25% {
          filter: brightness(1.3);
        }
        50% {
          filter: brightness(1);
        }
        75% {
          filter: brightness(1.3);
        }
        100% {
          filter: brightness(1);
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

      /* Animation classes */
      /* MODIFIED: Added background-color and opacity (KEEPING THESE) */
      .progress-bar-fill.animate-charging-lines::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: transparent;
        background-image: linear-gradient(
          -45deg,
          rgba(255, 255, 255, 0.3) 25%,
          transparent 25%,
          transparent 50%,
          rgba(255, 255, 255, 0.3) 50%,
          rgba(255, 255, 255, 0.3) 75%,
          transparent 75%,
          transparent
        );
        background-size: 50px 50px;
        animation: charging-lines 1.5s linear infinite; /* Adjusted speed slightly */
        pointer-events: none;
        z-index: 3;
        opacity: 1;
      }

      .progress-bar-fill.animate-pulse {
        animation: pulse 1.5s ease-in-out infinite;
      }

      .progress-bar-fill.animate-blinking {
        animation: blinking 1s step-end infinite;
      }

      .progress-bar-fill.animate-bouncing {
        animation: bouncing 0.8s ease-in-out infinite;
        transform-origin: center;
      }

      .progress-bar-fill.animate-glow::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        animation: glow 2s ease-in-out infinite;
        z-index: 3;
      }

      .progress-bar-fill.animate-rainbow::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          to right,
          rgba(255, 0, 0, 0.5),
          rgba(255, 165, 0, 0.5),
          rgba(255, 255, 0, 0.5),
          rgba(0, 128, 0, 0.5),
          rgba(0, 0, 255, 0.5),
          rgba(75, 0, 130, 0.5),
          rgba(238, 130, 238, 0.5)
        );
        mix-blend-mode: overlay;
        animation: rainbow 3s linear infinite;
        pointer-events: none;
        z-index: 3;
      }

      /* MODIFIED: Use fill-grow animation for .animate-fill */
      .progress-bar-fill.animate-fill {
        animation: fill-grow 2s ease-in-out infinite; /* Use new animation */
        transform-origin: left; /* Ensure growth starts from the left */
      }

      /* NEW: Animation classes for the new types */
      .progress-bar-fill.animate-ripple::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        animation: ripple 1.5s ease-out infinite; /* Keep faster duration */
        background-size: 200% 100%; /* Restore original background size */
        background-position: center;
        pointer-events: none;
        z-index: 3;
      }

      .progress-bar-fill.animate-wave::before {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        background: white; /* whatever wave color you want */
        animation: wave 3s ease-in-out infinite;
        clip-path: path('M0,50 Q25,45 50,50 Q75,55 100,50 V100 H0 Z');
        will-change: clip-path;
      }

      .progress-bar-fill.animate-traffic::before {
        content: '';
        position: absolute;
        inset: 0px;
        background-image: repeating-linear-gradient(
          90deg,
          transparent 0px,
          transparent 5px,
          rgba(255, 255, 255, 0.3) 10px,
          rgba(255, 255, 255, 0.3) 15px
        );
        background-size: 30px 100%;
        animation: traffic 0.5s linear infinite;
        will-change: background-position;
        pointer-events: none;
        z-index: 3;
      }

      .progress-bar-fill.animate-heartbeat {
        animation: heartbeat 1.5s ease-in-out infinite;
        transform-origin: center;
      }

      .progress-bar-fill.animate-slide-in {
        animation: slide-in 0.8s ease-out;
        animation-fill-mode: both;
      }

      .progress-bar-fill.animate-flicker {
        animation: flicker 3s linear infinite;
      }

      .progress-bar-fill.animate-progress-spinner::before {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: progress-spinner 1s linear infinite;
        z-index: 3;
      }

      .progress-bar-fill.animate-shimmer {
        animation: shimmer 2.5s ease-in-out infinite;
        position: relative;
      }

      .progress-bar-fill.animate-shimmer::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent);
        transform: skewX(-25deg);
        animation: shimmer 2.5s ease-in-out infinite;
      }

      .progress-bar-fill.animate-vibrate {
        animation: vibrate 0.5s linear infinite;
      }

      /* Bubble animation */
      @keyframes bubble-float {
        0% {
          transform: translateY(100%) scale(0.8);
          opacity: 0.6;
        }
        100% {
          transform: translateY(-100%) scale(1.2);
          opacity: 0;
        }
      }

      .progress-bar-fill.animate-bubbles {
        position: relative;
        overflow: hidden;
      }

      .progress-bar-fill.animate-bubbles::before,
      .progress-bar-fill.animate-bubbles::after,
      .progress-bar-fill.animate-bubbles span::before,
      .progress-bar-fill.animate-bubbles span::after {
        content: '';
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        animation: bubble-float 2.5s infinite linear;
      }

      .progress-bar-fill.animate-bubbles::before {
        width: 15px;
        height: 15px;
        left: 10%;
        animation-delay: 0s;
      }

      .progress-bar-fill.animate-bubbles::after {
        width: 12px;
        height: 12px;
        left: 40%;
        animation-delay: 0.5s;
      }

      .progress-bar-fill.animate-bubbles span {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      .progress-bar-fill.animate-bubbles span::before {
        width: 8px;
        height: 8px;
        left: 60%;
        animation-delay: 1s;
      }

      .progress-bar-fill.animate-bubbles span::after {
        width: 10px;
        height: 10px;
        left: 80%;
        animation-delay: 1.5s;
      }

      /* Limit indicator */
      .limit-indicator {
        position: absolute;
        top: 0;
        height: 100%;
        width: 2px;
        background-color: #ff0000;
        z-index: 3; /* Reduced from 10 to stay below dialog-z-index (8) but above bar elements */
      }

      .bar-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        width: 100%;
      }

      .bar-label {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 2px; /* Reduced from 10px to create tighter grouping */
        cursor: pointer;
        padding: 4px 0; /* Keep vertical padding */
      }

      .bar-label.left {
        justify-content: flex-start;
        padding-right: 8px;
      }

      .bar-label.right {
        justify-content: flex-end;
        padding-left: 8px;
      }

      .label-title {
        font-size: 0.85em;
        opacity: 0.9;
        color: var(--secondary-text-color);
        padding-right: 0; /* Remove padding, we'll use gap */
      }

      .label-value {
        font-size: 1em;
        font-weight: 500;
        color: var(--secondary-text-color);
        padding-left: 0; /* Remove padding, we'll use gap */
      }

      .label-separator {
        color: var(--secondary-text-color);
        opacity: 0.8;
        margin: 0; /* Remove margin, rely on parent gap */
      }

      /* Layout styles */
      .content {
        display: flex;
        flex-direction: column;
        padding: 16px 0;
        width: 100%;
      }

      .content.single {
        /* Single column layout - default */
      }

      .content.double {
        flex-direction: row;
        flex-wrap: wrap;
      }

      .content.double > * {
        width: 50%;
        box-sizing: border-box;
        padding: 0 8px;
        padding-right: 16px;
      }

      /* Add style for pending state if needed */
      .icon-container.pending-state {
        /* Optional: slightly dim or add other visual cue while pending */
        /* opacity: 0.8; */
      }

      /* Style for icons awaiting confirmation click */
      .icon-container.awaiting-confirmation {
        animation: pulse 1.5s infinite;
        box-shadow: 0 0 0 2px var(--primary-color);
        border-radius: 8px;
      }

      /* Add style for the percentage text */
      .percentage-text {
        position: absolute;
        right: 5px;
        top: 50%;
        transform: translateY(-50%);
        font-weight: 500;
        text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.8);
        padding: 0 2px;
        user-select: none;
        white-space: nowrap;
      }

      /* Dashboard-specific icon styling */
      .dashboard-icon-row {
        margin-bottom: 8px;
      }

      /* Optimize icon display in side sections */
      .left-middle-section .icon-container,
      .right-middle-section .icon-container {
        padding: 6px 8px;
        border-radius: 8px;
        align-items: center !important;
      }

      /* Optimize icon spacing for vertical layout */
      .left-middle-section .icon-container[style*='flex-direction: column'],
      .right-middle-section .icon-container[style*='flex-direction: column'] {
        gap: 4px !important;
      }

      /* Adjust icon size in side sections - make text smaller */
      .left-middle-section .icon-label,
      .right-middle-section .icon-label,
      .left-middle-section .icon-state,
      .right-middle-section .icon-state {
        font-size: 0.8em;
      }

      /* Set hover effect for dashboard icons */
      .left-middle-section .icon-container:hover,
      .right-middle-section .icon-container:hover {
        background-color: rgba(var(--rgb-primary-color), 0.15);
      }

      /* Animation classes fix to follow border radius */
      .progress-bar-fill.animate-charging-lines::before,
      .progress-bar-fill.animate-rainbow::before,
      .progress-bar-fill.animate-ripple::before,
      .progress-bar-fill.animate-wave::before,
      .progress-bar-fill.animate-traffic::before,
      .progress-bar-fill.animate-glow::after,
      .progress-bar-fill.animate-bubbles::before,
      .progress-bar-fill.animate-bubbles::after,
      .progress-bar-fill.animate-bubbles span::before,
      .progress-bar-fill.animate-bubbles span::after,
      .progress-bar-fill.animate-progress-spinner::before,
      .progress-bar-fill.animate-shimmer::before {
        border-radius: inherit;
        overflow: hidden;
      }

      /* NEW: Section Break Styles */
      .section-break {
        /* width is controlled inline by style attribute */
        /* Center the break horizontally using transform */
        position: relative;
        left: 50%;
        transform: translateX(-50%);
        /* Add padding matching the negative margin to keep *internal* content aligned (if break has content, e.g., text later) */
        /* padding-left: var(--card-padding, 16px); */ /* Commented out for now as breaks are visual only */
        /* padding-right: var(--card-padding, 16px); */
        box-sizing: border-box;
        z-index: 2;

        border-top-style: solid;
        border-top-color: var(--break-color, var(--divider-color));
        border-top-width: var(--break-thickness, 1px); /* UPDATED variable */
      }

      .section-break.break-style-line {
        border-top-style: solid;
        border-top-color: var(--break-color, var(--divider-color));
        border-top-width: var(--break-thickness, 1px); /* UPDATED variable */
      }

      .section-break.break-style-double_line {
        border-top-style: double;
        border-top-color: var(--break-color, var(--divider-color));
        /* Double line needs more width */
        border-top-width: calc(var(--break-thickness, 1px) * 3); /* UPDATED variable */
      }

      .section-break.break-style-dotted {
        border-top-style: dotted;
        border-top-color: var(--break-color, var(--divider-color));
        border-top-width: var(--break-thickness, 1px); /* UPDATED variable */
      }

      .section-break.break-style-double_dotted {
        /* Simulate double dotted with pseudo-element */
        border-top: none;
        height: calc(var(--break-thickness, 1px) * 2 + 2px); /* UPDATED variable */
      }
      .section-break.break-style-double_dotted::before,
      .section-break.break-style-double_dotted::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        height: var(--break-thickness, 1px); /* UPDATED variable */
        background-image: linear-gradient(
          to right,
          var(--break-color, var(--divider-color)) 60%,
          transparent 0%
        );
        background-size: 6px var(--break-thickness, 1px); /* UPDATED variable */
        background-repeat: repeat-x;
      }
      .section-break.break-style-double_dotted::before {
        top: 0;
      }
      .section-break.break-style-double_dotted::after {
        bottom: 0;
      }

      .section-break.break-style-shadow {
        border-top: none;
        height: calc(var(--break-thickness, 1px) * 2); /* UPDATED variable */
        background: linear-gradient(to bottom, var(--break-color, rgba(0, 0, 0, 0.1)), transparent);
      }

      /* Section Break Container and Title Styles */
      .section-break-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        position: relative;
        z-index: 2;
      }

      .section-break-title {
        padding: 8px 32px;
        border-radius: 4px;
        position: relative;
        z-index: 3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 90%;
      }

      /* Section Break with Title in Middle of Line */
      .section-break-with-title {
        /* Styles are now handled inline in the template */
      }

      /* ... other cropper styles ... */

      /* NEW: Info Rows Styling */
      .info-rows-container {
        display: flex;
        flex-direction: column;
        gap: 8px; /* Space between rows */
        width: 100%;
        position: relative; /* Create stacking context */
        z-index: 2; /* Above vehicle image */
        margin-top: 8px;
        margin-bottom: 8px;
      }

      /* Info row styles are handled inline */

      .info-row-item {
        /* Styles for individual rows are applied inline via _renderSingleInfoRow */
        /* This class is mostly for targeting if needed */
      }

      .info-entity-item {
        /* Styles for individual entities are applied inline via _renderSingleInfoEntity */
        /* This class is for targeting and ensuring consistent behavior if needed */
        line-height: 1.4; /* Improve readability */
        display: flex;
        flex-direction: row;
        /* align-items removed to allow row-level vertical alignment to work */
        padding: 8px;
        min-width: 0;
      }

      .info-entity-item ha-icon {
        margin-right: 8px;
      }

      .info-entity-item > div {
        min-width: 0;
        overflow: hidden;
      }

      /* Dashboard-specific info entity styling */
      .left-middle-section .info-entity-item,
      .right-middle-section .info-entity-item {
        padding: 4px 6px; /* Reduced padding for dashboard layout */
        min-height: auto;
        /* align-items: inherit allows the row's vertical alignment to control entity alignment */
        align-items: inherit;
      }

      .left-middle-section .info-entity-item > div,
      .right-middle-section .info-entity-item > div {
        overflow: visible; /* Allow text to wrap instead of hiding */
        word-wrap: break-word;
        word-break: break-word;
        hyphens: auto;
        flex: 1; /* Take available space */
      }

      /* Allow text wrapping in dashboard info entities */
      .left-middle-section .info-entity-item div[style*='white-space: nowrap'],
      .right-middle-section .info-entity-item div[style*='white-space: nowrap'] {
        white-space: normal !important; /* Override inline nowrap */
        text-overflow: initial !important; /* Remove ellipsis */
        max-width: none !important; /* Remove width constraint */
      }

      /* Optimize dashboard grid spacing for better text display */
      /* Gap is now controlled by Middle Spacing setting in editor */

      /* Responsive adjustment for smaller screens */
      @media (max-width: 768px) {
        .left-middle-section,
        .right-middle-section {
          max-width: none; /* Remove width constraints on mobile */
        }

        /* Gap is controlled by Middle Spacing setting for all screen sizes */
      }

      /* NEW LAYOUT STYLES */
      .half-full-layout,
      .full-half-layout {
        display: flex;
        flex-direction: column;
      }

      .half-full-layout .half-full-row1,
      .full-half-layout .full-half-row2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }

      .half-full-layout .half-full-row2,
      .full-half-layout .full-half-row1 {
        /* These rows will take full width by default as direct children of a flex column */
      }

      /* Ensure columns within these layouts behave correctly */
      .half-full-layout .column,
      .full-half-layout .column {
        display: flex;
        flex-direction: column;
        gap: 0; /* Explicitly remove gap for these layouts */
        min-width: 0; /* Prevent overflow */
      }

      .section-title {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .image-container {
        text-align: center;
        position: relative;
        overflow: hidden; /* Ensures image respects border radius if any */
      }

      .vehicle-image {
        max-width: 100%;
        height: auto;
        object-fit: contain;
        border-radius: var(--ha-card-border-radius, 4px);
        transition: transform 0.3s ease-in-out;
      }

      .image-placeholder {
        width: 100%;
        height: 200px; /* Default placeholder height */
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--divider-color);
        color: var(--secondary-text-color);
        border-radius: var(--ha-card-border-radius, 4px);
      }
      /* Old .bars-container, can be removed if no longer used by legacy or other parts */
      /* For now, let's assume it might be used by legacy 'bars' section, adjust if confirmed not needed */
      .bars-container {
        display: flex;
        flex-direction: column;
        gap: 4px; /* Reduced gap for better space utilization */
      }

      /* New styles for row-based bar layout */
      .bars-rows-container {
        display: flex;
        flex-direction: column; /* Each .bar-row will be a new line */
        gap: var(--uvc-bar-spacing, 4px); /* Reduced gap for better space utilization */
        width: 100%; /* Ensure it takes full available width */
      }
      .bar-row {
        display: flex;
        flex-direction: row; /* Bars within a row are horizontal */
        align-items: stretch; /* Make bars in a row same height if desired, or flex-start */
        gap: var(--uvc-bar-spacing, 4px); /* Reduced gap for better space utilization */
        width: 100%; /* Ensure it takes full available width */
        /* justify-content is now set dynamically */
      }
      .bar-wrapper {
        /* border: 1px dashed green; */ /* Debugging */
        box-sizing: border-box; /* Important for width + padding */
        display: flex; /* To allow the inner bar to fill this wrapper */
        flex-direction: column; /* Bar itself is a column */
        justify-content: center; /* Vertically center the bar within the wrapper */
      }
      /* Ensure the user-identified 'progress-bar-wrapper' fills the .bar-wrapper */
      .bar-wrapper > .progress-bar-wrapper {
        width: 100% !important; /* Override incorrect inline fractional widths */
        box-sizing: border-box;
      }
      /* Individual bar styling, including animations, colors, etc. */
      .bar {
        position: relative;
        height: 16px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        overflow: hidden;
        width: 100%;
      }

      /* Icon Animation Keyframes for state-based animations */
      @keyframes pulse-icon {
        0% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.7;
          transform: scale(1.1);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes vibrate-icon {
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

      @keyframes rotate-left-icon {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(-360deg);
        }
      }

      @keyframes rotate-right-icon {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes hover-icon {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-5px);
        }
      }

      @keyframes fade-icon {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.4;
        }
      }

      @keyframes scale-icon {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(0.8);
        }
      }

      @keyframes bounce-icon {
        0%,
        20%,
        50%,
        80%,
        100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-8px);
        }
        60% {
          transform: translateY(-4px);
        }
      }

      @keyframes shake-icon {
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

      @keyframes tada-icon {
        0% {
          transform: scale(1) rotate(0deg);
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
          transform: scale(1) rotate(0deg);
        }
      }

      /* Animation classes for icons */
      .icon-container ha-icon.animate-pulse {
        animation: pulse-icon 2s ease infinite;
      }

      .icon-container ha-icon.animate-vibrate {
        animation: vibrate-icon 0.5s linear infinite;
      }

      .icon-container ha-icon.animate-rotate-left {
        animation: rotate-left-icon 2s linear infinite;
      }

      .icon-container ha-icon.animate-rotate-right {
        animation: rotate-right-icon 2s linear infinite;
      }

      .icon-container ha-icon.animate-hover {
        animation: hover-icon 2s ease-in-out infinite;
      }

      .icon-container ha-icon.animate-fade {
        animation: fade-icon 2s ease-in-out infinite;
      }

      .icon-container ha-icon.animate-scale {
        animation: scale-icon 2s ease-in-out infinite;
      }

      .icon-container ha-icon.animate-bounce {
        animation: bounce-icon 2s ease infinite;
      }

      .icon-container ha-icon.animate-shake {
        animation: shake-icon 0.8s ease-in-out infinite;
      }

      .icon-container ha-icon.animate-tada {
        animation: tada-icon 2s ease infinite;
      }
    `}setConfig(e){if(!e)throw new Error("Invalid configuration");const t=this.config;JSON.stringify(null==t?void 0:t.icon_rows)!==JSON.stringify(null==e?void 0:e.icon_rows)&&this._iconActiveStates.clear();const i={show_units:!0,formatted_entities:!0,show_location:!0,show_mileage:!0,show_car_state:!0,show_info_icons:!0,vehicle_image_width:100,title_bold:!0};let n=Object.assign({},e);void 0!==n.vehicle_image_width?n=Object.assign(Object.assign({},n),{vehicle_image_width:Number(n.vehicle_image_width)}):n.vehicle_image_width=i.vehicle_image_width,this.config=Object.assign(Object.assign({},i),n),this._migrateBarsToIndividual(),this._cleanupInfoSections(),this._templateService&&this.hass&&this._templateService.updateHass(this.hass),this._lastRenderTime=Date.now(),this.requestUpdate(),t&&this._checkForGradientOrAnimationChanges(t,this.config)&&this._forceFullRender(),this._stateRestored=!1,this._restoreStateFromStorage(),setTimeout((()=>{this._subscribeToDynamicTemplates()}),50)}_migrateBarsToIndividual(){var e,t;if(!(null===(e=this.config)||void 0===e?void 0:e.sections_order)||!(null===(t=this.config.bars)||void 0===t?void 0:t.length))return;let i=[...this.config.sections_order],n=!1;const a=i.indexOf("bars"),o=i.filter((e=>e.startsWith("bar_")));if(o.length>0){const e=new Set;o.some((t=>!!e.has(t)||(e.add(t),!1)))&&(i=i.filter((e=>!e.startsWith("bar_"))),n=!0)}if(-1!==a)if(o.length>0){i.splice(a,1);const e=o.map((e=>parseInt(e.substring(4)))).filter((e=>!isNaN(e))),t=Math.max(...o.map((e=>i.indexOf(e))).filter((e=>-1!==e)),-1),r=[];for(let t=0;t<this.config.bars.length;t++)e.includes(t)||r.push(`bar_${t}`);r.length>0&&-1!==t&&(i.splice(t+1,0,...r),n=!0)}else{const e=this.config.bars.map(((e,t)=>`bar_${t}`));i.splice(a,1,...e),n=!0}else if(o.length>0&&o.length<this.config.bars.length){const e=o.map((e=>parseInt(e.substring(4)))).filter((e=>!isNaN(e))).sort(((e,t)=>e-t)),t=i.findIndex((t=>t===`bar_${e[e.length-1]}`)),a=[];for(let t=0;t<this.config.bars.length;t++)e.includes(t)||a.push(`bar_${t}`);a.length>0&&-1!==t&&(i.splice(t+1,0,...a),n=!0)}else if(o.length>0&&o.length!==this.config.bars.length){i=i.filter((e=>!e.startsWith("bar_")));const e=this.config.bars.map(((e,t)=>`bar_${t}`));if(i.includes("info")){const t=i.indexOf("info");i.splice(t+1,0,...e)}else if(i.includes("image")){const t=i.indexOf("image");i.splice(t+1,0,...e)}else i.push(...e);n=!0}n&&(this.config=Object.assign(Object.assign({},this.config),{sections_order:i}),this._saveConfigChanges())}_cleanupInfoSections(){var e,t;if(!(null===(e=this.config)||void 0===e?void 0:e.sections_order)||!(null===(t=this.config.info_rows)||void 0===t?void 0:t.length))return;const i=[...this.config.sections_order],n=i.indexOf("info"),a=i.some((e=>e.startsWith("info_row_")));-1!==n&&a&&(i.splice(n,1),this.config=Object.assign(Object.assign({},this.config),{sections_order:i}),this._saveConfigChanges())}_saveConfigChanges(){const e=new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0});this.dispatchEvent(e)}_checkForGradientOrAnimationChanges(e,t){if(!e.bars||!t.bars)return!0;for(let i=0;i<Math.max(e.bars.length,t.bars.length);i++){const n=e.bars[i],a=t.bars[i];if(!n||!a)return!0;if(n.use_gradient!==a.use_gradient)return!0;if(n.gradient_display_mode!==a.gradient_display_mode)return!0;if(n.limit_entity!==a.limit_entity)return!0;if(n.limit_indicator_color!==a.limit_indicator_color)return!0;if(JSON.stringify(n.gradient_stops)!==JSON.stringify(a.gradient_stops))return!0;if(n.animation_type!==a.animation_type)return!0;if(n.animation_entity!==a.animation_entity)return!0;if(n.animation_state!==a.animation_state)return!0;if(n.action_animation!==a.action_animation)return!0;if(n.action_animation_entity!==a.action_animation_entity)return!0;if(n.action_animation_state!==a.action_animation_state)return!0}return!1}_forceFullRender(){this._lastRenderTime=Date.now(),this.requestUpdate(),setTimeout((()=>{this.shadowRoot&&this.shadowRoot.querySelectorAll(".progress-bar-fill").forEach((e=>{if(e instanceof HTMLElement){e.offsetHeight;const t=e.getAttribute("has-gradient"),i=e.getAttribute("data-mode");if("true"===t)if("full"===i)e.style.backgroundSize="100% 100%",e.style.backgroundPosition="0% 0%";else if("value_based"===i){const t=e.style.width;e.style.backgroundSize=`${t} 100%`}e.setAttribute("data-refreshed",String(this._lastRenderTime))}}))}),50)}_renderModularLayout(){if(!this.config.layout)return Z`<div>Error: Modular layout configuration missing</div>`;const e=this.config.layout,t=Z`
      <div
        class="modular-rows-container"
        style="display: flex; flex-direction: column; gap: ${e.gap||16}px;"
      >
        ${e.rows.map((e=>this._renderModularRow(e)))}
      </div>
    `;return Z`
      <ha-card
        style="${this.config.card_background?`background: ${this.config.card_background};`:""}"
      >
        <div class="card-content">${t}</div>
      </ha-card>
    `}_renderModularRow(e){var t;if(e.conditional_entity&&e.conditional_state){const i=null===(t=this.hass.states[e.conditional_entity])||void 0===t?void 0:t.state;if(!("show"===e.conditional_type?i===e.conditional_state:i!==e.conditional_state))return Z``}let i="";e.background_color&&(i+=`background-color: ${e.background_color};`),e.padding&&(i+=`padding: ${e.padding}px;`),e.margin&&(i+=`margin: ${e.margin}px 0;`),e.border_radius&&(i+=`border-radius: ${e.border_radius}px;`),e.border_color&&e.border_width&&(i+=`border: ${e.border_width}px solid ${e.border_color};`);const n=e.columns.length;let a=`display: flex; gap: ${e.gap||8}px;`;if(n>1&&e.column_layout){const t=this._getColumnWidths(e.column_layout,n);return a+=" align-items: stretch;",Z`
        <div class="modular-row" style="${i}">
          <div class="columns-container" style="${a}">
            ${e.columns.map(((e,i)=>this._renderModularColumn(e,t[i]||"auto")))}
          </div>
        </div>
      `}return Z`
      <div class="modular-row" style="${i}">
        <div class="columns-container" style="${a}">
          ${e.columns.map((e=>this._renderModularColumn(e,"100%")))}
        </div>
      </div>
    `}_getColumnWidths(e,t){switch(e){case"50-50":return["50%","50%"];case"30-70":return["30%","70%"];case"70-30":return["70%","30%"];case"40-60":return["40%","60%"];case"60-40":return["60%","40%"];case"33-33-33":return["33.33%","33.33%","33.33%"];case"25-50-25":return["25%","50%","25%"];case"20-60-20":return["20%","60%","20%"];case"25-25-25-25":return["25%","25%","25%","25%"];default:return Array(t).fill("100%")}}_renderModularColumn(e,t){var i;if(e.conditional_entity&&e.conditional_state){const t=null===(i=this.hass.states[e.conditional_entity])||void 0===i?void 0:i.state;if(!("show"===e.conditional_type?t===e.conditional_state:t!==e.conditional_state))return Z``}let n=`flex: 0 0 ${t}; min-width: 0;`;e.background_color&&(n+=` background-color: ${e.background_color};`),e.padding&&(n+=` padding: ${e.padding}px;`),e.margin&&(n+=` margin: ${e.margin}px;`),e.border_radius&&(n+=` border-radius: ${e.border_radius}px;`),e.border_color&&e.border_width&&(n+=` border: ${e.border_width}px solid ${e.border_color};`);let a="display: flex; flex-direction: column; gap: 8px; height: 100%;";if(e.vertical_alignment)switch(e.vertical_alignment){case"top":a+=" justify-content: flex-start;";break;case"center":a+=" justify-content: center;";break;case"bottom":a+=" justify-content: flex-end;";break;case"stretch":a+=" justify-content: stretch;"}if(e.horizontal_alignment)switch(e.horizontal_alignment){case"left":a+=" align-items: flex-start;";break;case"center":a+=" align-items: center;";break;case"right":a+=" align-items: flex-end;";break;case"stretch":a+=" align-items: stretch;"}return Z`
      <div class="modular-column" style="${n}">
        <div class="modules-container" style="${a}">
          ${e.modules.map((e=>this._renderModularModule(e)))}
        </div>
      </div>
    `}_renderModularModule(e){switch(e.type){case"text":return this._renderTextModule(e);case"separator":return this._renderSeparatorModule(e);case"image":return this._renderImageModule(e);case"info":return this._renderInfoModule(e);case"bar":return this._renderBarModule(e);case"icon":return this._renderIconModule(e);default:return Z`<div>Unknown module type: ${e.type}</div>`}}_renderImageModule(e){return Z`
      <div class="image-module">
        <div
          style="text-align: center; padding: 20px; border: 1px dashed var(--divider-color); border-radius: 4px;"
        >
          <ha-icon
            icon="mdi:image"
            style="--mdc-icon-size: 48px; color: var(--secondary-text-color);"
          ></ha-icon>
          <div style="margin-top: 8px; color: var(--secondary-text-color);">
            Image Module: ${e.name||"Unnamed"}
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color);">
            Type: ${e.image_type||"none"}
          </div>
        </div>
      </div>
    `}_renderInfoModule(e){const t={id:e.id,width:e.width,alignment:e.alignment,vertical_alignment:e.vertical_alignment,spacing:e.spacing,columns:e.columns,allow_wrap:e.allow_wrap,info_entities:e.info_entities,row_header:e.row_header,row_header_size:e.row_header_size,row_header_color:e.row_header_color,show_row_header:e.show_row_header};return Z` <div class="info-module">${this._renderSingleInfoRow(t)}</div> `}_renderBarModule(e){if(!e.entity)return Z`
        <div
          class="bar-module"
          style="text-align: center; padding: 20px; border: 1px dashed var(--divider-color); border-radius: 4px;"
        >
          <ha-icon
            icon="mdi:chart-bar"
            style="--mdc-icon-size: 48px; color: var(--secondary-text-color);"
          ></ha-icon>
          <div style="margin-top: 8px; color: var(--secondary-text-color);">
            Bar Module: ${e.name||"Unnamed"}
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color);">
            No entity configured
          </div>
        </div>
      `;const t={entity:e.entity,limit_entity:e.limit_entity,limit_indicator_color:e.limit_indicator_color,left_entity:e.left_entity,right_entity:e.right_entity,left_title:e.left_title,right_title:e.right_title,bar_color:e.bar_color,background_color:e.background_color,border_color:e.border_color,left_title_color:e.left_title_color,left_text_color:e.left_text_color,right_title_color:e.right_title_color,right_text_color:e.right_text_color,percentage_text_color:e.percentage_text_color,left_title_size:e.left_title_size,left_text_size:e.left_text_size,right_title_size:e.right_title_size,right_text_size:e.right_text_size,percentage_text_size:e.percentage_text_size,left_title_bold:e.left_title_bold,left_title_italic:e.left_title_italic,left_title_uppercase:e.left_title_uppercase,left_title_strikethrough:e.left_title_strikethrough,left_text_bold:e.left_text_bold,left_text_italic:e.left_text_italic,left_text_uppercase:e.left_text_uppercase,left_text_strikethrough:e.left_text_strikethrough,right_title_bold:e.right_title_bold,right_title_italic:e.right_title_italic,right_title_uppercase:e.right_title_uppercase,right_title_strikethrough:e.right_title_strikethrough,right_text_bold:e.right_text_bold,right_text_italic:e.right_text_italic,right_text_uppercase:e.right_text_uppercase,right_text_strikethrough:e.right_text_strikethrough,percentage_text_bold:e.percentage_text_bold,percentage_text_italic:e.percentage_text_italic,percentage_text_uppercase:e.percentage_text_uppercase,percentage_text_strikethrough:e.percentage_text_strikethrough,bar_size:e.bar_size,bar_radius:e.bar_radius,bar_style:e.bar_style,show_left:e.show_left,show_right:e.show_right,show_percentage:e.show_percentage,show_left_title:e.show_left_title,show_left_value:e.show_left_value,show_right_title:e.show_right_title,show_right_value:e.show_right_value,alignment:e.alignment,width:e.width,use_gradient:e.use_gradient,gradient_stops:e.gradient_stops,gradient_display_mode:e.gradient_display_mode,animation_entity:e.animation_entity,animation_state:e.animation_state,animation_type:e.animation_type,left_condition:e.left_condition,right_condition:e.right_condition,left_template_mode:e.left_template_mode,left_template:e.left_template,right_template_mode:e.right_template_mode,right_template:e.right_template,percentage_type:e.percentage_type,percentage_amount_entity:e.percentage_amount_entity,percentage_total_entity:e.percentage_total_entity};return Z` <div class="bar-module">${this._renderBar(t)}</div> `}_renderIconModule(e){const t={id:e.id,width:e.width||"100%",alignment:e.alignment||"center",vertical_alignment:e.vertical_alignment,spacing:e.spacing||"8px",columns:e.columns,icons:e.icons};return Z` <div class="icon-module">${this._renderIconRow(t)}</div> `}_renderTextModule(e){let t="";return e.font_size&&(t+=`font-size: ${e.font_size}px;`),e.color&&(t+=`color: ${e.color};`),e.alignment&&(t+=`text-align: ${e.alignment};`),e.margin_top&&(t+=`margin-top: ${e.margin_top}px;`),e.margin_bottom&&(t+=`margin-bottom: ${e.margin_bottom}px;`),e.padding&&(t+=`padding: ${e.padding}px;`),e.background_color&&(t+=`background-color: ${e.background_color};`),e.border_radius&&(t+=`border-radius: ${e.border_radius}px;`),e.bold&&(t+="font-weight: bold;"),e.italic&&(t+="font-style: italic;"),e.uppercase&&(t+="text-transform: uppercase;"),e.strikethrough&&(t+="text-decoration: line-through;"),Z`
      <div class="text-module" style="${t}">${e.text||"Enter your text here"}</div>
    `}_renderSeparatorModule(e){const t=e.separator_style||"line",i=e.thickness||1,n=e.width_percent||100,a=e.color||"var(--divider-color)";let o="";if(e.margin_top&&(o+=`margin-top: ${e.margin_top}px;`),e.margin_bottom&&(o+=`margin-bottom: ${e.margin_bottom}px;`),e.show_title&&e.title){let r=`font-size: ${e.title_size||16}px; color: ${e.title_color||"var(--primary-text-color)"}; padding: 0 16px;`;return e.title_bold&&(r+=" font-weight: bold;"),e.title_italic&&(r+=" font-style: italic;"),e.title_uppercase&&(r+=" text-transform: uppercase;"),e.title_strikethrough&&(r+=" text-decoration: line-through;"),Z`
        <div class="separator-module" style="${o}">
          <div
            style="display: flex; align-items: center; justify-content: center; gap: 0; width: ${n}%; margin-left: auto; margin-right: auto;"
          >
            <div
              style="flex: 1; height: 0; border-top: ${i}px ${"dotted"===t?"dotted":"solid"} ${a};"
            ></div>
            <div style="${r}; white-space: nowrap; flex-shrink: 0;">${e.title}</div>
            <div
              style="flex: 1; height: 0; border-top: ${i}px ${"dotted"===t?"dotted":"solid"} ${a};"
            ></div>
          </div>
        </div>
      `}let r="";return r="blank"===t?`height: ${i}px;`:"dotted"===t?`border-top: ${i}px dotted ${a};`:"double_line"===t?`border-top: ${3*i}px double ${a};`:"shadow"===t?`height: ${2*i}px; background: linear-gradient(to bottom, ${a} 0%, transparent 100%);`:`border-top: ${i}px solid ${a};`,Z`
      <div class="separator-module" style="${o}">
        <div style="display: flex; justify-content: center;">
          <div style="width: ${n}%; ${r}"></div>
        </div>
      </div>
    `}render(){var e;if(!this.config||!this.hass)return Z``;if(this.config.use_modular_layout&&this.config.layout)return this._renderModularLayout();const t=(null===(e=this.config.bars)||void 0===e?void 0:e.map(((e,t)=>`bar_${t}`)))||[],i=this.config.sections_order||["title","image","info","bar_0","icons",...t],n=this.config.layout_type||"single",a=this.config.sections_columns||{},o=(this.config.section_styles,this.config.hidden_sections||[]),r=i.filter((e=>!o.includes(e))),s=e=>{var t,i,n;const a=[],o=this.config.section_styles||{},r=this.config.section_breaks||[],s=e.some((e=>e.startsWith("info_row_")));for(let l=0;l<e.length;){const d=e[l];let c=!1;if(!this._shouldRenderSection(d)){l++;continue}if("info"===d&&s){l++;continue}const p=o[d]||{};let u="";if(p.marginTop&&(u+=`margin-top: ${p.marginTop}px;`),p.marginBottom&&(u+=` margin-bottom: ${p.marginBottom}px;`),u=u.trim(),d.startsWith("bar_")){const i=[];let n=[],o=0;const r=[];let s=l;for(;s<e.length&&e[s].startsWith("bar_");){const i=e[s],n=parseInt(i.substring(4));this._shouldRenderSection(i)&&(null===(t=this.config.bars)||void 0===t?void 0:t[n])&&r.push(n),s++}for(const e of r){const t=this.config.bars[e],a=parseInt(t.width||"100");o+a>100&&n.length>0&&(i.push(n),n=[],o=0),n.push({index:e,config:t}),o+=a}n.length>0&&i.push(n),l+=r.length>0?r.length:1,r.length>0&&(c=!0),i.length>0&&a.push(Z`<div class="bars-rows-container">
                ${i.map((e=>{const t=this.config.bar_row_alignment||"center";return Z`
                    <div class="bar-row" style="${`justify-content: ${t};`}">
                      ${e.map((e=>{var t;const i=`bar_${e.index}`,n=(null===(t=this.config.section_styles)||void 0===t?void 0:t[i])||{};let a="";n.marginTop&&(a+=`margin-top: ${n.marginTop}px; `),n.marginBottom&&(a+=`margin-bottom: ${n.marginBottom}px; `);const o=e.config.width||"100";return a+=`flex-basis: ${o}%; `,a+=`width: ${o}%; `,a+="flex-shrink: 0; ",Z`
                          <div
                            class="bar-wrapper ${this._getHighlightClass(i)}"
                            style="${a.trim()}${this._isHighlighted(i)?"; padding: 4px; margin: -4px; border-radius: 4px;":""}"
                          >
                            ${this._renderBar(e.config)}
                          </div>
                        `}))}
                    </div>
                  `}))}
              </div>`)}else if("bars"===d){const e=[];let t=u;this._shouldRenderSection("bars")&&this.config.bars&&this.config.bars.forEach(((t,i)=>{const n=`bar_${i}`;this._shouldRenderSection(n)&&e.push(i)})),e.length>0&&a.push(Z`<div class="bars-container" style="${t}">
                ${e.map((e=>{const t=`bar_${e}`,i=o[t]||{};let n="";return i.marginTop&&(n+=`margin-top: ${i.marginTop}px;`),i.marginBottom&&(n+=`margin-bottom: ${i.marginBottom}px;`),Z`
                    <div
                      class="bar-wrapper ${this._getHighlightClass(t)}"
                      style="${n}${this._isHighlighted(t)?"; padding: 4px; margin: -4px; border-radius: 4px;":""}"
                    >
                      ${this._renderBar(this.config.bars[e])}
                    </div>
                  `}))}
              </div>`),l++,c=!0}else if(d.startsWith("break_")){const e=r.find((e=>e.id===d));if(e){const t=e.break_style||"blank",i=e.break_thickness||1,n=e.break_width_percent||100,o=e.break_color||"var(--divider-color)",r=e.enable_title&&e.title_text,s="blank"!==t;if(r&&s){let r=`font-size: ${e.title_size||16}px; color: ${e.title_color||"var(--primary-text-color)"}; padding: 0 16px;`;e.title_bold&&(r+=" font-weight: bold;"),e.title_italic&&(r+=" font-style: italic;"),e.title_uppercase&&(r+=" text-transform: uppercase;"),e.title_strikethrough&&(r+=" text-decoration: line-through;");let s="solid",l="";"dotted"===t?(s="dotted",l=`border-top: ${i}px ${s} ${o};`):"double_dotted"===t?l=`\n                  position: relative;\n                  &::before {\n                    content: '';\n                    position: absolute;\n                    top: -${Math.ceil(i/2)}px;\n                    left: 0;\n                    right: 0;\n                    border-top: ${Math.ceil(i/2)}px dotted ${o};\n                  }\n                  &::after {\n                    content: '';\n                    position: absolute;\n                    bottom: -${Math.floor(i/2)}px;\n                    left: 0;\n                    right: 0;\n                    border-top: ${Math.floor(i/2)}px dotted ${o};\n                  }\n                `:"double_line"===t?(s="double",l=`border-top: ${3*i}px ${s} ${o};`):l="shadow"===t?`\n                  height: ${2*i}px;\n                  background: linear-gradient(to bottom, ${o} 0%, transparent 100%);\n                `:`border-top: ${i}px ${s} ${o};`;const d="";"double_dotted"===t?a.push(Z`
                  <div
                    style="${u}; display: flex; align-items: center; justify-content: center; gap: 0; width: ${n}%; margin-left: auto; margin-right: auto;"
                  >
                    <div style="flex: 1; height: ${2*i}px; position: relative;">
                      <div
                        style="position: absolute; top: 0; left: 0; right: 0; border-top: ${Math.ceil(i/2)}px dotted ${o};"
                      ></div>
                      <div
                        style="position: absolute; bottom: 0; left: 0; right: 0; border-top: ${Math.floor(i/2)}px dotted ${o};"
                      ></div>
                    </div>
                    <div
                      style="${r}; white-space: nowrap; flex-shrink: 0; padding: 0 8px; ${d}"
                    >
                      ${e.title_text}
                    </div>
                    <div style="flex: 1; height: ${2*i}px; position: relative;">
                      <div
                        style="position: absolute; top: 0; left: 0; right: 0; border-top: ${Math.ceil(i/2)}px dotted ${o};"
                      ></div>
                      <div
                        style="position: absolute; bottom: 0; left: 0; right: 0; border-top: ${Math.floor(i/2)}px dotted ${o};"
                      ></div>
                    </div>
                  </div>
                `):"shadow"===t?a.push(Z`
                  <div
                    style="${u}; display: flex; align-items: center; justify-content: center; gap: 0; width: ${n}%; margin-left: auto; margin-right: auto;"
                  >
                    <div
                      style="flex: 1; height: ${2*i}px; background: linear-gradient(to bottom, ${o} 0%, transparent 100%);"
                    ></div>
                    <div
                      style="${r}; white-space: nowrap; flex-shrink: 0; padding: 0 8px; ${d}"
                    >
                      ${e.title_text}
                    </div>
                    <div
                      style="flex: 1; height: ${2*i}px; background: linear-gradient(to bottom, ${o} 0%, transparent 100%);"
                    ></div>
                  </div>
                `):a.push(Z`
                  <div
                    style="${u}; display: flex; align-items: center; justify-content: center; gap: 0; width: ${n}%; margin-left: auto; margin-right: auto;"
                  >
                    <div style="flex: 1; height: 0; ${l}"></div>
                    <div
                      style="${r}; white-space: nowrap; flex-shrink: 0; padding: 0 8px; ${d}"
                    >
                      ${e.title_text}
                    </div>
                    <div style="flex: 1; height: 0; ${l}"></div>
                  </div>
                `)}else if(r){let t=`font-size: ${e.title_size||16}px; color: ${e.title_color||"var(--primary-text-color)"}; margin: 8px 0; text-align: center;`;e.title_bold&&(t+=" font-weight: bold;"),e.title_italic&&(t+=" font-style: italic;"),e.title_uppercase&&(t+=" text-transform: uppercase;"),e.title_strikethrough&&(t+=" text-decoration: line-through;"),a.push(Z`
                <div class="section-break-container" style="${u}">
                  <div class="section-break-title" style="${t}">
                    ${e.title_text}
                  </div>
                </div>
              `)}else s&&a.push(Z`
                <div
                  class="section-break-container"
                  style="${u}; display: flex; justify-content: center; align-items: center;"
                >
                  <div
                    class="section-break break-style-${t}"
                    style="--break-thickness: ${i}px; --break-color: ${o}; width: ${n}%; position: static; left: auto; transform: none;"
                  ></div>
                </div>
              `)}else console.warn(`[UltraVehicleCard] Render: Could not find config for break ID: ${d}`)}else switch(d){case"title":const e=this.config.title_size||24;a.push(this.config.title?Z`<div
                      class="${this._getHighlightClass("title")}"
                      style="${this._isHighlighted("title")?"padding: 8px; margin: -8px;":""}"
                    >
                      <div
                        class="card-title ${this.config.title_alignment||"center"}"
                        style="font-size: ${e}px !important; line-height: 1.2;
                             ${this.config.title_color?`color: ${this.config.title_color};`:""}
                             ${this._getFormattingStyles(this.config,"title")}
                             ${u}"
                      >
                        ${this.config.title}
                      </div>
                    </div>`:Z``);break;case"image":a.push(Z`
                <div
                  class="${this._getHighlightClass("image")}"
                  style="${this._isHighlighted("image")?"padding: 8px; margin: -8px;":""}"
                >
                  ${this._renderImage(u)}
                </div>
              `);break;case"info":a.push(Z`
                <div
                  class="${this._getHighlightClass("info")}"
                  style="${this._isHighlighted("info")?"padding: 8px; margin: -8px;":""}"
                >
                  ${this._renderVehicleInfo(u)}
                </div>
              `);break;case"icons":this._shouldRenderSection("icons")&&a.push(Z`
                  <div
                    class="${this._getHighlightClass("icons")}"
                    style="${this._isHighlighted("icons")?"padding: 8px; margin: -8px;":""}"
                  >
                    ${this._renderIconRows(u)}
                  </div>
                `);break;default:if(d.startsWith("icon_row_")){const e=d.substring(9);if(this._shouldRenderSection(d)){const t=null===(i=this.config.icon_rows)||void 0===i?void 0:i.find((t=>t.id===e));t&&a.push(Z`<div
                        class="icon-rows-container ${this._getHighlightClass(d)}"
                        style="${u}${this._isHighlighted(d)?"; padding: 8px; margin: -8px; border-radius: 4px;":""}"
                      >
                        ${this._renderIconRow(t)}
                      </div>`)}}else if(d.startsWith("info_row_")){const e=d.substring(9);if(this._shouldRenderSection(d)){const t=null===(n=this.config.info_rows)||void 0===n?void 0:n.find((t=>t.id===e));t&&a.push(Z`<div
                        class="info-rows-container ${this._getHighlightClass(d)}"
                        style="${u}${this._isHighlighted(d)?"; padding: 8px; margin: -8px; border-radius: 4px;":""}"
                      >
                        ${this._renderSingleInfoRow(t)}
                      </div>`)}}}c||l++}return a};if("double"===n){const e=r.filter((e=>"right"!==a[e])),t=r.filter((e=>"right"===a[e])),i=this.config.column_width?`columns-${this.config.column_width}`:"columns-50-50";return Z`
        <ha-card>
          ${this.config.global_css?Z`<style>
                :host { ${this.config.global_css} }
              </style>`:""}
          <div
            class="card-content two-column-layout ${i}"
            style="${this.config.card_background?`background-color: ${this.config.card_background};`:""}"
          >
            <div class="column left-column">${s(e)}</div>
            <div class="column right-column">${s(t)}</div>
          </div>
          ${this._renderMapPopup()}
        </ha-card>
      `}if("dashboard"===n){const e=r.filter((e=>"top"===a[e])),t=r.filter((e=>"top_middle"===a[e])),i=r.filter((e=>"left_middle"===a[e])),n=r.filter((e=>"middle"===a[e])),o=r.filter((e=>"right_middle"===a[e])),l=r.filter((e=>"bottom_middle"===a[e])),d=r.filter((e=>"bottom"===a[e])),c=[...r.filter((e=>!a[e]||!["top","top_middle","left_middle","middle","right_middle","bottom_middle","bottom"].includes(a[e]))),...e],p=n.includes("image");let u=r;p&&(u=r.filter((e=>"image"!==e)));const g=void 0!==this.config.top_view_side_margin?this.config.top_view_side_margin:0,m=g>0?`padding-left: ${g}px; padding-right: ${g}px;`:"",_=`gap: ${void 0!==this.config.top_view_middle_spacing?this.config.top_view_middle_spacing:16}px;`,h=`gap: ${void 0!==this.config.top_view_vertical_spacing?this.config.top_view_vertical_spacing:16}px;`;return Z`
        <ha-card>
          ${this.config.global_css?Z`<style>
                :host { ${this.config.global_css} }
              </style>`:""}
          <div
            class="card-content dashboard-layout"
            style="${this.config.card_background?`background-color: ${this.config.card_background};`:""} ${m}"
          >
            <!-- Top Section -->
            <div class="dashboard-section top-section">${s(c)}</div>

            <!-- Middle Sections -->
            <div class="dashboard-middle" style="${h}">
              <div class="dashboard-section top-middle-section">
                ${s(t)}
              </div>

              <div class="dashboard-center-row" style="${_}">
                <div class="dashboard-section left-middle-section">
                  ${s(i)}
                </div>

                <!-- Vehicle image in the middle -->
                <div class="dashboard-center-image">
                  ${p?this._renderImage("",!0):n.length>0?s(n):Q}
                </div>

                <div class="dashboard-section right-middle-section">
                  ${s(o)}
                </div>
              </div>

              <div class="dashboard-section bottom-middle-section">
                ${s(l)}
              </div>
            </div>

            <!-- Bottom Section -->
            <div class="dashboard-section bottom-section">
              ${s(d)}
            </div>
          </div>
          ${this._renderMapPopup()}
        </ha-card>
      `}if("half_full"===n){const e=r.filter((e=>"half_full_row1_left"===a[e])),t=r.filter((e=>"half_full_row1_right"===a[e])),i=r.filter((i=>"half_full_row2_full"===a[i]||!a[i]&&!e.includes(i)&&!t.includes(i)));return Z`
        <ha-card>
          ${this.config.global_css?Z`<style>
                :host { ${this.config.global_css} }
              </style>`:""}
          <div
            class="card-content half-full-layout"
            style="${this.config.card_background?`background-color: ${this.config.card_background};`:""}"
          >
            <div class="half-full-row1">
              <div class="column hf-r1-left">${s(e)}</div>
              <div class="column hf-r1-right">
                ${s(t)}
              </div>
            </div>
            <div class="half-full-row2">
              <div class="column hf-r2-full">${s(i)}</div>
            </div>
          </div>
          ${this._renderMapPopup()}
        </ha-card>
      `}if("full_half"===n){const e=r.filter((e=>"full_half_row1_full"===a[e]||!a[e]&&!r.filter((e=>"full_half_row2_left"===a[e])).includes(e)&&!r.filter((e=>"full_half_row2_right"===a[e])).includes(e))),t=r.filter((e=>"full_half_row2_left"===a[e])),i=r.filter((e=>"full_half_row2_right"===a[e]));return Z`
        <ha-card>
          ${this.config.global_css?Z`<style>
                :host { ${this.config.global_css} }
              </style>`:""}
          <div
            class="card-content full-half-layout"
            style="${this.config.card_background?`background-color: ${this.config.card_background};`:""}"
          >
            <div class="full-half-row1">
              <div class="column fh-r1-full">${s(e)}</div>
            </div>
            <div class="full-half-row2">
              <div class="column fh-r2-left">${s(t)}</div>
              <div class="column fh-r2-right">
                ${s(i)}
              </div>
            </div>
          </div>
          ${this._renderMapPopup()}
        </ha-card>
      `}return Z`
      <ha-card>
        ${this.config.global_css?Z`<style>
              :host { ${this.config.global_css} }
            </style>`:""}
        <div
          class="card-content"
          style="${this.config.card_background?`background-color: ${this.config.card_background};`:""}"
        >
          ${s(r)}
        </div>
        ${this._renderMapPopup()}
      </ha-card>
    `}_renderImage(e="",t=!1){let i="",n="",a=e,o="",r=null;if(r=this.config.images&&this.config.images.length>0?this._selectImageFromNewSystem():this._selectImageFromLegacySystem(),r){const e=this._processSelectedImage(r);e&&(i=e.imageUrl,n=e.imageStyle,o=e.entityId)}if(!i)return"";i&&i!==ye&&(this._lastImageUrl=i);const s=((null==r?void 0:r.image_width)||100)>100;if(s){const e="var(--card-padding, 16px)";a+=` margin-left: calc(-1 * ${e}); margin-right: calc(-1 * ${e});`}a+=" overflow: hidden;";const l=r&&(r.single_click_action||r.double_click_action||r.hold_click_action);let d,c,p,u,g,m,_,h=!1;l&&r?(d=e=>this._handleImageClickWithDelay(r,e),c=e=>this._handleImageTouchStart(r,e),p=e=>this._handleImageTouchEnd(r,e),u=e=>this._handleImageTouchCancel(r,e),g=e=>this._handleImagePointerDown(r,e),m=e=>this._handleImagePointerUp(r,e),_=e=>this._handleImagePointerLeave(r,e),h=!0):o&&(d=()=>this._showMoreInfo(o),h=!0);const v=t?"vehicle-image-container centered-image":"vehicle-image-container";return Z`
      <div class="${s?`${v} edge-to-edge`:v}" style="${a}">
        <img
          class="vehicle-image ${h?"clickable":""}"
          src="${i}"
          style="${n}"
          @error=${this._handleImageError}
          @click=${d}
          @touchstart=${c}
          @touchend=${p}
          @touchcancel=${u}
          @pointerdown=${g}
          @pointerup=${m}
          @pointerleave=${_}
          ?title=${h&&l?"Image with configured actions":h&&o?`Click to view details for ${this._getFriendlyName(o)}`:void 0}
        />
      </div>
    `}_selectImageFromNewSystem(){const e=this.config.images||[],t=this.config.image_priority_mode||"order",i=e.filter((e=>"none"!==e.image_type));if(0===i.length)return null;switch(t){case"order":for(const e of i)if(this._imageMatchesConditions(e))return e;return i.find((e=>e.is_fallback))||i[0];case"last_triggered":{let e=null,t=0;for(const e of i){this._imageMatchesConditions(e);const t=`trigger_${e.id}`;this._imageTriggerTimes.get(t)}for(const n of i){const i=`trigger_${n.id}`,a=this._imageTriggerTimes.get(i)||0;a>0&&a>t&&(t=a,e=n)}return e||(i.find((e=>e.is_fallback))||i[0])}case"timed":{const e=i.find((e=>e.is_fallback)),t=i.filter((e=>!e.is_fallback)),n=e||i[0];if(this._currentTimedImage&&this._timedImageStartTime){const e=i.find((e=>e.id===this._currentTimedImage));if(e){const t=1e3*(e.timed_duration||5);if(Date.now()-this._timedImageStartTime<t)return e;this._clearTimedImage()}else this._clearTimedImage()}let a=null,o=0;for(const e of t){const t=this._imageMatchesConditions(e),i=e.id,n=this._imageConditionStates.get(i)||!1;this._imageConditionStates.set(i,t);const r=!this._imageConditionStates.has(i);if(t&&(!n||r)){const t=`trigger_${e.id}`,i=this._imageTriggerTimes.get(t)||Date.now();i>o&&(o=i,a=e)}}return a?this._currentTimedImage===a.id?i.find((e=>e.id===this._currentTimedImage))||a:(this._startTimedImage(a),a):n}default:return i[0]}}_imageMatchesConditions(e){var t,i;const n=`trigger_${e.id}`,a=Date.now();if("timed"===this.config.image_priority_mode){if(!e.conditional_entity&&!e.template_mode)return!1}else if(!e.conditional_entity&&!e.template_mode)return"last_triggered"===this.config.image_priority_mode&&(this._imageTriggerTimes.has(n)||(this._imageTriggerTimes.set(n,a),this._saveStateToStorage())),!0;if(e.template_mode&&e.template){const i=`image_${e.id}`;let o=!1;if(this._templateService&&this._templateService.hasTemplateSubscription(i))o=null!==(t=this._templateService.getTemplateResult(i))&&void 0!==t&&t;else if(this._templateService){const t=e.template.trim();return"{{ true }}"===t?(this._templateService.getAllTemplateResults().set(i,!0),this._templateService.subscribeToTemplate(e.template,i,(()=>{this.requestUpdate()})),"last_triggered"===this.config.image_priority_mode&&(this._imageTriggerResults.get(n)||(this._imageTriggerTimes.set(n,a),this._imageTriggerResults.set(n,!0),this._saveStateToStorage())),o=!0,!0):"{{ false }}"===t?(this._templateService.getAllTemplateResults().set(i,!1),this._templateService.subscribeToTemplate(e.template,i,(()=>{this.requestUpdate()})),"last_triggered"===this.config.image_priority_mode&&this._imageTriggerResults.set(n,!1),o=!1,!1):(t.startsWith("{{")&&t.endsWith("}}")&&t.length>4&&"{{ }}"!==t&&this._templateService.evaluateTemplate(e.template).then((e=>{if(this._templateService.getAllTemplateResults().set(i,e),"last_triggered"===this.config.image_priority_mode&&e){if(!this._imageTriggerResults.get(n)&&e){const e=Date.now();this._imageTriggerTimes.set(n,e),this._saveStateToStorage()}this._imageTriggerResults.set(n,e)}this.requestUpdate()})).catch((t=>{console.warn(`[UVC Image Template] Error evaluating template for ${e.id}:`,t)})),this._templateService.subscribeToTemplate(e.template,i,(()=>{this.requestUpdate()})),!1)}return"last_triggered"===this.config.image_priority_mode&&(!this._imageTriggerResults.get(n)&&o&&(this._imageTriggerTimes.set(n,a),this._saveStateToStorage()),this._imageTriggerResults.set(n,o)),o}if(e.conditional_entity&&void 0!==e.conditional_state){const t=null===(i=this.hass.states[e.conditional_entity])||void 0===i?void 0:i.state;if(void 0===t)return!1;const o=t.trim().toLowerCase()===e.conditional_state.trim().toLowerCase(),r=e.conditional_type||"show";let s=!1;if("show"===r?s=o:"hide"===r&&(s=!o),"last_triggered"===this.config.image_priority_mode){const e=this._imageTriggerResults.get(n)||!1,t=this._imageTriggerTimes.has(n);s&&(!t||!e&&s)&&(this._imageTriggerTimes.set(n,a),this._saveStateToStorage()),this._imageTriggerResults.set(n,s)}return s}return!0}_selectImageFromLegacySystem(){var e,t;if(this.config.action_images&&this.config.action_images.length>0){const i=this.config.action_image_priority||"newest";let n=null;for(const a of this.config.action_images)if(a.template_mode&&a.template){const t=`action_image_${a.id}`;let o=!1;if(this._templateService&&this._templateService.hasTemplateSubscription(t)?o=null!==(e=this._templateService.getTemplateResult(t))&&void 0!==e&&e:this._templateService&&this._templateService.subscribeToTemplate(a.template,t,(()=>{this.requestUpdate()})),o&&(n=a,"priority"===i))break}else if(a.entity&&a.state){const e=null===(t=this.hass.states[a.entity])||void 0===t?void 0:t.state;if(void 0!==e&&e.trim().toLowerCase()===a.state.trim().toLowerCase()&&(n=a,"priority"===i))break}if(n)return{id:n.id,image_type:n.image_type,image:n.image,image_entity:n.image_entity,image_width:n.image_width,image_crop:n.image_crop,conditional_entity:n.entity,conditional_state:n.state,conditional_type:"show",template_mode:n.template_mode,template:n.template,priority:n.priority}}const i=this.config.vehicle_image_type;return i&&"none"!==i?{id:"legacy_vehicle",image_type:i,image:this.config.vehicle_image,image_entity:this.config.vehicle_image_entity,image_width:this.config.vehicle_image_width,image_crop:this.config.vehicle_image_crop}:null}_processSelectedImage(e){var t;let i="",n="";switch(e.image_entity?n=e.image_entity:e.conditional_entity?n=e.conditional_entity:this.config.location_entity?n=this.config.location_entity:this.config.mileage_entity?n=this.config.mileage_entity:this.config.car_state_entity&&(n=this.config.car_state_entity),e.image_type){case"upload":e.image&&(i=function(e,t){if(!t)return"";if(t.startsWith("http"))return t;if(t.startsWith("data:image/"))return t;if(t.includes("/api/image/serve/")){const i=t.match(/\/api\/image\/serve\/([^\/]+)/);if(i&&i[1]){const n=i[1];try{return`${(e.hassUrl?e.hassUrl():"").replace(/\/$/,"")}/api/image/serve/${n}/original`}catch(e){return t}}return t}if(t.startsWith("local/")||t.includes("/local/")||t.startsWith("media-source://")){const i=t.replace(/^\/?local\//,"").replace(/^media-source:\/\/media_source\/local\//,"");return`${(e.hassUrl?e.hassUrl():"").replace(/\/$/,"")}/local/${i}`}return t.startsWith("/")?`${(e.hassUrl?e.hassUrl():"").replace(/\/$/,"")}${t}`:t}(this.hass,e.image));break;case"url":e.image&&(i=e.image,i.startsWith("/")&&(i=`${this.hass.hassUrl?this.hass.hassUrl():""}${i.substring(1)}`),i.includes("/api/image/serve/")&&!i.endsWith("/original")&&(i=`${i}/original`));break;case"entity":if(e.image_entity){const a=this.hass.states[e.image_entity];n=e.image_entity,(null===(t=null==a?void 0:a.attributes)||void 0===t?void 0:t.entity_picture)?this._entityImageUrls.has(e.image_entity)?i=this._entityImageUrls.get(e.image_entity)||"":(i=a.attributes.entity_picture,i.startsWith("/")&&(i=`${this.hass.hassUrl?this.hass.hassUrl():""}${i.substring(1)}`)):(null==a?void 0:a.state)&&(a.state.startsWith("http")||a.state.startsWith("/")||a.state.startsWith("data:"))&&(i=a.state)}break;case"default":i=ye;break;case"map":e.image_entity&&(n=e.image_entity,i=ye);break;default:e.image&&(e.image.startsWith("http")||e.image.startsWith("/")||e.image.startsWith("data:"))&&(i=e.image,i.includes("/api/image/serve/")&&!i.endsWith("/original")&&(i=`${i}/original`))}return i||(i=ye),{imageUrl:i,imageStyle:this._computeImageStyle(e.image_width,e.image_crop),entityId:n}}_startTimedImage(e){this._clearTimedImage(),this._currentTimedImage=e.id,this._timedImageStartTime=Date.now();const t=1e3*(e.timed_duration||5);this._timedImageTimer=window.setTimeout((()=>{this._clearTimedImage(),this.requestUpdate()}),t)}_clearTimedImage(){this._timedImageTimer&&(clearTimeout(this._timedImageTimer),this._timedImageTimer=null),this._currentTimedImage=null,this._timedImageStartTime=null}_getFriendlyName(e){const t=this.hass.states[e];return t&&(t.attributes.friendly_name||e.split(".").pop())||e}_getFormattingStyles(e,t){const i=[],n=t=>{const i=e[t];return"title_bold"===t&&void 0===i||!0===i};return n(`${t}_bold`)&&i.push("font-weight: bold;"),n(`${t}_italic`)&&i.push("font-style: italic;"),n(`${t}_uppercase`)&&i.push("text-transform: uppercase;"),n(`${t}_strikethrough`)&&i.push("text-decoration: line-through;"),i.join(" ")}_formatValue(e,t,i){var n,a,o,r,s;if(!t||!this.hass.states[t])return e;const l=this.hass.states[t],d=l.attributes.unit_of_measurement,c=l.attributes.device_class;if("binary_sensor"===t.split(".")[0]&&c){if(this.hass.formatEntityState)return this.hass.formatEntityState(l);if("on"===e.toLowerCase())switch(c){case"battery":return"Low";case"battery_charging":return"Charging";case"cold":return"Cold";case"connectivity":return"Connected";case"door":case"garage_door":case"opening":case"window":return"Open";case"gas":case"light":case"motion":case"smoke":case"sound":case"vibration":return"Detected";case"heat":return"Hot";case"lock":return"Unlocked";case"moisture":return"Wet";case"moving":return"Moving";case"occupancy":return"Occupied";case"plug":return"Plugged In";case"power":return"On";case"presence":return"Home";case"problem":return"Problem";case"running":return"Running";case"safety":return"Unsafe";case"tamper":return"Tampered";case"update":return"Update Available";default:return e}else if("off"===e.toLowerCase())switch(c){case"battery":case"cold":case"heat":return"Normal";case"battery_charging":return"Not Charging";case"connectivity":return"Disconnected";case"door":case"garage_door":case"opening":case"window":return"Closed";case"gas":case"light":case"motion":case"occupancy":case"smoke":case"sound":case"tamper":case"vibration":return"Clear";case"lock":return"Locked";case"moisture":return"Dry";case"moving":case"running":return"Stopped";case"plug":return"Unplugged";case"power":return"Off";case"presence":return"Away";case"problem":return"OK";case"safety":return"Safe";case"update":return"Up to Date";default:return e}}if(!1===this.config.formatted_entities){const t=void 0!==i?i:!1!==this.config.show_units;return d&&t?`${e} ${d}`:e}if(t===this.config.location_entity){const e=l.state.toLowerCase(),t=Object.keys(this.hass.states).filter((e=>e.startsWith("zone.")));for(const i of t){const t=this.hass.states[i],n=(t.attributes.friendly_name||t.attributes.name||"").toLowerCase(),a=i.split(".")[1].toLowerCase();if(e===n||e===a)return t.attributes.friendly_name||t.attributes.name||i.split(".")[1]}for(const e of t){const t=this.hass.states[e];if((null===(n=null==t?void 0:t.attributes)||void 0===n?void 0:n.latitude)&&(null===(a=null==t?void 0:t.attributes)||void 0===a?void 0:a.longitude)&&(null===(o=null==l?void 0:l.attributes)||void 0===o?void 0:o.latitude)&&(null===(r=null==l?void 0:l.attributes)||void 0===r?void 0:r.longitude)&&Math.abs(t.attributes.latitude-l.attributes.latitude)<1e-4&&Math.abs(t.attributes.longitude-l.attributes.longitude)<1e-4)return t.attributes.friendly_name||t.attributes.name||e.split(".")[1]}if(null===(s=null==l?void 0:l.attributes)||void 0===s?void 0:s.formatted_address)return l.attributes.formatted_address}let p=e,u=!1;if(isNaN(Number(e)))p=e.replace(/_/g," "),p.length>0&&(p=p.charAt(0).toUpperCase()+p.slice(1));else{const t=Number(e);if(this.hass.formatEntityState){const e=this.hass.formatEntityState(l);e&&"string"==typeof e&&(p=e,u=!0)}else{let e;void 0!==l.attributes.suggested_display_precision?e=l.attributes.suggested_display_precision:void 0!==l.attributes.display_precision&&(e=l.attributes.display_precision);const i=l.attributes.state_class,n=l.attributes.device_class;void 0===e&&(e="energy"===n||"total"===i||"total_increasing"===i?3:"temperature"===n||"humidity"===n?1:Number.isInteger(t)?0:2);const a=l.attributes.number_format||"en-US";p=t.toLocaleString(a,{maximumFractionDigits:e,minimumFractionDigits:0})}}const g=void 0!==i?i:!1!==this.config.show_units;return!g||!d||u&&"duration"===c?!g&&d&&(p.endsWith(` ${d}`)?p=p.substring(0,p.length-d.length-1):p.endsWith(d)&&(p=p.substring(0,p.length-d.length))):p.endsWith(d)||p.includes(` ${d}`)||(p=`${p} ${d}`),`${l.attributes.prefix||""}${p}${l.attributes.suffix||""}`}_handleImageError(e){const t=e.target;t.classList.add("image-error"),this._lastImageUrl&&t.src!==this._lastImageUrl?t.src=this._lastImageUrl:t.src=""}_renderBar(e){if(!e.entity)return Z``;const t=this.hass.states[e.entity];if(!t)return Z``;const i=parseFloat(t.state),n=!isNaN(i)&&"unavailable"!==t.state&&"unknown"!==t.state;let a=0;const o=e;if("difference"===o.percentage_type&&o.percentage_amount_entity&&o.percentage_total_entity){const e=this.hass.states[o.percentage_amount_entity],t=this.hass.states[o.percentage_total_entity];if(e&&t){const i=parseFloat(e.state),n=parseFloat(t.state);!isNaN(i)&&!isNaN(n)&&n>0&&(a=Math.max(0,Math.min(100,i/n*100)))}}else if("attribute"===o.percentage_type&&o.percentage_attribute&&t.attributes){const e=t.attributes[o.percentage_attribute];void 0===e||isNaN(parseFloat(e))||(a=Math.max(0,Math.min(100,parseFloat(e))))}else if("template"===o.percentage_type&&o.percentage_template&&this._templateService){const e=this._processPercentageTemplate(o.percentage_template);null!==e&&(a=Math.max(0,Math.min(100,e)))}else a=n?Math.max(0,Math.min(100,i)):0;const r=e=>e?(e.startsWith("var(--"),e):"";let s=null,l="";if(e.limit_entity){const t=this.hass.states[e.limit_entity];t&&!isNaN(parseFloat(t.state))&&(s=parseFloat(t.state),l=r(e.limit_indicator_color||"#ff0000"))}const d=`bar-size-${e.bar_size||"regular"}`,c=(e.width,this._getBarAnimationClass(e)),p=e.gradient_stops||[],u=!0===e.use_gradient&&p.length>=2,g=u&&e.gradient_display_mode?e.gradient_display_mode:"value_based";let m="",_="";switch(e.bar_radius){case"square":m="border-radius: 0;",_="border-radius: 0;";break;case"rounded-square":m="border-radius: 4px;",_="border-radius: 2px 0 0 2px; margin: 0;";break;default:m="border-radius: 1000px;",_="border-radius: 1000px 0 0 1000px;"}if(a>=100)switch(e.bar_radius){case"square":break;case"rounded-square":_="border-radius: 4px; margin: 0;";break;default:_="border-radius: 1000px;"}"flat"===e.bar_style&&"rounded-square"===e.bar_radius&&(_+=" border: none; box-shadow: none;");let h="";"animate-glow"===c&&(h=`--glow-color: ${u?Be(p,"value_based"===g||"cropped"===g?a:100):e.bar_color||"var(--primary-color)"};`);const v="square"===e.bar_radius?"bar-radius-square":"rounded-square"===e.bar_radius?"bar-radius-rounded-square":"bar-radius-round";let b,f="";if("neon"===e.bar_style){const t=e.bar_color||"var(--primary-color)";if("transparent"!==t&&!t.startsWith("var(--")){const e=this._hexToRgb(t);e&&(f=`\n            --glow-color-r: ${e.r};\n            --glow-color-g: ${e.g};\n            --glow-color-b: ${e.b};\n          `)}}if(u){if("dashed"===e.bar_style)if("full"===g||"cropped"===g){const t=De(p);b=Z`
            <div
              class="progress-bar-fill bar-style-dashed ${c}"
              data-use-gradient="true"
              has-gradient="true"
              data-mode="${g}"
              data-percentage="${a}"
              style="
                width: ${a}%;
                background-image: ${t};
                background-size: ${"full"===g?"100% 100%":100/a*100+"% 100%"};
                background-position: 0% 0%;
                background-repeat: no-repeat;
                ${_}
                ${h}
                ${f}
              "
            >
              ${"animate-bubbles"===c?Z`<span></span>`:""}
              ${e.show_percentage?this._renderPercentageText(e,a):""}
            </div>
          `}else{const t=Be(p,a);b=Z`
            <div
              class="progress-bar-fill" /* No bar-style-dashed class here to avoid conflicts */
              data-use-gradient="true"
              has-gradient="true"
              data-mode="value_based"
              data-percentage="${a}"
              style="
                width: ${a}%;
                background-color: transparent !important;
                position: relative; /* Ensure positioning context for child */
                ${_}
                overflow: hidden; /* Keep dashes within border radius */
              "
            >
              <!-- Add dedicated child element for dashes -->
              <div 
                class="dash-overlay" 
                style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background-image: repeating-linear-gradient(
                    90deg, 
                    ${t}, 
                    ${t} 5px, 
                    transparent 5px, 
                    transparent 10px
                  );
                  background-size: 10px 100%;
                "
              ></div>
              ${"animate-bubbles"===c?Z`<span></span>`:""}
              ${e.show_percentage?this._renderPercentageText(e,a):""}
            </div>
          `}else if("value_based"===g){const t=Be(p,a);if("neon"===e.bar_style&&!f){const e=this._hexToRgb(t);e&&(f=`\n                --glow-color-r: ${e.r};\n                --glow-color-g: ${e.g};\n                --glow-color-b: ${e.b};\n              `)}b=Z`
            <div
              class="progress-bar-fill ${e.bar_style?`bar-style-${e.bar_style}`:""} ${c}"
              data-use-gradient="true"
              has-gradient="true"
              data-mode="value_based"
              data-percentage="${a}"
              style="
                width: ${a}%;
                background-color: ${t};
                ${_}
                ${h}
                ${f}
              "
            >
              ${"animate-bubbles"===c?Z`<span></span>`:""}
              ${e.show_percentage?this._renderPercentageText(e,a):""}
            </div>
          `}else if("full"===g){const t=De(p);if("neon"===e.bar_style){const e=p[p.length-1];if(e){const t=this._hexToRgb(e.color);t&&(f=`\n                  --glow-color-r: ${t.r};\n                  --glow-color-g: ${t.g};\n                  --glow-color-b: ${t.b};\n                `)}}b=Z`
            <div
              class="progress-bar-fill ${e.bar_style?`bar-style-${e.bar_style}`:""} ${c}"
              data-use-gradient="true"
              has-gradient="true"
              data-mode="full"
              data-percentage="${a}"
              style="
                width: ${a}%;
                background-image: ${t};
                background-color: transparent;
                background-size: 100% 100%;
                background-position: 0% 0%;
                background-repeat: no-repeat;
                ${_}
                ${h}
                ${f}
              "
            >
              ${"animate-bubbles"===c?Z`<span></span>`:""}
              ${e.show_percentage?this._renderPercentageText(e,a):""}
            </div>
          `}else if("cropped"===g){const t=De(p);if("neon"===e.bar_style){const e=Be(p,a),t=this._hexToRgb(e);t&&(f=`\n                --glow-color-r: ${t.r};\n                --glow-color-g: ${t.g};\n                --glow-color-b: ${t.b};\n              `)}b=Z`
            <div
              class="progress-bar-fill ${e.bar_style?`bar-style-${e.bar_style}`:""} ${c}"
              data-use-gradient="true"
              has-gradient="true"
              data-mode="cropped"
              data-percentage="${a}"
              style="
                width: ${a}%;
                background-image: ${t};
                background-color: transparent;
                background-size: ${100/a*100}% 100%;
                background-position: 0% 0%;
                background-repeat: no-repeat;
                ${_}
                ${h}
                ${f}
              "
            >
              ${"animate-bubbles"===c?Z`<span></span>`:""}
              ${e.show_percentage?this._renderPercentageText(e,a):""}
            </div>
          `}}else{const t=r(e.bar_color||"var(--primary-color)");b="dashed"===e.bar_style?Z`
          <div
            class="progress-bar-fill" /* No bar-style-dashed class to avoid CSS conflicts */
            data-percentage="${a}"
            style="
              width: ${a}%;
              background-color: transparent !important;
              position: relative; /* Ensure positioning context for child */
              ${_}
              overflow: hidden; /* Keep dashes within border radius */
            "
          >
            <!-- Add dedicated child element for dashes using the bar's color -->
            <div 
              class="dash-overlay" 
              style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: repeating-linear-gradient(
                  90deg, 
                  ${t}, 
                  ${t} 5px, 
                  transparent 5px, 
                  transparent 10px
                );
                background-size: 10px 100%;
              "
            ></div>
            ${"animate-bubbles"===c?Z`<span></span>`:""}
            ${e.show_percentage?this._renderPercentageText(e,a):""}
          </div>
        `:Z`
          <div
            class="progress-bar-fill ${e.bar_style?`bar-style-${e.bar_style}`:""} ${c}"
            data-percentage="${a}"
            style="
              width: ${a}%;
              background-color: ${t};
              ${_}
              ${h}
              ${f}
            "
          >
            ${"animate-bubbles"===c?Z`<span></span>`:""}
            ${e.show_percentage?this._renderPercentageText(e,a):""}
          </div>
        `}let y="";if(e.width&&"100"!==e.width){const t=parseInt(e.width);let i=0;50===t?i=4:25===t?i=6:75===t&&(i=2),y=`calc(${e.width}% - ${i}px)`}else y="100%";const k="dashed"===e.bar_style?"transparent":e.background_color||"#121212";return Z`
      <div
        class="progress-bar-wrapper"
        style="width: ${y};" /* Apply calculated width to wrapper */
      >
        <div
          class="progress-bar ${d} ${e.bar_style?`bar-style-${e.bar_style}`:""} ${v}"
          style="background: ${k}; border-color: ${e.border_color||"#686868"}; width: 100%; ${m}" /* Bar takes full width of wrapper */
          @click=${()=>this._showMoreInfo(e.entity)}
        >
          ${b}
          ${null!==s?Z`<div
                  class="limit-indicator"
                  style="left: ${s}%;
                       background-color: ${l};
                       box-shadow: 0 0 2px ${l};"
                ></div>`:""}
        </div>
        ${this._renderBarLabels(e)}
      </div>
    `}_renderPercentageText(e,t){const i=e.percentage_text_size?`${e.percentage_text_size}px`:"14px",n=e.percentage_text_color||"#ffffff",a=!1!==this.config.show_units;return Z`
      <div
        class="percentage-text"
        style="
        font-size: ${i};
        color: ${n};
        ${this._getFormattingStyles(e,"percentage_text")}
      "
      >
        ${Math.round(t)}${a?"%":""}
      </div>
    `}_getBarAnimationClass(e){let t="";const i=this._getEntityState(e.animation_entity),n=this._getEntityState(e.action_animation_entity);return e.animation_type&&(!e.animation_entity&&!e.animation_state||e.animation_entity&&e.animation_state&&i===e.animation_state)&&(t=`animate-${e.animation_type}`),e.action_animation&&e.action_animation_entity&&e.action_animation_state&&n===e.action_animation_state&&(t=`animate-${e.action_animation}`),t}_getEntityState(e){var t;if(e&&this.hass.states[e])return null===(t=this.hass.states[e])||void 0===t?void 0:t.state}_renderIconRows(e=""){const{icon_rows:t=[]}=this.config;return t&&0!==t.length?Z`
      <div class="icon-rows-container" style="${e}">
        ${t.map((e=>this._renderIconRow(e)))}
      </div>
    `:Z``}_renderIconRow(e){if(!e.icons||!e.icons.length)return Z``;const t=e.width||"100",i=e.alignment||"space-between",n=e.spacing||"medium",a=e.columns||0,o=e.vertical_alignment||"center";let r=`width: ${t}%; gap: ${{none:"0",small:"8px",medium:"16px",large:"24px"}[n]||"16px"};`,s=`icon-row align-${i}`;return a&&a>0?(r+=`display: grid; grid-template-columns: repeat(${a}, minmax(0, 1fr));`,s="icon-row-grid"):r+=`align-items: ${o};`,"dashboard"===this.config.layout_type&&(s+=" dashboard-icon-row"),Z`
      <div class="${s}" style="${r}">
        ${e.icons.map((e=>this._renderCardIcon(e)))}
      </div>
    `}_renderCardIcon(e){var t,i;if(!e.entity)return Z``;const n=this.hass.states[e.entity];if(!n)return Z``;const a=`${e.entity}_${e.active_template_mode?e.active_template:""}_${e.inactive_template_mode?e.inactive_template:""}_${e.active_state||""}_${e.inactive_state||""}`;let o,r=!1;if(this.config.icon_rows)for(const i of this.config.icon_rows)if(null===(t=i.icons)||void 0===t?void 0:t.includes(e)){o=i.id,r=!0===i.confirmation_mode;break}const s=`${o||"no-row"}_${e.entity}_single`,l=r&&this._iconsAwaitingConfirmation.has(s),d=(t,i=!1)=>{var a,o,r,s,d,c,p,u,g,m;const _=n.attributes.icon||null;let h;if(e.dynamic_icon_template_mode&&e.dynamic_icon_template&&this._dynamicIconService){const t=null===(o=null===(a=this.config.icon_rows)||void 0===a?void 0:a.find((t=>{var i;return null===(i=t.icons)||void 0===i?void 0:i.includes(e)})))||void 0===o?void 0:o.id;if(t){const i=null===(d=null===(s=null===(r=this.config.icon_rows)||void 0===r?void 0:r.find((e=>e.id===t)))||void 0===s?void 0:s.icons)||void 0===d?void 0:d.findIndex((t=>t===e));if(void 0!==i&&i>=0){const e=`icon_${t}_${i}_dynamic_icon`;h=this._dynamicIconService.getIconResult(e)}}}const v=h||(t&&e.icon_active?e.icon_active:!t&&e.icon_inactive?e.icon_inactive:_||"mdi:help-circle-outline"),b=n.attributes.rgb_color?`rgb(${n.attributes.rgb_color.join(",")})`:n.attributes.color||null;let f;if(e.dynamic_color_template_mode&&e.dynamic_color_template&&this._dynamicColorService){const t=null===(p=null===(c=this.config.icon_rows)||void 0===c?void 0:c.find((t=>{var i;return null===(i=t.icons)||void 0===i?void 0:i.includes(e)})))||void 0===p?void 0:p.id;if(t){const i=null===(m=null===(g=null===(u=this.config.icon_rows)||void 0===u?void 0:u.find((e=>e.id===t)))||void 0===g?void 0:g.icons)||void 0===m?void 0:m.findIndex((t=>t===e));if(void 0!==i&&i>=0){const e=`icon_${t}_${i}_dynamic_color`;f=this._dynamicColorService.getColorResult(e)}}}const y=f||((t&&e.use_entity_color_for_icon_active||!t&&e.use_entity_color_for_icon_inactive||e.use_entity_color_for_icon&&(!t||void 0===e.use_entity_color_for_icon_active)&&(t||void 0===e.use_entity_color_for_icon_inactive))&&b?b:t&&e.color_active?e.color_active:e.color_inactive),k=e.name||n.attributes.friendly_name||"";let w=n.state;n.attributes.unit_of_measurement;const x=t?e.active_state_text:e.inactive_state_text;if(e.active_template_mode&&t||e.inactive_template_mode&&!t){const i=t?"active":"inactive",n=`${i}_${e.entity}_${e[`${i}_template`]}`;this.hass.__uvc_template_strings&&this.hass.__uvc_template_strings[n]&&(w=this.hass.__uvc_template_strings[n])}else null!=x&&""!==x?w=x:this.config.formatted_entities&&n.state&&(w=this._formatValue(n.state,e.entity,e.show_units));const S=e.icon_size?isNaN(Number(e.icon_size))&&"string"==typeof e.icon_size&&(e.icon_size.endsWith("px")||e.icon_size.endsWith("em")||e.icon_size.endsWith("%"))?e.icon_size:`${e.icon_size}px`:"24px",z=e.text_size?isNaN(Number(e.text_size))&&"string"==typeof e.text_size&&(e.text_size.endsWith("px")||e.text_size.endsWith("em")||e.text_size.endsWith("%"))?e.text_size:`${e.text_size}px`:"14px",C=e.name_size?isNaN(Number(e.name_size))&&"string"==typeof e.name_size&&(e.name_size.endsWith("px")||e.name_size.endsWith("em")||e.name_size.endsWith("%"))?e.name_size:`${e.name_size}px`:z,T=(()=>{if(!e.icon_background||"none"===e.icon_background)return"";let t=24;if("string"==typeof S){const e=S.match(/^(\d+)/);e&&(t=parseInt(e[1],10))}else"number"==typeof S&&(t=S);const i=t+16;let n=`background-color: ${e.use_entity_color_for_icon_background&&b?b:e.icon_background_color||"var(--secondary-background-color)"}; display: flex; align-items: center; justify-content: center; width: ${i}px; height: ${i}px;`;switch(e.icon_background){case"circle":n+="border-radius: 50%;";break;case"square":n+="border-radius: 0;";break;case"rounded-square":n+=`border-radius: ${Math.max(4,.15*i)}px;`}return n})(),A=e.text_position||"bottom",$={bottom:"column",top:"column-reverse",left:"row-reverse",right:"row"}[A]||"column",I={"flex-start":"flex-start",center:"center","flex-end":"flex-end"}[e.vertical_alignment||"center"]||"center",j=e.text_alignment||"center",E="left"===j?"flex-start":"right"===j?"flex-end":"center",M=(()=>{if(!e.container_background||"none"===e.container_background)return"";let t=`background-color: ${e.use_entity_color_for_container_background&&b?b:e.container_background_color||"var(--secondary-background-color)"}; padding: ${"left"===A||"right"===A?"4px 12px":"8px"}; display: inline-flex; align-items: ${I}; justify-content: center;`;switch(e.container_background){case"circle":t+="border-radius: 50%;";break;case"square":t+="border-radius: 0;";break;case"rounded-square":t+="border-radius: 8px;"}return t})(),V=t&&!1!==e.show_icon_active||!t&&!1!==e.show_icon_inactive,L=t?void 0===e.show_name_active?!1!==e.show_name:e.show_name_active:void 0===e.show_name_inactive?!1!==e.show_name:e.show_name_inactive,D=t?void 0===e.show_state_active?!1!==e.show_state:e.show_state_active:void 0===e.show_state_inactive?!1!==e.show_state:e.show_state_inactive,B=t?e.name_color_active||"var(--primary-text-color)":e.name_color_inactive||"var(--primary-text-color)",R=t?e.state_color_active||"var(--primary-text-color)":e.state_color_inactive||"var(--secondary-text-color)";return Z`
        <div
          class="icon-outer-container"
          style="${M}${e.container_width?`width: ${e.container_width}%;`:""}"
          @click=${t=>{this._handleIconClickWithDelay(e,t)}}
          @touchstart=${t=>{this._handleTouchStart(e,t)}}
          @touchend=${t=>{this._handleTouchEnd(e,t)}}
          @touchcancel=${t=>{this._handleTouchCancel(e,t)}}
          @pointerdown=${t=>{this._handlePointerDown(e,t)}}
          @pointerup=${t=>{this._handlePointerUp(e,t)}}
          @pointerleave=${t=>{this._handlePointerLeave(e,t)}}
        >
          <div
            class="icon-container ${"draggable"} ${i?"pending-state":""} ${l?"awaiting-confirmation":""}"
            style="flex-direction: ${$}; align-items: ${I};"
            draggable="${!this._holdTimer}"
            @dragstart=${this._handleDragStart}
            @dragend=${this._handleDragEnd}
          >
            ${e.icon_background&&"none"!==e.icon_background?Z`
                    ${V?Z`<div class="icon-background" style="${T}">
                          <ha-icon
                            .icon="${v}"
                            class="${t&&e.active_animation&&"none"!==e.active_animation?`animate-${e.active_animation}`:!t&&e.inactive_animation&&"none"!==e.inactive_animation?`animate-${e.inactive_animation}`:""}"
                            style="color: ${y||"var(--primary-text-color)"}; --mdc-icon-size: ${S};"
                          ></ha-icon>
                        </div>`:""}
                  `:Z`
                    ${V?Z`<ha-icon
                          .icon="${v}"
                          class="${t&&e.active_animation&&"none"!==e.active_animation?`animate-${e.active_animation}`:!t&&e.inactive_animation&&"none"!==e.inactive_animation?`animate-${e.inactive_animation}`:""}"
                          style="color: ${y||"var(--primary-text-color)"}; --mdc-icon-size: ${S};"
                        ></ha-icon>`:""}
                  `}
            <div
              style="display: flex; flex-direction: column; align-items: ${E}; width: 100%; gap: 2px;"
            >
              ${L?Z`<div
                    class="icon-label"
                    style="font-size: ${C}; text-align: ${j}; color: ${B}; ${this._getFormattingStyles(e,"name")}"
                  >
                    ${k}
                  </div>`:""}
              ${D?Z`<div
                    class="icon-state"
                    style="font-size: ${z}; text-align: ${j}; color: ${R}; ${this._getFormattingStyles(e,"text")}"
                  >
                    ${w}
                  </div>`:""}
            </div>
          </div>
        </div>
      `},c=null!==(i=this._iconActiveStates.get(a))&&void 0!==i&&i;return Z`${Je((async()=>{var t,i;let a=!1,o=!1;if(e.active_template_mode&&e.active_template){o=!0;const t=`active_${e.entity}_${e.active_template}`;if(this._templateService){const i=this._templateService.getTemplateResult(t);a=null!=i&&i,this.hass.__uvc_template_strings||(this.hass.__uvc_template_strings={}),this._templateService.hasTemplateSubscription(t)||this._templateService.subscribeToTemplate(e.active_template,t,(()=>this.requestUpdate()))}}else if(e.inactive_template_mode&&e.inactive_template){o=!0;const t=`inactive_${e.entity}_${e.inactive_template}`;if(this._templateService){const i=this._templateService.getTemplateResult(t);a=!(null!=i&&i),this.hass.__uvc_template_strings||(this.hass.__uvc_template_strings={}),this._templateService.hasTemplateSubscription(t)||this._templateService.subscribeToTemplate(e.inactive_template,t,(()=>this.requestUpdate()))}}if(!o){const o=n.state,r=null==o?void 0:o.toLowerCase().trim(),s=null===(t=e.active_state)||void 0===t?void 0:t.toLowerCase().trim(),l=null===(i=e.inactive_state)||void 0===i?void 0:i.toLowerCase().trim();a=!("unknown"===o||"unavailable"===o||(!s||r!==s)&&(l&&r===l||(e.active_state||e.inactive_state?e.active_state&&!e.inactive_state||(e.active_state||!e.inactive_state)&&"on"!==r&&"true"!==r&&!(Number(o)>0):!it.DEFAULT_ACTIVE_STATES.some((e=>e===r))&&(it.DEFAULT_INACTIVE_STATES.some((e=>e===r))||!("on"===r||"true"===r||Number(o)>0&&!isNaN(Number(o)))))))}return a})().then((e=>(this._iconActiveStates.get(a)!==e&&(this._iconActiveStates.set(a,e),this.requestUpdate()),d(e,!1)))),d(c,!0))}`}_handlePointerDown(e,t){"touch"!==t.pointerType&&this._startHoldTimer(e,t)}_handlePointerUp(e,t){"touch"!==t.pointerType&&this._clearHoldTimer()}_handlePointerLeave(e,t){"touch"!==t.pointerType&&this._clearHoldTimer()}_handleTouchStart(e,t){const i=`${e.entity}`;this._touchStartTimes.set(i,Date.now());const n=!(!e.single_click_action&&!e.on_click_action),a=!!e.double_click_action,o=!!e.hold_click_action;o&&this._startHoldTimer(e,t),(n||a||o)&&t.preventDefault()}_handleTouchEnd(e,t){const i=`${e.entity}`,n=this._touchStartTimes.get(i),a=Date.now();this._touchStartTimes.delete(i);const o=!(!e.single_click_action&&!e.on_click_action),r=!!e.double_click_action,s=!!e.hold_click_action,l=n?a-n:0;s&&l>=500?this._clearHoldTimer():(s&&l<500&&this._clearHoldTimer(),(o||r)&&(t.preventDefault(),this._handleIconTap(e,t)),this._lastTouchEndTime.set(i,a))}_handleTouchCancel(e,t){const i=`${e.entity}`;this._touchStartTimes.delete(i),this._clearHoldTimer(),this._singleClickTimers.has(i)&&(clearTimeout(this._singleClickTimers.get(i)),this._singleClickTimers.delete(i),this._pendingSingleClicks.delete(i))}_handleIconTap(e,t){var i;const n=`${e.entity}`;let a=!1;if(this.config.icon_rows)for(const t of this.config.icon_rows)if(null===(i=t.icons)||void 0===i?void 0:i.includes(e)){a=!0===t.confirmation_mode;break}if(a)return void this._handleIconClick(e,"single",t);const o=!(!e.single_click_action&&!e.on_click_action),r=!!e.double_click_action;if(!o||r)if(o||!r){if(o&&r)if(this._singleClickTimers.has(n))clearTimeout(this._singleClickTimers.get(n)),this._singleClickTimers.delete(n),this._pendingSingleClicks.delete(n),this._handleIconClick(e,"double",t);else{const i=window.setTimeout((()=>{const e=this._pendingSingleClicks.get(n);e&&this._handleIconClick(e.icon,"single",e.event),this._singleClickTimers.delete(n),this._pendingSingleClicks.delete(n)}),300);this._singleClickTimers.set(n,i),this._pendingSingleClicks.set(n,{icon:e,event:t})}}else if(this._singleClickTimers.has(n))clearTimeout(this._singleClickTimers.get(n)),this._singleClickTimers.delete(n),this._pendingSingleClicks.delete(n),this._handleIconClick(e,"double",t);else{const i=window.setTimeout((()=>{this._singleClickTimers.delete(n),this._pendingSingleClicks.delete(n)}),300);this._singleClickTimers.set(n,i),this._pendingSingleClicks.set(n,{icon:e,event:t})}else this._handleIconClick(e,"single",t)}_handleIconClickWithDelay(e,t){var i;const n=`${e.entity}`;if("ontouchstart"in window||navigator.maxTouchPoints>0){const e=this._lastTouchEndTime.get(n),t=Date.now();if(e&&t-e<100)return}let a=!1;if(this.config.icon_rows)for(const t of this.config.icon_rows)if(null===(i=t.icons)||void 0===i?void 0:i.includes(e)){a=!0===t.confirmation_mode;break}if(a)return void this._handleIconClick(e,"single",t);const o=!(!e.single_click_action&&!e.on_click_action),r=!!e.double_click_action;if(!o||r)if(o||!r){if(o&&r)if(this._singleClickTimers.has(n))clearTimeout(this._singleClickTimers.get(n)),this._singleClickTimers.delete(n),this._pendingSingleClicks.delete(n),this._handleIconClick(e,"double",t);else{const i=window.setTimeout((()=>{const e=this._pendingSingleClicks.get(n);e&&this._handleIconClick(e.icon,"single",e.event),this._singleClickTimers.delete(n),this._pendingSingleClicks.delete(n)}),300);this._singleClickTimers.set(n,i),this._pendingSingleClicks.set(n,{icon:e,event:t})}}else if(this._singleClickTimers.has(n))clearTimeout(this._singleClickTimers.get(n)),this._singleClickTimers.delete(n),this._pendingSingleClicks.delete(n),this._handleIconClick(e,"double",t);else{const i=window.setTimeout((()=>{this._singleClickTimers.delete(n),this._pendingSingleClicks.delete(n)}),300);this._singleClickTimers.set(n,i),this._pendingSingleClicks.set(n,{icon:e,event:t})}else this._handleIconClick(e,"single",t)}_handleIconClick(e,t="single",i){var n,a;let o,r={};if("single"===t?(o=e.single_click_action||e.on_click_action,r={navigation_path:e.single_navigation_path||e.navigation_path,url:e.single_url||e.url,service:e.single_service||e.service,service_data:e.single_service_data||e.service_data,action:e.single_action||e.action}):"double"===t?(o=e.double_click_action,r={navigation_path:e.double_navigation_path,url:e.double_url,service:e.double_service,service_data:e.double_service_data,action:e.double_action}):"hold"===t&&(o=e.hold_click_action,r={navigation_path:e.hold_navigation_path,url:e.hold_url,service:e.hold_service,service_data:e.hold_service_data,action:e.hold_action}),!e.entity||!o||"none"===o)return;let s,l=!1;if(this.config.icon_rows)for(const t of this.config.icon_rows)if(null===(n=t.icons)||void 0===n?void 0:n.includes(e)){l=!0===t.confirmation_mode,s=t.id;break}const d=`${s||"no-row"}_${e.entity}_${t}`;if(l&&"single"===t){const t=Date.now(),i=this._iconsAwaitingConfirmation.get(d)||0;if(0===i||t-i>5e3){this._iconsAwaitingConfirmation.set(d,t);const i=e=>{!e.target.closest(".awaiting-confirmation")&&this._cancelConfirmation(d)};this._confirmationCancelListeners.set(d,i),setTimeout((()=>{document.addEventListener("click",i)}),100),setTimeout((()=>{this._iconsAwaitingConfirmation.has(d)&&this._cancelConfirmation(d,!1)}),5e3);const n=`${e.entity}`;return this._singleClickTimers.has(n)&&(clearTimeout(this._singleClickTimers.get(n)),this._singleClickTimers.delete(n),this._pendingSingleClicks.delete(n)),this._showToast(`Tap again to ${o} ${this._getFriendlyName(e.entity)}, or tap elsewhere to cancel`,"info"),void this.requestUpdate()}this._cancelConfirmation(d,!1),this._showToast(`Action confirmed: ${o}`,"success")}switch(o){case"toggle":const t=e.entity.split(".")[0];this.hass.callService(t,"toggle",{entity_id:e.entity});break;case"more-info":const i=new CustomEvent("hass-more-info",{detail:{entityId:e.entity},bubbles:!0,composed:!0});this.dispatchEvent(i);break;case"navigate":if(r.navigation_path){const e=new CustomEvent("location-changed",{detail:{replace:!1},bubbles:!0,composed:!0});window.history.pushState(null,"",r.navigation_path),this.dispatchEvent(e)}break;case"url":r.url?window.open(r.url,"_blank","noopener,noreferrer"):console.warn("[UltraVehicleCard] No URL specified for url action on icon:",e);break;case"show-location-map":case"location-map":this._openLocationMap(e.entity);break;case"call-service":if(r.service)try{const[e,t]=r.service.split(".");let i={};if("string"==typeof r.service_data)try{i=JSON.parse(r.service_data)}catch(e){return this._showToast(`Error parsing service data: ${e.message}`,"error"),void console.error(`[UltraVehicleCard] Invalid service_data JSON: ${r.service_data}`,e)}else r.service_data&&"object"==typeof r.service_data&&(i=r.service_data);this.hass.callService(e,t,i).then((()=>{this._showToast(`Service ${r.service} called successfully`,"success")})).catch((e=>{this._showToast(`Error calling service ${r.service}: ${e.message}`,"error"),console.error("[UltraVehicleCard] Error calling service:",e)}))}catch(e){this._showToast(`Failed to call service: ${e.message}`,"error"),console.error("[UltraVehicleCard] Error in call-service action:",e)}else this._showToast("No service specified for call-service action","error"),console.warn("[UltraVehicleCard] No service specified for call-service action on icon:",e);break;case"perform-action":try{let t=r.action;if("string"==typeof t)try{t=JSON.parse(t)}catch(i){const n=t.split(".");return 2===n.length?void this.hass.callService(n[0],n[1],{entity_id:e.entity}).then((()=>{this._showToast(`Service ${t} called successfully`,"success")})).catch((e=>{this._showToast(`Error calling service ${t}: ${e.message}`,"error"),console.error("[UltraVehicleCard] Error calling service:",e)})):(this._showToast(`Invalid action format: ${t}`,"error"),void console.error("[UltraVehicleCard] Invalid action format:",t))}if(t&&"object"==typeof t&&t.service){const[e,i]=t.service.split("."),n=t.data||t.service_data||t.target||{};if(!i)return this._showToast(`Invalid service format in action: ${t.service}`,"error"),void console.error("[UltraVehicleCard] Invalid service format in action:",t);this.hass.callService(e,i,n).then((()=>{this._showToast("Action completed successfully","success")})).catch((e=>{this._showToast(`Error performing action: ${e.message}`,"error"),console.error("[UltraVehicleCard] Error in perform-action:",e)}))}else this._showToast("Invalid action configuration","error"),console.error("[UltraVehicleCard] Invalid action configuration:",t)}catch(e){this._showToast(`Failed to perform action: ${e.message}`,"error"),console.error("[UltraVehicleCard] Error in perform-action:",e)}break;case"trigger":const n=e.entity;if(n){const e=n.split(".")[0],t=null===(a=this.hass.states[n])||void 0===a?void 0:a.state;let i=null,o=e;switch(e){case"automation":i="trigger";break;case"script":i="turn_on";break;case"button":case"input_button":i="press";break;case"lock":i="locked"===t?"unlock":"lock"}i&&o?this.hass.callService(o,i,{entity_id:n}):i||console.warn(`[UltraVehicleCard] No suitable service found for trigger action on ${n}`)}else console.warn("[UltraVehicleCard] Trigger action called, but no entity defined for icon:",e);break;default:console.error(`[UltraVehicleCard] Unhandled icon click action: ${o}`),this._showToast(`Unhandled action: ${o}`,"error")}}_startHoldTimer(e,t){var i;let n=!1;if(this.config.icon_rows)for(const t of this.config.icon_rows)if(null===(i=t.icons)||void 0===i?void 0:i.includes(e)){n=!0===t.confirmation_mode;break}n||(this._clearHoldTimer(),this._currentHoldIcon=e,this._holdTimer=window.setTimeout((()=>{this._currentHoldIcon&&(this._handleIconClick(this._currentHoldIcon,"hold"),this._clearHoldTimer())}),500))}_clearHoldTimer(){this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null),this._currentHoldIcon=null}_handleImageClickWithDelay(e,t){const i=`${e.id}`;if("ontouchstart"in window||navigator.maxTouchPoints>0){const e=this._lastTouchEndTime.get(i),t=Date.now();if(e&&t-e<100)return}const n=!!e.single_click_action,a=!!e.double_click_action;if(n&&!a)return void this._handleImageClick(e,"single",t);if(!n&&a){if(this._singleClickTimers.has(i))clearTimeout(this._singleClickTimers.get(i)),this._singleClickTimers.delete(i),this._pendingSingleImageClicks.delete(i),this._handleImageClick(e,"double",t);else{const n=window.setTimeout((()=>{this._singleClickTimers.delete(i),this._pendingSingleImageClicks.delete(i)}),300);this._singleClickTimers.set(i,n),this._pendingSingleImageClicks.set(i,{image:e,event:t})}return}if(n&&a){if(this._singleClickTimers.has(i))clearTimeout(this._singleClickTimers.get(i)),this._singleClickTimers.delete(i),this._pendingSingleImageClicks.delete(i),this._handleImageClick(e,"double",t);else{const n=window.setTimeout((()=>{const e=this._pendingSingleImageClicks.get(i);e&&this._handleImageClick(e.image,"single",e.event),this._singleClickTimers.delete(i),this._pendingSingleImageClicks.delete(i)}),300);this._singleClickTimers.set(i,n),this._pendingSingleImageClicks.set(i,{image:e,event:t})}return}const o=e.image_entity||e.conditional_entity;o&&this._showMoreInfo(o)}_handleImageClick(e,t="single",i){var n;let a,o={};if("single"===t?(a=e.single_click_action,o={entity:e.single_entity,navigation_path:e.single_navigation_path,url:e.single_url,service:e.single_service,service_data:e.single_service_data,action:e.single_action}):"double"===t?(a=e.double_click_action,o={entity:e.double_entity,navigation_path:e.double_navigation_path,url:e.double_url,service:e.double_service,service_data:e.double_service_data,action:e.double_action}):"hold"===t&&(a=e.hold_click_action,o={entity:e.hold_entity,navigation_path:e.hold_navigation_path,url:e.hold_url,service:e.hold_service,service_data:e.hold_service_data,action:e.hold_action}),!a||"none"===a){const t=e.image_entity||e.conditional_entity;return void(t&&this._showMoreInfo(t))}const r=o.entity||e.image_entity||e.conditional_entity;switch(a){case"toggle":if(r){const e=r.split(".")[0];this.hass.callService(e,"toggle",{entity_id:r})}else this._showToast("No entity specified for toggle action","error");break;case"more-info":if(r){const e=new CustomEvent("hass-more-info",{detail:{entityId:r},bubbles:!0,composed:!0});this.dispatchEvent(e)}else this._showToast("No entity specified for more-info action","error");break;case"navigate":if(o.navigation_path){const e=new CustomEvent("location-changed",{detail:{replace:!1},bubbles:!0,composed:!0});window.history.pushState(null,"",o.navigation_path),this.dispatchEvent(e)}break;case"url":o.url?window.open(o.url,"_blank","noopener,noreferrer"):console.warn("[UltraVehicleCard] No URL specified for url action on image:",e);break;case"location-map":r?this._openLocationMap(r):this._showToast("No entity specified for location-map action","error");break;case"call-service":if(o.service)try{const[e,t]=o.service.split(".");let i={};if("string"==typeof o.service_data)try{i=JSON.parse(o.service_data)}catch(e){return this._showToast(`Error parsing service data: ${e.message}`,"error"),void console.error(`[UltraVehicleCard] Invalid service_data JSON: ${o.service_data}`,e)}else o.service_data&&"object"==typeof o.service_data&&(i=o.service_data);this.hass.callService(e,t,i).then((()=>{this._showToast(`Service ${o.service} called successfully`,"success")})).catch((e=>{this._showToast(`Error calling service ${o.service}: ${e.message}`,"error"),console.error("[UltraVehicleCard] Error calling service:",e)}))}catch(e){this._showToast(`Failed to call service: ${e.message}`,"error"),console.error("[UltraVehicleCard] Error in call-service action:",e)}else this._showToast("No service specified for call-service action","error"),console.warn("[UltraVehicleCard] No service specified for call-service action on image:",e);break;case"perform-action":try{let e=o.action;if("string"==typeof e)try{e=JSON.parse(e)}catch(t){const i=e.split(".");if(2===i.length){const t=r||"unknown";return void this.hass.callService(i[0],i[1],{entity_id:t}).then((()=>{this._showToast(`Service ${e} called successfully`,"success")})).catch((t=>{this._showToast(`Error calling service ${e}: ${t.message}`,"error"),console.error("[UltraVehicleCard] Error calling service:",t)}))}return this._showToast(`Invalid action format: ${e}`,"error"),void console.error("[UltraVehicleCard] Invalid action format:",e)}if(e&&"object"==typeof e&&e.service){const[t,i]=e.service.split("."),n=e.data||e.service_data||e.target||{};if(!i)return this._showToast(`Invalid service format in action: ${e.service}`,"error"),void console.error("[UltraVehicleCard] Invalid service format in action:",e);this.hass.callService(t,i,n).then((()=>{this._showToast("Action completed successfully","success")})).catch((e=>{this._showToast(`Error performing action: ${e.message}`,"error"),console.error("[UltraVehicleCard] Error in perform-action:",e)}))}else this._showToast("Invalid action configuration","error"),console.error("[UltraVehicleCard] Invalid action configuration:",e)}catch(e){this._showToast(`Failed to perform action: ${e.message}`,"error"),console.error("[UltraVehicleCard] Error in perform-action:",e)}break;case"trigger":if(r){const e=r.split(".")[0],t=null===(n=this.hass.states[r])||void 0===n?void 0:n.state;let i=null,a=e;switch(e){case"automation":i="trigger";break;case"script":i="turn_on";break;case"button":case"input_button":i="press";break;case"lock":i="locked"===t?"unlock":"lock"}i&&a?this.hass.callService(a,i,{entity_id:r}):i||(this._showToast(`No suitable service found for trigger action on ${r}`,"error"),console.warn(`[UltraVehicleCard] No suitable service found for trigger action on ${r}`))}else this._showToast("No entity specified for trigger action","error"),console.warn("[UltraVehicleCard] Trigger action called, but no entity defined for image:",e);break;default:console.error(`[UltraVehicleCard] Unhandled image click action: ${a}`),this._showToast(`Unhandled action: ${a}`,"error")}}_startImageHoldTimer(e,t){this._clearImageHoldTimer(),this._currentHoldImage=e,this._imageHoldTimer=window.setTimeout((()=>{this._currentHoldImage&&(this._handleImageClick(this._currentHoldImage,"hold"),this._clearImageHoldTimer())}),500)}_clearImageHoldTimer(){this._imageHoldTimer&&(clearTimeout(this._imageHoldTimer),this._imageHoldTimer=null),this._currentHoldImage=null}_handleImageTouchStart(e,t){const i=`${e.id}`;this._touchStartTimes.set(i,Date.now());const n=!!e.single_click_action,a=!!e.double_click_action,o=!!e.hold_click_action;o&&this._startImageHoldTimer(e,t),(n||a||o)&&t.preventDefault()}_handleImageTouchEnd(e,t){const i=`${e.id}`,n=this._touchStartTimes.get(i),a=Date.now();this._touchStartTimes.delete(i);const o=!!e.single_click_action,r=!!e.double_click_action,s=!!e.hold_click_action,l=n?a-n:0;s&&l>=500?this._clearImageHoldTimer():(s&&l<500&&this._clearImageHoldTimer(),(o||r)&&(t.preventDefault(),this._handleImageTap(e,t)),this._lastTouchEndTime.set(i,a))}_handleImageTouchCancel(e,t){const i=`${e.id}`;this._touchStartTimes.delete(i),this._clearImageHoldTimer(),this._singleClickTimers.has(i)&&(clearTimeout(this._singleClickTimers.get(i)),this._singleClickTimers.delete(i),this._pendingSingleImageClicks.delete(i))}_handleImageTap(e,t){const i=`${e.id}`,n=!!e.single_click_action,a=!!e.double_click_action;if(!n||a)if(n||!a){if(n&&a)if(this._singleClickTimers.has(i))clearTimeout(this._singleClickTimers.get(i)),this._singleClickTimers.delete(i),this._pendingSingleImageClicks.delete(i),this._handleImageClick(e,"double",t);else{const n=window.setTimeout((()=>{const e=this._pendingSingleImageClicks.get(i);e&&this._handleImageClick(e.image,"single",e.event),this._singleClickTimers.delete(i),this._pendingSingleImageClicks.delete(i)}),300);this._singleClickTimers.set(i,n),this._pendingSingleImageClicks.set(i,{image:e,event:t})}}else if(this._singleClickTimers.has(i))clearTimeout(this._singleClickTimers.get(i)),this._singleClickTimers.delete(i),this._pendingSingleImageClicks.delete(i),this._handleImageClick(e,"double",t);else{const n=window.setTimeout((()=>{this._singleClickTimers.delete(i),this._pendingSingleImageClicks.delete(i)}),300);this._singleClickTimers.set(i,n),this._pendingSingleImageClicks.set(i,{image:e,event:t})}else this._handleImageClick(e,"single",t)}_handleImagePointerDown(e,t){"touch"!==t.pointerType&&this._startImageHoldTimer(e,t)}_handleImagePointerUp(e,t){"touch"!==t.pointerType&&this._clearImageHoldTimer()}_handleImagePointerLeave(e,t){"touch"!==t.pointerType&&this._clearImageHoldTimer()}_showToast(e,t="info"){if("error"!==t&&!0!==this.config.show_action_toasts)return;const i=new CustomEvent("hass-notification",{detail:{message:e,dismissable:!0,duration:"error"===t?0:3e3,type:t},bubbles:!0,composed:!0});this.dispatchEvent(i)}_openLocationMap(e){const t=this.hass.states[e];if(!t)return void this._showMoreInfo(e);const i=t.attributes;let n,a;if(void 0!==i.latitude&&void 0!==i.longitude)n=i.latitude,a=i.longitude;else if(void 0!==i.Location)if(Array.isArray(i.Location)){if(i.Location.length>=2){const e=parseFloat(i.Location[0]),t=parseFloat(i.Location[1]);isNaN(e)||isNaN(t)||(n=e,a=t)}}else if("string"==typeof i.Location){const e=i.Location.split(",").map((e=>parseFloat(e.trim())));2!==e.length||isNaN(e[0])||isNaN(e[1])||(n=e[0],a=e[1])}void 0!==n&&void 0!==a?this._mapPopupData={latitude:n,longitude:a,title:i.friendly_name||e}:this._showMoreInfo(e)}_handleDragStart(e){e.dataTransfer&&(e.dataTransfer.setData("text/plain","dragging-icon"),e.target instanceof HTMLElement&&(e.target.style.opacity="0.5"))}_handleDragEnd(e){e.target instanceof HTMLElement&&(e.target.style.opacity="1")}_hexToRgb(e){const t=/^#?([a-f\d])([a-f\d])([a-f\d])$/i;if(t.test(e)){const i=t.exec(e);if(i)return{r:parseInt(i[1]+i[1],16),g:parseInt(i[2]+i[2],16),b:parseInt(i[3]+i[3],16)}}const i=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);if(i)return{r:parseInt(i[1],16),g:parseInt(i[2],16),b:parseInt(i[3],16)};const n=/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d\.]+)?\)$/i.exec(e);return n?{r:parseInt(n[1],10),g:parseInt(n[2],10),b:parseInt(n[3],10)}:null}_hashString(e){if(!e)return"0";let t=0;for(let i=0;i<e.length;i++)t=(t<<5)-t+e.charCodeAt(i),t|=0;return Math.abs(t).toString(36)}_getZoneInfo(e){var t,i,n,a;if(!e||!this.hass.states[e])return null;const o=this.hass.states[e];if(!(null===(t=null==o?void 0:o.attributes)||void 0===t?void 0:t.latitude)||!(null===(i=null==o?void 0:o.attributes)||void 0===i?void 0:i.longitude))return null;const r=Object.keys(this.hass.states).filter((e=>e.startsWith("zone.")));for(const e of r){const t=this.hass.states[e];if((null===(n=null==t?void 0:t.attributes)||void 0===n?void 0:n.latitude)&&(null===(a=null==t?void 0:t.attributes)||void 0===a?void 0:a.longitude)&&Math.abs(t.attributes.latitude-o.attributes.latitude)<1e-4&&Math.abs(t.attributes.longitude-o.attributes.longitude)<1e-4){let i=t.attributes.icon||null;return i||"zone.home"!==e||(i="mdi:home"),{zoneName:t.attributes.friendly_name||t.attributes.name||e.split(".")[1],zoneIcon:i}}}return null}_renderVehicleInfo(e=""){if(this.config.info_rows&&this.config.info_rows.length>0)return this._renderInfoRowsFromConfig(e);const t=!1!==this.config.show_location&&this.config.location_entity&&void 0!==this.hass.states[this.config.location_entity],i=!1!==this.config.show_mileage&&this.config.mileage_entity&&void 0!==this.hass.states[this.config.mileage_entity],n=!1!==this.config.show_car_state&&this.config.car_state_entity&&void 0!==this.hass.states[this.config.car_state_entity],a=!1!==this.config.show_info_icons;if(!t&&!i&&!n)return Z``;const o=t?this._formatValue(this.hass.states[this.config.location_entity].state,this.config.location_entity):"",r=t?this._getZoneInfo(this.config.location_entity):null,s=(null==r?void 0:r.zoneIcon)||"mdi:map-marker",l=i?this._formatValue(this.hass.states[this.config.mileage_entity].state,this.config.mileage_entity):"",d=n?this._formatValue(this.hass.states[this.config.car_state_entity].state,this.config.car_state_entity):"",c=this.config.location_text_size?`font-size: ${"number"==typeof this.config.location_text_size?`${this.config.location_text_size}px`:this.config.location_text_size};`:"",p=this.config.mileage_text_size?`font-size: ${"number"==typeof this.config.mileage_text_size?`${this.config.mileage_text_size}px`:this.config.mileage_text_size};`:"",u=this.config.car_state_text_size?`font-size: ${"number"==typeof this.config.car_state_text_size?`${this.config.car_state_text_size}px`:this.config.car_state_text_size};`:"";return Z`
      <div class="vehicle-info-container" style="${e}">
        <div class="vehicle-info-top" style="${t&&i?"":"justify-content: center;"}">
          ${t?Z`
                <div
                  class="info-item-with-icon"
                  @click=${()=>this._showMoreInfo(this.config.location_entity)}
                >
                  ${a?Z`
                        <ha-icon
                          icon="${s}"
                          style="${this.config.location_icon_color?`color: ${this.config.location_icon_color};`:""}"
                        ></ha-icon>
                      `:""}
                  <span
                    style="${this.config.location_text_color?`color: ${this.config.location_text_color};`:""}${c}"
                    >${o}</span
                  >
                </div>
              `:""}
          ${i?Z`
                <div
                  class="info-item-with-icon"
                  @click=${()=>this._showMoreInfo(this.config.mileage_entity)}
                >
                  ${a?Z`
                        <ha-icon
                          icon="mdi:speedometer"
                          style="${this.config.mileage_icon_color?`color: ${this.config.mileage_icon_color};`:""}"
                        ></ha-icon>
                      `:""}
                  <span
                    style="${this.config.mileage_text_color?`color: ${this.config.mileage_text_color};`:""}${p}"
                    >${l}</span
                  >
                </div>
              `:""}
        </div>

        ${n?Z`
              <div
                class="info-item-status"
                @click=${()=>this._showMoreInfo(this.config.car_state_entity)}
                style="cursor: pointer; ${this.config.car_state_text_color?`color: ${this.config.car_state_text_color};`:""}${u}"
              >
                <span>${d}</span>
              </div>
            `:""}
      </div>
    `}_computeImageStyle(e,t){const i=[];return void 0!==e&&(i.push(`width: ${e}%;`),i.push("height: auto;"),i.push("max-width: none;"),i.push("object-fit: contain;")),t&&(0!==t.top&&i.push(`margin-top: ${t.top}px;`),0!==t.right&&i.push(`margin-right: ${t.right}px;`),0!==t.bottom&&i.push(`margin-bottom: ${t.bottom}px;`),0!==t.left&&i.push(`margin-left: ${t.left}px;`)),i.join(" ")}_normalizeState(e){return e?e.toLowerCase().replace(/\s+/g,"_"):""}_renderBarLabels(e){var t,i;const n=!1!==e.show_left&&this._checkBarSideCondition(e.left_condition),a=!1!==e.show_right&&this._checkBarSideCondition(e.right_condition);if(!n&&!a)return Z``;let o="";n&&(e.left_template_mode&&e.left_template?o=this._processBarTemplate(e,"left"):e.left_entity&&(o=this._formatValue(null===(t=this.hass.states[e.left_entity])||void 0===t?void 0:t.state,e.left_entity)));let r="";a&&(e.right_template_mode&&e.right_template?r=this._processBarTemplate(e,"right"):e.right_entity&&(r=this._formatValue(null===(i=this.hass.states[e.right_entity])||void 0===i?void 0:i.state,e.right_entity)));const s=e=>{var t,i;return e&&this.hass.states[e]&&((null===(i=null===(t=this.hass.states[e])||void 0===t?void 0:t.attributes)||void 0===i?void 0:i.friendly_name)||e.split(".").pop())||""},l=(e,t=15)=>e?e.length<=t?e:e.substring(0,t)+"...":"",d=e.left_title||(n&&e.left_entity?s(e.left_entity):""),c=e.right_title||(a&&e.right_entity?s(e.right_entity):""),p=e.alignment||"space-between",u=e.left_text_color||"var(--secondary-text-color)",g=e.right_text_color||"var(--secondary-text-color)",m=e.left_title_color||"var(--secondary-text-color)",_=e.right_title_color||"var(--secondary-text-color)",h=e.left_title_size?`${e.left_title_size}px`:"inherit",v=e.left_text_size?`${e.left_text_size}px`:"inherit",b=e.right_title_size?`${e.right_title_size}px`:"inherit",f=e.right_text_size?`${e.right_text_size}px`:"inherit";return Z`
      <div class="bar-labels" style="justify-content: ${p};">
        ${n?Z`
              <div
                class="bar-label left"
                @click=${()=>e.left_entity&&this._showMoreInfo(e.left_entity)}
              >
                ${d&&!1!==e.show_left_title?Z`<span
                      class="label-title"
                      style="color: ${m}; font-size: ${h}; ${this._getFormattingStyles(e,"left_title")}"
                      >${l(d)}${o&&!1!==e.show_left_value?":":""}</span
                    >`:""}
                ${o&&!1!==e.show_left_value?Z`<span
                      class="label-value"
                      style="color: ${u}; font-size: ${v}; ${this._getFormattingStyles(e,"left_text")}"
                      >${o}</span
                    >`:""}
              </div>
            `:""}
        ${a?Z`
              <div
                class="bar-label right"
                @click=${()=>e.right_entity&&this._showMoreInfo(e.right_entity)}
              >
                ${c&&!1!==e.show_right_title?Z`<span
                      class="label-title"
                      style="color: ${_}; font-size: ${b}; ${this._getFormattingStyles(e,"right_title")}"
                      >${l(c)}${r&&!1!==e.show_right_value?":":""}</span
                    >`:""}
                ${r&&!1!==e.show_right_value?Z`<span
                      class="label-value"
                      style="color: ${g}; font-size: ${f}; ${this._getFormattingStyles(e,"right_text")}"
                      >${r}</span
                    >`:""}
              </div>
            `:""}
      </div>
    `}_processBarTemplate(e,t){var i;if(!this._templateService)return"";const n="left"===t?e.left_entity:e.right_entity,a="left"===t?e.left_template:e.right_template;if(!n||!a)return"";const o=`bar_${t}_${n}_${a}`;return this.hass.__uvc_template_strings&&this.hass.__uvc_template_strings[o]?this.hass.__uvc_template_strings[o]:(this._templateService.hasTemplateSubscription(o)||this._templateService.subscribeToTemplate(a,o,(()=>this.requestUpdate())),(null===(i=this.hass.__uvc_template_strings)||void 0===i?void 0:i[o])||"")}_showMoreInfo(e){const t=new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0});this.dispatchEvent(t)}firstUpdated(){setTimeout((()=>{var e,t;if(this._migrateBarsToIndividual(),this._forceFullRender(),(null===(t=null===(e=this.config)||void 0===e?void 0:e.bars)||void 0===t?void 0:t.length)>0&&this.config.sections_order){const e=this.config.bars.length,t=this.config.sections_order.filter((e=>e.startsWith("bar_"))).length;e>t&&this._migrateBarsToIndividual()}}),100)}connectedCallback(){super.connectedCallback(),this.hass&&!this._templateService&&(this._templateService=new Qe(this.hass)),this.hass&&!this._dynamicColorService&&(this._dynamicColorService=new Ye(this.hass)),this.hass&&!this._dynamicIconService&&(this._dynamicIconService=new Xe(this.hass)),this._setupRefreshInterval(),this.addEventListener("force-gradient-refresh",this._handleForceGradientRefresh),this._highlightService=et.getInstance(),this._highlightService.onHighlightChange(this._onHighlightChange),setTimeout((()=>{var e,t;(null===(t=null===(e=this.config)||void 0===e?void 0:e.bars)||void 0===t?void 0:t.some((e=>e.use_gradient)))&&this._forceFullRender(),this.requestUpdate()}),100),setTimeout((()=>{var e,t;(null===(t=null===(e=this.config)||void 0===e?void 0:e.bars)||void 0===t?void 0:t.some((e=>e.use_gradient)))&&this._forceFullRender()}),1e3)}disconnectedCallback(){super.disconnectedCallback(),this._templateService&&this._templateService.unsubscribeAllTemplates(),this._dynamicColorService&&this._dynamicColorService.unsubscribeAllColorTemplates(),this._dynamicIconService&&this._dynamicIconService.unsubscribeAllIconTemplates(),this._refreshInterval&&(clearInterval(this._refreshInterval),this._refreshInterval=void 0),this._clearTimedImage(),this._imageConditionStates.clear(),this._unsubscribeAllTemplates(),this._iconsAwaitingConfirmation.clear(),this._confirmationCancelListeners.forEach(((e,t)=>{document.removeEventListener("click",e)})),this._confirmationCancelListeners.clear(),this._singleClickTimers.forEach((e=>{clearTimeout(e)})),this._singleClickTimers.clear(),this._pendingSingleClicks.clear(),this._pendingSingleImageClicks.clear(),this._touchStartTimes.clear(),this._lastTouchEndTime.clear(),this._clearImageHoldTimer(),this.removeEventListener("force-gradient-refresh",this._handleForceGradientRefresh)}_handleForceGradientRefresh(e){var t;const i=e;this._lastRenderTime=(null===(t=i.detail)||void 0===t?void 0:t.timestamp)||Date.now(),this._forceFullRender(),[10,25,50,100,500].forEach((e=>{setTimeout((()=>{this._lastRenderTime=Date.now(),this.requestUpdate(),this.dispatchEvent(new CustomEvent("gradient-update-complete",{bubbles:!0,composed:!0,detail:{timestamp:this._lastRenderTime,config:this.config}}))}),e)}))}_setupRefreshInterval(){this._refreshInterval&&clearInterval(this._refreshInterval),this._refreshInterval=window.setInterval((()=>{var e;(null===(e=this.config.bars)||void 0===e?void 0:e.some((e=>{const t=e.animation_entity||e.action_animation_entity,i=e.animation_state||e.action_animation_state,n=e.animation_type||e.action_animation;if(t&&i&&n&&"none"!==n){const e=this.hass.states[t];return e&&e.state===i}return!1})))&&(this._lastRenderTime=Date.now(),this.requestUpdate())}),1e3)}updated(e){var t,i,n,a,o,r,s,l,d;super.updated(e);const c=Date.now();if(!(this._lastRenderTime&&c-this._lastRenderTime<100)&&(e.has("hass")&&(!this._templateService&&this.hass?this._templateService=new Qe(this.hass):this._templateService&&this.hass&&this._templateService.updateHass(this.hass),!this._dynamicColorService&&this.hass?this._dynamicColorService=new Ye(this.hass):this._dynamicColorService&&this.hass&&this._dynamicColorService.updateHass(this.hass),!this._dynamicIconService&&this.hass?this._dynamicIconService=new Xe(this.hass):this._dynamicIconService&&this.hass&&this._dynamicIconService.updateHass(this.hass)),e.has("config")||e.has("hass"))){if(this._lastRenderTime=c,e.has("config")&&this.config&&(this._subscribeToDynamicTemplates(),setTimeout((()=>{this._subscribeToDynamicTemplates()}),100)),e.has("hass")){const c=e.get("hass");let p=!1;if("entity"===this.config.vehicle_image_type&&this.config.vehicle_image_entity){const e=this.config.vehicle_image_entity,o=null===(t=null==c?void 0:c.states[e])||void 0===t?void 0:t.state,r=null===(i=this.hass.states[e])||void 0===i?void 0:i.state;if(o!==r){if(this._entityStates.set(e,r||""),null===(a=null===(n=this.hass.states[e])||void 0===n?void 0:n.attributes)||void 0===a?void 0:a.entity_picture){let t=this.hass.states[e].attributes.entity_picture;t.startsWith("/")&&(t=`${this.hass.hassUrl?this.hass.hassUrl():""}${t.startsWith("/")?t.substring(1):t}`),this._entityImageUrls.set(e,`${t}${t.includes("?")?"&":"?"}state=${Date.now()}`)}p=!0}}if(this.config.action_entity&&this.config.action_state){const e=this.config.action_entity;if((null===(o=null==c?void 0:c.states[e])||void 0===o?void 0:o.state)!==(null===(r=this.hass.states[e])||void 0===r?void 0:r.state)&&"entity"===this.config.action_image_type&&this.config.action_image_entity){const e=this.config.action_image_entity;if(this._entityStates.set(e,(null===(s=this.hass.states[e])||void 0===s?void 0:s.state)||""),null===(d=null===(l=this.hass.states[e])||void 0===l?void 0:l.attributes)||void 0===d?void 0:d.entity_picture){let t=this.hass.states[e].attributes.entity_picture;t.startsWith("/")&&(t=`${this.hass.hassUrl?this.hass.hassUrl():""}${t.startsWith("/")?t.substring(1):t}`),this._entityImageUrls.set(e,`${t}${t.includes("?")?"&":"?"}state=${Date.now()}`)}p=!0}}if("timed"===this.config.image_priority_mode&&this.config.images){const e=this.config.images.filter((e=>!e.is_fallback&&"none"!==e.image_type));for(const t of e)if(this._imageMatchesConditions(t)&&this._currentTimedImage!==t.id){p=!0;break}}p&&this.requestUpdate()}this.shadowRoot&&setTimeout((()=>{var e;const t=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelectorAll(".progress-bar-fill");t&&t.length>0&&t.forEach((e=>{if(e instanceof HTMLElement){e.offsetHeight;const t=e.getAttribute("has-gradient"),i=e.getAttribute("data-mode");"true"===t&&("full"===i?(e.style.backgroundSize="100% 100%",e.style.backgroundPosition="0% 0%",e.style.backgroundRepeat="no-repeat"):"value_based"===i&&(e.style.backgroundImage="none"))}}))}),0)}}async _evaluateTemplate(e){return!!this._templateService&&this._templateService.evaluateTemplate(e)}async _subscribeToTemplate(e,t){if(this._templateService)return this._templateService.subscribeToTemplate(e,t,(()=>this.requestUpdate()))}_parseTemplateResult(e,t){return!!this._templateService&&this._templateService.parseTemplateResult(e,t)}async _unsubscribeAllTemplates(){if(this._templateService)return this._templateService.unsubscribeAllTemplates()}async _subscribeToDynamicTemplates(){if(this.hass&&this.config){if(this.config.icon_rows)for(const e of this.config.icon_rows)if(e.icons)for(let t=0;t<e.icons.length;t++){const i=e.icons[t];if(i.dynamic_icon_template_mode&&i.dynamic_icon_template&&this._dynamicIconService){const n=`icon_${e.id}_${t}_dynamic_icon`;await this._dynamicIconService.subscribeToIconTemplate(i.dynamic_icon_template,n,(()=>{this.requestUpdate()}))}if(i.dynamic_color_template_mode&&i.dynamic_color_template&&this._dynamicColorService){const n=`icon_${e.id}_${t}_dynamic_color`;await this._dynamicColorService.subscribeToColorTemplate(i.dynamic_color_template,n,(()=>{this.requestUpdate()}))}}if(this.config.info_rows)for(const e of this.config.info_rows)if(e.info_entities)for(let t=0;t<e.info_entities.length;t++){const i=e.info_entities[t];if(i.dynamic_icon_template_mode&&i.dynamic_icon_template&&this._dynamicIconService){const n=`info_${e.id}_${t}_dynamic_icon`;await this._dynamicIconService.subscribeToIconTemplate(i.dynamic_icon_template,n,(()=>this.requestUpdate()))}if(i.dynamic_color_template_mode&&i.dynamic_color_template&&this._dynamicColorService){const n=`info_${e.id}_${t}_dynamic_color`;await this._dynamicColorService.subscribeToColorTemplate(i.dynamic_color_template,n,(()=>this.requestUpdate()))}}}}_renderMapPopup(){if(!this._mapPopupData)return Z``;const{latitude:e,longitude:t,title:i}=this._mapPopupData,n=this._getEntityForCoordinates(e,t);let a="",o="";if(o=this._formatCoordinates(e,t),n&&this.hass.states[n]){const e=this.hass.states[n],t=e.attributes;if(e.state&&!e.state.match(/^\d+\.\d+,\s*-?\d+\.\d+$/)&&e.state.length>5&&!e.state.match(/^(unavailable|unknown|none)$/i))a=e.state;else if(t.formatted_address)a=t.formatted_address;else{const e=[];t.Name&&e.push(String(t.Name)),t.Thoroughfare&&e.push(String(t.Thoroughfare)),t.Locality&&e.push(String(t.Locality)),t.Administrative_Area&&e.push(String(t.Administrative_Area)),t.Postal_Code&&e.push(String(t.Postal_Code)),t.Country&&e.push(String(t.Country)),e.length>0&&(a=e.join(", "))}}a||(a=o);const r=`https://www.google.com/maps?q=${e},${t}&z=15&output=embed`;return Z`
      <div class="map-popup-overlay" @click=${this._closeMapPopup}>
        <div class="map-popup-content" @click=${e=>e.stopPropagation()}>
          <div class="map-popup-header">
            <div class="map-popup-title">
              <h3>${i}</h3>
              <div class="map-popup-address">${a}</div>
            </div>
            <ha-icon-button @click=${this._closeMapPopup}>
              <ha-icon icon="mdi:close"></ha-icon>
            </ha-icon-button>
          </div>

          <div style="height: 450px; width: 100%; position: relative;">
            <iframe
              width="100%"
              height="100%"
              frameborder="0"
              style="border:0; position: relative; z-index: 1;"
              src="${r}"
              allowfullscreen
            ></iframe>
          </div>
          <div class="map-popup-footer">
            <a
              href="https://www.google.com/maps?q=${e},${t}"
              target="_blank"
              rel="noopener noreferrer"
            >
              View larger map
            </a>
          </div>
        </div>
      </div>
    `}_formatCoordinates(e,t){return`${Math.abs(e).toFixed(6)}° ${e>=0?"N":"S"}, ${Math.abs(t).toFixed(6)}° ${t>=0?"E":"W"}`}_getEntityForCoordinates(e,t){for(const i in this.hass.states){const n=this.hass.states[i].attributes;if(n.latitude===e&&n.longitude===t)return i;if(Array.isArray(n.Location)&&n.Location.length>=2&&Math.abs(parseFloat(n.Location[0])-e)<1e-4&&Math.abs(parseFloat(n.Location[1])-t)<1e-4)return i}return null}_isDarkMode(){if(this.shadowRoot){const e=getComputedStyle(document.documentElement).getPropertyValue("--card-background-color").trim();if(e){const t=this._hexToRgb(e);if(t)return.299*t.r+.587*t.g+.114*t.b<128}}return!1}_closeMapPopup(){this._mapPopupData=null}_isHighlighted(e){return!!this._highlightService&&this._highlightService.isHighlighted(e)}_getHighlightClass(e){return this._highlightService?this._highlightService.getHighlightClass(e):""}_getStorageKey(){return`uvc_last_triggered_${this.config?JSON.stringify(this.config).substring(0,20):"default"}`}_restoreStateFromStorage(){if(!this._stateRestored&&this.config)try{const e=this._getStorageKey(),t=localStorage.getItem(e);if(t){const e=JSON.parse(t);e.triggerTimes&&(this._imageTriggerTimes=new Map(Object.entries(e.triggerTimes))),e.triggerResults&&(this._imageTriggerResults=new Map(Object.entries(e.triggerResults)))}this._stateRestored=!0}catch(e){}}_saveStateToStorage(){try{const e=this._getStorageKey(),t={triggerTimes:Object.fromEntries(this._imageTriggerTimes.entries()),triggerResults:Object.fromEntries(this._imageTriggerResults.entries()),timestamp:Date.now()};localStorage.setItem(e,JSON.stringify(t))}catch(e){}}_shouldRenderSection(e){if(!this.config||!this.hass||!this._templateService)return!0;const t=this.config.section_templates;if(t&&t[e]){const i=t[e];if(i.template_mode&&i.template){const t=`section_${e}_${i.template}`;if(this._templateService.hasTemplateSubscription(t)){const e=this._templateService.getTemplateResult(t);return null==e||e}return this._templateService.subscribeToTemplate(i.template,t,(()=>{this.requestUpdate()})),!0}}const i=this.config.section_conditions;if(!i)return!0;let n,a=!1;e.startsWith("bar_")&&(n=i[e]),!n&&i[e]?n=i[e]:!n&&e.startsWith("bar_")&&i.bars&&(n=i.bars,a=!0);let o=!0;if(n)if(a&&!n.entity)o=!0;else{const e=n.entity,t=n.state,i=n.type||"show";if(e){const n=this._getEntityState(e);let a=!1;if(t.startsWith("/")&&t.endsWith("/"))try{a=new RegExp(t.slice(1,-1)).test(n||"")}catch(e){a=!1}else{const e=["on","off","true","false","unavailable","unknown","charging","not_charging","discharging","idle","parked"];a=n&&e.includes(t.toLowerCase())&&e.includes(n.toLowerCase())?n.toLowerCase()===t.toLowerCase():n===t}o="show"===i?a:"hide"!==i||!a}else o="show"===i?!t:"hide"!==i||!!t}return o}_cancelConfirmation(e,t=!0){this._iconsAwaitingConfirmation.delete(e),this._confirmationCancelListeners.has(e)&&(document.removeEventListener("click",this._confirmationCancelListeners.get(e)),this._confirmationCancelListeners.delete(e)),this.requestUpdate(),t&&this._showToast("Confirmation cancelled","info")}_checkBarSideCondition(e){var t;if(!e||"none"===e.type||!e.entity)return!0;const i=null===(t=this.hass.states[e.entity])||void 0===t?void 0:t.state;if(void 0===i)return!0;const n=String(e.state).toLowerCase(),a=String(i).toLowerCase()===n;return"show"===e.type?a:"hide"!==e.type||!a}_processPercentageTemplate(e){if(!this._templateService||!e)return null;const t=`percentage_${e}`;if(this._templateService.hasTemplateSubscription(t)){const e=this._templateService.getTemplateResult(t);if(void 0!==e){const t=parseFloat(String(e));if(!isNaN(t))return t}}return this._templateService.subscribeToTemplate(e,t,(()=>{this.requestUpdate()})),null}_renderInfoRowsFromConfig(e=""){return this.config.info_rows&&this.config.info_rows.length?Z`
      <div class="info-rows-container" style="${e}">
        ${this.config.info_rows.map((e=>this._renderSingleInfoRow(e)))}
      </div>
    `:Z``}_renderSingleInfoRow(e){if(!e.info_entities||0===e.info_entities.length)return Z``;const t=e.width||"100",i=e.alignment||"center",n=e.spacing||"medium",a=e.vertical_alignment||"center",o=!0===e.allow_wrap,r=e.columns||0;let s=`width: ${t}%; gap: ${{none:"0",small:"8px",medium:"16px",large:"24px"}[n]||"16px"}; justify-content: ${i}; align-items: ${a};`;s+=r>0?`display: grid; grid-template-columns: repeat(${r}, minmax(0, 1fr));`:`display: flex; flex-wrap: ${o?"wrap":"nowrap"};`;const l=!1!==e.show_row_header&&e.row_header,d=e.row_header_size?`font-size: ${e.row_header_size}px;`:"",c=e.row_header_color?`color: ${e.row_header_color};`:"";return Z`
      ${l?Z`
            <div class="section-title" style="${d} ${c}">${e.row_header}</div>
          `:""}
      <div class="info-row-item" style="${s}">
        ${e.info_entities.map((e=>this._renderSingleInfoEntity(e)))}
      </div>
    `}_renderSingleInfoEntity(e){var t,i,n,a,o,r,s,l,d,c;if(!e.entity||!this.hass.states[e.entity])return Z``;const p=this.hass.states[e.entity],u=!1!==e.show_icon,g=!1!==e.show_name;let m,_,h="";if(e.template_mode&&e.value_template){const t=this._hashString(e.value_template),i=`info_entity_${e.id}_${e.entity}_${t}`;this._templateService&&this.hass.__uvc_template_strings&&this.hass.__uvc_template_strings[i]?h=this.hass.__uvc_template_strings[i]:this._templateService&&this._templateService.subscribeToTemplate(e.value_template,i,(()=>{this.requestUpdate()}))}else h=this._formatValue(p.state,e.entity);if(e.dynamic_icon_template_mode&&e.dynamic_icon_template&&this._dynamicIconService){const r=null===(i=null===(t=this.config.info_rows)||void 0===t?void 0:t.find((t=>{var i;return null===(i=t.info_entities)||void 0===i?void 0:i.includes(e)})))||void 0===i?void 0:i.id;if(r){const t=null===(o=null===(a=null===(n=this.config.info_rows)||void 0===n?void 0:n.find((e=>e.id===r)))||void 0===a?void 0:a.info_entities)||void 0===o?void 0:o.findIndex((t=>t===e));if(void 0!==t&&t>=0){const e=`info_${r}_${t}_dynamic_icon`;m=this._dynamicIconService.getIconResult(e)}}}if(e.dynamic_color_template_mode&&e.dynamic_color_template&&this._dynamicColorService){const t=null===(s=null===(r=this.config.info_rows)||void 0===r?void 0:r.find((t=>{var i;return null===(i=t.info_entities)||void 0===i?void 0:i.includes(e)})))||void 0===s?void 0:s.id;if(t){const i=null===(c=null===(d=null===(l=this.config.info_rows)||void 0===l?void 0:l.find((e=>e.id===t)))||void 0===d?void 0:d.info_entities)||void 0===c?void 0:c.findIndex((t=>t===e));if(void 0!==i&&i>=0){const e=`info_${t}_${i}_dynamic_color`;_=this._dynamicColorService.getColorResult(e)}}}const v=_||e.icon_color||"var(--primary-color)",b=e.name_color||"var(--primary-text-color)";let f="var(--primary-text-color)";"primary"===e.text_color?f="var(--primary-color)":"secondary"===e.text_color?f="var(--secondary-text-color)":"accent"===e.text_color?f="var(--accent-color)":"custom"===e.text_color&&e.custom_text_color?f=e.custom_text_color:"string"==typeof e.text_color&&e.text_color.startsWith("#")&&(f=e.text_color);const y=e.icon_size?`${e.icon_size}px`:"24px",k=e.name_size?`${e.name_size}px`:"14px",w=e.text_size?`${e.text_size}px`:"14px",x="dashboard"===this.config.layout_type;return Z`
      <div
        class="info-entity-item"
        style="${`\n      display: flex;\n      flex-direction: row;\n      align-items: inherit;\n      padding: ${x?"4px 6px":"8px"};\n      min-width: 0;\n    `}"
        @click=${()=>this._handleInfoEntityClick(e)}
      >
        ${u&&(m||e.icon)?Z`
              <ha-icon
                icon="${m||e.icon}"
                style="color: ${v}; --mdc-icon-size: ${y}; margin-right: 8px;"
              ></ha-icon>
            `:""}
        <div
          style="${x?"min-width: 0; overflow: visible; flex: 1;":"min-width: 0; overflow: hidden;"}"
        >
          ${g?Z`
                <div
                  style="font-size: ${k}; color: ${b}; margin-bottom: 2px; ${this._getFormattingStyles(e,"name")} ${x?"white-space: normal; word-wrap: break-word; line-height: 1.2;":""}"
                >
                  ${e.name||this._getFriendlyName(e.entity)}
                </div>
              `:""}
          <div
            style="font-size: ${w}; color: ${f}; ${this._getFormattingStyles(e,"text")} ${x?"overflow: visible; white-space: normal; word-wrap: break-word; line-height: 1.3;":"overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;"}"
          >
            ${h}
          </div>
        </div>
      </div>
    `}_handleInfoEntityClick(e){if(e.entity)switch(e.on_click_action){case"more-info":default:this._showMoreInfo(e.entity);break;case"navigate":if(e.navigation_path){const t=new CustomEvent("location-changed",{detail:{replace:!1},bubbles:!0,composed:!0});window.history.pushState(null,"",e.navigation_path),this.dispatchEvent(t)}break;case"url":e.url&&window.open(e.url,"_blank","noopener,noreferrer");break;case"call-service":if(e.service)try{const[t,i]=e.service.split(".");let n={};if("string"==typeof e.service_data)try{n=JSON.parse(e.service_data)}catch(t){console.error(`Invalid service_data JSON for entity ${e.entity}:`,t)}else e.service_data&&"object"==typeof e.service_data&&(n=e.service_data);this.hass.callService(t,i,n)}catch(t){console.error(`Error calling service for entity ${e.entity}:`,t)}}}};var ot,rt,st;at._versionLogged=!1,at.DEFAULT_ACTIVE_STATES=["on","open","unlocked","connected","running","moving","charging","plugged in","enabled","heating","cooling","occupied","engaged","active","cleaning","starting","ready","true","triggered","detected","home","present"],at.DEFAULT_INACTIVE_STATES=["unavailable","unknown","offline","disconnected","not responding","no signal","not ready","fault","idle","inactive","off","standby","sleep","sleeping","paused","closed","locked","parked","not charging","unplugged","disabled","offloading","stopped","false","not_detected","away","empty","vacant"],nt([be({attribute:!1})],at.prototype,"hass",void 0),nt([be()],at.prototype,"config",void 0),nt([fe()],at.prototype,"_mapPopupData",void 0),nt([fe()],at.prototype,"_iconActiveStates",void 0),nt([fe()],at.prototype,"_iconsAwaitingConfirmation",void 0),nt([fe()],at.prototype,"_currentTimedImage",void 0),nt([fe()],at.prototype,"_timedImageStartTime",void 0),nt([fe()],at.prototype,"_imageConditionStates",void 0),nt([fe()],at.prototype,"_templateSubscriptions",void 0),nt([fe()],at.prototype,"_templateResults",void 0),at=it=nt([_e("ultra-vehicle-card")],at),(st=ot||(ot={})).language="language",st.system="system",st.comma_decimal="comma_decimal",st.decimal_comma="decimal_comma",st.space_comma="space_comma",st.none="none",function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(rt||(rt={})),new Set(["fan","input_boolean","light","switch","group","automation"]);var lt=function(e,t,i,n){n=n||{},i=null==i?{}:i;var a=new Event(t,{bubbles:void 0===n.bubbles||n.bubbles,cancelable:Boolean(n.cancelable),composed:void 0===n.composed||n.composed});return a.detail=i,e.dispatchEvent(a),a};new Set(["call-service","divider","section","weblink","cast","select"]);var dt=function(e,t,i,n){var a,o=arguments.length,r=o<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,n);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(r=(o<3?a(r):o>3?a(t,i,r):a(t,i))||r);return o>3&&r&&Object.defineProperty(t,i,r),r};let ct=class extends ge{static get styles(){return c`
      ha-entity-picker {
        width: 100%;
        display: block;
      }
    `}render(){return Z`
      <ha-entity-picker
        .hass=${this.hass}
        .label=${this.label}
        .value=${this.value||""}
        .entityFilter=${this.entityFilter}
        @value-changed=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>
    `}_valueChanged(e){const t=e.detail.value;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t},bubbles:!0,composed:!0}))}};dt([be({attribute:!1})],ct.prototype,"hass",void 0),dt([be()],ct.prototype,"label",void 0),dt([be()],ct.prototype,"value",void 0),dt([be()],ct.prototype,"entityFilter",void 0),ct=dt([_e("ultra-entity-picker")],ct);var pt=function(e,t,i,n){var a,o=arguments.length,r=o<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,n);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(r=(o<3?a(r):o>3?a(t,i,r):a(t,i))||r);return o>3&&r&&Object.defineProperty(t,i,r),r};let ut=class extends ge{constructor(){super(...arguments),this.showResetButton=!0}_getDisplayColor(e){var t;let i="string"==typeof e?e:void 0;if("object"==typeof e&&null!==e){const t=Object.keys(e);1===t.length&&"string"==typeof e[t[0]]?(i=e[t[0]],console.warn("ColorPicker received object, extracting value:",i)):(console.warn("ColorPicker received unexpected object:",e),i=void 0)}if(!i)return"#CCCCCC";if(i.startsWith("var(--"))try{const e=document.createElement("div");e.style.display="none",e.style.color=i,document.body.appendChild(e);const t=getComputedStyle(e).color;if(document.body.removeChild(e),t&&t.startsWith("rgb")){const e=t.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);if(e){const[t,i,n,a]=e;return this._rgbToHex(parseInt(i),parseInt(n),parseInt(a))}}return t||"#CCCCCC"}catch(e){console.warn("Error computing color from variable:",e);const n=null===(t=i.match(/var\(([^,)]+)/))||void 0===t?void 0:t[1];if(n){if(n.includes("--primary-text-color"))return"#FFFFFF";if(n.includes("--secondary-text-color"))return"#A0A0A0";if(n.includes("--primary-color"))return"#03A9F4";if(n.includes("--card-background-color"))return"#1C1C1C"}return"#CCCCCC"}return i}_rgbToHex(e,t,i){return"#"+[e,t,i].map((e=>{const t=e.toString(16);return 1===t.length?"0"+t:t})).join("")}_onColorChanged(e){let t=e.target.value;t||(t="#CCCCCC"),t!==this.value&&(this.value=t,this._fireChangeEvent())}_fireChangeEvent(){this.configValue?this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{[this.configValue]:this.value}},bubbles:!0,composed:!0})):this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.value},bubbles:!0,composed:!0}))}_resetColor(){this.configValue&&this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{[this.configValue]:void 0}},bubbles:!0,composed:!0}))}render(){const e=this._getDisplayColor(this.value);return Z`
      ${this.label?Z`<div class="color-picker-label">${this.label}</div>`:""}
      <div class="color-picker-row">
        <input
          type="color"
          .value=${e}
          @change=${this._onColorChanged}
          class="color-input"
          aria-label=${this.label||"Color picker"}
        />
        ${this.showResetButton?Z`
              <ha-icon-button
                class="reset-button"
                @click=${this._resetColor}
                title="Reset to default color"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </ha-icon-button>
            `:""}
      </div>
    `}static get styles(){return c`
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
    `}};pt([be()],ut.prototype,"value",void 0),pt([be()],ut.prototype,"label",void 0),pt([be()],ut.prototype,"configValue",void 0),pt([be({type:Boolean})],ut.prototype,"showResetButton",void 0),ut=pt([_e("color-picker")],ut);const gt=JSON.parse('{"editor":{"tabs":{"settings":"Settings","bars":"Bars","icons":"Icons","customize":"Customize","about":"About","info":"Info","images":"Images"},"info":{"title":"Card Information","description":"Configure information rows and entities to display vehicle details like location, mileage, etc. Info items will display on a single line when possible, wrapping to multiple lines in narrow containers.","add_row":"Add Info Row","add_entity":"Add Info Entity","arrange_info_rows":"Arrange Info Rows","duplicate_row":"Duplicate Row","delete_row":"Delete Row","expand_row":"Expand Row","collapse_row":"Collapse Row","duplicate_entity":"Duplicate Entity","delete_entity":"Delete Entity","expand_entity":"Expand Entity","collapse_entity":"Collapse Entity","row_prefix":"Info Row","entity_prefix":"Entity","template_mode":"Template Mode","template_mode_description":"Use a template to format the entity value. Templates allow you to use Home Assistant templating syntax for complex formatting.","template_examples_header":"Common Examples:","dynamic_icon":{"title":"Dynamic Icon Template","description":"Use a template to dynamically select the icon based on entity states or conditions.","enable":"Enable Dynamic Icon Template"},"dynamic_color":{"title":"Dynamic Color Template","description":"Use a template to dynamically set colors based on entity states or values.","enable":"Enable Dynamic Color Template"},"row_settings":{"header":"Row Settings","row_name":"Row Name","row_name_description":"Custom name for this info row (leave blank to use default naming)","horizontal_alignment":"Horizontal Alignment","alignment_description":"Horizontal alignment of entities in this row","vertical_alignment":"Vertical Alignment","vertical_alignment_description":"Controls how entities are aligned vertically within the row.","spacing":"Spacing","spacing_description":"Spacing between entities in this row","allow_wrap":"Allow items to wrap","allow_wrap_description":"When enabled, items will flow to the next line if they don\'t fit in one row. When disabled, all items will stay in a single row."},"entity_settings":{"header":"Info Items","name":"Custom Name","entity_description":"Select an entity to display information from","name_description":"Override the entity name (leave blank to use entity\'s friendly name)","show_icon":"Show Icon","icon_color":"Icon Color","name_color":"Name Color","entity_color":"Entity Color","icon_size":"Icon Size","name_size":"Name Size","value_size":"Value Size","size_settings":"Size Settings","show_name":"Show Name","show_name_description":"Display the entity name before the value","click_action":"Click Action","navigation_path":"Navigation Path","navigation_path_description":"Path to navigate to when clicked (e.g., /lovelace/0)","url":"URL","url_description":"URL to open when clicked","service":"Service","service_description":"Service to call (e.g., light.turn_on)","service_data":"Service Data (JSON)"},"alignments":{"flex-start":"Start","center":"Center","flex-end":"End","space-between":"Space Between","space-around":"Space Around","space-evenly":"Space Evenly"},"spacing":{"none":"None","small":"Small","medium":"Medium","large":"Large"},"click_actions":{"more-info":"More Info","navigate":"Navigate","url":"Open URL","call-service":"Call Service","none":"None"},"row_vertical_alignments":{"top":"Top","center":"Center","bottom":"Bottom"}},"settings_subtabs":{"general":"General","action_images":"Action Images"},"action_images":{"title":"Action Images","description":"Configure images that will be displayed when specific entity states are met.","add_image":"Add Action Image","no_images":"No action images configured yet. Add one to get started.","actions":{"drag":"Drag to reorder","duplicate":"Duplicate action image","delete":"Delete action image","expand":"Expand action image settings","collapse":"Collapse action image settings"},"delete_confirm":"Are you sure you want to delete this action image?","entity_settings":"Entity Settings","image_settings":"Image Settings","entity_placeholder":"Select entity","state_placeholder":"Enter state value","preview":{"no_entity":"No entity selected","no_image":"No image selected","any_state":"Any state"},"trigger_entity":"Trigger Entity","trigger_state":"Trigger State","entity_help":"Select an entity to monitor. The image will be shown when this entity matches the state below.","state_help":"Enter the state value that will trigger this image to show. Leave blank to match any state.","image_type":{"title":"Image Type","upload":"Upload Image","url":"Image URL","entity":"Entity Image","none":"None"},"template_mode":"Template Mode","template_description":"Use a template to determine when this image should be shown. Templates allow you to use Home Assistant templating syntax (like {{ states.sensor.temperature.state > 70 }}) for complex conditions.","template_label":"Display Template","template_help":"Enter a template that returns true/false. This image will be shown when the template evaluates to true. Use Jinja2 syntax: {{ states(...) }}","priority":{"label":"Display Priority","description":"Priority Based uses the first match from top to bottom. Newest Matching uses the last match found in the list.","options":{"priority":"Priority Based","newest":"Newest Matching"}}},"images":{"title":"Images","description":"Configure images that will be displayed based on conditions or templates.","add_image":"Add Image","no_images":"No images configured yet. Add one to get started.","arrange_images":"Arrange Images","name":"Name (Optional)","image_type":"Image Type","url":"Image URL","image_entity":"Image Entity","priority":"Priority (0 = highest)","priority_mode":"Priority Mode","timed_duration":"Display Duration (seconds)","timed_duration_help":"How long this image should be displayed before returning to the main image.","duplicate":"Duplicate Image","delete":"Delete Image","delete_confirm":"Are you sure you want to delete this image?","image_types":{"none":"None","default":"Default Vehicle","url":"Image URL","upload":"Upload Image","entity":"Entity Image","map":"Map"},"priority_modes":{"order":"Order Priority","order_help":"Images are displayed based on their order in the list (drag to reorder).","last_triggered":"Last Triggered","last_triggered_help":"The most recently triggered image will stay displayed until another image is triggered.","timed":"Timed Images","timed_help":"Images below the first will show for a set duration then return to the main image."},"conditional_types":{"show":"Show When","hide":"Hide When"},"tabs":{"general":"General","conditional":"Conditional","appearance":"Appearance"},"conditional_help":"Configure when this image should be shown based on entity states or templates.","conditional_help_simple":"Configure when this image should be shown based on entity states.","conditional_state_help":"Image will be shown when the entity equals this state value.","conditional_entity":"Conditional Entity","conditional_state":"Conditional State","basic_conditions":"Basic Conditions","advanced_conditional":"Advanced Template Conditions","advanced_help":"Use templates for complex conditions like multiple entities or mathematical comparisons.","template_mode_active_help":"Use templates for complex conditions like multiple entities or mathematical comparisons.","template_mode":{"header":"Template Mode","enable":"Enable Template Mode","template":"Template"},"template_examples_header":"Common Examples:","width":"Width (%)","width_settings":"Width Settings","crop_settings":"Crop Settings","crop_help":"Positive values crop inward, negative values add padding outward.","crop_top":"Top","crop_right":"Right","crop_bottom":"Bottom","crop_left":"Left","fallback_image":"Fallback Image","fallback_help":"This image will be used as a fallback if no triggers match or timeout happens. Only one image can be a fallback.","map_entity":"Location Entity","map_entity_help":"Select an entity with latitude/longitude coordinates or address to display on the map.","target_entity":"Target Entity","target_entity_description":"Select the entity to target with this action","common":{"width":"Image Width","width_description":"Width as a percentage of the card","width_over_100":"Values over 100% can help crop empty space around images","url_description":"Enter the URL of the image"},"vehicle":{"crop":"Crop Image"},"migration":{"title":"Legacy Images Detected","description":"We found legacy image configurations that can be migrated to the new format.","migrate_button":"Migrate Now","success":"Images migrated successfully!"}},"card_settings":{"title":"Card Title","title_alignment":"Title Alignment","title_size":"Title Size","title_color":"Title Color","title_color_description":"Color of the card title","title_description":"Title displayed at the top of the card (optional)","title_alignment_description":"How the card title is aligned","title_size_description":"Size of the card title in pixels","colors":"Colors","card_background":"Card Background","card_background_description":"Background color of the entire card","format_entities":"Format Entity Values","format_entities_description":"Enable additional formatting of entity values (adds commas, converts units, etc.)","show_units":"Show Units","show_units_description":"Show units alongside values","help_highlight":"Help Highlight","help_highlight_description":"Show visual highlights when switching between editor tabs to help identify which section you are editing","general":"General","conditional_logic":"Conditional Logic","card_visibility":"Card Visibility","card_visibility_description":"Show or hide the entire card based on an entity condition"},"vehicle_info":{"title":"Vehicle Information","location":{"title":"Location Entity","description":"Select the entity that shows the current location of the vehicle.","show":"Show Location","show_description":"Show the vehicle location"},"mileage":{"title":"Mileage Entity","description":"Select the entity that represents the total mileage or odometer of the vehicle.","show":"Show Mileage","show_description":"Show the vehicle mileage"},"car_state":{"title":"Vehicle State Entity","description":"Select the entity that represents the current state of the vehicle (e.g. parked, driving, charging).","show":"Show Vehicle State","show_description":"Show the vehicle state"}},"crop":{"title":"Image Crop","top":"Top","right":"Right","bottom":"Bottom","left":"Left","pixels":"px","help":"Enter values in pixels (positive or negative) to adjust cropping and padding"},"alignment":{"left":"Left","center":"Center","right":"Right"},"common":{"choose_file":"Choose File","no_file_chosen":"No file chosen","entity":"Entity","width":"Width","width_description":"Width as a percentage of the card","width_over_100":"Values over 100% can help crop empty space around images","none":"None","default":"Default","upload":"Upload","url":"URL","url_description":"URL pointing to the image","reset":"Reset","condition_prompt":"Select \\"Show\\" or \\"Hide\\" to configure entity condition","bold":"Bold","italic":"Italic","uppercase":"Uppercase","strikethrough":"Strikethrough"},"conditions":{"condition_type":"Condition Type","show_card_if":"Show Card If","hide_card_if":"Hide Card If","entity_description":"Select the entity to check for the condition","state":"State","state_description":"The state value that triggers the condition"},"bars":{"title":"Progress Bars","description":"Add customizable progress bars to display various metrics like battery level, range, charging status, and more. Each bar can be individually configured with colors, animations, and labels.","add":"Add Bar","duplicate":"Duplicate Bar","delete":"Delete Bar","expand":"Expand Bar","collapse":"Collapse Bar","no_entity":"No entity selected","bar_prefix":"Bar","template":{"description":"Use a template to format the displayed text, convert units, or display calculated values.","enable":"Enable Template Mode","template_label":"Template","helper_text":"Use Home Assistant templating syntax. Examples:\\n• {{ states(\'sensor.temperature\') | float * 1.8 + 32 }} °F\\n• {{ now().strftime(\\"%b %d, %H:%M\\") }}","examples_header":"Common Examples:","examples":{"temperature":"{{ states(\'sensor.temperature\') | float * 1.8 + 32 }}°F - Convert Celsius to Fahrenheit","datetime":"{{ now().strftime(\\"%b %d, %H:%M\\") }} - Format current date/time","power":"{{ \'Charging at \' + states(\'sensor.ev_power\') + \' kW\' }} - Combine text and sensor value"}},"bar_radius":{"round":"Round","square":"Square","rounded-square":"Rounded Square"},"tabs":{"arrange_bars":"Arrange Bars","config":"Config","colors":"Colors","animation":"Animation"},"settings":{"header":"Bar Settings","entity":"Bar Percentage Entity","entity_description":"Select an entity that returns a percentage value (0-100). This controls the bar\'s fill level.","limit_entity":"Limit Value Entity (optional)","limit_entity_description":"Optional: Add a vertical indicator line on the bar (e.g. charge limit for EV battery).","limit_color":"Limit Indicator Color","limit_color_description":"Color of the vertical line showing the limit position on the bar. Changes will force a card update.","bar_size":"Bar Size","bar_size_description":"Defines the thickness/height of the progress bar.","bar_radius":"Bar Radius","bar_radius_description":"Shape of the progress bar corners","width":"Bar Width","width_description":"Defines the width of the bar as a percentage of the card width.","alignment":"Label Alignment","alignment_description":"How the left and right labels align with each other.","show_percentage":"Show Percentage","show_percentage_description":"Show the percentage value inside the bar"},"percentage":{"header":"Percentage Text","display_header":"Percentage Text Display","display_description":"Control the visibility and appearance of percentage values shown directly on the bar. These numbers provide a clear visual indicator of the current level.","text_size":"Text Size","calculation_header":"Percentage Calculation","calculation_description":"Configure how the bar\'s percentage fill level is calculated using one of the options below.","type_header":"Percentage Calculation","type_label":"Percentage Type","type_description":"How to calculate the percentage value shown in the bar","type_entity":"Entity (0-100)","type_attribute":"Entity Attribute","type_template":"Template Mode","type_difference":"Difference (Amount/Total)","amount_entity":"Amount Entity","amount_description":"Entity representing the current amount/value (numerator)","total_entity":"Total Entity","total_description":"Entity representing the total amount/maximum (denominator)"},"left_side":{"header":"Left Side","section_description":"Configure the title and entity value displayed on the left side of the bar. This is useful for showing labels like \'Range\' or \'Battery\' along with their values.","toggle_description":"Show or hide the left side of the bar label","title":"Left Title","title_description":"Optional label displayed on the left side below the bar.","entity":"Left Entity","entity_description":"Entity whose value is displayed on the left side of the bar.","alignment_description":"Controls how this label is aligned under the bar.","title_size":"Title Size","value_size":"Value Size","hidden_message":"Left side is hidden"},"right_side":{"header":"Right Side","section_description":"Configure the title and entity value displayed on the right side of the bar. This is ideal for complementary information like \'Time to Full\' or secondary measurements.","toggle_description":"Show or hide the right side of the bar label","title":"Right Title","title_description":"Optional label displayed on the right side below the bar.","entity":"Right Entity","entity_description":"Entity whose value is displayed on the right side of the bar.","alignment_description":"Controls how this label is aligned under the bar.","title_size":"Title Size","value_size":"Value Size","hidden_message":"Right side is hidden"},"colors":{"header":"Colors","bar_color":"Bar Color","background_color":"Background Color","border_color":"Border Color","limit_indicator_color":"Limit Indicator Color","left_title_color":"Left Title Color","left_value_color":"Left Value Color","right_title_color":"Right Title Color","right_value_color":"Right Value Color","percentage_text_color":"Percentage Text Color","reset_color":"Reset to default color"},"gradient":{"header":"Gradient Mode","description":"Create beautiful color transitions across your progress bars. Ideal for showing battery levels, fuel gauges, or any status indicator requiring visual emphasis.","toggle":"Use Gradient","toggle_description":"Use a gradient for the progress bar instead of a solid color","display_mode":"Gradient Display Mode","display_mode_full":"Full","display_mode_value_based":"Value-Based","display_mode_cropped":"Cropped","display_mode_description":"Full: Show the entire gradient. Value-based: Show the gradient up to the current value.","editor_header":"Gradient Editor","add_stop":"Add Stop"},"animation":{"header":"Action Animation","description":"Add animations to the bar when a specific entity reaches a specific state. Perfect for showing charging states, alarm states, and more.","pro_tip":"Pro Tip: For \'always on\' animations, select an animation type but leave the entity and state fields empty. Try the \'Bubbles\' and \'Fill\' animations!","entity":"Animation Entity","entity_description":"Entity that triggers the animation when it matches the specified state","state":"Entity State","state_description":"When the entity state matches this value, the animation will be triggered","type":"Animation Type","type_description":"The animation effect to display when the entity state matches","select_entity_prompt":"Select an Entity and enter the state you want to trigger the animation (examples: \\"charging\\", \\"on\\", \\"idle\\")","action_entity":"Action Entity","action_state":"Action State","action_description":"This animation will override the regular animation when the specified entity is in a specific state.","action_entity_prompt":"Select an Action Entity and state to define when this animation should override the regular animation"},"bar_sizes":{"thin":"Thin","regular":"Regular","thick":"Thick","thiccc":"Extra Thick"},"bar_widths":{"25":"25% Width","50":"50% Width","75":"75% Width","100":"100% (Full Width)"},"bar_alignments":{"space-between":"Space Between","flex-start":"Left","center":"Center","flex-end":"Right"},"bar_styles":{"flat":"Flat (Default)","glossy":"Glossy","embossed":"Embossed","inset":"Inset","gradient":"Gradient Overlay","neon":"Neon Glow","outline":"Outline","glass":"Glass","metallic":"Metallic","neumorphic":"Neumorphic"},"animation_types":{"none":"None","charging-lines":"Charging (Diagonal Lines)","pulse":"Pulse","blinking":"Blinking","bouncing":"Bouncing","glow":"Glow","rainbow":"Rainbow","bubbles":"Bubbles","fill":"Fill"},"custom_bar_settings":{"title":"Custom Bar Settings","description":"Define custom configurations for individual bars.","name":"Bar Name","entity":"Entity","unit":"Unit","min":"Min Value","max":"Max Value","thresholds":"Thresholds","severity":"Severity Map"},"template_mode":{"header":"Template Mode","description":"Use a template to format the displayed text, convert units, or show calculated values.","enable":"Enable Template Mode","template":"Template"}},"icons":{"title":"Card Icons","description":"Add icon rows to display multiple icons in your card. Each row can be configured with different settings. Note: Icon rows and sections order can be rearranged in the Customize tab.","add_row":"Add Icon Row","duplicate_row":"Duplicate Row","delete_row":"Delete Row","expand_row":"Expand Row","collapse_row":"Collapse Row","no_row":"No icon rows have been added","row_prefix":"Row","icon_prefix":"Icon","add_icon":"Add Icon","duplicate_icon":"Duplicate Icon","delete_icon":"Delete Icon","template_mode":"Template Mode","template_mode_active_description":"Use a template to determine when this icon should be active. Templates allow you to use Home Assistant templating syntax for complex conditions.","template_mode_inactive_description":"Use a template to determine when this icon should be inactive. Templates allow you to use Home Assistant templating syntax for complex conditions.","template_examples_header":"Common Examples:","text_formatting":"State Text Formatting","name_formatting":"Name Formatting","dynamic_icon":{"title":"Dynamic Icon Template","description":"Use a template to dynamically select the icon based on entity states or conditions.","enable":"Enable Dynamic Icon Template"},"dynamic_color":{"title":"Dynamic Color Template","description":"Use a template to dynamically set the icon color based on entity states or values.","enable":"Enable Dynamic Color Template"},"enable_template_mode":"Enable Template Mode","row_settings":{"header":"Row Settings","width":"Row Width","width_description":"Width of the row as a percentage of card width","alignment":"Row Alignment","alignment_description":"How icons are aligned in this row","spacing":"Icon Spacing","spacing_description":"Amount of space between icons in this row","columns":"Column Count","columns_description":"Number of evenly-sized columns in the row (0 = auto distribution based on content)","confirmation_mode":"Confirmation Mode","confirmation_mode_description":"Require two taps/clicks to activate icons in this row, preventing accidental interactions","layout_info_title":"How Layout Settings Work"},"icon_settings":{"header":"Icon List","entity":"Entity","entity_description":"Entity displayed with this icon","icon":"Icon","icon_description":"Select an icon or enter a custom icon","name":"Name","name_description":"Custom name displayed below the icon (uses entity name by default if not specified)","interaction_type":"Interaction Type","interaction_type_description":"Choose how users interact with this icon to trigger actions","show_name":"Show Name","show_name_description":"Show the name text below the icon","show_state":"Show State","show_state_description":"Show the entity state below the icon","show_units":"Show Units","show_units_description":"Include units when showing state","text_position":"Text Position","text_position_description":"Where the name and state text is positioned relative to the icon","click_action":"Click Action","service":"Service","service_description":"Service to call (e.g. light.turn_on)","service_data":"Service Data (JSON)","service_data_description":"JSON data sent with the service call","action":"Action (JSON/Service)","action_description":"Advanced action configuration (see documentation)","navigation_path":"Navigation Path","navigation_path_description":"Select from available navigation targets including dashboards, views, and system pages","navigation_target_selector":"Navigation Target","navigation_target_description":"Select from available dashboards, views, or system pages","url":"URL","url_description":"URL to open in a new tab","automation_entity":"Automation Entity","automation_entity_description":"Automation to trigger when clicked"},"icon_appearance":{"header":"Icon Appearance","icon":"Icon Appearance","general":"General Appearance","active":"Active State","inactive":"Inactive State","state_conditions":"State Conditions","advanced":"Advanced Settings","icon_size":"Icon Size","icon_size_description":"Size of the icon in pixels","text_size":"Entity Size","text_size_description":"Size of the entity value text in pixels","name_size":"Name Size","name_size_description":"Size of the entity name text in pixels","text_alignment":"Text Alignment","text_alignment_description":"How the text is aligned below the icon","icon_background":"Icon Background","icon_background_description":"Add a background shape behind the icon","icon_background_color":"Icon Background Color","icon_background_color_description":"Color of the background behind the icon","container_background_color":"Container Background Color","container_background_color_description":"Color of the background behind the entire icon container","text_appearance":"Text Appearance","container":{"header":"Container Appearance","vertical_alignment":"Vertical Alignment","vertical_alignment_description":"Align the icon and text vertically within the container.","width":"Container Width","width_description":"Set the width of the icon container relative to the row.","background":"Container Background Shape","background_description":"Choose a background shape for the entire icon container."},"show_when_active":"Show Icon When Active","show_when_active_description":"Only show this icon when it\'s in an active state","template_mode":"Template Mode","template_description":"Use a template to determine active/inactive state. Templates allow you to use Home Assistant templating syntax (like {{ states.sensor.temperature.state > 70 }}) for complex conditions.","active_template":"Active Template","active_template_description":"Template that returns true when the icon should be active.","active_state":"Active state","active_state_description":"State string that represents \\"active\\".","active_state_text":"Custom Active State Text","active_state_text_description":"Overrides the text displayed when the icon is active. Leave empty to use the actual state.","inactive_template":"Inactive Template","inactive_template_description":"Template that returns true when the icon should be inactive.","inactive_state":"Inactive state","inactive_state_description":"State string that represents \\"inactive\\".","inactive_state_text":"Custom Inactive State Text","inactive_state_text_description":"Overrides the text displayed when the icon is inactive. Leave empty to use the actual state.","active_icon":"Active icon","inactive_icon":"Inactive icon","active_icon_color":"Active Icon Color","inactive_icon_color":"Inactive Icon Color","active_name_color":"Active Name Color","inactive_name_color":"Inactive Name Color","active_state_color":"Active State Color","inactive_state_color":"Inactive State Color","show_icon_active":"Show icon when active","show_icon_active_description":"Display the icon when the state is active.","show_icon_inactive":"Show Icon When Inactive","show_icon_inactive_description":"Display the icon when the state is inactive.","custom_active_state_text":"Custom Active State Text","custom_inactive_state_text":"Custom Inactive State Text","action_description":"Action to perform when the icon is clicked.","show_name_active":"Show Name When Active","show_name_active_description":"Display the name when the state is active.","show_name_inactive":"Show Name When Inactive","show_name_inactive_description":"Display the name when the state is inactive.","show_state_active":"Show State When Active","show_state_active_description":"Display the state when the state is active.","show_state_inactive":"Show State When Inactive","show_state_inactive_description":"Display the state when the state is inactive.","use_entity_color_for_icon":"Use Entity Color for Icon","use_entity_color_for_icon_description":"Use this entity\'s color attribute (if available) instead of the configured color","use_entity_color_for_icon_background":"Use Entity Color for Icon Background","use_entity_color_for_icon_background_description":"Use the entity\'s color attribute for the icon background when available","use_entity_color_for_container_background":"Use Entity Color for Container","use_entity_color_for_container_background_description":"Use the entity\'s color attribute for the container background when available","dynamic_icon_template":"Dynamic Icon Template","dynamic_icon_template_description":"Use a template to dynamically select the icon based on entity states or conditions.","enable_dynamic_icon_template":"Enable Dynamic Icon Template","dynamic_color_template":"Dynamic Color Template","dynamic_color_template_description":"Use a template to dynamically set the icon color based on entity states or values.","enable_dynamic_color_template":"Enable Dynamic Color Template","size_settings":"Size Settings","value_size":"Value Size","state_text_formatting":"State Text Formatting","row_name":"Row Name","row_name_description":"Custom name for this icon row (leave blank to use default naming)","width_description":"Controls how much of the available width this row will use. Configure how this row of icons displays. Width controls the overall row width, spacing adjusts gaps between icons, and column count determines how many icons appear in each row (0 = automatic).","layout_info_title":"How Layout Settings Work","layout_info_width":"Row Width: Controls how much horizontal space the row takes up in the card (percentage of card width)","layout_info_alignment":"Row Alignment: Only applies when Column Count is 0. Determines how icons are positioned within the row","layout_info_spacing":"Icon Spacing: Sets the amount of space between icons","layout_info_columns":"Column Count: When set to 0, icons flow naturally based on available space. When set to a number, forces that exact number of columns in a grid layout","layout_info_tip":"Use Column Count with consistent amounts of icons per row for the most uniform layout","control_right_side_description":"Control when the right side is shown or hidden based on entity state","dynamic_icon":{"title":"Dynamic Icon Template","description":"Use a template to dynamically select the icon based on entity states or conditions.","enable":"Enable Dynamic Icon Template","template_label":"Icon Template"},"dynamic_color":{"title":"Dynamic Color Template","description":"Use a template to dynamically set the icon color based on entity states or values.","enable":"Enable Dynamic Color Template","template_label":"Color Template"}},"tabs":{"general":"General","actions":"Actions","appearance":"Appearance","states":"States","active_state":"Active State","inactive_state":"Inactive State","icons":{"arrange_icon_rows":"Arrange Icon Rows"}},"alignments":{"flex-start":"Left","center":"Center","flex-end":"Right","space-between":"Space Between","space-around":"Space Around","space-evenly":"Space Evenly"},"vertical_alignments":{"flex-start":"Top","center":"Middle","flex-end":"Bottom"},"spacing":{"none":"None","small":"Small","medium":"Medium","large":"Large"},"text_positions":{"below":"Below Icon","beside":"Beside Icon","none":"No Text","top":"On Top","left":"On Left","right":"On Right"},"reset":{"size":"Reset to default size","color":"Reset to default color","all":"Reset to default values"},"click_actions":{"toggle":"Toggle","more-info":"Show More Info","navigate":"Navigate to Path","url":"Open URL","call-service":"Call Service","perform-action":"Perform Action","location-map":"Show Map","assist":"Voice Assistant","trigger":"Trigger","none":"No Action","descriptions":{"toggle":"Toggle the entity\'s state on and off.","more-info":"Opens the more info dialog with additional information about the entity.","navigate":"Navigate to the specified Lovelace path.","url":"Opens the specified URL in a new tab.","call-service":"Call the specified Home Assistant service.","perform-action":"Perform a custom action (see documentation).","location-map":"Show the entity\'s location on a map.","assist":"Open Home Assistant\'s voice assistant.","trigger":"Trigger the entity (automation, script, button, etc).","none":"No action will be performed."}},"backgrounds":{"none":"None","circle":"Circle","square":"Square","rounded_square":"Rounded Square"},"container_widths":{"25":"25% Width","50":"50% Width","75":"75% Width","100":"100% (Full Width)"},"row_widths":{"25":"25% Width","50":"50% Width","75":"75% Width","100":"100% (Full Width)"},"interactions":{"single":"Single Tap/Click","double":"Double Tap/Click","hold":"Hold/Long Press"},"animations":{"title":"Icon Animation","active_description":"Select an animation to apply when this icon is in the active state.","inactive_description":"Select an animation to apply when this icon is in the inactive state.","select_animation":"Select Animation","none":"None","pulse":"Pulse","vibrate":"Vibrate","rotate_left":"Rotate Left","rotate_right":"Rotate Right","hover":"Hover","fade":"Fade","scale":"Scale","bounce":"Bounce","shake":"Shake","tada":"Tada"},"row_vertical_alignments":{"top":"Top","center":"Center","bottom":"Bottom"},"actions":{"single":"Single Click Action","double":"Double Click Action","hold":"Hold Action","single_description":"Action performed on a single tap/click - most common interaction","double_description":"Action performed on a double tap/click - helps prevent accidental triggers","hold_description":"Action performed when holding down for 500ms - ideal for critical actions","section_header":"Interaction Actions"}},"customize":{"title":"Customize Layout","description":"Customize layout, order, and add sections to your card","condition_prompt":"Select \\"Show\\" or \\"Hide\\" to configure entity condition","template_mode_active":"Use Template Mode","layout":{"title":"Layout Style","description":"Choose between a single or double column layout for the card","header":"Layout Settings","descriptions_header":"Layout Descriptions","single_column":"Single Column","single_column_description":"All sections are stacked vertically in a single column - best for simple displays and mobile views.","double_column":"Double Column","double_column_description":"Sections are split between two columns for efficient use of horizontal space - ideal for wider screens.","top_view":"Top View","top_view_description":"Image is prominently displayed at the top with other sections arranged in configurable positions around it.","half_full":"Half + Full","half_full_description":"Top row has two half-width sections, bottom row has one full-width section - great for balanced layouts.","full_half":"Full + Half","full_half_description":"Top row has one full-width section, bottom row has two half-width sections - perfect for highlighting top content."},"layout_types":{"single":"Single Column","double":"Double Column","dashboard":"Top View","half_full":"Half + Full","full_half":"Full + Half"},"column_width":{"title":"Column Width","description":"Configure the width ratio between left and right columns","50_50":"Equal (50/50)","30_70":"Narrow left, wide right (30/70)","70_30":"Wide left, narrow right (70/30)","40_60":"Slightly narrow left (40/60)","60_40":"Slightly wide left (60/40)"},"top_view":{"header":"Top View Layout Settings","description":"Configure the spacing and layout settings for top view","side_margin":"Side Margin","side_margin_help":"Margin on the sides of the view in pixels","middle_spacing":"Middle Spacing","middle_spacing_help":"Space between middle columns in pixels","vertical_spacing":"Vertical Spacing","vertical_spacing_help":"Space between rows in pixels"},"sections":{"header":"Card Sections","arrangement_header":"Section Arrangement","arrangement_desc_base":"Drag and drop sections to arrange their order on the card.","arrangement_desc_single_extra":"All sections will be displayed in a single column.","arrangement_desc_double_extra":"In a double column layout, you can place any section in the left or right column.","arrangement_desc_dashboard_extra":"In a Top View layout, you can place sections around your vehicle image."},"section_labels":{"title":"Title","image":"Vehicle Image","info":"Vehicle Information","bars":"All Sensor Bars","icons":"All Icon Rows","section_break":"Section Break"},"actions":{"collapse_margins":"Collapse Margins","expand_margins":"Expand Margins","collapse_options":"Collapse Options","expand_options":"Expand Options","add_break":"Add Section Break","delete_break":"Delete Section Break"},"css":{"header":"Global CSS","description":"Enter custom CSS rules here to override default card styling. These rules will be applied directly to the card. Use with caution.","label":"Custom CSS","input_description":"Enter your custom CSS rules here."},"conditions":{"header":"Conditional Logic","description":"Show or hide this section based on an entity\'s state.","template_mode_description":"Use a template to determine section visibility. Templates allow you to use Home Assistant templating syntax for complex conditions.","type_label":"Condition Type","section_title":"Section Title","enable_section_title":"Enable Section Title","title_text":"Title Text","title_size":"Title Size","title_color":"Title Color","enable_template_mode":"Enable Template Mode","use_template_description":"Use a template to determine when this section should be visible. Templates allow you to use Home Assistant templating syntax for complex conditions.","info_row":"Info Row","entity_label":"Condition Entity","state_label":"Condition State","state_description":"The state value that triggers the condition","types":{"none":"None (Always Show)","show":"Show When...","hide":"Hide When..."}},"template":{"description":"Use a template to determine when this section should be visible. Templates allow you to use Home Assistant templating syntax for complex conditions.","enable":"Enable Template Mode"},"template_mode":{"header":"Template Mode","description":"Use a template to control when this image is shown or hidden based on complex logic, calculations, or multiple entity states.","enable":"Enable Template Mode","disabled_notice":"(Disabled - Template Mode Active)","disabled_help":"Basic condition controls are disabled when Template Mode is active. Template Mode takes precedence over basic conditions.","examples":{"show_when_charging":"Show when charging","show_when_battery_low":"Show when battery low","multiple_conditions":"Multiple conditions","show_during_day":"Show during day hours","show_when_door_unlocked":"Show when door unlocked"}},"section_title":{"header":"Section Title","enable":"Enable Section Title","text":"Title Text","size":"Title Size","color":"Title Color","bold":"Bold","italic":"Italic","uppercase":"Uppercase","strikethrough":"Strikethrough"},"margins":{"header":"Margins","top":"Top Margin","bottom":"Bottom Margin"},"columns":{"left":"Left Column","right":"Right Column","empty":"Drop sections here"},"dashboard":{"top":"Top Section","top_middle":"Top Middle Section","left_middle":"Left Middle Section","middle":"Middle Section","middle_empty":"Vehicle Image Area (Recommended)","right_middle":"Right Middle Section","bottom_middle":"Bottom Middle Section","bottom":"Bottom Section"},"half_full":{"row1_col1":"Row 1, Left (50%)","row1_col2":"Row 1, Right (50%)","row2_full":"Row 2, Full Width (100%)"},"full_half":{"row1_full":"Row 1, Full Width (100%)","row2_col1":"Row 2, Left (50%)","row2_col2":"Row 2, Right (50%)"},"break_styles":{"blank":"Blank (No Line)","line":"Solid Line","double_line":"Double Line","dotted":"Dotted Line","double_dotted":"Double Dotted Line","shadow":"Shadow Gradient"},"break_style":{"header":"Break Style","style_label":"Style","thickness_label":"Thickness","width_percent_label":"Width (%)","color_label":"Color"}},"container_widths":{"25":"25% Width","50":"50% Width","75":"75% Width","100":"100% (Full Width)"},"row_widths":{"25":"25% Width","50":"50% Width","75":"75% Width","100":"100% (Full Width)"}},"about":{"logo_alt":"Ultra Vehicle Card","developed_by":"Developed by","discord_button":"Join Our Discord","docs_button":"Visit Our Documentation","donate_button":"LEAVE A TIP (PAYPAL)","github_button":"Check Out Our Github","support_title":"Support Ultra Vehicle Card","support_description":"Your generous tips fuel the development of amazing features for this card! Without support from users like you, continued innovation wouldn\'t be possible."},"custom_icons":{"title":"Custom Icons","description":"Define custom icons for different states.","icon_entity":"Icon Entity","default_icon":"Default Icon","state_icons":"State Icons","state":"State","icon":"Icon"},"custom_active_state_text":"Custom Active State Text","custom_inactive_state_text":"Custom Inactive State Text","image_settings":{"title":"Image Settings","description":"Configure the main image appearance.","type":"Image Type","width":"Image Width","crop":"Image Crop","entity":"Image Entity","entity_description":"Entity that provides the image URL"},"entity_settings":{"entity":"Entity","entity_description":"Select an entity to display information from","name":"Custom Name","name_description":"Override the entity name (leave blank to use entity\'s friendly name)","show_icon":"Show Icon","icon":"Icon","icon_color":"Icon Color","name_color":"Name Color","entity_color":"Entity Color","text_color":"Text Color","show_name":"Show Name","show_name_description":"Display the entity name before the value","template_mode":"Template Mode","template_mode_description":"Use a template to format the entity value","value_template":"Value Template","template_header":"Value Template","template_examples_header":"Common Examples:","template_basic":"Basic value","template_units":"With units","template_round":"Round to 1 decimal","dynamic_icon_template":"Icon Template","dynamic_color_template":"Color Template","dynamic_icon_template_mode":"Enable Dynamic Icon Template","dynamic_color_template_mode":"Enable Dynamic Color Template"}}');var mt=a.t(gt,2);const _t=JSON.parse('{"editor":{"tabs":{"settings":"Einstellungen","bars":"Balken","icons":"Symbole","customize":"Anpassen","about":"Über","info":"Info","images":"Bilder"},"info":{"title":"Karteninformationen","description":"Konfigurieren Sie Informationen und Entitäten, um Fahrzeugdetails wie Speicherort, Kilometerleistung usw. anzuzeigen. Informationen werden nach Möglichkeit auf einer einzigen Zeile angezeigt, wobei Sie mehrere Zeilen in schmalen Behältern einwickeln.","add_row":"Info-Zeile hinzufügen","add_entity":"Info-Entität hinzufügen","arrange_info_rows":"Anordnen von Inforeihen","duplicate_row":"Zeile duplizieren","delete_row":"Zeile löschen","expand_row":"Zeile erweitern","collapse_row":"Zeile zusammenklappen","duplicate_entity":"Entität duplizieren","delete_entity":"Entität löschen","expand_entity":"Entität erweitern","collapse_entity":"Entität zusammenklappen","row_prefix":"Info-Zeile","entity_prefix":"Entität","template_mode":"Vorlagenmodus","template_mode_description":"Verwenden Sie eine Vorlage, um den Entitätswert zu formatieren. Mit Vorlagen können Sie Home Assistant Templating -Syntax für komplexe Formatierung verwenden.","template_examples_header":"Häufige Beispiele:","dynamic_icon":{"title":"Dynamische Icon-Vorlage","description":"Verwenden Sie eine Vorlage, um das Icon dynamisch basierend auf Entitätsstatus oder Bedingungen auszuwählen.","enable":"Dynamische Icon-Vorlage aktivieren"},"dynamic_color":{"title":"Dynamische Farb-Vorlage","description":"Verwenden Sie eine Vorlage, um Farben dynamisch basierend auf Entitätsstatus oder Werten zu setzen.","enable":"Dynamische Farb-Vorlage aktivieren"},"row_settings":{"header":"Zeilen-Einstellungen","row_name":"Zeilen-Name","row_name_description":"Benutzerdefinierter Name für diese Info-Zeile (leer lassen für Standard-Benennung)","horizontal_alignment":"Horizontale Ausrichtung","alignment_description":"Horizontale Ausrichtung der Entitäten in dieser Zeile","vertical_alignment":"Vertikale Ausrichtung","vertical_alignment_description":"Steuert, wie Entitäten vertikal innerhalb der Zeile ausgerichtet werden.","spacing":"Abstand","spacing_description":"Abstand zwischen Entitäten in dieser Zeile","allow_wrap":"Elemente umbrechen lassen","allow_wrap_description":"Wenn aktiviert, fließen Elemente zur nächsten Zeile, wenn sie nicht in eine Zeile passen. Wenn deaktiviert, bleiben alle Elemente in einer Zeile."},"entity_settings":{"header":"Info-Elemente","name":"Benutzerdefinierter Name","entity_description":"Wählen Sie eine Entität aus, von der Informationen angezeigt werden sollen","name_description":"Entitäts-Name überschreiben (leer lassen für freundlichen Namen der Entität)","show_icon":"Icon anzeigen","icon_color":"Icon-Farbe","name_color":"Name-Farbe","entity_color":"Entitäts-Farbe","icon_size":"Icon-Größe","name_size":"Name-Größe","value_size":"Wert-Größe","size_settings":"Größen-Einstellungen","show_name":"Name anzeigen","show_name_description":"Entitäts-Name vor dem Wert anzeigen","click_action":"Klick-Aktion","navigation_path":"Navigations-Pfad","navigation_path_description":"Pfad zum Navigieren beim Klicken (z.B. /lovelace/0)","url":"URL","url_description":"URL zum Öffnen beim Klicken","service":"Service","service_description":"Service zum Aufrufen (z.B. light.turn_on)","service_data":"Service-Daten (JSON)"},"alignments":{"flex-start":"Anfang","center":"Mitte","flex-end":"Ende","space-between":"Abstand zwischen","space-around":"Abstand rundherum","space-evenly":"Gleichmäßiger Abstand"},"spacing":{"none":"Keine","small":"Klein","medium":"Mittel","large":"Groß"},"click_actions":{"more-info":"Mehr Infos","navigate":"Navigieren","url":"URL öffnen","call-service":"Service aufrufen","none":"Keine"},"row_vertical_alignments":{"top":"Oben","center":"Mitte","bottom":"Unten"}},"settings_subtabs":{"general":"Allgemein","action_images":"Aktionsbilder"},"action_images":{"title":"Aktionsbilder-Einstellungen","description":"Konfigurieren Sie Bilder, die angezeigt werden, wenn bestimmte Entitätszustände erfüllt sind.","add_image":"Aktionsbild hinzufügen","no_images":"Noch keine Aktionsbilder konfiguriert. Fügen Sie eines hinzu, um zu beginnen.","actions":{"drag":"Zum Neuordnen ziehen","duplicate":"Duplizieren","delete":"Löschen","expand":"Erweitern","collapse":"Einklappen"},"delete_confirm":"Sind Sie sicher, dass Sie dieses Aktionsbild löschen möchten?","entity_settings":"Entitätseinstellungen","image_settings":"Bildeinstellungen","entity_placeholder":"Entität auswählen","state_placeholder":"Zustandswert eingeben","preview":{"no_entity":"Keine Entität ausgewählt","no_image":"Kein Bild","any_state":"Beliebiger Zustand"},"trigger_entity":"Auslöser-Entität","trigger_state":"Auslöser-Zustand","entity_help":"Wählen Sie eine zu überwachende Entität. Das Bild wird angezeigt, wenn diese Entität dem unten stehenden Zustand entspricht.","state_help":"Geben Sie den Zustandswert ein, der die Anzeige dieses Bildes auslöst. Leer lassen, um jedem Zustand zu entsprechen.","image_type":{"title":"Bildtyp","upload":"Bild hochladen","url":"Bild-URL","entity":"Entitätsbild","none":"Keins"},"template_mode":"Vorlagen-Modus","template_description":"Verwenden Sie eine Vorlage, um zu bestimmen, wann dieses Bild angezeigt werden soll. Vorlagen ermöglichen die Verwendung der Home Assistant Templating-Syntax (wie {{ states.sensor.temperature.state > 70 }}) für komplexe Bedingungen.","template_label":"Vorlage anzeigen","template_help":"Geben Sie eine Vorlage ein, die wahr/falsch zurückgibt. Dieses Bild wird angezeigt, wenn die Vorlage zu wahr auswertet. Verwenden Sie Jinja2-Syntax: {{ states(...) }}","priority":{"label":"Anzeigepriorität","description":"Prioritätsbasiert verwendet die erste Übereinstimmung von oben nach unten. Neueste Übereinstimmung verwendet die letzte in der Liste gefundene Übereinstimmung.","options":{"priority":"Prioritätsbasiert","newest":"Neueste Übereinstimmung"}}},"images":{"title":"Bilder","description":"Konfigurieren Sie Bilder, die basierend auf Bedingungen oder Vorlagen angezeigt werden.","add_image":"Bild hinzufügen","no_images":"Noch keine Bilder konfiguriert. Fügen Sie eines hinzu, um zu beginnen.","arrange_images":"Bilder anordnen","name":"Name (Optional)","image_type":"Bildtyp","url":"Bild-URL","image_entity":"Bild-Entität","priority":"Priorität (0 = höchste)","priority_mode":"Prioritätsmodus","timed_duration":"Anzeigedauer (Sekunden)","timed_duration_help":"Wie lange dieses Bild angezeigt werden soll, bevor es zum Hauptbild zurückkehrt.","duplicate":"Bild duplizieren","delete":"Bild löschen","delete_confirm":"Sind Sie sicher, dass Sie dieses Bild löschen möchten?","image_types":{"none":"Keins","default":"Standard-Fahrzeug","url":"Bild-URL","upload":"Bild hochladen","entity":"Entitätsbild","map":"Karte"},"priority_modes":{"order":"Reihenfolgen-Priorität","order_help":"Bilder werden basierend auf ihrer Reihenfolge in der Liste angezeigt (ziehen zum Neu anordnen).","last_triggered":"Zuletzt ausgelöst","last_triggered_help":"Das zuletzt ausgelöste Bild bleibt angezeigt, bis ein anderes Bild ausgelöst wird.","timed":"Zeitgesteuerte Bilder","timed_help":"Bilder unterhalb des ersten werden für eine festgelegte Dauer angezeigt und kehren dann zum Hauptbild zurück."},"conditional_types":{"show":"Anzeigen wenn","hide":"Ausblenden wenn"},"tabs":{"general":"Allgemein","conditional":"Bedingt","appearance":"Erscheinungsbild"},"conditional_help":"Konfigurieren Sie, wann dieses Bild basierend auf Entitätszuständen oder Vorlagen angezeigt werden soll.","conditional_help_simple":"Konfigurieren Sie, wann dieses Bild basierend auf Entitätszuständen angezeigt werden soll.","conditional_state_help":"Das Bild wird angezeigt, wenn die Entität diesem Zustandswert entspricht.","conditional_entity":"Bedingte Entität","conditional_state":"Bedingter Zustand","basic_conditions":"Grundlegende Bedingungen","advanced_conditional":"Erweiterte Vorlagen-Bedingungen","advanced_help":"Verwenden Sie Vorlagen für komplexe Bedingungen wie mehrere Entitäten oder mathematische Vergleiche.","template_mode_active_help":"Verwenden Sie Vorlagen für komplexe Bedingungen wie mehrere Entitäten oder mathematische Vergleiche.","template_mode":{"header":"Vorlagen-Modus","enable":"Vorlagen-Modus aktivieren","template":"Vorlage"},"template_examples_header":"Häufige Beispiele:","width":"Breite (%)","width_settings":"Breiten-Einstellungen","crop_settings":"Zuschnitt-Einstellungen","crop_help":"Positive Werte schneiden nach innen zu, negative Werte fügen nach außen Polsterung hinzu.","crop_top":"Oben","crop_right":"Rechts","crop_bottom":"Unten","crop_left":"Links","fallback_image":"Fallback-Bild","fallback_help":"Dieses Bild wird als Fallback verwendet, wenn keine Auslöser übereinstimmen oder eine Zeitüberschreitung auftritt. Nur ein Bild kann ein Fallback sein.","map_entity":"Standort-Entität","map_entity_help":"Wählen Sie eine Entität mit Längen-/Breitengrad-Koordinaten oder Adresse zur Anzeige auf der Karte.","target_entity":"Ziel-Entität","target_entity_description":"Wählen Sie die Entität aus, die mit dieser Aktion angesprochen werden soll","common":{"width":"Bildbreite","width_description":"Breite als Prozentsatz der Karte","width_over_100":"Werte über 100% können dazu beitragen, den leeren Raum um Bilder zu ergreifen","url_description":"Geben Sie die URL des Bildes ein"},"vehicle":{"crop":"Bild zuschneiden"},"migration":{"title":"Legacy-Bilder erkannt","description":"Wir haben Legacy-Bildkonfigurationen gefunden, die in das neue Format migriert werden können.","migrate_button":"Jetzt migrieren","success":"Bilder erfolgreich migriert!"}},"card_settings":{"title":"Kartentitel","title_alignment":"Titelausrichtung","title_size":"Titelgröße","title_color":"Titelfarbe","title_color_description":"Farbe des Kartentitels","title_description":"Titel, der oben auf der Karte angezeigt wird (optional)","title_alignment_description":"Wie der Kartentitel ausgerichtet wird","title_size_description":"Größe des Kartentitels in Pixeln","colors":"Farben","card_background":"Kartenhintergrund","card_background_description":"Hintergrundfarbe der gesamten Karte","format_entities":"Entitätswerte formatieren","format_entities_description":"Aktiviert zusätzliche Formatierung von Entitätswerten (fügt Kommas hinzu, konvertiert Einheiten, etc.)","show_units":"Einheiten anzeigen","show_units_description":"Einheiten neben den Werten anzeigen","help_highlight":"Helfen Sie hervor","help_highlight_description":"Zeigen Sie visuelle Highlights beim Umschalten zwischen den Registerkarten Editors, um zu identifizieren, welcher Abschnitt Sie bearbeiten","general":"Allgemein","conditional_logic":"Bedingte Logik","card_visibility":"Kartensichtbarkeit","card_visibility_description":"Die gesamte Karte basierend auf einer Entitätsbedingung anzeigen oder ausblenden"},"vehicle_info":{"title":"Fahrzeuginformationen","location":{"title":"Standort-Entität","description":"Wählen Sie die Entität, die den aktuellen Standort des Fahrzeugs anzeigt.","show":"Standort anzeigen","show_description":"Fahrzeugstandort anzeigen"},"mileage":{"title":"Kilometerstand-Entität","description":"Wählen Sie die Entität, die den Gesamtkilometerstand oder Kilometerzähler des Fahrzeugs darstellt.","show":"Kilometerstand anzeigen","show_description":"Fahrzeugkilometerstand anzeigen"},"car_state":{"title":"Fahrzeugzustand-Entität","description":"Wählen Sie die Entität, die den aktuellen Zustand des Fahrzeugs darstellt (z.B. geparkt, fahren, laden).","show":"Fahrzeugzustand anzeigen","show_description":"Fahrzeugzustand anzeigen"}},"crop":{"title":"Bild zuschneiden","top":"Oben","right":"Rechts","bottom":"Unten","left":"Links","pixels":"px","help":"Geben Sie Werte in Pixeln (positiv oder negativ) ein, um das Zuschneiden und den Abstand anzupassen"},"alignment":{"left":"Links","center":"Mitte","right":"Rechts"},"common":{"choose_file":"Datei auswählen","no_file_chosen":"Keine Datei ausgewählt","entity":"Entität","width":"Breite","width_description":"Breite als Prozentsatz der Karte","width_over_100":"Werte über 100% können dazu beitragen, den leeren Raum um Bilder zu ergreifen","none":"Keine","default":"Standard","upload":"Hochladen","url":"URL","url_description":"URL, die auf das Bild verweist","reset":"Zurücksetzen","condition_prompt":"Wählen Sie \\"anzeigen\\" oder \\"ausblenden\\", um die Entitätsbedingung zu konfigurieren","bold":"Fett","italic":"Kursiv","uppercase":"Großbuchstaben","strikethrough":"Durchgestrichen"},"conditions":{"condition_type":"Bedingungstyp","show_card_if":"Karte anzeigen wenn","hide_card_if":"Karte ausblenden wenn","entity_description":"Wählen Sie die Entität zur Überprüfung der Bedingung","state":"Zustand","state_description":"Der Zustandswert, der die Bedingung auslöst"},"bars":{"title":"Prozentbalken","description":"Fügen Sie Prozentbalken hinzu, um Werte wie Kraftstoffstand, Batterieladung oder Reichweite anzuzeigen. Jeder Balken kann einen Prozentwert mit optionalen Beschriftungen links und rechts anzeigen.","add":"Neuen Balken hinzufügen","duplicate":"Balken duplizieren","delete":"Balken löschen","expand":"Balken erweitern","collapse":"Balken einklappen","no_entity":"Keine Entität ausgewählt","bar_prefix":"Balken","template":{"description":"Verwenden Sie eine Vorlage, um den angezeigten Text zu formatieren, Einheiten zu konvertieren oder berechnete Werte anzuzeigen.","enable":"Aktivieren Sie den Vorlagenmodus","template_label":"Vorlage","helper_text":"Verwenden Sie Home Assistant Templating-Syntax. Beispiele:\\n• {{ states(\'sensor.temperature\') | float * 1.8 + 32 }} °F\\n• {{ now().strftime(\\"%b %d, %H:%M\\") }}","examples_header":"Häufige Beispiele:","examples":{"temperature":"{{ states(\'sensor.temperature\') | float * 1.8 + 32 }}°F - Celsius in Fahrenheit umwandeln","datetime":"{{ now().strftime(\\"%b %d, %H:%M\\") }} - Aktuelles Datum/Zeit formatieren","power":"{{ \'Laden mit \' + states(\'sensor.ev_power\') + \' kW\' }} - Text und Sensorwert kombinieren"}},"bar_radius":{"round":"Rund","square":"Quadratisch","rounded-square":"Abgerundetes Quadrat"},"tabs":{"arrange_bars":"Balken anordnen","config":"Konfiguration","colors":"Farben","animation":"Animation"},"settings":{"header":"Balkeneinstellungen","entity":"Balken-Prozent-Entität","entity_description":"Wählen Sie eine Entität, die einen Prozentwert (0-100) zurückgibt. Dies steuert den Füllstand des Balkens.","limit_entity":"Grenzwert-Entität (optional)","limit_entity_description":"Optional: Fügen Sie eine vertikale Indikatorlinie auf dem Balken hinzu (z.B. Ladelimit für EV-Batterie).","limit_color":"Grenzindikator-Farbe","limit_color_description":"Farbe der vertikalen Linie, die die Grenzposition auf dem Balken anzeigt. Änderungen erzwingen ein Karten-Update.","bar_size":"Balkengröße","bar_size_description":"Definiert die Dicke/Höhe des Fortschrittsbalkens.","bar_radius":"Balkenradius","bar_radius_description":"Form der Ecken des Fortschrittsbalkens","width":"Balkenbreite","width_description":"Definiert die Breite des Balkens als Prozentsatz der Kartenbreite.","alignment":"Beschriftungsausrichtung","alignment_description":"Wie die linken und rechten Beschriftungen zueinander ausgerichtet sind.","show_percentage":"Prozentsatz anzeigen","show_percentage_description":"Zeigt den Prozentwert innerhalb des Balkens an"},"percentage":{"header":"Prozenttext","display_header":"Prozenttext-Anzeige","display_description":"Steuern Sie die Sichtbarkeit und das Erscheinungsbild von Prozentwerten, die direkt auf dem Balken angezeigt werden. Diese Zahlen bieten einen klaren visuellen Indikator für den aktuellen Stand.","text_size":"Textgröße","calculation_header":"Prozentberechnung","calculation_description":"Konfigurieren Sie, wie der Prozentfüllstand des Balkens mit einer der folgenden Optionen berechnet wird.","type_header":"Prozentberechnung","type_label":"Prozenttyp","type_description":"Wie der im Balken angezeigte Prozentwert berechnet wird","type_entity":"Entität (0-100)","type_attribute":"Entitäts-Attribut","type_template":"Vorlagen-Modus","type_difference":"Differenz (Menge/Gesamt)","amount_entity":"Mengen-Entität","amount_description":"Entität, die die aktuelle Menge/den aktuellen Wert darstellt (Zähler)","total_entity":"Gesamt-Entität","total_description":"Entität, die die Gesamtmenge/das Maximum darstellt (Nenner)"},"left_side":{"header":"Linke Seite","section_description":"Konfigurieren Sie den Titel und den Entitätswert, der auf der linken Seite des Balkens angezeigt wird. Dies ist nützlich, um Beschriftungen wie \'Reichweite\' oder \'Batterie\' zusammen mit ihren Werten anzuzeigen.","toggle_description":"Linke Seite der Balkenbeschriftung ein- oder ausblenden","title":"Linker Titel","title_description":"Optionale Beschriftung, die auf der linken Seite unter dem Balken angezeigt wird.","entity":"Linke Entität","entity_description":"Entität, deren Wert auf der linken Seite des Balkens angezeigt wird.","alignment_description":"Steuert, wie diese Beschriftung unter dem Balken ausgerichtet ist.","title_size":"Titelgröße","value_size":"Wertgröße","hidden_message":"Linke Seite ist ausgeblendet"},"right_side":{"header":"Rechte Seite","section_description":"Konfigurieren Sie den Titel und den Entitätswert, der auf der rechten Seite des Balkens angezeigt wird. Dies ist ideal für ergänzende Informationen wie \'Zeit bis voll\' oder sekundäre Messungen.","toggle_description":"Rechte Seite der Balkenbeschriftung ein- oder ausblenden","title":"Rechter Titel","title_description":"Optionale Beschriftung, die auf der rechten Seite unter dem Balken angezeigt wird.","entity":"Rechte Entität","entity_description":"Entität, deren Wert auf der rechten Seite des Balkens angezeigt wird.","alignment_description":"Steuert, wie diese Beschriftung unter dem Balken ausgerichtet ist.","title_size":"Titelgröße","value_size":"Wertgröße","hidden_message":"Rechte Seite ist ausgeblendet"},"colors":{"header":"Farben","bar_color":"Balkenfarbe","background_color":"Hintergrundfarbe","border_color":"Rahmenfarbe","limit_indicator_color":"Grenzindikator-Farbe","left_title_color":"Linke Titelfarbe","left_value_color":"Linke Wertfarbe","right_title_color":"Rechte Titelfarbe","right_value_color":"Rechte Wertfarbe","percentage_text_color":"Prozenttext-Farbe","reset_color":"Auf Standardfarbe zurücksetzen"},"gradient":{"header":"Verlaufsmodus","description":"Erstellen Sie schöne Farbübergänge über Ihre Fortschrittsbalken. Ideal, um Batteriestände, Kraftstoffanzeigen oder andere Statusindikatoren anzuzeigen, die visuelle Betonung erfordern.","toggle":"Verlauf verwenden","toggle_description":"Verwenden Sie einen Farbverlauf für den Fortschrittsbalken anstelle einer Vollfarbe","display_mode":"Verlaufsanzeigemodus","display_mode_full":"Vollständig","display_mode_value_based":"Wertbasiert","display_mode_cropped":"Beschnitten","display_mode_description":"Vollständig: Zeigt den gesamten Verlauf an. Wertbasiert: Zeigt den Verlauf bis zum aktuellen Wert an.","editor_header":"Verlaufseditor","add_stop":"Haltepunkt hinzufügen"},"animation":{"header":"Aktionsanimation","description":"Fügen Sie dem Balken Animationen hinzu, wenn eine bestimmte Entität einen bestimmten Zustand erreicht. Perfekt, um Ladezustände, Alarmzustände und mehr anzuzeigen.","pro_tip":"Profi-Tipp: Für \'ständig eingeschaltete\' Animationen wählen Sie einen Animationstyp, lassen aber die Entitäts- und Zustandsfelder leer. Probieren Sie die Animationen \'Blasen\' und \'Füllen\' aus!","entity":"Animations-Entität","entity_description":"Entität, die die Animation auslöst, wenn sie mit dem angegebenen Zustand übereinstimmt","state":"Entitätszustand","state_description":"Wenn der Entitätszustand mit diesem Wert übereinstimmt, wird die Animation ausgelöst","type":"Animationstyp","type_description":"Der Animationseffekt, der angezeigt wird, wenn der Entitätszustand übereinstimmt","select_entity_prompt":"Wählen Sie eine Entität und geben Sie den Zustand ein, den Sie für die Animation auslösen möchten (Beispiele: \\"charging\\", \\"on\\", \\"idle\\")","action_entity":"Aktionsentität","action_state":"Aktionszustand","action_description":"Diese Animation überschreibt die reguläre Animation, wenn sich die angegebene Entität in einem bestimmten Zustand befindet.","action_entity_prompt":"Wählen Sie eine Aktionsentität und einen Status aus, um zu definieren, wann diese Animation die reguläre Animation überschreiben soll"},"bar_sizes":{"thin":"Dünn","regular":"Normal","thick":"Dick","thiccc":"Extra Dick"},"bar_widths":{"25":"25% Breite","50":"50% Breite","75":"75% Breite","100":"100% (Volle Breite)"},"bar_alignments":{"space-between":"Abstand dazwischen","flex-start":"Links","center":"Mitte","flex-end":"Rechts"},"bar_styles":{"flat":"Flach (Standard)","glossy":"Glänzend","embossed":"Geprägt","inset":"Eingesetzt","gradient":"Verlaufsüberlagerung","neon":"Neon-Glühen","outline":"Umriss","glass":"Glas","metallic":"Metallisch","neumorphic":"Neumorphisch"},"animation_types":{"none":"Keine","charging-lines":"Laden (Diagonale Linien)","pulse":"Pulsieren","blinking":"Blinken","bouncing":"Hüpfen","glow":"Glühen","rainbow":"Regenbogen","bubbles":"Blasen","fill":"Füllen"},"custom_bar_settings":{"title":"Benutzerdefinierte Balkeneinstellungen","description":"Definieren Sie benutzerdefinierte Konfigurationen für einzelne Balken.","name":"Balkenname","entity":"Entität","unit":"Einheit","min":"Minimalwert","max":"Maximalwert","thresholds":"Schwellenwerte","severity":"Schweregradkarte"},"template_mode":{"header":"Vorlagen-Modus","description":"Verwenden Sie eine Vorlage, um den angezeigten Text zu formatieren, Einheiten zu konvertieren oder berechnete Werte anzuzeigen.","enable":"Vorlagen-Modus aktivieren","template":"Vorlage"}},"icons":{"title":"Kartensymbole","description":"Fügen Sie Symbolzeilen hinzu, um mehrere Symbole auf Ihrer Karte anzuzeigen. Jede Zeile kann mit verschiedenen Einstellungen konfiguriert werden. Hinweis: Symbolzeilen und Abschnittsreihenfolge können auf der Registerkarte \'Anpassen\' neu angeordnet werden.","add_row":"Symbolzeile hinzufügen","duplicate_row":"Zeile duplizieren","delete_row":"Zeile löschen","expand_row":"Zeile erweitern","collapse_row":"Zeile einklappen","no_row":"Es wurden keine Symbolzeilen hinzugefügt","row_prefix":"Zeile","icon_prefix":"Symbol","add_icon":"Symbol hinzufügen","duplicate_icon":"Symbol duplizieren","delete_icon":"Symbol löschen","template_mode":"Vorlagenmodus","template_mode_active_description":"Verwenden Sie eine Vorlage, um zu bestimmen, wann dieses Symbol aktiv sein soll. Mit Vorlagen können Sie Home Assistant Templating -Syntax für komplexe Bedingungen verwenden.","template_mode_inactive_description":"Verwenden Sie eine Vorlage, um zu bestimmen, wann dieses Symbol inaktiv sein soll. Mit Vorlagen können Sie Home Assistant Templating -Syntax für komplexe Bedingungen verwenden.","template_examples_header":"Häufige Beispiele:","text_formatting":"Status-Text-Formatierung","name_formatting":"Name-Formatierung","dynamic_icon":{"title":"Dynamische Icon-Vorlage","description":"Verwenden Sie eine Vorlage, um das Icon dynamisch basierend auf Entitätsstatus oder Bedingungen auszuwählen.","enable":"Dynamische Icon-Vorlage aktivieren"},"dynamic_color":{"title":"Dynamische Farb-Vorlage","description":"Verwenden Sie eine Vorlage, um die Icon-Farbe dynamisch basierend auf Entitätsstatus oder Werten zu setzen.","enable":"Dynamische Farb-Vorlage aktivieren"},"enable_template_mode":"Aktivieren Sie den Vorlagenmodus","row_settings":{"header":"Zeileneinstellungen","width":"Zeilenbreite","width_description":"Breite der Zeile als Prozentsatz der Kartenbreite","alignment":"Zeilenausrichtung","alignment_description":"Wie Symbole in dieser Zeile ausgerichtet sind","spacing":"Symbolabstand","spacing_description":"Abstand zwischen Symbolen in dieser Zeile","columns":"Spaltenanzahl","columns_description":"Anzahl der gleichmäßig großen Spalten in der Zeile (0 = automatische Verteilung basierend auf dem Inhalt)","confirmation_mode":"Bestätigungsmodus","confirmation_mode_description":"Erfordert zwei Tipps/Klicks, um Symbole in dieser Zeile zu aktivieren, um versehentliche Interaktionen zu verhindern","layout_info_title":"Wie Layouteinstellungen Funktionieren"},"icon_settings":{"header":"Symbolliste","entity":"Entität","entity_description":"Mit diesem Symbol angezeigte Entität","icon":"Symbol","icon_description":"Wählen Sie ein Symbol oder geben Sie ein benutzerdefiniertes Symbol ein","name":"Name","name_description":"Benutzerdefinierter Name, der unter dem Symbol angezeigt wird (verwendet standardmäßig den Entitätsnamen, wenn nicht angegeben)","interaction_type":"Interaktionstyp","interaction_type_description":"Wählen Sie, wie Benutzer mit diesem Symbol interagieren, um Aktionen auszulösen","show_name":"Name anzeigen","show_name_description":"Zeigt den Namenstext unter dem Symbol an","show_state":"Zustand anzeigen","show_state_description":"Zeigt den Entitätszustand unter dem Symbol an","show_units":"Einheiten anzeigen","show_units_description":"Einheiten bei der Anzeige des Zustands einbeziehen","text_position":"Textposition","text_position_description":"Wo der Namens- und Zustandstext relativ zum Symbol positioniert ist","click_action":"Klickaktion","service":"Dienst","service_description":"Aufzurufender Dienst (z.B. light.turn_on)","service_data":"Dienstdaten (JSON)","service_data_description":"JSON-Daten, die mit dem Dienstaufruf gesendet werden","action":"Aktion (JSON/Dienst)","action_description":"Erweiterte Aktionskonfiguration (siehe Dokumentation)","navigation_path":"Navigationspfad","navigation_path_description":"Pfad, zu dem navigiert werden soll (z.B. /lovelace/dashboard)","navigation_target_selector":"Navigationsziel","navigation_target_description":"Wählen Sie aus verfügbaren Dashboards, Ansichten oder Systemseiten","url":"URL","url_description":"URL, die in einem neuen Tab geöffnet wird","automation_entity":"Automatisierungs-Entität","automation_entity_description":"Automatisierung, die beim Klicken ausgelöst wird"},"icon_appearance":{"header":"Symbol-Erscheinungsbild","icon":"Symbol-Erscheinungsbild","general":"Allgemeines Erscheinungsbild","active":"Aktiver Zustand","inactive":"Inaktiver Zustand","state_conditions":"Zustandsbedingungen","advanced":"Erweiterte Einstellungen","icon_size":"Symbolgröße","icon_size_description":"Größe des Symbols in Pixeln","text_size":"Textgröße","text_size_description":"Größe des Namens-/Zustandstextes in Pixeln","name_size":"Namensgröße","name_size_description":"Größe des Entitätsnamentextes in Pixel","text_alignment":"Textausrichtung","text_alignment_description":"Wie der Text unter dem Symbol ausgerichtet ist","icon_background":"Symbolhintergrund","icon_background_description":"Fügen Sie eine Hintergrundform hinter dem Symbol hinzu","icon_background_color":"Symbolhintergrundfarbe","icon_background_color_description":"Farbe des Hintergrunds hinter dem Symbol","container_background_color":"Container-Hintergrundfarbe","container_background_color_description":"Farbe des Hintergrunds hinter dem gesamten Symbolcontainer","text_appearance":"Texterscheinungsbild","container":{"header":"Container-Erscheinungsbild","vertical_alignment":"Vertikale Ausrichtung","vertical_alignment_description":"Richten Sie das Symbol und den Text vertikal innerhalb des Containers aus.","width":"Container-Breite","width_description":"Legen Sie die Breite des Symbolcontainers relativ zur Zeile fest.","background":"Container-Hintergrundform","background_description":"Wählen Sie eine Hintergrundform für den gesamten Symbolcontainer."},"show_when_active":"Symbol anzeigen, wenn aktiv","show_when_active_description":"Dieses Symbol nur anzeigen, wenn es sich in einem aktiven Zustand befindet","template_mode":"Vorlagenmodus","template_description":"Verwenden Sie eine Vorlage, um den aktiven/inaktiven Zustand zu bestimmen. Vorlagen ermöglichen es Ihnen, die Home Assistant Vorlagensyntax (wie {{ states.sensor.temperature.state > 70 }}) für komplexe Bedingungen zu verwenden.","active_template":"Aktive Vorlage","active_template_description":"Vorlage, die true zurückgibt, wenn das Symbol aktiv sein soll.","active_state":"Aktiver Zustand","active_state_description":"Zustandszeichenfolge, die \\"aktiv\\" darstellt.","active_state_text":"Benutzerdefinierter aktiver Zustandstext","active_state_text_description":"Überschreibt den Text, der angezeigt wird, wenn das Symbol aktiv ist. Leer lassen, um den tatsächlichen Zustand zu verwenden.","inactive_template":"Inaktive Vorlage","inactive_template_description":"Vorlage, die true zurückgibt, wenn das Symbol inaktiv sein soll.","inactive_state":"Inaktiver Zustand","inactive_state_description":"Zustandszeichenfolge, die \\"inaktiv\\" darstellt.","inactive_state_text":"Benutzerdefinierter inaktiver Zustandstext","inactive_state_text_description":"Überschreibt den Text, der angezeigt wird, wenn das Symbol inaktiv ist. Leer lassen, um den tatsächlichen Zustand zu verwenden.","active_icon":"Aktives Symbol","inactive_icon":"Inaktives Symbol","active_icon_color":"Aktive Symbolfarbe","inactive_icon_color":"Inaktive Symbolfarbe","active_name_color":"Aktive Namensfarbe","inactive_name_color":"Inaktive Namensfarbe","active_state_color":"Aktive Zustandsfarbe","inactive_state_color":"Inaktive Zustandsfarbe","show_icon_active":"Symbol anzeigen, wenn aktiv","show_icon_active_description":"Symbol anzeigen, wenn der Zustand aktiv ist.","show_icon_inactive":"Symbol anzeigen, wenn inaktiv","show_icon_inactive_description":"Symbol anzeigen, wenn der Zustand inaktiv ist.","custom_active_state_text":"Benutzerdefinierter aktiver Zustandstext","custom_inactive_state_text":"Benutzerdefinierter inaktiver Zustandstext","action_description":"Aktion, die ausgeführt wird, wenn auf das Symbol geklickt wird.","show_name_active":"Name anzeigen, wenn aktiv","show_name_active_description":"Name anzeigen, wenn der Zustand aktiv ist.","show_name_inactive":"Name anzeigen, wenn inaktiv","show_name_inactive_description":"Name anzeigen, wenn der Zustand inaktiv ist.","show_state_active":"Zustand anzeigen, wenn aktiv","show_state_active_description":"Zustand anzeigen, wenn der Zustand aktiv ist.","show_state_inactive":"Zustand anzeigen, wenn inaktiv","show_state_inactive_description":"Zustand anzeigen, wenn der Zustand inaktiv ist.","use_entity_color_for_icon":"Verwenden Sie die Entitätsfarbe für Symbol","use_entity_color_for_icon_description":"Verwenden Sie das Farbattribut der Entität für das Symbol, wenn verfügbar","use_entity_color_for_icon_background":"Verwenden Sie Entität Farbe für den Symbolhintergrund","use_entity_color_for_icon_background_description":"Verwenden Sie das Farbattribut der Entität für den Symbolhintergrund, wenn verfügbar","use_entity_color_for_container_background":"Verwenden Sie Entität Farbe für den Behälter","use_entity_color_for_container_background_description":"Verwenden Sie das Farbattribut der Entität für den Containerhintergrund, sofern verfügbar","dynamic_icon_template":"Dynamische Symbol-Vorlage","dynamic_icon_template_description":"Verwenden Sie eine Vorlage, um das Symbol dynamisch basierend auf Entitätsstatus oder Bedingungen auszuwählen.","enable_dynamic_icon_template":"Dynamische Symbol-Vorlage aktivieren","dynamic_color_template":"Dynamische Farb-Vorlage","dynamic_color_template_description":"Verwenden Sie eine Vorlage, um die Symbolfarbe dynamisch basierend auf Entitätsstatus oder Werten zu setzen.","enable_dynamic_color_template":"Dynamische Farb-Vorlage aktivieren","size_settings":"Größeneinstellungen","value_size":"Wertgröße","state_text_formatting":"Status-Text-Formatierung","row_name":"Zeilenname","row_name_description":"Benutzerdefinierter Name für diese Symbolzeile (leer lassen für Standardbenennung)","width_description":"Kontrolliert, wie viel der verfügbaren Breite diese Zeile verwenden wird. Konfigurieren Sie, wie diese Symbolzeile angezeigt wird. Die Breite steuert die Gesamtzeilenbreite, der Abstand passt die Lücken zwischen Symbolen an, und die Spaltenanzahl bestimmt, wie viele Symbole in jeder Zeile erscheinen (0 = automatisch).","layout_info_title":"Wie Layouteinstellungen Funktionieren","layout_info_width":"Zeilenbreite: Kontrolliert, wie viel horizontalen Raum die Zeile in der Karte einnimmt (Prozent der Kartenbreite)","layout_info_alignment":"Zeilenausrichtung: Gilt nur, wenn die Spaltenanzahl 0 ist. Bestimmt, wie Symbole innerhalb der Zeile positioniert werden","layout_info_spacing":"Symbolabstand: Legt die Menge des Raums zwischen Symbolen fest","layout_info_columns":"Spaltenanzahl: Wenn auf 0 gesetzt, fließen Symbole natürlich basierend auf verfügbarem Raum. Wenn auf eine Zahl gesetzt, erzwingt diese exakte Anzahl von Spalten in einem Rasterlayout","layout_info_tip":"Verwenden Sie die Spaltenanzahl mit konsistenten Mengen von Symbolen pro Zeile für das gleichmäßigste Layout","control_right_side_description":"Steuern Sie, wann die rechte Seite basierend auf dem Entitätsstatus angezeigt oder ausgeblendet wird","dynamic_icon":{"title":"Dynamische Symbol-Vorlage","description":"Verwenden Sie eine Vorlage, um das Symbol dynamisch basierend auf Entitätsstatus oder Bedingungen auszuwählen.","enable":"Dynamische Symbol-Vorlage aktivieren","template_label":"Symbol-Vorlage"},"dynamic_color":{"title":"Dynamische Farb-Vorlage","description":"Verwenden Sie eine Vorlage, um die Symbolfarbe dynamisch basierend auf Entitätsstatus oder Werten zu setzen.","enable":"Dynamische Farb-Vorlage aktivieren","template_label":"Farb-Vorlage"}},"tabs":{"general":"Allgemein","actions":"Aktionen","appearance":"Erscheinungsbild","states":"Zustände","active_state":"Aktiver Zustand","inactive_state":"Inaktiver Zustand","icons":{"arrange_icon_rows":"Symbol-Zeilen anordnen"}},"alignments":{"flex-start":"Links","center":"Mitte","flex-end":"Rechts","space-between":"Abstand dazwischen","space-around":"Abstand rundherum","space-evenly":"Gleichmäßiger Abstand"},"vertical_alignments":{"flex-start":"Oben","center":"Mitte","flex-end":"Unten"},"spacing":{"none":"Keiner","small":"Klein","medium":"Mittel","large":"Groß"},"text_positions":{"below":"Unter Symbol","beside":"Neben Symbol","none":"Kein Text","top":"Oben","left":"Links","right":"Rechts"},"reset":{"size":"Auf Standardgröße zurücksetzen","color":"Auf Standardfarbe zurücksetzen","all":"Auf Standardwerte zurücksetzen"},"click_actions":{"toggle":"Umschalten","more-info":"Mehr Infos anzeigen","navigate":"Zu Pfad navigieren","url":"URL öffnen","call-service":"Dienst aufrufen","perform-action":"Aktion ausführen","location-map":"Karte anzeigen","assist":"Sprachassistent","trigger":"Auslösen","none":"Keine Aktion","descriptions":{"toggle":"Schaltet den Zustand der Entität ein und aus.","more-info":"Öffnet den Dialog mit zusätzlichen Informationen über die Entität.","navigate":"Navigiert zum angegebenen Lovelace-Pfad.","url":"Öffnet die angegebene URL in einem neuen Tab.","call-service":"Ruft den angegebenen Home Assistant-Dienst auf.","perform-action":"Führt eine benutzerdefinierte Aktion aus (siehe Dokumentation).","location-map":"Zeigt den Standort der Entität auf einer Karte an.","assist":"Öffnet den Sprachassistenten von Home Assistant.","trigger":"Löst die Entität aus (Automatisierung, Skript, Taste usw.).","none":"Es wird keine Aktion ausgeführt."}},"backgrounds":{"none":"Keine","circle":"Kreis","square":"Quadrat","rounded_square":"Abgerundetes Quadrat"},"container_widths":{"25":"25% Breite","50":"50% Breite","75":"75% Breite","100":"100% (Volle Breite)"},"row_widths":{"25":"25% Breite","50":"50% Breite","75":"75% Breite","100":"100% (Volle Breite)"},"interactions":{"single":"Einfacher Tipp/Klick","double":"Doppelter Tipp/Klick","hold":"Halten/Langes Drücken"},"animations":{"title":"Symbol-Animation","active_description":"Wählen Sie eine Animation aus, die angewendet wird, wenn sich dieses Symbol im aktiven Zustand befindet.","inactive_description":"Wählen Sie eine Animation aus, die angewendet wird, wenn sich dieses Symbol im inaktiven Zustand befindet.","select_animation":"Animation Auswählen","none":"Keine","pulse":"Pulsieren","vibrate":"Vibrieren","rotate_left":"Links Drehen","rotate_right":"Rechts Drehen","hover":"Schweben","fade":"Ausblenden","scale":"Skalieren","bounce":"Hüpfen","shake":"Schütteln","tada":"Tada"},"row_vertical_alignments":{"top":"Oben","center":"Mitte","bottom":"Unten"},"actions":{"single":"Einfache Klick-Aktion","double":"Doppelklick-Aktion","hold":"Halte-Aktion","single_description":"Aktion bei einem einzelnen Tap/Klick ausgeführt - häufigste Interaktion","double_description":"Aktion bei einem Doppel-Tap/Klick ausgeführt - hilft versehentliche Auslöser zu verhindern","hold_description":"Aktion bei 500ms Halten ausgeführt - ideal für kritische Aktionen","section_header":"Interaktions-Aktionen"}},"customize":{"title":"Layout Anpassen","description":"Layout anpassen, ordnen und Abschnitte zu Ihrer Karte hinzufügen","condition_prompt":"Wählen Sie \\"anzeigen\\" oder \\"ausblenden\\", um die Entitätsbedingung zu konfigurieren","template_mode_active":"Vorlagenmodus verwenden","layout":{"title":"Layoutstil","description":"Wählen Sie zwischen Ein- oder Zweispaltiger Ansicht für die Karte","header":"Layouteinstellungen","descriptions_header":"Layout-Beschreibungen","single_column":"Einzelspalte","single_column_description":"Alle Abschnitte sind vertikal in einer einzigen Spalte gestapelt - am besten für einfache Anzeigen und mobile Ansichten.","double_column":"Doppelspalte","double_column_description":"Abschnitte sind zwischen zwei Spalten aufgeteilt für effiziente Nutzung des horizontalen Raums - ideal für breitere Bildschirme.","top_view":"Obere Ansicht","top_view_description":"Das Bild wird prominent oben angezeigt mit anderen Abschnitten in konfigurierbaren Positionen darum angeordnet.","half_full":"Halb + Voll","half_full_description":"Obere Zeile hat zwei halbbreite Abschnitte, untere Zeile hat einen vollbreiten Abschnitt - großartig für ausgewogene Layouts.","full_half":"Voll + Halb","full_half_description":"Obere Zeile hat einen vollbreiten Abschnitt, untere Zeile hat zwei halbbreite Abschnitte - perfekt zum Hervorheben von oberem Inhalt."},"layout_types":{"single":"Einzelspalte","double":"Doppelspalte","dashboard":"Dashboard","half_full":"Halb + voll","full_half":"Voll + halb"},"column_width":{"title":"Spaltenbreite","description":"Konfigurieren Sie das Breitenverhältnis zwischen linker und rechter Spalte","50_50":"Gleich (50/50)","30_70":"Schmal links, breit rechts (30/70)","70_30":"Breit links, schmal rechts (70/30)","40_60":"Etwas schmaler links (40/60)","60_40":"Etwas breiter links (60/40)"},"top_view":{"header":"Dashboard-Einstellungen","description":"Konfigurieren Sie die Abstands- und Layouteinstellungen für die obere Ansicht","side_margin":"Seitenränder","side_margin_help":"Ränder an den Seiten der Ansicht in Pixeln","middle_spacing":"Mittlerer Abstand","middle_spacing_help":"Abstand zwischen mittleren Spalten in Pixeln","vertical_spacing":"Vertikaler Abstand","vertical_spacing_help":"Abstand zwischen Zeilen in Pixeln"},"sections":{"header":"Kartenabschnitte","arrangement_header":"Abschnittsanordnung","arrangement_desc_base":"Ziehen Sie die Abschnitte, um ihre Reihenfolge auf der Karte zu organisieren.","arrangement_desc_single_extra":"Alle Abschnitte werden in einer einzelnen Spalte angezeigt.","arrangement_desc_double_extra":"In der Zweispaltigen Ansicht können Sie jeden Abschnitt in der linken oder rechten Spalte platzieren.","arrangement_desc_dashboard_extra":"In der Dashboard-Ansicht können Sie die Abschnitte um das Bild Ihres Fahrzeugs herum platzieren."},"section_labels":{"title":"Titel","image":"Fahrzeugbild","info":"Fahrzeuginformationen","bars":"Alle Sensorbalken","icons":"Alle Symbolzeilen","section_break":"Abschnitt Break"},"actions":{"collapse_margins":"Ränder reduzieren","expand_margins":"Ränder erweitern","collapse_options":"Optionen reduzieren","expand_options":"Optionen erweitern","add_break":"Abschnittspause hinzufügen","delete_break":"Abschnittsbruch löschen"},"css":{"header":"Globales CSS","description":"Geben Sie hier benutzerdefinierte CSS-Regeln ein, um den Standardstil der Karte zu überschreiben. Diese Regeln werden direkt auf die Karte angewendet. Mit Vorsicht verwenden.","label":"Benutzerdefiniertes CSS","input_description":"Geben Sie hier Ihre benutzerdefinierten CSS-Regeln ein."},"conditions":{"header":"Bedingte Logik","description":"Zeigen oder verbergen Sie diesen Abschnitt basierend auf dem Zustand einer Entität.","template_mode_description":"Verwenden Sie eine Vorlage, um die Sichtbarkeit der Sektion zu bestimmen. Vorlagen ermöglichen es Ihnen, die Home Assistant Vorlagensyntax für komplexe Bedingungen zu verwenden.","type_label":"Bedingungstyp","section_title":"Abschnittstitel","enable_section_title":"Abschnittstitel aktivieren","title_text":"Titeltext","title_size":"Titelgröße","title_color":"Titelfarbe","enable_template_mode":"Vorlagenmodus aktivieren","use_template_description":"Verwenden Sie eine Vorlage, um zu bestimmen, wann dieser Abschnitt sichtbar sein soll. Vorlagen ermöglichen es Ihnen, die Home Assistant Vorlagensyntax für komplexe Bedingungen zu verwenden.","info_row":"Info-Zeile","entity_label":"Bedingungsentität","state_label":"Bedingungszustand","state_description":"Der Statuswert, der die Bedingung auslöst","types":{"none":"Keine (Immer anzeigen)","show":"Anzeigen wenn...","hide":"Verbergen wenn..."}},"template":{"description":"Verwenden Sie eine Vorlage, um zu bestimmen, wann dieser Abschnitt sichtbar sein soll. Vorlagen ermöglichen es Ihnen, die Home Assistant Vorlagensyntax für komplexe Bedingungen zu verwenden.","enable":"Vorlagenmodus aktivieren"},"template_mode":{"header":"Vorlagenmodus","description":"Verwenden Sie eine Vorlage, um zu steuern, wann dieses Bild basierend auf komplexer Logik, Berechnungen oder mehreren Entitätsstatus angezeigt oder ausgeblendet wird.","enable":"Vorlagenmodus aktivieren","disabled_notice":"(Deaktiviert - Vorlagenmodus Aktiv)","disabled_help":"Grundlegende Bedingungssteuerungen sind deaktiviert, wenn der Vorlagenmodus aktiv ist. Der Vorlagenmodus hat Vorrang vor grundlegenden Bedingungen.","examples":{"show_when_charging":"Anzeigen beim Laden","show_when_battery_low":"Anzeigen bei niedrigem Batteriestand","multiple_conditions":"Mehrere Bedingungen","show_during_day":"Während der Tagesstunden anzeigen","show_when_door_unlocked":"Anzeigen wenn Tür entriegelt"}},"section_title":{"header":"Abschnittstitel","enable":"Abschnittstitel aktivieren","text":"Titeltext","size":"Titelgröße","color":"Titelfarbe","bold":"Fett","italic":"Kursiv","uppercase":"Großbuchstaben","strikethrough":"Durchgestrichen"},"margins":{"header":"Ränder","top":"Oberer Rand","bottom":"Unterer Rand"},"columns":{"left":"Linke Spalte","right":"Rechte Spalte","empty":"Abschnitte hier ablegen"},"dashboard":{"top":"Oberer Bereich","top_middle":"Oberer-mittlerer Bereich","left_middle":"Linker-mittlerer Bereich","middle":"Mittlerer Bereich","middle_empty":"Fahrzeugbildbereich (Empfohlen)","right_middle":"Rechter-mittlerer Bereich","bottom_middle":"Unterer-mittlerer Bereich","bottom":"Unterer Bereich"},"half_full":{"row1_col1":"Reihe 1 - Linke Spalte","row1_col2":"Reihe 1 - Rechte Spalte","row2_full":"Reihe 2, Vollbreite (100%)"},"full_half":{"row1_full":"Reihe 1, Vollbreite (100%)","row2_col1":"Reihe 2 - Linke Spalte","row2_col2":"Reihe 2 - Rechte Spalte"},"break_styles":{"blank":"Leer (keine Zeile)","line":"Durchgezogene Linie","double_line":"Doppelzeile","dotted":"Gepunktete Linie","double_dotted":"Doppelte gepunktete Linie","shadow":"Schattengradient"},"break_style":{"header":"Breakstil","style_label":"Stil","thickness_label":"Dicke","width_percent_label":"Breite (%)","color_label":"Farbe"}},"container_widths":{"25":"25% Breite","50":"50% Breite","75":"75% Breite","100":"100% (Volle Breite)"},"row_widths":{"25":"25% Breite","50":"50% Breite","75":"75% Breite","100":"100% (Volle Breite)"}},"about":{"logo_alt":"Ultra Vehicle Card","developed_by":"Entwickelt von","discord_button":"Unserem Discord beitreten","docs_button":"Unsere Dokumentation lesen","donate_button":"SPENDEN (PAYPAL)","github_button":"Unser Github besuchen","support_title":"Ultra Vehicle Card unterstützen","support_description":"Ihre großzügigen Tipps befeuern die Entwicklung erstaunlicher Funktionen für diese Karte! Ohne Unterstützung von Benutzern wie Ihnen wäre eine fortgesetzte Innovation nicht möglich."},"custom_icons":{"title":"Benutzerdefinierte Symbole","description":"Definieren Sie benutzerdefinierte Symbole für verschiedene Zustände.","icon_entity":"Symbol-Entität","default_icon":"Standardsymbol","state_icons":"Zustandssymbole","state":"Zustand","icon":"Symbol"},"custom_active_state_text":"Benutzerdefinierter aktiver Zustandstext","custom_inactive_state_text":"Benutzerdefinierter inaktiver Zustandstext","image_settings":{"title":"Bildeinstellungen","description":"Konfigurieren Sie das Erscheinungsbild des Hauptbildes.","type":"Bildtyp","width":"Bildbreite","crop":"Bild zuschneiden","entity":"Bild-Entität","entity_description":"Entität, die die Bild-URL bereitstellt"},"entity_settings":{"entity":"Juristische Person","entity_description":"Wählen Sie eine Entität aus, aus der Informationen angezeigt werden","name":"Name","name_description":"Überschreiben Sie den Entitätsnamen (lassen Sie leer, um den freundlichen Namen der Entität zu verwenden).","show_icon":"Ikone zeigen","icon":"Symbol","icon_color":"Symbolfarbe","name_color":"Nennen Sie Farbe","entity_color":"Entität Farbe","text_color":"Textfarbe","show_name":"Showname","show_name_description":"Zeigen Sie den Entitätsnamen vor dem Wert an","template_mode":"Vorlagenmodus","template_mode_description":"Verwenden Sie eine Vorlage, um den Entitätswert zu formatieren","value_template":"Wertvorlage","template_header":"Wertvorlage","template_examples_header":"Häufige Beispiele:","template_basic":"Grundwert","template_units":"Mit Einheiten","template_round":"Rund auf 1 Dezimalheit","dynamic_icon_template":"Icon-Vorlage","dynamic_color_template":"Farbvorlage","dynamic_icon_template_mode":"Dynamische Icon-Vorlage aktivieren","dynamic_color_template_mode":"Dynamische Farbvorlage aktivieren"}}');var ht=a.t(_t,2);const vt=JSON.parse('{"editor":{"tabs":{"settings":"Ajustes","bars":"Barras","icons":"Iconos","customize":"Personalizar","about":"Acerca de","info":"Información","images":"Imágenes"},"info":{"arrange_info_rows":"Organizar filas de información","add_row":"Agregar Fila de Información","add_entity":"Agregar Entidad de Información","title":"Información de la tarjeta","description":"Configurar filas de información y entidades para mostrar detalles del vehículo como ubicación, kilometraje, etc. Los elementos de información se mostrarán en una sola línea cuando sea posible, ajustándose a múltiples líneas en contenedores estrechos.","row_prefix":"Fila de Información","entity_prefix":"Elemento","template_mode":"Modo de plantilla","template_mode_description":"Utilice una plantilla para formatear el valor de la entidad. Las plantillas le permiten usar la sintaxis de plantillas de Home Assistant para formateo complejo.","template_examples_header":"Ejemplos comunes:","row_settings":{"header":"Configuración de Fila","row_name":"Nombre de Fila","row_name_description":"Nombre personalizado para esta fila de información (dejar en blanco para usar nomenclatura predeterminada)","horizontal_alignment":"Alineación Horizontal","alignment_description":"Alineación horizontal de entidades en esta fila","vertical_alignment":"Alineación Vertical","vertical_alignment_description":"Controla cómo se alinean las entidades verticalmente dentro de la fila.","spacing":"Espaciado","spacing_description":"Espaciado entre entidades en esta fila","allow_wrap":"Permitir Ajuste de Elementos","allow_wrap_description":"Cuando está habilitado, los elementos fluirán a la siguiente línea si no caben en una fila. Cuando está deshabilitado, todos los elementos permanecerán en una sola fila."},"alignments":{"flex-start":"Inicio","center":"Centro","flex-end":"Fin","space-between":"Espacio Entre","space-around":"Espacio Alrededor","space-evenly":"Espacio Uniforme"},"spacing":{"none":"Ninguno","small":"Pequeño","medium":"Mediano","large":"Grande"},"click_actions":{"more-info":"Más Información","navigate":"Navegar","url":"Abrir URL","call-service":"Llamar Servicio","none":"Ninguno"},"row_vertical_alignments":{"top":"Arriba","center":"Centro","bottom":"Abajo"},"entity_settings":{"header":"Elementos de Información","name":"Nombre Personalizado","show_name":"Mostrar Nombre","show_name_description":"Mostrar el nombre de la entidad antes del valor","show_icon":"Mostrar Icono","click_action":"Acción al Hacer Clic","icon_color":"Color del Icono","name_color":"Color del Nombre","entity_color":"Color de Entidad","icon_size":"Tamaño del Icono","name_size":"Tamaño del Nombre","value_size":"Tamaño del Valor","size_settings":"Configuración de Tamaño","entity_description":"Select an entity to display information from","name_description":"Override the entity name (leave blank to use entity\'s friendly name)","navigation_path":"Navigation Path","navigation_path_description":"Path to navigate to when clicked (e.g., /lovelace/0)","url":"URL","url_description":"URL to open when clicked","service":"Service","service_description":"Service to call (e.g., light.turn_on)","service_data":"Service Data (JSON)"},"dynamic_icon":{"title":"Plantilla de Icono Dinámico","description":"Usa una plantilla para seleccionar dinámicamente el icono basándose en estados de entidades o condiciones.","enable":"Enable Dynamic Icon Template"},"dynamic_color":{"title":"Plantilla de Color Dinámico","description":"Usa una plantilla para establecer dinámicamente el color del icono basándose en estados de entidades o valores.","enable":"Enable Dynamic Color Template"},"duplicate_row":"Duplicate Row","delete_row":"Delete Row","expand_row":"Expand Row","collapse_row":"Collapse Row","duplicate_entity":"Duplicate Entity","delete_entity":"Delete Entity","expand_entity":"Expand Entity","collapse_entity":"Collapse Entity"},"settings_subtabs":{"general":"General","action_images":"Imágenes de acción"},"action_images":{"title":"Configuración de Imágenes de Acción","description":"Configura imágenes que se mostrarán cuando se cumplan estados específicos de entidades.","add_image":"Añadir Imagen de Acción","no_images":"Aún no hay imágenes de acción configuradas. Añade una para comenzar.","actions":{"drag":"Arrastrar para reordenar","duplicate":"Duplicar","delete":"Eliminar","expand":"Expandir","collapse":"Colapsar"},"delete_confirm":"¿Estás seguro de que deseas eliminar esta imagen de acción?","entity_settings":"Configuración de Entidad","image_settings":"Configuración de Imagen","entity_placeholder":"Selecciona una entidad","state_placeholder":"Ingresa el valor del estado","preview":{"no_entity":"Ninguna entidad seleccionada","no_image":"Sin imagen","any_state":"Cualquier estado"},"trigger_entity":"Entidad Disparadora","trigger_state":"Estado Disparador","entity_help":"Selecciona una entidad a monitorear. La imagen se mostrará cuando esta entidad coincida con el estado indicado abajo.","state_help":"Ingresa el valor del estado que activará la visualización de esta imagen. Déjalo en blanco para coincidir con cualquier estado.","image_type":{"title":"Tipo de Imagen","upload":"Subir Imagen","url":"URL de Imagen","entity":"Imagen de Entidad","none":"Ninguna"},"template_mode":"Modo Plantilla","template_description":"Usar una plantilla para determinar cuándo se debe mostrar esta imagen. Las plantillas permiten usar la sintaxis de plantillas de Home Assistant (como {{ states.sensor.temperature.state > 70 }}) para condiciones complejas.","template_label":"Plantilla de visualización","template_help":"Introduce una plantilla que devuelva verdadero/falso. Esta imagen se mostrará cuando la plantilla evalúe a verdadero. Usa sintaxis Jinja2: {{ states(...) }}","priority":{"label":"Prioridad de Visualización","description":"Basado en Prioridad usa la primera coincidencia de arriba hacia abajo. Coincidencia Más Reciente usa la última coincidencia encontrada en la lista.","options":{"priority":"Basado en Prioridad","newest":"Coincidencia Más Reciente"}}},"images":{"title":"Imágenes","description":"Configura imágenes que se mostrarán basadas en condiciones o plantillas.","add_image":"Añadir Imagen","no_images":"Aún no hay imágenes configuradas. Añade una para comenzar.","arrange_images":"Organizar Imágenes","name":"Nombre (Opcional)","image_type":"Tipo de Imagen","url":"URL de Imagen","image_entity":"Entidad de Imagen","priority":"Prioridad (0 = más alta)","priority_mode":"Modo de Prioridad","timed_duration":"Duración de Visualización (segundos)","timed_duration_help":"Cuánto tiempo debe mostrarse esta imagen antes de regresar a la imagen principal.","duplicate":"Duplicar Imagen","delete":"Eliminar Imagen","delete_confirm":"¿Estás seguro de que deseas eliminar esta imagen?","image_types":{"none":"Ninguna","default":"Vehículo Predeterminado","url":"URL de Imagen","upload":"Subir Imagen","entity":"Imagen de Entidad","map":"Mapa"},"priority_modes":{"order":"Prioridad por Orden","order_help":"Las imágenes se muestran basadas en su orden en la lista (arrastra para reordenar).","last_triggered":"Último Activado","last_triggered_help":"La imagen activada más recientemente permanecerá mostrada hasta que otra imagen sea activada.","timed":"Imágenes Temporizadas","timed_help":"Las imágenes debajo de la primera se mostrarán por una duración establecida y luego regresarán a la imagen principal."},"conditional_types":{"show":"Mostrar Cuando","hide":"Ocultar Cuando"},"tabs":{"general":"General","conditional":"Condicional","appearance":"Apariencia"},"conditional_help":"Configura cuándo debe mostrarse esta imagen basándose en estados de entidades o plantillas.","conditional_help_simple":"Configura cuándo debe mostrarse esta imagen basándose en estados de entidades.","conditional_state_help":"La imagen se mostrará cuando la entidad sea igual a este valor de estado.","conditional_entity":"Entidad Condicional","conditional_state":"Estado Condicional","basic_conditions":"Condiciones Básicas","advanced_conditional":"Condiciones de Plantilla Avanzadas","advanced_help":"Usa plantillas para condiciones complejas como múltiples entidades o comparaciones matemáticas.","template_mode_active_help":"Usa plantillas para condiciones complejas como múltiples entidades o comparaciones matemáticas.","template_mode":{"header":"Modo de Plantilla","enable":"Habilitar Modo de Plantilla","template":"Plantilla"},"template_examples_header":"Ejemplos Comunes:","width":"Ancho (%)","width_settings":"Configuración de Ancho","crop_settings":"Configuración de Recorte","crop_help":"Los valores positivos recortan hacia adentro, los valores negativos añaden relleno hacia afuera.","crop_top":"Superior","crop_right":"Derecha","crop_bottom":"Inferior","crop_left":"Izquierda","fallback_image":"Imagen de Respaldo","fallback_help":"Esta imagen se usará como respaldo si ningún disparador coincide o se agota el tiempo. Solo una imagen puede ser de respaldo.","map_entity":"Entidad de Ubicación","map_entity_help":"Selecciona una entidad con coordenadas de latitud/longitud o dirección para mostrar en el mapa.","target_entity":"Entidad Objetivo","target_entity_description":"Selecciona la entidad objetivo para esta acción","common":{"width":"Ancho de Imagen","width_description":"Ancho como porcentaje de la tarjeta","width_over_100":"Los valores superiores al 100% pueden ayudar a recortar el espacio vacío alrededor de las imágenes","url_description":"Introduce la URL de la imagen"},"vehicle":{"crop":"Recortar Imagen"},"migration":{"title":"Imágenes Heredadas Detectadas","description":"Encontramos configuraciones de imágenes heredadas que pueden migrarse al nuevo formato.","migrate_button":"Migrar Ahora","success":"¡Imágenes migradas exitosamente!"}},"card_settings":{"title":"Título de la tarjeta","title_alignment":"Alineación del título","title_size":"Tamaño del título","title_color":"Color del Título","title_color_description":"Color del título de la tarjeta","title_description":"Título mostrado en la parte superior de la tarjeta (opcional)","title_alignment_description":"Cómo se alinea el título de la tarjeta","title_size_description":"Tamaño del título de la tarjeta en píxeles","colors":"Colores","card_background":"Fondo de la Tarjeta","card_background_description":"Color de fondo de toda la tarjeta","format_entities":"Formatear valores de entidades","format_entities_description":"Habilita el formateo adicional de valores de entidades (agrega comas, convierte unidades, etc.)","show_units":"Mostrar unidades","show_units_description":"Mostrar unidades junto a los valores","help_highlight":"Ayuda para resaltar","help_highlight_description":"Mostrar aspectos destacados visuales al cambiar entre las pestañas del editor para ayudar a identificar qué sección está editando","general":"General","conditional_logic":"Lógica Condicional","card_visibility":"Visibilidad de la Tarjeta","card_visibility_description":"Mostrar u ocultar toda la tarjeta basándose en una condición de entidad"},"vehicle_info":{"title":"Información del Vehículo","location":{"title":"Entidad de Ubicación","description":"Selecciona la entidad que muestra la ubicación actual del vehículo.","show":"Mostrar Ubicación","show_description":"Muestra la ubicación del vehículo"},"mileage":{"title":"Entidad de Kilometraje","description":"Selecciona la entidad que representa el kilometraje total o el cuentakilómetros del vehículo.","show":"Mostrar Kilometraje","show_description":"Muestra el kilometraje del vehículo"},"car_state":{"title":"Entidad de Estado del Vehículo","description":"Selecciona la entidad que representa el estado actual del vehículo (ej. estacionado, en movimiento, cargando).","show":"Mostrar Estado del Vehículo","show_description":"Muestra el estado del vehículo"}},"crop":{"title":"Recorte de Imagen","top":"Superior","right":"Derecho","bottom":"Inferior","left":"Izquierdo","pixels":"px","help":"Ingresa valores en píxeles (positivos o negativos) para ajustar el recorte y el relleno"},"alignment":{"left":"Izquierda","center":"Centro","right":"Derecha"},"common":{"choose_file":"Elegir Archivo","no_file_chosen":"Ningún archivo seleccionado","entity":"Entidad","width":"Ancho","width_description":"Ancho en porcentaje de la tarjeta","width_over_100":"Los valores superiores al 100% pueden ayudar a recortar el espacio vacío alrededor de las imágenes","none":"Ninguno","default":"Predeterminado","upload":"Subir","url":"URL","url_description":"URL que apunta a la imagen","reset":"Restablecer","condition_prompt":"Selecciona \\"Mostrar\\" u \\"Ocultar\\" para configurar la condición de entidad","bold":"Negrita","italic":"Cursiva","uppercase":"Mayúsculas","strikethrough":"Tachado","template_section_visibility":"Usa una plantilla para determinar cuándo esta sección debe ser visible. Las plantillas te permiten usar la sintaxis de plantillas de Home Assistant para condiciones complejas.","enable_template_mode":"Habilitar Modo de Plantilla","template_determine_visibility":"Usa una plantilla para determinar cuándo esta sección debe ser visible. Las plantillas te permiten usar la sintaxis de plantillas de Home Assistant para condiciones complejas.","templates_allow_syntax":"Las plantillas te permiten usar la sintaxis de plantillas de Home Assistant para condiciones complejas."},"conditions":{"condition_type":"Tipo de Condición","show_card_if":"Mostrar Tarjeta Si","hide_card_if":"Ocultar Tarjeta Si","entity_description":"Selecciona la entidad para verificar la condición","state":"Estado","state_description":"El valor de estado que activa la condición"},"bars":{"title":"Barras de progreso","description":"Agregue barras de progreso personalizables para mostrar varias métricas como nivel de batería, alcance, estado de carga y más. Cada barra se puede configurar individualmente con colores, animaciones y etiquetas.","add":"Agregar barra","duplicate":"Duplicar barra","delete":"Eliminar barra","expand":"Expandir barra","collapse":"Contraer barra","no_entity":"Ninguna entidad seleccionada","bar_prefix":"Barra","template":{"description":"Utilice una plantilla para formatear el texto mostrado, convertir unidades o mostrar valores calculados.","enable":"Habilitar Modo de Plantilla","template_label":"Plantilla","helper_text":"Use la sintaxis de plantillas de Home Assistant. Ejemplos:\\n• {{ states(\'sensor.temperature\') | float * 1.8 + 32 }} °F\\n• {{ now().strftime(\\"%b %d, %H:%M\\") }}","examples_header":"Ejemplos comunes:","examples":{"temperature":"Convertir Celsius a Fahrenheit","datetime":"Formatear fecha/hora actual","power":"Combinar texto y valor del sensor"}},"bar_radius":{"round":"Redondo","square":"Cuadrado","rounded-square":"Cuadrado Redondeado"},"tabs":{"arrange_bars":"Organizar Barras","config":"Configuración","colors":"Colores","animation":"Animación"},"settings":{"header":"Configuración de Barra","entity":"Entidad de Porcentaje de Barra","entity_description":"Selecciona una entidad que devuelva un valor porcentual (0-100). Esto controla el nivel de llenado de la barra.","limit_entity":"Entidad de Valor Límite (opcional)","limit_entity_description":"Opcional: Añade una línea indicadora vertical en la barra (ej. límite de carga para batería de VE).","limit_color":"Color de Indicador de Límite","limit_color_description":"Color de la línea vertical que indica la posición del límite en la barra. Los cambios forzarán una actualización de la tarjeta.","bar_size":"Tamaño de Barra","bar_size_description":"Define el grosor/altura de la barra de progreso.","bar_radius":"Radio de Barra","bar_radius_description":"Forma de las esquinas de la barra de progreso","bar_style":"Estilo de Barra","bar_style_description":"Estilo visual de la barra de progreso","width":"Ancho de Barra","width_description":"Define el ancho de la barra en porcentaje del ancho de la tarjeta.","alignment":"Alineación de Etiqueta","alignment_description":"Cómo se alinean las etiquetas izquierda y derecha entre sí.","show_percentage":"Mostrar Porcentaje","show_percentage_description":"Mostrar el valor de porcentaje dentro de la barra","bar_name_header":"Nombre de la Barra","bar_name":"Nombre de la Barra","bar_name_description":"Dale a esta barra un nombre personalizado para que sea más fácil identificarla en el editor y las vistas de organización.","bar_name_input_description":"Nombre personalizado para esta barra (dejar en blanco para usar nomenclatura predeterminada)"},"percentage":{"header":"Texto de Porcentaje","display_header":"Visualización de Texto de Porcentaje","display_description":"Controla la visibilidad y apariencia de los valores porcentuales mostrados directamente en la barra. Estos números proporcionan un indicador visual claro del nivel actual.","text_size":"Tamaño de Texto","calculation_header":"Cálculo de Porcentaje","calculation_description":"Configura cómo se calcula el nivel de llenado porcentual de la barra utilizando una de las siguientes opciones.","type_header":"Cálculo de Porcentaje","type_label":"Tipo de Porcentaje","type_description":"Cómo calcular el valor de porcentaje mostrado en la barra","type_entity":"Entidad (0-100)","type_attribute":"Atributo de Entidad","type_template":"Modo de Plantilla","type_difference":"Diferencia (Cantidad/Total)","amount_entity":"Entidad de Cantidad","amount_description":"Entidad que representa la cantidad actual/valor (numerador)","total_entity":"Entidad de Total","total_description":"Entidad que representa la cantidad/máximo total (denominador)"},"left_side":{"header":"Lado Izquierdo","section_description":"Configura el título y el valor de entidad mostrados en el lado izquierdo de la barra. Esto es útil para mostrar etiquetas como \'Autonomía\' o \'Batería\' junto con sus valores.","toggle_description":"Mostrar u ocultar el lado izquierdo de la etiqueta de barra","title":"Título Izquierdo","title_description":"Etiqueta opcional mostrada en el lado izquierdo debajo de la barra.","entity":"Entidad Izquierda","entity_description":"Entidad cuyo valor se muestra en el lado izquierdo de la barra.","alignment_description":"Controla cómo se alinea esta etiqueta debajo de la barra.","title_size":"Tamaño del Título","value_size":"Tamaño del Valor","hidden_message":"El lado izquierdo está oculto","show_title":"Mostrar Título","show_value":"Mostrar Valor","conditional_description":"Controla cuándo se muestra u oculta el lado izquierdo basándose en el estado de una entidad"},"right_side":{"header":"Lado Derecho","section_description":"Configura el título y el valor de entidad mostrados en el lado derecho de la barra. Esto es ideal para información complementaria como \'Tiempo hasta Carga Completa\' o mediciones secundarias.","toggle_description":"Mostrar u ocultar el lado derecho de la etiqueta de barra","title":"Título Derecho","title_description":"Etiqueta opcional mostrada en el lado derecho debajo de la barra.","entity":"Entidad Derecha","entity_description":"Entidad cuyo valor se muestra en el lado derecho de la barra.","alignment_description":"Controla cómo se alinea esta etiqueta debajo de la barra.","title_size":"Tamaño del Título","value_size":"Tamaño del Valor","hidden_message":"El lado derecho está oculto","show_title":"Mostrar Título","show_value":"Mostrar Valor","conditional_description":"Controla cuándo se muestra u oculta el lado derecho basándose en el estado de una entidad"},"colors":{"header":"Colores","bar_color":"Color de Barra","background_color":"Color de Fondo","border_color":"Color de Borde","limit_indicator_color":"Color de Indicador de Límite","left_title_color":"Color de Título Izquierdo","left_value_color":"Color de Valor Izquierdo","right_title_color":"Color de Título Derecho","right_value_color":"Color de Valor Derecho","percentage_text_color":"Color de Texto de Porcentaje","reset_color":"Restablecer color predeterminado"},"gradient":{"header":"Modo Degradado","description":"Crea hermosas transiciones de color en tus barras de progreso. Ideal para mostrar niveles de batería, indicadores de combustible o cualquier indicador de estado que requiera énfasis visual.","toggle":"Usar Degradado","toggle_description":"Usar un degradado para la barra de progreso en lugar de un color sólido","display_mode":"Modo de Visualización del Degradado","display_mode_full":"Completo","display_mode_value_based":"Basado en Valor","display_mode_cropped":"Recortado","display_mode_description":"Completo: Mostrar degradado completo. Basado en Valor: Mostrar degradado hasta el valor actual.","editor_header":"Editor de Degradado","add_stop":"Añadir Parada"},"animation":{"header":"Animación de Acción","description":"Añade animaciones a la barra cuando una entidad específica alcanza un estado específico. Perfecto para mostrar estados de carga, estados de alarma y más.","pro_tip":"Consejo Pro: Para animaciones \'siempre activas\', selecciona un tipo de animación pero deja vacíos los campos de entidad y estado. ¡Prueba las animaciones \'Burbujas\' y \'Rellenar\'!","entity":"Entidad de Animación","entity_description":"Entidad que activa la animación cuando coincide con el estado especificado","state":"Estado de Entidad","state_description":"Cuando el estado de la entidad coincide con este valor, se activará la animación","type":"Tipo de Animación","type_description":"El efecto de animación que se mostrará cuando el estado de la entidad coincida","select_entity_prompt":"Seleccione una Entidad y escriba el estado que desea para activar la animación (ejemplos: \\"charging\\", \\"on\\", \\"idle\\")","action_entity":"Entidad de Acción","action_state":"Estado de Acción","action_description":"Esta animación anulará la animación regular cuando la entidad especificada esté en un estado específico.","action_entity_prompt":"Selecciona una Entidad de Acción y estado para definir cuándo esta animación debe anular la animación regular","action_header":"Anulación de Animación de Acción","action_entity_description":"Entidad que activa la animación de acción","action_state_description":"Estado que activa la animación de acción","action_select_prompt":"Selecciona una Entidad de Acción y estado para definir cuándo esta animación debe anular la animación regular"},"bar_sizes":{"thin":"Delgada","regular":"Normal","thick":"Gruesa","thiccc":"Muy Gruesa"},"bar_widths":{"25":"25% de Ancho","50":"50% de Ancho","75":"75% de Ancho","100":"100% (Ancho Completo)"},"bar_alignments":{"space-between":"Espacio Entre","flex-start":"Izquierda","center":"Centro","flex-end":"Derecha"},"bar_styles":{"flat":"Plano (Predeterminado)","glossy":"Brillante","embossed":"Relieve","inset":"Insertado","gradient":"Superposición de Degradado","neon":"Brillo Neón","outline":"Contorno","glass":"Cristal","metallic":"Metálico","neumorphic":"Neumórfico","dashed":"Rayado"},"row_alignment":{"header":"Alineación Global de Filas de Barras","description":"Controla la alineación horizontal de las barras dentro de cada fila si no llenan todo el ancho.","label":"Alineación de Fila de Barras"},"animation_types":{"none":"Ninguna","charging-lines":"Carga (Líneas Diagonales)","pulse":"Pulso","blinking":"Parpadeo","bouncing":"Rebote","glow":"Brillo","rainbow":"Arcoíris","bubbles":"Burbujas","fill":"Rellenar"},"custom_bar_settings":{"title":"Configuración de Barra Personalizada","description":"Define configuraciones personalizadas para barras individuales.","name":"Nombre de la Barra","entity":"Entidad","unit":"Unidad","min":"Valor Mínimo","max":"Valor Máximo","thresholds":"Umbrales","severity":"Mapa de Severidad"},"template_mode":{"header":"Template Mode","description":"Use a template to format the displayed text, convert units, or show calculated values.","enable":"Enable Template Mode","template":"Template"}},"icons":{"title":"Iconos de la tarjeta","description":"Agrega filas de iconos para mostrar múltiples iconos en tu tarjeta. Cada fila se puede configurar con diferentes ajustes. Nota: Las filas de iconos y el orden de las secciones se pueden reorganizar en la pestaña Personalizar.","add_row":"Agregar fila de iconos","duplicate_row":"Duplicar fila","delete_row":"Eliminar fila","expand_row":"Expandir fila","collapse_row":"Contraer fila","no_row":"No se han agregado filas de iconos","row_prefix":"Fila","icon_prefix":"Icono","add_icon":"Agregar icono","duplicate_icon":"Duplicar icono","delete_icon":"Eliminar icono","template_mode":"Modo Plantilla","template_mode_active_description":"Utiliza una plantilla para determinar cuándo este ícono debe estar activo. Las plantillas le permiten usar la sintaxis de plantillas de Home Assistant para condiciones complejas.","template_mode_inactive_description":"Utiliza una plantilla para determinar cuándo este ícono debe estar inactivo. Las plantillas le permiten usar la sintaxis de plantillas de Home Assistant para condiciones complejas.","enable_template_mode":"Habilitar Modo de Plantilla","template_examples_header":"Ejemplos Comunes:","text_formatting":"Formato de Texto de Estado","name_formatting":"Formato de Nombre","dynamic_icon":{"title":"Plantilla de Icono Dinámico","description":"Usa una plantilla para seleccionar dinámicamente el icono basándose en estados de entidades o condiciones.","enable":"Habilitar Plantilla de Icono Dinámico"},"dynamic_color":{"title":"Plantilla de Color Dinámico","description":"Usa una plantilla para establecer dinámicamente el color del icono basándose en estados de entidades o valores.","enable":"Habilitar Plantilla de Color Dinámico"},"row_settings":{"header":"Configuración de Fila","row_name":"Nombre de Fila","row_name_description":"Nombre personalizado para esta fila de iconos (dejar en blanco para usar la nomenclatura predeterminada)","width":"Ancho de Fila","width_description":"Ancho de la fila en porcentaje del ancho de la tarjeta","alignment":"Alineación de Fila","alignment_description":"Cómo se alinean los iconos en esta fila","spacing":"Espaciado de Iconos","spacing_description":"Cantidad de espacio entre los iconos en esta fila","columns":"Número de Columnas","columns_description":"Número de columnas de tamaño uniforme en la fila (0 = distribución automática basada en el contenido)","vertical_alignment":"Alineación Vertical","vertical_alignment_description":"Controla cómo se alinean los iconos verticalmente dentro de la fila.","confirmation_mode":"Modo de Confirmación","confirmation_mode_description":"Requiere dos toques/clics para activar los iconos en esta fila, evitando interacciones accidentales","layout_info_title":"Cómo funcionan la configuración de diseño"},"icon_settings":{"header":"Configuración de Icono","entity":"Entidad","entity_description":"Entidad mostrada con este icono","icon":"Icono","icon_description":"Selecciona un icono o ingresa un icono personalizado","name":"Nombre","name_description":"Nombre personalizado mostrado debajo del icono (usa el nombre de la entidad por defecto si no se especifica)","interaction_type":"Tipo de Interacción","interaction_type_description":"Elige cómo los usuarios interactúan con este icono para activar acciones","show_name":"Mostrar Nombre","show_name_description":"Muestra el texto del nombre debajo del icono","show_state":"Mostrar Estado","show_state_description":"Muestra el estado de la entidad debajo del icono","show_units":"Mostrar Unidades","show_units_description":"Incluye las unidades al mostrar el estado","text_position":"Posición del Texto","text_position_description":"Dónde se posiciona el texto del nombre y estado respecto al icono","click_action":"Acción al Hacer Clic","service":"Servicio","service_description":"Servicio a llamar (ej. light.turn_on)","service_data":"Datos del Servicio (JSON)","service_data_description":"Datos JSON enviados con la llamada al servicio","action":"Acción (JSON/Servicio)","action_description":"Configuración avanzada de acción (ver documentación)","navigation_path":"Ruta de Navegación","navigation_path_description":"Ruta a la que navegar (ej. /lovelace/dashboard)","navigation_target_selector":"Objetivo de Navegación","navigation_target_description":"Selecciona entre tableros disponibles, vistas o páginas del sistema","url":"Url","url_description":"URL para abrir en una nueva pestaña","automation_entity":"Entidad de Automatización","automation_entity_description":"Automatización a activar cuando se hace clic"},"icon_appearance":{"header":"Apariencia del Icono","icon":"Icono Específico","general":"Apariencia General","active":"Estado Activo","inactive":"Estado Inactivo","state_conditions":"Condiciones de Estado","advanced":"Configuración Avanzada","icon_size":"Tamaño del Icono","icon_size_description":"Tamaño del icono en píxeles","text_size":"Tamaño del Texto","text_size_description":"Tamaño del texto de nombre/estado en píxeles","name_size":"Tamaño de nombre","name_size_description":"Tamaño del texto del nombre de la entidad en píxeles","text_alignment":"Alineación del Texto","text_alignment_description":"Cómo se alinea el texto debajo del icono","icon_background":"Fondo del Icono","icon_background_description":"Añade una forma de fondo detrás del icono","icon_background_color":"Color de Fondo del Icono","icon_background_color_description":"Color del fondo detrás del icono","container_background_color":"Color de Fondo del Contenedor","container_background_color_description":"Color del fondo detrás del contenedor completo del icono","text_appearance":"Apariencia del Texto","name_formatting":"Formato de Nombre","text_formatting":"Formato de Texto de Estado","container":{"header":"Apariencia del Contenedor","vertical_alignment":"Alineación Vertical","vertical_alignment_description":"Alinear el icono y el texto verticalmente dentro del contenedor.","width":"Ancho del Contenedor","width_description":"Establecer el ancho del contenedor del icono relativo a la fila.","background":"Forma del Fondo del Contenedor","background_description":"Elegir una forma de fondo para todo el contenedor del icono."},"show_when_active":"Mostrar Icono Cuando Activo","show_when_active_description":"Mostrar este icono solo cuando está en un estado activo","template_mode":"Modo Plantilla","template_description":"Usar una plantilla para determinar el estado activo/inactivo. Las plantillas permiten usar la sintaxis de plantillas de Home Assistant (como {{ states.sensor.temperature.state > 70 }}) para condiciones complejas.","active_template":"Plantilla Activa","active_template_description":"Plantilla que evalúa a verdadero cuando el icono debe estar activo.","active_state":"Estado Activo","active_state_description":"Cadena de estado que representa \\"activo\\".","active_state_text":"Texto Personalizado para Estado Activo","active_state_text_description":"Sobrescribe el texto mostrado cuando el icono está activo. Dejar vacío para usar el estado real.","inactive_template":"Plantilla Inactiva","inactive_template_description":"Plantilla que evalúa a verdadero cuando el icono debe estar inactivo.","inactive_state":"Estado Inactivo","inactive_state_description":"Cadena de estado que representa \\"inactivo\\".","inactive_state_text":"Texto Personalizado para Estado Inactivo","inactive_state_text_description":"Sobrescribe el texto mostrado cuando el icono está inactivo. Dejar vacío para usar el estado real.","active_icon":"Icono Activo","inactive_icon":"Icono Inactivo","active_icon_color":"Color del Icono Activo","inactive_icon_color":"Color del Icono Inactivo","active_name_color":"Color del Nombre Activo","inactive_name_color":"Color del Nombre Inactivo","active_state_color":"Color del Estado Activo","inactive_state_color":"Color del Estado Inactivo","show_icon_active":"Mostrar Icono Cuando Activo","show_icon_active_description":"Mostrar el icono cuando el estado es activo.","show_icon_inactive":"Mostrar Icono Cuando Inactivo","show_icon_inactive_description":"Mostrar el icono cuando el estado está inactivo.","custom_active_state_text":"Texto Personalizado de Estado Activo","custom_inactive_state_text":"Texto Personalizado de Estado Inactivo","action_description":"Acción a realizar cuando se hace clic en el icono.","show_name_active":"Mostrar Nombre Cuando Activo","show_name_active_description":"Mostrar el nombre cuando el estado es activo.","show_name_inactive":"Mostrar Nombre Cuando Inactivo","show_name_inactive_description":"Mostrar el nombre cuando el estado es inactivo.","show_state_active":"Mostrar Estado Cuando Activo","show_state_active_description":"Mostrar el estado cuando el estado es activo.","show_state_inactive":"Mostrar Estado Cuando Inactivo","show_state_inactive_description":"Mostrar el estado cuando el estado es inactivo.","use_entity_color_for_icon":"Use el color de la entidad para el icono","use_entity_color_for_icon_description":"Usar el atributo de color de la entidad para el icono cuando esté disponible","use_entity_color_for_icon_background":"Utilice el color de la entidad para el fondo de iconos","use_entity_color_for_icon_background_description":"Use el atributo de color de la entidad para el fondo del icono cuando esté disponible","use_entity_color_for_container_background":"Utilice el color de la entidad para contenedor","use_entity_color_for_container_background_description":"Use el atributo de color de la entidad para el fondo del contenedor cuando esté disponible","dynamic_icon_template":"Plantilla de Icono Dinámico","dynamic_icon_template_description":"Usa una plantilla para seleccionar dinámicamente el icono basándose en estados de entidades o condiciones.","enable_dynamic_icon_template":"Habilitar Plantilla de Icono Dinámico","dynamic_color_template":"Plantilla de Color Dinámico","dynamic_color_template_description":"Usa una plantilla para establecer dinámicamente el color del icono basándose en estados de entidades o valores.","enable_dynamic_color_template":"Habilitar Plantilla de Color Dinámico","size_settings":"Configuración de Tamaño","value_size":"Tamaño del Valor","state_text_formatting":"Formato de Texto de Estado","row_name":"Nombre de Fila","row_name_description":"Nombre personalizado para esta fila de iconos (dejar en blanco para usar la nomenclatura predeterminada)","width_description":"Controla cuánto del ancho disponible usará esta fila. Configura cómo se muestra esta fila de iconos. El ancho controla el ancho general de la fila, el espaciado ajusta los espacios entre iconos, y el conteo de columnas determina cuántos iconos aparecen en cada fila (0 = automático).","layout_info_title":"Cómo Funcionan las Configuraciones de Diseño","layout_info_width":"Ancho de Fila: Controla cuánto espacio horizontal ocupa la fila en la tarjeta (porcentaje del ancho de la tarjeta)","layout_info_alignment":"Alineación de Fila: Solo se aplica cuando el Conteo de Columnas es 0. Determina cómo se posicionan los iconos dentro de la fila","layout_info_spacing":"Espaciado de Iconos: Establece la cantidad de espacio entre iconos","layout_info_columns":"Conteo de Columnas: Cuando se establece en 0, los iconos fluyen naturalmente basándose en el espacio disponible. Cuando se establece en un número, fuerza ese número exacto de columnas en un diseño de cuadrícula","layout_info_tip":"Usa Conteo de Columnas con cantidades consistentes de iconos por fila para el diseño más uniforme","control_right_side_description":"Controla cuándo se muestra u oculta el lado derecho basándose en el estado de una entidad","dynamic_icon":{"title":"Plantilla de Icono Dinámico","description":"Usa una plantilla para seleccionar dinámicamente el icono basándose en estados de entidades o condiciones.","enable":"Habilitar Plantilla de Icono Dinámico","template_label":"Plantilla de Icono"},"dynamic_color":{"title":"Plantilla de Color Dinámico","description":"Usa una plantilla para establecer dinámicamente el color del icono basándose en estados de entidades o valores.","enable":"Habilitar Plantilla de Color Dinámico","template_label":"Plantilla de Color"}},"tabs":{"general":"General","actions":"Acciones","appearance":"Apariencia","states":"Estados","active_state":"Estado activo","inactive_state":"Estado inactivo","icons":{"arrange_icon_rows":"Organizar Filas de Iconos"}},"alignments":{"flex-start":"Izquierda","center":"Centro","flex-end":"Derecha","space-between":"Espaciado entre","space-around":"Espaciado alrededor","space-evenly":"Espaciado uniforme"},"vertical_alignments":{"flex-start":"Superior","center":"Medio","flex-end":"Inferior"},"spacing":{"none":"Ninguno","small":"Pequeño","medium":"Mediano","large":"Grande"},"text_positions":{"below":"Debajo del Icono","beside":"Junto al Icono","none":"Sin Texto","top":"Arriba","left":"Izquierda","right":"Derecha"},"reset":{"size":"Restablecer tamaño predeterminado","color":"Restablecer Color","all":"Restablecer valores predeterminados"},"click_actions":{"toggle":"Alternar Entidad","more-info":"Mostrar Más Información","navigate":"Navegar a Ruta","url":"Abrir URL","call-service":"Llamar a Servicio","perform-action":"Realizar Acción","location-map":"Mostrar Mapa de Ubicación","assist":"Asistente de Voz","trigger":"Activar","none":"Sin Acción","descriptions":{"toggle":"Alterna el estado de la entidad.","more-info":"Abre el diálogo de más información de la entidad.","navigate":"Navega a la ruta de Lovelace especificada.","url":"Abre la URL especificada en una nueva pestaña.","call-service":"Llama al servicio de Home Assistant especificado.","perform-action":"Ejecuta una acción personalizada (ver documentación).","location-map":"Muestra la ubicación de la entidad en un mapa.","assist":"Abre el asistente de voz de Home Assistant.","trigger":"Activa la entidad (automatización, script, botón, etc.).","none":"No se realizará ninguna acción."}},"backgrounds":{"none":"Ninguno","circle":"Círculo","square":"Cuadrado","rounded_square":"Cuadrado Redondeado"},"container_widths":{"25":"25% de Ancho","50":"50% de Ancho","75":"75% de Ancho","100":"100% (Ancho Completo)"},"row_widths":{"25":"25% de Ancho","50":"50% de Ancho","75":"75% de Ancho","100":"100% (Ancho Completo)"},"interactions":{"single":"Toque/Clic Único","double":"Doble Toque/Clic","hold":"Mantener/Presión Larga"},"animations":{"title":"Animación de Icono","active_description":"Selecciona una animación para aplicar cuando este icono esté en estado activo.","inactive_description":"Selecciona una animación para aplicar cuando este icono esté en estado inactivo.","select_animation":"Seleccionar Animación","none":"Ninguna","pulse":"Pulso","vibrate":"Vibrar","rotate_left":"Rotar Izquierda","rotate_right":"Rotar Derecha","hover":"Flotante","fade":"Desvanecer","scale":"Escalar","bounce":"Rebotar","shake":"Agitar","tada":"Tada"},"row_vertical_alignments":{"top":"Arriba","center":"Centro","bottom":"Abajo"},"actions":{"single":"Acción de Clic Único","double":"Acción de Doble Clic","hold":"Acción de Mantener","single_description":"Acción realizada en un toque/clic único - interacción más común","double_description":"Acción realizada en un doble toque/clic - ayuda a prevenir activaciones accidentales","hold_description":"Acción realizada al mantener presionado por 500ms - ideal para acciones críticas","section_header":"Acciones de Interacción"}},"customize":{"title":"Personalizar diseño","description":"Personaliza el diseño, orden y añadir secciones a tu tarjeta","condition_prompt":"Selecciona \\"Mostrar\\" u \\"Ocultar\\" para configurar la condición de entidad","template_mode_active":"Usar Modo de Plantilla","color":"Color","layout":{"title":"Estilo de diseño","description":"Elija entre una vista de una o dos columnas para la tarjeta","header":"Ajustes de diseño","descriptions_header":"Descripciones de Diseño","single_column":"Columna Única","single_column_description":"Todas las secciones se apilan verticalmente en una columna - mejor para pantallas simples y vistas móviles.","double_column":"Doble Columna","double_column_description":"El contenido se divide en columnas izquierda y derecha - excelente para pantallas de escritorio con más información.","top_view":"Vista Superior","top_view_description":"Un diseño especializado con áreas definidas para imagen del vehículo en el centro y controles alrededor - ideal para crear un tablero de vehículo organizado.","half_full":"Mitad + Completo","half_full_description":"La primera fila se divide en dos columnas del 50% de ancho, y la segunda fila es una sola columna de ancho completo - útil para una pantalla superior enfocada con contenido más amplio abajo.","full_half":"Completo + Mitad","full_half_description":"La primera fila es una sola columna de ancho completo, y la segunda fila se divide en dos columnas del 50% de ancho - ideal para una sección superior prominente seguida de dos secciones más pequeñas.","template_visibility_help":"Usa una plantilla para determinar cuándo esta sección debe ser visible. Las plantillas te permiten usar la sintaxis de plantillas de Home Assistant para condiciones complejas.","enable_template_mode_help":"Habilitar Modo de Plantilla"},"layout_types":{"single":"Columna única","double":"Doble columna","dashboard":"Panel","half_full":"Mitad + lleno","full_half":"Completo + mitad"},"column_width":{"title":"Ancho de columnas","description":"Configure la relación de ancho entre las columnas izquierda y derecha","50_50":"Igual (50/50)","30_70":"Estrecha izquierda, ancha derecha (30/70)","70_30":"Ancha izquierda, estrecha derecha (70/30)","40_60":"Ligeramente más estrecha izquierda (40/60)","60_40":"Ligeramente más ancha izquierda (60/40)"},"top_view":{"header":"Ajustes del panel","description":"Configure los ajustes de espaciado y diseño para la vista de panel","side_margin":"Márgenes laterales","side_margin_help":"Márgenes en los lados de la vista en píxeles","middle_spacing":"Espaciado medio","middle_spacing_help":"Espacio entre columnas medias en píxeles","vertical_spacing":"Espaciado vertical","vertical_spacing_help":"Espacio entre filas en píxeles"},"sections":{"header":"Secciones de la tarjeta","arrangement_header":"Disposición de secciones","arrangement_desc_base":"Arrastre las secciones para organizar su orden en la tarjeta.","arrangement_desc_single_extra":"Todas las secciones se mostrarán en una sola columna.","arrangement_desc_double_extra":"En la vista de dos columnas, puede colocar cada sección en la columna izquierda o derecha.","arrangement_desc_dashboard_extra":"En la vista de panel, puede colocar las secciones alrededor de la imagen de su vehículo."},"section_labels":{"title":"Título","image":"Imagen del vehículo","info":"Información del vehículo","bars":"Todas las barras de sensores","icons":"Todas las líneas de iconos","section_break":"Ruptura de la sección"},"actions":{"collapse_margins":"Reducir márgenes","expand_margins":"Expandir márgenes","collapse_options":"Reducir opciones","expand_options":"Expandir opciones","add_break":"Agregar descanso de sección","delete_break":"Eliminar el descanso de la sección"},"css":{"header":"CSS Global","description":"Ingrese reglas CSS personalizadas aquí para anular el estilo predeterminado de la tarjeta. Estas reglas se aplicarán directamente a la tarjeta. Usar con precaución.","label":"CSS Personalizado","input_description":"Ingrese sus reglas CSS personalizadas aquí."},"conditions":{"header":"Lógica condicional","description":"Mostrar u ocultar esta sección según el estado de una entidad.","template_mode_description":"Usa una plantilla para determinar la visibilidad de la sección. Las plantillas te permiten usar la sintaxis de plantillas de Home Assistant para condiciones complejas.","type_label":"Tipo de condición","section_title":"Título de Sección","enable_section_title":"Habilitar Título de Sección","title_text":"Texto del Título","title_size":"Tamaño del Título","title_color":"Color del Título","enable_template_mode":"Habilitar Modo de Plantilla","use_template_description":"Usa una plantilla para determinar cuándo esta sección debe ser visible. Las plantillas te permiten usar la sintaxis de plantillas de Home Assistant para condiciones complejas.","info_row":"Fila de Información","entity_label":"Entidad de condición","state_label":"Estado de condición","state_description":"El valor de estado que activa la condición","types":{"none":"Ninguna (Mostrar siempre)","show":"Mostrar cuando...","hide":"Ocultar cuando..."}},"template":{"description":"Usa una plantilla para determinar cuándo esta sección debe ser visible. Las plantillas te permiten usar la sintaxis de plantillas de Home Assistant para condiciones complejas.","enable":"Habilitar Modo de Plantilla"},"template_mode":{"header":"Modo de Plantilla","description":"Usa una plantilla para controlar cuándo esta imagen se muestra u oculta basándose en lógica compleja, cálculos, o múltiples estados de entidades.","enable":"Habilitar Modo de Plantilla","disabled_notice":"(Deshabilitado - Modo de Plantilla Activo)","disabled_help":"Los controles de condición básica están deshabilitados cuando el Modo de Plantilla está activo. El Modo de Plantilla tiene prioridad sobre las condiciones básicas.","examples":{"show_when_charging":"Mostrar cuando está cargando","show_when_battery_low":"Mostrar cuando la batería está baja","multiple_conditions":"Múltiples condiciones","show_during_day":"Mostrar durante las horas del día","show_when_door_unlocked":"Mostrar cuando la puerta está desbloqueada"}},"section_title":{"header":"Título de Sección","enable":"Habilitar Título de Sección","text":"Texto del Título","size":"Tamaño del Título","color":"Color del Título","bold":"Negrita","italic":"Cursiva","uppercase":"Mayúsculas","strikethrough":"Tachado"},"margins":{"header":"Márgenes","top":"Margen superior","bottom":"Margen inferior"},"columns":{"left":"Columna izquierda","right":"Columna derecha","empty":"Soltar secciones aquí"},"dashboard":{"top":"Sección superior","top_middle":"Sección superior-media","left_middle":"Sección izquierda-media","middle":"Sección media","middle_empty":"Área de imagen del vehículo (Recomendado)","right_middle":"Sección derecha-media","bottom_middle":"Sección inferior-media","bottom":"Sección inferior"},"half_full":{"row1_col1":"Fila 1 - Columna Izquierda","row1_col2":"Fila 1 - Columna Derecha","row2_full":"Fila 2, ancho completo (100%)"},"full_half":{"row1_full":"Fila 1, ancho completo (100%)","row2_col1":"Fila 2 - Columna Izquierda","row2_col2":"Fila 2 - Columna Derecha"},"break_styles":{"blank":"En blanco (sin línea)","line":"Línea continua","double_line":"Línea doble","dotted":"Línea de puntos","double_dotted":"Línea de doble punta","shadow":"Gradiente de sombra"},"break_style":{"header":"Estilo de separación","style_label":"Estilo","thickness_label":"Grosor","width_percent_label":"Ancho (%)","color_label":"Color"}},"container_widths":{"25":"25% de Ancho","50":"50% de Ancho","75":"75% de Ancho","100":"100% (Ancho Completo)"},"row_widths":{"25":"25% de Ancho","50":"50% de Ancho","75":"75% de Ancho","100":"100% (Ancho Completo)"},"about":{"logo_alt":"Ultra Vehicle Card","developed_by":"Desarrollado por","discord_button":"Únete a nuestro Discord","docs_button":"Visita nuestra documentación","donate_button":"DEJAR UNA PROPINA (PAYPAL)","github_button":"Visita nuestro Github","support_title":"Apoya Ultra Vehicle Card","support_description":"¡Tus generosas propinas impulsan el desarrollo de características increíbles para esta tarjeta! Sin el apoyo de usuarios como tú, la innovación continua no sería posible."}},"about":{"logo_alt":"Ultra Vehicle Card","developed_by":"Desarrollado por","discord_button":"Únete a nuestro Discord","docs_button":"Visita nuestra documentación","donate_button":"DEJAR UNA PROPINA (PAYPAL)","github_button":"Visita nuestro Github","support_title":"Apoya Ultra Vehicle Card","support_description":"¡Tus generosas propinas impulsan el desarrollo de características increíbles para esta tarjeta! Sin el apoyo de usuarios como tú, la innovación continua no sería posible."},"custom_icons":{"title":"Iconos Personalizados","description":"Define iconos personalizados para diferentes estados.","icon_entity":"Entidad de Icono","default_icon":"Icono Predeterminado","state_icons":"Iconos de Estado","state":"Estado","icon":"Icono"},"custom_active_state_text":"Texto Personalizado de Estado Activo","custom_inactive_state_text":"Texto Personalizado de Estado Inactivo","image_settings":{"title":"Configuración de Imagen","description":"Configura la apariencia de la imagen principal.","type":"Tipo de Imagen","width":"Ancho de Imagen","crop":"Recorte de Imagen","entity":"Entidad de Imagen","entity_description":"Entidad que proporciona la URL de la imagen"},"entity_settings":{"entity":"Entidad","entity_description":"Selecciona una entidad para mostrar información de","name":"Nombre Personalizado","name_description":"Sobrescribe el nombre de la entidad (deja en blanco para usar el nombre amigable de la entidad)","show_icon":"Mostrar Icono","icon":"Icono","icon_color":"Color de Icono","name_color":"Color de Nombre","entity_color":"Color de Entidad","text_color":"Color de Texto","show_name":"Mostrar Nombre","show_name_description":"Muestra el nombre de la entidad antes del valor","template_mode":"Modo de Plantilla","template_mode_description":"Usa una plantilla para formatear el valor de la entidad","value_template":"Plantilla de Valor","template_header":"Plantilla de Valor","template_examples_header":"Ejemplos Comunes:","template_basic":"Valor básico","template_units":"Con unidades","template_round":"Redondear a 1 decimal","dynamic_icon_template":"Plantilla de Icono","dynamic_color_template":"Plantilla de Color","dynamic_icon_template_mode":"Habilitar Plantilla de Icono Dinámico","dynamic_color_template_mode":"Habilitar Plantilla de Color Dinámico"}}');var bt=a.t(vt,2);const ft=JSON.parse('{"editor":{"tabs":{"settings":"Paramètres","bars":"Barres","icons":"Icônes","customize":"Personnaliser","about":"À propos","info":"Informations","images":"Images"},"info":{"title":"Informations sur la carte","description":"Configurer les lignes d\'informations et les entités pour afficher les détails des véhicules comme l\'emplacement, le kilométrage, etc. Les éléments d\'informations s\'afficheront sur une seule ligne lorsque cela est possible, enveloppant plusieurs lignes dans des conteneurs étroits.","add_row":"Ajouter une ligne d\'info","add_entity":"Ajouter une entité d\'info","arrange_info_rows":"Organiser les lignes d\'informations","duplicate_row":"Dupliquer la ligne","delete_row":"Supprimer la ligne","expand_row":"Développer la ligne","collapse_row":"Réduire la ligne","duplicate_entity":"Dupliquer l\'entité","delete_entity":"Supprimer l\'entité","expand_entity":"Développer l\'entité","collapse_entity":"Réduire l\'entité","row_prefix":"Ligne d\'info","entity_prefix":"Entité","template_mode":"Mode modèle","template_mode_description":"Utilisez un modèle pour formater la valeur de l\'entité. Les modèles vous permettent d\'utiliser la syntaxe des modèles d\'assistant à domicile pour le formatage complexe.","template_examples_header":"Exemples courants:","dynamic_icon":{"title":"Modèle d\'icône dynamique","description":"Utilisez un modèle pour sélectionner dynamiquement l\'icône basée sur les états d\'entité ou les conditions.","enable":"Activer le modèle d\'icône dynamique"},"dynamic_color":{"title":"Modèle de couleur dynamique","description":"Utilisez un modèle pour définir dynamiquement les couleurs basées sur les états d\'entité ou les valeurs.","enable":"Activer le modèle de couleur dynamique"},"row_settings":{"header":"Paramètres de ligne","row_name":"Nom de ligne","row_name_description":"Nom personnalisé pour cette ligne d\'info (laisser vide pour utiliser le nom par défaut)","horizontal_alignment":"Alignement horizontal","alignment_description":"Alignement horizontal des entités dans cette ligne","vertical_alignment":"Alignement vertical","vertical_alignment_description":"Contrôle l\'alignement vertical des entités dans la ligne.","spacing":"Espacement","spacing_description":"Espacement entre les entités dans cette ligne","allow_wrap":"Permettre l\'habillage des éléments","allow_wrap_description":"Lorsque activé, les éléments passeront à la ligne suivante s\'ils ne tiennent pas sur une ligne. Lorsque désactivé, tous les éléments resteront sur une seule ligne."},"entity_settings":{"header":"Éléments d\'info","name":"Nom personnalisé","entity_description":"Sélectionnez une entité pour afficher les informations","name_description":"Remplacer le nom de l\'entité (laisser vide pour utiliser le nom convivial de l\'entité)","show_icon":"Afficher l\'icône","icon_color":"Couleur de l\'icône","name_color":"Couleur du nom","entity_color":"Couleur de l\'entité","icon_size":"Taille de l\'icône","name_size":"Taille du nom","value_size":"Taille de la valeur","size_settings":"Paramètres de taille","show_name":"Afficher le nom","show_name_description":"Afficher le nom de l\'entité avant la valeur","click_action":"Action de clic","navigation_path":"Chemin de navigation","navigation_path_description":"Chemin vers lequel naviguer lors du clic (ex: /lovelace/0)","url":"URL","url_description":"URL à ouvrir lors du clic","service":"Service","service_description":"Service à appeler (ex: light.turn_on)","service_data":"Données de service (JSON)"},"alignments":{"flex-start":"Début","center":"Centre","flex-end":"Fin","space-between":"Espace entre","space-around":"Espace autour","space-evenly":"Espace uniforme"},"spacing":{"none":"Aucun","small":"Petit","medium":"Moyen","large":"Grand"},"click_actions":{"more-info":"Plus d\'infos","navigate":"Naviguer","url":"Ouvrir URL","call-service":"Appeler service","none":"Aucun"},"row_vertical_alignments":{"top":"Haut","center":"Centre","bottom":"Bas"}},"settings_subtabs":{"general":"Général","action_images":"Images d\'action"},"action_images":{"title":"Paramètres des Images d\'Action","description":"Configurez les images à afficher lorsque des états d\'entités spécifiques sont atteints.","add_image":"Ajouter une Image d\'Action","no_images":"Aucune image d\'action configurée pour l\'instant. Ajoutez-en une pour commencer.","actions":{"drag":"Glisser pour réorganiser","duplicate":"Dupliquer","delete":"Supprimer","expand":"Développer","collapse":"Réduire"},"delete_confirm":"Êtes-vous sûr de vouloir supprimer cette image d\'action ?","entity_settings":"Paramètres de l\'Entité","image_settings":"Paramètres de l\'Image","entity_placeholder":"Sélectionnez une entité","state_placeholder":"Entrez la valeur d\'état","preview":{"no_entity":"Aucune entité sélectionnée","no_image":"Pas d\'image","any_state":"N\'importe quel état"},"trigger_entity":"Entité Déclencheuse","trigger_state":"État Déclencheur","entity_help":"Sélectionnez une entité à surveiller. L\'image sera affichée lorsque cette entité correspond à l\'état ci-dessous.","state_help":"Entrez la valeur d\'état qui déclenchera l\'affichage de cette image. Laissez vide pour correspondre à tout état.","image_type":{"title":"Type d\'Image","upload":"Télécharger l\'Image","url":"URL de l\'Image","entity":"Image de l\'Entité","none":"Aucune"},"template_mode":"Mode Modèle","template_description":"Utiliser un modèle pour déterminer quand cette image doit être affichée. Les modèles permettent d\'utiliser la syntaxe de modélisation de Home Assistant (comme {{ states.sensor.temperature.state > 70 }}) pour des conditions complexes.","template_label":"Modèle d\'affichage","template_help":"Entrez un modèle qui retourne vrai/faux. Cette image sera affichée lorsque le modèle s\'évalue à vrai. Utilisez la syntaxe Jinja2 : {{ states(...) }}","priority":{"label":"Priorité d\'Affichage","description":"Basé sur la Priorité utilise la première correspondance de haut en bas. Correspondance la Plus Récente utilise la dernière correspondance trouvée dans la liste.","options":{"priority":"Basé sur la Priorité","newest":"Correspondance la Plus Récente"}}},"images":{"title":"Images","description":"Configurez des images qui seront affichées selon des conditions ou des modèles.","add_image":"Ajouter une Image","no_images":"Aucune image configurée pour l\'instant. Ajoutez-en une pour commencer.","arrange_images":"Organiser les Images","name":"Nom (Optionnel)","image_type":"Type d\'Image","url":"URL d\'Image","image_entity":"Entité d\'Image","priority":"Priorité (0 = plus élevée)","priority_mode":"Mode de Priorité","timed_duration":"Durée d\'Affichage (secondes)","timed_duration_help":"Combien de temps cette image doit être affichée avant de revenir à l\'image principale.","duplicate":"Dupliquer l\'Image","delete":"Supprimer l\'Image","delete_confirm":"Êtes-vous sûr de vouloir supprimer cette image ?","image_types":{"none":"Aucune","default":"Véhicule par Défaut","url":"URL d\'Image","upload":"Télécharger une Image","entity":"Image d\'Entité","map":"Carte"},"priority_modes":{"order":"Priorité par Ordre","order_help":"Les images sont affichées selon leur ordre dans la liste (glissez pour réorganiser).","last_triggered":"Dernier Déclenché","last_triggered_help":"L\'image déclenchée le plus récemment restera affichée jusqu\'à ce qu\'une autre image soit déclenchée.","timed":"Images Chronométrées","timed_help":"Les images en dessous de la première s\'afficheront pendant une durée définie puis reviendront à l\'image principale."},"conditional_types":{"show":"Afficher Quand","hide":"Masquer Quand"},"tabs":{"general":"Général","conditional":"Conditionnel","appearance":"Apparence"},"conditional_help":"Configurez quand cette image doit être affichée selon les états d\'entités ou les modèles.","conditional_help_simple":"Configurez quand cette image doit être affichée selon les états d\'entités.","conditional_state_help":"L\'image sera affichée lorsque l\'entité est égale à cette valeur d\'état.","conditional_entity":"Entité Conditionnelle","conditional_state":"État Conditionnel","basic_conditions":"Conditions de Base","advanced_conditional":"Conditions de Modèle Avancées","advanced_help":"Utilisez des modèles pour des conditions complexes comme plusieurs entités ou des comparaisons mathématiques.","template_mode_active_help":"Utilisez des modèles pour des conditions complexes comme plusieurs entités ou des comparaisons mathématiques.","template_mode":{"header":"Mode Modèle","enable":"Activer le Mode Modèle","template":"Modèle"},"template_examples_header":"Exemples Courants:","width":"Largeur (%)","width_settings":"Paramètres de Largeur","crop_settings":"Paramètres de Recadrage","crop_help":"Les valeurs positives recadrent vers l\'intérieur, les valeurs négatives ajoutent du rembourrage vers l\'extérieur.","crop_top":"Haut","crop_right":"Droite","crop_bottom":"Bas","crop_left":"Gauche","fallback_image":"Image de Secours","fallback_help":"Cette image sera utilisée comme secours si aucun déclencheur ne correspond ou si un délai d\'attente se produit. Une seule image peut être de secours.","map_entity":"Entité de Localisation","map_entity_help":"Sélectionnez une entité avec des coordonnées latitude/longitude ou une adresse à afficher sur la carte.","target_entity":"Entité Cible","target_entity_description":"Sélectionnez l\'entité à cibler avec cette action","common":{"width":"Largeur d\'Image","width_description":"Largeur en pourcentage de la carte","width_over_100":"Les valeurs de plus de 100% peuvent aider à recadrer l\'espace vide autour des images","url_description":"Entrez l\'URL de l\'image"},"vehicle":{"crop":"Recadrer l\'Image"},"migration":{"title":"Images Héritées Détectées","description":"Nous avons trouvé des configurations d\'images héritées qui peuvent être migrées vers le nouveau format.","migrate_button":"Migrer Maintenant","success":"Images migrées avec succès !"}},"card_settings":{"title":"Titre de la carte","title_alignment":"Alignement du titre","title_size":"Taille du titre","title_color":"Couleur du Titre","title_color_description":"Couleur du titre de la carte","title_description":"Titre affiché en haut de la carte (optionnel)","title_alignment_description":"Comment le titre de la carte est aligné","title_size_description":"Taille du titre de la carte en pixels","colors":"Couleurs","card_background":"Arrière-plan de la Carte","card_background_description":"Couleur d\'arrière-plan de toute la carte","format_entities":"Formater les valeurs d\'entités","format_entities_description":"Active le formatage supplémentaire des valeurs d\'entités (ajoute des virgules, convertit les unités, etc.)","show_units":"Afficher les unités","show_units_description":"Afficher les unités à côté des valeurs","help_highlight":"Aider à mettre en évidence","help_highlight_description":"Afficher les points forts visuels lors de la commutation entre les onglets de l\'éditeur pour aider à identifier la section que vous modifiez","general":"Général","conditional_logic":"Logique Conditionnelle","card_visibility":"Visibilité de la Carte","card_visibility_description":"Afficher ou masquer toute la carte selon une condition d\'entité"},"vehicle_info":{"title":"Informations du Véhicule","location":{"title":"Entité de Localisation","description":"Sélectionne l\'entité qui affiche l\'emplacement actuel du véhicule.","show":"Afficher la Localisation","show_description":"Affiche l\'emplacement du véhicule"},"mileage":{"title":"Entité de Kilométrage","description":"Sélectionne l\'entité qui représente le kilométrage total ou l\'odomètre du véhicule.","show":"Afficher le Kilométrage","show_description":"Affiche le kilométrage du véhicule"},"car_state":{"title":"Entité d\'État du Véhicule","description":"Sélectionne l\'entité qui représente l\'état actuel du véhicule (ex. garé, en mouvement, en charge).","show":"Afficher l\'État du Véhicule","show_description":"Affiche l\'état du véhicule"}},"crop":{"title":"Recadrage d\'Image","top":"Haut","right":"Droit","bottom":"Bas","left":"Gauche","pixels":"px","help":"Entrez des valeurs en pixels (positives ou négatives) pour ajuster le recadrage et le remplissage"},"alignment":{"left":"Gauche","center":"Centre","right":"Droite"},"common":{"choose_file":"Choisir un Fichier","no_file_chosen":"Aucun fichier sélectionné","entity":"Entité","width":"Largeur","width_description":"Largeur en pourcentage de la carte","width_over_100":"Les valeurs de plus de 100% peuvent aider à recadrer l\'espace vide autour des images","none":"Aucun","default":"Par défaut","upload":"Télécharger","url":"URL","url_description":"URL pointant vers l\'image","reset":"Réinitialiser","condition_prompt":"Sélectionnez \\"afficher\\" ou \\"masquer\\" pour configurer la condition d\'entité","bold":"Gras","italic":"Italique","uppercase":"Majuscules","strikethrough":"Barré"},"conditions":{"condition_type":"Type de Condition","show_card_if":"Afficher la Carte Si","hide_card_if":"Masquer la Carte Si","entity_description":"Sélectionnez l\'entité à vérifier pour la condition","state":"État","state_description":"La valeur d\'état qui déclenche la condition"},"bars":{"title":"Barres de Pourcentage","description":"Ajoute des barres de pourcentage pour afficher des valeurs comme le niveau de carburant, la charge de la batterie ou l\'autonomie. Chaque barre peut afficher une valeur de pourcentage principale avec des étiquettes optionnelles à gauche et à droite.","add":"Ajouter une Nouvelle Barre","duplicate":"Dupliquer la Barre","delete":"Supprimer la Barre","expand":"Développer la Barre","collapse":"Réduire la Barre","no_entity":"Aucune entité sélectionnée","bar_prefix":"Barre","template":{"description":"Utilisez un modèle pour formater le texte affiché, convertir des unités ou afficher des valeurs calculées.","enable":"Activer le mode modèle","template_label":"Modèle","helper_text":"Utilisez la syntaxe de modélisation de Home Assistant. Exemples :\\n• {{ states(\'sensor.temperature\') | float * 1.8 + 32 }} °F\\n• {{ now().strftime(\\"%b %d, %H:%M\\") }}","examples_header":"Exemples courants:","examples":{"temperature":"{{ states(\'sensor.temperature\') | float * 1.8 + 32 }}°F - Convertir Celsius en Fahrenheit","datetime":"{{ now().strftime(\\"%b %d, %H:%M\\") }} - Formater la date/heure actuelle","power":"{{ \'Charge à \' + states(\'sensor.ev_power\') + \' kW\' }} - Combiner texte et valeur de capteur"}},"bar_radius":{"round":"Arrondi","square":"Carré","rounded-square":"Carré Arrondi"},"tabs":{"arrange_bars":"Organiser les Barres","config":"Configuration","colors":"Couleurs","animation":"Animation"},"settings":{"header":"Configuration de la Barre","entity":"Entité de la Barre","entity_description":"Sélectionnez une entité qui renvoie une valeur en pourcentage (0-100). Cela contrôle le remplissage de la barre.","limit_entity":"Entité de Limite (optionnel)","limit_entity_description":"Optionnel: Ajouter un indicateur de limite vertical sur la barre (ex. limite de charge pour batterie VE).","limit_color":"Couleur de l\'Indicateur de Limite","limit_color_description":"Couleur de la ligne verticale indiquant la position de la limite sur la barre.","bar_size":"Taille de la Barre","bar_size_description":"Définit l\'épaisseur/hauteur de la barre de progression.","bar_radius":"Rayon de la Barre","bar_radius_description":"Forme des coins de la barre de progression","width":"Largeur de la Barre","width_description":"Définit la largeur de la barre en pourcentage de la largeur de la carte.","alignment":"Alignement des Étiquettes","alignment_description":"Comment les étiquettes gauche et droite s\'alignent entre elles.","show_percentage":"Afficher le Pourcentage","show_percentage_description":"Afficher la valeur en pourcentage à l\'intérieur de la barre"},"percentage":{"header":"Texte du Pourcentage","display_header":"Affichage du Texte de Pourcentage","display_description":"Contrôlez la visibilité et l\'apparence des valeurs de pourcentage affichées directement sur la barre. Ces nombres fournissent un indicateur visuel clair du niveau actuel.","text_size":"Taille du Texte","calculation_header":"Calcul du Pourcentage","calculation_description":"Configurez comment le niveau de remplissage en pourcentage de la barre est calculé en utilisant l\'une des options ci-dessous.","type_header":"Calcul du Pourcentage","type_label":"Type de Pourcentage","type_description":"Comment calculer la valeur de pourcentage affichée dans la barre","type_entity":"Entité (0-100)","type_attribute":"Attribut d\'Entité","type_template":"Mode Modèle","type_difference":"Différence (Quantité/Total)","amount_entity":"Entité de Quantité","amount_description":"Entité représentant la quantité/valeur actuelle (numérateur)","total_entity":"Entité de Total","total_description":"Entité représentant la quantité/maximum total (dénominateur)"},"left_side":{"header":"Côté Gauche","section_description":"Configurez le titre et la valeur de l\'entité affichés du côté gauche de la barre. Ceci est utile pour afficher des étiquettes comme \'Autonomie\' ou \'Batterie\' avec leurs valeurs.","toggle_description":"Afficher ou masquer le côté gauche de l\'étiquette de la barre","title":"Titre Gauche","title_description":"Étiquette facultative affichée sur le côté gauche sous la barre.","entity":"Entité Gauche","entity_description":"Entité dont la valeur est affichée sur le côté gauche de la barre.","alignment_description":"Contrôle l\'alignement de cette étiquette sous la barre.","title_size":"Taille du Titre","value_size":"Taille de la Valeur","hidden_message":"Le côté gauche est masqué"},"right_side":{"header":"Côté Droit","section_description":"Configurez le titre et la valeur de l\'entité affichés du côté droit de la barre. C\'est idéal pour les informations complémentaires comme \'Temps jusqu\'à Plein\' ou les mesures secondaires.","toggle_description":"Afficher ou masquer le côté droit de l\'étiquette de la barre","title":"Titre Droit","title_description":"Étiquette facultative affichée sur le côté droit sous la barre.","entity":"Entité Droite","entity_description":"Entité dont la valeur est affichée sur le côté droit de la barre.","alignment_description":"Contrôle l\'alignement de cette étiquette sous la barre.","title_size":"Taille du Titre","value_size":"Taille de la Valeur","hidden_message":"Le côté droit est masqué"},"colors":{"header":"Couleurs","bar_color":"Couleur de la Barre","background_color":"Couleur d\'Arrière-plan","border_color":"Couleur de Bordure","limit_indicator_color":"Couleur de l\'Indicateur de Limite","left_title_color":"Couleur du Titre Gauche","left_value_color":"Couleur de la Valeur Gauche","right_title_color":"Couleur du Titre Droit","right_value_color":"Couleur de la Valeur Droite","percentage_text_color":"Couleur du Texte de Pourcentage","reset_color":"Réinitialiser la couleur par défaut"},"gradient":{"header":"Mode Dégradé","description":"Créez de belles transitions de couleur sur vos barres de progression. Idéal pour afficher les niveaux de batterie, les jauges de carburant ou tout indicateur d\'état nécessitant une mise en valeur visuelle.","toggle":"Utiliser un Dégradé","toggle_description":"Utiliser un dégradé pour la barre de progression au lieu d\'une couleur unie","display_mode":"Mode d\'Affichage du Dégradé","display_mode_full":"Complet","display_mode_value_based":"Basé sur la Valeur","display_mode_cropped":"Recadré","display_mode_description":"Complet: Affiche tout le dégradé. Basé sur la Valeur: Affiche le dégradé jusqu\'à la valeur actuelle.","editor_header":"Éditeur de Dégradé","add_stop":"Ajouter un Arrêt"},"animation":{"header":"Animation d\'Action","description":"Ajoute des animations à la barre lorsqu\'une entité spécifique atteint un état spécifique. Parfait pour afficher les états de charge, les états d\'alarme et plus encore.","pro_tip":"Astuce Pro: Pour des animations \'toujours actives\', sélectionne un type d\'animation mais laisse les champs d\'entité et d\'état vides. Essaie les animations \'Bulles\' et \'Remplissage\'!","entity":"Entité d\'Animation","entity_description":"Entité qui déclenche l\'animation lorsqu\'elle correspond à l\'état spécifié","state":"État de l\'Entité","state_description":"Lorsque l\'état de l\'entité correspond à cette valeur, l\'animation sera déclenchée","type":"Type d\'Animation","type_description":"L\'effet d\'animation à afficher lorsque l\'état de l\'entité correspond","select_entity_prompt":"Sélectionnez une Entité et saisissez l\'état qui déclenchera l\'animation (exemples : \\"charging\\", \\"on\\", \\"idle\\")","action_entity":"Entité d\'action","action_state":"État d\'action","action_description":"Cette animation remplacera l\'animation régulière lorsque l\'entité spécifiée est dans un état spécifique.","action_entity_prompt":"Sélectionnez une entité d\'action et l\'état pour définir lorsque cette animation devrait remplacer l\'animation régulière"},"bar_sizes":{"thin":"Fine","regular":"Normale","thick":"Épaisse","thiccc":"Très Épaisse"},"bar_widths":{"25":"25% de Largeur","50":"50% de Largeur","75":"75% de Largeur","100":"100% (Pleine Largeur)"},"bar_alignments":{"space-between":"Espace Entre","flex-start":"Gauche","center":"Centre","flex-end":"Droite"},"bar_styles":{"flat":"Plat (Par défaut)","glossy":"Brillant","embossed":"En relief","inset":"Encastré","gradient":"Superposition de dégradé","neon":"Lueur néon","outline":"Contour","glass":"Verre","metallic":"Métallique","neumorphic":"Neumorphique"},"animation_types":{"none":"Aucune","charging-lines":"Charge (Lignes Diagonales)","pulse":"Pulsation","blinking":"Clignotement","bouncing":"Rebond","glow":"Lueur","rainbow":"Arc-en-ciel","bubbles":"Bulles","fill":"Remplissage"},"custom_bar_settings":{"title":"Paramètres de Barre Personnalisés","description":"Définissez des configurations personnalisées pour des barres individuelles.","name":"Nom de la Barre","entity":"Entité","unit":"Unité","min":"Valeur Minimale","max":"Valeur Maximale","thresholds":"Seuils","severity":"Carte de Sévérité"},"template_mode":{"header":"Mode Modèle","description":"Utilisez un modèle pour formater le texte affiché, convertir les unités ou afficher des valeurs calculées.","enable":"Activer le Mode Modèle","template":"Modèle"}},"icons":{"title":"Icônes de Carte","description":"Ajoutez des lignes d\'icônes pour afficher plusieurs icônes dans votre carte. Chaque ligne peut être configurée avec différents paramètres. Note : Les lignes d\'icônes et l\'ordre des sections peuvent être réorganisés dans l\'onglet Personnaliser.","add_row":"Ajouter une Ligne d\'Icônes","duplicate_row":"Dupliquer la Ligne","delete_row":"Supprimer la Ligne","expand_row":"Développer la Ligne","collapse_row":"Réduire la Ligne","no_row":"Aucune ligne d\'icônes ajoutée","row_prefix":"Ligne","icon_prefix":"Icône","add_icon":"Ajouter une Icône","duplicate_icon":"Dupliquer l\'Icône","delete_icon":"Supprimer l\'Icône","template_mode":"Mode modèle","template_mode_active_description":"Utilisez un modèle pour déterminer quand cette icône doit être active. Les modèles vous permettent d\'utiliser la syntaxe des modèles d\'assistant à domicile pour des conditions complexes.","template_mode_inactive_description":"Utilisez un modèle pour déterminer quand cette icône doit être inactive. Les modèles vous permettent d\'utiliser la syntaxe des modèles d\'assistant à domicile pour des conditions complexes.","template_examples_header":"Exemples courants:","text_formatting":"Formatage du Texte d\'État","name_formatting":"Formatage du Nom","dynamic_icon":{"title":"Modèle d\'Icône Dynamique","description":"Utilisez un modèle pour sélectionner dynamiquement l\'icône basée sur les états d\'entités ou les conditions.","enable":"Activer le Modèle d\'Icône Dynamique"},"dynamic_color":{"title":"Modèle de Couleur Dynamique","description":"Utilisez un modèle pour définir dynamiquement la couleur de l\'icône basée sur les états d\'entités ou les valeurs.","enable":"Activer le Modèle de Couleur Dynamique"},"enable_template_mode":"Activer le mode modèle","row_settings":{"header":"Paramètres de Ligne","width":"Largeur de Ligne","width_description":"Largeur de la ligne en pourcentage de la largeur de la carte","alignment":"Alignement de la Ligne","alignment_description":"Comment aligner les icônes dans cette ligne","spacing":"Espacement des Icônes","spacing_description":"Quantité d\'espace entre les icônes dans cette ligne","columns":"Nombre de Colonnes","columns_description":"Nombre de colonnes de taille uniforme dans la ligne (0 = distribution automatique basée sur le contenu)","confirmation_mode":"Mode de Confirmation","confirmation_mode_description":"Nécessite deux pressions/clics pour activer les icônes dans cette ligne, évitant les interactions accidentelles","layout_info_title":"Comment fonctionnent les paramètres de mise en page"},"icon_settings":{"header":"Paramètres d\'Icône","entity":"Entité","entity_description":"Entité à afficher avec cette icône","icon":"Icône","icon_description":"Sélectionnez une icône ou entrez une personnalisée","name":"Nom","name_description":"Nom personnalisé à afficher sous l\'icône (utilise le nom de l\'entité par défaut si non défini)","interaction_type":"Type d\'Interaction","interaction_type_description":"Choisissez comment les utilisateurs interagissent avec cette icône pour déclencher des actions","show_name":"Afficher le Nom","show_name_description":"Afficher le texte du nom sous l\'icône","show_state":"Afficher l\'État","show_state_description":"Afficher l\'état de l\'entité sous l\'icône","show_units":"Afficher les Unités","show_units_description":"Inclure les unités lors de l\'affichage de l\'état","text_position":"Position du Texte","text_position_description":"Où placer le texte du nom et de l\'état par rapport à l\'icône","click_action":"Action au Clic","service":"Service","service_description":"Service à appeler (ex. light.turn_on)","service_data":"Données du Service (JSON)","service_data_description":"Données JSON à envoyer avec l\'appel de service","action":"Action (JSON / Service)","action_description":"Configuration d\'action avancée (voir docs)","navigation_path":"Chemin de Navigation","navigation_path_description":"Chemin vers lequel naviguer (ex. /lovelace/dashboard)","navigation_target_selector":"Cible de Navigation","navigation_target_description":"Sélectionnez parmi les tableaux de bord, vues ou pages système disponibles","url":"URL","url_description":"URL à ouvrir dans un nouvel onglet","automation_entity":"Entité d\'Automatisation","automation_entity_description":"Automatisation à déclencher lors du clic"},"icon_appearance":{"header":"Apparence de l\'Icône","icon":"Spécifique à l\'Icône","general":"Apparence Générale","active":"État Actif","inactive":"État Inactif","state_conditions":"Conditions d\'État","advanced":"Paramètres Avancés","icon_size":"Taille de l\'Icône","icon_size_description":"Taille de l\'icône en pixels","text_size":"Taille du Texte","text_size_description":"Taille du texte du nom/état en pixels","name_size":"Taille de nom","name_size_description":"Taille du texte du nom de l\'entité en pixels","text_alignment":"Alignement du Texte","text_alignment_description":"Comment aligner le texte sous l\'icône","icon_background":"Fond d\'Icône","icon_background_description":"Ajouter une forme d\'arrière-plan derrière l\'icône","icon_background_color":"Couleur de Fond d\'Icône","icon_background_color_description":"Couleur de l\'arrière-plan derrière l\'icône","container_background_color":"Couleur de Fond du Conteneur","container_background_color_description":"Couleur de l\'arrière-plan derrière le conteneur complet d\'icône","text_appearance":"Apparence du Texte","container":{"header":"Apparence du Conteneur","vertical_alignment":"Alignement Vertical","vertical_alignment_description":"Aligne l\'icône et le texte verticalement dans le conteneur.","width":"Largeur du Conteneur","width_description":"Définit la largeur du conteneur d\'icône par rapport à la ligne.","background":"Forme d\'Arrière-plan du Conteneur","background_description":"Choisissez une forme d\'arrière-plan pour tout le conteneur d\'icône."},"show_when_active":"Afficher l\'Icône Lorsqu\'Active","show_when_active_description":"Afficher cette icône uniquement lorsqu\'elle est dans un état actif","template_mode":"Mode Modèle","template_description":"Utilisez un modèle pour déterminer l\'état actif/inactif. Les modèles permettent d\'utiliser la syntaxe de modèles de Home Assistant (comme {{ states.sensor.temperature.state > 70 }}) pour des conditions complexes.","active_template":"Modèle Actif","active_template_description":"Modèle qui retourne vrai quand l\'icône doit être active.","active_state":"État Actif","active_state_description":"Chaîne d\'état représentant \\"actif\\".","active_state_text":"Texte d\'État Actif Personnalisé","active_state_text_description":"Remplace le texte affiché lorsque l\'icône est active. Laissez vide pour utiliser l\'état réel.","inactive_template":"Modèle Inactif","inactive_template_description":"Modèle qui retourne vrai quand l\'icône doit être inactive.","inactive_state":"État Inactif","inactive_state_description":"Chaîne d\'état représentant \\"inactif\\".","inactive_state_text":"Texte d\'État Inactif Personnalisé","inactive_state_text_description":"Remplace le texte affiché lorsque l\'icône est inactive. Laissez vide pour utiliser l\'état réel.","active_icon":"Icône Active","inactive_icon":"Icône Inactive","active_icon_color":"Couleur de l\'Icône Active","inactive_icon_color":"Couleur de l\'Icône Inactive","active_name_color":"Couleur du Nom Actif","inactive_name_color":"Couleur du Nom Inactif","active_state_color":"Couleur de l\'État Actif","inactive_state_color":"Couleur de l\'État Inactif","show_icon_active":"Afficher l\'Icône Lorsqu\'Active","show_icon_active_description":"Afficher l\'icône lorsque l\'état est actif.","show_icon_inactive":"Afficher l\'Icône Lorsqu\'Inactive","show_icon_inactive_description":"Afficher l\'icône lorsque l\'état est inactif.","custom_active_state_text":"Texte d\'État Actif Personnalisé","custom_inactive_state_text":"Texte d\'État Inactif Personnalisé","action_description":"Action à effectuer lorsque l\'icône est cliquée.","show_name_active":"Afficher le Nom Lorsqu\'Actif","show_name_active_description":"Afficher le nom lorsque l\'état est actif.","show_name_inactive":"Afficher le Nom Lorsqu\'Inactif","show_name_inactive_description":"Afficher le nom lorsque l\'état est inactif.","show_state_active":"Afficher l\'État Lorsqu\'Actif","show_state_active_description":"Afficher l\'état lorsque l\'état est actif.","show_state_inactive":"Afficher l\'État Lorsqu\'Inactif","show_state_inactive_description":"Afficher l\'état lorsque l\'état est inactif.","use_entity_color_for_icon":"Utiliser la couleur de l\'entité pour l\'icône","use_entity_color_for_icon_description":"Utiliser l\'attribut de couleur de l\'entité pour l\'icône lorsqu\'elle est disponible","use_entity_color_for_icon_background":"Utiliser la couleur de l\'entité pour l\'arrière-plan de l\'icône","use_entity_color_for_icon_background_description":"Utilisez l\'attribut de couleur de l\'entité pour l\'arrière-plan de l\'icône lorsqu\'il est disponible","use_entity_color_for_container_background":"Utiliser la couleur de l\'entité pour le conteneur","use_entity_color_for_container_background_description":"Utilisez l\'attribut de couleur de l\'entité pour l\'arrière-plan du conteneur lorsqu\'il est disponible","dynamic_icon_template":"Modèle d\'Icône Dynamique","dynamic_icon_template_description":"Utilisez un modèle pour sélectionner dynamiquement l\'icône basée sur les états d\'entités ou les conditions.","enable_dynamic_icon_template":"Activer le Modèle d\'Icône Dynamique","dynamic_color_template":"Modèle de Couleur Dynamique","dynamic_color_template_description":"Utilisez un modèle pour définir dynamiquement la couleur de l\'icône basée sur les états d\'entités ou les valeurs.","enable_dynamic_color_template":"Activer le Modèle de Couleur Dynamique","size_settings":"Paramètres de Taille","value_size":"Taille de la Valeur","state_text_formatting":"Formatage du Texte d\'État","row_name":"Nom de la Ligne","row_name_description":"Nom personnalisé pour cette ligne d\'icônes (laisser vide pour utiliser le nom par défaut)","width_description":"Contrôle la quantité de largeur disponible que cette ligne utilisera. Configurez comment cette ligne d\'icônes s\'affiche. La largeur contrôle la largeur globale de la ligne, l\'espacement ajuste les écarts entre les icônes, et le nombre de colonnes détermine combien d\'icônes apparaissent dans chaque ligne (0 = automatique).","layout_info_title":"Comment Fonctionnent les Paramètres de Mise en Page","layout_info_width":"Largeur de Ligne : Contrôle l\'espace horizontal que la ligne occupe dans la carte (pourcentage de la largeur de la carte)","layout_info_alignment":"Alignement de Ligne : S\'applique uniquement quand le Nombre de Colonnes est 0. Détermine comment les icônes sont positionnées dans la ligne","layout_info_spacing":"Espacement des Icônes : Définit la quantité d\'espace entre les icônes","layout_info_columns":"Nombre de Colonnes : Quand défini à 0, les icônes s\'organisent naturellement selon l\'espace disponible. Quand défini à un nombre, force ce nombre exact de colonnes dans une mise en page en grille","layout_info_tip":"Utilisez le Nombre de Colonnes avec des quantités cohérentes d\'icônes par ligne pour la mise en page la plus uniforme","control_right_side_description":"Contrôler quand le côté droit est affiché ou masqué selon l\'état de l\'entité","dynamic_icon":{"title":"Modèle d\'Icône Dynamique","description":"Utilisez un modèle pour sélectionner dynamiquement l\'icône basée sur les états d\'entités ou les conditions.","enable":"Activer le Modèle d\'Icône Dynamique","template_label":"Modèle d\'Icône"},"dynamic_color":{"title":"Modèle de Couleur Dynamique","description":"Utilisez un modèle pour définir dynamiquement la couleur de l\'icône basée sur les états d\'entités ou les valeurs.","enable":"Activer le Modèle de Couleur Dynamique","template_label":"Modèle de Couleur"}},"tabs":{"general":"Général","actions":"Actions","appearance":"Apparence","states":"États","active_state":"État Actif","inactive_state":"État Inactif","icons":{"arrange_icon_rows":"Organiser les Lignes d\'Icônes"}},"alignments":{"flex-start":"Gauche","center":"Centre","flex-end":"Droite","space-between":"Espace Entre","space-around":"Espace Autour","space-evenly":"Espacement Égal"},"vertical_alignments":{"flex-start":"Haut","center":"Milieu","flex-end":"Bas"},"spacing":{"none":"Aucun","small":"Petit","medium":"Moyen","large":"Grand"},"text_positions":{"below":"Sous l\'Icône","beside":"À Côté de l\'Icône","none":"Pas de Texte","top":"En Haut","left":"À Gauche","right":"À Droite"},"reset":{"size":"Réinitialiser à la taille par défaut","color":"Réinitialiser à la couleur par défaut","all":"Réinitialiser aux valeurs par défaut"},"click_actions":{"toggle":"Basculer l\'Entité","more-info":"Afficher Plus d\'Informations","navigate":"Naviguer vers un Chemin","url":"Ouvrir une URL","call-service":"Appeler un Service","perform-action":"Exécuter une Action","location-map":"Afficher la Carte de Localisation","assist":"Assistant Vocal","trigger":"Déclencher","none":"Aucune Action","descriptions":{"toggle":"Bascule l\'état de l\'entité.","more-info":"Ouvre la boîte de dialogue d\'informations de l\'entité.","navigate":"Navigue vers le chemin Lovelace spécifié.","url":"Ouvre l\'URL spécifiée dans un nouvel onglet.","call-service":"Appelle le service Home Assistant spécifié.","perform-action":"Exécute une action personnalisée (voir documentation).","location-map":"Affiche la localisation de l\'entité sur une carte.","assist":"Ouvre l\'assistant vocal Home Assistant.","trigger":"Déclenche ou bascule l\'entité (automatisation, script, bouton, verrou, etc.).","none":"Aucune action ne sera effectuée."}},"backgrounds":{"none":"Aucun","circle":"Cercle","square":"Carré","rounded_square":"Carré Arrondi"},"container_widths":{"25":"25% de Largeur","50":"50% de Largeur","75":"75% de Largeur","100":"100% (Pleine Largeur)"},"row_widths":{"25":"25% de Largeur","50":"50% de Largeur","75":"75% de Largeur","100":"100% (Pleine Largeur)"},"interactions":{"single":"Appui/Clic Simple","double":"Double Appui/Clic","hold":"Maintenir/Pression Longue"},"animations":{"title":"Animation d\'Icône","active_description":"Sélectionnez une animation à appliquer quand cette icône est dans l\'état actif.","inactive_description":"Sélectionnez une animation à appliquer quand cette icône est dans l\'état inactif.","select_animation":"Sélectionner une Animation","none":"Aucune","pulse":"Pulsation","vibrate":"Vibration","rotate_left":"Rotation Gauche","rotate_right":"Rotation Droite","hover":"Survol","fade":"Fondu","scale":"Échelle","bounce":"Rebond","shake":"Secousse","tada":"Tada"},"row_vertical_alignments":{"top":"Haut","center":"Centre","bottom":"Bas"},"actions":{"single":"Action Clic Simple","double":"Action Double Clic","hold":"Action Maintien","single_description":"Action effectuée sur un appui/clic simple - interaction la plus courante","double_description":"Action effectuée sur un double appui/clic - aide à prévenir les déclenchements accidentels","hold_description":"Action effectuée lors du maintien pendant 500ms - idéale pour les actions critiques","section_header":"Actions d\'Interaction"}},"customize":{"title":"Personnaliser la mise en page","description":"Personnalisez la mise en page, commandez et ajoutez des sections à votre carte","condition_prompt":"Sélectionnez \\"afficher\\" ou \\"masquer\\" pour configurer la condition d\'entité","template_mode_active":"Utiliser le Mode Modèle","layout":{"title":"Style de mise en page","description":"Choisissez entre une vue à une ou deux colonnes pour la carte","header":"Paramètres de mise en page","descriptions_header":"Descriptions de Mise en Page","single_column":"Colonne Simple","single_column_description":"Toutes les sections sont empilées verticalement dans une seule colonne - idéal pour les affichages simples et les vues mobiles.","double_column":"Double Colonne","double_column_description":"Les sections sont réparties entre deux colonnes pour une utilisation efficace de l\'espace horizontal - idéal pour les écrans plus larges.","top_view":"Vue Supérieure","top_view_description":"L\'image est affichée de manière proéminente en haut avec les autres sections organisées dans des positions configurables autour d\'elle.","half_full":"Moitié + Plein","half_full_description":"La ligne supérieure a deux sections demi-largeur, la ligne inférieure a une section pleine largeur - parfait pour les mises en page équilibrées.","full_half":"Plein + Moitié","full_half_description":"La ligne supérieure a une section pleine largeur, la ligne inférieure a deux sections demi-largeur - parfait pour mettre en évidence le contenu supérieur."},"layout_types":{"single":"Colonne unique","double":"Double colonne","dashboard":"Tableau de bord","half_full":"Demi + plein","full_half":"Full + moitié"},"column_width":{"title":"Largeur des colonnes","description":"Configurez le rapport de largeur entre les colonnes gauche et droite","50_50":"Égal (50/50)","30_70":"Étroite gauche, large droite (30/70)","70_30":"Large gauche, étroite droite (70/30)","40_60":"Légèrement plus étroite gauche (40/60)","60_40":"Légèrement plus large gauche (60/40)"},"top_view":{"header":"Paramètres du tableau de bord","description":"Configurez les paramètres d\'espacement et de mise en page pour la vue tableau de bord","side_margin":"Marges latérales","side_margin_help":"Marges sur les côtés de la vue en pixels","middle_spacing":"Espacement moyen","middle_spacing_help":"Espace entre les colonnes moyennes en pixels","vertical_spacing":"Espacement vertical","vertical_spacing_help":"Espace entre les lignes en pixels"},"sections":{"header":"Sections de la carte","arrangement_header":"Disposition des sections","arrangement_desc_base":"Faites glisser les sections pour organiser leur ordre sur la carte.","arrangement_desc_single_extra":"Toutes les sections seront affichées dans une seule colonne.","arrangement_desc_double_extra":"Dans la vue à deux colonnes, vous pouvez placer chaque section dans la colonne gauche ou droite.","arrangement_desc_dashboard_extra":"Dans la vue tableau de bord, vous pouvez placer les sections autour de l\'image de votre véhicule."},"section_labels":{"title":"Titre","image":"Image du véhicule","info":"Informations du véhicule","bars":"Toutes les barres de capteurs","icons":"Toutes les lignes d\'icônes","section_break":"Break de la section"},"actions":{"collapse_margins":"Réduire les marges","expand_margins":"Étendre les marges","collapse_options":"Réduire les options","expand_options":"Étendre les options","add_break":"Ajouter la pause de la section","delete_break":"Supprimer la pause de la section"},"css":{"header":"CSS Global","description":"Entrez des règles CSS personnalisées ici pour remplacer le style par défaut de la carte. Ces règles seront appliquées directement à la carte. À utiliser avec précaution.","label":"CSS Personnalisé","input_description":"Entrez vos règles CSS personnalisées ici."},"conditions":{"header":"Logique conditionnelle","description":"Afficher ou masquer cette section en fonction de l\'état d\'une entité.","template_mode_description":"Utilisez un modèle pour déterminer la visibilité de la section. Les modèles vous permettent d\'utiliser la syntaxe de modèles de Home Assistant pour des conditions complexes.","type_label":"Type de condition","section_title":"Titre de Section","enable_section_title":"Activer le Titre de Section","title_text":"Texte du Titre","title_size":"Taille du Titre","title_color":"Couleur du Titre","enable_template_mode":"Activer le Mode Modèle","use_template_description":"Utilisez un modèle pour déterminer quand cette section doit être visible. Les modèles vous permettent d\'utiliser la syntaxe de modèles de Home Assistant pour des conditions complexes.","info_row":"Ligne d\'Information","entity_label":"Entité de condition","state_label":"État de condition","state_description":"La valeur d\'état qui déclenche la condition","types":{"none":"Aucune (Toujours afficher)","show":"Afficher quand...","hide":"Masquer quand..."}},"template":{"description":"Utilisez un modèle pour déterminer quand cette section doit être visible. Les modèles vous permettent d\'utiliser la syntaxe de modèles de Home Assistant pour des conditions complexes.","enable":"Activer le Mode Modèle"},"template_mode":{"header":"Mode Modèle","description":"Utilisez un modèle pour contrôler quand cette image est affichée ou masquée selon une logique complexe, des calculs, ou plusieurs états d\'entités.","enable":"Activer le Mode Modèle","disabled_notice":"(Désactivé - Mode Modèle Actif)","disabled_help":"Les contrôles de condition de base sont désactivés quand le Mode Modèle est actif. Le Mode Modèle a la priorité sur les conditions de base.","examples":{"show_when_charging":"Afficher pendant la charge","show_when_battery_low":"Afficher quand la batterie est faible","multiple_conditions":"Conditions multiples","show_during_day":"Afficher pendant les heures de jour","show_when_door_unlocked":"Afficher quand la porte est déverrouillée"}},"section_title":{"header":"Titre de Section","enable":"Activer le Titre de Section","text":"Texte du Titre","size":"Taille du Titre","color":"Couleur du Titre","bold":"Gras","italic":"Italique","uppercase":"Majuscules","strikethrough":"Barré"},"margins":{"header":"Marges","top":"Marge supérieure","bottom":"Marge inférieure"},"columns":{"left":"Colonne gauche","right":"Colonne droite","empty":"Déposer les sections ici"},"dashboard":{"top":"Section supérieure","top_middle":"Section supérieure-moyenne","left_middle":"Section gauche-moyenne","middle":"Section moyenne","middle_empty":"Zone d\'image du véhicule (Recommandé)","right_middle":"Section droite-moyenne","bottom_middle":"Section inférieure-moyenne","bottom":"Section inférieure"},"half_full":{"row1_col1":"Rangée 1 - Colonne Gauche","row1_col2":"Rangée 1 - Colonne Droite","row2_full":"Rangée 2, pleine largeur (100%)"},"full_half":{"row1_full":"Rangée 1, pleine largeur (100%)","row2_col1":"Rangée 2 - Colonne Gauche","row2_col2":"Rangée 2 - Colonne Droite"},"break_styles":{"blank":"Vide (pas de ligne)","line":"Ligne continue","double_line":"Double ligne","dotted":"Ligne pointillée","double_dotted":"Ligne à double pointillé","shadow":"Gradient d\'ombre"},"break_style":{"header":"Casse","style_label":"Style","thickness_label":"Épaisseur","width_percent_label":"Largeur (%)","color_label":"Couleur"}},"container_widths":{"25":"25% de Largeur","50":"50% de Largeur","75":"75% de Largeur","100":"100% (Pleine Largeur)"},"row_widths":{"25":"25% de Largeur","50":"50% de Largeur","75":"75% de Largeur","100":"100% (Pleine Largeur)"}},"about":{"logo_alt":"Ultra Vehicle Card","developed_by":"Développé par","discord_button":"Rejoignez notre Discord","docs_button":"Lisez notre documentation","donate_button":"FAIRE UN DON (PAYPAL)","github_button":"Visitez notre Github","support_title":"Soutenez Ultra Vehicle Card","support_description":"Vos conseils généreux alimentent le développement de fonctionnalités incroyables pour cette carte! Sans le support d\'utilisateurs comme vous, l\'innovation continue ne serait pas possible."},"custom_icons":{"title":"Icônes personnalisées","description":"Définissez des icônes personnalisées pour différents états.","icon_entity":"Entité d\'icône","default_icon":"Icône par défaut","state_icons":"Icônes d\'état","state":"État","icon":"Icône"},"custom_active_state_text":"Texte personnalisé d\'état actif","custom_inactive_state_text":"Texte personnalisé d\'état inactif","image_settings":{"title":"Paramètres d\'image","description":"Configurez l\'apparence de l\'image principale.","type":"Type d\'image","width":"Largeur d\'image","crop":"Recadrer l\'image","entity":"Entité d\'image","entity_description":"Entité qui fournit l\'URL de l\'image"},"entity_settings":{"entity":"Entité","entity_description":"Sélectionnez une entité pour afficher des informations à partir de","name":"Name","name_description":"Remplacez le nom de l\'entité (laissez en blanc pour utiliser le nom amical de l\'entité)","show_icon":"Icône de montre","icon":"Icône","icon_color":"Couleur icône","name_color":"Nom de la couleur","entity_color":"Couleur d\'entité","text_color":"Couleur du texte","show_name":"Nom de spectacle","show_name_description":"Affichez le nom de l\'entité avant la valeur","template_mode":"Utiliser un Modèle pour la Valeur","template_mode_description":"Utilisez un modèle pour formater la valeur de l\'entité","value_template":"Modèle de valeur","template_header":"Modèle de valeur","template_examples_header":"Exemples de Modèles","template_basic":"Valeur de base","template_units":"Avec des unités","template_round":"À 1 décimal","dynamic_icon_template":"Modèle d\'icône","dynamic_color_template":"Modèle de couleur","dynamic_icon_template_mode":"Activer le modèle d\'icône dynamique","dynamic_color_template_mode":"Activer le modèle de couleur dynamique"}}');var yt=a.t(ft,2);const kt=JSON.parse('{"editor":{"tabs":{"settings":"Impostazioni","bars":"Barre","icons":"Icone","customize":"Personalizza","about":"Info","info":"Informazioni","images":"Immagini"},"info":{"title":"Informazioni sulla carta","description":"Configurare le righe e le entità di informazioni per visualizzare i dettagli del veicolo come posizione, chilometraggio, ecc. Gli elementi di informazioni verranno visualizzati su una singola riga, quando possibile, avvolgendo più linee in contenitori stretti.","add_row":"Aggiungi Riga Informazioni","add_entity":"Aggiungi Entità Informazioni","arrange_info_rows":"Organizza le righe delle informazioni","duplicate_row":"Duplica Riga","delete_row":"Elimina Riga","expand_row":"Espandi Riga","collapse_row":"Comprimi Riga","duplicate_entity":"Duplica Entità","delete_entity":"Elimina Entità","expand_entity":"Espandi Entità","collapse_entity":"Comprimi Entità","row_prefix":"Riga Informazioni","entity_prefix":"Entità","template_mode":"Modalità modello","template_mode_description":"Utilizzare un modello per formattare il valore dell\'entità. I modelli consentono di utilizzare la sintassi del modello di assistente domestico per la formattazione complessa.","template_examples_header":"Esempi comuni:","dynamic_icon":{"title":"Modello Icona Dinamica","description":"Usa un modello per selezionare dinamicamente l\'icona basandosi su stati di entità o condizioni.","enable":"Abilita Modello Icona Dinamica"},"dynamic_color":{"title":"Modello Colore Dinamico","description":"Usa un modello per impostare dinamicamente i colori basandosi su stati di entità o valori.","enable":"Abilita Modello Colore Dinamico"},"row_settings":{"header":"Impostazioni Riga","row_name":"Nome Riga","row_name_description":"Nome personalizzato per questa riga informazioni (lasciare vuoto per usare la denominazione predefinita)","horizontal_alignment":"Allineamento Orizzontale","alignment_description":"Allineamento orizzontale delle entità in questa riga","vertical_alignment":"Allineamento Verticale","vertical_alignment_description":"Controlla come le entità sono allineate verticalmente all\'interno della riga.","spacing":"Spaziatura","spacing_description":"Spaziatura tra le entità in questa riga","allow_wrap":"Consenti ritorno a capo","allow_wrap_description":"Quando abilitato, gli elementi andranno alla riga successiva se non si adattano a una riga. Quando disabilitato, tutti gli elementi rimarranno in una singola riga."},"entity_settings":{"header":"Elementi Informazioni","name":"Nome Personalizzato","entity_description":"Seleziona un\'entità da cui visualizzare le informazioni","name_description":"Sostituisci il nome dell\'entità (lasciare vuoto per usare il nome amichevole dell\'entità)","show_icon":"Mostra Icona","icon_color":"Colore Icona","name_color":"Colore Nome","entity_color":"Colore Entità","icon_size":"Dimensione Icona","name_size":"Dimensione Nome","value_size":"Dimensione Valore","size_settings":"Impostazioni Dimensioni","show_name":"Mostra Nome","show_name_description":"Visualizza il nome dell\'entità prima del valore","click_action":"Azione Click","navigation_path":"Percorso Navigazione","navigation_path_description":"Percorso da navigare quando cliccato (es., /lovelace/0)","url":"URL","url_description":"URL da aprire quando cliccato","service":"Servizio","service_description":"Servizio da chiamare (es., light.turn_on)","service_data":"Dati Servizio (JSON)"},"alignments":{"flex-start":"Inizio","center":"Centro","flex-end":"Fine","space-between":"Spazio Tra","space-around":"Spazio Attorno","space-evenly":"Spazio Uniforme"},"spacing":{"none":"Nessuno","small":"Piccolo","medium":"Medio","large":"Grande"},"click_actions":{"more-info":"Più Informazioni","navigate":"Naviga","url":"Apri URL","call-service":"Chiama Servizio","none":"Nessuno"},"row_vertical_alignments":{"top":"Alto","center":"Centro","bottom":"Basso"}},"settings_subtabs":{"general":"Generale","action_images":"Immagini azioni"},"action_images":{"title":"Impostazioni Immagini di Azione","description":"Configura le immagini che verranno visualizzate quando vengono soddisfatti specifici stati delle entità.","add_image":"Aggiungi Immagine di Azione","no_images":"Nessuna immagine di azione configurata ancora. Aggiungine una per iniziare.","actions":{"drag":"Trascina per riordinare","duplicate":"Duplica","delete":"Elimina","expand":"Espandi","collapse":"Comprimi"},"delete_confirm":"Sei sicuro di voler eliminare questa immagine di azione?","entity_settings":"Impostazioni Entità","image_settings":"Impostazioni Immagine","entity_placeholder":"Seleziona un\'entità","state_placeholder":"Inserisci valore dello stato","preview":{"no_entity":"Nessuna entità selezionata","no_image":"Nessuna immagine","any_state":"Qualsiasi stato"},"trigger_entity":"Entità Scatenante","trigger_state":"Stato Scatenante","entity_help":"Seleziona un\'entità da monitorare. L\'immagine verrà mostrata quando questa entità corrisponde allo stato sottostante.","state_help":"Inserisci il valore dello stato che attiverà la visualizzazione di questa immagine. Lascia vuoto per corrispondere a qualsiasi stato.","image_type":{"title":"Tipo di Immagine","upload":"Carica Immagine","url":"URL Immagine","entity":"Immagine Entità","none":"Nessuna"},"template_mode":"Modalità Modello","template_description":"Usa un template per determinare quando questa immagine deve essere mostrata. I template permettono di usare la sintassi di template di Home Assistant (come {{ states.sensor.temperature.state > 70 }}) per condizioni complesse.","template_label":"Modello di visualizzazione","template_help":"Inserisci un template che restituisce vero/falso. Questa immagine sarà mostrata quando il template valuta a vero. Usa la sintassi Jinja2: {{ states(...) }}","priority":{"label":"Priorità di Visualizzazione","description":"Basato su Priorità usa la prima corrispondenza dall\'alto verso il basso. Corrispondenza Più Recente usa l\'ultima corrispondenza trovata nell\'elenco.","options":{"priority":"Basato su Priorità","newest":"Corrispondenza Più Recente"}}},"images":{"title":"Immagini","description":"Configura immagini che verranno visualizzate in base a condizioni o template.","add_image":"Aggiungi Immagine","no_images":"Nessuna immagine configurata ancora. Aggiungine una per iniziare.","arrange_images":"Disponi Immagini","name":"Nome (Opzionale)","image_type":"Tipo di Immagine","url":"URL Immagine","image_entity":"Entità Immagine","priority":"Priorità (0 = più alta)","priority_mode":"Modalità Priorità","timed_duration":"Durata Visualizzazione (secondi)","timed_duration_help":"Per quanto tempo questa immagine dovrebbe essere visualizzata prima di tornare all\'immagine principale.","duplicate":"Duplica Immagine","delete":"Elimina Immagine","delete_confirm":"Sei sicuro di voler eliminare questa immagine?","image_types":{"none":"Nessuna","default":"Veicolo Predefinito","url":"URL Immagine","upload":"Carica Immagine","entity":"Immagine Entità","map":"Mappa"},"priority_modes":{"order":"Priorità per Ordine","order_help":"Le immagini vengono visualizzate in base al loro ordine nell\'elenco (trascina per riordinare).","last_triggered":"Ultimo Attivato","last_triggered_help":"L\'immagine attivata più di recente rimarrà visualizzata fino a quando non verrà attivata un\'altra immagine.","timed":"Immagini Temporizzate","timed_help":"Le immagini sotto la prima verranno mostrate per una durata prestabilita e poi torneranno all\'immagine principale."},"conditional_types":{"show":"Mostra Quando","hide":"Nascondi Quando"},"tabs":{"general":"Generale","conditional":"Condizionale","appearance":"Aspetto"},"conditional_help":"Configura quando questa immagine dovrebbe essere mostrata in base a stati di entità o template.","conditional_help_simple":"Configura quando questa immagine dovrebbe essere mostrata in base a stati di entità.","conditional_state_help":"L\'immagine verrà mostrata quando l\'entità è uguale a questo valore di stato.","conditional_entity":"Entità Condizionale","conditional_state":"Stato Condizionale","basic_conditions":"Condizioni di Base","advanced_conditional":"Condizioni Template Avanzate","advanced_help":"Usa template per condizioni complesse come entità multiple o confronti matematici.","template_mode_active_help":"Usa template per condizioni complesse come entità multiple o confronti matematici.","template_mode":{"header":"Modalità Modello","enable":"Abilita Modalità Modello","template":"Modello"},"template_examples_header":"Esempi Comuni:","width":"Larghezza (%)","width_settings":"Impostazioni Larghezza","crop_settings":"Impostazioni Ritaglio","crop_help":"I valori positivi ritagliano verso l\'interno, i valori negativi aggiungono riempimento verso l\'esterno.","crop_top":"Alto","crop_right":"Destra","crop_bottom":"Basso","crop_left":"Sinistra","fallback_image":"Immagine di Riserva","fallback_help":"Questa immagine verrà utilizzata come riserva se nessun trigger corrisponde o si verifica un timeout. Solo un\'immagine può essere di riserva.","map_entity":"Entità Posizione","map_entity_help":"Seleziona un\'entità con coordinate latitudine/longitudine o indirizzo da visualizzare sulla mappa.","target_entity":"Entità Target","target_entity_description":"Seleziona l\'entità da targetizzare con questa azione","common":{"width":"Larghezza Immagine","width_description":"Larghezza come percentuale della carta","width_over_100":"I valori superiori al 100% possono aiutare a ritagliare lo spazio vuoto attorno alle immagini","url_description":"Inserisci l\'URL dell\'immagine"},"vehicle":{"crop":"Ritaglia Immagine"},"migration":{"title":"Immagini Legacy Rilevate","description":"Abbiamo trovato configurazioni di immagini legacy che possono essere migrate al nuovo formato.","migrate_button":"Migra Ora","success":"Immagini migrate con successo!"}},"card_settings":{"title":"Titolo scheda","title_alignment":"Allineamento titolo","title_size":"Dimensione titolo","title_color":"Colore Titolo","title_color_description":"Colore del titolo della carta","title_description":"Titolo visualizzato nella parte superiore della scheda (opzionale)","title_alignment_description":"Come viene allineato il titolo della scheda","title_size_description":"Dimensione del titolo della scheda in pixel","colors":"Colori","card_background":"Sfondo della Scheda","card_background_description":"Colore di sfondo dell\'intera carta","format_entities":"Formatta valori entità","format_entities_description":"Abilita la formattazione aggiuntiva dei valori delle entità (aggiunge virgole, converte unità, ecc.)","show_units":"Mostra unità","show_units_description":"Mostra unità accanto ai valori","help_highlight":"Aiutati a evidenziare","help_highlight_description":"Mostra punti salienti visivi quando si passa tra le schede dell\'editor per identificare quale sezione si sta modificando","general":"Generale","conditional_logic":"Logica Condizionale","card_visibility":"Visibilità Scheda","card_visibility_description":"Mostra o nascondi l\'intera scheda basandosi su una condizione di entità"},"vehicle_info":{"title":"Informazioni sul Veicolo","location":{"title":"Entità Posizione","description":"Seleziona l\'entità che mostra la posizione attuale del veicolo.","show":"Mostra Posizione","show_description":"Mostra la posizione del veicolo"},"mileage":{"title":"Entità Chilometraggio","description":"Seleziona l\'entità che rappresenta il chilometraggio totale o il contachilometri del veicolo.","show":"Mostra Chilometraggio","show_description":"Mostra il chilometraggio del veicolo"},"car_state":{"title":"Entità Stato del Veicolo","description":"Seleziona l\'entità che rappresenta lo stato attuale del veicolo (es. parcheggiato, in movimento, in carica).","show":"Mostra Stato del Veicolo","show_description":"Mostra lo stato del veicolo"}},"crop":{"title":"Ritaglio Immagine","top":"Alto","right":"Destra","bottom":"Basso","left":"Sinistra","pixels":"Px","help":"Inserisci valori in pixel (positivi o negativi) per regolare il ritaglio e il riempimento"},"alignment":{"left":"Sinistra","center":"Centro","right":"Destra"},"common":{"choose_file":"Scegli File","no_file_chosen":"Nessun file selezionato","entity":"Entità","width":"Larghezza","width_description":"Larghezza in percentuale della scheda","width_over_100":"I valori superiori al 100% possono aiutare a ritagliare lo spazio vuoto attorno alle immagini","none":"Nessuno","default":"Predefinito","upload":"Carica","url":"URL","url_description":"URL che punta all\'immagine","reset":"Ripristina","condition_prompt":"Seleziona \\"Mostra\\" o \\"nascondi\\" per configurare la condizione di entità","bold":"Grassetto","italic":"Corsivo","uppercase":"Maiuscolo","strikethrough":"Barrato"},"conditions":{"condition_type":"Tipo di Condizione","show_card_if":"Mostra Scheda Se","hide_card_if":"Nascondi Scheda Se","entity_description":"Seleziona l\'entità da controllare per la condizione","state":"Stato","state_description":"Il valore di stato che attiva la condizione"},"bars":{"title":"Barre Percentuali","description":"Aggiungi barre percentuali per visualizzare valori come livello carburante, carica della batteria o autonomia. Ogni barra può mostrare un valore percentuale principale con etichette opzionali a sinistra e destra.","add":"Aggiungi Nuova Barra","duplicate":"Duplica Barra","delete":"Elimina Barra","expand":"Espandi Barra","collapse":"Comprimi Barra","no_entity":"Nessuna entità selezionata","bar_prefix":"Barra","template":{"description":"Utilizzare un modello per formattare il testo visualizzato, convertire le unità o visualizzare i valori calcolati.","enable":"Abilita la modalità modello","template_label":"Modello","helper_text":"Usa la sintassi di template di Home Assistant. Esempi:\\n• {{ states(\'sensor.temperature\') | float * 1.8 + 32 }} °F\\n• {{ now().strftime(\\"%b %d, %H:%M\\") }}","examples_header":"Esempi comuni:","examples":{"temperature":"{{ states(\'sensor.temperature\') | float * 1.8 + 32 }}°F - Converte Celsius in Fahrenheit","datetime":"{{ now().strftime(\\"%b %d, %H:%M\\") }} - Formatta data/ora corrente","power":"{{ \'Ricarica a \' + states(\'sensor.ev_power\') + \' kW\' }} - Combina testo e valore sensore"}},"bar_radius":{"round":"Rotondo","square":"Quadrato","rounded-square":"Quadrato Arrotondato"},"tabs":{"arrange_bars":"Organizza Barre","config":"Configurazione","colors":"Colori","animation":"Animazione"},"settings":{"header":"Impostazioni Barra","entity":"Entità Percentuale Barra","entity_description":"Seleziona un\'entità che restituisce un valore percentuale (0-100). Questo controlla il livello di riempimento della barra.","limit_entity":"Entità Valore Limite (opzionale)","limit_entity_description":"Opzionale: Aggiungi una linea indicatrice verticale sulla barra (es. limite di ricarica per batteria VE).","limit_color":"Colore Indicatore Limite","limit_color_description":"Colore della linea verticale che mostra la posizione del limite sulla barra. Le modifiche forzeranno un aggiornamento della carta.","bar_size":"Dimensione Barra","bar_size_description":"Definisce lo spessore/altezza della barra di avanzamento.","bar_radius":"Raggio della Barra","bar_radius_description":"Forma degli angoli della barra di avanzamento","width":"Larghezza Barra","width_description":"Definisce la larghezza della barra in percentuale della larghezza della scheda.","alignment":"Allineamento Etichetta","alignment_description":"Come le etichette sinistra e destra si allineano tra loro.","show_percentage":"Mostra Percentuale","show_percentage_description":"Mostra il valore percentuale all\'interno della barra"},"percentage":{"header":"Testo Percentuale","display_header":"Visualizzazione del Testo Percentuale","display_description":"Controlla la visibilità e l\'aspetto dei valori percentuali mostrati direttamente sulla barra. Questi numeri forniscono un chiaro indicatore visivo del livello attuale.","text_size":"Dimensione Testo","calculation_header":"Calcolo Percentuale","calculation_description":"Configura come viene calcolato il livello di riempimento percentuale della barra utilizzando una delle opzioni seguenti.","type_header":"Calcolo Percentuale","type_label":"Tipo di Percentuale","type_description":"Come calcolare il valore percentuale mostrato nella barra","type_entity":"Entità (0-100)","type_attribute":"Attributo Entità","type_template":"Modalità Modello","type_difference":"Differenza (Quantità/Totale)","amount_entity":"Entità Quantità","amount_description":"Entità che rappresenta la quantità/valore attuale (numeratore)","total_entity":"Entità Totale","total_description":"Entità che rappresenta la quantità/massimo totale (denominatore)"},"left_side":{"header":"Lato Sinistro","section_description":"Configura il titolo e il valore dell\'entità visualizzati sul lato sinistro della barra. Utile per mostrare etichette come \'Autonomia\' o \'Batteria\' insieme ai loro valori.","toggle_description":"Mostra o nascondi il lato sinistro dell\'etichetta della barra","title":"Titolo Sinistro","title_description":"Etichetta opzionale visualizzata sul lato sinistro sotto la barra.","entity":"Entità Sinistra","entity_description":"Entità il cui valore viene visualizzato sul lato sinistro della barra.","alignment_description":"Controlla come questa etichetta è allineata sotto la barra.","title_size":"Dimensione Titolo","value_size":"Dimensione Valore","hidden_message":"Il lato sinistro è nascosto"},"right_side":{"header":"Lato Destro","section_description":"Configura il titolo e il valore dell\'entità visualizzati sul lato destro della barra. Ideale per informazioni complementari come \'Tempo alla Carica Completa\' o misurazioni secondarie.","toggle_description":"Mostra o nascondi il lato destro dell\'etichetta della barra","title":"Titolo Destro","title_description":"Etichetta opzionale visualizzata sul lato destro sotto la barra.","entity":"Entità Destra","entity_description":"Entità il cui valore viene visualizzato sul lato destro della barra.","alignment_description":"Controlla come questa etichetta è allineata sotto la barra.","title_size":"Dimensione Titolo","value_size":"Dimensione Valore","hidden_message":"Il lato destro è nascosto"},"colors":{"header":"Colori","bar_color":"Colore Barra","background_color":"Colore Sfondo","border_color":"Colore Bordo","limit_indicator_color":"Colore Indicatore Limite","left_title_color":"Colore Titolo Sinistro","left_value_color":"Colore Valore Sinistro","right_title_color":"Colore Titolo Destro","right_value_color":"Colore Valore Destro","percentage_text_color":"Colore Testo Percentuale","reset_color":"Ripristina colore predefinito"},"gradient":{"header":"Modalità Gradiente","description":"Crea bellissime transizioni di colore sulle tue barre di avanzamento. Ideale per visualizzare livelli della batteria, indicatori di carburante o qualsiasi indicatore di stato che richieda un\'enfasi visiva.","toggle":"Usa Gradiente","toggle_description":"Usa un gradiente per la barra di avanzamento invece di un colore uniforme","display_mode":"Modalità Visualizzazione Gradiente","display_mode_full":"Completo","display_mode_value_based":"Basato sul Valore","display_mode_cropped":"Ritagliato","display_mode_description":"Completo: Mostra l\'intero gradiente. Basato sul Valore: Mostra il gradiente fino al valore corrente.","editor_header":"Editor Gradiente","add_stop":"Aggiungi Interruzione"},"animation":{"header":"Animazione di Azione","description":"Aggiungi animazioni alla barra quando un\'entità specifica raggiunge uno stato specifico. Perfetto per mostrare stati di ricarica, stati di allarme e altro ancora.","pro_tip":"Suggerimento Pro: Per animazioni \'sempre attive\', seleziona un tipo di animazione ma lascia vuoti i campi entità e stato. Prova le animazioni \'Bolle\' e \'Riempimento\'!","entity":"Entità Animazione","entity_description":"Entità che attiva l\'animazione quando corrisponde allo stato specificato","state":"Stato Entità","state_description":"Quando lo stato dell\'entità corrisponde a questo valore, l\'animazione verrà attivata","type":"Tipo di Animazione","type_description":"L\'effetto di animazione da visualizzare quando lo stato dell\'entità corrisponde","select_entity_prompt":"Seleziona un\'Entità e inserisci lo stato che vuoi per attivare l\'animazione (esempi: \\"charging\\", \\"on\\", \\"idle\\")","action_entity":"Entità d\'azione","action_state":"Stato d\'azione","action_description":"Questa animazione sostituirà l\'animazione regolare quando l\'entità specificata è in uno stato specifico.","action_entity_prompt":"Seleziona un\'entità e uno stato per definire quando questa animazione dovrebbe sovrascrivere l\'animazione regolare"},"bar_sizes":{"thin":"Sottile","regular":"Normale","thick":"Spessa","thiccc":"Molto Spessa"},"bar_widths":{"25":"25% di Larghezza","50":"50% di Larghezza","75":"75% di Larghezza","100":"100% (Larghezza Piena)"},"bar_alignments":{"space-between":"Spazio Tra","flex-start":"Sinistra","center":"Centro","flex-end":"Destra"},"bar_styles":{"flat":"Piano (Predefinito)","glossy":"Lucido","embossed":"In Rilievo","inset":"Incassato","gradient":"Sovrapposizione Gradiente","neon":"Bagliore Neon","outline":"Contorno","glass":"Vetro","metallic":"Metallico","neumorphic":"Neumorphico"},"animation_types":{"none":"Nessuna","charging-lines":"Ricarica (Linee Diagonali)","pulse":"Pulsazione","blinking":"Lampeggiamento","bouncing":"Rimbalzo","glow":"Bagliore","rainbow":"Arcobaleno","bubbles":"Bolle","fill":"Riempimento"},"custom_bar_settings":{"title":"Impostazioni Barra Personalizzate","description":"Definisci configurazioni personalizzate per le singole barre.","name":"Nome Barra","entity":"Entità","unit":"Unità","min":"Valore Minimo","max":"Valore Massimo","thresholds":"Soglie","severity":"Mappa di Gravità"},"template_mode":{"header":"Modalità Modello","description":"Usa un modello per formattare il testo visualizzato, convertire unità o mostrare valori calcolati.","enable":"Abilita Modalità Modello","template":"Modello"}},"icons":{"title":"Icone della Carta","description":"Aggiungi righe di icone per visualizzare più icone sulla tua scheda. Ogni riga può essere configurata con impostazioni diverse. Nota: Le righe di icone e l\'ordine delle sezioni possono essere riorganizzati nella scheda Personalizza.","add_row":"Aggiungi Riga Icone","duplicate_row":"Duplica Riga","delete_row":"Elimina Riga","expand_row":"Espandi Riga","collapse_row":"Comprimi Riga","no_row":"Nessuna riga di icone è stata aggiunta","row_prefix":"Riga","icon_prefix":"Icona","add_icon":"Aggiungi Icona","duplicate_icon":"Duplica Icona","delete_icon":"Elimina Icona","template_mode":"Modalità modello","template_mode_active_description":"Usa un modello per determinare quando questa icona dovrebbe essere attiva. I modelli consentono di utilizzare la sintassi del modello di assistente domestico per condizioni complesse.","template_mode_inactive_description":"Usa un modello per determinare quando questa icona dovrebbe essere inattiva. I modelli consentono di utilizzare la sintassi del modello di assistente domestico per condizioni complesse.","template_examples_header":"Esempi comuni:","text_formatting":"Formattazione Testo Stato","name_formatting":"Formattazione Nome","dynamic_icon":{"title":"Modello Icona Dinamica","description":"Usa un modello per selezionare dinamicamente l\'icona basata su stati di entità o condizioni.","enable":"Abilita Modello Icona Dinamica"},"dynamic_color":{"title":"Modello Colore Dinamico","description":"Usa un modello per impostare dinamicamente il colore dell\'icona basato su stati di entità o valori.","enable":"Abilita Modello Colore Dinamico"},"enable_template_mode":"Abilita la modalità modello","row_settings":{"header":"Lista Icone","width":"Larghezza Riga","width_description":"Larghezza della riga in percentuale della larghezza della scheda","alignment":"Allineamento Riga","alignment_description":"Come le icone sono allineate in questa riga","spacing":"Spaziatura Icone","spacing_description":"Quantità di spazio tra le icone in questa riga","columns":"Numero di Colonne","columns_description":"Numero di colonne di dimensioni uniformi nella riga (0 = distribuzione automatica basata sul contenuto)","confirmation_mode":"Modalità Conferma","confirmation_mode_description":"Richiede due tocchi/clic per attivare le icone in questa riga, prevenendo interazioni accidentali","layout_info_title":"Come Funzionano le Impostazioni di Layout"},"icon_settings":{"header":"Lista Icone","entity":"Entità","entity_description":"Entità visualizzata con questa icona","icon":"Icona","icon_description":"Seleziona un\'icona o inserisci un\'icona personalizzata","name":"Nome","name_description":"Nome personalizzato visualizzato sotto l\'icona (usa il nome dell\'entità di default se non specificato)","interaction_type":"Tipo di Interazione","interaction_type_description":"Scegli come gli utenti interagiscono con questa icona per attivare azioni","show_name":"Mostra Nome","show_name_description":"Mostra il testo del nome sotto l\'icona","show_state":"Mostra Stato","show_state_description":"Mostra lo stato dell\'entità sotto l\'icona","show_units":"Mostra Unità","show_units_description":"Includi le unità quando mostri lo stato","text_position":"Posizione Testo","text_position_description":"Dove il testo del nome e dello stato è posizionato rispetto all\'icona","click_action":"Azione al Click","service":"Servizio","service_description":"Servizio da chiamare (es. light.turn_on)","service_data":"Dati Servizio (JSON)","service_data_description":"Dati JSON inviati con la chiamata al servizio","action":"Azione (JSON/Servizio)","action_description":"Configurazione avanzata azione (vedi documentazione)","navigation_path":"Percorso di Navigazione","navigation_path_description":"Percorso verso cui navigare (es. /lovelace/dashboard)","navigation_target_selector":"Target di Navigazione","navigation_target_description":"Seleziona tra dashboard disponibili, viste o pagine di sistema","url":"URL","url_description":"URL da aprire in una nuova scheda","automation_entity":"Entità Automazione","automation_entity_description":"Automazione da attivare quando cliccato"},"icon_appearance":{"header":"Aspetto Icona","icon":"Aspetto Icona","general":"Aspetto Generale","active":"Stato Attivo","inactive":"Stato Inattivo","state_conditions":"Condizioni di Stato","advanced":"Impostazioni Avanzate","icon_size":"Dimensione Icona","icon_size_description":"Dimensione dell\'icona in pixel","text_size":"Dimensione Testo","text_size_description":"Dimensione del testo nome/stato in pixel","name_size":"Dimensione del nome","name_size_description":"Dimensione del nome del nome dell\'entità nei pixel","text_alignment":"Allineamento Testo","text_alignment_description":"Come il testo è allineato sotto l\'icona","icon_background":"Sfondo Icona","icon_background_description":"Aggiungi una forma di sfondo dietro l\'icona","icon_background_color":"Colore Sfondo Icona","icon_background_color_description":"Colore dello sfondo dietro l\'icona","container_background_color":"Colore Sfondo Contenitore","container_background_color_description":"Colore dello sfondo dietro l\'intero contenitore dell\'icona","text_appearance":"Aspetto Testo","container":{"header":"Aspetto Contenitore","vertical_alignment":"Allineamento Verticale","vertical_alignment_description":"Allinea l\'icona e il testo verticalmente all\'interno del contenitore.","width":"Larghezza Contenitore","width_description":"Imposta la larghezza del contenitore dell\'icona rispetto alla riga.","background":"Forma Sfondo Contenitore","background_description":"Scegli una forma di sfondo per l\'intero contenitore dell\'icona."},"show_when_active":"Mostra Icona Quando Attiva","show_when_active_description":"Mostra questa icona solo quando è in uno stato attivo","template_mode":"Modalità Modello","template_description":"Usa un modello per determinare lo stato attivo/inattivo. I template permettono di usare la sintassi di template di Home Assistant (come {{ states.sensor.temperature.state > 70 }}) per condizioni complesse.","active_template":"Modello Attivo","active_template_description":"Modello che restituisce vero quando l\'icona dovrebbe essere attiva.","active_state":"Stato attivo","active_state_description":"Stringa di stato che rappresenta \\"attivo\\".","active_state_text":"Testo Personalizzato per Stato Attivo","active_state_text_description":"Sovrascrive il testo visualizzato quando l\'icona è attiva. Lascia vuoto per usare lo stato effettivo.","inactive_template":"Modello Inattivo","inactive_template_description":"Modello che restituisce vero quando l\'icona dovrebbe essere inattiva.","inactive_state":"Stato inattivo","inactive_state_description":"Stringa di stato che rappresenta \\"inattivo\\".","inactive_state_text":"Testo Personalizzato per Stato Inattivo","inactive_state_text_description":"Sovrascrive il testo visualizzato quando l\'icona è inattiva. Lascia vuoto per usare lo stato effettivo.","active_icon":"Icona Attiva","inactive_icon":"Icona Inattiva","active_icon_color":"Colore Icona Attiva","inactive_icon_color":"Colore Icona Inattiva","active_name_color":"Colore Nome Attivo","inactive_name_color":"Colore Nome Inattivo","active_state_color":"Colore Stato Attivo","inactive_state_color":"Colore Stato Inattivo","show_icon_active":"Mostra icona quando attivo","show_icon_active_description":"Mostra l\'icona quando lo stato è attivo.","show_icon_inactive":"Mostra Icona Quando Inattiva","show_icon_inactive_description":"Mostra l\'icona quando lo stato è inattivo.","custom_active_state_text":"Testo Personalizzato Stato Attivo","custom_inactive_state_text":"Testo Personalizzato Stato Inattivo","action_description":"Azione da eseguire quando si clicca sull\'icona.","show_name_active":"Mostra Nome Quando Attivo","show_name_active_description":"Mostra il nome quando lo stato è attivo.","show_name_inactive":"Mostra Nome Quando Inattivo","show_name_inactive_description":"Mostra il nome quando lo stato è inattivo.","show_state_active":"Mostra Stato Quando Attivo","show_state_active_description":"Mostra lo stato quando lo stato è attivo.","show_state_inactive":"Mostra Stato Quando Inattivo","show_state_inactive_description":"Mostra lo stato quando lo stato è inattivo.","use_entity_color_for_icon":"Usa il colore dell\'entità per l\'icona","use_entity_color_for_icon_description":"Usa l\'attributo colore dell\'entità per l\'icona quando disponibile","use_entity_color_for_icon_background":"Usa il colore dell\'entità per lo sfondo dell\'icona","use_entity_color_for_icon_background_description":"Usa l\'attributo colore dell\'entità per lo sfondo dell\'icona quando disponibile","use_entity_color_for_container_background":"Usa il colore dell\'entità per il contenitore","use_entity_color_for_container_background_description":"Utilizzare l\'attributo colore dell\'entità per lo sfondo del contenitore quando disponibile","dynamic_icon_template":"Modello Icona Dinamica","dynamic_icon_template_description":"Usa un modello per selezionare dinamicamente l\'icona basata su stati di entità o condizioni.","enable_dynamic_icon_template":"Abilita Modello Icona Dinamica","dynamic_color_template":"Modello Colore Dinamico","dynamic_color_template_description":"Usa un modello per impostare dinamicamente il colore dell\'icona basato su stati di entità o valori.","enable_dynamic_color_template":"Abilita Modello Colore Dinamico","size_settings":"Impostazioni Dimensione","value_size":"Dimensione Valore","state_text_formatting":"Formattazione Testo Stato","row_name":"Nome Riga","row_name_description":"Nome personalizzato per questa riga di icone (lasciare vuoto per usare la denominazione predefinita)","width_description":"Controlla quanta della larghezza disponibile userà questa riga. Configura come questa riga di icone viene visualizzata. La larghezza controlla la larghezza complessiva della riga, la spaziatura regola gli spazi tra le icone, e il numero di colonne determina quante icone appaiono in ogni riga (0 = automatico).","layout_info_title":"Come Funzionano le Impostazioni di Layout","layout_info_width":"Larghezza Riga: Controlla quanto spazio orizzontale occupa la riga nella carta (percentuale della larghezza della carta)","layout_info_alignment":"Allineamento Riga: Si applica solo quando il Numero di Colonne è 0. Determina come le icone sono posizionate all\'interno della riga","layout_info_spacing":"Spaziatura Icone: Imposta la quantità di spazio tra le icone","layout_info_columns":"Numero di Colonne: Quando impostato a 0, le icone fluiscono naturalmente in base allo spazio disponibile. Quando impostato a un numero, forza quel numero esatto di colonne in un layout a griglia","layout_info_tip":"Usa il Numero di Colonne con quantità consistenti di icone per riga per il layout più uniforme","control_right_side_description":"Controlla quando il lato destro è mostrato o nascosto basato sullo stato dell\'entità","dynamic_icon":{"title":"Modello Icona Dinamica","description":"Usa un modello per selezionare dinamicamente l\'icona basata su stati di entità o condizioni.","enable":"Abilita Modello Icona Dinamica","template_label":"Modello Icona"},"dynamic_color":{"title":"Modello Colore Dinamico","description":"Usa un modello per impostare dinamicamente il colore dell\'icona basato su stati di entità o valori.","enable":"Abilita Modello Colore Dinamico","template_label":"Modello Colore"}},"tabs":{"general":"Generale","actions":"Azioni","appearance":"Aspetto","states":"Stati","active_state":"Stato Attivo","inactive_state":"Stato Inattivo","icons":{"arrange_icon_rows":"Organizza Righe Icone"}},"alignments":{"flex-start":"Sinistra","center":"Centro","flex-end":"Destra","space-between":"Spazio Tra","space-around":"Spazio Attorno","space-evenly":"Spazio Uniforme"},"vertical_alignments":{"flex-start":"Alto","center":"Medio","flex-end":"Basso"},"spacing":{"none":"Nessuno","small":"Piccolo","medium":"Medio","large":"Grande"},"text_positions":{"below":"Sotto l\'Icona","beside":"Accanto all\'Icona","none":"Nessun Testo","top":"In Alto","left":"A Sinistra","right":"A Destra"},"reset":{"size":"Ripristina dimensione predefinita","color":"Ripristina colore predefinito","all":"Ripristina valori predefiniti"},"click_actions":{"toggle":"Attiva/Disattiva","more-info":"Mostra Più Informazioni","navigate":"Naviga al Percorso","url":"Apri URL","call-service":"Chiama Servizio","perform-action":"Esegui Azione","location-map":"Mostra Mappa","assist":"Assistente Vocale","trigger":"Attiva","none":"Nessuna Azione","descriptions":{"toggle":"Attiva o disattiva lo stato dell\'entità.","more-info":"Apre la finestra di dialogo con informazioni aggiuntive sull\'entità.","navigate":"Naviga al percorso Lovelace specificato.","url":"Apre l\'URL specificato in una nuova scheda.","call-service":"Chiama il servizio Home Assistant specificato.","perform-action":"Esegue un\'azione personalizzata (vedi documentazione).","location-map":"Mostra la posizione dell\'entità su una mappa.","assist":"Apre l\'assistente vocale di Home Assistant.","trigger":"Attiva l\'entità (automazione, script, pulsante, ecc).","none":"Nessuna azione verrà eseguita."}},"backgrounds":{"none":"Nessuno","circle":"Cerchio","square":"Quadrato","rounded_square":"Quadrato Arrotondato"},"container_widths":{"25":"25% di Larghezza","50":"50% di Larghezza","75":"75% di Larghezza","100":"100% (Larghezza Piena)"},"row_widths":{"25":"25% di Larghezza","50":"50% di Larghezza","75":"75% di Larghezza","100":"100% (Larghezza Piena)"},"interactions":{"single":"Tocco/Clic Singolo","double":"Doppio Tocco/Clic","hold":"Tenere/Pressione Lunga"},"animations":{"title":"Animazione Icona","active_description":"Seleziona un\'animazione da applicare quando questa icona è nello stato attivo.","inactive_description":"Seleziona un\'animazione da applicare quando questa icona è nello stato inattivo.","select_animation":"Seleziona Animazione","none":"Nessuna","pulse":"Pulsazione","vibrate":"Vibrazione","rotate_left":"Ruota Sinistra","rotate_right":"Ruota Destra","hover":"Hover","fade":"Dissolvenza","scale":"Scala","bounce":"Rimbalzo","shake":"Scuotimento","tada":"Tada"},"row_vertical_alignments":{"top":"Alto","center":"Centro","bottom":"Basso"},"actions":{"single":"Azione Clic Singolo","double":"Azione Doppio Clic","hold":"Azione Tenere","single_description":"Azione eseguita su un tocco/clic singolo - interazione più comune","double_description":"Azione eseguita su un doppio tocco/clic - aiuta a prevenire attivazioni accidentali","hold_description":"Azione eseguita quando si tiene premuto per 500ms - ideale per azioni critiche","section_header":"Azioni di Interazione"}},"customize":{"title":"Personalizza il layout","description":"Personalizza il layout, ordina e aggiungi sezioni alla tua carta","condition_prompt":"Seleziona \\"Mostra\\" o \\"nascondi\\" per configurare la condizione di entità","template_mode_active":"Usa Modalità Modello","layout":{"title":"Stile layout","description":"Scegli tra vista a una o due colonne per la scheda","header":"Impostazioni layout","descriptions_header":"Descrizioni Layout","single_column":"Colonna Singola","single_column_description":"Tutte le sezioni sono impilate verticalmente in una singola colonna - ideale per display semplici e viste mobile.","double_column":"Doppia Colonna","double_column_description":"Le sezioni sono divise tra due colonne per un uso efficiente dello spazio orizzontale - ideale per schermi più larghi.","top_view":"Vista Superiore","top_view_description":"L\'immagine è visualizzata prominentemente in alto con altre sezioni disposte in posizioni configurabili attorno ad essa.","half_full":"Metà + Pieno","half_full_description":"La riga superiore ha due sezioni a metà larghezza, la riga inferiore ha una sezione a larghezza piena - ottimo per layout bilanciati.","full_half":"Pieno + Metà","full_half_description":"La riga superiore ha una sezione a larghezza piena, la riga inferiore ha due sezioni a metà larghezza - perfetto per evidenziare il contenuto superiore."},"layout_types":{"single":"Colonna singola","double":"Doppia colonna","dashboard":"Dashboard","half_full":"Metà + pieno","full_half":"Full + metà"},"column_width":{"title":"Larghezza colonne","description":"Configura il rapporto di larghezza tra le colonne sinistra e destra","50_50":"Uguale (50/50)","30_70":"Stretta sinistra, larga destra (30/70)","70_30":"Larga sinistra, stretta destra (70/30)","40_60":"Leggermente più stretta sinistra (40/60)","60_40":"Leggermente più larga sinistra (60/40)"},"top_view":{"header":"Impostazioni dashboard","description":"Configura le impostazioni di spaziatura e layout per la vista dashboard","side_margin":"Margini laterali","side_margin_help":"Margini sui lati della vista in pixel","middle_spacing":"Spaziatura centrale","middle_spacing_help":"Spazio tra le colonne centrali in pixel","vertical_spacing":"Spaziatura verticale","vertical_spacing_help":"Spazio tra le righe in pixel"},"sections":{"header":"Sezioni della scheda","arrangement_header":"Disposizione sezioni","arrangement_desc_base":"Trascina le sezioni per organizzare il loro ordine sulla scheda.","arrangement_desc_single_extra":"Tutte le sezioni saranno visualizzate in una singola colonna.","arrangement_desc_double_extra":"Nella vista a due colonne, puoi posizionare ogni sezione nella colonna sinistra o destra.","arrangement_desc_dashboard_extra":"Nella vista dashboard, puoi posizionare le sezioni intorno all\'immagine del tuo veicolo."},"section_labels":{"title":"Titolo","image":"Immagine veicolo","info":"Informazioni veicolo","bars":"Tutte le barre sensori","icons":"Tutte le righe icone","section_break":"Interruzione della sezione"},"actions":{"collapse_margins":"Riduci margini","expand_margins":"Espandi margini","collapse_options":"Riduci opzioni","expand_options":"Espandi opzioni","add_break":"Aggiungi interruzione della sezione","delete_break":"Elimina la rottura della sezione"},"css":{"header":"CSS Globale","description":"Inserisci qui regole CSS personalizzate per sovrascrivere lo stile predefinito della scheda. Queste regole verranno applicate direttamente alla scheda. Usa con cautela.","label":"CSS Personalizzato","input_description":"Inserisci qui le tue regole CSS personalizzate."},"conditions":{"header":"Logica condizionale","description":"Mostra o nascondi questa sezione in base allo stato di un\'entità.","template_mode_description":"Usa un modello per determinare la visibilità della sezione. I modelli ti permettono di usare la sintassi di templating di Home Assistant per condizioni complesse.","type_label":"Tipo condizione","section_title":"Titolo Sezione","enable_section_title":"Abilita Titolo Sezione","title_text":"Testo Titolo","title_size":"Dimensione Titolo","title_color":"Colore Titolo","enable_template_mode":"Abilita Modalità Modello","use_template_description":"Usa un modello per determinare quando questa sezione dovrebbe essere visibile. I modelli ti permettono di usare la sintassi di templating di Home Assistant per condizioni complesse.","info_row":"Riga Info","entity_label":"Entità condizione","state_label":"Stato condizione","state_description":"Il valore di stato che attiva la condizione","types":{"none":"Nessuna (Mostra sempre)","show":"Mostra quando...","hide":"Nascondi quando..."}},"template":{"description":"Usa un modello per determinare quando questa sezione dovrebbe essere visibile. I modelli ti permettono di usare la sintassi di templating di Home Assistant per condizioni complesse.","enable":"Abilita Modalità Modello"},"template_mode":{"header":"Modalità Modello","description":"Usa un modello per controllare quando questa immagine è mostrata o nascosta basata su logica complessa, calcoli, o stati multipli di entità.","enable":"Abilita Modalità Modello","disabled_notice":"(Disabilitato - Modalità Modello Attiva)","disabled_help":"I controlli di condizione base sono disabilitati quando la Modalità Modello è attiva. La Modalità Modello ha precedenza sulle condizioni base.","examples":{"show_when_charging":"Mostra durante la ricarica","show_when_battery_low":"Mostra quando la batteria è scarica","multiple_conditions":"Condizioni multiple","show_during_day":"Mostra durante le ore del giorno","show_when_door_unlocked":"Mostra quando la porta è sbloccata"}},"section_title":{"header":"Titolo Sezione","enable":"Abilita Titolo Sezione","text":"Testo Titolo","size":"Dimensione Titolo","color":"Colore Titolo","bold":"Grassetto","italic":"Corsivo","uppercase":"Maiuscolo","strikethrough":"Barrato"},"margins":{"header":"Margini","top":"Margine superiore","bottom":"Margine inferiore"},"columns":{"left":"Colonna sinistra","right":"Colonna destra","empty":"Rilascia sezioni qui"},"dashboard":{"top":"Sezione superiore","top_middle":"Sezione superiore-centrale","left_middle":"Sezione sinistra-centrale","middle":"Sezione centrale","middle_empty":"Area immagine veicolo (Consigliato)","right_middle":"Sezione destra-centrale","bottom_middle":"Sezione inferiore-centrale","bottom":"Sezione inferiore"},"half_full":{"row1_col1":"Riga 1 - Colonna Sinistra","row1_col2":"Riga 1 - Colonna Destra","row2_full":"Riga 2, larghezza completa (100%)"},"full_half":{"row1_full":"Riga 1, larghezza completa (100%)","row2_col1":"Riga 2 - Colonna Sinistra","row2_col2":"Riga 2 - Colonna Destra"},"break_styles":{"blank":"Vuoto (nessuna riga)","line":"Linea continua","double_line":"Doppia linea","dotted":"Linea tratteggiata","double_dotted":"Linea doppia punteggiata","shadow":"Gradiente ombra"},"break_style":{"header":"Stile di rottura","style_label":"Stile","thickness_label":"Spessore","width_percent_label":"Larghezza (%)","color_label":"Colore"}},"container_widths":{"25":"25% di Larghezza","50":"50% di Larghezza","75":"75% di Larghezza","100":"100% (Larghezza Piena)"},"row_widths":{"25":"25% di Larghezza","50":"50% di Larghezza","75":"75% di Larghezza","100":"100% (Larghezza Piena)"}},"about":{"logo_alt":"Ultra Vehicle Card","developed_by":"Sviluppato da","discord_button":"Unisciti al nostro Discord","docs_button":"Leggi la nostra documentazione","donate_button":"DONA (PAYPAL)","github_button":"Visita il nostro Github","support_title":"Supporta Ultra Vehicle Card","support_description":"I tuoi generosi suggerimenti alimentano lo sviluppo di incredibili funzionalità per questa carta! Senza supporto da utenti come te, l\'innovazione continua non sarebbe possibile."},"custom_icons":{"title":"Icone Personalizzate","description":"Definisci icone personalizzate per diversi stati.","icon_entity":"Entità icona","default_icon":"Icona Predefinita","state_icons":"Icone di Stato","state":"Stato","icon":"Icona"},"custom_active_state_text":"Testo personalizzato stato attivo","custom_inactive_state_text":"Testo personalizzato stato inattivo","image_settings":{"title":"Impostazioni immagine","description":"Configura l\'aspetto dell\'immagine principale.","type":"Tipo immagine","width":"Larghezza immagine","crop":"Ritaglia immagine","entity":"Entità immagine","entity_description":"Entità che fornisce l\'URL dell\'immagine"},"entity_settings":{"entity":"Entità","entity_description":"Seleziona un\'entità per visualizzare le informazioni da cui","name":"Name","name_description":"Sostituire il nome dell\'entità (lascia vuoto per usare il nome amichevole dell\'entità)","show_icon":"Mostra Icona","icon":"Icona","icon_color":"Colore Icona","name_color":"Nome colore","entity_color":"Colore Entità","text_color":"Colore Testo","show_name":"Mostrare il nome","show_name_description":"Visualizza il nome dell\'entità prima del valore","template_mode":"Modalità Modello","template_mode_description":"Usa un modello per formattare il valore dell\'entità","value_template":"Modello di valore","template_header":"Modello di valore","template_examples_header":"Esempi Comuni:","template_basic":"Valore di base","template_units":"Con unità","template_round":"Round a 1 decimale","dynamic_icon_template":"Template Icona","dynamic_color_template":"Template Colore","dynamic_icon_template_mode":"Abilita Template Icona Dinamica","dynamic_color_template_mode":"Abilita Template Colore Dinamico"}}');var wt=a.t(kt,2);const xt=JSON.parse('{"editor":{"tabs":{"settings":"Indstillinger","bars":"Bjælker","icons":"Ikoner","customize":"Tilpas","about":"Om","info":"Info","images":"Billeder"},"info":{"title":"Kortoplysninger","description":"Konfigurer informationsrækker og enheder til at vise køretøjsdetaljer som placering, kilometertal osv. Info -genstande vises på en enkelt linje, når det er muligt, indpakning til flere linjer i smalle containere.","add_row":"Tilføj inforække","add_entity":"Tilføj infoenhed","arrange_info_rows":"Arranger info rækker","duplicate_row":"Duplikér række","delete_row":"Slet række","expand_row":"Udvid række","collapse_row":"Kollaps række","duplicate_entity":"Duplikér enhed","delete_entity":"Slet enhed","expand_entity":"Udvid enhed","collapse_entity":"Kollaps enhed","row_prefix":"Inforække","entity_prefix":"Enhed","template_mode":"Skabelontilstand","template_mode_description":"Brug en skabelon til at formatere enhedsværdien. Skabeloner giver dig mulighed for at bruge Home Assistant Templating Syntax til kompleks formatering.","template_examples_header":"Almindelige eksempler:","dynamic_icon":{"title":"Dynamisk ikonskabelon","description":"Brug en skabelon til dynamisk at vælge ikonet baseret på enhedstilstande eller betingelser.","enable":"Aktivér dynamisk ikonskabelon"},"dynamic_color":{"title":"Dynamisk farveskabelon","description":"Brug en skabelon til dynamisk at indstille farver baseret på enhedstilstande eller værdier.","enable":"Aktivér dynamisk farveskabelon"},"row_settings":{"header":"Række Indstillinger","row_name":"Række Navn","row_name_description":"Brugerdefineret navn til denne info række (lad stå tom for at bruge standard navngivning)","horizontal_alignment":"Vandret Justering","alignment_description":"Vandret justering af enheder i denne række","vertical_alignment":"Lodret Justering","vertical_alignment_description":"Kontrollerer hvordan enheder justeres lodret inden for rækken.","spacing":"Afstand","spacing_description":"Afstand mellem enheder i denne række","allow_wrap":"Tillad elementer at ombryde","allow_wrap_description":"Når aktiveret vil elementer flyde til næste linje hvis de ikke passer i én række. Når deaktiveret vil alle elementer forblive i en enkelt række."},"entity_settings":{"header":"Info Elementer","name":"Brugerdefineret Navn","entity_description":"Vælg en enhed at vise information fra","name_description":"Overskriv enhedsnavnet (lad stå tom for at bruge enhedens venlige navn)","show_icon":"Vis Ikon","icon_color":"Ikon Farve","name_color":"Navn Farve","entity_color":"Enheds Farve","icon_size":"Ikon Størrelse","name_size":"Navn Størrelse","value_size":"Værdi Størrelse","size_settings":"Størrelses Indstillinger","show_name":"Vis Navn","show_name_description":"Vis enheds navnet før værdien","click_action":"Klik Handling","navigation_path":"Navigations Sti","navigation_path_description":"Sti at navigere til når der klikkes (f.eks. /lovelace/0)","url":"URL","url_description":"URL at åbne når der klikkes","service":"Service","service_description":"Service at kalde (f.eks. light.turn_on)","service_data":"Service Data (JSON)"},"alignments":{"flex-start":"Start","center":"Center","flex-end":"Slut","space-between":"Plads mellem","space-around":"Plads omkring","space-evenly":"Jævnt fordelt plads"},"spacing":{"none":"Ingen","small":"Lille","medium":"Medium","large":"Stor"},"click_actions":{"more-info":"Mere info","navigate":"Navigér","url":"Åbn URL","call-service":"Ring til tjeneste","none":"Ingen"},"row_vertical_alignments":{"top":"Top","center":"Center","bottom":"Bund"}},"settings_subtabs":{"general":"Generelt","action_images":"Handlingsbilleder"},"action_images":{"title":"Aktionsbillede-indstillinger","description":"Konfigurer billeder, der vises når specifikke entitetstilstande er opfyldt.","add_image":"Tilføj aktionsbillede","no_images":"Ingen aktionsbilleder konfigureret endnu. Tilføj et for at komme i gang.","actions":{"drag":"Træk for at ændre rækkefølge","duplicate":"Duplikér","delete":"Slet","expand":"Udvid","collapse":"Fold sammen"},"delete_confirm":"Er du sikker på, at du vil slette dette aktionsbillede?","entity_settings":"Entitetsindstillinger","image_settings":"Billedindstillinger","entity_placeholder":"Vælg en entitet","state_placeholder":"Indtast tilstandsværdi","preview":{"no_entity":"Ingen entitet valgt","no_image":"Intet billede","any_state":"Enhver tilstand"},"trigger_entity":"Udløser Entitet","trigger_state":"Udløser Tilstand","entity_help":"Vælg en entitet at overvåge. Billedet vil blive vist, når denne entitet matcher tilstanden nedenfor.","state_help":"Indtast tilstandsværdien, der vil udløse dette billede. Lad stå tomt for at matche enhver tilstand.","image_type":{"title":"Billedtype","upload":"Upload billede","url":"Billed-URL","entity":"Entitetsbillede","none":"Ingen"},"template_mode":"Skabelon-tilstand","template_description":"Brug en skabelon til at bestemme, hvornår dette billede skal vises. Skabeloner giver dig mulighed for at bruge Home Assistant skabelon-syntaks (som {{ states.sensor.temperature.state > 70 }}) for komplekse betingelser.","template_label":"Vis skabelon","template_help":"Indtast en skabelon, der returnerer sand/falsk. Dette billede vil blive vist, når skabelonen evalueres til sand. Brug Jinja2-syntaks: {{ states(...) }}","priority":{"label":"Visningsprioritet","description":"Prioritetsbaseret bruger det første match fra top til bund. Nyeste Match bruger det sidste match fundet i listen.","options":{"priority":"Prioritetsbaseret","newest":"Nyeste Match"}}},"images":{"title":"Billeder","description":"Konfigurer billeder, der vil blive vist baseret på betingelser eller skabeloner.","add_image":"Tilføj Billede","no_images":"Ingen billeder konfigureret endnu. Tilføj et for at komme i gang.","arrange_images":"Arrangér Billeder","name":"Navn (Valgfrit)","image_type":"Billedtype","url":"Billede URL","image_entity":"Billede Entitet","priority":"Prioritet (0 = højest)","priority_mode":"Prioritetstilstand","timed_duration":"Visningstid (sekunder)","timed_duration_help":"Hvor længe dette billede skal vises, før det vender tilbage til hovedbilledet.","duplicate":"Duplikér Billede","delete":"Slet Billede","delete_confirm":"Er du sikker på, at du vil slette dette billede?","image_types":{"none":"Ingen","default":"Standard Køretøj","url":"Billede URL","upload":"Upload Billede","entity":"Entitet Billede","map":"Kort"},"priority_modes":{"order":"Rækkefølge Prioritet","order_help":"Billeder vises baseret på deres rækkefølge i listen (træk for at ændre rækkefølge).","last_triggered":"Sidst Udløst","last_triggered_help":"Det senest udløste billede vil forblive vist, indtil et andet billede udløses.","timed":"Tidsstyrede Billeder","timed_help":"Billeder under det første vil vise i en fastsat varighed og derefter vende tilbage til hovedbilledet."},"conditional_types":{"show":"Vis Når","hide":"Skjul Når"},"tabs":{"general":"Generelt","conditional":"Betinget","appearance":"Udseende"},"conditional_help":"Konfigurer hvornår dette billede skal vises baseret på entitetstilstande eller skabeloner.","conditional_help_simple":"Konfigurer hvornår dette billede skal vises baseret på entitetstilstande.","conditional_state_help":"Billedet vil blive vist, når entiteten er lig med denne tilstandsværdi.","conditional_entity":"Betinget Entitet","conditional_state":"Betinget Tilstand","basic_conditions":"Grundlæggende Betingelser","advanced_conditional":"Avancerede Skabelon Betingelser","advanced_help":"Brug skabeloner til komplekse betingelser som flere entiteter eller matematiske sammenligninger.","template_mode_active_help":"Brug skabeloner til komplekse betingelser som flere entiteter eller matematiske sammenligninger.","template_mode":{"header":"Skabelon Tilstand","enable":"Aktivér Skabelon Tilstand","template":"Skabelon"},"template_examples_header":"Almindelige Eksempler:","width":"Bredde (%)","width_settings":"Bredde Indstillinger","crop_settings":"Beskæring Indstillinger","crop_help":"Positive værdier beskærer indad, negative værdier tilføjer polstring udad.","crop_top":"Top","crop_right":"Højre","crop_bottom":"Bund","crop_left":"Venstre","fallback_image":"Reserve Billede","fallback_help":"Dette billede vil blive brugt som reserve, hvis ingen udløsere matcher eller timeout sker. Kun ét billede kan være en reserve.","map_entity":"Lokations Entitet","map_entity_help":"Vælg en entitet med breddegrad/længdegrad koordinater eller adresse til at vise på kortet.","target_entity":"Mål Entitet","target_entity_description":"Vælg entiteten at målrette med denne handling","common":{"width":"Billede Bredde","width_description":"Bredde som en procentdel af kortet","width_over_100":"Værdier over 100% kan hjælpe med at afgrøde tomt rum omkring billeder","url_description":"Indtast URL\'en til billedet"},"vehicle":{"crop":"Beskær billede"},"migration":{"title":"Forældede Billeder Opdaget","description":"Vi fandt forældede billede konfigurationer der kan migreres til det nye format.","migrate_button":"Migrér Nu","success":"Billeder migreret med succes!"}},"card_settings":{"title":"Korttitel","title_alignment":"Titeljustering","title_size":"Titelstørrelse","title_color":"Titel Farve","title_color_description":"Farve på korttitlen","title_description":"Titel vist øverst på kortet (valgfrit)","title_alignment_description":"Hvordan korttitlen er justeret","title_size_description":"Størrelse af korttitlen i pixels","colors":"Farver","card_background":"Kort Baggrund","card_background_description":"Baggrundsfarve for hele kortet","format_entities":"Formater enhedsværdier","format_entities_description":"Aktivér yderligere formatering af enhedsværdier (tilføjer kommaer, konverterer enheder osv.)","show_units":"Vis enheder","show_units_description":"Vis enheder ved siden af værdier","help_highlight":"Hjælpe med at fremhæve","help_highlight_description":"Vis visuelle højdepunkter, når du skifter mellem redaktørfaner for at hjælpe med at identificere, hvilket afsnit du redigerer","general":"Generelt","conditional_logic":"Betinget Logik","card_visibility":"Kort Synlighed","card_visibility_description":"Vis eller skjul hele kortet baseret på en entitetsbetingelse"},"vehicle_info":{"title":"Køretøjsinformation","location":{"title":"Placerings-entitet","description":"Vælg den entitet, der viser køretøjets aktuelle placering.","show":"Vis placering","show_description":"Vis køretøjets placering"},"mileage":{"title":"Kilometerstand-entitet","description":"Vælg den entitet, der repræsenterer køretøjets samlede kilometertal eller kilometertæller.","show":"Vis kilometerstand","show_description":"Vis køretøjets kilometerstand"},"car_state":{"title":"Køretøjstilstands-entitet","description":"Vælg den entitet, der repræsenterer køretøjets aktuelle tilstand (f.eks. parkeret, kører, oplader).","show":"Vis køretøjets tilstand","show_description":"Vis køretøjets tilstand"}},"crop":{"title":"Billedbeskæring","top":"Top","right":"Højre","bottom":"Bund","left":"Venstre","pixels":"PX","help":"Indtast værdier i pixels (positive eller negative) for at justere beskæring og padding"},"alignment":{"left":"Venstre","center":"Centreret","right":"Højre"},"common":{"choose_file":"Vælg fil","no_file_chosen":"Ingen fil valgt","entity":"Entitet","width":"Bredde","width_description":"Bredde som en procentdel af kortet","width_over_100":"Værdier over 100% kan hjælpe med at afgrøde tomt rum omkring billeder","none":"Ingen","default":"Standard","upload":"Upload","url":"URL","url_description":"URL der peger på billedet","reset":"Nulstil","condition_prompt":"Vælg \\"Vis\\" eller \\"Skjul\\" for at konfigurere enhedstilstand","bold":"Fed","italic":"Kursiv","uppercase":"Store bogstaver","strikethrough":"Gennemstreget"},"conditions":{"condition_type":"Betingelsestype","show_card_if":"Vis Kort Hvis","hide_card_if":"Skjul Kort Hvis","entity_description":"Vælg entiteten at kontrollere for betingelsen","state":"Tilstand","state_description":"Tilstandsværdien der udløser betingelsen"},"bars":{"title":"Procentbjælker","description":"Tilføj procentbjælker for at vise værdier som brændstofniveau, batteriopladning eller rækkevidde. Hver bjælke kan vise en primær procentværdi med valgfri etiketter til venstre og højre.","add":"Tilføj ny bjælke","duplicate":"Duplikér bjælke","delete":"Slet bjælke","expand":"Udvid bjælke","collapse":"Fold bjælke sammen","no_entity":"Ingen entitet valgt","bar_prefix":"Bjælke","template":{"description":"Brug en skabelon til at formatere den viste tekst, konvertere enheder eller vise beregnede værdier.","enable":"Aktivér skabelontilstand","template_label":"Skabelon","helper_text":"Brug Home Assistant skabelon-syntaks. Eksempler:\\n• {{ states(\'sensor.temperature\') | float * 1.8 + 32 }} °F\\n• {{ now().strftime(\\"%b %d, %H:%M\\") }}","examples_header":"Almindelige eksempler:","examples":{"temperature":"{{ states(\'sensor.temperature\') | float * 1.8 + 32 }}°F - Konverter Celsius til Fahrenheit","datetime":"{{ now().strftime(\\"%b %d, %H:%M\\") }} - Formatér aktuel dato/tid","power":"{{ \'Oplader ved \' + states(\'sensor.ev_power\') + \' kW\' }} - Kombiner tekst og sensorværdi"}},"bar_radius":{"round":"Rund","square":"Firkantet","rounded-square":"Afrundet firkant"},"tabs":{"arrange_bars":"Arrangér Bjælker","config":"Konfiguration","colors":"Farver","animation":"Animation"},"settings":{"header":"Bjælkeindstillinger","entity":"Bjælke-procententitet","entity_description":"Vælg en entitet, der returnerer en procentværdi (0-100). Dette styrer bjælkens udfyldningsniveau.","limit_entity":"Grænseværdi-entitet (valgfri)","limit_entity_description":"Valgfri: Tilføj en vertikal indikatorlinje på bjælken (f.eks. opladningsgrænse for elbilbatteri).","limit_color":"Grænseindikatorfarve","limit_color_description":"Farve på den vertikale linje, der viser grænsens position på bjælken. Ændringer vil tvinge en kortopdatering.","bar_size":"Bjælkestørrelse","bar_size_description":"Definerer tykkelsen/højden af fremskridtsbjælken.","bar_radius":"Bjælkeradius","bar_radius_description":"Form på fremskridtsbjælkens hjørner","width":"Bjælkebredde","width_description":"Definerer bredden af bjælken som en procentdel af kortets bredde.","alignment":"Etikettilpasning","alignment_description":"Hvordan venstre og højre etiketter justeres i forhold til hinanden.","show_percentage":"Vis procent","show_percentage_description":"Vis procentværdien inde i bjælken"},"percentage":{"header":"Procenttekst","display_header":"Procenttekstvisning","display_description":"Styr synligheden og udseendet af procentværdier vist direkte på bjælken. Disse tal giver en klar visuel indikator for det aktuelle niveau.","text_size":"Tekststørrelse","calculation_header":"Procentberegning","calculation_description":"Konfigurer, hvordan bjælkens procentfyldningsniveau beregnes ved hjælp af en af nedenstående muligheder.","type_header":"Procentberegning","type_label":"Procenttype","type_description":"Hvordan procentværdien vist i bjælken beregnes","type_entity":"Entitet (0-100)","type_attribute":"Enheds Attribut","type_template":"Skabelon Tilstand","type_difference":"Forskel (Mængde/Total)","amount_entity":"Mængdeentitet","amount_description":"Entitet, der repræsenterer den aktuelle mængde/værdi (tæller)","total_entity":"Totalentitet","total_description":"Entitet, der repræsenterer den samlede mængde/maksimum (nævner)"},"left_side":{"header":"Venstre side","section_description":"Konfigurer titel og entitetsværdi, der vises på venstre side af bjælken. Dette er nyttigt til at vise etiketter som \'Rækkevidde\' eller \'Batteri\' sammen med deres værdier.","toggle_description":"Vis eller skjul venstre side af bjælkeetiketten","title":"Venstre titel","title_description":"Valgfri etiket, der vises på venstre side under bjælken.","entity":"Venstre entitet","entity_description":"Entitet, hvis værdi vises på venstre side af bjælken.","alignment_description":"Styrer, hvordan denne etiket justeres under bjælken.","title_size":"Titelstørrelse","value_size":"Værdistørrelse","hidden_message":"Venstre side er skjult"},"right_side":{"header":"Højre side","section_description":"Konfigurer titel og entitetsværdi, der vises på højre side af bjælken. Dette er ideelt til supplerende information som \'Tid til fuld\' eller sekundære målinger.","toggle_description":"Vis eller skjul højre side af bjælkeetiketten","title":"Højre titel","title_description":"Valgfri etiket, der vises på højre side under bjælken.","entity":"Højre entitet","entity_description":"Entitet, hvis værdi vises på højre side af bjælken.","alignment_description":"Styrer, hvordan denne etiket justeres under bjælken.","title_size":"Titelstørrelse","value_size":"Værdistørrelse","hidden_message":"Højre side er skjult"},"colors":{"header":"Farver","bar_color":"Bjælkefarve","background_color":"Baggrundsfarve","border_color":"Kantfarve","limit_indicator_color":"Grænseindikatorfarve","left_title_color":"Venstre titelfarve","left_value_color":"Venstre værdifarve","right_title_color":"Højre titelfarve","right_value_color":"Højre værdifarve","percentage_text_color":"Procenttekstfarve","reset_color":"Nulstil til standardfarve"},"gradient":{"header":"Gradient-tilstand","description":"Skab smukke farveovergange på dine fremskridtsbjælker. Ideel til at vise batteriniveauer, brændstofmålere eller enhver statusindikator, der kræver visuel fremhævning.","toggle":"Brug gradient","toggle_description":"Brug en gradient til fremskridtsbjælken i stedet for en enkelt farve","display_mode":"Gradient-visningstilstand","display_mode_full":"Fuld","display_mode_value_based":"Værdibaseret","display_mode_cropped":"Beskåret","display_mode_description":"Fuld: Viser hele gradienten. Værdibaseret: Viser gradient op til den aktuelle værdi.","editor_header":"Gradient-editor","add_stop":"Tilføj stop"},"animation":{"header":"Handlingsanimation","description":"Tilføj animationer til bjælken, når en specifik entitet når en specifik tilstand. Perfekt til at vise opladningstilstande, alarmtilstande og mere.","pro_tip":"Pro-tip: For \'altid tændt\' animationer, vælg en animationstype, men lad entitets- og tilstandsfelterne stå tomme. Prøv \'Bobler\' og \'Fyld\' animationerne!","entity":"Animationsentitet","entity_description":"Entitet, der udløser animationen, når den matcher den angivne tilstand","state":"Entitetstilstand","state_description":"Når entitetstilstanden matcher denne værdi, vil animationen blive udløst","type":"Animationstype","type_description":"Den animationseffekt, der skal vises, når entitetstilstanden matcher","select_entity_prompt":"Vælg en entitet, og indtast den tilstand, du ønsker skal udløse animationen (eksempler: \\"charging\\", \\"on\\", \\"idle\\")","action_entity":"Handlingsenhed","action_state":"Handlingstilstand","action_description":"Denne animation tilsidesætter den almindelige animation, når den specificerede enhed er i en bestemt tilstand.","action_entity_prompt":"Vælg en handlingsenhed og stat for at definere, hvornår denne animation skal tilsidesætte den almindelige animation"},"bar_sizes":{"thin":"Tynd","regular":"Normal","thick":"Tyk","thiccc":"Ekstra tyk"},"bar_widths":{"25":"25% bredde","50":"50% bredde","75":"75% bredde","100":"100% (fuld bredde)"},"bar_alignments":{"space-between":"Mellemrum imellem","flex-start":"Venstre","center":"Centreret","flex-end":"Højre"},"bar_styles":{"flat":"Flad (standard)","glossy":"Blank","embossed":"Relief","inset":"Indsat","gradient":"Gradient-overlay","neon":"Neon-glød","outline":"Kontur","glass":"Glas","metallic":"Metallisk","neumorphic":"Neumorfisk"},"animation_types":{"none":"Ingen","charging-lines":"Opladning (diagonale linjer)","pulse":"Puls","blinking":"Blinker","bouncing":"Hopser","glow":"Glød","rainbow":"Regnbue","bubbles":"Bobler","fill":"Fyld"},"custom_bar_settings":{"title":"Tilpassede bjælkeindstillinger","description":"Definer tilpassede konfigurationer for individuelle bjælker.","name":"Bjælkenavn","entity":"Entitet","unit":"Enhed","min":"Min. værdi","max":"Maks. værdi","thresholds":"Tærskelværdier","severity":"Alvorlighedskort"},"template_mode":{"header":"Skabelon Tilstand","description":"Brug en skabelon til at formatere den viste tekst, konvertere enheder eller vise beregnede værdier.","enable":"Aktivér Skabelon Tilstand","template":"Skabelon"}},"icons":{"title":"Kortikoner","description":"Tilføj ikonrækker for at vise flere ikoner på dit kort. Hver række kan konfigureres med forskellige indstillinger. Bemærk: Ikonrækker og sektionsrækkefølge kan omarrangeres i Tilpas-fanen.","add_row":"Tilføj ikonrække","duplicate_row":"Duplikér række","delete_row":"Slet række","expand_row":"Udvid række","collapse_row":"Fold række sammen","no_row":"Ingen ikonrækker er blevet tilføjet","row_prefix":"Række","icon_prefix":"Ikon","add_icon":"Tilføj ikon","duplicate_icon":"Duplikér ikon","delete_icon":"Slet ikon","template_mode":"Skabelontilstand","template_mode_active_description":"Brug en skabelon til at bestemme, hvornår dette ikon skal være aktivt. Skabeloner giver dig mulighed for at bruge Home Assistant Templating Syntax til komplekse forhold.","template_mode_inactive_description":"Brug en skabelon til at bestemme, hvornår dette ikon skal være inaktivt. Skabeloner giver dig mulighed for at bruge Home Assistant Templating Syntax til komplekse forhold.","template_examples_header":"Almindelige eksempler:","text_formatting":"Tilstands Tekst Formatering","name_formatting":"Navn Formatering","dynamic_icon":{"title":"Dynamisk Ikon Skabelon","description":"Brug en skabelon til dynamisk at vælge ikonet baseret på enhedstilstande eller betingelser.","enable":"Aktivér Dynamisk Ikon Skabelon"},"dynamic_color":{"title":"Dynamisk Farve Skabelon","description":"Brug en skabelon til dynamisk at indstille ikonfarven baseret på enhedstilstande eller værdier.","enable":"Aktivér Dynamisk Farve Skabelon"},"enable_template_mode":"Aktivér skabelontilstand","row_settings":{"header":"Rækkeindstillinger","width":"Rækkebredde","width_description":"Bredde af rækken som en procentdel af kortets bredde","alignment":"Rækkejustering","alignment_description":"Hvordan ikoner justeres i denne række","spacing":"Ikonafstand","spacing_description":"Mængden af plads mellem ikoner i denne række","columns":"Kolonneantal","columns_description":"Antal lige store kolonner i rækken (0 = automatisk fordeling baseret på indhold)","confirmation_mode":"Bekræftelsestilstand","confirmation_mode_description":"Kræv to tryk/klik for at aktivere ikoner i denne række, hvilket forhindrer utilsigtede interaktioner","layout_info_title":"Hvordan layoutindstillinger fungerer"},"icon_settings":{"header":"Ikonliste","entity":"Entitet","entity_description":"Entitet vist med dette ikon","icon":"Ikon","icon_description":"Vælg et ikon eller indtast et brugerdefineret ikon","name":"Navn","name_description":"Brugerdefineret navn vist under ikonet (bruger entitetsnavn som standard, hvis ikke angivet)","interaction_type":"Interaktionstype","interaction_type_description":"Vælg hvordan brugere interagerer med dette ikon for at udløse handlinger","show_name":"Vis navn","show_name_description":"Vis navneteksten under ikonet","show_state":"Vis tilstand","show_state_description":"Vis entitetstilstanden under ikonet","show_units":"Vis enheder","show_units_description":"Medtag enheder når tilstanden vises","text_position":"Tekstposition","text_position_description":"Hvor navn- og tilstandsteksten er placeret i forhold til ikonet","click_action":"Klikhandling","service":"Service","service_description":"Service der skal kaldes (f.eks. light.turn_on)","service_data":"Servicedata (JSON)","service_data_description":"JSON-data sendt med servicekald","action":"Handling (JSON/Service)","action_description":"Avanceret handlingskonfiguration (se dokumentation)","navigation_path":"Navigationssti","navigation_path_description":"Sti at navigere til (f.eks. /lovelace/dashboard)","navigation_target_selector":"Navigationsmål","navigation_target_description":"Vælg fra tilgængelige dashboards, visninger eller systemsider","url":"URL","url_description":"URL der skal åbnes i en ny fane","automation_entity":"Automationsentitet","automation_entity_description":"Automation der skal udløses ved klik"},"icon_appearance":{"header":"Ikonudseende","icon":"Ikonudseende","general":"Generelt udseende","active":"Aktiv tilstand","inactive":"Inaktiv tilstand","state_conditions":"Tilstandsbetingelser","advanced":"Avancerede indstillinger","icon_size":"Ikonstørrelse","icon_size_description":"Størrelse på ikonet i pixels","text_size":"Tekststørrelse","text_size_description":"Størrelse på navn/tilstandsteksten i pixels","name_size":"Navnestørrelse","name_size_description":"Størrelse på enhedens navnekst i pixels","text_alignment":"Tekstjustering","text_alignment_description":"Hvordan teksten er justeret under ikonet","icon_background":"Ikonbaggrund","icon_background_description":"Tilføj en baggrundsform bag ikonet","icon_background_color":"Ikonbaggrundsfarve","icon_background_color_description":"Farve på baggrunden bag ikonet","container_background_color":"Container-baggrundsfarve","container_background_color_description":"Farve på baggrunden bag hele ikoncontaineren","text_appearance":"Tekstudseende","container":{"header":"Container-udseende","vertical_alignment":"Vertikal justering","vertical_alignment_description":"Justér ikonet og teksten vertikalt inden for containeren.","width":"Container-bredde","width_description":"Indstil bredden af ikoncontaineren i forhold til rækken.","background":"Container-baggrundsform","background_description":"Vælg en baggrundsform for hele ikoncontaineren."},"show_when_active":"Vis ikon når aktivt","show_when_active_description":"Vis kun dette ikon, når det er i en aktiv tilstand","template_mode":"Skabelontilstand","template_description":"Brug en skabelon til at bestemme aktiv/inaktiv tilstand. Skabeloner giver dig mulighed for at bruge Home Assistant skabelon-syntaks (som {{ states.sensor.temperature.state > 70 }}) for komplekse betingelser.","active_template":"Aktiv skabelon","active_template_description":"Skabelon der returnerer sand, når ikonet skal være aktivt.","active_state":"Aktiv tilstand","active_state_description":"Tilstandsstreng der repræsenterer \\"aktiv\\".","active_state_text":"Brugerdefineret aktiv tilstandstekst","active_state_text_description":"Tilsidesætter teksten, der vises, når ikonet er aktivt. Lad stå tomt for at bruge den faktiske tilstand.","inactive_template":"Inaktiv skabelon","inactive_template_description":"Skabelon der returnerer sand, når ikonet skal være inaktivt.","inactive_state":"Inaktiv tilstand","inactive_state_description":"Tilstandsstreng der repræsenterer \\"inaktiv\\".","inactive_state_text":"Brugerdefineret inaktiv tilstandstekst","inactive_state_text_description":"Tilsidesætter teksten, der vises, når ikonet er inaktivt. Lad stå tomt for at bruge den faktiske tilstand.","active_icon":"Aktivt ikon","inactive_icon":"Inaktivt ikon","active_icon_color":"Aktiv ikonfarve","inactive_icon_color":"Inaktiv ikonfarve","active_name_color":"Aktiv navnefarve","inactive_name_color":"Inaktiv navnefarve","active_state_color":"Aktiv tilstandsfarve","inactive_state_color":"Inaktiv tilstandsfarve","show_icon_active":"Vis ikon når aktivt","show_icon_active_description":"Vis ikonet, når tilstanden er aktiv.","show_icon_inactive":"Vis ikon når inaktivt","show_icon_inactive_description":"Vis ikonet, når tilstanden er inaktiv.","custom_active_state_text":"Brugerdefineret aktiv tilstandstekst","custom_inactive_state_text":"Brugerdefineret inaktiv tilstandstekst","action_description":"Handling der skal udføres, når der klikkes på ikonet.","show_name_active":"Vis navn når aktivt","show_name_active_description":"Vis navnet, når tilstanden er aktiv.","show_name_inactive":"Vis navn når inaktivt","show_name_inactive_description":"Vis navnet, når tilstanden er inaktiv.","show_state_active":"Vis tilstand når aktiv","show_state_active_description":"Vis tilstanden, når tilstanden er aktiv.","show_state_inactive":"Vis tilstand når inaktiv","show_state_inactive_description":"Vis tilstanden, når tilstanden er inaktiv.","use_entity_color_for_icon":"Brug enhedsfarve til ikonet","use_entity_color_for_icon_description":"Brug entitetens farveattribut til ikonet når tilgængeligt","use_entity_color_for_icon_background":"Brug enhedsfarve til ikonbaggrund","use_entity_color_for_icon_background_description":"Brug virksomhedens farveattribut til ikonbaggrunden, når den er tilgængelig","use_entity_color_for_container_background":"Brug enhedsfarve til container","use_entity_color_for_container_background_description":"Brug virksomhedens farveattribut til containerbaggrunden, når den er tilgængelig","dynamic_icon_template":"Dynamisk Ikon Skabelon","dynamic_icon_template_description":"Brug en skabelon til dynamisk at vælge ikonet baseret på enhedstilstande eller betingelser.","enable_dynamic_icon_template":"Aktivér Dynamisk Ikon Skabelon","dynamic_color_template":"Dynamisk Farve Skabelon","dynamic_color_template_description":"Brug en skabelon til dynamisk at indstille ikonfarven baseret på enhedstilstande eller værdier.","enable_dynamic_color_template":"Aktivér Dynamisk Farve Skabelon","size_settings":"Størrelses Indstillinger","value_size":"Værdi Størrelse","state_text_formatting":"Tilstandstekst Formatering","row_name":"Række Navn","row_name_description":"Brugerdefineret navn til denne ikonrække (lad stå tom for at bruge standard navngivning)","width_description":"Kontrollerer hvor meget af den tilgængelige bredde denne række vil bruge. Konfigurér hvordan denne række af ikoner vises. Bredde kontrollerer den samlede rækkebredde, afstand justerer mellemrum mellem ikoner, og kolonnetal bestemmer hvor mange ikoner der vises i hver række (0 = automatisk).","layout_info_title":"Sådan Fungerer Layout Indstillinger","layout_info_width":"Række Bredde: Kontrollerer hvor meget vandret plads rækken optager i kortet (procent af kort bredde)","layout_info_alignment":"Række Justering: Gælder kun når Kolonnetal er 0. Bestemmer hvordan ikoner positioneres inden for rækken","layout_info_spacing":"Ikon Afstand: Indstiller mængden af plads mellem ikoner","layout_info_columns":"Kolonnetal: Når sat til 0, flyder ikoner naturligt baseret på tilgængelig plads. Når sat til et tal, tvinger det præcise antal kolonner i et gitter layout","layout_info_tip":"Brug Kolonnetal med konsistente mængder ikoner per række for den mest ensartede layout","control_right_side_description":"Kontrollér hvornår højre side vises eller skjules baseret på enhedstilstand","dynamic_icon":{"title":"Dynamisk Ikon Skabelon","description":"Brug en skabelon til dynamisk at vælge ikonet baseret på enhedstilstande eller betingelser.","enable":"Aktivér Dynamisk Ikon Skabelon","template_label":"Ikon Skabelon"},"dynamic_color":{"title":"Dynamisk Farve Skabelon","description":"Brug en skabelon til dynamisk at indstille ikonfarven baseret på enhedstilstande eller værdier.","enable":"Aktivér Dynamisk Farve Skabelon","template_label":"Farve Skabelon"}},"tabs":{"general":"Generelt","actions":"Handlinger","appearance":"Udseende","states":"Tilstande","active_state":"Aktiv tilstand","inactive_state":"Inaktiv tilstand","icons":{"arrange_icon_rows":"Arrangér Ikonrækker"}},"alignments":{"flex-start":"Venstre","center":"Centreret","flex-end":"Højre","space-between":"Mellemrum imellem","space-around":"Mellemrum omkring","space-evenly":"Mellemrum jævnt fordelt"},"vertical_alignments":{"flex-start":"Top","center":"Midte","flex-end":"Bund"},"spacing":{"none":"Ingen","small":"Lille","medium":"Medium","large":"Stor"},"text_positions":{"below":"Under ikon","beside":"Ved siden af ikon","none":"Ingen tekst","top":"På toppen","left":"Til venstre","right":"Til højre"},"reset":{"size":"Nulstil til standardstørrelse","color":"Nulstil til standardfarve","all":"Nulstil til standardværdier"},"click_actions":{"toggle":"Skift","more-info":"Vis mere info","navigate":"Navigér til sti","url":"Åbn URL","call-service":"Kald service","perform-action":"Udfør handling","location-map":"Vis kort","assist":"Stemmeassistent","trigger":"Udløs","none":"Ingen handling","descriptions":{"toggle":"Skift entitetens tilstand til og fra.","more-info":"Åbner dialogboksen med yderligere information om entiteten.","navigate":"Navigér til den angivne Lovelace-sti.","url":"Åbner den angivne URL i en ny fane.","call-service":"Kalder den angivne Home Assistant-service.","perform-action":"Udfør en brugerdefineret handling (se dokumentation).","location-map":"Vis entitetens placering på et kort.","assist":"Åbn Home Assistants stemmeassistent.","trigger":"Udløs entiteten (automation, script, knap, osv).","none":"Ingen handling vil blive udført."}},"backgrounds":{"none":"Ingen","circle":"Cirkel","square":"Firkant","rounded_square":"Afrundet firkant"},"container_widths":{"25":"25% bredde","50":"50% bredde","75":"75% bredde","100":"100% (fuld bredde)"},"row_widths":{"25":"25% bredde","50":"50% bredde","75":"75% bredde","100":"100% (fuld bredde)"},"interactions":{"single":"Enkelt Tryk/Klik","double":"Dobbelt Tryk/Klik","hold":"Hold/Langt Tryk"},"animations":{"title":"Ikon Animation","active_description":"Vælg en animation at anvende når dette ikon er i aktiv tilstand.","inactive_description":"Vælg en animation at anvende når dette ikon er i inaktiv tilstand.","select_animation":"Vælg Animation","none":"Ingen","pulse":"Puls","vibrate":"Vibrér","rotate_left":"Rotér Venstre","rotate_right":"Rotér Højre","hover":"Svæve","fade":"Tone Ud","scale":"Skalér","bounce":"Hop","shake":"Ryst","tada":"Tada"},"row_vertical_alignments":{"top":"Top","center":"Midte","bottom":"Bund"},"actions":{"single":"Enkelt Klik Handling","double":"Dobbelt Klik Handling","hold":"Hold Handling","single_description":"Handling udført på et enkelt tryk/klik - mest almindelige interaktion","double_description":"Handling udført på et dobbelt tryk/klik - hjælper med at forhindre utilsigtede udløsninger","hold_description":"Handling udført når der holdes nede i 500ms - ideelt til kritiske handlinger","section_header":"Interaktions Handlinger"}},"customize":{"title":"Tilpas layout","description":"Tilpas layout, bestil og tilføj sektioner til dit kort","condition_prompt":"Vælg \\"Vis\\" eller \\"Skjul\\" for at konfigurere enhedstilstand","template_mode_active":"Brug Skabelon Tilstand","layout":{"title":"Layout Stil","description":"Vælg mellem enkelt eller dobbelt kolonnevisning for kortet","header":"Layout Indstillinger","descriptions_header":"Layout Beskrivelser","single_column":"Enkelt Kolonne","single_column_description":"Alle sektioner er stablet vertikalt i en enkelt kolonne - bedst til simple visninger og mobilvisninger.","double_column":"Dobbelt Kolonne","double_column_description":"Sektioner opdeles mellem to kolonner for effektiv brug af vandret plads - ideelt til bredere skærme.","top_view":"Topvisning","top_view_description":"Billede vises fremtrædende øverst med andre sektioner arrangeret i konfigurerbare positioner omkring det.","half_full":"Halv + Fuld","half_full_description":"Øverste række har to halve-bredde sektioner, nederste række har en fuld-bredde sektion - fantastisk til balancerede layouts.","full_half":"Fuld + Halv","full_half_description":"Øverste række har en fuld-bredde sektion, nederste række har to halve-bredde sektioner - perfekt til at fremhæve topindhold."},"layout_types":{"single":"Enkelt kolonne","double":"Dobbelt kolonne","dashboard":"Dashboard","half_full":"Halv + fuld","full_half":"Fuld + halvdel"},"column_width":{"title":"Kolonnebredde","description":"Konfigurer breddeforholdet mellem venstre og højre kolonner","50_50":"Lige (50/50)","30_70":"Smal venstre, bred højre (30/70)","70_30":"Bred venstre, smal højre (70/30)","40_60":"Lidt smallere venstre (40/60)","60_40":"Lidt bredere venstre (60/40)"},"top_view":{"header":"Dashboardindstillinger","description":"Konfigurer afstands- og layoutindstillinger for dashboardvisning","side_margin":"Sidemargener","side_margin_help":"Margener på siderne af visningen i pixels","middle_spacing":"Midterafstand","middle_spacing_help":"Afstand mellem midterkolonner i pixels","vertical_spacing":"Lodret afstand","vertical_spacing_help":"Afstand mellem rækker i pixels"},"sections":{"header":"Kortsektioner","arrangement_header":"Sektionsarrangement","arrangement_desc_base":"Træk og slip sektioner for at arrangere deres rækkefølge på kortet.","arrangement_desc_single_extra":"Alle sektioner vil blive vist i en enkelt kolonne.","arrangement_desc_double_extra":"I dobbeltkolonnevisning kan du placere enhver sektion i venstre eller højre kolonne.","arrangement_desc_dashboard_extra":"I dashboardvisning kan du placere sektioner omkring dit køretøjsbillede."},"section_labels":{"title":"Titel","image":"Køretøjsbillede","info":"Køretøjsinfo","bars":"Alle sensorbjælker","icons":"Alle ikonrækker","section_break":"Afsnit Break"},"actions":{"collapse_margins":"Skjul margener","expand_margins":"Vis margener","collapse_options":"Skjul indstillinger","expand_options":"Vis indstillinger","add_break":"Tilføj sektionsbrud","delete_break":"Slet sektionsbrud"},"css":{"header":"Global CSS","description":"Indtast brugerdefinerede CSS-regler her for at overskrive standardkortets stil. Disse regler vil blive anvendt direkte på kortet. Brug med forsigtighed.","label":"Brugerdefineret CSS","input_description":"Indtast dine brugerdefinerede CSS-regler her."},"conditions":{"header":"Betinget logik","description":"Vis eller skjul denne sektion baseret på en enheds tilstand.","template_mode_description":"Brug en skabelon til at bestemme sektionssynlighed. Skabeloner giver dig mulighed for at bruge Home Assistant skabelon-syntaks for komplekse betingelser.","type_label":"Betingelsestype","section_title":"Sektions Titel","enable_section_title":"Aktivér Sektions Titel","title_text":"Titel Tekst","title_size":"Titel Størrelse","title_color":"Titel Farve","enable_template_mode":"Aktivér Skabelon Tilstand","use_template_description":"Brug en skabelon til at bestemme hvornår denne sektion skal være synlig. Skabeloner giver dig mulighed for at bruge Home Assistant skabelon syntaks for komplekse betingelser.","info_row":"Info Række","entity_label":"Betingelsesenhed","state_label":"Betingelsestilstand","state_description":"Tilstandsværdien der udløser betingelsen","types":{"none":"Ingen (Vis altid)","show":"Vis når...","hide":"Skjul når..."}},"template":{"description":"Brug en skabelon til at bestemme hvornår denne sektion skal være synlig. Skabeloner giver dig mulighed for at bruge Home Assistant skabelon-syntaks for komplekse betingelser.","enable":"Aktivér Skabelon Tilstand"},"template_mode":{"header":"Skabelon Tilstand","description":"Brug en skabelon til at kontrollere hvornår dette billede vises eller skjules baseret på kompleks logik, beregninger eller flere enhedstilstande.","enable":"Aktivér Skabelon Tilstand","disabled_notice":"(Deaktiveret - Skabelon Tilstand Aktiv)","disabled_help":"Grundlæggende betingelses kontroller er deaktiveret når Skabelon Tilstand er aktiv. Skabelon Tilstand har forrang over grundlæggende betingelser.","examples":{"show_when_charging":"Vis under opladning","show_when_battery_low":"Vis når batteri er lavt","multiple_conditions":"Flere betingelser","show_during_day":"Vis i dagtimerne","show_when_door_unlocked":"Vis når dør er ulåst"}},"section_title":{"header":"Sektionstitel","enable":"Aktivér Sektionstitel","text":"Titeltekst","size":"Titelstørrelse","color":"Titelfarve","bold":"Fed","italic":"Kursiv","uppercase":"Store bogstaver","strikethrough":"Gennemstreget"},"margins":{"header":"Margener","top":"Topmargen","bottom":"Bundmargen"},"columns":{"left":"Venstre kolonne","right":"Højre kolonne","empty":"Træk sektioner hertil"},"dashboard":{"top":"Topsektion","top_middle":"Top-midtersektion","left_middle":"Venstre-midtersektion","middle":"Midtersektion","middle_empty":"Køretøjsbilledeområde (Anbefalet)","right_middle":"Højre-midtersektion","bottom_middle":"Bund-midtersektion","bottom":"Bundsektion"},"half_full":{"row1_col1":"Række 1 - Venstre Kolonne","row1_col2":"Række 1 - Højre Kolonne","row2_full":"Række 2, fuld bredde (100%)"},"full_half":{"row1_full":"Række 1, fuld bredde (100%)","row2_col1":"Række 2 - Venstre Kolonne","row2_col2":"Række 2 - Højre Kolonne"},"break_styles":{"blank":"Blank (ingen linje)","line":"Solid linje","double_line":"Dobbelt linje","dotted":"Stiplet linje","double_dotted":"Dobbelt prikket linje","shadow":"Skygge gradient"},"break_style":{"header":"Pause Stil","style_label":"Stil","thickness_label":"Tykkelse","width_percent_label":"Bredde (%)","color_label":"Farve"}},"container_widths":{"25":"25% bredde","50":"50% bredde","75":"75% bredde","100":"100% (fuld bredde)"},"row_widths":{"25":"25% bredde","50":"50% bredde","75":"75% bredde","100":"100% (fuld bredde)"}},"about":{"logo_alt":"Ultra Vehicle Card","developed_by":"Udviklet af","discord_button":"Tilslut dig vores Discord","docs_button":"Se vores dokumentation","donate_button":"DONÉR (PAYPAL)","github_button":"Besøg vores Github","support_title":"Støt Ultra Vehicle Card","support_description":"Dine generøse tip brændstof Udviklingen af ​​fantastiske funktioner til dette kort! Uden støtte fra brugere som dig ville fortsat innovation ikke være mulig."},"custom_icons":{"title":"Brugerdefinerede ikoner","description":"Definér brugerdefinerede ikoner for forskellige tilstande.","icon_entity":"Ikonenhed","default_icon":"Standardikon","state_icons":"Tilstandsikoner","state":"Tilstand","icon":"Ikon"},"custom_active_state_text":"Brugerdefineret aktiv tilstandstekst","custom_inactive_state_text":"Brugerdefineret inaktiv tilstandstekst","image_settings":{"title":"Billedindstillinger","description":"Konfigurer udseendet af hovedbilledet.","type":"Billedtype","width":"Billedbredde","crop":"Beskær billede","entity":"Billedenhed","entity_description":"Entitet, der leverer billed-URL"},"entity_settings":{"entity":"Enhed","entity_description":"Vælg en enhed for at få vist oplysninger fra","name":"Navn","name_description":"Tilsidesæt enhedsnavnet (lad det være tomt for at bruge enhedens venlige navn)","show_icon":"Vis ikon","icon":"Ikon","icon_color":"Ikonfarve","name_color":"Navnfarve","entity_color":"Enhedsfarve","text_color":"Enhedsfarve","show_name":"Vis navn","show_name_description":"Vis enhedsnavnet før værdien","template_mode":"Brug Skabelon til Værdi","template_mode_description":"Brug en skabelon til at formatere enhedsværdien","value_template":"Værdi skabelon","template_header":"Værdi skabelon","template_examples_header":"Skabelon-eksempler","template_basic":"Grundlæggende værdi","template_units":"Med enheder","template_round":"Runde til 1 decimal","dynamic_icon_template":"Ikon Skabelon","dynamic_color_template":"Farve Skabelon","dynamic_icon_template_mode":"Aktivér Dynamisk Ikon Skabelon","dynamic_color_template_mode":"Aktivér Dynamisk Farve Skabelon"}}');var St=a.t(xt,2);const zt=JSON.parse('{"editor":{"tabs":{"settings":"Settings","bars":"Bars","icons":"Icons","customize":"Customise","about":"About","info":"Info","images":"Images"},"info":{"title":"Card Information","description":"Configure information rows and entities to display vehicle details like location, mileage, etc. Info items will display on a single line when possible, wrapping to multiple lines in narrow containers.","add_row":"Add Info Row","add_entity":"Add Info Entity","arrange_info_rows":"Arrange Info Rows","duplicate_row":"Duplicate Row","delete_row":"Delete Row","expand_row":"Expand Row","collapse_row":"Collapse Row","duplicate_entity":"Duplicate Entity","delete_entity":"Delete Entity","expand_entity":"Expand Entity","collapse_entity":"Collapse Entity","row_prefix":"Info Row","entity_prefix":"Entity","template_mode":"Template Mode","template_mode_description":"Use a template to format the entity value. Templates allow you to use Home Assistant templating syntax for complex formatting.","template_examples_header":"Common Examples:","dynamic_icon":{"title":"Dynamic Icon Template","description":"Use a template to dynamically select the icon based on entity states or conditions.","enable":"Enable Dynamic Icon Template"},"dynamic_color":{"title":"Dynamic Colour Template","description":"Use a template to dynamically set colours based on entity states or values.","enable":"Enable Dynamic Colour Template"},"row_settings":{"header":"Row Settings","row_name":"Row Name","row_name_description":"Custom name for this info row (leave blank to use default naming)","horizontal_alignment":"Horizontal Alignment","alignment_description":"Horizontal alignment of entities in this row","vertical_alignment":"Vertical Alignment","vertical_alignment_description":"Controls how entities are aligned vertically within the row.","spacing":"Spacing","spacing_description":"Spacing between entities in this row","allow_wrap":"Allow items to wrap","allow_wrap_description":"When enabled, items will flow to the next line if they don\'t fit in one row. When disabled, all items will stay in a single row."},"entity_settings":{"header":"Info Items","name":"Custom Name","entity_description":"Select an entity to display information from","name_description":"Override the entity name (leave blank to use entity\'s friendly name)","show_icon":"Show Icon","icon_color":"Icon Colour","name_color":"Name Colour","entity_color":"Entity Colour","icon_size":"Icon Size","name_size":"Name Size","value_size":"Value Size","size_settings":"Size Settings","show_name":"Show Name","show_name_description":"Display the entity name before the value","click_action":"Click Action","navigation_path":"Navigation Path","navigation_path_description":"Path to navigate to when clicked (e.g., /lovelace/0)","url":"URL","url_description":"URL to open when clicked","service":"Service","service_description":"Service to call (e.g., light.turn_on)","service_data":"Service Data (JSON)"},"alignments":{"flex-start":"Start","center":"Centre","flex-end":"End","space-between":"Space Between","space-around":"Space Around","space-evenly":"Space Evenly"},"spacing":{"none":"None","small":"Small","medium":"Medium","large":"Large"},"click_actions":{"more-info":"More Info","navigate":"Navigate","url":"Open URL","call-service":"Call Service","none":"None"},"row_vertical_alignments":{"top":"Top","center":"Centre","bottom":"Bottom"}},"settings_subtabs":{"general":"General","action_images":"Action Images"},"action_images":{"title":"Action Images","description":"Configure images that will display when specific entity states are met.","add_image":"Add Action Image","no_images":"No action images configured yet. Add one to get started.","actions":{"drag":"Drag to reorder","duplicate":"Duplicate","delete":"Delete","expand":"Expand","collapse":"Collapse"},"delete_confirm":"Are you sure you want to delete this action image?","entity_settings":"Entity Settings","image_settings":"Image Settings","entity_placeholder":"Select an entity","state_placeholder":"Enter state value","preview":{"no_entity":"No entity selected","no_image":"No image","any_state":"Any state"},"trigger_entity":"Trigger Entity","trigger_state":"Trigger State","entity_help":"Select an entity to monitor. The image will be shown when this entity matches the state below.","state_help":"Enter the state value that will trigger this image to show. Leave blank to match any state.","image_type":{"title":"Image Type","upload":"Upload Image","url":"Image URL","entity":"Entity Image","none":"None"},"template_mode":"Template Mode","template_description":"Use a template to determine when this image should be shown. Templates allow you to use Home Assistant templating syntax (like {{ states.sensor.temperature.state > 70 }}) for complex conditions.","template_label":"Display Template","template_help":"Enter a template that returns true/false. This image will be shown when the template evaluates to true. Use Jinja2 syntax: {{ states(...) }}","priority":{"label":"Display Priority","description":"Priority Based uses the first match from top to bottom. Newest Matching uses the last match found in the list.","options":{"priority":"Priority Based","newest":"Newest Matching"}}},"images":{"title":"Images","description":"Configure images that will be displayed based on conditions or templates.","add_image":"Add Image","no_images":"No images configured yet. Add one to get started.","arrange_images":"Arrange Images","name":"Name (Optional)","image_type":"Image Type","url":"Image URL","image_entity":"Image Entity","priority":"Priority (0 = highest)","priority_mode":"Priority Mode","timed_duration":"Display Duration (seconds)","timed_duration_help":"How long this image should be displayed before returning to the main image.","duplicate":"Duplicate Image","delete":"Delete Image","delete_confirm":"Are you sure you want to delete this image?","image_types":{"none":"None","default":"Default Vehicle","url":"Image URL","upload":"Upload Image","entity":"Entity Image","map":"Map"},"priority_modes":{"order":"Order Priority","order_help":"Images are displayed based on their order in the list (drag to reorder).","last_triggered":"Last Triggered","last_triggered_help":"The most recently triggered image will stay displayed until another image is triggered.","timed":"Timed Images","timed_help":"Images below the first will show for a set duration then return to the main image."},"conditional_types":{"show":"Show When","hide":"Hide When"},"tabs":{"general":"General","conditional":"Conditional","appearance":"Appearance"},"conditional_help":"Configure when this image should be shown based on entity states or templates.","conditional_help_simple":"Configure when this image should be shown based on entity states.","conditional_state_help":"Image will be shown when the entity equals this state value.","conditional_entity":"Conditional Entity","conditional_state":"Conditional State","basic_conditions":"Basic Conditions","advanced_conditional":"Advanced Template Conditions","advanced_help":"Use templates for complex conditions like multiple entities or mathematical comparisons.","template_mode_active_help":"Use templates for complex conditions like multiple entities or mathematical comparisons.","template_mode":{"header":"Template Mode","enable":"Enable Template Mode","template":"Template"},"template_examples_header":"Common Examples:","width":"Width (%)","width_settings":"Width Settings","crop_settings":"Crop Settings","crop_help":"Positive values crop inward, negative values add padding outward.","crop_top":"Top","crop_right":"Right","crop_bottom":"Bottom","crop_left":"Left","fallback_image":"Fallback Image","fallback_help":"This image will be used as a fallback if no triggers match or timeout happens. Only one image can be a fallback.","map_entity":"Location Entity","map_entity_help":"Select an entity with latitude/longitude coordinates or address to display on the map.","target_entity":"Target Entity","target_entity_description":"Select the entity to target with this action","common":{"width":"Image Width","width_description":"Width as a percentage of the card","width_over_100":"Values over 100% can help crop empty space around images","url_description":"Enter the URL of the image"},"vehicle":{"crop":"Crop Image"},"migration":{"title":"Legacy Images Detected","description":"We found legacy image configurations that can be migrated to the new format.","migrate_button":"Migrate Now","success":"Images migrated successfully!"}},"card_settings":{"title":"Card Title","title_alignment":"Title Alignment","title_size":"Title Size","title_color":"Title Colour","title_color_description":"Colour of the card title","title_description":"Title displayed at the top of the card (optional)","title_alignment_description":"How the card title is aligned","title_size_description":"Size of the card title in pixels","colors":"Colours","card_background":"Card Background","card_background_description":"Background colour of the entire card","format_entities":"Format Entity Values","format_entities_description":"Enable additional formatting of entity values (adds commas, converts units, etc.)","show_units":"Show Units","show_units_description":"Show units alongside values","help_highlight":"Help Highlight","help_highlight_description":"Show visual highlights when switching between editor tabs to help identify which section you are editing","general":"General","conditional_logic":"Conditional Logic","card_visibility":"Card Visibility","card_visibility_description":"Show or hide the entire card based on an entity condition"},"vehicle_info":{"title":"Vehicle Information","location":{"title":"Location Entity","description":"Select the entity that shows the current location of the vehicle.","show":"Show Location","show_description":"Show the vehicle location"},"mileage":{"title":"Mileage Entity","description":"Select the entity that represents the total mileage or odometer of the vehicle.","show":"Show Mileage","show_description":"Show the vehicle mileage"},"car_state":{"title":"Vehicle State Entity","description":"Select the entity that represents the current state of the vehicle (e.g. parked, driving, charging).","show":"Show Vehicle State","show_description":"Show the vehicle state"}},"crop":{"title":"Image Crop","top":"Top","right":"Right","bottom":"Bottom","left":"Left","pixels":"px","help":"Enter values in pixels (positive or negative) to adjust cropping and padding"},"alignment":{"left":"Left","center":"Centre","right":"Right"},"common":{"choose_file":"Choose File","no_file_chosen":"No file chosen","entity":"Entity","width":"Width","width_description":"Width as a percentage of the card","width_over_100":"Values over 100% can help crop empty space around images","none":"None","default":"Default","upload":"Upload","url":"URL","url_description":"URL pointing to the image","reset":"Reset","condition_prompt":"Select \\"Show\\" or \\"Hide\\" to configure entity condition","bold":"Bold","italic":"Italic","uppercase":"Uppercase","strikethrough":"Strikethrough"},"conditions":{"condition_type":"Condition Type","show_card_if":"Show Card If","hide_card_if":"Hide Card If","entity_description":"Select the entity to check for the condition","state":"State","state_description":"The state value that triggers the condition"},"bars":{"title":"Percentage Bars","description":"Add customizable progress bars to display various metrics like battery level, range, charging status, and more. Each bar can be individually configured with colours, animations, and labels.","add":"Add Bar","duplicate":"Duplicate Bar","delete":"Delete Bar","expand":"Expand Bar","collapse":"Collapse Bar","no_entity":"No entity selected","bar_prefix":"Bar","template":{"description":"Use a template to format the displayed text, convert units, or display calculated values.","enable":"Enable Template Mode","template_label":"Template","helper_text":"Use Home Assistant templating syntax. Examples:\\n• {{ states(\'sensor.temperature\') | float * 1.8 + 32 }} °F\\n• {{ now().strftime(\\"%b %d, %H:%M\\") }}","examples_header":"Common Examples:","examples":{"temperature":"{{ states(\'sensor.temperature\') | float * 1.8 + 32 }}°F - Convert Celsius to Fahrenheit","datetime":"{{ now().strftime(\\"%b %d, %H:%M\\") }} - Format current date/time","power":"{{ \'Charging at \' + states(\'sensor.ev_power\') + \' kW\' }} - Combine text and sensor value"}},"bar_radius":{"round":"Round","square":"Square","rounded-square":"Rounded Square"},"tabs":{"arrange_bars":"Arrange Bars","config":"Configuration","colors":"Colours","animation":"Animation"},"settings":{"header":"Bar Settings","entity":"Bar Percentage Entity","entity_description":"Select an entity that returns a percentage value (0-100). This controls the bar\'s fill level.","limit_entity":"Limit Value Entity (optional)","limit_entity_description":"Optional: Add a vertical indicator line on the bar (e.g. charge limit for EV battery).","limit_color":"Limit Indicator Colour","limit_color_description":"Colour of the vertical line showing the limit position on the bar. Changes will force a card update.","bar_size":"Bar Size","bar_size_description":"Defines the thickness/height of the progress bar.","bar_radius":"Bar Radius","bar_radius_description":"Shape of the progress bar corners","width":"Bar Width","width_description":"Defines the width of the bar as a percentage of the card width.","alignment":"Label Alignment","alignment_description":"How the left and right labels align with each other.","show_percentage":"Show Percentage","show_percentage_description":"Show the percentage value inside the bar"},"percentage":{"header":"Percentage Text","display_header":"Percentage Text Display","display_description":"Control the visibility and appearance of percentage values shown directly on the bar. These numbers provide a clear visual indicator of the current level.","text_size":"Text Size","calculation_header":"Percentage Calculation","calculation_description":"Configure how the bar\'s percentage fill level is calculated using one of the options below.","type_header":"Percentage Calculation","type_label":"Percentage Type","type_description":"How to calculate the percentage value shown in the bar","type_entity":"Entity (0-100)","type_attribute":"Entity Attribute","type_template":"Template Mode","type_difference":"Difference (Amount/Total)","amount_entity":"Amount Entity","amount_description":"Entity representing the current amount/value (numerator)","total_entity":"Total Entity","total_description":"Entity representing the total amount/maximum (denominator)"},"left_side":{"header":"Left Side","section_description":"Configure the title and entity value displayed on the left side of the bar. This is useful for showing labels like \'Range\' or \'Battery\' along with their values.","toggle_description":"Show or hide the left side of the bar label","title":"Left Title","title_description":"Optional label displayed on the left side below the bar.","entity":"Left Entity","entity_description":"Entity whose value is displayed on the left side of the bar.","alignment_description":"Controls how this label is aligned under the bar.","title_size":"Title Size","value_size":"Value Size","hidden_message":"Left side is hidden"},"right_side":{"header":"Right Side","section_description":"Configure the title and entity value displayed on the right side of the bar. This is ideal for complementary information like \'Time to Full\' or secondary measurements.","toggle_description":"Show or hide the right side of the bar label","title":"Right Title","title_description":"Optional label displayed on the right side below the bar.","entity":"Right Entity","entity_description":"Entity whose value is displayed on the right side of the bar.","alignment_description":"Controls how this label is aligned under the bar.","title_size":"Title Size","value_size":"Value Size","hidden_message":"Right side is hidden"},"colors":{"header":"Colours","bar_color":"Bar Colour","background_color":"Background Colour","border_color":"Border Colour","limit_indicator_color":"Limit Indicator Colour","left_title_color":"Left Title Colour","left_value_color":"Left Value Colour","right_title_color":"Right Title Colour","right_value_color":"Right Value Colour","percentage_text_color":"Percentage Text Colour","reset_color":"Reset to default colour"},"gradient":{"header":"Gradient Mode","description":"Create beautiful colour transitions across your progress bars. Ideal for showing battery levels, fuel gauges, or any status indicator requiring visual emphasis.","toggle":"Use Gradient","toggle_description":"Use a gradient for the progress bar instead of a solid colour","display_mode":"Gradient Display Mode","display_mode_full":"Full","display_mode_value_based":"Value-Based","display_mode_cropped":"Cropped","display_mode_description":"Full: Show the entire gradient. Value-based: Show the gradient up to the current value.","editor_header":"Gradient Editor","add_stop":"Add Stop"},"animation":{"header":"Action Animation","description":"Add animations to the bar when a specific entity reaches a specific state. Perfect for showing charging states, alarm states, and more.","pro_tip":"Pro Tip: For \'always on\' animations, select an animation type but leave the entity and state fields empty. Try the \'Bubbles\' and \'Fill\' animations!","entity":"Animation Entity","entity_description":"Entity that triggers the animation when it matches the specified state","state":"Entity State","state_description":"When the entity state matches this value, the animation will be triggered","type":"Animation Type","type_description":"The animation effect to display when the entity state matches","select_entity_prompt":"Select an Entity and enter the state you want to trigger the animation (examples: \\"charging\\", \\"on\\", \\"idle\\")","action_entity":"Action Entity","action_state":"Action State","action_description":"This animation will override the regular animation when the specified entity is in a specific state.","action_entity_prompt":"Select an Action Entity and state to define when this animation should override the regular animation"},"bar_sizes":{"thin":"Thin","regular":"Regular","thick":"Thick","thiccc":"Extra Thick"},"bar_widths":{"25":"25% Width","50":"50% Width","75":"75% Width","100":"100% (Full Width)"},"bar_alignments":{"space-between":"Space Between","flex-start":"Left","center":"Centre","flex-end":"Right"},"bar_styles":{"flat":"Flat (Default)","glossy":"Glossy","embossed":"Embossed","inset":"Inset","gradient":"Gradient Overlay","neon":"Neon Glow","outline":"Outline","glass":"Glass","metallic":"Metallic","neumorphic":"Neumorphic"},"animation_types":{"none":"None","charging-lines":"Charging (Diagonal Lines)","pulse":"Pulse","blinking":"Blinking","bouncing":"Bouncing","glow":"Glow","rainbow":"Rainbow","bubbles":"Bubbles","fill":"Fill"},"custom_bar_settings":{"title":"Custom Bar Settings","description":"Define custom configurations for individual bars.","name":"Bar Name","entity":"Entity","unit":"Unit","min":"Min Value","max":"Max Value","thresholds":"Thresholds","severity":"Severity Map"},"template_mode":{"header":"Template Mode","description":"Use a template to format the displayed text, convert units, or show calculated values.","enable":"Enable Template Mode","template":"Template"}},"icons":{"title":"Card Icons","description":"Add icon rows to display multiple icons in your card. Each row can be configured with different settings. Note: Icon rows and sections order can be rearranged in the Customise tab.","add_row":"Add Icon Row","duplicate_row":"Duplicate Row","delete_row":"Delete Row","expand_row":"Expand Row","collapse_row":"Collapse Row","no_row":"No icon rows have been added","row_prefix":"Row","icon_prefix":"Icon","add_icon":"Add Icon","duplicate_icon":"Duplicate Icon","delete_icon":"Delete Icon","template_mode":"Template Mode","template_mode_active_description":"Use a template to determine when this icon should be active. Templates allow you to use Home Assistant templating syntax for complex conditions.","template_mode_inactive_description":"Use a template to determine when this icon should be inactive. Templates allow you to use Home Assistant templating syntax for complex conditions.","template_examples_header":"Common Examples:","text_formatting":"State Text Formatting","name_formatting":"Name Formatting","dynamic_icon":{"title":"Dynamic Icon Template","description":"Use a template to dynamically select the icon based on entity states or conditions.","enable":"Enable Dynamic Icon Template"},"dynamic_color":{"title":"Dynamic Colour Template","description":"Use a template to dynamically set the icon colour based on entity states or values.","enable":"Enable Dynamic Colour Template"},"enable_template_mode":"Enable Template Mode","row_settings":{"header":"Row Settings","width":"Row Width","width_description":"Width of the row as a percentage of card width","alignment":"Row Alignment","alignment_description":"How icons are aligned in this row","spacing":"Icon Spacing","spacing_description":"Amount of space between icons in this row","columns":"Column Count","columns_description":"Number of evenly-sized columns in the row (0 = auto distribution based on content)","confirmation_mode":"Confirmation Mode","confirmation_mode_description":"Require two taps/clicks to activate icons in this row, preventing accidental interactions","layout_info_title":"How Layout Settings Work"},"icon_settings":{"header":"Icon List","entity":"Entity","entity_description":"Entity displayed with this icon","icon":"Icon","icon_description":"Select an icon or enter a custom icon","name":"Name","name_description":"Custom name displayed below the icon (uses entity name by default if not specified)","interaction_type":"Interaction Type","interaction_type_description":"Choose how users interact with this icon to trigger actions","show_name":"Show Name","show_name_description":"Show the name text below the icon","show_state":"Show State","show_state_description":"Show the entity state below the icon","show_units":"Show Units","show_units_description":"Include units when showing state","text_position":"Text Position","text_position_description":"Where the name and state text is positioned relative to the icon","click_action":"Click Action","service":"Service","service_description":"Service to call (e.g. light.turn_on)","service_data":"Service Data (JSON)","service_data_description":"JSON data sent with the service call","action":"Action (JSON/Service)","action_description":"Advanced action configuration (see documentation)","navigation_path":"Navigation Path","navigation_path_description":"Path to navigate to (e.g. /lovelace/dashboard)","navigation_target_selector":"Navigation Target","navigation_target_description":"Select from available dashboards, views, or system pages","url":"URL","url_description":"URL to open in a new tab","automation_entity":"Automation Entity","automation_entity_description":"Automation to trigger when clicked"},"icon_appearance":{"header":"Icon Appearance","icon":"Icon Appearance","general":"General Appearance","active":"Active State","inactive":"Inactive State","state_conditions":"State Conditions","advanced":"Advanced Settings","icon_size":"Icon Size","icon_size_description":"Size of the icon in pixels","text_size":"Entity Size","text_size_description":"Size of the entity value text in pixels","name_size":"Name Size","name_size_description":"Size of the entity name text in pixels","text_alignment":"Text Alignment","text_alignment_description":"How the text is aligned below the icon","icon_background":"Icon Background","icon_background_description":"Add a background shape behind the icon","icon_background_color":"Icon Background Colour","icon_background_color_description":"Colour of the background behind the icon","container_background_color":"Container Background Colour","container_background_color_description":"Colour of the background behind the entire icon container","text_appearance":"Text Appearance","container":{"header":"Container Appearance","vertical_alignment":"Vertical Alignment","vertical_alignment_description":"Align the icon and text vertically within the container.","width":"Container Width","width_description":"Set the width of the icon container relative to the row.","background":"Container Background Shape","background_description":"Choose a background shape for the entire icon container."},"show_when_active":"Show Icon When Active","show_when_active_description":"Only show this icon when it\'s in an active state","template_mode":"Template Mode","template_description":"Use a template to determine active/inactive state. Templates allow you to use Home Assistant templating syntax (like {{ states.sensor.temperature.state > 70 }}) for complex conditions.","active_template":"Active Template","active_template_description":"Template that returns true when the icon should be active.","active_state":"Active state","active_state_description":"State string that represents \\"active\\".","active_state_text":"Custom Active State Text","active_state_text_description":"Overrides the text displayed when the icon is active. Leave empty to use the actual state.","inactive_template":"Inactive Template","inactive_template_description":"Template that returns true when the icon should be inactive.","inactive_state":"Inactive state","inactive_state_description":"State string that represents \\"inactive\\".","inactive_state_text":"Custom Inactive State Text","inactive_state_text_description":"Overrides the text displayed when the icon is inactive. Leave empty to use the actual state.","active_icon":"Active icon","inactive_icon":"Inactive icon","active_icon_color":"Active Icon Colour","inactive_icon_color":"Inactive Icon Colour","active_name_color":"Active Name Colour","inactive_name_color":"Inactive Name Colour","active_state_color":"Active State Colour","inactive_state_color":"Inactive State Colour","show_icon_active":"Show icon when active","show_icon_active_description":"Display the icon when the state is active.","show_icon_inactive":"Show Icon When Inactive","show_icon_inactive_description":"Display the icon when the state is inactive.","custom_active_state_text":"Custom Active State Text","custom_inactive_state_text":"Custom Inactive State Text","action_description":"Action to perform when the icon is clicked.","show_name_active":"Show Name When Active","show_name_active_description":"Display the name when the state is active.","show_name_inactive":"Show Name When Inactive","show_name_inactive_description":"Display the name when the state is inactive.","show_state_active":"Show State When Active","show_state_active_description":"Display the state when the state is active.","show_state_inactive":"Show State When Inactive","show_state_inactive_description":"Display the state when the state is inactive.","use_entity_color_for_icon":"Use Entity Colour for Icon","use_entity_color_for_icon_description":"Use this entity\'s colour attribute (if available) instead of the configured colour","use_entity_color_for_icon_background":"Use Entity Colour for Icon Background","use_entity_color_for_icon_background_description":"Use the entity\'s colour attribute for the icon background when available","use_entity_color_for_container_background":"Use Entity Colour for Container","use_entity_color_for_container_background_description":"Use the entity\'s colour attribute for the container background when available","dynamic_icon_template":"Dynamic Icon Template","dynamic_icon_template_description":"Use a template to dynamically select the icon based on entity states or conditions.","enable_dynamic_icon_template":"Enable Dynamic Icon Template","dynamic_color_template":"Dynamic Colour Template","dynamic_color_template_description":"Use a template to dynamically set the icon colour based on entity states or values.","enable_dynamic_color_template":"Enable Dynamic Colour Template","size_settings":"Size Settings","value_size":"Value Size","state_text_formatting":"State Text Formatting","row_name":"Row Name","row_name_description":"Custom name for this icon row (leave blank to use default naming)","width_description":"Controls how much of the available width this row will use. Configure how this row of icons displays. Width controls the overall row width, spacing adjusts gaps between icons, and column count determines how many icons appear in each row (0 = automatic).","layout_info_title":"How Layout Settings Work","layout_info_width":"Row Width: Controls how much horizontal space the row takes up in the card (percentage of card width)","layout_info_alignment":"Row Alignment: Only applies when Column Count is 0. Determines how icons are positioned within the row","layout_info_spacing":"Icon Spacing: Sets the amount of space between icons","layout_info_columns":"Column Count: When set to 0, icons flow naturally based on available space. When set to a number, forces that exact number of columns in a grid layout","layout_info_tip":"Use Column Count with consistent amounts of icons per row for the most uniform layout","control_right_side_description":"Control when the right side is shown or hidden based on entity state","dynamic_icon":{"title":"Dynamic Icon Template","description":"Use a template to dynamically select the icon based on entity states or conditions.","enable":"Enable Dynamic Icon Template","template_label":"Icon Template"},"dynamic_color":{"title":"Dynamic Colour Template","description":"Use a template to dynamically set the icon colour based on entity states or values.","enable":"Enable Dynamic Colour Template","template_label":"Colour Template"}},"tabs":{"general":"General","actions":"Actions","appearance":"Appearance","states":"States","active_state":"Active State","inactive_state":"Inactive State","icons":{"arrange_icon_rows":"Arrange Icon Rows"}},"alignments":{"flex-start":"Left","center":"Centre","flex-end":"Right","space-between":"Space Between","space-around":"Space Around","space-evenly":"Space Evenly"},"vertical_alignments":{"flex-start":"Top","center":"Middle","flex-end":"Bottom"},"spacing":{"none":"None","small":"Small","medium":"Medium","large":"Large"},"text_positions":{"below":"Below Icon","beside":"Beside Icon","none":"No Text","top":"On Top","left":"On Left","right":"On Right"},"reset":{"size":"Reset to default size","color":"Reset to default colour","all":"Reset to default values"},"click_actions":{"toggle":"Toggle","more-info":"Show More Info","navigate":"Navigate to Path","url":"Open URL","call-service":"Call Service","perform-action":"Perform Action","location-map":"Show Map","assist":"Voice Assistant","trigger":"Trigger","none":"No Action","descriptions":{"toggle":"Toggle the entity\'s state on and off.","more-info":"Opens the more info dialogue with additional information about the entity.","navigate":"Navigate to the specified Lovelace path.","url":"Opens the specified URL in a new tab.","call-service":"Call the specified Home Assistant service.","perform-action":"Perform a custom action (see documentation).","location-map":"Show the entity\'s location on a map.","assist":"Open Home Assistant\'s voice assistant.","trigger":"Trigger the entity (automation, script, button, etc).","none":"No action will be performed."}},"backgrounds":{"none":"None","circle":"Circle","square":"Square","rounded_square":"Rounded Square"},"container_widths":{"25":"25% Width","50":"50% Width","75":"75% Width","100":"100% (Full Width)"},"row_widths":{"25":"25% Width","50":"50% Width","75":"75% Width","100":"100% (Full Width)"},"interactions":{"single":"Single Tap/Click","double":"Double Tap/Click","hold":"Hold/Long Press"},"animations":{"title":"Icon Animation","active_description":"Select an animation to apply when this icon is in the active state.","inactive_description":"Select an animation to apply when this icon is in the inactive state.","select_animation":"Select Animation","none":"None","pulse":"Pulse","vibrate":"Vibrate","rotate_left":"Rotate Left","rotate_right":"Rotate Right","hover":"Hover","fade":"Fade","scale":"Scale","bounce":"Bounce","shake":"Shake","tada":"Tada"},"row_vertical_alignments":{"top":"Top","center":"Centre","bottom":"Bottom"},"actions":{"single":"Single Click Action","double":"Double Click Action","hold":"Hold Action","single_description":"Action performed on a single tap/click - most common interaction","double_description":"Action performed on a double tap/click - helps prevent accidental triggers","hold_description":"Action performed when holding down for 500ms - ideal for critical actions","section_header":"Interaction Actions"}},"customize":{"title":"Customise Layout","description":"Customise layout, order, and add sections to your card","condition_prompt":"Select \\"Show\\" or \\"Hide\\" to configure entity condition","template_mode_active":"Use Template Mode","layout":{"title":"Layout Style","description":"Choose between a single or double column layout for the card","header":"Layout Settings","descriptions_header":"Layout Descriptions","single_column":"Single Column","single_column_description":"All sections are stacked vertically in a single column - best for simple displays and mobile views.","double_column":"Double Column","double_column_description":"Sections are split between two columns for efficient use of horizontal space - ideal for wider screens.","top_view":"Top View","top_view_description":"Image is prominently displayed at the top with other sections arranged in configurable positions around it.","half_full":"Half + Full","half_full_description":"Top row has two half-width sections, bottom row has one full-width section - great for balanced layouts.","full_half":"Full + Half","full_half_description":"Top row has one full-width section, bottom row has two half-width sections - perfect for highlighting top content."},"layout_types":{"single":"Single Column","double":"Double Column","dashboard":"Top View","half_full":"Half + Full","full_half":"Full + Half"},"column_width":{"title":"Column Width","description":"Configure the width ratio between left and right columns","50_50":"Equal (50/50)","30_70":"Narrow left, wide right (30/70)","70_30":"Wide left, narrow right (70/30)","40_60":"Slightly narrow left (40/60)","60_40":"Slightly wide left (60/40)"},"top_view":{"header":"Top View Layout Settings","description":"Configure the spacing and layout settings for top view","side_margin":"Side Margin","side_margin_help":"Margin on the sides of the view in pixels","middle_spacing":"Middle Spacing","middle_spacing_help":"Space between middle columns in pixels","vertical_spacing":"Vertical Spacing","vertical_spacing_help":"Space between rows in pixels"},"sections":{"header":"Card Sections","arrangement_header":"Section Arrangement","arrangement_desc_base":"Drag and drop sections to arrange their order on the card.","arrangement_desc_single_extra":"All sections will be displayed in a single column.","arrangement_desc_double_extra":"In a double column layout, you can place any section in the left or right column.","arrangement_desc_dashboard_extra":"In a Top View layout, you can place sections around your vehicle image."},"section_labels":{"title":"Title","image":"Vehicle Image","info":"Vehicle Information","bars":"All Sensor Bars","icons":"All Icon Rows","section_break":"Section Break"},"actions":{"collapse_margins":"Collapse Margins","expand_margins":"Expand Margins","collapse_options":"Collapse Options","expand_options":"Expand Options","add_break":"Add Section Break","delete_break":"Delete Section Break"},"css":{"header":"Global CSS","description":"Enter custom CSS rules here to override default card styling. These rules will be applied directly to the card. Use with caution.","label":"Custom CSS","input_description":"Enter your custom CSS rules here."},"conditions":{"header":"Conditional Logic","description":"Show or hide this section based on an entity\'s state.","template_mode_description":"Use a template to determine section visibility. Templates allow you to use Home Assistant templating syntax for complex conditions.","type_label":"Condition Type","section_title":"Section Title","enable_section_title":"Enable Section Title","title_text":"Title Text","title_size":"Title Size","title_color":"Title Colour","enable_template_mode":"Enable Template Mode","use_template_description":"Use a template to determine when this section should be visible. Templates allow you to use Home Assistant templating syntax for complex conditions.","info_row":"Info Row","entity_label":"Condition Entity","state_label":"Condition State","state_description":"The state value that triggers the condition","types":{"none":"None (Always Show)","show":"Show When...","hide":"Hide When..."}},"template":{"description":"Use a template to determine when this section should be visible. Templates allow you to use Home Assistant templating syntax for complex conditions.","enable":"Enable Template Mode"},"template_mode":{"header":"Template Mode","description":"Use a template to control when this image is shown or hidden based on complex logic, calculations, or multiple entity states.","enable":"Enable Template Mode","disabled_notice":"(Disabled - Template Mode Active)","disabled_help":"Basic condition controls are disabled when Template Mode is active. Template Mode takes precedence over basic conditions.","examples":{"show_when_charging":"Show when charging","show_when_battery_low":"Show when battery low","multiple_conditions":"Multiple conditions","show_during_day":"Show during day hours","show_when_door_unlocked":"Show when door unlocked"}},"section_title":{"header":"Section Title","enable":"Enable Section Title","text":"Title Text","size":"Title Size","color":"Title Colour","bold":"Bold","italic":"Italic","uppercase":"Uppercase","strikethrough":"Strikethrough"},"margins":{"header":"Margins","top":"Top Margin","bottom":"Bottom Margin"},"columns":{"left":"Left Column","right":"Right Column","empty":"Drop sections here"},"dashboard":{"top":"Top Section","top_middle":"Top Middle Section","left_middle":"Left Middle Section","middle":"Middle Section","middle_empty":"Vehicle Image Area (Recommended)","right_middle":"Right Middle Section","bottom_middle":"Bottom Middle Section","bottom":"Bottom Section"},"half_full":{"row1_col1":"Row 1, Left (50%)","row1_col2":"Row 1, Right (50%)","row2_full":"Row 2, Full Width (100%)"},"full_half":{"row1_full":"Row 1, Full Width (100%)","row2_col1":"Row 2, Left (50%)","row2_col2":"Row 2, Right (50%)"},"break_styles":{"blank":"Blank (No Line)","line":"Solid Line","double_line":"Double Line","dotted":"Dotted Line","double_dotted":"Double Dotted Line","shadow":"Shadow Gradient"},"break_style":{"header":"Break Style","style_label":"Style","thickness_label":"Thickness","width_percent_label":"Width (%)","color_label":"Colour"}},"container_widths":{"25":"25% Width","50":"50% Width","75":"75% Width","100":"100% (Full Width)"},"row_widths":{"25":"25% Width","50":"50% Width","75":"75% Width","100":"100% (Full Width)"}},"about":{"logo_alt":"Ultra Vehicle Card","developed_by":"Developed by","discord_button":"Join Our Discord","docs_button":"View Our Documentation","donate_button":"DONATE (PAYPAL)","github_button":"Visit Our Github","support_title":"Support Ultra Vehicle Card","support_description":"Your generous tips fuel the development of amazing features for this card! Without support from users like you, continued innovation wouldn\'t be possible."},"custom_icons":{"title":"Custom Icons","description":"Define custom icons for different states.","icon_entity":"Icon Entity","default_icon":"Default Icon","state_icons":"State Icons","state":"State","icon":"Icon"},"custom_active_state_text":"Custom Active State Text","custom_inactive_state_text":"Custom Inactive State Text","image_settings":{"title":"Image Settings","description":"Configure the main image appearance.","type":"Image Type","width":"Image Width","crop":"Image Crop","entity":"Image Entity","entity_description":"Entity that provides the image URL"},"entity_settings":{"entity":"Entity","entity_description":"Select an entity to display information from","name":"Custom Name","name_description":"Override the entity name (leave blank to use entity\'s friendly name)","show_icon":"Show Icon","icon":"Icon","icon_color":"Icon Colour","name_color":"Name Colour","entity_color":"Entity Colour","text_color":"Text Colour","show_name":"Show Name","show_name_description":"Display the entity name before the value","template_mode":"Template Mode","template_mode_description":"Use a template to format the entity value","value_template":"Value Template","template_header":"Value Template","template_examples_header":"Common Examples:","template_basic":"Basic value","template_units":"With units","template_round":"Round to 1 decimal","dynamic_icon_template":"Icon Template","dynamic_color_template":"Colour Template","dynamic_icon_template_mode":"Enable Dynamic Icon Template","dynamic_color_template_mode":"Enable Dynamic Colour Template"}}');var Ct=a.t(zt,2);const Tt=JSON.parse('{"editor":{"tabs":{"settings":"Instellingen","bars":"Balken","icons":"Pictogrammen","customize":"Aanpassen","about":"Over","info":"Info","images":"Afbeeldingen"},"info":{"title":"Kaartinformatie","description":"Configureer informatie rijen en entiteiten om voertuigdetails zoals locatie, kilometerstand, enz. Toon te geven, enz. Info -items worden indien mogelijk op een enkele regel weergegeven, die in meerdere lijnen in smalle containers wikkelt.","add_row":"Info rij toevoegen","add_entity":"Info entiteit toevoegen","arrange_info_rows":"Schik info -rijen","duplicate_row":"Rij dupliceren","delete_row":"Rij verwijderen","expand_row":"Rij uitklappen","collapse_row":"Rij inklappen","duplicate_entity":"Entiteit dupliceren","delete_entity":"Entiteit verwijderen","expand_entity":"Entiteit uitklappen","collapse_entity":"Entiteit inklappen","row_prefix":"Info rij","entity_prefix":"Entiteit","template_mode":"Sjabloonmodus","template_mode_description":"Gebruik een sjabloon om de entiteitswaarde te formatteren. Met sjablonen kunt u de syntaxis van thuisassistent -sjabloon gebruiken voor complexe opmaak.","template_examples_header":"Veel voorkomende voorbeelden:","dynamic_icon":{"title":"Dynamische icoon sjabloon","description":"Gebruik een sjabloon om dynamisch het icoon te selecteren op basis van entiteit statussen of voorwaarden.","enable":"Dynamische icoon sjabloon inschakelen"},"dynamic_color":{"title":"Dynamische kleur sjabloon","description":"Gebruik een sjabloon om dynamisch kleuren in te stellen op basis van entiteit statussen of waarden.","enable":"Dynamische kleur sjabloon inschakelen"},"row_settings":{"header":"Rij instellingen","row_name":"Rij naam","row_name_description":"Aangepaste naam voor deze info rij (laat leeg om standaard naamgeving te gebruiken)","horizontal_alignment":"Horizontale uitlijning","alignment_description":"Horizontale uitlijning van entiteiten in deze rij","vertical_alignment":"Verticale uitlijning","vertical_alignment_description":"Bepaalt hoe entiteiten verticaal worden uitgelijnd binnen de rij.","spacing":"Afstand","spacing_description":"Afstand tussen entiteiten in deze rij","allow_wrap":"Items laten inpakken","allow_wrap_description":"Wanneer ingeschakeld, gaan items naar de volgende regel als ze niet in één rij passen. Wanneer uitgeschakeld, blijven alle items in één rij."},"entity_settings":{"header":"Info items","name":"Aangepaste naam","entity_description":"Selecteer een entiteit om informatie van weer te geven","name_description":"Overschrijf de entiteit naam (laat leeg om de vriendelijke naam van de entiteit te gebruiken)","show_icon":"Toon icoon","icon_color":"Icoon kleur","name_color":"Naam kleur","entity_color":"Entiteit kleur","icon_size":"Icoon grootte","name_size":"Naam grootte","value_size":"Waarde grootte","size_settings":"Grootte instellingen","show_name":"Toon naam","show_name_description":"Toon de entiteit naam voor de waarde","click_action":"Klik actie","navigation_path":"Navigatie pad","navigation_path_description":"Pad om naar te navigeren wanneer erop geklikt wordt (bijv. /lovelace/0)","url":"URL","url_description":"URL om te openen wanneer erop geklikt wordt","service":"Service","service_description":"Service om aan te roepen (bijv. light.turn_on)","service_data":"Service gegevens (JSON)"},"alignments":{"flex-start":"Begin","center":"Midden","flex-end":"Einde","space-between":"Ruimte tussen","space-around":"Ruimte rondom","space-evenly":"Gelijkmatige ruimte"},"spacing":{"none":"Geen","small":"Klein","medium":"Gemiddeld","large":"Groot"},"click_actions":{"more-info":"Meer info","navigate":"Navigeren","url":"URL openen","call-service":"Service aanroepen","none":"Geen"},"row_vertical_alignments":{"top":"Boven","center":"Midden","bottom":"Onder"}},"settings_subtabs":{"general":"Algemeen","action_images":"Actieafbeeldingen"},"action_images":{"title":"Actie Afbeeldingen Instellingen","description":"Configureer afbeeldingen die worden weergegeven wanneer aan specifieke entiteitstatus wordt voldaan.","add_image":"Actie Afbeelding Toevoegen","no_images":"Er zijn nog geen actie afbeeldingen geconfigureerd. Voeg er een toe om te beginnen.","actions":{"drag":"Slepen om te herordenen","duplicate":"Dupliceren","delete":"Verwijderen","expand":"Uitklappen","collapse":"Inklappen"},"delete_confirm":"Weet je zeker dat je deze actie afbeelding wilt verwijderen?","entity_settings":"Entiteitsinstellingen","image_settings":"Afbeeldingsinstellingen","entity_placeholder":"Selecteer een entiteit","state_placeholder":"Voer statuswaarde in","preview":{"no_entity":"Geen entiteit geselecteerd","no_image":"Geen afbeelding","any_state":"Elke status"},"trigger_entity":"Trigger Entiteit","trigger_state":"Trigger Status","entity_help":"Selecteer een entiteit om te monitoren. De afbeelding wordt getoond wanneer deze entiteit overeenkomt met de onderstaande status.","state_help":"Voer de statuswaarde in die deze afbeelding zal activeren. Laat leeg om overeen te komen met elke status.","image_type":{"title":"Afbeeldingstype","upload":"Afbeelding Uploaden","url":"Afbeelding URL","entity":"Entiteit Afbeelding","none":"Geen"},"template_mode":"Sjabloonmodus","template_description":"Gebruik een sjabloon om te bepalen wanneer deze afbeelding moet worden getoond. Met sjablonen kunt u de syntax van Home Assistant-sjablonen gebruiken (zoals {{ states.sensor.temperature.state > 70 }}) voor complexe voorwaarden.","template_label":"Weergavesjabloon","template_help":"Voer een sjabloon in dat waar/onwaar retourneert. Deze afbeelding wordt getoond wanneer het sjabloon evalueert naar waar. Gebruik Jinja2-syntax: {{ states(...) }}","priority":{"label":"Weergave Prioriteit","description":"Op Prioriteit Gebaseerd gebruikt de eerste overeenkomst van boven naar beneden. Nieuwste Overeenkomst gebruikt de laatste overeenkomst gevonden in de lijst.","options":{"priority":"Op Prioriteit Gebaseerd","newest":"Nieuwste Overeenkomst"}}},"images":{"title":"Afbeeldingen","description":"Configureer afbeeldingen die worden weergegeven op basis van voorwaarden of sjablonen.","add_image":"Afbeelding Toevoegen","no_images":"Nog geen afbeeldingen geconfigureerd. Voeg er een toe om te beginnen.","arrange_images":"Afbeeldingen Rangschikken","name":"Naam (Optioneel)","image_type":"Afbeeldingstype","url":"Afbeelding URL","image_entity":"Afbeelding Entiteit","priority":"Prioriteit (0 = hoogste)","priority_mode":"Prioriteitsmodus","timed_duration":"Weergaveduur (seconden)","timed_duration_help":"Hoe lang deze afbeelding moet worden weergegeven voordat deze terugkeert naar de hoofdafbeelding.","duplicate":"Afbeelding Dupliceren","delete":"Afbeelding Verwijderen","delete_confirm":"Weet je zeker dat je deze afbeelding wilt verwijderen?","image_types":{"none":"Geen","default":"Standaard Voertuig","url":"Afbeelding URL","upload":"Afbeelding Uploaden","entity":"Entiteit Afbeelding","map":"Kaart"},"priority_modes":{"order":"Volgorde Prioriteit","order_help":"Afbeeldingen worden weergegeven op basis van hun volgorde in de lijst (sleep om opnieuw te ordenen).","last_triggered":"Laatst Geactiveerd","last_triggered_help":"De meest recent geactiveerde afbeelding blijft weergegeven totdat een andere afbeelding wordt geactiveerd.","timed":"Getimede Afbeeldingen","timed_help":"Afbeeldingen onder de eerste worden voor een ingestelde duur getoond en keren dan terug naar de hoofdafbeelding."},"conditional_types":{"show":"Tonen Wanneer","hide":"Verbergen Wanneer"},"tabs":{"general":"Algemeen","conditional":"Voorwaardelijk","appearance":"Uiterlijk"},"conditional_help":"Configureer wanneer deze afbeelding moet worden getoond op basis van entiteitsstatussen of sjablonen.","conditional_help_simple":"Configureer wanneer deze afbeelding moet worden getoond op basis van entiteitsstatussen.","conditional_state_help":"Afbeelding wordt getoond wanneer de entiteit gelijk is aan deze statuswaarde.","conditional_entity":"Voorwaardelijke Entiteit","conditional_state":"Voorwaardelijke Status","basic_conditions":"Basis Voorwaarden","advanced_conditional":"Geavanceerde Sjabloon Voorwaarden","advanced_help":"Gebruik sjablonen voor complexe voorwaarden zoals meerdere entiteiten of wiskundige vergelijkingen.","template_mode_active_help":"Gebruik sjablonen voor complexe voorwaarden zoals meerdere entiteiten of wiskundige vergelijkingen.","template_mode":{"header":"Sjabloon Modus","enable":"Sjabloon Modus Inschakelen","template":"Sjabloon"},"template_examples_header":"Algemene Voorbeelden:","width":"Breedte (%)","width_settings":"Breedte Instellingen","crop_settings":"Bijsnijd Instellingen","crop_help":"Positieve waarden snijden naar binnen, negatieve waarden voegen naar buiten opvulling toe.","crop_top":"Boven","crop_right":"Rechts","crop_bottom":"Onder","crop_left":"Links","fallback_image":"Terugval Afbeelding","fallback_help":"Deze afbeelding wordt gebruikt als terugval als geen triggers overeenkomen of time-out optreedt. Slechts één afbeelding kan een terugval zijn.","map_entity":"Locatie Entiteit","map_entity_help":"Selecteer een entiteit met breedtegraad/lengtegraad coördinaten of adres om op de kaart weer te geven.","target_entity":"Doel Entiteit","target_entity_description":"Selecteer de entiteit om te targeten met deze actie","common":{"width":"Afbeelding Breedte","width_description":"Breedte als percentage van de kaart","width_over_100":"Waarden van meer dan 100% kunnen helpen om lege ruimte rond beelden bij te knippen","url_description":"Voer de URL van de afbeelding in"},"vehicle":{"crop":"Afbeelding bijsnijden"},"migration":{"title":"Legacy Afbeeldingen Gedetecteerd","description":"We hebben legacy afbeelding configuraties gevonden die naar het nieuwe formaat kunnen worden gemigreerd.","migrate_button":"Nu Migreren","success":"Afbeeldingen succesvol gemigreerd!"}},"card_settings":{"title":"Kaarttitel","title_alignment":"Titeluitlijning","title_size":"Titelgrootte","title_color":"Titel Kleur","title_color_description":"Kleur van de kaarttitel","title_description":"Titel weergegeven bovenaan de kaart (optioneel)","title_alignment_description":"Hoe de kaarttitel wordt uitgelijnd","title_size_description":"Grootte van de kaarttitel in pixels","colors":"Kleuren","card_background":"Kaart Achtergrond","card_background_description":"Achtergrondkleur van de hele kaart","format_entities":"Entiteitswaarden formatteren","format_entities_description":"Schakelt extra formattering van entiteitswaarden in (voegt komma\'s toe, converteert eenheden, etc.)","show_units":"Eenheden tonen","show_units_description":"Toon eenheden naast waarden","help_highlight":"Help markeren","help_highlight_description":"Toon visuele hoogtepunten bij het schakelen tussen de tabbladen van de editor om te helpen identificeren welk gedeelte u bewerkt","general":"Algemeen","conditional_logic":"Voorwaardelijke Logica","card_visibility":"Kaart Zichtbaarheid","card_visibility_description":"Toon of verberg de hele kaart op basis van een entiteitsvoorwaarde"},"vehicle_info":{"title":"Voertuiginformatie","location":{"title":"Locatie-entiteit","description":"Selecteer de entiteit die de huidige locatie van het voertuig weergeeft.","show":"Toon locatie","show_description":"Toon de locatie van het voertuig"},"mileage":{"title":"Kilometerstand-entiteit","description":"Selecteer de entiteit die de totale kilometerstand of de kilometerteller van het voertuig weergeeft.","show":"Toon kilometerstand","show_description":"Toon de kilometerstand van het voertuig"},"car_state":{"title":"Voertuigstatus-entiteit","description":"Selecteer de entiteit die de huidige status van het voertuig weergeeft (bijv. geparkeerd, rijdend, aan het opladen).","show":"Toon voertuigstatus","show_description":"Toon de status van het voertuig"}},"crop":{"title":"Afbeelding bijsnijden","top":"Boven","right":"Rechts","bottom":"Onder","left":"Links","pixels":"px","help":"Voer pixelwaarden in (positief of negatief) om bijsnijden en opvulling aan te passen"},"alignment":{"left":"Links","center":"Midden","right":"Rechts"},"common":{"choose_file":"Kies bestand","no_file_chosen":"Geen bestand gekozen","entity":"Entiteit","width":"Breedte","width_description":"Breedte als percentage van de kaart","width_over_100":"Waarden van meer dan 100% kunnen helpen om lege ruimte rond beelden bij te knippen","none":"Geen","default":"Standaard","upload":"Uploaden","url":"URL","url_description":"URL die naar de afbeelding verwijst","reset":"Resetten","condition_prompt":"Selecteer \\"Toon\\" of \\"verbergen\\" om entiteitsconditie te configureren","bold":"Vet","italic":"Cursief","uppercase":"Hoofdletters","strikethrough":"Doorhalen"},"conditions":{"condition_type":"Voorwaarde Type","show_card_if":"Toon Kaart Als","hide_card_if":"Verberg Kaart Als","entity_description":"Selecteer de entiteit om te controleren voor de voorwaarde","state":"Status","state_description":"De statuswaarde die de voorwaarde activeert"},"bars":{"title":"Percentagebalken","description":"Voeg percentagebalken toe om waarden zoals brandstofniveau, batterijlading of bereik weer te geven. Elke balk kan een primaire percentagewaarde weergeven met optionele labels links en rechts.","add":"Nieuwe balk toevoegen","duplicate":"Balk dupliceren","delete":"Balk verwijderen","expand":"Balk uitvouwen","collapse":"Balk samenvouwen","no_entity":"Geen entiteit geselecteerd","bar_prefix":"Balk","template":{"description":"Gebruik een sjabloon om de weergegeven tekst op te maken, eenheden te converteren of berekende waarden weer te geven.","enable":"Sjabloonmodus inschakelen","template_label":"Sjabloon","helper_text":"Gebruik Home Assistant sjabloonsyntax. Voorbeelden:\\n• {{ states(\'sensor.temperature\') | float * 1.8 + 32 }} °F\\n• {{ now().strftime(\\"%b %d, %H:%M\\") }}","examples_header":"Veel voorkomende voorbeelden:","examples":{"temperature":"{{ states(\'sensor.temperature\') | float * 1.8 + 32 }}°F - Converteer Celsius naar Fahrenheit","datetime":"{{ now().strftime(\\"%b %d, %H:%M\\") }} - Formatteer huidige datum/tijd","power":"{{ \'Opladen met \' + states(\'sensor.ev_power\') + \' kW\' }} - Combineer tekst en sensorwaarde"}},"bar_radius":{"round":"Rond","square":"Vierkant","rounded-square":"Afgerond Vierkant"},"tabs":{"arrange_bars":"Balken rangschikken","config":"Configuratie","colors":"Kleuren","animation":"Animatie"},"settings":{"header":"Balk Configuratie","entity":"Hoofdentiteit","entity_description":"Entiteit die de primaire waarde (0-100) voor de voortgangsbalk levert","limit_entity":"Limietentiteit","limit_entity_description":"Entiteit die een limietmarkering op de balk toont (bijv. oplaadlimiet)","limit_color":"Limietindicator Kleur","limit_color_description":"Kleur van de limietindicatorlijn","bar_size":"Balkdikte","bar_size_description":"Grootte/dikte van de voortgangsbalk","bar_radius":"Balkradius","bar_radius_description":"Vorm van de hoeken van de voortgangsbalk","width":"Balkbreedte","width_description":"Breedte van de voortgangsbalk als percentage van de beschikbare ruimte. Gebruik dit om meerdere balken naast elkaar te plaatsen.","alignment":"Label Uitlijning","alignment_description":"Hoe de labels op de voortgangsbalk worden uitgelijnd","show_percentage":"Percentage Tonen","show_percentage_description":"Toon de percentagewaarde in de balk"},"percentage":{"header":"Percentagetekst","display_header":"Percentagetekst Weergave","display_description":"Beheer de zichtbaarheid en het uiterlijk van percentagewaarden die direct op de balk worden weergegeven. Deze getallen bieden een duidelijke visuele indicator van het huidige niveau.","text_size":"Tekstgrootte","calculation_header":"Percentageberekening","calculation_description":"Configureer hoe het percentage vulniveau van de balk wordt berekend met een van de onderstaande opties.","type_header":"Percentageberekening","type_label":"Percentagetype","type_description":"Hoe de percentagewaarde in de balk wordt berekend","type_entity":"Entiteit (0-100)","type_attribute":"Entiteit attribuut","type_template":"Sjabloon modus","type_difference":"Verschil (Hoeveelheid/Totaal)","amount_entity":"Hoeveelheidsentiteit","amount_description":"Entiteit die de huidige hoeveelheid/waarde vertegenwoordigt (teller)","total_entity":"Totaalentiteit","total_description":"Entiteit die de totale hoeveelheid/maximum vertegenwoordigt (noemer)"},"left_side":{"header":"Linkerkant","section_description":"Configureer de titel en entiteitswaarde die aan de linkerkant van de balk worden weergegeven. Dit is handig voor het weergeven van labels zoals \'Bereik\' of \'Batterij\' samen met hun waarden.","toggle_description":"Toon of verberg de linkerkant van het balklabel","title":"Linker Titel","title_description":"Optioneel label dat aan de linkerkant onder de balk wordt weergegeven.","entity":"Linker Entiteit","entity_description":"Entiteit waarvan de waarde aan de linkerkant van de balk wordt weergegeven.","alignment_description":"Bepaalt hoe dit label onder de balk wordt uitgelijnd.","title_size":"Titel Grootte","value_size":"Waarde Grootte","hidden_message":"Linkerkant is verborgen"},"right_side":{"header":"Rechterkant","section_description":"Configureer de titel en entiteitswaarde die aan de rechterkant van de balk worden weergegeven. Dit is ideaal voor aanvullende informatie zoals \'Tijd tot Vol\' of secundaire metingen.","toggle_description":"Toon of verberg de rechterkant van het balklabel","title":"Rechter Titel","title_description":"Optioneel label dat aan de rechterkant onder de balk wordt weergegeven.","entity":"Rechter Entiteit","entity_description":"Entiteit waarvan de waarde aan de rechterkant van de balk wordt weergegeven.","alignment_description":"Bepaalt hoe dit label onder de balk wordt uitgelijnd.","title_size":"Titel Grootte","value_size":"Waarde Grootte","hidden_message":"Rechterkant is verborgen"},"colors":{"header":"Kleuren","bar_color":"Balkkleur","background_color":"Achtergrondkleur","border_color":"Randkleur","limit_indicator_color":"Limietindicatorkleur","left_title_color":"Linkertitelkleur","left_value_color":"Linkerwaardenkleur","right_title_color":"Rechtertitelkleur","right_value_color":"Rechterwaardenkleur","percentage_text_color":"Percentagetekstkleur","reset_color":"Reset naar standaardkleur"},"gradient":{"header":"Gradiënt Modus","description":"Creëer mooie kleurovergangen op je voortgangsbalken. Ideaal voor het weergeven van batterijniveaus, brandstofmeters of elke statusindicator die visuele nadruk nodig heeft.","toggle":"Gebruik Gradiënt","toggle_description":"Gebruik een kleurovergang voor de voortgangsbalk in plaats van een enkele kleur","display_mode":"Gradiënt Weergavemodus","display_mode_full":"Volledig","display_mode_value_based":"Waardegebaseerd","display_mode_cropped":"Bijgesneden","display_mode_description":"Volledig: Toont de volledige gradiënt. Waardegebaseerd: Toont de gradiënt tot aan de huidige waarde.","editor_header":"Gradiënt Editor","add_stop":"Stop Toevoegen"},"animation":{"header":"Actieanimatie","description":"Voeg animaties toe aan de balk wanneer een specifieke entiteit een bepaalde status bereikt. Perfect voor het tonen van oplaadstatus, alarmtoestanden en meer.","pro_tip":"Pro-tip: Voor \'altijd actieve\' animaties, selecteer een animatietype maar laat de entiteit- en statusvelden leeg. Probeer de \'Bubbels\' en \'Vullen\' animaties!","entity":"Animatie-entiteit","entity_description":"Entiteit die de animatie activeert wanneer deze overeenkomt met de opgegeven status","state":"Entiteitsstatus","state_description":"Wanneer de entiteitsstatus overeenkomt met deze waarde, wordt de animatie geactiveerd","type":"Animatietype","type_description":"Het animatie-effect dat wordt weergegeven wanneer de entiteitsstatus overeenkomt","select_entity_prompt":"Selecteer een Entiteit en typ de status waarmee u de animatie wilt activeren (voorbeelden: \\"charging\\", \\"on\\", \\"idle\\")","action_entity":"Actie -entiteit","action_state":"Actietoestand","action_description":"Deze animatie zal de reguliere animatie overschrijven wanneer de opgegeven entiteit zich in een specifieke staat bevindt.","action_entity_prompt":"Selecteer een actie -entiteit en staat om te definiëren wanneer deze animatie de reguliere animatie moet overschrijven"},"bar_sizes":{"thin":"Dun","regular":"Normaal","thick":"Dik","thiccc":"Zeer dik"},"bar_widths":{"25":"25% breedte","50":"50% breedte","75":"75% breedte","100":"100% (Volledige breedte)"},"bar_alignments":{"space-between":"Ruimte tussen","flex-start":"Links","center":"Midden","flex-end":"Rechts"},"bar_styles":{"flat":"Plat (Standaard)","glossy":"Glanzend","embossed":"Reliëf","inset":"Verzonken","gradient":"Verloopoverlay","neon":"Neongloed","outline":"Contour","glass":"Glas","metallic":"Metaalachtig","neumorphic":"Neumorfisch"},"animation_types":{"none":"Geen","charging-lines":"Opladen (Diagonale lijnen)","pulse":"Pulseren","blinking":"Knipperen","bouncing":"Stuiteren","glow":"Gloeien","rainbow":"Regenboog","bubbles":"Bubbels","fill":"Vullen"},"custom_bar_settings":{"title":"Aangepaste Balkinstellingen","description":"Definieer aangepaste configuraties voor individuele balken.","name":"Balknaam","entity":"Entiteit","unit":"Eenheid","min":"Min Waarde","max":"Max Waarde","thresholds":"Drempelwaarden","severity":"Ernst Map"},"template_mode":{"header":"Sjabloon modus","description":"Gebruik een sjabloon om de weergegeven tekst op te maken, eenheden te converteren of berekende waarden weer te geven.","enable":"Sjabloon modus inschakelen","template":"Sjabloon"}},"icons":{"title":"Kaartpictogrammen","description":"Voeg pictogramrijen toe om meerdere pictogrammen in je kaart weer te geven. Elke rij kan met verschillende instellingen worden geconfigureerd. Opmerking: Pictogramrijen en sectievolgorde kunnen worden herschikt in het tabblad Aanpassen.","add_row":"Pictogramrij toevoegen","duplicate_row":"Rij dupliceren","delete_row":"Rij verwijderen","expand_row":"Rij uitvouwen","collapse_row":"Rij samenvouwen","no_row":"Geen pictogramrijen toegevoegd","row_prefix":"Rij","icon_prefix":"Pictogram","add_icon":"Pictogram toevoegen","duplicate_icon":"Pictogram dupliceren","delete_icon":"Pictogram verwijderen","template_mode":"Sjabloonmodus","template_mode_active_description":"Gebruik een sjabloon om te bepalen wanneer dit pictogram actief moet zijn. Met sjablonen kunt u de syntaxis van thuisassistent -sjabloon gebruiken voor complexe omstandigheden.","template_mode_inactive_description":"Gebruik een sjabloon om te bepalen wanneer dit pictogram inactief moet zijn. Met sjablonen kunt u de syntaxis van thuisassistent -sjabloon gebruiken voor complexe omstandigheden.","template_examples_header":"Veel voorkomende voorbeelden:","text_formatting":"Status tekst opmaak","name_formatting":"Naam opmaak","dynamic_icon":{"title":"Dynamische icoon sjabloon","description":"Gebruik een sjabloon om dynamisch het icoon te selecteren op basis van entiteit statussen of voorwaarden.","enable":"Dynamische icoon sjabloon inschakelen"},"dynamic_color":{"title":"Dynamische kleur sjabloon","description":"Gebruik een sjabloon om dynamisch de icoon kleur in te stellen op basis van entiteit statussen of waarden.","enable":"Dynamische kleur sjabloon inschakelen"},"enable_template_mode":"Sjabloonmodus inschakelen","row_settings":{"header":"Rij-instellingen","width":"Rijbreedte","width_description":"Breedte van de rij als percentage van de kaartbreedte","alignment":"Rijuitlijning","alignment_description":"Hoe pictogrammen in deze rij worden uitgelijnd","spacing":"Pictogramafstand","spacing_description":"Hoeveelheid ruimte tussen pictogrammen in deze rij","columns":"Aantal Kolommen","columns_description":"Aantal kolommen met gelijke grootte in de rij (0 = automatische verdeling op basis van inhoud)","confirmation_mode":"Bevestigingsmodus","confirmation_mode_description":"Vereist twee taps/klikken om pictogrammen in deze rij te activeren, wat onbedoelde interacties voorkomt","layout_info_title":"Hoe lay -outinstellingen werken"},"icon_settings":{"header":"Pictograminstellingen","entity":"Entiteit","entity_description":"Entiteit om weer te geven met dit pictogram","icon":"Pictogram","icon_description":"Selecteer een pictogram of voer een aangepast pictogram in","name":"Naam","name_description":"Aangepaste naam die onder het pictogram wordt weergegeven (gebruikt standaard de entiteitsnaam als niet ingesteld)","interaction_type":"Interactie Type","interaction_type_description":"Kies hoe gebruikers interacteren met dit pictogram om acties te activeren","show_name":"Toon naam","show_name_description":"Toon de naamtekst onder het pictogram","show_state":"Toon status","show_state_description":"Toon de entiteitsstatus onder het pictogram","show_units":"Toon eenheden","show_units_description":"Voeg eenheden toe bij het weergeven van de status","text_position":"Tekstpositie","text_position_description":"Waar de naam- en statustekst wordt geplaatst ten opzichte van het pictogram","click_action":"Klikactie","service":"Dienst","service_description":"Service om aan te roepen (bijv. light.turn_on)","service_data":"Servicegegevens (JSON)","service_data_description":"JSON-gegevens die met de serviceaanroep worden verzonden","action":"Actie (JSON/Service)","action_description":"Geavanceerde actieconfiguratie (zie documentatie)","navigation_path":"Navigatiepad","navigation_path_description":"Pad om naartoe te navigeren (bijv. /lovelace/dashboard)","navigation_target_selector":"Navigatie Doel","navigation_target_description":"Selecteer uit beschikbare dashboards, weergaven of systeempagina\'s","url":"Url","url_description":"URL om te openen in een nieuw tabblad","automation_entity":"Automatisering Entiteit","automation_entity_description":"Automatisering om te activeren bij aanklikken"},"icon_appearance":{"header":"Icoon Uiterlijk","icon":"Icoon Specifiek","general":"Algemeen uiterlijk","active":"Actieve status","inactive":"Inactieve status","state_conditions":"Statusvoorwaarden","advanced":"Geavanceerde instellingen","icon_size":"Icoongrootte","icon_size_description":"Grootte van het icoon in pixels","text_size":"Tekstgrootte","text_size_description":"Grootte van de naam/statustekst in pixels","name_size":"Naammaat","name_size_description":"Grootte van de tekst van de entiteitsnaam in pixels","text_alignment":"Tekstuitlijning","text_alignment_description":"Hoe de tekst onder het icoon wordt uitgelijnd","icon_background":"Pictogramachtergrond","icon_background_description":"Voeg een achtergrondvorm toe achter het pictogram","icon_background_color":"Pictogramachtergrondkleur","icon_background_color_description":"Kleur van de achtergrond achter het pictogram","container_background_color":"Container Achtergrondkleur","container_background_color_description":"Kleur van de achtergrond achter de hele pictogramcontainer","text_appearance":"Tekstuiterlijk","container":{"header":"Container-uiterlijk","vertical_alignment":"Verticale uitlijning","vertical_alignment_description":"Lijn het icoon en de tekst verticaal uit binnen de container.","width":"Containerbreedte","width_description":"Stel de breedte van de icooncontainer in ten opzichte van de rij.","background":"Container Achtergrondvorm","background_description":"Kies een achtergrondvorm voor de gehele icooncontainer."},"show_when_active":"Toon icoon wanneer actief","show_when_active_description":"Toon dit icoon alleen wanneer het in een actieve status is","template_mode":"Sjabloon modus","template_description":"Gebruik een sjabloon om de actieve/inactieve status te bepalen. Met sjablonen kunt u de syntax van Home Assistant-sjablonen gebruiken (zoals {{ states.sensor.temperature.state > 70 }}) voor complexe voorwaarden.","active_template":"Actief Sjabloon","active_template_description":"Sjabloon dat evalueert naar waar wanneer het pictogram actief moet zijn.","active_state":"Actieve status","active_state_description":"Statusstring die \\"actief\\" voorstelt.","active_state_text":"Aangepaste Tekst voor Actieve Status","active_state_text_description":"Overschrijft de weergegeven tekst wanneer het pictogram actief is. Laat leeg om de daadwerkelijke status te gebruiken.","inactive_template":"Inactief Sjabloon","inactive_template_description":"Sjabloon dat evalueert naar waar wanneer het pictogram inactief moet zijn.","inactive_state":"Inactieve status","inactive_state_description":"Statusstring die \\"inactief\\" voorstelt.","inactive_state_text":"Aangepaste Tekst voor Inactieve Status","inactive_state_text_description":"Overschrijft de weergegeven tekst wanneer het pictogram inactief is. Laat leeg om de daadwerkelijke status te gebruiken.","active_icon":"Actief pictogram","inactive_icon":"Inactief pictogram","active_icon_color":"Actieve Icoonkleur","inactive_icon_color":"Inactieve Icoonkleur","active_name_color":"Actieve Naamkleur","inactive_name_color":"Inactieve Naamkleur","active_state_color":"Actieve Statuskleur","inactive_state_color":"Inactieve Statuskleur","show_icon_active":"Pictogram tonen bij actief","show_icon_active_description":"Toon het icoon wanneer de status actief is.","show_icon_inactive":"Toon Icoon Indien Inactief","show_icon_inactive_description":"Toon het icoon wanneer de status inactief is.","custom_active_state_text":"Aangepaste Actieve Statustekst","custom_inactive_state_text":"Aangepaste Inactieve Statustekst","action_description":"Actie die wordt uitgevoerd wanneer op het pictogram wordt geklikt.","show_name_active":"Toon Naam Wanneer Actief","show_name_active_description":"Toon de naam wanneer de status actief is.","show_name_inactive":"Toon Naam Wanneer Inactief","show_name_inactive_description":"Toon de naam wanneer de status inactief is.","show_state_active":"Toon Status Wanneer Actief","show_state_active_description":"Toon de status wanneer de status actief is.","show_state_inactive":"Toon Status Wanneer Inactief","show_state_inactive_description":"Toon de status wanneer de status inactief is.","use_entity_color_for_icon":"Gebruik entiteitskleur voor pictogram","use_entity_color_for_icon_description":"Gebruik het kleurattribuut van de entiteit voor het pictogram wanneer beschikbaar","use_entity_color_for_icon_background":"Gebruik entiteitskleur voor pictogramachtergrond","use_entity_color_for_icon_background_description":"Gebruik het kleurenattribuut van de entiteit voor de pictogramachtergrond indien beschikbaar","use_entity_color_for_container_background":"Gebruik entiteitskleur voor container","use_entity_color_for_container_background_description":"Gebruik het kleurenkenmerk van de entiteit voor de containerachtergrond indien beschikbaar","dynamic_icon_template":"Dynamische icoon sjabloon","dynamic_icon_template_description":"Gebruik een sjabloon om dynamisch het icoon te selecteren op basis van entiteit statussen of voorwaarden.","enable_dynamic_icon_template":"Dynamische icoon sjabloon inschakelen","dynamic_color_template":"Dynamische kleur sjabloon","dynamic_color_template_description":"Gebruik een sjabloon om dynamisch de icoon kleur in te stellen op basis van entiteit statussen of waarden.","enable_dynamic_color_template":"Dynamische kleur sjabloon inschakelen","size_settings":"Grootte instellingen","value_size":"Waarde grootte","state_text_formatting":"Status tekst opmaak","row_name":"Rij naam","row_name_description":"Aangepaste naam voor deze icoon rij (laat leeg om standaard naamgeving te gebruiken)","width_description":"Bepaalt hoeveel van de beschikbare breedte deze rij zal gebruiken. Configureer hoe deze rij iconen wordt weergegeven. Breedte controleert de totale rijbreedte, afstand past de ruimte tussen iconen aan, en aantal kolommen bepaalt hoeveel iconen in elke rij verschijnen (0 = automatisch).","layout_info_title":"Hoe lay-out instellingen werken","layout_info_width":"Rij breedte: Bepaalt hoeveel horizontale ruimte de rij inneemt in de kaart (percentage van kaart breedte)","layout_info_alignment":"Rij uitlijning: Geldt alleen wanneer aantal kolommen 0 is. Bepaalt hoe iconen binnen de rij worden gepositioneerd","layout_info_spacing":"Icoon afstand: Stelt de hoeveelheid ruimte tussen iconen in","layout_info_columns":"Aantal kolommen: Wanneer ingesteld op 0, stromen iconen natuurlijk op basis van beschikbare ruimte. Wanneer ingesteld op een getal, forceert dat exacte aantal kolommen in een raster lay-out","layout_info_tip":"Gebruik aantal kolommen met consistente hoeveelheden iconen per rij voor de meest uniforme lay-out","control_right_side_description":"Bepaal wanneer de rechterzijde wordt getoond of verborgen op basis van entiteit status","dynamic_icon":{"title":"Dynamische icoon sjabloon","description":"Gebruik een sjabloon om dynamisch het icoon te selecteren op basis van entiteit statussen of voorwaarden.","enable":"Dynamische icoon sjabloon inschakelen","template_label":"Icoon sjabloon"},"dynamic_color":{"title":"Dynamische kleur sjabloon","description":"Gebruik een sjabloon om dynamisch de icoon kleur in te stellen op basis van entiteit statussen of waarden.","enable":"Dynamische kleur sjabloon inschakelen","template_label":"Kleur sjabloon"}},"tabs":{"general":"Algemeen","actions":"Acties","appearance":"Uiterlijk","states":"Statussen","active_state":"Actieve status","inactive_state":"Inactieve status","icons":{"arrange_icon_rows":"Icoon rijen rangschikken"}},"alignments":{"flex-start":"Links","center":"Midden","flex-end":"Rechts","space-between":"Ruimte tussen","space-around":"Ruimte rondom","space-evenly":"Gelijkmatige ruimte"},"vertical_alignments":{"flex-start":"Boven","center":"Midden","flex-end":"Onder"},"spacing":{"none":"Geen","small":"Klein","medium":"Gemiddeld","large":"Groot"},"text_positions":{"below":"Onder icoon","beside":"Naast icoon","none":"Geen tekst","top":"Boven","left":"Links","right":"Rechts"},"reset":{"size":"Reset naar standaardgrootte","color":"Reset naar standaardkleur","all":"Reset naar standaardwaarden"},"click_actions":{"toggle":"Entiteit omschakelen","more-info":"Meer informatie tonen","navigate":"Navigeren naar pad","url":"URL openen","call-service":"Service aanroepen","perform-action":"Actie uitvoeren","location-map":"Locatiekaart tonen","assist":"Spraakassistent","trigger":"Activeren","none":"Geen actie","descriptions":{"toggle":"Schakelt de status van de entiteit om.","more-info":"Opent het meer-info dialoogvenster voor de entiteit.","navigate":"Navigeert naar het opgegeven Lovelace-pad.","url":"Opent de opgegeven URL in een nieuw tabblad.","call-service":"Roept de opgegeven Home Assistant-service aan.","perform-action":"Voert een aangepaste actie uit (zie documentatie).","location-map":"Toont de entiteit op een kaart.","assist":"Opent de Home Assistant-spraakassistent.","trigger":"Activeert de entiteit (automatisering, script, knop, etc.).","none":"Er wordt geen actie uitgevoerd."}},"backgrounds":{"none":"Geen","circle":"Cirkel","square":"Vierkant","rounded_square":"Afgerond vierkant"},"container_widths":{"25":"25% breedte","50":"50% breedte","75":"75% breedte","100":"100% (Volledige breedte)"},"row_widths":{"25":"25% breedte","50":"50% breedte","75":"75% breedte","100":"100% (Volledige breedte)"},"interactions":{"single":"Enkele tik/klik","double":"Dubbele tik/klik","hold":"Vasthouden/lang indrukken"},"animations":{"title":"Icoon animatie","active_description":"Selecteer een animatie om toe te passen wanneer dit icoon in de actieve status is.","inactive_description":"Selecteer een animatie om toe te passen wanneer dit icoon in de inactieve status is.","select_animation":"Selecteer animatie","none":"Geen","pulse":"Pulsen","vibrate":"Trillen","rotate_left":"Linksom draaien","rotate_right":"Rechtsom draaien","hover":"Zweven","fade":"Vervagen","scale":"Schalen","bounce":"Stuiteren","shake":"Schudden","tada":"Tada"},"row_vertical_alignments":{"top":"Boven","center":"Midden","bottom":"Onder"},"actions":{"single":"Enkele klik actie","double":"Dubbele klik actie","hold":"Vasthoud actie","single_description":"Actie uitgevoerd bij een enkele tik/klik - meest voorkomende interactie","double_description":"Actie uitgevoerd bij een dubbele tik/klik - helpt onbedoelde activeringen te voorkomen","hold_description":"Actie uitgevoerd bij 500ms vasthouden - ideaal voor kritieke acties","section_header":"Interactie acties"}},"customize":{"title":"Lay -out aanpassen","description":"Pas de lay -out aan, bestel en voeg secties toe aan uw kaart","condition_prompt":"Selecteer \\"Toon\\" of \\"verbergen\\" om entiteitsconditie te configureren","template_mode_active":"Sjabloon modus gebruiken","layout":{"title":"Lay-out stijl","description":"Kies tussen één- of tweekolomsweergave voor de kaart","header":"Lay-out instellingen","descriptions_header":"Lay-out beschrijvingen","single_column":"Enkele kolom","single_column_description":"Alle secties worden verticaal gestapeld in één kolom - beste voor eenvoudige weergaven en mobiele schermen.","double_column":"Dubbele kolom","double_column_description":"Secties worden verdeeld over twee kolommen voor efficiënt gebruik van horizontale ruimte - ideaal voor bredere schermen.","top_view":"Bovenaanzicht","top_view_description":"Afbeelding wordt prominent bovenaan weergegeven met andere secties gerangschikt in configureerbare posities eromheen.","half_full":"Half + vol","half_full_description":"Bovenste rij heeft twee halve-breedte secties, onderste rij heeft één volle-breedte sectie - geweldig voor gebalanceerde lay-outs.","full_half":"Vol + half","full_half_description":"Bovenste rij heeft één volle-breedte sectie, onderste rij heeft twee halve-breedte secties - perfect voor het accentueren van bovenste inhoud."},"layout_types":{"single":"Enkele kolom","double":"Dubbele kolom","dashboard":"Dashboard","half_full":"Half + vol","full_half":"Vol + half"},"column_width":{"title":"Kolombreedte","description":"Configureer de breedteverhouding tussen linker- en rechterkolom","50_50":"Gelijk (50/50)","30_70":"Smal links, breed rechts (30/70)","70_30":"Breed links, smal rechts (70/30)","40_60":"Iets smaller links (40/60)","60_40":"Iets breder links (60/40)"},"top_view":{"header":"Dashboard instellingen","description":"Configureer de afstands- en layout-instellingen voor de dashboardweergave","side_margin":"Zijmarges","side_margin_help":"Marges aan de zijkanten van de weergave in pixels","middle_spacing":"Middenafstand","middle_spacing_help":"Ruimte tussen middenkolommen in pixels","vertical_spacing":"Verticale afstand","vertical_spacing_help":"Ruimte tussen rijen in pixels"},"sections":{"header":"Kaart secties","arrangement_header":"Sectie indeling","arrangement_desc_base":"Sleep secties om hun volgorde op de kaart te organiseren.","arrangement_desc_single_extra":"Alle secties worden in één kolom weergegeven.","arrangement_desc_double_extra":"In de tweekolomsweergave kunt u elke sectie in de linker- of rechterkolom plaatsen.","arrangement_desc_dashboard_extra":"In de dashboardweergave kunt u de secties rond de afbeelding van uw voertuig plaatsen."},"section_labels":{"title":"Titel","image":"Voertuigafbeelding","info":"Voertuiginformatie","bars":"Alle sensorbalken","icons":"Alle pictogramrijen","section_break":"Sectie pauze"},"actions":{"collapse_margins":"Marges verkleinen","expand_margins":"Marges uitbreiden","collapse_options":"Opties verkleinen","expand_options":"Opties uitbreiden","add_break":"Sectie -pauze toevoegen","delete_break":"Sectie -pauze verwijderen"},"css":{"header":"Globale CSS","description":"Voer hier aangepaste CSS-regels in om de standaardstijl van de kaart te overschrijven. Deze regels worden direct op de kaart toegepast. Gebruik met voorzichtigheid.","label":"Aangepaste CSS","input_description":"Voer hier uw aangepaste CSS-regels in."},"conditions":{"header":"Voorwaardelijke logica","description":"Toon of verberg deze sectie op basis van de status van een entiteit.","template_mode_description":"Gebruik een sjabloon om sectie zichtbaarheid te bepalen. Sjablonen stellen je in staat om Home Assistant sjabloon syntaxis te gebruiken voor complexe voorwaarden.","type_label":"Voorwaardetype","section_title":"Sectie titel","enable_section_title":"Sectie titel inschakelen","title_text":"Titel tekst","title_size":"Titel grootte","title_color":"Titel kleur","enable_template_mode":"Sjabloon modus inschakelen","use_template_description":"Gebruik een sjabloon om te bepalen wanneer deze sectie zichtbaar moet zijn. Sjablonen stellen je in staat om Home Assistant sjabloon syntaxis te gebruiken voor complexe voorwaarden.","info_row":"Info rij","entity_label":"Voorwaarde-entiteit","state_label":"Voorwaardestatus","state_description":"De status waarde die de voorwaarde activeert","types":{"none":"Geen (Altijd tonen)","show":"Tonen wanneer...","hide":"Verbergen wanneer..."}},"template":{"description":"Gebruik een sjabloon om te bepalen wanneer deze sectie zichtbaar moet zijn. Sjablonen stellen je in staat om Home Assistant sjabloon syntaxis te gebruiken voor complexe voorwaarden.","enable":"Sjabloon modus inschakelen"},"template_mode":{"header":"Sjabloon modus","description":"Gebruik een sjabloon om te bepalen wanneer deze afbeelding wordt getoond of verborgen op basis van complexe logica, berekeningen, of meerdere entiteit statussen.","enable":"Sjabloon modus inschakelen","disabled_notice":"(Uitgeschakeld - sjabloon modus actief)","disabled_help":"Basis voorwaarde controles zijn uitgeschakeld wanneer sjabloon modus actief is. Sjabloon modus heeft voorrang op basis voorwaarden.","examples":{"show_when_charging":"Toon tijdens opladen","show_when_battery_low":"Toon bij lage batterij","multiple_conditions":"Meerdere voorwaarden","show_during_day":"Toon tijdens daguren","show_when_door_unlocked":"Toon wanneer deur ontgrendeld"}},"section_title":{"header":"Sectie titel","enable":"Sectie titel inschakelen","text":"Titel tekst","size":"Titel grootte","color":"Titel kleur","bold":"Vet","italic":"Cursief","uppercase":"Hoofdletters","strikethrough":"Doorhalen"},"margins":{"header":"Marges","top":"Bovenmarge","bottom":"Ondermarge"},"columns":{"left":"Linkerkolom","right":"Rechterkolom","empty":"Plaats secties hier"},"dashboard":{"top":"Bovenste sectie","top_middle":"Boven-midden sectie","left_middle":"Links-midden sectie","middle":"Middelste sectie","middle_empty":"Voertuigafbeeldingsgebied (Aanbevolen)","right_middle":"Rechts-midden sectie","bottom_middle":"Onder-midden sectie","bottom":"Onderste sectie"},"half_full":{"row1_col1":"Rij 1 - Linkerkolom","row1_col2":"Rij 1 - Rechterkolom","row2_full":"Rij 2, volledige breedte (100%)"},"full_half":{"row1_full":"Rij 1, volledige breedte (100%)","row2_col1":"Rij 2 - Linkerkolom","row2_col2":"Rij 2 - Rechterkolom"},"break_styles":{"blank":"Blanco (geen regel)","line":"Ononderbroken lijn","double_line":"Dubbele lijn","dotted":"Stippellijn","double_dotted":"Dubbele stippellijn","shadow":"Schaduwgradiënt"},"break_style":{"header":"Onderbreking stijl","style_label":"Stijl","thickness_label":"Dikte","width_percent_label":"Breedte (%)","color_label":"Kleur"}},"container_widths":{"25":"25% breedte","50":"50% breedte","75":"75% breedte","100":"100% (Volledige breedte)"},"row_widths":{"25":"25% breedte","50":"50% breedte","75":"75% breedte","100":"100% (Volledige breedte)"}},"about":{"logo_alt":"Ultra Vehicle Card","developed_by":"Ontwikkeld door","discord_button":"Word lid van onze Discord","docs_button":"Lees onze documentatie","donate_button":"DONEREN (PAYPAL)","github_button":"Bezoek onze Github","support_title":"Steun Ultra Vehicle Card","support_description":"Uw gulle tips voeden de ontwikkeling van geweldige functies voor deze kaart! Zonder ondersteuning van gebruikers zoals u, zou voortdurende innovatie niet mogelijk zijn."},"custom_icons":{"title":"Aangepaste pictogrammen","description":"Definieer aangepaste pictogrammen voor verschillende statussen.","icon_entity":"Pictogram-entiteit","default_icon":"Standaardpictogram","state_icons":"Statuspictogrammen","state":"Status","icon":"Pictogram"},"custom_active_state_text":"Aangepaste actieve statustekst","custom_inactive_state_text":"Aangepaste inactieve statustekst","image_settings":{"title":"Afbeeldingsinstellingen","description":"Configureer het uiterlijk van de hoofdafbeelding.","type":"Afbeeldingstype","width":"Afbeeldingsbreedte","crop":"Afbeelding bijsnijden","entity":"Afbeeldingsentiteit","entity_description":"Entiteit die de afbeeldings-URL levert"},"entity_settings":{"entity":"Entiteit","entity_description":"Selecteer een entiteit om informatie uit te geven van","name":"Name","name_description":"Verhaal de naam van de entiteit (laat blanco om de vriendelijke naam van de entiteit te gebruiken)","show_icon":"Toon pictogram","icon":"Icoon","icon_color":"Pictogramkleur","name_color":"Naam kleur","entity_color":"Entiteitskleur","text_color":"Tekst kleur","show_name":"Naam tonen","show_name_description":"Toon de naam van de entiteit vóór de waarde","template_mode":"Gebruik Sjabloon voor Waarde","template_mode_description":"Gebruik een sjabloon om de entiteitswaarde te formatteren","value_template":"Waardesjabloon","template_header":"Waardesjabloon","template_examples_header":"Sjabloonvoorbeelden","template_basic":"Basiswaarde","template_units":"Met eenheden","template_round":"Rond tot 1 decimaal","dynamic_icon_template":"Icoon sjabloon","dynamic_color_template":"Kleur sjabloon","dynamic_icon_template_mode":"Dynamische icoon sjabloon inschakelen","dynamic_color_template_mode":"Dynamische kleur sjabloon inschakelen"}}');var At=a.t(Tt,2);const $t=JSON.parse('{"editor":{"tabs":{"settings":"Innstillinger","bars":"Stolper","icons":"Ikoner","customize":"Tilpasse","about":"Om","info":"Info","images":"Bilder"},"info":{"title":"Kortinformasjon","description":"Konfigurer informasjonsrader og enheter for å vise kjøretøydetaljer som plassering, kjørelengde, etc. Info -elementer vises på en enkelt linje når det er mulig, og pakker til flere linjer i smale containere.","add_row":"Legg til inforad","add_entity":"Legg til infoenhet","arrange_info_rows":"Arranger info rader","duplicate_row":"Dupliser rad","delete_row":"Slett rad","expand_row":"Utvid rad","collapse_row":"Kollaps rad","duplicate_entity":"Dupliser enhet","delete_entity":"Slett enhet","expand_entity":"Utvid enhet","collapse_entity":"Kollaps enhet","row_prefix":"Inforad","entity_prefix":"Enhet","template_mode":"Malmodus","template_mode_description":"Bruk en mal for å formatere enhetsverdien. Maler lar deg bruke syntaks for hjemmeassistent for kompleks formatering.","template_examples_header":"Vanlige eksempler:","dynamic_icon":{"title":"Dynamisk ikonmal","description":"Bruk en mal for å dynamisk velge ikonet basert på enhetstilstander eller betingelser.","enable":"Aktiver dynamisk ikonmal"},"dynamic_color":{"title":"Dynamisk fargemal","description":"Bruk en mal for å dynamisk sette farger basert på enhetstilstander eller verdier.","enable":"Aktiver dynamisk fargemal"},"row_settings":{"header":"Rad-innstillinger","row_name":"Radnavn","row_name_description":"Tilpasset navn for denne info-raden (la stå tom for å bruke standard navngivning)","horizontal_alignment":"Horisontal justering","alignment_description":"Horisontal justering av entiteter i denne raden","vertical_alignment":"Vertikal justering","vertical_alignment_description":"Kontrollerer hvordan entiteter justeres vertikalt innenfor raden.","spacing":"Mellomrom","spacing_description":"Mellomrom mellom entiteter i denne raden","allow_wrap":"Tillat elementer å brytes","allow_wrap_description":"Når aktivert, vil elementer flyte til neste linje hvis de ikke passer på én rad. Når deaktivert, vil alle elementer holde seg på en enkelt rad."},"entity_settings":{"header":"Info-elementer","name":"Tilpasset navn","entity_description":"Velg en entitet å vise informasjon fra","name_description":"Overstyr entitetsnavnet (la stå tom for å bruke entitetens vennlige navn)","show_icon":"Vis ikon","icon_color":"Ikonfarge","name_color":"Navnfarge","entity_color":"Entitetsfarge","icon_size":"Ikonstørrelse","name_size":"Navnstørrelse","value_size":"Verdistørrelse","size_settings":"Størrelse-innstillinger","show_name":"Vis navn","show_name_description":"Vis entitetsnavnet før verdien","click_action":"Klikk-handling","navigation_path":"Navigasjonssti","navigation_path_description":"Sti å navigere til når klikket (f.eks. /lovelace/0)","url":"URL","url_description":"URL å åpne når klikket","service":"Tjeneste","service_description":"Tjeneste å kalle (f.eks. light.turn_on)","service_data":"Tjenestedata (JSON)"},"alignments":{"flex-start":"Start","center":"Senter","flex-end":"Slutt","space-between":"Plass mellom","space-around":"Plass rundt","space-evenly":"Jevnt fordelt plass"},"spacing":{"none":"Ingen","small":"Liten","medium":"Medium","large":"Stor"},"click_actions":{"more-info":"Mer info","navigate":"Naviger","url":"Åpne URL","call-service":"Ring tjeneste","none":"Ingen"},"row_vertical_alignments":{"top":"Topp","center":"Senter","bottom":"Bunn"}},"settings_subtabs":{"general":"Generelt","action_images":"Handlingsbilder"},"action_images":{"title":"Innstillinger for Handlingsbilder","description":"Konfigurer bilder som vil vises når spesifikke entitetstilstander er oppfylt.","add_image":"Legg til Handlingsbilde","no_images":"Ingen handlingsbilder konfigurert ennå. Legg til ett for å komme i gang.","actions":{"drag":"Dra for å endre rekkefølge","duplicate":"Dupliser","delete":"Slett","expand":"Utvid","collapse":"Skjul"},"delete_confirm":"Er du sikker på at du vil slette dette handlingsbildet?","entity_settings":"Entitetsinnstillinger","image_settings":"Bildeinnstillinger","entity_placeholder":"Velg en entitet","state_placeholder":"Angi tilstandsverdi","preview":{"no_entity":"Ingen entitet valgt","no_image":"Ingen bilde","any_state":"Enhver tilstand"},"trigger_entity":"Utløser Entitet","trigger_state":"Utløser Tilstand","entity_help":"Velg en entitet å overvåke. Bildet vil bli vist når denne entiteten matcher tilstanden nedenfor.","state_help":"Skriv inn tilstandsverdien som vil utløse dette bildet. La stå tomt for å matche enhver tilstand.","image_type":{"title":"Bildetype","upload":"Last opp bilde","url":"Bilde-URL","entity":"Entitetsbilde","none":"Ingen"},"template_mode":"Mal-modus","template_description":"Bruk en mal for å bestemme når dette bildet skal vises. Maler lar deg bruke Home Assistant mal-syntaks (som {{ states.sensor.temperature.state > 70 }}) for komplekse betingelser.","template_label":"Visningsmal","template_help":"Skriv inn en mal som returnerer sant/usant. Dette bildet vil bli vist når malen evalueres til sant. Bruk Jinja2-syntaks: {{ states(...) }}","priority":{"label":"Visningsprioritet","description":"Prioritetsbasert bruker det første treffet fra topp til bunn. Nyeste Match bruker det siste treffet funnet i listen.","options":{"priority":"Prioritetsbasert","newest":"Nyeste Match"}}},"images":{"title":"Bilder","description":"Konfigurer bilder som vil bli vist basert på betingelser eller maler.","add_image":"Legg til Bilde","no_images":"Ingen bilder konfigurert ennå. Legg til ett for å komme i gang.","arrange_images":"Organiser Bilder","name":"Navn (Valgfritt)","image_type":"Bildetype","url":"Bilde URL","image_entity":"Bilde Entitet","priority":"Prioritet (0 = høyest)","priority_mode":"Prioritetsmodus","timed_duration":"Visningstid (sekunder)","timed_duration_help":"Hvor lenge dette bildet skal vises før det går tilbake til hovedbildet.","duplicate":"Dupliser Bilde","delete":"Slett Bilde","delete_confirm":"Er du sikker på at du vil slette dette bildet?","image_types":{"none":"Ingen","default":"Standard Kjøretøy","url":"Bilde URL","upload":"Last opp Bilde","entity":"Entitet Bilde","map":"Kart"},"priority_modes":{"order":"Rekkefølge Prioritet","order_help":"Bilder vises basert på deres rekkefølge i listen (dra for å omorganisere).","last_triggered":"Sist Utløst","last_triggered_help":"Det sist utløste bildet vil forbli vist inntil et annet bilde utløses.","timed":"Tidsstyrte Bilder","timed_help":"Bilder under det første vil vises i en angitt varighet og deretter gå tilbake til hovedbildet."},"conditional_types":{"show":"Vis Når","hide":"Skjul Når"},"tabs":{"general":"Generelt","conditional":"Betinget","appearance":"Utseende"},"conditional_help":"Konfigurer når dette bildet skal vises basert på entitetstilstander eller maler.","conditional_help_simple":"Konfigurer når dette bildet skal vises basert på entitetstilstander.","conditional_state_help":"Bildet vil bli vist når entiteten er lik denne tilstandsverdien.","conditional_entity":"Betinget Entitet","conditional_state":"Betinget Tilstand","basic_conditions":"Grunnleggende Betingelser","advanced_conditional":"Avanserte Mal Betingelser","advanced_help":"Bruk maler for komplekse betingelser som flere entiteter eller matematiske sammenligninger.","template_mode_active_help":"Bruk maler for komplekse betingelser som flere entiteter eller matematiske sammenligninger.","template_mode":{"header":"Malmodus","enable":"Aktiver Malmodus","template":"Mal"},"template_examples_header":"Vanlige Eksempler:","width":"Bredde (%)","width_settings":"Bredde Innstillinger","crop_settings":"Beskjæring Innstillinger","crop_help":"Positive verdier beskjærer innover, negative verdier legger til utfylling utover.","crop_top":"Topp","crop_right":"Høyre","crop_bottom":"Bunn","crop_left":"Venstre","fallback_image":"Reserve Bilde","fallback_help":"Dette bildet vil bli brukt som reserve hvis ingen utløsere matcher eller timeout skjer. Bare ett bilde kan være en reserve.","map_entity":"Posisjon Entitet","map_entity_help":"Velg en entitet med breddegrad/lengdegrad koordinater eller adresse for å vise på kartet.","target_entity":"Mål Entitet","target_entity_description":"Velg entiteten å målrette med denne handlingen","common":{"width":"Bildebredde","width_description":"Bredde i prosent av kortet","width_over_100":"Verdier over 100% kan bidra til å beskjære tomt plass rundt bilder","url_description":"Skriv inn bildets URL"},"vehicle":{"crop":"Beskjær bilde"},"migration":{"title":"Eldre bilder oppdaget","description":"Vi fant eldre bildekonfigurasjoner som kan migreres til det nye formatet.","migrate_button":"Migrer nå","success":"Bilder migrert vellykket!"}},"card_settings":{"title":"Korttittel","title_alignment":"Titteljustering","title_size":"Tittelstørrelse","title_color":"Tittel Farge","title_color_description":"Farge på korttittelen","title_description":"Tittel som vises øverst på kortet (valgfritt)","title_alignment_description":"Hvordan korttittelen justeres","title_size_description":"Størrelsen på korttittelen i piksler","colors":"Farger","card_background":"Kort Bakgrunn","card_background_description":"Bakgrunnsfarge for hele kortet","format_entities":"Formater Enhetsverdier","format_entities_description":"Aktiver ytterligere formatering av enhetsverdier (legg til kommaer, konverter enheter, osv.)","show_units":"Vis Enheter","show_units_description":"Vis måleenheter ved siden av verdier","help_highlight":"Hjelp med å fremheve","help_highlight_description":"Vis visuelle høydepunkter når du bytter mellom redigeringsfaner for å identifisere hvilken seksjon du redigerer","general":"Generelt","conditional_logic":"Betinget Logikk","card_visibility":"Kort Synlighet","card_visibility_description":"Vis eller skjul hele kortet basert på en entitetsbetingelse"},"vehicle_info":{"title":"Kjøretøyinformasjon","location":{"title":"Plasseringsenhet","description":"Velg enheten som viser kjøretøyets nåværende plassering.","show":"Vis Plassering","show_description":"Vis kjøretøyets plassering"},"mileage":{"title":"Kilometerenhet","description":"Velg enheten som representerer kjøretøyets totale kilometerstand eller kilometerteller.","show":"Vis Kilometerstand","show_description":"Vis kjøretøyets kilometerstand"},"car_state":{"title":"Kjøretøytilstandsenhet","description":"Velg enheten som representerer kjøretøyets nåværende tilstand (f.eks. parkert, kjørende, lader).","show":"Vis Kjøretøytilstand","show_description":"Vis kjøretøyets tilstand"}},"crop":{"title":"Bildebeskjæring","top":"Topp","right":"Høyre","bottom":"Bunn","left":"Venstre","pixels":"PX","help":"Angi verdier i piksler (positive eller negative) for å justere beskjæring og utfylling"},"alignment":{"left":"Venstre","center":"Senter","right":"Høyre"},"common":{"choose_file":"Velg fil","no_file_chosen":"Ingen fil valgt","entity":"Enhet","width":"Bredde","width_description":"Bredde som prosent av kortet","width_over_100":"Verdier over 100% kan bidra til å beskjære tomt plass rundt bilder","none":"Ingen","default":"Standard","upload":"Last opp","url":"URL","url_description":"URL som peker til bildet","reset":"Tilbakestill","condition_prompt":"Velg \\"Vis\\" eller \\"Skjul\\" for å konfigurere enhetstilstand","bold":"Fet","italic":"Kursiv","uppercase":"Store Bokstaver","strikethrough":"Gjennomstreket"},"conditions":{"condition_type":"Betingelsestype","show_card_if":"Vis Kort Hvis","hide_card_if":"Skjul Kort Hvis","entity_description":"Velg entiteten å sjekke for betingelsen","state":"Tilstand","state_description":"Tilstandsverdien som utløser betingelsen"},"bars":{"title":"Prosentstolper","description":"Legg til prosentstolper for å vise verdier som drivstoffnivå, batterilading eller rekkevidde. Hver stolpe kan vise en primær prosentverdi med valgfrie etiketter til venstre og høyre.","add":"Legg til ny stolpe","duplicate":"Dupliser stolpe","delete":"Slett stolpe","expand":"Utvid stolpe","collapse":"Skjul stolpe","no_entity":"Ingen enhet valgt","bar_prefix":"Stolpe","template":{"description":"Bruk en mal for å formatere den viste teksten, konvertere enheter eller vise beregnede verdier.","enable":"Aktiver malmodus","template_label":"Mal","helper_text":"Bruk Home Assistant mal-syntaks. Eksempler:\\n• {{ states(\'sensor.temperature\') | float * 1.8 + 32 }} °F\\n• {{ now().strftime(\\"%b %d, %H:%M\\") }}","examples_header":"Vanlige eksempler:","examples":{"temperature":"{{ states(\'sensor.temperature\') | float * 1.8 + 32 }}°F - Konverter Celsius til Fahrenheit","datetime":"{{ now().strftime(\\"%b %d, %H:%M\\") }} - Formater gjeldende dato/tid","power":"{{ \'Lader med \' + states(\'sensor.ev_power\') + \' kW\' }} - Kombiner tekst og sensorverdi"}},"bar_radius":{"round":"Rund","square":"Firkantet","rounded-square":"Avrundet Firkant"},"tabs":{"arrange_bars":"Ordne søyler","config":"Konfigurasjon","colors":"Farger","animation":"Animasjon"},"settings":{"header":"Søylekonfigurasjon","entity":"Hovedentitet","entity_description":"Entitet som gir den primære verdien (0-100) for fremgangssøylen","limit_entity":"Grenseentitet","limit_entity_description":"Entitet som viser en grensemarkør på søylen (f.eks. ladeterskel)","limit_color":"Grenseindikator Farge","limit_color_description":"Farge på grenseindikatorlinjen","bar_size":"Søyletykkelse","bar_size_description":"Størrelse/tykkelse på fremgangssøylen","bar_radius":"Søyleradius","bar_radius_description":"Form på hjørnene til fremgangssøylen","width":"Søylebredde","width_description":"Bredde på fremgangssøylen som prosent av tilgjengelig plass. Bruk dette for å plassere flere søyler side ved side.","alignment":"Etikett Justering","alignment_description":"Hvordan etikettene på fremgangssøylen justeres","show_percentage":"Vis Prosent","show_percentage_description":"Vis prosentverdien inne i søylen"},"percentage":{"header":"Prosenttekst","display_header":"Prosenttekstvisning","display_description":"Kontroller synlighet og utseende av prosentverdier som vises direkte på stolpen. Disse tallene gir en tydelig visuell indikator på nåværende nivå.","text_size":"Tekststørrelse","calculation_header":"Prosentberegning","calculation_description":"Konfigurer hvordan stolpens prosentvise fyllnivå beregnes ved hjelp av ett av alternativene nedenfor.","type_header":"Prosentberegning","type_label":"Prosenttype","type_description":"Hvordan prosentverdien som vises i søylen beregnes","type_entity":"Entitet (0-100)","type_attribute":"Enhetsattributt","type_template":"Malmodus","type_difference":"Forskjell (Mengde/Total)","amount_entity":"Mengdeentitet","amount_description":"Entitet som representerer nåværende mengde/verdi (teller)","total_entity":"Totalentitet","total_description":"Entitet som representerer total mengde/maksimum (nevner)"},"left_side":{"header":"Venstre Side","section_description":"Konfigurer tittel og entitetsverdi som vises på venstre side av stolpen. Dette er nyttig for å vise etiketter som \'Rekkevidde\' eller \'Batteri\' sammen med verdiene deres.","toggle_description":"Vis eller skjul venstre side av stolpeetiketten","title":"Venstre Tittel","title_description":"Valgfri etikett som vises på venstre side under stolpen.","entity":"Venstre Enhet","entity_description":"Enhet hvis verdi vises på venstre side av stolpen.","alignment_description":"Kontrollerer hvordan denne etiketten justeres under stolpen.","title_size":"Tittelstørrelse","value_size":"Verdistørrelse","hidden_message":"Venstre side er skjult"},"right_side":{"header":"Høyre Side","section_description":"Konfigurer tittel og entitetsverdi som vises på høyre side av stolpen. Dette er ideelt for komplementerende informasjon som \'Tid til Fulladet\' eller sekundære målinger.","toggle_description":"Vis eller skjul høyre side av stolpeetiketten","title":"Høyre Tittel","title_description":"Valgfri etikett som vises på høyre side under stolpen.","entity":"Høyre Enhet","entity_description":"Enhet hvis verdi vises på høyre side av stolpen.","alignment_description":"Kontrollerer hvordan denne etiketten justeres under stolpen.","title_size":"Tittelstørrelse","value_size":"Verdistørrelse","hidden_message":"Høyre side er skjult"},"colors":{"header":"Farger","bar_color":"Stolpefarge","background_color":"Bakgrunnsfarge","border_color":"Kantfarge","limit_indicator_color":"Grenseindikatorfarve","left_title_color":"Venstre Tittelfarge","left_value_color":"Venstre Verdifarge","right_title_color":"Høyre Tittelfarge","right_value_color":"Høyre Verdifarge","percentage_text_color":"Prosenttekstfarge","reset_color":"Tilbakestill til standardfarge"},"gradient":{"header":"Gradientmodus","description":"Lag vakre fargeoverganger på fremdriftsstolpene dine. Ideelt for å vise batterinivåer, drivstoffmålere, eller andre statusindikatorer som krever visuell vektlegging.","toggle":"Bruk gradient","toggle_description":"Bruk en gradient for fremdriftslinjen i stedet for en ensfarget farge","display_mode":"Gradientvisningsmodus","display_mode_full":"Full","display_mode_value_based":"Verdibasert","display_mode_cropped":"Beskåret","display_mode_description":"Full: Vis hele gradienten. Verdibasert: Vis gradient opp til nåværende verdi.","editor_header":"Gradienteditor","add_stop":"Legg til stopp"},"animation":{"header":"Handlingsanimasjon","description":"Legg til animasjoner på stolpen når en spesifikk enhet når en bestemt tilstand. Perfekt for å vise ladestatus, alarmtilstander og mer.","pro_tip":"Pro-tips: For \'alltid aktive\' animasjoner, velg en animasjonstype men la enhets- og tilstandsfeltene være tomme. Prøv \'Bobler\' og \'Fyll\' animasjonene!","entity":"Animasjonsenhet","entity_description":"Enhet som utløser animasjonen når den matcher den angitte tilstanden","state":"Enhetstilstand","state_description":"Når enhetstilstanden matcher denne verdien, vil animasjonen bli utløst","type":"Animasjonstype","type_description":"Animasjonseffekten som vises når enhetstilstanden samsvarer","select_entity_prompt":"Velg en Enhet og skriv inn tilstanden du ønsker å utløse animasjonen med (eksempler: \\"charging\\", \\"on\\", \\"idle\\")","action_entity":"Handlingsenhet","action_state":"Handlingsstatus","action_description":"Denne animasjonen vil overstyre den vanlige animasjonen når den spesifiserte enheten er i en spesifikk tilstand.","action_entity_prompt":"Velg en handlingsenhet og stat for å definere når denne animasjonen skal overstyre den vanlige animasjonen"},"bar_sizes":{"thin":"Tynn","regular":"Normal","thick":"Tykk","thiccc":"Ekstra tykk"},"bar_widths":{"25":"25% bredde","50":"50% bredde","75":"75% bredde","100":"100% (Full bredde)"},"bar_alignments":{"space-between":"Mellomrom mellom","flex-start":"Venstre","center":"Senter","flex-end":"Høyre"},"bar_styles":{"flat":"Flat (Standard)","glossy":"Blank","embossed":"Preget","inset":"Innfelt","gradient":"Gradientoverlegg","neon":"Neonglød","outline":"Omriss","glass":"Glass","metallic":"Metallisk","neumorphic":"Neumorfisk"},"animation_types":{"none":"Ingen","charging-lines":"Lading (Diagonale linjer)","pulse":"Pulserende","blinking":"Blinkende","bouncing":"Hoppende","glow":"Glødende","rainbow":"Regnbue","bubbles":"Bobler","fill":"Fyll"},"custom_bar_settings":{"title":"Egendefinerte Stolpeinnstillinger","description":"Definer egendefinerte konfigurasjoner for individuelle stolper.","name":"Stolpenavn","entity":"Enhet","unit":"Enhet","min":"Min Verdi","max":"Maks Verdi","thresholds":"Terskelverdier","severity":"Alvorlighetsgrad"},"template_mode":{"header":"Mal-modus","description":"Bruk en mal for å formatere den viste teksten, konvertere enheter, eller vise beregnede verdier.","enable":"Aktiver mal-modus","template":"Mal"}},"icons":{"title":"Kortikoner","description":"Legg til ikonrader for å vise flere ikoner på kortet ditt. Hver rad kan konfigureres med forskjellige innstillinger. Merk: Ikonrader og seksjonsrekkefølge kan omorganiseres i Tilpasse-fanen.","add_row":"Legg til ikonrad","duplicate_row":"Dupliser rad","delete_row":"Slett rad","expand_row":"Utvid rad","collapse_row":"Skjul rad","no_row":"Ingen ikonrader er lagt til","row_prefix":"Rad","icon_prefix":"Ikon","add_icon":"Legg til ikon","duplicate_icon":"Dupliser ikon","delete_icon":"Slett ikon","template_mode":"Malmodus","template_mode_active_description":"Bruk en mal for å bestemme når dette ikonet skal være aktivt. Maler lar deg bruke syntaks for hjemmeassistent for komplekse forhold.","template_mode_inactive_description":"Bruk en mal for å bestemme når dette ikonet skal være inaktivt. Maler lar deg bruke syntaks for hjemmeassistent for komplekse forhold.","template_examples_header":"Vanlige eksempler:","text_formatting":"Tilstand tekstformatering","name_formatting":"Navnformatering","dynamic_icon":{"title":"Dynamisk ikonmal","description":"Bruk en mal for å dynamisk velge ikonet basert på entitetstilstander eller betingelser.","enable":"Aktiver dynamisk ikonmal"},"dynamic_color":{"title":"Dynamisk fargemal","description":"Bruk en mal for å dynamisk sette ikonfargen basert på entitetstilstander eller verdier.","enable":"Aktiver dynamisk fargemal"},"enable_template_mode":"Aktiver malmodus","row_settings":{"header":"Radinnstillinger","width":"Radbredde","width_description":"Bredde på raden som prosent av kortbredden","alignment":"Radjustering","alignment_description":"Hvordan ikoner justeres i denne raden","spacing":"Ikonavstand","spacing_description":"Mengde mellomrom mellom ikoner i denne raden","columns":"Kolonneantall","columns_description":"Antall kolonner med lik størrelse i raden (0 = automatisk fordeling basert på innhold)","confirmation_mode":"Bekreftelsesmodus","confirmation_mode_description":"Krever to trykk/klikk for å aktivere ikoner i denne raden, noe som forhindrer utilsiktede interaksjoner","layout_info_title":"Hvordan layoutinnstillinger fungerer"},"icon_settings":{"header":"Ikoninnstillinger","entity":"Enhet","entity_description":"Enhet som vises med dette ikonet","icon":"Ikon","icon_description":"Velg et ikon eller skriv inn et egendefinert ikon","name":"Navn","name_description":"Tilpasset navn som vises under ikonet (bruker enhetsnavn som standard hvis ikke angitt)","interaction_type":"Interaksjonstype","interaction_type_description":"Velg hvordan brukere samhandler med dette ikonet for å utløse handlinger","show_name":"Vis Navn","show_name_description":"Vis navneteksten under ikonet","show_state":"Vis Tilstand","show_state_description":"Vis enhetens tilstand under ikonet","show_units":"Vis Enheter","show_units_description":"Inkluder enheter når tilstanden vises","text_position":"Tekstposisjon","text_position_description":"Hvor navn- og tilstandsteksten plasseres i forhold til ikonet","click_action":"Klikkehandling","service":"Tjeneste","service_description":"Tjeneste som skal kalles (f.eks. light.turn_on)","service_data":"Tjenestedata (JSON)","service_data_description":"JSON-data sendt med tjenesteanropet","action":"Handling (JSON/Tjeneste)","action_description":"Avansert handlingskonfigurasjon (se dokumentasjon)","navigation_path":"Navigasjonssti","navigation_path_description":"Sti å navigere til (f.eks. /lovelace/dashboard)","navigation_target_selector":"Navigasjonsmål","navigation_target_description":"Velg fra tilgjengelige dashbord, visninger eller systemsider","url":"URL","url_description":"URL å åpne i ny fane","automation_entity":"Automatiseringsenhet","automation_entity_description":"Automatisering som skal utløses ved klikk"},"icon_appearance":{"header":"Ikonutseende","icon":"Ikonspesifikt","general":"Generelt Utseende","active":"Aktiv Tilstand","inactive":"Inaktiv Tilstand","state_conditions":"Tilstandsbetingelser","advanced":"Avanserte Innstillinger","icon_size":"Ikonstørrelse","icon_size_description":"Størrelse på ikonet i piksler","text_size":"Tekststørrelse","text_size_description":"Størrelse på navn/tilstandstekst i piksler","name_size":"Navnestørrelse","name_size_description":"Størrelse på enhetens navntekst i piksler","text_alignment":"Tekstjustering","text_alignment_description":"Hvordan teksten justeres under ikonet","icon_background":"Ikonbakgrunn","icon_background_description":"Legg til en bakgrunnsform bak ikonet","icon_background_color":"Ikonbakgrunnsfarge","icon_background_color_description":"Farge på bakgrunnen bak ikonet","container_background_color":"Beholderbakgrunnsfarge","container_background_color_description":"Farge på bakgrunnen bak hele ikonbeholderen","text_appearance":"Tekstutseende","container":{"header":"Containerutseende","vertical_alignment":"Vertikal Justering","vertical_alignment_description":"Juster ikonet og teksten vertikalt i beholderen.","width":"Beholderbredde","width_description":"Angi bredden på ikonbeholderen i forhold til raden.","background":"Form på beholderbakgrunn","background_description":"Velg en bakgrunnsform for hele ikonbeholderen."},"show_when_active":"Vis ikon når aktivt","show_when_active_description":"Vis dette ikonet kun når det er i en aktiv tilstand","template_mode":"Malmodus","template_description":"Bruk en mal for å bestemme aktiv/inaktiv tilstand. Maler lar deg bruke Home Assistant mal-syntaks (som {{ states.sensor.temperature.state > 70 }}) for komplekse betingelser.","active_template":"Aktiv Mal","active_template_description":"Mal som evalueres til sann når ikonet skal være aktivt.","active_state":"Aktiv tilstand","active_state_description":"Tilstandsstreng som representerer \\"aktiv\\".","active_state_text":"Egendefinert Tekst for Aktiv Tilstand","active_state_text_description":"Overskriver den viste teksten når ikonet er aktivt. La stå tomt for å bruke den faktiske tilstanden.","inactive_template":"Inaktiv Mal","inactive_template_description":"Mal som evalueres til sann når ikonet skal være inaktivt.","inactive_state":"Inaktiv tilstand","inactive_state_description":"Tilstandsstreng som representerer \\"inaktiv\\".","inactive_state_text":"Egendefinert Tekst for Inaktiv Tilstand","inactive_state_text_description":"Overskriver den viste teksten når ikonet er inaktivt. La stå tomt for å bruke den faktiske tilstanden.","active_icon":"Aktivt ikon","inactive_icon":"Inaktivt ikon","active_icon_color":"Farge på aktivt ikon","inactive_icon_color":"Farge på inaktivt ikon","active_name_color":"Farge på aktivt navn","inactive_name_color":"Farge på inaktivt navn","active_state_color":"Farge på aktiv tilstand","inactive_state_color":"Farge på inaktiv tilstand","show_icon_active":"Vis ikon når aktivt","show_icon_active_description":"Vis ikonet når tilstanden er aktiv.","show_icon_inactive":"Vis ikon når inaktivt","show_icon_inactive_description":"Vis ikonet når tilstanden er inaktiv.","custom_active_state_text":"Egendefinert Aktiv Tilstandstekst","custom_inactive_state_text":"Egendefinert Inaktiv Tilstandstekst","action_description":"Handling som skal utføres når ikonet klikkes på.","show_name_active":"Vis navn når aktivt","show_name_active_description":"Vis navnet når tilstanden er aktiv.","show_name_inactive":"Vis navn når inaktivt","show_name_inactive_description":"Vis navnet når tilstanden er inaktiv.","show_state_active":"Vis tilstand når aktiv","show_state_active_description":"Vis tilstanden når tilstanden er aktiv.","show_state_inactive":"Vis tilstand når inaktiv","show_state_inactive_description":"Vis tilstanden når tilstanden er inaktiv.","use_entity_color_for_icon":"Bruk enhetsfarge for ikon","use_entity_color_for_icon_description":"Bruk enhetens fargeattributt for ikonet når det er tilgjengelig","use_entity_color_for_icon_background":"Bruk enhetsfarge for ikonbakgrunn","use_entity_color_for_icon_background_description":"Bruk enhetens fargeattributt for ikonbakgrunnen når det er tilgjengelig","use_entity_color_for_container_background":"Bruk enhetsfarge for container","use_entity_color_for_container_background_description":"Bruk enhetens fargeattributt for containerbakgrunnen når det er tilgjengelig","dynamic_icon_template":"Dynamisk ikonmal","dynamic_icon_template_description":"Bruk en mal for å dynamisk velge ikonet basert på entitetstilstander eller betingelser.","enable_dynamic_icon_template":"Aktiver dynamisk ikonmal","dynamic_color_template":"Dynamisk fargemal","dynamic_color_template_description":"Bruk en mal for å dynamisk sette ikonfargen basert på entitetstilstander eller verdier.","enable_dynamic_color_template":"Aktiver dynamisk fargemal","size_settings":"Størrelse-innstillinger","value_size":"Verdistørrelse","state_text_formatting":"Tilstand tekstformatering","row_name":"Radnavn","row_name_description":"Tilpasset navn for denne ikonraden (la stå tom for å bruke standard navngivning)","width_description":"Kontrollerer hvor mye av den tilgjengelige bredden denne raden vil bruke. Konfigurer hvordan denne raden med ikoner vises. Bredde kontrollerer den totale radbredden, mellomrom justerer hull mellom ikoner, og kolonneantall bestemmer hvor mange ikoner som vises i hver rad (0 = automatisk).","layout_info_title":"Hvordan layout-innstillinger fungerer","layout_info_width":"Radbredde: Kontrollerer hvor mye horisontal plass raden tar opp i kortet (prosent av kortbredde)","layout_info_alignment":"Radjustering: Gjelder bare når kolonneantall er 0. Bestemmer hvordan ikoner posisjoneres innenfor raden","layout_info_spacing":"Ikonmellomrom: Setter mengden plass mellom ikoner","layout_info_columns":"Kolonneantall: Når satt til 0, flyter ikoner naturlig basert på tilgjengelig plass. Når satt til et tall, tvinger det eksakte antallet kolonner i et rutenettlayout","layout_info_tip":"Bruk kolonneantall med konsistente mengder ikoner per rad for den mest uniforme layouten","control_right_side_description":"Kontroller når høyre side vises eller skjules basert på entitetstilstand","dynamic_icon":{"title":"Dynamisk ikonmal","description":"Bruk en mal for å dynamisk velge ikonet basert på entitetstilstander eller betingelser.","enable":"Aktiver dynamisk ikonmal","template_label":"Ikonmal"},"dynamic_color":{"title":"Dynamisk fargemal","description":"Bruk en mal for å dynamisk sette ikonfargen basert på entitetstilstander eller verdier.","enable":"Aktiver dynamisk fargemal","template_label":"Fargemal"}},"tabs":{"general":"Generelt","actions":"Handlinger","appearance":"Utseende","states":"Tilstander","active_state":"Aktiv Tilstand","inactive_state":"Inaktiv Tilstand","icons":{"arrange_icon_rows":"Organiser Ikonrader"}},"alignments":{"flex-start":"Venstre","center":"Senter","flex-end":"Høyre","space-between":"Mellomrom mellom","space-around":"Mellomrom rundt","space-evenly":"Jevnt mellomrom"},"vertical_alignments":{"flex-start":"Topp","center":"Midten","flex-end":"Bunn"},"spacing":{"none":"Ingen","small":"Liten","medium":"Medium","large":"Stor"},"text_positions":{"below":"Under ikonet","beside":"Ved siden av ikonet","none":"Ingen tekst","top":"Topp","left":"Venstre","right":"Høyre"},"reset":{"size":"Tilbakestill til standardstørrelse","color":"Tilbakestill til standardfarge","all":"Tilbakestill til standardverdier"},"click_actions":{"toggle":"Veksle Enhet","more-info":"Vis Mer Informasjon","navigate":"Naviger til Sti","url":"Åpne URL","call-service":"Kall Tjeneste","perform-action":"Utfør Handling","location-map":"Vis Plasseringskart","assist":"Stemmeassistent","trigger":"Utløs","none":"Ingen Handling","descriptions":{"toggle":"Veksler tilstanden til enheten.","more-info":"Åpner mer-info dialogen for enheten.","navigate":"Navigerer til den angitte Lovelace-stien.","url":"Åpner den angitte URL-en i en ny fane.","call-service":"Kaller den angitte Home Assistant-tjenesten.","perform-action":"Utfører en egendefinert handling (se dokumentasjon).","location-map":"Viser enheten på et kart.","assist":"Åpner Home Assistant stemmeassistenten.","trigger":"Utløser enheten (automatisering, skript, knapp, osv.).","none":"Ingen handling vil bli utført."}},"backgrounds":{"none":"Ingen","circle":"Sirkel","square":"Kvadrat","rounded_square":"Avrundet kvadrat"},"container_widths":{"25":"25% bredde","50":"50% bredde","75":"75% bredde","100":"100% (Full bredde)"},"row_widths":{"25":"25% bredde","50":"50% bredde","75":"75% bredde","100":"100% (Full bredde)"},"interactions":{"single":"Enkelt Trykk/Klikk","double":"Dobbelt Trykk/Klikk","hold":"Hold/Langt Trykk"},"animations":{"title":"Ikon Animasjon","active_description":"Velg en animasjon å bruke når dette ikonet er i aktiv tilstand.","inactive_description":"Velg en animasjon å bruke når dette ikonet er i inaktiv tilstand.","select_animation":"Velg Animasjon","none":"Ingen","pulse":"Puls","vibrate":"Vibrere","rotate_left":"Roter Venstre","rotate_right":"Roter Høyre","hover":"Sveve","fade":"Fade","scale":"Skaler","bounce":"Sprette","shake":"Riste","tada":"Tada"},"row_vertical_alignments":{"top":"Topp","center":"Midten","bottom":"Bunn"},"actions":{"single":"Enkelt Klikk Handling","double":"Dobbelt Klikk Handling","hold":"Hold Handling","single_description":"Handling utført på et enkelt trykk/klikk - mest vanlige interaksjon","double_description":"Handling utført på et dobbelt trykk/klikk - hjelper å forhindre utilsiktede utløsninger","hold_description":"Handling utført når man holder nede i 500ms - ideelt for kritiske handlinger","section_header":"Interaksjons Handlinger"}},"customize":{"title":"Tilpass layout","description":"Tilpass layout, bestill og legg til seksjoner i kortet ditt","condition_prompt":"Velg \\"Vis\\" eller \\"Skjul\\" for å konfigurere enhetstilstand","template_mode_active":"Bruk Malmodus","layout":{"title":"Layout-stil","description":"Velg mellom enkelt-kolonne eller dobbelt-kolonne layout for kortet","header":"Layout-innstillinger","descriptions_header":"Layout-beskrivelser","single_column":"Enkelt kolonne","single_column_description":"Alle seksjoner er stablet vertikalt i en enkelt kolonne - best for enkle skjermer og mobilvisninger.","double_column":"Dobbel kolonne","double_column_description":"Seksjoner er delt mellom to kolonner for effektiv bruk av horisontal plass - ideelt for bredere skjermer.","top_view":"Toppvisning","top_view_description":"Bildet vises fremtredende øverst med andre seksjoner arrangert i konfigurerbare posisjoner rundt det.","half_full":"Halv + Full","half_full_description":"Øverste rad har to halvbredde-seksjoner, nederste rad har en fullbredde-seksjon - flott for balanserte layouter.","full_half":"Full + Halv","full_half_description":"Øverste rad har en fullbredde-seksjon, nederste rad har to halvbredde-seksjoner - perfekt for å fremheve toppinnhold."},"layout_types":{"single":"Enkelt kolonne","double":"Dobbelt kolonne","dashboard":"Dashbordvisning","half_full":"Halv + full","full_half":"Full + halvparten"},"column_width":{"title":"Kolonnebredde","description":"Konfigurer breddeforholdet mellom venstre og høyre kolonner","50_50":"Lik (50/50)","30_70":"Smal venstre, bred høyre (30/70)","70_30":"Bred venstre, smal høyre (70/30)","40_60":"Litt smal venstre (40/60)","60_40":"Litt bred venstre (60/40)"},"top_view":{"header":"Dashbordvisningsinnstillinger","description":"Konfigurer mellomrom og layoutinnstillinger for dashbordvisning","side_margin":"Sidemarg","side_margin_help":"Marg på sidene av dashbordet i piksler","middle_spacing":"Midtmellomrom","middle_spacing_help":"Mellomrom mellom midtkolonnene i piksler","vertical_spacing":"Vertikalt Mellomrom","vertical_spacing_help":"Mellomrom mellom rader i piksler"},"sections":{"header":"Kortseksjoner","arrangement_header":"Seksjonsarrangement","arrangement_desc_base":"Dra og slipp seksjoner for å arrangere rekkefølgen på kortet.","arrangement_desc_single_extra":"Alle seksjoner vil vises i en enkelt kolonne.","arrangement_desc_double_extra":"I en dobbelt-kolonne layout kan du plassere alle seksjoner i enten venstre eller høyre kolonne.","arrangement_desc_dashboard_extra":"I en dashbordvisning kan du plassere seksjoner rundt kjøretøybildet ditt."},"section_labels":{"title":"Tittel","image":"Kjøretøybilde","info":"Kjøretøyinfo","bars":"Alle sensorbarer","icons":"Alle ikonrader","section_break":"Seksjonsbrudd"},"actions":{"collapse_margins":"Skjul marginer","expand_margins":"Utvid marginer","collapse_options":"Skjul alternativer","expand_options":"Utvid alternativer","add_break":"Legg til seksjonsbrudd","delete_break":"Slett seksjonsbrudd"},"css":{"header":"Global CSS","description":"Skriv inn egendefinerte CSS-regler her for å overstyre kortets standardstil. Disse reglene vil bli brukt direkte på kortet. Bruk med forsiktighet.","label":"Egendefinert CSS","input_description":"Skriv inn dine egendefinerte CSS-regler her."},"conditions":{"header":"Betingelseslogikk","description":"Valgfritt vis eller skjul denne seksjonen basert på en enhets tilstand.","template_mode_description":"Bruk en mal for å bestemme seksjonssynlighet. Maler lar deg bruke Home Assistant mal-syntaks for komplekse betingelser.","type_label":"Betingelsestype","section_title":"Seksjonstittel","enable_section_title":"Aktiver seksjonstittel","title_text":"Titteltekst","title_size":"Tittelstørrelse","title_color":"Tittelfarge","enable_template_mode":"Aktiver mal-modus","use_template_description":"Bruk en mal for å bestemme når denne seksjonen skal være synlig. Maler lar deg bruke Home Assistant mal-syntaks for komplekse betingelser.","info_row":"Info-rad","entity_label":"Betingelsesenhet","state_label":"Betingelsestilstand","state_description":"Tilstandsverdien som utløser betingelsen","types":{"none":"Ingen (Vis Alltid)","show":"Vis Når...","hide":"Skjul Når..."}},"template":{"description":"Bruk en mal for å bestemme når denne seksjonen skal være synlig. Maler lar deg bruke Home Assistant mal-syntaks for komplekse betingelser.","enable":"Aktiver Malmodus"},"template_mode":{"header":"Mal-modus","description":"Bruk en mal for å kontrollere når dette bildet vises eller skjules basert på kompleks logikk, beregninger, eller flere entitetstilstander.","enable":"Aktiver mal-modus","disabled_notice":"(Deaktivert - Mal-modus aktiv)","disabled_help":"Grunnleggende betingelseskontroller er deaktivert når mal-modus er aktiv. Mal-modus har forrang over grunnleggende betingelser.","examples":{"show_when_charging":"Vis når lading","show_when_battery_low":"Vis når batteri lavt","multiple_conditions":"Flere betingelser","show_during_day":"Vis i løpet av dagtimer","show_when_door_unlocked":"Vis når dør ulåst"}},"section_title":{"header":"Seksjonstittel","enable":"Aktiver Seksjonstittel","text":"Tittel Tekst","size":"Tittel Størrelse","color":"Tittel Farge","bold":"Fet","italic":"Kursiv","uppercase":"Store Bokstaver","strikethrough":"Gjennomstreket"},"margins":{"header":"Marginer","top":"Toppmargin","bottom":"Bunnmargin"},"columns":{"left":"Venstre kolonne","right":"Høyre kolonne","empty":"Slipp seksjoner her"},"dashboard":{"top":"Toppseksjon","top_middle":"Topp Midtseksjon","left_middle":"Venstre Midtseksjon","middle":"Midtseksjon","middle_empty":"Kjøretøybildeområde (Anbefalt)","right_middle":"Høyre Midtseksjon","bottom_middle":"Bunn Midtseksjon","bottom":"Bunnseksjon"},"half_full":{"row1_col1":"Rad 1 - Venstre Kolonne","row1_col2":"Rad 1 - Høyre Kolonne","row2_full":"Rad 2, full bredde (100%)"},"full_half":{"row1_full":"Rad 1, full bredde (100%)","row2_col1":"Rad 2 - Venstre Kolonne","row2_col2":"Rad 2 - Høyre Kolonne"},"break_styles":{"blank":"Blank (ingen linje)","line":"Solid linje","double_line":"Dobbel linje","dotted":"Stiplet linje","double_dotted":"Dobbelt stiplet linje","shadow":"Skyggegradient"},"break_style":{"header":"Pause-stil","style_label":"Stil","thickness_label":"Tykkelse","width_percent_label":"Bredde (%)","color_label":"Farge"}},"container_widths":{"25":"25% bredde","50":"50% bredde","75":"75% bredde","100":"100% (Full bredde)"},"row_widths":{"25":"25% bredde","50":"50% bredde","75":"75% bredde","100":"100% (Full bredde)"}},"about":{"logo_alt":"Ultra Vehicle Card","developed_by":"Utviklet av","discord_button":"Bli med i vår Discord","docs_button":"Se vår dokumentasjon","donate_button":"DONÉR (PAYPAL)","github_button":"Besøk vår Github","support_title":"Støtt Ultra Vehicle Card","support_description":"Dine sjenerøse tips gir utviklingen av fantastiske funksjoner for dette kortet! Uten støtte fra brukere som deg, ville ikke innovasjon ikke være mulig."},"custom_icons":{"title":"Egendefinerte Ikoner","description":"Definer egendefinerte ikoner for forskjellige tilstander.","icon_entity":"Ikonentitet","default_icon":"Standard Ikon","state_icons":"Tilstandsikoner","state":"Tilstand","icon":"Ikon"},"custom_active_state_text":"Egendefinert Aktiv Tilstandstekst","custom_inactive_state_text":"Egendefinert Inaktiv Tilstandstekst","image_settings":{"title":"Bildeinnstillinger","description":"Konfigurer hovedbildets utseende.","type":"Bildetype","width":"Bildebredde","crop":"Bildebeskjæring","entity":"Bildeentitet","entity_description":"Enhet som gir bilde-URL"},"entity_settings":{"entity":"Enhet","entity_description":"Velg en enhet for å vise informasjon fra","name":"Navn","name_description":"Overstyr enhetsnavnet (la være tomt for å bruke enhetens vennlige navn)","show_icon":"Vis ikon","icon":"Ikon","icon_color":"Ikonfarge","name_color":"Navnfarge","entity_color":"Enhetsfarge","text_color":"Enhetsfarge","show_name":"Vis navn","show_name_description":"Vis enhetens navn før verdien","template_mode":"Bruk Mal for Verdi","template_mode_description":"Bruk en mal for å formatere enhetsverdien","value_template":"Verdimal","template_header":"Verdimal","template_examples_header":"Mal-eksempler","template_basic":"Grunnleggende verdi","template_units":"Med enheter","template_round":"Runde til 1 desimal","dynamic_icon_template":"Ikonmal","dynamic_color_template":"Fargemal","dynamic_icon_template_mode":"Aktiver dynamisk ikonmal","dynamic_color_template_mode":"Aktiver dynamisk fargemal"}}');var It=a.t($t,2);const jt=JSON.parse('{"editor":{"tabs":{"settings":"Innstillingar","bars":"Søyler","icons":"Ikon","customize":"Tilpass","about":"Om","info":"Info","images":"Bilete"},"info":{"title":"Kortinformasjon","description":"Konfigurer informasjonsrader og enheter for å vise kjøretøydetaljer som plassering, kjørelengde, etc. Info -elementer vises på en enkelt linje når det er mulig, og pakker til flere linjer i smale containere.","add_row":"Legg til inforad","add_entity":"Legg til infoeining","arrange_info_rows":"Arranger info rader","duplicate_row":"Dupliser rad","delete_row":"Slett rad","expand_row":"Utvid rad","collapse_row":"Kollaps rad","duplicate_entity":"Dupliser eining","delete_entity":"Slett eining","expand_entity":"Utvid eining","collapse_entity":"Kollaps eining","row_prefix":"Inforad","entity_prefix":"Eining","template_mode":"Malmodus","template_mode_description":"Bruk en mal for å formatere enhetsverdien. Maler lar deg bruke syntaks for hjemmeassistent for kompleks formatering.","template_examples_header":"Vanlige eksempler:","dynamic_icon":{"title":"Dynamisk ikonmal","description":"Bruk ein mal for å dynamisk velje ikonet basert på einingstilstandar eller vilkår.","enable":"Aktiver dynamisk ikonmal"},"dynamic_color":{"title":"Dynamisk fargemal","description":"Bruk ein mal for å dynamisk setje fargar basert på einingstilstandar eller verdiar.","enable":"Aktiver dynamisk fargemal"},"row_settings":{"header":"Radinnstillingar","row_name":"Radnamn","row_name_description":"Tilpassa namn for denne inforaden (lat stå tom for å bruke standardnamn)","horizontal_alignment":"Horisontal justering","alignment_description":"Horisontal justering av einingar i denne raden","vertical_alignment":"Vertikal justering","vertical_alignment_description":"Kontrollerer korleis einingar er justerte vertikalt i raden.","spacing":"Avstand","spacing_description":"Avstand mellom einingar i denne raden","allow_wrap":"Tillat element å bryte","allow_wrap_description":"Når aktivert vil element flyte til neste linje viss dei ikkje passar i ei rad. Når deaktivert vil alle element halde seg i ei einskild rad."},"entity_settings":{"header":"Infoelement","name":"Tilpassa namn","entity_description":"Vel ei eining å vise informasjon frå","name_description":"Overskriv einingsnamnet (lat stå tom for å bruke einings venlegsnamn)","show_icon":"Vis ikon","icon_color":"Ikonfarge","name_color":"Namnfarge","entity_color":"Einingsfarge","icon_size":"Ikonstorleik","name_size":"Namnstorleik","value_size":"Verdistorleik","size_settings":"Storleikinnstillingar","show_name":"Vis namn","show_name_description":"Vis einingsnamnet før verdien","click_action":"Klikkshandling","navigation_path":"Navigasjonsstiar","navigation_path_description":"Stiar å navigere til når ein klikkar (t.d. /lovelace/0)","url":"URL","url_description":"URL å opne når ein klikkar","service":"Teneste","service_description":"Teneste å kalle (t.d. light.turn_on)","service_data":"Tenestedata (JSON)"},"alignments":{"flex-start":"Start","center":"Senter","flex-end":"Slutt","space-between":"Plass mellom","space-around":"Plass rundt","space-evenly":"Jamt fordelt plass"},"spacing":{"none":"Ingen","small":"Liten","medium":"Medium","large":"Stor"},"click_actions":{"more-info":"Meir info","navigate":"Naviger","url":"Opne URL","call-service":"Kall teneste","none":"Ingen"},"row_vertical_alignments":{"top":"Topp","center":"Senter","bottom":"Botn"}},"settings_subtabs":{"general":"Generelt","action_images":"Handlingsbilete"},"action_images":{"title":"Innstillingar for Handlingsbilete","description":"Konfigurer bilete som vil visast når spesifikke entitetstilstandar er oppfylte.","add_image":"Legg til Handlingsbilete","no_images":"Ingen handlingsbilete konfigurert enno. Legg til eitt for å kome i gang.","actions":{"drag":"Dra for å endre rekkefølgje","duplicate":"Dupliser","delete":"Slett","expand":"Utvid","collapse":"Skjul"},"delete_confirm":"Er du sikker på at du vil slette dette handlingsbiletet?","entity_settings":"Entitetsinnstillingar","image_settings":"Bileteinnstillingar","entity_placeholder":"Vel ein entitet","state_placeholder":"Angi tilstandsverdi","preview":{"no_entity":"Ingen entitet vald","no_image":"Ingen bilete","any_state":"Einkvar tilstand"},"trigger_entity":"Utløysar Eining","trigger_state":"Utløysar Tilstand","entity_help":"Vel ei eining å overvake. Biletet vil visast når denne eininga matchar tilstanden nedanfor.","state_help":"Skriv inn tilstandsverdien som vil utløyse dette biletet. Lat stå tomt for å matche einkvar tilstand.","image_type":{"title":"Biletetype","upload":"Last opp bilete","url":"Bilete-URL","entity":"Entitetsbilete","none":"Ingen"},"template_mode":"Malmodus","template_description":"Bruk ein mal for å bestemme når dette biletet skal visast. Malar let deg bruke Home Assistant-malsyntaks (som {{ states.sensor.temperature.state > 70 }}) for komplekse vilkår.","template_label":"Visningsmal","template_help":"Skriv inn ein mal som returnerer true/false. Dette biletet vil visast når malen evaluerer til true. Bruk Jinja2-syntaks: {{ states(...) }}","priority":{"label":"Visningsprioritet","description":"Prioritetsbasert bruker det første treffet frå topp til botn. Nyaste Treff bruker det siste treffet funne i lista.","options":{"priority":"Prioritetsbasert","newest":"Nyaste Treff"}}},"images":{"title":"Bilete","description":"Konfigurer bilete som vil visast basert på vilkår eller malar.","add_image":"Legg til Bilete","no_images":"Ingen bilete konfigurert enno. Legg til eitt for å kome i gang.","arrange_images":"Organiser Bilete","name":"Namn (Valfritt)","image_type":"Biletetype","url":"Bilete URL","image_entity":"Bilete Eining","priority":"Prioritet (0 = høgast)","priority_mode":"Prioritetsmodus","timed_duration":"Visningstid (sekund)","timed_duration_help":"Kor lenge dette biletet skal visast før det går tilbake til hovudbildet.","duplicate":"Dupliser Bilete","delete":"Slett Bilete","delete_confirm":"Er du sikker på at du vil slette dette biletet?","image_types":{"none":"Ingen","default":"Standard Køyretøy","url":"Bilete URL","upload":"Last opp Bilete","entity":"Eining Bilete","map":"Kart"},"priority_modes":{"order":"Rekkjefølgje Prioritet","order_help":"Bilete vert viste basert på rekkjefølgja deira i lista (dra for å omorganisere).","last_triggered":"Sist Utløyst","last_triggered_help":"Det sist utløyste biletet vil bli vist inntil eit anna bilete vert utløyst.","timed":"Tidsstyrte Bilete","timed_help":"Bilete under det første vil visast i ein sett varigheit og deretter gå tilbake til hovudbildet."},"conditional_types":{"show":"Vis Når","hide":"Skjul Når"},"tabs":{"general":"Generelt","conditional":"Vilkårsbasert","appearance":"Utsjånad"},"conditional_help":"Konfigurer når dette biletet skal visast basert på einingstilstandar eller malar.","conditional_help_simple":"Konfigurer når dette biletet skal visast basert på einingstilstandar.","conditional_state_help":"Biletet vil visast når eininga er lik denne tilstandsverdien.","conditional_entity":"Vilkårsbasert Eining","conditional_state":"Vilkårsbasert Tilstand","basic_conditions":"Grunnleggjande Vilkår","advanced_conditional":"Avanserte Mal Vilkår","advanced_help":"Bruk malar for komplekse vilkår som fleire einingar eller matematiske samanlikningar.","template_mode_active_help":"Bruk malar for komplekse vilkår som fleire einingar eller matematiske samanlikningar.","template_mode":{"header":"Malmodus","enable":"Aktiver Malmodus","template":"Mal"},"template_examples_header":"Vanlege Døme:","width":"Breidd (%)","width_settings":"Breidd Innstillingar","crop_settings":"Skjering Innstillingar","crop_help":"Positive verdiar skjer innover, negative verdiar legg til utfylling utover.","crop_top":"Topp","crop_right":"Høgre","crop_bottom":"Botn","crop_left":"Venstre","fallback_image":"Reserve Bilete","fallback_help":"Dette biletet vil verte brukt som reserve viss ingen utløysarar matchar eller timeout skjer. Berre eitt bilete kan vere ein reserve.","map_entity":"Posisjon Eining","map_entity_help":"Vel ei eining med breddegrad/lengdegrad koordinatar eller adresse å vise på kartet.","target_entity":"Mål Eining","target_entity_description":"Vel eininga å målrette med denne handlinga","common":{"width":"Biletebreidd","width_description":"Bredde i prosent av kortet","width_over_100":"Verdier over 100% kan bidra til å beskjære tomt plass rundt bilder","url_description":"Skriv inn URL-en for biletet"},"vehicle":{"crop":"Skjer biletet"},"migration":{"title":"Gamle Bilete Oppdaga","description":"Vi fann gamle biletekonfigurasjonar som kan migrerast til det nye formatet.","migrate_button":"Migrer No","success":"Bilete migrerte vellykka!"}},"card_settings":{"title":"Korttittel","title_alignment":"Titteljustering","title_size":"Tittelstorleik","title_color":"Tittel Farge","title_color_description":"Farge på korttittelen","title_description":"Tittel som vert vist øvst på kortet (valfritt)","title_alignment_description":"Korleis korttittelen vert justert","title_size_description":"Storleiken på korttittelen i pikslar","colors":"Fargar","card_background":"Kort Bakgrunn","card_background_description":"Bakgrunnsfarge for heile kortet","format_entities":"Formater Einingsverdi","format_entities_description":"Aktiver ytterlegare formatering av einingsverdi (legg til komma, konverter einingar, osv.)","show_units":"Vis Einingar","show_units_description":"Vis måleeiningar ved sida av verdiar","help_highlight":"Hjelp med å fremheve","help_highlight_description":"Vis visuelle høydepunkter når du bytter mellom redigeringsfaner for å identifisere hvilken seksjon du redigerer","general":"Generelt","conditional_logic":"Vilkårslogikk","card_visibility":"Kort Synlegheit","card_visibility_description":"Vis eller skjul heile kortet basert på eit einingsvilkår"},"vehicle_info":{"title":"Køyretøyinformasjon","location":{"title":"Plasseringseining","description":"Vel eininga som viser køyretøyet si noverande plassering.","show":"Vis Plassering","show_description":"Vis køyretøyet si plassering"},"mileage":{"title":"Kilometereining","description":"Vel eininga som representerer køyretøyet sin totale kilometerstand eller kilometerteller.","show":"Vis Kilometerstand","show_description":"Vis køyretøyet sin kilometerstand"},"car_state":{"title":"Køyretøytilstandseining","description":"Vel eininga som representerer køyretøyet sin noverande tilstand (t.d. parkert, køyrande, ladar).","show":"Vis Køyretøytilstand","show_description":"Vis køyretøyet sin tilstand"}},"crop":{"title":"Bileteskjering","top":"Topp","right":"Høgre","bottom":"Botn","left":"Venstre","pixels":"PX","help":"Angi verdiar i pikslar (positive eller negative) for å justere skjering og utfylling"},"alignment":{"left":"Venstre","center":"Senter","right":"Høgre"},"common":{"choose_file":"Vel fil","no_file_chosen":"Ingen fil vald","entity":"Eining","width":"Breidd","width_description":"Breidd som prosent av kortet","width_over_100":"Verdier over 100% kan bidra til å beskjære tomt plass rundt bilder","none":"Ingen","default":"Standard","upload":"Last opp","url":"URL","url_description":"URL som peiker til biletet","reset":"Tilbakestill","condition_prompt":"Velg \\"Vis\\" eller \\"Skjul\\" for å konfigurere enhetstilstand","bold":"Feit","italic":"Kursiv","uppercase":"Store Bokstavar","strikethrough":"Gjennomstreka"},"conditions":{"condition_type":"Vilkårstype","show_card_if":"Vis Kort Viss","hide_card_if":"Skjul Kort Viss","entity_description":"Vel eininga å sjekke for vilkåret","state":"Tilstand","state_description":"Tilstandsverdien som utløyser vilkåret"},"bars":{"title":"Prosentsøyler","description":"Legg til prosentsøyler for å vise verdiar som drivstoffnivå, batterilading eller rekkevidde. Kvar søyle kan vise ein primær prosentverdi med valfrie etikettar til venstre og høgre.","add":"Legg til ny søyle","duplicate":"Dupliser søyle","delete":"Slett søyle","expand":"Utvid søyle","collapse":"Skjul søyle","no_entity":"Ingen eining vald","bar_prefix":"Søyle","template":{"description":"Bruk en mal for å formatere den viste teksten, konvertere enheter eller vise beregnede verdier.","enable":"Aktiver malmodus","template_label":"Mal","helper_text":"Bruk Home Assistant-malsyntaks. Døme:\\n• {{ states(\'sensor.temperature\') | float * 1.8 + 32 }} °F\\n• {{ now().strftime(\\"%b %d, %H:%M\\") }}","examples_header":"Vanlige eksempler:","examples":{"temperature":"{{ states(\'sensor.temperature\') | float * 1.8 + 32 }}°F - Konverter Celsius til Fahrenheit","datetime":"{{ now().strftime(\\"%b %d, %H:%M\\") }} - Formater gjeldande dato/tid","power":"{{ \'Ladar på \' + states(\'sensor.ev_power\') + \' kW\' }} - Kombiner tekst og sensorverdi"}},"bar_radius":{"round":"Rund","square":"Firkantet","rounded-square":"Avrunda Firkant"},"tabs":{"arrange_bars":"Organiser søyler","config":"Konfigurasjon","colors":"Fargar","animation":"Animasjon"},"settings":{"header":"Søylekonfigurasjon","entity":"Hovudentitet","entity_description":"Entitet som gir den primære verdien (0-100) for framgangssøyla","limit_entity":"Grenseentitet","limit_entity_description":"Entitet som viser ein grensemarkør på søyla (f.eks. ladeterskel)","limit_color":"Grenseindikator Farge","limit_color_description":"Farge til grenseindikatorlinja","bar_size":"Søyletjukkleik","bar_size_description":"Storleik/tjukkleik på framgangssøyla","bar_radius":"Søyleradius","bar_radius_description":"Form på hjørna til framgangssøyla","width":"Søylebradde","width_description":"Bredde på framgangssøyla som prosent av tilgjengeleg plass. Bruk dette for å plassere fleire søyler side ved side.","alignment":"Etikett Justering","alignment_description":"Korleis etikettane på framgangssøyla justerast","show_percentage":"Vis Prosentdel","show_percentage_description":"Vis prosentverdien inni søyla"},"percentage":{"header":"Prosenttekst","display_header":"Visning av Prosenttekst","display_description":"Kontroller synlegheita og utsjånaden av prosentverdiar vist direkte på søyla. Desse tala gir ein tydeleg visuell indikator på det noverande nivået.","text_size":"Tekststorleik","calculation_header":"Prosentutrekning","calculation_description":"Konfigurer korleis søyla sin prosentvise fyllingsgrad vert rekna ut ved hjelp av ein av alternativa nedanfor.","type_header":"Prosentutrekning","type_label":"Prosenttype","type_description":"Korleis prosentverdien som visast i søyla reknast ut","type_entity":"Entitet (0-100)","type_attribute":"Einingsattributt","type_template":"Malmodus","type_difference":"Forskjell (Mengd/Total)","amount_entity":"Mengdentitet","amount_description":"Entitet som representerer noverande mengd/verdi (teljar)","total_entity":"Totalentitet","total_description":"Entitet som representerer total mengd/maksimum (nemnar)"},"left_side":{"header":"Venstre Side","section_description":"Konfigurer tittel og einingsverdi som vert vist på venstre side av søyla. Dette er nyttig for å vise etikettar som \'Rekkevidde\' eller \'Batteri\' saman med verdiane deira.","toggle_description":"Vis eller skjul venstre side av søyleetiketten","title":"Venstre Tittel","title_description":"Valfri etikett som vert vist på venstre side under søylen.","entity":"Venstre Eining","entity_description":"Eining som får verdien vist på venstre side av søylen.","alignment_description":"Kontrollerer korleis denne etiketten vert justert under søylen.","title_size":"Tittelstorleik","value_size":"Verdistorleik","hidden_message":"Venstre side er skjult"},"right_side":{"header":"Høgre Side","section_description":"Konfigurer tittel og einingsverdi som vert vist på høgre side av søyla. Dette er ideelt for komplementerande informasjon som \'Tid til Full\' eller sekundære målingar.","toggle_description":"Vis eller skjul høgre side av søyleetiketten","title":"Høgre Tittel","title_description":"Valfri etikett som vert vist på høgre side under søylen.","entity":"Høgre Eining","entity_description":"Eining som får verdien vist på høgre side av søylen.","alignment_description":"Kontrollerer korleis denne etiketten vert justert under søylen.","title_size":"Tittelstorleik","value_size":"Verdistorleik","hidden_message":"Høgre side er skjult"},"colors":{"header":"Fargar","bar_color":"Søylefarge","background_color":"Bakgrunnsfarge","border_color":"Kantfarge","limit_indicator_color":"Grenseindikatorfarve","left_title_color":"Venstre Tittelfarge","left_value_color":"Venstre Verdifarge","right_title_color":"Høgre Tittelfarge","right_value_color":"Høgre Verdifarge","percentage_text_color":"Prosenttekstfarge","reset_color":"Tilbakestill til standardfarge"},"gradient":{"header":"Gradientmodus","description":"Lag vakre fargeovergangar på framgangssøylene dine. Ideelt for å vise batterinivå, drivstoffmålarar eller andre statusindikatorar som krev visuell framheving.","toggle":"Bruk gradient","toggle_description":"Bruk ein gradient for framdriftslinja i staden for ein einsfarga farge","display_mode":"Gradientvisningsmodus","display_mode_full":"Full","display_mode_value_based":"Verdibasert","display_mode_cropped":"Beskoren","display_mode_description":"Full: Vis heile gradienten. Verdibasert: Vis gradient opp til noverande verdi.","editor_header":"Gradienteditor","add_stop":"Legg til stopp"},"animation":{"header":"Handlingsanimasjon","description":"Legg til animasjonar på søylen når ei spesifikk eining når ein bestemt tilstand. Perfekt for å vise ladestatus, alarmtilstandar og meir.","pro_tip":"Pro-tips: For \'alltid aktive\' animasjonar, vel ein animasjonstype men la einings- og tilstandsfelta vere tomme. Prøv \'Bobler\' og \'Fyll\' animasjonane!","entity":"Animasjonseining","entity_description":"Eining som utløyser animasjonen når den matchar den angitte tilstanden","state":"Einingstilstand","state_description":"Når einingstilstanden matchar denne verdien, vil animasjonen bli utløyst","type":"Animasjonstype","type_description":"Animasjonseffekten som vert vist når einingstilstanden samsvarar","select_entity_prompt":"Vel ei Eining og skriv inn tilstanden du ønskjer å utløyse animasjonen med (døme: \\"charging\\", \\"on\\", \\"idle\\")","action_entity":"Handlingsenhet","action_state":"Handlingsstatus","action_description":"Denne animasjonen vil overstyre den vanlige animasjonen når den spesifiserte enheten er i en spesifikk tilstand.","action_entity_prompt":"Velg en handlingsenhet og stat for å definere når denne animasjonen skal overstyre den vanlige animasjonen"},"bar_sizes":{"thin":"Tynn","regular":"Normal","thick":"Tjukk","thiccc":"Ekstra tjukk"},"bar_widths":{"25":"25% breidd","50":"50% breidd","75":"75% breidd","100":"100% (Full breidd)"},"bar_alignments":{"space-between":"Mellomrom mellom","flex-start":"Venstre","center":"Senter","flex-end":"Høgre"},"bar_styles":{"flat":"Flat (Standard)","glossy":"Blank","embossed":"Relief","inset":"Innsett","gradient":"Gradientoverlegg","neon":"Neonglød","outline":"Kontur","glass":"Glas","metallic":"Metallisk","neumorphic":"Neumorfisk"},"animation_types":{"none":"Ingen","charging-lines":"Lading (Diagonale linjer)","pulse":"Pulserande","blinking":"Blinkande","bouncing":"Hoppande","glow":"Glødande","rainbow":"Regnboge","bubbles":"Bobler","fill":"Fyll"},"custom_bar_settings":{"title":"Tilpassa Søyleinnstillingar","description":"Definer tilpassa konfigurasjonar for individuelle søyler.","name":"Søylenamn","entity":"Eining","unit":"Eining","min":"Min Verdi","max":"Maks Verdi","thresholds":"Terskelverdiar","severity":"Alvorlegheitsgrad"},"template_mode":{"header":"Malmodus","description":"Use a template to format the displayed text, convert units, or show calculated values.","enable":"Enable Template Mode","template":"Template"}},"icons":{"title":"Kortikon","description":"Legg til ikonrader for å vise fleire ikon på kortet ditt. Kvar rad kan konfigurerast med forskjellige innstillingar. Merk: Ikonrader og seksjonsrekkjefølgje kan omorganiserast i Tilpassa-fanen.","add_row":"Legg til ikonrad","duplicate_row":"Dupliser rad","delete_row":"Slett rad","expand_row":"Utvid rad","collapse_row":"Skjul rad","no_row":"Ingen ikonrader er lagt til","row_prefix":"Rad","icon_prefix":"Ikon","add_icon":"Legg til ikon","duplicate_icon":"Dupliser ikon","delete_icon":"Slett ikon","template_mode":"Malmodus","template_mode_active_description":"Bruk en mal for å bestemme når dette ikonet skal være aktivt. Maler lar deg bruke syntaks for hjemmeassistent for komplekse forhold.","template_mode_inactive_description":"Bruk en mal for å bestemme når dette ikonet skal være inaktivt. Maler lar deg bruke syntaks for hjemmeassistent for komplekse forhold.","template_examples_header":"Vanlige eksempler:","text_formatting":"State Text Formatting","name_formatting":"Name Formatting","dynamic_icon":{"title":"Dynamisk ikonmal","description":"Use a template to dynamically select the icon based on entity states or conditions.","enable":"Aktiver dynamisk ikonmal"},"dynamic_color":{"title":"Dynamisk fargemal","description":"Use a template to dynamically set the icon color based on entity states or values.","enable":"Aktiver dynamisk fargemal"},"enable_template_mode":"Aktiver malmodus","row_settings":{"header":"Radinnstillingar","width":"Radbreidd","width_description":"Breidd på raden som prosent av kortbreidda","alignment":"Radjustering","alignment_description":"Korleis ikon vert justert i denne raden","spacing":"Ikonavstand","spacing_description":"Mengde mellomrom mellom ikon i denne raden","columns":"Tal på kolonnar","columns_description":"Tal på kolonnar med jamn storleik i rada (0 = automatisk fordeling basert på innhald)","confirmation_mode":"Stadfestingsmodus","confirmation_mode_description":"Krev to trykk/klikk for å aktivere ikon i denne rada, for å hindre utilsikta interaksjonar","layout_info_title":"Hvordan layoutinnstillinger fungerer"},"icon_settings":{"header":"Ikoninnstillingar","entity":"Eining","entity_description":"Eining som vert vist med dette ikonet","icon":"Ikon","icon_description":"Vel eit ikon eller skriv inn eit eigendefinert ikon","name":"Namn","name_description":"Tilpassa namn som vert vist under ikonet (brukar einingsnamn som standard viss ikkje spesifisert)","interaction_type":"Interaksjonstype","interaction_type_description":"Vel korleis brukarar samhandlar med dette ikonet for å utløyse handlingar","show_name":"Vis Namn","show_name_description":"Vis namneteksten under ikonet","show_state":"Vis Tilstand","show_state_description":"Vis eininga sin tilstand under ikonet","show_units":"Vis Einingar","show_units_description":"Inkluder einingar når tilstanden vert vist","text_position":"Tekstposisjon","text_position_description":"Kor namn- og tilstandsteksten vert plassert i forhold til ikonet","click_action":"Klikkehandling","service":"Teneste","service_description":"Teneste som skal kallast (t.d. light.turn_on)","service_data":"Tenestedata (JSON)","service_data_description":"JSON-data sendt med tenesteoppkallet","action":"Handling (JSON/Teneste)","action_description":"Avansert handlingskonfigurasjon (sjå dokumentasjon)","navigation_path":"Navigasjonssti","navigation_path_description":"Sti å navigere til (f.eks. /lovelace/dashboard)","navigation_target_selector":"Navigasjonsmål","navigation_target_description":"Vel frå tilgjengelege dashbord, visningar eller systemsider","url":"URL","url_description":"URL å åpne i ny fane","automation_entity":"Automatiseringseining","automation_entity_description":"Automatisering som skal utløysast når det vert klikka"},"icon_appearance":{"header":"Ikonutforming","icon":"Ikonspesifikt","general":"Generell Utsjånad","active":"Aktiv Tilstand","inactive":"Inaktiv Tilstand","state_conditions":"Tilstandsbetingelsar","advanced":"Avanserte Innstillingar","icon_size":"Ikonstorleik","icon_size_description":"Storleik på ikonet i pikslar","text_size":"Tekststorleik","text_size_description":"Storleik på namn/tilstandstekst i pikslar","name_size":"Navnestørrelse","name_size_description":"Størrelse på enhetens navntekst i piksler","text_alignment":"Tekstjustering","text_alignment_description":"Korleis teksten vert justert under ikonet","icon_background":"Ikonbakgrunn","icon_background_description":"Legg til ein bakgrunnsform bak ikonet","icon_background_color":"Ikonbakgrunnsfarge","icon_background_color_description":"Farge på bakgrunnen bak ikonet","container_background_color":"Container bakgrunnsfarge","container_background_color_description":"Farge på bakgrunnen bak hele ikonbeholderen","text_appearance":"Tekstutforming","container":{"header":"Containerutsjånad","vertical_alignment":"Vertikal Justering","vertical_alignment_description":"Juster ikon og tekst vertikalt inne i behaldaren.","width":"Behaldar Breidde","width_description":"Angi breidda på ikonbehaldaren i høve til rada.","background":"Form på behaldarbakgrunn","background_description":"Vel ein bakgrunnsform for heile ikonbehaldaren."},"show_when_active":"Vis ikon når aktivt","show_when_active_description":"Vis dette ikonet berre når det er i ein aktiv tilstand","template_mode":"Malmodus","template_description":"Bruk ein mal for å bestemme aktiv/inaktiv tilstand. Malar let deg bruke Home Assistant-malsyntaks (som {{ states.sensor.temperature.state > 70 }}) for komplekse vilkår.","active_template":"Aktiv Mal","active_template_description":"Mal som evaluerer til sant når ikonet skal vere aktivt.","active_state":"Aktiv tilstand","active_state_description":"Tilstandsstreng som representerer \\"aktiv\\".","active_state_text":"Eigendefinert Tekst for Aktiv Tilstand","active_state_text_description":"Overskriv den viste teksten når ikonet er aktivt. Lat vere tomt for å bruke den faktiske tilstanden.","inactive_template":"Inaktiv Mal","inactive_template_description":"Mal som evaluerer til sant når ikonet skal vere inaktivt.","inactive_state":"Inaktiv tilstand","inactive_state_description":"Tilstandsstreng som representerer \\"inaktiv\\".","inactive_state_text":"Eigendefinert Tekst for Inaktiv Tilstand","inactive_state_text_description":"Overskriv den viste teksten når ikonet er inaktivt. Lat vere tomt for å bruke den faktiske tilstanden.","active_icon":"Aktivt ikon","inactive_icon":"Inaktivt ikon","active_icon_color":"Farge på aktivt ikon","inactive_icon_color":"Farge på inaktivt ikon","active_name_color":"Farge på aktivt namn","inactive_name_color":"Farge på inaktivt namn","active_state_color":"Farge på aktiv tilstand","inactive_state_color":"Farge på inaktiv tilstand","show_icon_active":"Vis ikon når aktiv","show_icon_active_description":"Vis ikonet når tilstanden er aktiv.","show_icon_inactive":"Vis ikon når inaktivt","show_icon_inactive_description":"Vis ikonet når tilstanden er inaktiv.","custom_active_state_text":"Eigendefinert Aktiv Tilstandstekst","custom_inactive_state_text":"Eigendefinert Inaktiv Tilstandstekst","action_description":"Handling som skal utførast når ikonet vert klikka på.","show_name_active":"Vis namn når aktivt","show_name_active_description":"Vis namnet når tilstanden er aktiv.","show_name_inactive":"Vis namn når inaktivt","show_name_inactive_description":"Vis namnet når tilstanden er inaktiv.","show_state_active":"Vis tilstand når aktiv","show_state_active_description":"Vis tilstanden når tilstanden er aktiv.","show_state_inactive":"Vis tilstand når inaktiv","show_state_inactive_description":"Vis tilstanden når tilstanden er inaktiv.","use_entity_color_for_icon":"Bruk enhetsfarge for ikon","use_entity_color_for_icon_description":"Bruk eininga sin fargeattributt for ikonet når tilgjengeleg","use_entity_color_for_icon_background":"Bruk enhetsfarge for ikonbakgrunn","use_entity_color_for_icon_background_description":"Bruk enhetens fargeattributt for ikonbakgrunnen når det er tilgjengelig","use_entity_color_for_container_background":"Bruk enhetsfarge for container","use_entity_color_for_container_background_description":"Bruk enhetens fargeattributt for containerbakgrunnen når det er tilgjengelig","dynamic_icon_template":"Dynamisk ikonmal","dynamic_icon_template_description":"Use a template to dynamically select the icon based on entity states or conditions.","enable_dynamic_icon_template":"Aktiver dynamisk ikonmal","dynamic_color_template":"Dynamisk fargemal","dynamic_color_template_description":"Use a template to dynamically set the icon color based on entity states or values.","enable_dynamic_color_template":"Aktiver dynamisk fargemal","size_settings":"Storleiksinnstillingar","value_size":"Value Size","state_text_formatting":"State Text Formatting","row_name":"Radnamn","row_name_description":"Custom name for this icon row (leave blank to use default naming)","width_description":"Controls how much of the available width this row will use. Configure how this row of icons displays. Width controls the overall row width, spacing adjusts gaps between icons, and column count determines how many icons appear in each row (0 = automatic).","layout_info_title":"How Layout Settings Work","layout_info_width":"Row Width: Controls how much horizontal space the row takes up in the card (percentage of card width)","layout_info_alignment":"Row Alignment: Only applies when Column Count is 0. Determines how icons are positioned within the row","layout_info_spacing":"Icon Spacing: Sets the amount of space between icons","layout_info_columns":"Column Count: When set to 0, icons flow naturally based on available space. When set to a number, forces that exact number of columns in a grid layout","layout_info_tip":"Use Column Count with consistent amounts of icons per row for the most uniform layout","control_right_side_description":"Control when the right side is shown or hidden based on entity state","dynamic_icon":{"title":"Dynamisk ikonmal","description":"Use a template to dynamically select the icon based on entity states or conditions.","enable":"Aktiver dynamisk ikonmal","template_label":"Ikonmal"},"dynamic_color":{"title":"Dynamisk fargemal","description":"Use a template to dynamically set the icon color based on entity states or values.","enable":"Aktiver dynamisk fargemal","template_label":"Fargemal"}},"tabs":{"general":"Generelt","actions":"Handlingar","appearance":"Utsjånad","states":"Tilstandar","active_state":"Aktiv Tilstand","inactive_state":"Inaktiv Tilstand","icons":{"arrange_icon_rows":"Organiser Ikonrader"}},"alignments":{"flex-start":"Venstre","center":"Senter","flex-end":"Høgre","space-between":"Mellomrom mellom","space-around":"Mellomrom rundt","space-evenly":"Jamnt mellomrom"},"vertical_alignments":{"flex-start":"Topp","center":"Midten","flex-end":"Botn"},"spacing":{"none":"Ingen","small":"Liten","medium":"Medium","large":"Stor"},"text_positions":{"below":"Under ikonet","beside":"Ved sida av ikonet","none":"Ingen tekst","top":"Topp","left":"Venstre","right":"Høgre"},"reset":{"size":"Tilbakestill til standardstorleik","color":"Tilbakestill til standardfarge","all":"Tilbakestill til standardverdiar"},"click_actions":{"toggle":"Slå på/av eining","more-info":"Vis meir informasjon","navigate":"Naviger til sti","url":"Opne URL","call-service":"Kall teneste","perform-action":"Utfør handling","location-map":"Vis plasseringskart","assist":"Stemmeassistent","trigger":"Utløys","none":"Inga handling","descriptions":{"toggle":"Veksler tilstanden til eininga.","more-info":"Opnar meir-info dialogen for eininga.","navigate":"Navigerer til den spesifiserte Lovelace-stien.","url":"Opnar den spesifiserte URL-en i ein ny fane.","call-service":"Kallar den spesifiserte Home Assistant-tenesta.","perform-action":"Utfører ei tilpassa handling (sjå dokumentasjon).","location-map":"Viser eininga på eit kart.","assist":"Opnar Home Assistant stemmeassistenten.","trigger":"Utløyser eininga (automatisering, script, knapp osv.).","none":"Inga handling vil bli utført."}},"backgrounds":{"none":"Ingen","circle":"Sirkel","square":"Kvadrat","rounded_square":"Avrunda kvadrat"},"container_widths":{"25":"25% breidd","50":"50% breidd","75":"75% breidd","100":"100% (Full breidd)"},"row_widths":{"25":"25% breidd","50":"50% breidd","75":"75% breidd","100":"100% (Full breidd)"},"interactions":{"single":"Einkelt Trykk/Klikk","double":"Dobbelt Trykk/Klikk","hold":"Hald/Langt Trykk"},"animations":{"title":"Ikon Animasjon","active_description":"Vel ein animasjon å bruke når dette ikonet er i aktiv tilstand.","inactive_description":"Vel ein animasjon å bruke når dette ikonet er i inaktiv tilstand.","select_animation":"Vel Animasjon","none":"Ingen","pulse":"Puls","vibrate":"Vibrere","rotate_left":"Roter Venstre","rotate_right":"Roter Høgre","hover":"Sveve","fade":"Tone","scale":"Skaler","bounce":"Sprette","shake":"Riste","tada":"Tada"},"row_vertical_alignments":{"top":"Topp","center":"Midten","bottom":"Botn"},"actions":{"single":"Einkelt Klikk Handling","double":"Dobbelt Klikk Handling","hold":"Hald Handling","single_description":"Handling utført på eitt enkelt trykk/klikk - mest vanlege interaksjon","double_description":"Handling utført på dobbelt trykk/klikk - hjelper å hindre utilsikta utløysingar","hold_description":"Handling utført når ein held nede i 500ms - ideelt for kritiske handlingar","section_header":"Interaksjons Handlingar"}},"customize":{"title":"Tilpass layout","description":"Tilpass layout, bestill og legg til seksjoner i kortet ditt","condition_prompt":"Velg \\"Vis\\" eller \\"Skjul\\" for å konfigurere enhetstilstand","template_mode_active":"Bruk Malmodus","layout":{"title":"Layoutstil","description":"Vel mellom einkel- eller dobbelkolumnelayout for kortet","header":"Layoutinnstillingar","descriptions_header":"Layout Descriptions","single_column":"Enkelt kolonne","single_column_description":"All sections are stacked vertically in a single column - best for simple displays and mobile views.","double_column":"Dobbel kolonne","double_column_description":"Sections are split between two columns for efficient use of horizontal space - ideal for wider screens.","top_view":"Top View","top_view_description":"Image is prominently displayed at the top with other sections arranged in configurable positions around it.","half_full":"Half + Full","half_full_description":"Top row has two half-width sections, bottom row has one full-width section - great for balanced layouts.","full_half":"Full + Half","full_half_description":"Top row has one full-width section, bottom row has two half-width sections - perfect for highlighting top content."},"layout_types":{"single":"Einkelkolonne","double":"Dobbelkolonne","dashboard":"Toppvising","half_full":"Halv + full","full_half":"Full + halvparten"},"column_width":{"title":"Kolonnebreidd","description":"Konfigurer breiddeforholdet mellom venstre og høgre kolonne","50_50":"Like (50/50)","30_70":"Smal venstre, brei høgre (30/70)","70_30":"Brei venstre, smal høgre (70/30)","40_60":"Litt smal venstre (40/60)","60_40":"Litt brei venstre (60/40)"},"top_view":{"header":"Toppvisingsinnstillingar","description":"Konfigurer avstands- og layoutinnstillingar for toppvising","side_margin":"Sidemarginar","side_margin_help":"Marginar på sidene av visinga i pikslar","middle_spacing":"Midtavstand","middle_spacing_help":"Avstand mellom midtkolonnar i pikslar","vertical_spacing":"Vertikal Avstand","vertical_spacing_help":"Avstand mellom rader i pikslar"},"sections":{"header":"Kortseksjonar","arrangement_header":"Seksjonsarrangement","arrangement_desc_base":"Dra og slepp seksjonar for å arrangere rekkjefølgja på kortet.","arrangement_desc_single_extra":"Alle seksjonar vil visast i ein einkelkolonne.","arrangement_desc_double_extra":"I ein dobbelkolumnelayout kan du plassere kvar seksjon i venstre eller høgre kolonne.","arrangement_desc_dashboard_extra":"I ei toppvising kan du plassere seksjonar rundt køyretøybiletet ditt."},"section_labels":{"title":"Tittel","image":"Køyretøybilete","info":"Køyretøyinformasjon","bars":"Alle Sensorsøyler","icons":"Alle Ikonrader","section_break":"Seksjonsbrudd"},"actions":{"collapse_margins":"Skjul Marginar","expand_margins":"Vis Marginar","collapse_options":"Skjul Alternativ","expand_options":"Vis Alternativ","add_break":"Legg til seksjonsbrudd","delete_break":"Slett seksjonsbrudd"},"css":{"header":"Global CSS","description":"Skriv inn eigendefinerte CSS-reglar her for å overstyre standard kortstil. Desse reglane vil bli brukt direkte på kortet. Bruk med varsemd.","label":"Eigendefinert CSS","input_description":"Skriv inn dine eigendefinerte CSS-reglar her."},"conditions":{"header":"Betinga Logikk","description":"Vis eller skjul denne seksjonen basert på ein einings tilstand.","template_mode_description":"Bruk ein mal for å bestemme seksjonssynlegheit. Malar let deg bruke Home Assistant mal-syntaks for komplekse vilkår.","type_label":"Betingingstype","section_title":"Seksjonstittel","enable_section_title":"Enable Section Title","title_text":"Titteltekst","title_size":"Tittelstørrelse","title_color":"Tittelfarge","enable_template_mode":"Enable Template Mode","use_template_description":"Use a template to determine when this section should be visible. Templates allow you to use Home Assistant templating syntax for complex conditions.","info_row":"Info Row","entity_label":"Betingingseining","state_label":"Betingingstilstand","state_description":"Tilstandsverdien som utløyser vilkåret","types":{"none":"Ingen (Vis Alltid)","show":"Vis Når...","hide":"Skjul Når..."}},"template":{"description":"Bruk ein mal for å bestemme når denne seksjonen skal vere synleg. Malar let deg bruke Home Assistant mal-syntaks for komplekse vilkår.","enable":"Aktiver Malmodus"},"template_mode":{"header":"Malmodus","description":"Use a template to control when this image is shown or hidden based on complex logic, calculations, or multiple entity states.","enable":"Enable Template Mode","disabled_notice":"(Disabled - Template Mode Active)","disabled_help":"Basic condition controls are disabled when Template Mode is active. Template Mode takes precedence over basic conditions.","examples":{"show_when_charging":"Show when charging","show_when_battery_low":"Show when battery low","multiple_conditions":"Multiple conditions","show_during_day":"Show during day hours","show_when_door_unlocked":"Show when door unlocked"}},"section_title":{"header":"Seksjonstittel","enable":"Aktiver Seksjonstittel","text":"Tittel Tekst","size":"Tittel Storleik","color":"Tittel Farge","bold":"Feit","italic":"Kursiv","uppercase":"Store Bokstavar","strikethrough":"Gjennomstreka"},"margins":{"header":"Marginar","top":"Toppmarginar","bottom":"Botnmarginar"},"columns":{"left":"Venstre Kolonne","right":"Høgre Kolonne","empty":"Slepp seksjonar her"},"dashboard":{"top":"Toppseksjon","top_middle":"Øvre Midtseksjon","left_middle":"Venstre Midtseksjon","middle":"Midtseksjon","middle_empty":"Køyretøybileteområde (Tilrådd)","right_middle":"Høgre Midtseksjon","bottom_middle":"Nedre Midtseksjon","bottom":"Botnseksjon"},"half_full":{"row1_col1":"Rad 1 - Venstre Kolonne","row1_col2":"Rad 1 - Høgre Kolonne","row2_full":"Rad 2, full bredde (100%)"},"full_half":{"row1_full":"Rad 1, full bredde (100%)","row2_col1":"Rad 2 - Venstre Kolonne","row2_col2":"Rad 2 - Høgre Kolonne"},"break_styles":{"blank":"Blank (ingen linje)","line":"Solid linje","double_line":"Dobbel linje","dotted":"Stiplet linje","double_dotted":"Dobbelt stiplet linje","shadow":"Skyggegradient"},"break_style":{"header":"Bruddstil","style_label":"Stil","thickness_label":"Tykkelse","width_percent_label":"Bredde (%)","color_label":"Farge"}},"container_widths":{"25":"25% breidd","50":"50% breidd","75":"75% breidd","100":"100% (Full breidd)"},"row_widths":{"25":"25% breidd","50":"50% breidd","75":"75% breidd","100":"100% (Full breidd)"}},"about":{"logo_alt":"Ultra Vehicle Card","developed_by":"Utvikla av","discord_button":"Bli med i vår Discord","docs_button":"Sjå vår dokumentasjon","donate_button":"DONÉR (PAYPAL)","github_button":"Besøk vår Github","support_title":"Støtt Ultra Vehicle Card","support_description":"Dine sjenerøse tips gir utviklingen av fantastiske funksjoner for dette kortet! Uten støtte fra brukere som deg, ville ikke innovasjon ikke være mulig."},"custom_icons":{"title":"Eigendefinerte Ikon","description":"Definer eigendefinerte ikon for ulike tilstandar.","icon_entity":"Ikoneining","default_icon":"Standardikon","state_icons":"Tilstandsikon","state":"Tilstand","icon":"Ikon"},"custom_active_state_text":"Eigendefinert Aktiv Tilstandstekst","custom_inactive_state_text":"Eigendefinert Inaktiv Tilstandstekst","image_settings":{"title":"Bileteinnstillingar","description":"Konfigurer hovudbiletet sitt utsjånad.","type":"Biletetype","width":"Biletebreidd","crop":"Skjer Bilete","entity":"Bileteeining","entity_description":"Eining som leverer bilete-URL"},"entity_settings":{"entity":"Eining","entity_description":"Vel ei eining for å vise informasjon frå","name":"Namn","name_description":"Overstyr einingsnamnet (lat vere tomt for å bruke eininga sitt vennlege namn)","show_icon":"Vis ikon","icon":"Ikon","icon_color":"Ikonfarge","name_color":"Navnfarge","entity_color":"Einingsfarge","text_color":"Tekstfarge","show_name":"Vis namn","show_name_description":"Vis eininga sitt namn før verdien","template_mode":"Bruk Mal for Verdi","template_mode_description":"Bruk ein mal for å formatere einingsverdien","value_template":"Verdimal","template_header":"Verdimal","template_examples_header":"Maldøme","template_basic":"Grunnleggende verdi","template_units":"Med enheter","template_round":"Runde til 1 desimal","dynamic_icon_template":"Ikonmal","dynamic_color_template":"Fargemal","dynamic_icon_template_mode":"Aktiver dynamisk ikonmal","dynamic_color_template_mode":"Aktiver dynamisk fargemal"}}');var Et=a.t(jt,2);const Mt=JSON.parse('{"editor":{"tabs":{"settings":"Inställningar","bars":"Staplar","icons":"Ikoner","customize":"Anpassa","about":"Om","info":"Info","images":"Bilder"},"info":{"title":"Kortinformation","description":"Konfigurera informationsrader och enheter för att visa fordonsinformation som plats, körsträcka, etc. Info -objekt kommer att visas på en enda rad när det är möjligt, inpackning till flera linjer i smala behållare.","add_row":"Lägg till inforad","add_entity":"Lägg till infoenhet","arrange_info_rows":"Ordna info -rader","duplicate_row":"Duplicera rad","delete_row":"Ta bort rad","expand_row":"Expandera rad","collapse_row":"Kollapsa rad","duplicate_entity":"Duplicera enhet","delete_entity":"Ta bort enhet","expand_entity":"Expandera enhet","collapse_entity":"Kollapsa enhet","row_prefix":"Inforad","entity_prefix":"Enhet","template_mode":"Mallläge","template_mode_description":"Använd en mall för att formatera enhetsvärdet. Mallar gör att du kan använda Home Assistant Templating Syntax för komplex formatering.","template_examples_header":"Vanliga exempel:","dynamic_icon":{"title":"Dynamisk ikonmall","description":"Använd en mall för att dynamiskt välja ikonen baserat på enhetstillstånd eller villkor.","enable":"Aktivera dynamisk ikonmall"},"dynamic_color":{"title":"Dynamisk färgmall","description":"Använd en mall för att dynamiskt ställa in färger baserat på enhetstillstånd eller värden.","enable":"Aktivera dynamisk färgmall"},"row_settings":{"header":"Radinställningar","row_name":"Radnamn","row_name_description":"Anpassat namn för denna informationsrad (lämna tom för att använda standardnamngivning)","horizontal_alignment":"Horisontell Justering","alignment_description":"Horisontell justering av entiteter i denna rad","vertical_alignment":"Vertikal Justering","vertical_alignment_description":"Kontrollerar hur entiteter justeras vertikalt inom raden.","spacing":"Mellanrum","spacing_description":"Mellanrum mellan entiteter i denna rad","allow_wrap":"Tillåt objekt att lindas","allow_wrap_description":"När aktiverat kommer objekt att flöda till nästa rad om de inte får plats i en rad. När inaktiverat kommer alla objekt att stanna i en enda rad."},"entity_settings":{"header":"Informationsobjekt","name":"Anpassat Namn","entity_description":"Välj en entitet att visa information från","name_description":"Åsidosätt entitetsnamnet (lämna tom för att använda entitetens vänliga namn)","show_icon":"Visa Ikon","icon_color":"Ikonfärg","name_color":"Namnfärg","entity_color":"Entitetsfärg","icon_size":"Ikonstorlek","name_size":"Namnstorlek","value_size":"Värdestorlek","size_settings":"Storleksinställningar","show_name":"Visa Namn","show_name_description":"Visa entitetsnamnet före värdet","click_action":"Klickåtgärd","navigation_path":"Navigationssökväg","navigation_path_description":"Sökväg att navigera till när klickad (t.ex. /lovelace/0)","url":"URL","url_description":"URL att öppna när klickad","service":"Tjänst","service_description":"Tjänst att anropa (t.ex. light.turn_on)","service_data":"Tjänstdata (JSON)"},"alignments":{"flex-start":"Start","center":"Center","flex-end":"Slut","space-between":"Utrymme mellan","space-around":"Utrymme runt","space-evenly":"Jämnt fördelat utrymme"},"spacing":{"none":"Ingen","small":"Liten","medium":"Medium","large":"Stor"},"click_actions":{"more-info":"Mer info","navigate":"Navigera","url":"Öppna URL","call-service":"Anropa tjänst","none":"Ingen"},"row_vertical_alignments":{"top":"Topp","center":"Center","bottom":"Botten"}},"settings_subtabs":{"general":"Allmänt","action_images":"Åtgärdsbilder"},"action_images":{"title":"Åtgärdsbilder Inställningar","description":"Konfigurera bilder som ska visas när specifika enhetstillstånd uppfylls.","add_image":"Lägg till Åtgärdsbild","no_images":"Inga åtgärdsbilder är konfigurerade ännu. Lägg till en för att komma igång.","actions":{"drag":"Dra för att ändra ordning","duplicate":"Duplicera","delete":"Ta bort","expand":"Expandera","collapse":"Minimera"},"delete_confirm":"Är du säker på att du vill ta bort denna åtgärdsbild?","entity_settings":"Enhetsinställningar","image_settings":"Bildinställningar","entity_placeholder":"Välj en enhet","state_placeholder":"Ange tillståndsvärde","preview":{"no_entity":"Ingen enhet vald","no_image":"Ingen bild","any_state":"Vilket tillstånd som helst"},"trigger_entity":"Utlösande Enhet","trigger_state":"Utlösande Tillstånd","entity_help":"Välj en enhet att övervaka. Bilden kommer att visas när denna enhet matchar tillståndet nedan.","state_help":"Ange tillståndsvärdet som kommer utlösa att denna bild visas. Lämna tomt för att matcha alla tillstånd.","image_type":{"title":"Bildtyp","upload":"Ladda upp Bild","url":"Bild URL","entity":"Enhetsbild","none":"Ingen"},"template_mode":"Mall-läge","template_description":"Använd en mall för att bestämma när den här bilden ska visas. Mallar gör att du kan använda Home Assistant mall-syntax (som {{ states.sensor.temperature.state > 70 }}) för komplexa villkor.","template_label":"Visningsmall","template_help":"Ange en mall som returnerar sant/falskt. Den här bilden kommer att visas när mallen utvärderas till sant. Använd Jinja2-syntax: {{ states(...) }}","priority":{"label":"Visningsprioritet","description":"Prioritetsbaserad använder första matchningen uppifrån och ned. Senast Matchande använder den sista matchningen som hittades i listan.","options":{"priority":"Prioritetsbaserad","newest":"Senast Matchande"}}},"images":{"title":"Bilder","description":"Konfigurera bilder som kommer att visas baserat på villkor eller mallar.","add_image":"Lägg till Bild","no_images":"Inga bilder konfigurerade ännu. Lägg till en för att komma igång.","arrange_images":"Arrangera Bilder","name":"Namn (Valfritt)","image_type":"Bildtyp","url":"Bild URL","image_entity":"Bildenhet","priority":"Prioritet (0 = högst)","priority_mode":"Prioritetsläge","timed_duration":"Visningstid (sekunder)","timed_duration_help":"Hur länge denna bild ska visas innan den återgår till huvudbilden.","duplicate":"Duplicera Bild","delete":"Ta bort Bild","delete_confirm":"Är du säker på att du vill ta bort denna bild?","image_types":{"none":"Ingen","default":"Standardfordon","url":"Bild URL","upload":"Ladda upp Bild","entity":"Entitetsbild","map":"Karta"},"priority_modes":{"order":"Ordningsprioritet","order_help":"Bilder visas baserat på deras ordning i listan (dra för att ändra ordning).","last_triggered":"Senast Utlöst","last_triggered_help":"Den senast utlösta bilden kommer att förbli visad tills en annan bild utlöses.","timed":"Tidsinställda Bilder","timed_help":"Bilder under den första kommer att visas under en bestämd tid och sedan återgå till huvudbilden."},"conditional_types":{"show":"Visa När","hide":"Dölj När"},"tabs":{"general":"Allmänt","conditional":"Villkorlig","appearance":"Utseende"},"conditional_help":"Konfigurera när denna bild ska visas baserat på enhetstillstånd eller mallar.","conditional_help_simple":"Konfigurera när denna bild ska visas baserat på enhetstillstånd.","conditional_state_help":"Bilden kommer att visas när enheten är lika med detta tillståndsvärde.","conditional_entity":"Villkorlig Enhet","conditional_state":"Villkorligt Tillstånd","basic_conditions":"Grundläggande Villkor","advanced_conditional":"Avancerade Mallvillkor","advanced_help":"Använd mallar för komplexa villkor som flera enheter eller matematiska jämförelser.","template_mode_active_help":"Använd mallar för komplexa villkor som flera enheter eller matematiska jämförelser.","template_mode":{"header":"Mallläge","enable":"Aktivera Mallläge","template":"Mall"},"template_examples_header":"Vanliga Exempel:","width":"Bredd (%)","width_settings":"Breddinställningar","crop_settings":"Beskärningsinställningar","crop_help":"Positiva värden beskär inåt, negativa värden lägger till utfyllnad utåt.","crop_top":"Topp","crop_right":"Höger","crop_bottom":"Botten","crop_left":"Vänster","fallback_image":"Reservbild","fallback_help":"Denna bild kommer att användas som reserv om inga utlösare matchar eller timeout inträffar. Endast en bild kan vara en reserv.","map_entity":"Platsenhet","map_entity_help":"Välj en enhet med latitud/longitud-koordinater eller adress för att visa på kartan.","target_entity":"Målenhet","target_entity_description":"Välj enheten att rikta in sig på med denna åtgärd","common":{"width":"Bildbredd","width_description":"Bredd i procent av kortet","width_over_100":"Värden över 100% kan hjälpa till att beskära tomma utrymme runt bilder","url_description":"Ange bildens URL"},"vehicle":{"crop":"Beskär Bild"},"migration":{"title":"Äldre Bilder Upptäckta","description":"Vi hittade äldre bildkonfigurationer som kan migreras till det nya formatet.","migrate_button":"Migrera Nu","success":"Bilder migrerade framgångsrikt!"}},"card_settings":{"title":"Korttitel","title_alignment":"Titeljustering","title_size":"Titelstorlek","title_color":"Titelfärg","title_color_description":"Färg på kortets titel","title_description":"Titel som visas överst på kortet (valfritt)","title_alignment_description":"Hur korttiteln justeras","title_size_description":"Storlek på korttiteln i pixlar","colors":"Färger","card_background":"Kortbakgrund","card_background_description":"Bakgrundsfärg för hela kortet","format_entities":"Formatera Enhetsvärden","format_entities_description":"Aktivera ytterligare formatering av enhetsvärden (lägger till kommatecken, konverterar enheter, etc.)","show_units":"Visa Enheter","show_units_description":"Visa enheter bredvid värden","help_highlight":"Hjälp med att lyfta fram","help_highlight_description":"Visa visuella höjdpunkter när du växer mellan redigerarflikar för att identifiera vilket avsnitt du redigerar","general":"Allmänt","conditional_logic":"Villkorlig Logik","card_visibility":"Kortsynlighet","card_visibility_description":"Visa eller dölj hela kortet baserat på ett enhetsvillkor"},"vehicle_info":{"title":"Fordonsinformation","location":{"title":"Positionsenhet","description":"Välj enheten som visar fordonets nuvarande position.","show":"Visa Position","show_description":"Visa fordonets position"},"mileage":{"title":"Mätarställning Enhet","description":"Välj enheten som representerar total körsträcka eller fordonets vägmätare.","show":"Visa Mätarställning","show_description":"Visa fordonets mätarställning"},"car_state":{"title":"Fordonstillstånd Enhet","description":"Välj enheten som representerar fordonets nuvarande tillstånd (t.ex. parkerad, kör, laddar).","show":"Visa Fordonstillstånd","show_description":"Visa fordonets tillstånd"}},"crop":{"title":"Bildbeskärning","top":"Topp","right":"Höger","bottom":"Botten","left":"Vänster","pixels":"px","help":"Ange värden i pixlar (positiva eller negativa) för att justera beskärning och padding"},"alignment":{"left":"Vänster","center":"Centrum","right":"Höger"},"common":{"choose_file":"Välj Fil","no_file_chosen":"Ingen fil vald","entity":"Enhet","width":"Bredd","width_description":"Bredd som procent av kortet","width_over_100":"Värden över 100% kan hjälpa till att beskära tomma utrymme runt bilder","none":"Ingen","default":"Standard","upload":"Ladda upp","url":"URL","url_description":"URL som pekar till bilden","reset":"Återställ","condition_prompt":"Välj \\"Visa\\" eller \\"dölj\\" för att konfigurera enhetsvillkor","bold":"Fet","italic":"Kursiv","uppercase":"Versaler","strikethrough":"Genomstruken"},"conditions":{"condition_type":"Villkorstyp","show_card_if":"Visa Kort Om","hide_card_if":"Dölj Kort Om","entity_description":"Välj enheten att kontrollera för villkoret","state":"Tillstånd","state_description":"Tillståndsvärdet som utlöser villkoret"},"bars":{"title":"Procentuella Staplar","description":"Lägg till procentuella staplar för att visa värden som bränslenivå, batteriladdning eller räckvidd. Varje stapel kan visa ett huvudprocentvärde med valfria etiketter på vänster och höger sida.","add":"Lägg till Ny Stapel","duplicate":"Duplicera Stapel","delete":"Ta bort Stapel","expand":"Expandera Stapel","collapse":"Minimera Stapel","no_entity":"Ingen enhet vald","bar_prefix":"Stapel","template":{"description":"Använd en mall för att formatera den visade texten, konvertera enheter eller visa beräknade värden.","enable":"Aktivera mallläge","template_label":"Mall","helper_text":"Använd Home Assistant mall-syntax. Exempel:\\n• {{ states(\'sensor.temperature\') | float * 1.8 + 32 }} °F\\n• {{ now().strftime(\\"%b %d, %H:%M\\") }}","examples_header":"Vanliga exempel:","examples":{"temperature":"{{ states(\'sensor.temperature\') | float * 1.8 + 32 }}°F - Konvertera Celsius till Fahrenheit","datetime":"{{ now().strftime(\\"%b %d, %H:%M\\") }} - Formatera aktuellt datum/tid","power":"{{ \'Laddar vid \' + states(\'sensor.ev_power\') + \' kW\' }} - Kombinera text och sensorvärde"}},"bar_radius":{"round":"Rund","square":"Fyrkantig","rounded-square":"Avrundad Fyrkantig"},"tabs":{"arrange_bars":"Ordna Staplar","config":"Konfiguration","colors":"Färger","animation":"Animation"},"settings":{"header":"Stapelinställningar","entity":"Stapel Procentenhet","entity_description":"Välj en enhet som returnerar ett procentvärde (0-100). Detta styr stapelns fyllnadsnivå.","limit_entity":"Gränsvärde Enhet (valfritt)","limit_entity_description":"Valfritt: Lägg till en vertikal indikatorlinje på stapeln (t.ex. laddgräns för EV-batteri).","limit_color":"Gränsindikator Färg","limit_color_description":"Färg på den vertikala linjen som visar gränspositionen på stapeln. Ändringar kommer att tvinga en kortuppdatering.","bar_size":"Stapelstorlek","bar_size_description":"Definierar tjockleken/höjden på förloppsstapeln.","bar_radius":"Stapelradie","bar_radius_description":"Form på förloppsstapelns hörn","width":"Stapelbredd","width_description":"Definierar bredden på stapeln som en procentandel av kortbredden.","alignment":"Etikettjustering","alignment_description":"Hur vänster och höger etiketter justeras i förhållande till varandra.","show_percentage":"Visa Procent","show_percentage_description":"Visa procentvärdet inne i stapeln"},"percentage":{"header":"Procenttext","display_header":"Procenttext Visning","display_description":"Kontrollera synligheten och utseendet på procentvärden som visas direkt på stapeln. Dessa siffror ger en tydlig visuell indikator på aktuell nivå.","text_size":"Textstorlek","calculation_header":"Procentberäkning","calculation_description":"Konfigurera hur stapelns procentfyllning beräknas med hjälp av ett av alternativen nedan.","type_header":"Procentberäkning","type_label":"Procenttyp","type_description":"Hur procentvärdet som visas i stapeln beräknas","type_entity":"Enhet (0-100)","type_attribute":"Entitetsattribut","type_template":"Mallläge","type_difference":"Differens (Mängd/Total)","amount_entity":"Mängdenhet","amount_description":"Enhet som representerar aktuell mängd/värde (täljare)","total_entity":"Totalenhet","total_description":"Enhet som representerar total mängd/maximum (nämnare)"},"left_side":{"header":"Vänster sida","section_description":"Konfigurera titeln och enhetsvärdet som visas på vänster sida av baren. Detta är användbart för att visa etiketter som \\"räckvidd\\" eller \\"batteri\\" tillsammans med deras värden.","toggle_description":"Visa eller dölj vänster sida av stapeletiketten","title":"Vänster titel","title_description":"Valfri etikett som visas på vänster sida under baren.","entity":"Vänster enhet","entity_description":"Enhet vars värde visas på vänster sida av stången.","alignment_description":"Kontrollerar hur den här etiketten är inriktad under baren.","title_size":"Titelstorlek","value_size":"Värdestorlek","hidden_message":"Vänster sida är dold"},"right_side":{"header":"Höger sida","section_description":"Konfigurera titeln och enhetsvärdet som visas på höger sida av baren. Detta är idealiskt för kompletterande information som \\"tid till full\\" eller sekundära mätningar.","toggle_description":"Visa eller dölj höger sida av stapeletiketten","title":"Rätt","title_description":"Valfri etikett som visas på höger sida under stången.","entity":"Rättighet","entity_description":"Enhet vars värde visas på höger sida av stången.","alignment_description":"Kontrollerar hur den här etiketten är inriktad under baren.","title_size":"Titelstorlek","value_size":"Värdestorlek","hidden_message":"Höger sida är dold"},"colors":{"header":"Färger","bar_color":"Stapelfärg","background_color":"Bakgrundsfärg","border_color":"Kantfärg","limit_indicator_color":"Gränsindikator Färg","left_title_color":"Vänster Titelfärg","left_value_color":"Vänster Värdefärg","right_title_color":"Höger Titelfärg","right_value_color":"Höger Värdefärg","percentage_text_color":"Procenttext Färg","reset_color":"Återställ till standardfärg"},"gradient":{"header":"Lutningsläge","description":"Skapa vackra färgövergångar över dina framstegsstänger. Idealisk för att visa batterinivåer, bränslemätare eller någon statusindikator som kräver visuell betoning.","toggle":"Använd lutning","toggle_description":"Använd en lutning för framstegsfältet istället för en fast färg","display_mode":"Lutningsläge","display_mode_full":"Fullständig","display_mode_value_based":"Värdebaserad","display_mode_cropped":"Beskuren","display_mode_description":"FULL: Visa hela lutningen. Värdebaserad: Visa lutningen upp till det aktuella värdet.","editor_header":"Lutningsredaktör","add_stop":"Lägg till stopp"},"animation":{"header":"Åtgärdsanimation","description":"Lägg till animationer till stapeln när en specifik enhet når ett specifikt tillstånd. Perfekt för att visa laddningstillstånd, larmtillstånd och mer.","pro_tip":"Pro Tips: För \'alltid på\' animationer, välj en animationstyp men lämna enhets- och tillståndsfälten tomma. Prova \'Bubblor\' och \'Fyll\' animationerna!","entity":"Animationsenhet","entity_description":"Enhet som utlöser animationen när den matchar det specificerade tillståndet","state":"Enhetstillstånd","state_description":"När enhetstillståndet matchar detta värde kommer animationen att utlösas","type":"Animationstyp","type_description":"Animationseffekten som ska visas när enhetstillståndet matchar","select_entity_prompt":"Välj en Enhet och ange tillståndet du vill utlösa animationen (exempel: \\"laddar\\", \\"på\\", \\"inaktiv\\")","action_entity":"Handlingsenhet","action_state":"Handlingstillstånd","action_description":"Denna animation kommer att åsidosätta den regelbundna animationen när den angivna enheten är i ett specifikt tillstånd.","action_entity_prompt":"Välj en actionenhet och stat att definiera när denna animation bör åsidosätta den vanliga animationen"},"bar_sizes":{"thin":"Tunn","regular":"Normal","thick":"Tjock","thiccc":"Extra Tjock"},"bar_widths":{"25":"25% Bredd","50":"50% Bredd","75":"75% Bredd","100":"100% (Full Bredd)"},"bar_alignments":{"space-between":"Mellanrum Mellan","flex-start":"Vänster","center":"Centrum","flex-end":"Höger"},"bar_styles":{"flat":"Platt (Standard)","glossy":"Blank","embossed":"Präglad","inset":"Infälld","gradient":"Gradient Överlägg","neon":"Neon Glöd","outline":"Kontur","glass":"Glas","metallic":"Metallisk","neumorphic":"Neumorfisk"},"animation_types":{"none":"Ingen","charging-lines":"Laddning (Diagonala Linjer)","pulse":"Puls","blinking":"Blinkande","bouncing":"Studsande","glow":"Glöd","rainbow":"Regnbåge","bubbles":"Bubblor","fill":"Fyll"},"custom_bar_settings":{"title":"Anpassade stapelinställningar","description":"Definiera anpassade konfigurationer för enskilda staplar.","name":"Barnamn","entity":"Enhet","unit":"Enhet","min":"Minvärde","max":"Maxvärde","thresholds":"Tröskelvärden","severity":"Svårighetsgrad"},"template_mode":{"header":"Mallläge","description":"Använd en mall för att formatera den visade texten, konvertera enheter eller visa beräknade värden.","enable":"Aktivera Mallläge","template":"Mall"}},"icons":{"title":"Kortikoner","description":"Lägg till ikonrader för att visa flera ikoner på ditt kort. Varje rad kan konfigureras med olika inställningar.","add_row":"Lägg till Ikonrad","duplicate_row":"Duplicera Rad","delete_row":"Ta bort Rad","expand_row":"Expandera Rad","collapse_row":"Minimera Rad","no_row":"Inga ikonrader är tillagda","row_prefix":"Rad","icon_prefix":"Ikon","add_icon":"Lägg till Ikon","duplicate_icon":"Duplicera Ikon","delete_icon":"Ta bort Ikon","template_mode":"Mallläge","template_mode_active_description":"Använd en mall för att avgöra när denna ikon ska vara aktiv. Mallar gör att du kan använda Home Assistant Templating Syntax för komplexa förhållanden.","template_mode_inactive_description":"Använd en mall för att avgöra när denna ikon ska vara inaktiv. Mallar gör att du kan använda Home Assistant Templating Syntax för komplexa förhållanden.","template_examples_header":"Vanliga exempel:","text_formatting":"Tillståndstext Formatering","name_formatting":"Namn Formatering","dynamic_icon":{"title":"Dynamisk Ikon Mall","description":"Använd en mall för att dynamiskt välja ikonen baserat på entitetstillstånd eller villkor.","enable":"Aktivera Dynamisk Ikon Mall"},"dynamic_color":{"title":"Dynamisk Färg Mall","description":"Använd en mall för att dynamiskt ställa in ikonfärgen baserat på entitetstillstånd eller värden.","enable":"Aktivera Dynamisk Färg Mall"},"enable_template_mode":"Aktivera mallläge","row_settings":{"header":"Radinställningar","width":"Radbredd","width_description":"Bredd på raden som procent av kortbredd","alignment":"Radjustering","alignment_description":"Hur ikoner justeras i denna rad","spacing":"Ikonavstånd","spacing_description":"Mängd mellanrum mellan ikoner i denna rad","columns":"Antal Kolumner","columns_description":"Antal lika stora kolumner i raden (0 = automatisk distribution baserad på innehåll)","confirmation_mode":"Bekräftelseläge","confirmation_mode_description":"Kräv två tryck/klick för att aktivera ikoner i denna rad, förhindrar oavsiktliga interaktioner","layout_info_title":"Hur layoutinställningar fungerar"},"icon_settings":{"header":"Ikonlista","entity":"Enhet","entity_description":"Enhet som visas med denna ikon","icon":"Ikon","icon_description":"Välj en ikon eller ange en anpassad ikon","name":"Namn","name_description":"Anpassat namn som visas under ikonen (använder enhetsnamn som standard om inte specificerat)","interaction_type":"Interaktionstyp","interaction_type_description":"Välj hur användare interagerar med denna ikon för att utlösa åtgärder","show_name":"Visa Namn","show_name_description":"Visa namntext under ikonen","show_state":"Visa Tillstånd","show_state_description":"Visa enhetstillståndet under ikonen","show_units":"Visa Enheter","show_units_description":"Inkludera enheter när tillstånd visas","text_position":"Textposition","text_position_description":"Var namn- och tillståndstext placeras i förhållande till ikonen","click_action":"Klickåtgärd","service":"Tjänst","service_description":"Tjänst att anropa (t.ex. light.turn_on)","service_data":"Tjänstdata (JSON)","service_data_description":"JSON-data som skickas med tjänstanropet","action":"Åtgärd (JSON/Tjänst)","action_description":"Avancerad åtgärdskonfiguration (se dokumentation)","navigation_path":"Navigationssökväg","navigation_path_description":"Sökväg att navigera till (t.ex. /lovelace/dashboard)","navigation_target_selector":"Navigationsmål","navigation_target_description":"Välj från tillgängliga instrumentpaneler, vyer eller systemsidor","url":"Url","url_description":"URL att öppna i ny flik","automation_entity":"Automatiseringsenhet","automation_entity_description":"Automatisering att utlösa vid klick"},"icon_appearance":{"header":"Ikonutseende","icon":"Ikonutseende","general":"Allmänt Utseende","active":"Aktivt Tillstånd","inactive":"Inaktivt Tillstånd","state_conditions":"Tillståndsvillkor","advanced":"Avancerade Inställningar","icon_size":"Ikonstorlek","icon_size_description":"Storlek på ikonen i pixlar","text_size":"Textstorlek","text_size_description":"Storlek på namn/tillståndstext i pixlar","name_size":"Namnstorlek","name_size_description":"Storleken på enhetens namntext i pixlar","text_alignment":"Textjustering","text_alignment_description":"Hur texten justeras under ikonen","icon_background":"Ikonbakgrund","icon_background_description":"Lägg till en bakgrundsform bakom ikonen","icon_background_color":"Ikonbakgrundsfärg","icon_background_color_description":"Färg på bakgrunden bakom ikonen","container_background_color":"Containerbakgrundsfärg","container_background_color_description":"Färg på bakgrunden bakom hela ikoncontainern","text_appearance":"Textutseende","container":{"header":"Containerutseende","vertical_alignment":"Vertikal Justering","vertical_alignment_description":"Justera ikonen och texten vertikalt i containern.","width":"Containerbredd","width_description":"Sätt bredden på ikoncontainern relativt till raden.","background":"Containerbakgrundsform","background_description":"Välj en bakgrundsform för hela ikoncontainern."},"show_when_active":"Visa ikonen när den är aktiv","show_when_active_description":"Visa bara den här ikonen när den är i ett aktivt tillstånd","template_mode":"Mallläge","template_description":"Använd en mall för att bestämma aktivt/inaktivt tillstånd. Mallar gör att du kan använda Home Assistant mall-syntax (som {{ states.sensor.temperature.state > 70 }}) för komplexa villkor.","active_template":"Aktiv mall","active_template_description":"Mall som returnerar sant när ikonen ska vara aktiv.","active_state":"Aktivt tillstånd","active_state_description":"Tillståndssträng som representerar \\"aktiv\\".","active_state_text":"Anpassad aktiv tillståndstext","active_state_text_description":"Åsidosätter texten som visas när ikonen är aktiv. Lämna tomt för att använda det faktiska tillståndet.","inactive_template":"Inaktiv mall","inactive_template_description":"Mall som returnerar sant när ikonen ska vara inaktiv.","inactive_state":"Inaktivt tillstånd","inactive_state_description":"Tillståndssträng som representerar \\"inaktiv\\".","inactive_state_text":"Anpassad inaktiv tillståndstext","inactive_state_text_description":"Åsidosätter texten som visas när ikonen är inaktiv. Lämna tomt för att använda det faktiska tillståndet.","active_icon":"Aktiv ikon","inactive_icon":"Inaktiv ikon","active_icon_color":"Aktiv ikonfärg","inactive_icon_color":"Inaktiv ikonfärg","active_name_color":"Aktivt namnfärg","inactive_name_color":"Inaktiv namnfärg","active_state_color":"Aktivt tillståndsfärg","inactive_state_color":"Inaktiv tillståndsfärg","show_icon_active":"Visa ikonen när den är aktiv","show_icon_active_description":"Visa ikonen när staten är aktiv.","show_icon_inactive":"Visa ikonen när den är inaktiv","show_icon_inactive_description":"Visa ikonen när staten är inaktiv.","custom_active_state_text":"Anpassad aktiv tillståndstext","custom_inactive_state_text":"Anpassad inaktiv tillståndstext","action_description":"Åtgärd för att utföra när ikonen klickas.","show_name_active":"Visa namn när det är aktivt","show_name_active_description":"Visa namnet när staten är aktiv.","show_name_inactive":"Visa namn när inaktivt","show_name_inactive_description":"Visa namnet när staten är inaktivt.","show_state_active":"Visa tillstånd när det är aktivt","show_state_active_description":"Visa staten när staten är aktiv.","show_state_inactive":"Visa tillstånd när det är inaktivt","show_state_inactive_description":"Visa staten när staten är inaktiv.","use_entity_color_for_icon":"Använd enhetsfärg för ikonen","use_entity_color_for_icon_description":"Använd enhetens färgattribut för ikonen när den är tillgänglig","use_entity_color_for_icon_background":"Använd enhetsfärg för ikonbakgrund","use_entity_color_for_icon_background_description":"Använd enhetens färgattribut för ikonbakgrunden när den är tillgänglig","use_entity_color_for_container_background":"Använd enhetsfärg för behållare","use_entity_color_for_container_background_description":"Använd enhetens färgattribut för behållarbakgrunden när den är tillgänglig","dynamic_icon_template":"Dynamisk Ikon Mall","dynamic_icon_template_description":"Använd en mall för att dynamiskt välja ikonen baserat på entitetstillstånd eller villkor.","enable_dynamic_icon_template":"Aktivera Dynamisk Ikon Mall","dynamic_color_template":"Dynamisk Färg Mall","dynamic_color_template_description":"Använd en mall för att dynamiskt ställa in ikonfärgen baserat på entitetstillstånd eller värden.","enable_dynamic_color_template":"Aktivera Dynamisk Färg Mall","size_settings":"Storleksinställningar","value_size":"Värdestorlek","state_text_formatting":"Tillståndstext Formatering","row_name":"Radnamn","row_name_description":"Anpassat namn för denna ikonrad (lämna tom för att använda standardnamngivning)","width_description":"Kontrollerar hur mycket av den tillgängliga bredden denna rad kommer att använda. Konfigurera hur denna rad av ikoner visas. Bredd kontrollerar den övergripande radbredden, avstånd justerar luckor mellan ikoner, och kolumnantal bestämmer hur många ikoner som visas i varje rad (0 = automatisk).","layout_info_title":"Hur Layoutinställningar Fungerar","layout_info_width":"Radbredd: Kontrollerar hur mycket horisontellt utrymme raden tar upp i kortet (procent av kortbredden)","layout_info_alignment":"Radjustering: Gäller endast när Kolumnantal är 0. Bestämmer hur ikoner positioneras inom raden","layout_info_spacing":"Ikonavstånd: Ställer in mängden utrymme mellan ikoner","layout_info_columns":"Kolumnantal: När satt till 0, flödar ikoner naturligt baserat på tillgängligt utrymme. När satt till ett nummer, tvingar det exakta antalet kolumner i en rutnätslayout","layout_info_tip":"Använd Kolumnantal med konsekventa mängder ikoner per rad för den mest enhetliga layouten","control_right_side_description":"Kontrollera när höger sida visas eller döljs baserat på entitetstillstånd","dynamic_icon":{"title":"Dynamisk Ikon Mall","description":"Använd en mall för att dynamiskt välja ikonen baserat på entitetstillstånd eller villkor.","enable":"Aktivera Dynamisk Ikon Mall","template_label":"Ikon Mall"},"dynamic_color":{"title":"Dynamisk Färg Mall","description":"Använd en mall för att dynamiskt ställa in ikonfärgen baserat på entitetstillstånd eller värden.","enable":"Aktivera Dynamisk Färg Mall","template_label":"Färg Mall"}},"tabs":{"general":"Allmänt","actions":"Åtgärder","appearance":"Utseende","states":"Tillstånd","active_state":"Aktivt Tillstånd","inactive_state":"Inaktivt Tillstånd","icons":{"arrange_icon_rows":"Arrangera Ikonrader"}},"alignments":{"flex-start":"Vänster","center":"Centrum","flex-end":"Höger","space-between":"Mellanrum Mellan","space-around":"Mellanrum Runt","space-evenly":"Jämna Mellanrum"},"vertical_alignments":{"flex-start":"Topp","center":"Mitten","flex-end":"Botten"},"spacing":{"none":"Inget","small":"Litet","medium":"Medium","large":"Stort"},"text_positions":{"below":"Under Ikon","beside":"Bredvid Ikon","none":"Ingen Text","top":"På Toppen","left":"Till Vänster","right":"Till Höger"},"reset":{"size":"Återställ till standardstorlek","color":"Återställ till standardfärg","all":"Återställ till standardvärden"},"click_actions":{"toggle":"Växla","more-info":"Visa Mer Info","navigate":"Navigera till Sökväg","url":"Öppna URL","call-service":"Anropa Tjänst","perform-action":"Utför Åtgärd","location-map":"Visa Karta","assist":"Röstassistent","trigger":"Utlös","none":"Ingen Åtgärd","descriptions":{"toggle":"Växlar enhetens tillstånd på och av.","more-info":"Öppnar mer info-dialogen med ytterligare information om enheten.","navigate":"Navigerar till den angivna Lovelace-sökvägen.","url":"Öppnar den angivna URL:en i en ny flik.","call-service":"Anropar den angivna Home Assistant-tjänsten.","perform-action":"Utför en anpassad åtgärd (se dokumentation).","location-map":"Visar enhetens plats på en karta.","assist":"Öppnar Home Assistants röstassistent.","trigger":"Utlöser enheten (automatisering, skript, knapp, etc).","none":"Ingen åtgärd kommer att utföras."}},"backgrounds":{"none":"Ingen","circle":"Cirkel","square":"Kvadrat","rounded_square":"Avrundad Kvadrat"},"container_widths":{"25":"25% bredd","50":"50% bredd","75":"75% bredd","100":"100% (full bredd)"},"row_widths":{"25":"25% bredd","50":"50% bredd","75":"75% bredd","100":"100% (full bredd)"},"interactions":{"single":"Enkelt Tryck/Klick","double":"Dubbelt Tryck/Klick","hold":"Håll/Långt Tryck"},"animations":{"title":"Ikonanimation","active_description":"Välj en animation att använda när denna ikon är i aktivt tillstånd.","inactive_description":"Välj en animation att använda när denna ikon är i inaktivt tillstånd.","select_animation":"Välj Animation","none":"Ingen","pulse":"Pulsera","vibrate":"Vibrera","rotate_left":"Rotera Vänster","rotate_right":"Rotera Höger","hover":"Svävande","fade":"Tona","scale":"Skala","bounce":"Studsa","shake":"Skaka","tada":"Tada"},"row_vertical_alignments":{"top":"Topp","center":"Mitten","bottom":"Botten"},"actions":{"single":"Enkelt Klick Åtgärd","double":"Dubbelt Klick Åtgärd","hold":"Håll Åtgärd","single_description":"Åtgärd som utförs på ett enkelt tryck/klick - vanligaste interaktionen","double_description":"Åtgärd som utförs på ett dubbelt tryck/klick - hjälper förhindra oavsiktliga utlösningar","hold_description":"Åtgärd som utförs när man håller ned i 500ms - idealisk för kritiska åtgärder","section_header":"Interaktionsåtgärder"}},"customize":{"title":"Anpassa layout","description":"Anpassa layout, beställ och lägg till avsnitt till ditt kort","condition_prompt":"Välj \\"Visa\\" eller \\"dölj\\" för att konfigurera enhetsvillkor","template_mode_active":"Använd Mallläge","layout":{"title":"Layout Stil","description":"Välj mellan enkel- eller dubbelkolumnlayout för kortet","header":"Layout Inställningar","descriptions_header":"Layout Beskrivningar","single_column":"Enkel Kolumn","single_column_description":"Alla sektioner staplas vertikalt i en enda kolumn - bäst för enkla skärmar och mobilvyer.","double_column":"Dubbel Kolumn","double_column_description":"Sektioner delas mellan två kolumner för effektiv användning av horisontellt utrymme - idealiskt för bredare skärmar.","top_view":"Toppvy","top_view_description":"Bilden visas framträdande överst med andra sektioner arrangerade i konfigurerbara positioner runt den.","half_full":"Halv + Full","half_full_description":"Översta raden har två halva-bred sektioner, nedersta raden har en full-bred sektion - bra för balanserade layouter.","full_half":"Full + Halv","full_half_description":"Översta raden har en full-bred sektion, nedersta raden har två halva-bred sektioner - perfekt för att framhäva toppinnehåll."},"layout_types":{"single":"Enkel Kolumn","double":"Dubbel Kolumn","dashboard":"Toppvy","half_full":"Halv + full","full_half":"Halva"},"column_width":{"title":"Kolumnbredd","description":"Konfigurera breddförhållandet mellan vänster och höger kolumn","50_50":"Lika (50/50)","30_70":"Smal vänster, bred höger (30/70)","70_30":"Bred vänster, smal höger (70/30)","40_60":"Något smal vänster (40/60)","60_40":"Något bred vänster (60/40)"},"top_view":{"header":"Toppvy Layout Inställningar","description":"Konfigurera avstånds- och layoutinställningar för toppvyn","side_margin":"Sidomarginaler","side_margin_help":"Marginal på sidorna av vyn i pixlar","middle_spacing":"Mittavstånd","middle_spacing_help":"Avstånd mellan mittkolumnerna i pixlar","vertical_spacing":"Vertikalt Avstånd","vertical_spacing_help":"Avstånd mellan rader i pixlar"},"sections":{"header":"Kortsektioner","arrangement_header":"Sektionsarrangemang","arrangement_desc_base":"Dra och släpp sektioner för att arrangera deras ordning på kortet.","arrangement_desc_single_extra":"Alla sektioner kommer att visas i en enkel kolumn.","arrangement_desc_double_extra":"I en dubbelkolumnlayout kan du placera alla sektioner i antingen vänster eller höger kolumn.","arrangement_desc_dashboard_extra":"I en översiktsvy kan du placera sektioner runt din fordonsbild."},"section_labels":{"title":"Titel","image":"Fordonsbild","info":"Fordonsinfo","bars":"Alla Sensorstalpar","icons":"Alla Ikonrader","section_break":"Sektionspaus"},"actions":{"collapse_margins":"Fäll ihop marginaler","expand_margins":"Expandera marginaler","collapse_options":"Fäll ihop alternativ","expand_options":"Expandera alternativ","add_break":"Lägg till sektionsavbrott","delete_break":"Radera avsnittet"},"css":{"header":"Global CSS","description":"Ange anpassade CSS-regler här för att åsidosätta kortets standardstil. Dessa regler kommer att tillämpas direkt på kortet. Använd med försiktighet.","label":"Anpassad CSS","input_description":"Ange dina anpassade CSS-regler här."},"conditions":{"header":"Villkorslogik","description":"Visa eller dölj denna sektion baserat på en entitets tillstånd.","template_mode_description":"Använd en mall för att bestämma sektionssynlighet. Mallar låter dig använda Home Assistant mallsyntax för komplexa villkor.","type_label":"Villkorstyp","section_title":"Sektionstitel","enable_section_title":"Aktivera Sektionstitel","title_text":"Titeltext","title_size":"Titelstorlek","title_color":"Titelfärg","enable_template_mode":"Aktivera Mallläge","use_template_description":"Använd en mall för att bestämma när denna sektion ska vara synlig. Mallar gör att du kan använda Home Assistant mallsyntax för komplexa villkor.","info_row":"Informationsrad","entity_label":"Villkorsentitet","state_label":"Villkorstillstånd","state_description":"Tillståndsvärdet som utlöser villkoret","types":{"none":"Ingen (Visa Alltid)","show":"Visa När...","hide":"Dölj När..."}},"template":{"description":"Använd en mall för att bestämma när denna sektion ska vara synlig. Mallar låter dig använda Home Assistant mallsyntax för komplexa villkor.","enable":"Aktivera Mallläge"},"template_mode":{"header":"Mallläge","description":"Använd en mall för att kontrollera när denna bild visas eller döljs baserat på komplex logik, beräkningar eller flera entitetstillstånd.","enable":"Aktivera Mallläge","disabled_notice":"(Inaktiverad - Mallläge Aktivt)","disabled_help":"Grundläggande villkorskontroller är inaktiverade när Mallläge är aktivt. Mallläge har företräde över grundläggande villkor.","examples":{"show_when_charging":"Visa när laddar","show_when_battery_low":"Visa när batteriet är lågt","multiple_conditions":"Flera villkor","show_during_day":"Visa under dagtimmar","show_when_door_unlocked":"Visa när dörren är olåst"}},"section_title":{"header":"Sektionstitel","enable":"Aktivera Sektionstitel","text":"Titeltext","size":"Titelstorlek","color":"Titelfärg","bold":"Fet","italic":"Kursiv","uppercase":"Versaler","strikethrough":"Genomstruken"},"margins":{"header":"Marginaler","top":"Övre marginal","bottom":"Nedre marginal"},"columns":{"left":"Vänster kolumn","right":"Höger kolumn","empty":"Släpp sektioner här"},"dashboard":{"top":"Övre sektion","top_middle":"Övre mittsektion","left_middle":"Vänster mittsektion","middle":"Mittsektion","middle_empty":"Fordonsbildområde (Rekommenderat)","right_middle":"Höger mittsektion","bottom_middle":"Nedre mittsektion","bottom":"Nedre sektion"},"half_full":{"row1_col1":"Rad 1 - Vänster Kolumn","row1_col2":"Rad 1 - Höger Kolumn","row2_full":"Rad 2, full bredd (100%)"},"full_half":{"row1_full":"Rad 1, full bredd (100%)","row2_col1":"Rad 2 - Vänster Kolumn","row2_col2":"Rad 2 - Höger Kolumn"},"break_styles":{"blank":"Blank (ingen rad)","line":"Solidlinje","double_line":"Dubbellinje","dotted":"Prickad linje","double_dotted":"Dubbelprickad linje","shadow":"Skugggrad"},"break_style":{"header":"Brytstil","style_label":"Stil","thickness_label":"Tjocklek","width_percent_label":"Bredd (%)","color_label":"Färg"}},"container_widths":{"25":"25% bredd","50":"50% bredd","75":"75% bredd","100":"100% (Full bredd)"},"row_widths":{"25":"25% bredd","50":"50% bredd","75":"75% bredd","100":"100% (Full bredd)"}},"about":{"logo_alt":"Ultra Vehicle Card","developed_by":"Utvecklad av","discord_button":"Gå med i vår Discord","docs_button":"Se vår dokumentation","donate_button":"DONERA (PAYPAL)","github_button":"Besök vår Github","support_title":"Stöd Ultra Vehicle Card","support_description":"Dina generösa tips driver utvecklingen av fantastiska funktioner för det här kortet! Utan stöd från användare som du skulle fortsatt innovation inte vara möjlig."},"custom_icons":{"title":"Anpassade Ikoner","description":"Definiera anpassade ikoner för olika tillstånd.","icon_entity":"Ikonentitet","default_icon":"Standardikon","state_icons":"Tillståndsikoner","state":"Tillstånd","icon":"Ikon"},"custom_active_state_text":"Anpassad Aktiv Statustext","custom_inactive_state_text":"Anpassad Inaktiv Statustext","image_settings":{"title":"Bildinställningar","description":"Konfigurera huvudbildens utseende.","type":"Bildtyp","width":"Bildbredd","crop":"Bildbeskärning","entity":"Bildentitet","entity_description":"Entitet som tillhandahåller bild-URL"},"entity_settings":{"entity":"Enhet","entity_description":"Välj en enhet för att visa information från","name":"Namn","name_description":"Åsidosätta enhetsnamnet (lämna tomt för att använda enhetens vänliga namn)","show_icon":"Visa ikon","icon":"Ikon","icon_color":"Ikonfärg","name_color":"Namnfärg","entity_color":"Enhetsfärg","text_color":"Enhetsfärg","show_name":"Visningsnamn","show_name_description":"Visa enhetsnamnet före värdet","template_mode":"Använd Mall för Värde","template_mode_description":"Använd en mall för att formatera enhetsvärdet","value_template":"Värdemall","template_header":"Värdemall","template_examples_header":"Mall-exempel","template_basic":"Grundvärde","template_units":"Med enheter","template_round":"Rund till 1 decimal","dynamic_icon_template":"Ikon Mall","dynamic_color_template":"Färg Mall","dynamic_icon_template_mode":"Aktivera Dynamisk Ikon Mall","dynamic_color_template_mode":"Aktivera Dynamisk Färg Mall"}}'),Vt={en:mt,de:ht,es:bt,fr:yt,it:wt,da:St,"en-GB":Ct,nl:At,nb:It,nn:Et,sv:a.t(Mt,2)};function Lt(e,t){try{if(!Vt[t])return void Object.keys(Vt);const i=Vt[t];if(["editor.action_images.title","editor.action_images.description","editor.action_images.add_image","editor.action_images.entity_placeholder"].includes(e)){const t=e.split(".");let n=i,a="";for(const e of t){if(a=a?`${a}.${e}`:e,null==n)return;if("object"!=typeof n)return;if(!(e in n))return void Object.keys(n);n=n[e]}return"string"!=typeof n?void 0:n}return e.split(".").reduce(((e,t)=>null==e?void 0:e[t]),i)}catch(e){return}}function Dt(e,t,i){const n=Lt(e,t);if(n)return n;if("en"!==t){const t=Lt(e,"en");if(t)return t}return e.startsWith("editor.action_images"),i||e}var Bt=function(e,t,i,n){var a,o=arguments.length,r=o<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,n);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(r=(o<3?a(r):o>3?a(t,i,r):a(t,i))||r);return o>3&&r&&Object.defineProperty(t,i,r),r};let Rt=class extends ge{constructor(){super(...arguments),this._rowSettingsExpanded={},this._activeEntityTabs={}}set config(e){if(!e)return;if(this._internalConfig===e&&!this._needsMigration(e))return;let t=Object.assign({},e);this._needsMigration(t)?(t=this._performMigration(t),this._internalConfig=t,lt(this,"config-changed",{config:t})):this._internalConfig=t}get config(){return this._internalConfig}get _config(){return this._internalConfig}_t(e,t,i){return Dt(e,t,i)}_generateUniqueId(){return Math.random().toString(36).substring(2,9)}_formatFieldName(e){return e?e.replace(/^./,(e=>e.toUpperCase())).replace(/_/g," "):""}_truncatePath(e,t=40){if(!e||e.length<=t)return e;const i=Math.floor(t/2)-1,n=t-i-3;return i<0||n<0?e:`${e.substring(0,i)}...${e.substring(e.length-n)}`}_valueChanged(e){if(e.stopPropagation(),!this._config)return;const t=e.detail.value,i=Object.assign(Object.assign({},this._config),t);this.config=i,lt(this,"config-changed",{config:i})}_dispatchFileUpload(e,t){var i;const n=e.target,a=null===(i=n.files)||void 0===i?void 0:i[0];a&&(this.dispatchEvent(new CustomEvent("file-upload",{detail:{file:a,configKey:t},bubbles:!0,composed:!0})),n.value="")}_resetTitleSize(){const e=Object.assign(Object.assign({},this._config),{title_size:void 0});this.config=e,lt(this,"config-changed",{config:e})}_updateFormattingToggle(e){const t=Object.assign(Object.assign({},this._config),{[e]:!(()=>{const t=this._config[e];return"title_bold"===e&&void 0===t||!0===t})()});this.config=t,lt(this,"config-changed",{config:t})}_renderFormattingToggles(e,t){const i=e=>{const t=this._config[e];return"title_bold"===e&&void 0===t||!0===t};return Z`
      <div class="control-item format-toggles">
        <div class="format-buttons">
          <ha-icon-button
            class="format-button ${i(`${e}_bold`)?"active":""}"
            @click=${()=>this._updateFormattingToggle(`${e}_bold`)}
            title="${this._t("editor.common.bold",t,"Bold")}"
          >
            <ha-icon icon="mdi:format-bold"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            class="format-button ${i(`${e}_italic`)?"active":""}"
            @click=${()=>this._updateFormattingToggle(`${e}_italic`)}
            title="${this._t("editor.common.italic",t,"Italic")}"
          >
            <ha-icon icon="mdi:format-italic"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            class="format-button ${i(`${e}_uppercase`)?"active":""}"
            @click=${()=>this._updateFormattingToggle(`${e}_uppercase`)}
            title="${this._t("editor.common.uppercase",t,"Uppercase")}"
          >
            <ha-icon icon="mdi:format-letter-case-upper"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            class="format-button ${i(`${e}_strikethrough`)?"active":""}"
            @click=${()=>this._updateFormattingToggle(`${e}_strikethrough`)}
            title="${this._t("editor.common.strikethrough",t,"Strikethrough")}"
          >
            <ha-icon icon="mdi:format-strikethrough"></ha-icon>
          </ha-icon-button>
        </div>
      </div>
    `}_createDefaultCropSettings(){return{top:0,right:0,bottom:0,left:0}}_renderCropSliders(e,t){const i=this._config[e]||this._createDefaultCropSettings();return Z`
      <div class="crop-input-row">
        <div class="crop-input-field">
          <span class="crop-label">${Dt("editor.crop.top",t,"Top")}</span>
          <ha-textfield
            type="number"
            .value=${void 0!==i.top?String(i.top):"0"}
            @change=${t=>{const i=t.target,n=""===i.value?"0":i.value;this._updateImageCrop(e,"top",parseInt(n)||0)}}
          ></ha-textfield>
          <span class="crop-unit">${Dt("editor.crop.pixels",t,"px")}</span>
        </div>

        <div class="crop-input-field">
          <span class="crop-label">${Dt("editor.crop.right",t,"Right")}</span>
          <ha-textfield
            type="number"
            .value=${void 0!==i.right?String(i.right):"0"}
            @change=${t=>{const i=t.target,n=""===i.value?"0":i.value;this._updateImageCrop(e,"right",parseInt(n)||0)}}
          ></ha-textfield>
          <span class="crop-unit">${Dt("editor.crop.pixels",t,"px")}</span>
        </div>

        <div class="crop-input-field">
          <span class="crop-label">${Dt("editor.crop.bottom",t,"Bottom")}</span>
          <ha-textfield
            type="number"
            .value=${void 0!==i.bottom?String(i.bottom):"0"}
            @change=${t=>{const i=t.target,n=""===i.value?"0":i.value;this._updateImageCrop(e,"bottom",parseInt(n)||0)}}
          ></ha-textfield>
          <span class="crop-unit">${Dt("editor.crop.pixels",t,"px")}</span>
        </div>

        <div class="crop-input-field">
          <span class="crop-label">${Dt("editor.crop.left",t,"Left")}</span>
          <ha-textfield
            type="number"
            .value=${void 0!==i.left?String(i.left):"0"}
            @change=${t=>{const i=t.target,n=""===i.value?"0":i.value;this._updateImageCrop(e,"left",parseInt(n)||0)}}
          ></ha-textfield>
          <span class="crop-unit">${Dt("editor.crop.pixels",t,"px")}</span>
        </div>
      </div>

      <div class="crop-explanation">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <span
          >${Dt("editor.crop.help",t,"Enter pixel values (positive or negative) to adjust cropping and padding")}</span
        >
      </div>
    `}_updateImageCrop(e,t,i){const n=this._config[e]||this._createDefaultCropSettings(),a=Object.assign(Object.assign({},n),{[t]:i});if(0===a.top&&0===a.right&&0===a.bottom&&0===a.left){const t=Object.assign({},this._config);delete t[e],this.config=t,lt(this,"config-changed",{config:t})}else{const t=Object.assign(Object.assign({},this._config),{[e]:a});this.config=t,lt(this,"config-changed",{config:t})}}_renderGeneralTab(){var e;const t=(null===(e=this.hass.locale)||void 0===e?void 0:e.language)||"en";return Z`
      <!-- Card Title Section -->
      <div class="settings-section">
        <div class="section-header">${Dt("editor.card_settings.title",t)}</div>
        <div class="settings-content">
          <ha-form
            .hass=${this.hass}
            .data=${this._config}
            .schema=${[{name:"title",selector:{text:{}},label:Dt("editor.card_settings.title",t)},{name:"title_alignment",selector:{select:{options:[{value:"left",label:Dt("editor.alignment.left",t)},{value:"center",label:Dt("editor.alignment.center",t)},{value:"right",label:Dt("editor.alignment.right",t)}],mode:"dropdown"}},label:Dt("editor.card_settings.title_alignment",t)}]}
            .computeLabel=${e=>e.label||this._formatFieldName(e.name)}
            .computeDescription=${e=>e.description}
            @value-changed=${this._valueChanged}
          ></ha-form>

          <!-- Title Formatting Toggles -->
          ${this._renderFormattingToggles("title",t)}

          <!-- Title Size with reset button -->
          <div class="size-fields-container" style="margin-top: 8px;">
            <div class="size-field">
              <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${[{name:"title_size",selector:{number:{mode:"box",unit:"px"}},label:Dt("editor.card_settings.title_size",t)}]}
                .computeLabel=${e=>e.label||this._formatFieldName(e.name)}
                .computeDescription=${e=>e.description}
                @value-changed=${this._valueChanged}
              ></ha-form>
              <ha-icon-button
                class="inline-reset-button"
                @click=${this._resetTitleSize}
                title=${Dt("editor.common.reset",t)}
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </ha-icon-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Colors Section -->
      <div class="settings-section">
        <div class="section-header">${Dt("editor.card_settings.colors",t,"Colors")}</div>
        <div class="settings-content">
          <div class="vehicle-info-card">
            <div class="vehicle-info-title">
              ${Dt("editor.card_settings.title_color",t,"Title Color")}
            </div>
            <div class="vehicle-info-description">
              ${Dt("editor.card_settings.title_color_description",t,"Set the color of the card title")}
            </div>
            <div class="settings-content">
              <color-picker
                .value=${this._config.title_color||"var(--primary-text-color)"}
                .configValue=${"title_color"}
                @value-changed=${this._valueChanged}
              ></color-picker>
            </div>
          </div>

          <div class="vehicle-info-card">
            <div class="vehicle-info-title">
              ${Dt("editor.card_settings.card_background",t,"Card Background")}
            </div>
            <div class="vehicle-info-description">
              ${Dt("editor.card_settings.card_background_description",t,"Set the background color of the card")}
            </div>
            <div class="settings-content">
              <color-picker
                .value=${this._config.card_background||"var(--card-background-color)"}
                .configValue=${"card_background"}
                @value-changed=${this._valueChanged}
              ></color-picker>
            </div>
          </div>
        </div>
      </div>

      <!-- Card Settings Section -->
      <div class="settings-section">
        <div class="section-header">
          ${Dt("editor.card_settings.general",t,"General")}
        </div>
        <div class="settings-content">
          ${[{name:"formatted_entities",selector:{boolean:{}},label:Dt("editor.card_settings.format_entities",t),description:Dt("editor.card_settings.format_entities_description",t)},{name:"show_units",selector:{boolean:{}},label:Dt("editor.card_settings.show_units",t),description:Dt("editor.card_settings.show_units_description",t)},{name:"help_highlight",selector:{boolean:{}},label:Dt("editor.card_settings.help_highlight",t,"Help Highlight"),description:Dt("editor.card_settings.help_highlight_description",t,"Show visual highlights when switching between editor tabs to help identify which section you are editing")}].map((e=>{const t=e.selector&&"boolean"in e.selector;return Z`
              <div class="vehicle-info-card">
                <div class="vehicle-info-title">${e.label}</div>
                ${e.description?Z`<div class="vehicle-info-description">${e.description}</div>`:""}
                <div class="${t?"toggle-form-container":"settings-content"}">
                  <ha-form
                    .hass=${this.hass}
                    .data=${this._config}
                    .schema=${[e]}
                    .computeLabel=${()=>""}
                    @value-changed=${this._valueChanged}
                  ></ha-form>
                </div>
              </div>
            `}))}
        </div>
      </div>

      <!-- Conditional Logic Section -->
      <div class="settings-section">
        <div class="section-header">
          ${Dt("editor.card_settings.conditional_logic",t,"Conditional Logic")}
        </div>
        <div class="settings-content">
          <div class="vehicle-info-card">
            <div class="vehicle-info-title">
              ${Dt("editor.card_settings.card_visibility",t,"Card Visibility")}
            </div>
            <div class="vehicle-info-description">
              ${Dt("editor.card_settings.card_visibility_description",t,"Control when the entire card is visible based on an entity state")}
            </div>
            <div class="settings-content">
              <!-- Condition Type Dropdown -->
              <div class="vehicle-info-card">
                <div class="vehicle-info-title">
                  ${Dt("editor.conditions.condition_type",t,"Condition Type")}
                </div>
                <div class="settings-content">
                  <ha-form
                    .hass=${this.hass}
                    .data=${this._config}
                    .schema=${[{name:"card_condition_type",selector:{select:{options:[{value:"",label:Dt("editor.common.none",t,"None")},{value:"show",label:Dt("editor.conditions.show_card_if",t,"Show Card If")},{value:"hide",label:Dt("editor.conditions.hide_card_if",t,"Hide Card If")}],mode:"dropdown"}}}]}
                    .computeLabel=${()=>""}
                    @value-changed=${this._valueChanged}
                  ></ha-form>
                </div>
              </div>

              ${!this._config.card_condition_type||"show"!==this._config.card_condition_type&&"hide"!==this._config.card_condition_type?"":Z`
                    <!-- Entity and State Fields -->
                    <ha-form
                      .hass=${this.hass}
                      .data=${this._config}
                      .schema=${[{name:"card_condition_entity",selector:{entity:{}},label:Dt("editor.common.entity",t,"Entity"),description:Dt("editor.conditions.entity_description",t,"Select the entity to monitor for state changes")},{name:"card_condition_state",selector:{text:{}},label:Dt("editor.conditions.state",t,"State"),description:Dt("editor.conditions.state_description",t,'The state value to match (e.g., "on", "off", "home", "away")')}]}
                      .computeLabel=${e=>e.label||this._formatFieldName(e.name)}
                      .computeDescription=${e=>e.description}
                      @value-changed=${this._valueChanged}
                    ></ha-form>
                  `}
            </div>
          </div>
        </div>
      </div>
    `}render(){var e;return this.hass&&this._config?(null===(e=this.hass.locale)||void 0===e||e.language,this._renderGeneralTab()):Z``}_needsMigration(e){return(e.location_entity||e.mileage_entity||e.car_state_entity)&&(!e.info_rows||0===e.info_rows.length)}_performMigration(e){const t=Object.assign({},e),i=[],n=void 0===t.show_info_icons||t.show_info_icons,a=[];t.location_entity&&a.push({id:this._generateUniqueId(),entity:t.location_entity,name:"",show_icon:!1!==t.show_location&&n,icon:"mdi:map-marker-outline",text_size:"string"==typeof t.location_text_size?parseInt(t.location_text_size):t.location_text_size,text_color:"",custom_text_color:void 0}),t.mileage_entity&&a.push({id:this._generateUniqueId(),entity:t.mileage_entity,name:"",show_icon:!1!==t.show_mileage&&n,icon:"mdi:counter",text_size:"string"==typeof t.mileage_text_size?parseInt(t.mileage_text_size):t.mileage_text_size,text_color:"",custom_text_color:void 0}),a.length>0&&i.push({id:this._generateUniqueId(),info_entities:a,alignment:"left",spacing:"medium"}),t.car_state_entity&&i.push({id:this._generateUniqueId(),info_entities:[{id:this._generateUniqueId(),entity:t.car_state_entity,name:"",show_icon:!1!==t.show_car_state&&n,icon:"mdi:car-info",text_size:"string"==typeof t.car_state_text_size?parseInt(t.car_state_text_size):t.car_state_text_size,template_mode:t.car_state_template_mode,value_template:t.car_state_template,text_color:"",custom_text_color:void 0}],alignment:"left",spacing:"medium"}),t.info_rows=i,delete t.location_entity,delete t.show_location,delete t.location_icon_color,delete t.location_text_color,delete t.location_text_size,delete t.mileage_entity,delete t.show_mileage,delete t.mileage_icon_color,delete t.mileage_text_color,delete t.mileage_text_size,delete t.car_state_entity,delete t.show_car_state,delete t.car_state_text_color,delete t.car_state_text_size,delete t.car_state_template_mode,delete t.car_state_template,delete t.show_info_icons;const o=[...t.sections_order||[]],r=o.indexOf("info");if(-1!==r)o.splice(r,1),i.forEach(((e,t)=>{o.splice(r+t,0,`info_row_${e.id}`)}));else{const e=o.indexOf("image"),t=o.indexOf("title");let n=-1;-1!==e?n=e+1:-1!==t&&(n=t+1),-1!==n?i.forEach(((e,t)=>{o.splice(n+t,0,`info_row_${e.id}`)})):i.forEach((e=>o.push(`info_row_${e.id}`)))}return t.sections_order=o,console.log("[UltraVehicleCard] settings-tab: Migrated old info fields to new info_rows structure for info-tab to handle:",t),t}};Rt.styles=c`
    .subtabs-container {
      display: flex;
      flex-direction: column;
    }

    .subtabs {
      display: flex;
      justify-content: space-around;
      gap: 8px;
      padding: 16px 16px 0;
      border-bottom: 1px solid var(--divider-color);
      margin-bottom: 16px;
    }

    .subtabs mwc-button {
      --mdc-theme-primary: var(--secondary-text-color);
      border-radius: 4px 4px 0 0;
      margin-bottom: -1px;
    }

    .subtabs mwc-button.active {
      --mdc-theme-primary: var(--primary-color);
      border-bottom: 2px solid var(--primary-color);
    }

    .subtab-content {
      flex: 1;
      overflow: auto;
    }

    .settings-section {
      margin-bottom: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      overflow: hidden;
      background-color: var(--card-background-color, #212121);
    }

    .section-header {
      font-size: 1.1em;
      font-weight: 500;
      padding: 12px 16px;
      background-color: var(--primary-color);
      color: var(--text-primary-color);
      margin-bottom: 0;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      border-bottom: 1px solid var(--divider-color);
    }

    .settings-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background-color: var(--primary-background-color);
    }

    ha-form {
      padding: 0;
      margin-bottom: 0;
    }

    ha-form > * {
      margin-bottom: 16px;
    }
    ha-form > *:last-child {
      margin-bottom: 0;
    }

    .size-fields-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 8px;
    }

    .size-field {
      display: flex;
      align-items: center;
      position: relative;
      gap: 8px;
    }

    .size-field ha-form {
      flex: 1;
      margin-bottom: 0;
    }

    .inline-reset-button {
      --mdc-icon-button-size: 36px;
      color: var(--secondary-text-color);
      opacity: 0.8;
      flex-shrink: 0;
    }

    .inline-reset-button:hover {
      opacity: 1;
      color: var(--primary-color);
    }

    .vehicle-info-card {
      margin-bottom: 0;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background-color: var(--primary-background-color);
      overflow: hidden;
      padding: 0;
    }

    .vehicle-info-title {
      font-weight: 500;
      padding: 12px 16px 4px;
      color: var(--primary-text-color);
    }

    .vehicle-info-description {
      font-size: 0.9em;
      padding: 0 16px 8px;
      color: var(--secondary-text-color);
    }

    .vehicle-info-controls {
      display: flex;
      padding: 8px 16px 16px;
      justify-content: space-between;
      align-items: center;
    }

    .vehicle-info-entity {
      flex-grow: 1;
      margin-right: 16px;
    }

    .vehicle-info-toggle {
      flex-shrink: 0;
      width: 68px;
    }

    .vehicle-info-controls ha-form {
      margin-bottom: 0;
    }

    .upload-container {
      margin: 0;
    }

    .file-upload-row {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .file-upload-button {
      display: inline-block;
      padding: 6px 12px;
      cursor: pointer;
      background-color: var(--secondary-background-color);
      color: var(--primary-text-color);
      border-radius: 4px;
      border: 1px solid var(--divider-color);
      font-size: 14px;
      text-align: center;
      min-width: 120px;
      white-space: nowrap;
    }

    .file-upload-button:hover {
      background-color: var(--primary-color);
      color: var(--text-primary-color);
    }

    .path-display {
      flex: 1;
      overflow: hidden;
      padding: 4px 8px;
      background: var(--secondary-background-color);
      border-radius: 4px;
    }

    .uploaded-path {
      display: block;
      font-size: 0.9em;
      color: var(--secondary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .no-file {
      color: var(--disabled-text-color);
      font-style: italic;
    }

    .image-description {
      padding: 16px;
      color: var(--secondary-text-color);
      font-size: 0.9em;
      line-height: 1.4;
      margin-top: -8px;
      background: var(--primary-background-color);
      border-top: 1px solid var(--divider-color);
    }

    .crop-accordion {
      margin-top: 16px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      overflow: hidden;
    }

    .crop-accordion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: var(--card-background-color, rgba(0, 0, 0, 0.05));
      cursor: pointer;
      font-weight: 500;
    }

    .crop-controls {
      padding: 16px;
      background-color: var(--primary-background-color);
    }

    .crop-input-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .crop-input-row {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
    }

    @media (max-width: 480px) {
      .crop-input-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }

    .crop-input-field {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .crop-label {
      min-width: 50px;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .crop-input-field ha-textfield {
      width: 100%;
      min-width: 60px;
    }

    .crop-unit {
      margin-top: 4px;
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }

    .crop-explanation {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      color: var(--secondary-text-color);
      font-size: 0.9em;
      padding: 8px;
      background: rgba(var(--rgb-primary-color), 0.05);
      border-radius: 4px;
    }

    .crop-explanation ha-icon {
      color: var(--primary-color);
    }

    .toggle-form-container {
      padding: 0 16px 0;
    }

    .vehicle-info-card .toggle-form-container ha-form > * {
      margin-bottom: 0;
    }

    .color-picker-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .color-picker-label {
      font-size: 0.9em;
      color: var(--secondary-text-color);
      margin-bottom: 4px;
    }

    /* Text size control styles */
    .text-size-container {
      margin-top: 8px;
      padding: 0 16px 16px;
    }

    .text-size-label {
      font-size: 0.9em;
      color: var(--secondary-text-color);
      margin: 4px 0 8px;
    }

    .text-size-container .size-field {
      display: flex;
      align-items: center;
      position: relative;
      gap: 8px;
    }

    .text-size-container .size-field ha-form {
      flex: 1;
      margin-bottom: 0;
    }

    .text-size-container .inline-reset-button {
      --mdc-icon-button-size: 36px;
      color: var(--secondary-text-color);
      opacity: 0.8;
      flex-shrink: 0;
    }

    .text-size-container .inline-reset-button:hover {
      opacity: 1;
      color: var(--primary-color);
    }

    .template-mode-container {
      margin-top: 12px;
      padding: 0 16px 16px;
      border-top: 1px solid var(--divider-color);
    }

    .settings-label {
      font-size: 0.9em;
      color: var(--secondary-text-color);
      margin-bottom: 4px;
    }

    .template-container {
      margin-top: 12px;
      padding: 0 16px 16px;
      border-top: 1px solid var(--divider-color);
    }

    /* Image width slider styles */
    .image-width-slider {
      margin: 16px 0;
      padding: 0 16px;
    }

    .image-width-header {
      font-size: 0.9em;
      font-weight: 500;
      margin-bottom: 4px;
      color: var(--primary-text-color);
    }

    .image-width-description {
      font-size: 0.85em;
      margin-top: 4px;
      margin-bottom: 8px;
      color: var(--secondary-text-color);
      font-style: italic;
    }

    .image-width-controls {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .slider-input-combo {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .image-width-controls ha-slider {
      flex: 1;
    }

    .width-input {
      width: 100px;
    }

    .width-indicators {
      display: flex;
      justify-content: space-between;
      font-size: 0.8em;
      color: var(--secondary-text-color);
      margin-top: 4px;
      position: relative;
      padding: 0 10px;
    }

    .width-marker-100 {
      position: relative;
      font-weight: bold;
      color: var(--primary-color);
    }

    .width-marker-100::after {
      content: '';
      position: absolute;
      height: 8px;
      width: 2px;
      background-color: var(--primary-color);
      left: 50%;
      top: -12px;
      transform: translateX(-50%);
    }

    /* Info Rows Styling - MOVED TO info-tab.ts */
    /* .bar { ... } */
    /* .bar.expanded { ... } */
    /* ... and so on for all .bar, .mini-bar, .icon-settings-tab etc. */

    /* Styles for .subsection-header, .settings-content.collapsed/expanded if still needed by other parts */
    .subsection-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background-color: var(--secondary-background-color);
      font-weight: 500;
      border-bottom: 1px solid var(--divider-color);
    }

    .subsection-header.toggleable {
      cursor: pointer;
      user-select: none;
    }

    .subsection-header .toggle-icon {
      color: var(--primary-text-color);
      transition: transform 0.2s ease;
    }

    .settings-content.collapsed {
      display: none;
    }

    .settings-content.expanded {
      display: flex;
      flex-direction: column;
      gap: 16px;
      animation: slideDown 0.2s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Formatting Toggles */
    .format-toggles {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      margin-bottom: 8px;
    }

    .format-buttons {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      justify-content: flex-start;
    }

    .format-button {
      --mdc-icon-button-size: 36px;
      --mdc-theme-text-disabled-on-light: var(--disabled-text-color);
      border: 2px solid var(--divider-color);
      border-radius: 6px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      min-width: 36px;
      min-height: 36px;
      padding: 0;
      margin: 0;
    }

    .format-button ha-icon {
      --mdc-icon-size: 18px;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .format-button:not(.active) {
      background-color: var(--card-background-color);
      color: var(--secondary-text-color);
    }

    .format-button.active {
      background-color: var(--primary-color);
      color: var(--primary-background-color, #ffffff);
      border-color: var(--primary-color);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .format-button.active ha-icon {
      color: var(--primary-background-color, #ffffff) !important;
    }

    .format-button:hover:not(.active) {
      background-color: var(--secondary-background-color);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .control-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `,Bt([be({attribute:!1})],Rt.prototype,"hass",void 0),Bt([fe()],Rt.prototype,"_internalConfig",void 0),Bt([be({attribute:!1})],Rt.prototype,"config",null),Bt([fe()],Rt.prototype,"_rowSettingsExpanded",void 0),Bt([fe()],Rt.prototype,"_activeEntityTabs",void 0),Rt=Bt([_e("settings-tab")],Rt);class Pt extends we{constructor(e){if(super(e),this.it=Q,2!==e.type)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===Q||null==e)return this._t=void 0,this.it=e;if(e===J)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}Pt.directiveName="unsafeHTML",Pt.resultType=1;const Ut=ke(Pt);function Ht(){return`${Date.now()}_${Math.random().toString(36).substr(2,9)}`}var Nt=function(e,t,i,n){var a,o=arguments.length,r=o<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,n);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(r=(o<3?a(r):o>3?a(t,i,r):a(t,i))||r);return o>3&&r&&Object.defineProperty(t,i,r),r};let Ot=class extends ge{constructor(){super(...arguments),this._currentLayout=null,this._showModuleSelector=!1,this._selectedRowId=null,this._selectedColumnId=null,this._draggingModule=null,this._dragOverRowId=null,this._dragOverColumnId=null,this._showRowSettings=null,this._showColumnSettings=null,this._showModuleSettings=null,this._activeModuleSettingsTab={},this._showRowDialog=!1,this._showColumnDialog=!1,this._showModuleDialog=!1,this._currentEditingRow=null,this._currentEditingColumn=null,this._currentEditingModule=null,this._currentEditingRowId="",this._currentEditingColumnId="",this._currentEditingModuleIndex=null,this._activeDialogTab="general",this._moduleTypes=[{type:"text",name:"Text",description:"Add custom text with styling options",icon:"mdi:format-text"},{type:"separator",name:"Separator",description:"Add visual dividers between content",icon:"mdi:minus"},{type:"horizontal",name:"Horizontal Layout",description:"Arrange items horizontally with alignment options",icon:"mdi:view-sequential"},{type:"vertical",name:"Vertical Layout",description:"Arrange items vertically with spacing control",icon:"mdi:view-agenda"},{type:"image",name:"Images",description:"Display vehicle images with conditional logic",icon:"mdi:image"},{type:"info",name:"Info Items",description:"Show entity information in rows",icon:"mdi:information"},{type:"bar",name:"Bars",description:"Display progress bars for entities",icon:"mdi:chart-bar"},{type:"icon",name:"Icons",description:"Show status icons with conditional logic",icon:"mdi:circle"},{type:"column",name:"Add Column",description:"Add another column to this row",icon:"mdi:view-column"}]}_getColumnLayoutOptions(e){switch(e){case 1:return[{value:"1-col",label:"Single Column",icon:this._getColumnIcon("1-col")}];case 2:return[{value:"50-50",label:"1/2 + 1/2",icon:this._getColumnIcon("50-50")},{value:"30-70",label:"1/3 + 2/3",icon:this._getColumnIcon("30-70")},{value:"70-30",label:"2/3 + 1/3",icon:this._getColumnIcon("70-30")},{value:"40-60",label:"2/5 + 3/5",icon:this._getColumnIcon("40-60")},{value:"60-40",label:"3/5 + 2/5",icon:this._getColumnIcon("60-40")}];case 3:return[{value:"33-33-33",label:"1/3 + 1/3 + 1/3",icon:this._getColumnIcon("33-33-33")},{value:"25-50-25",label:"1/4 + 1/2 + 1/4",icon:this._getColumnIcon("25-50-25")},{value:"20-60-20",label:"1/5 + 3/5 + 1/5",icon:this._getColumnIcon("20-60-20")}];case 4:return[{value:"25-25-25-25",label:"1/4 + 1/4 + 1/4 + 1/4",icon:this._getColumnIcon("25-25-25-25")}];default:return[{value:"auto",label:"Auto Layout",icon:this._getColumnIcon("auto")}]}}_getColumnIcon(e){const t='fill="currentColor" stroke="currentColor" stroke-width="0.5"';switch(e){case"1-col":default:return`<svg viewBox="0 0 24 8" width="32" height="12">\n          <rect x="1" y="1" width="22" height="6" ${t} opacity="0.3" rx="1"/>\n        </svg>`;case"50-50":return`<svg viewBox="0 0 24 8" width="32" height="12">\n          <rect x="1" y="1" width="10.5" height="6" ${t} opacity="0.3" rx="1"/>\n          <rect x="12.5" y="1" width="10.5" height="6" ${t} opacity="0.3" rx="1"/>\n        </svg>`;case"30-70":return`<svg viewBox="0 0 24 8" width="32" height="12">\n          <rect x="1" y="1" width="6.5" height="6" ${t} opacity="0.3" rx="1"/>\n          <rect x="8.5" y="1" width="14.5" height="6" ${t} opacity="0.3" rx="1"/>\n        </svg>`;case"70-30":return`<svg viewBox="0 0 24 8" width="32" height="12">\n          <rect x="1" y="1" width="14.5" height="6" ${t} opacity="0.3" rx="1"/>\n          <rect x="16.5" y="1" width="6.5" height="6" ${t} opacity="0.3" rx="1"/>\n        </svg>`;case"40-60":return`<svg viewBox="0 0 24 8" width="32" height="12">\n          <rect x="1" y="1" width="8.5" height="6" ${t} opacity="0.3" rx="1"/>\n          <rect x="10.5" y="1" width="12.5" height="6" ${t} opacity="0.3" rx="1"/>\n        </svg>`;case"60-40":return`<svg viewBox="0 0 24 8" width="32" height="12">\n          <rect x="1" y="1" width="12.5" height="6" ${t} opacity="0.3" rx="1"/>\n          <rect x="14.5" y="1" width="8.5" height="6" ${t} opacity="0.3" rx="1"/>\n        </svg>`;case"33-33-33":return`<svg viewBox="0 0 24 8" width="32" height="12">\n          <rect x="1" y="1" width="6.8" height="6" ${t} opacity="0.3" rx="1"/>\n          <rect x="8.6" y="1" width="6.8" height="6" ${t} opacity="0.3" rx="1"/>\n          <rect x="16.2" y="1" width="6.8" height="6" ${t} opacity="0.3" rx="1"/>\n        </svg>`;case"25-50-25":return`<svg viewBox="0 0 24 8" width="32" height="12">\n          <rect x="1" y="1" width="5" height="6" ${t} opacity="0.3" rx="1"/>\n          <rect x="7" y="1" width="10" height="6" ${t} opacity="0.3" rx="1"/>\n          <rect x="18" y="1" width="5" height="6" ${t} opacity="0.3" rx="1"/>\n        </svg>`;case"20-60-20":return`<svg viewBox="0 0 24 8" width="32" height="12">\n          <rect x="1" y="1" width="4" height="6" ${t} opacity="0.3" rx="1"/>\n          <rect x="6" y="1" width="12" height="6" ${t} opacity="0.3" rx="1"/>\n          <rect x="19" y="1" width="4" height="6" ${t} opacity="0.3" rx="1"/>\n        </svg>`;case"25-25-25-25":return`<svg viewBox="0 0 24 8" width="32" height="12">\n          <rect x="1" y="1" width="5" height="6" ${t} opacity="0.3" rx="1"/>\n          <rect x="6.5" y="1" width="5" height="6" ${t} opacity="0.3" rx="1"/>\n          <rect x="12" y="1" width="5" height="6" ${t} opacity="0.3" rx="1"/>\n          <rect x="17.5" y="1" width="5" height="6" ${t} opacity="0.3" rx="1"/>\n        </svg>`}}firstUpdated(){this._initializeLayout()}_initializeLayout(){var e;if(this.config.layout&&(null===(e=this.config.layout.rows)||void 0===e?void 0:e.length)>0)this._currentLayout=Object.assign({},this.config.layout);else{const e={id:Ht(),name:"Column 1",modules:[],vertical_alignment:"top",horizontal_alignment:"left"};this._currentLayout={rows:[{id:Ht(),name:"Row 1",columns:[e],column_layout:"1-col",gap:8}]}}}_addRow(){if(!this._currentLayout)return;const e={id:Ht(),name:"Column 1",modules:[],vertical_alignment:"top",horizontal_alignment:"left"},t={id:Ht(),name:`Row ${this._currentLayout.rows.length+1}`,columns:[e],column_layout:"1-col",gap:8};this._currentLayout=Object.assign(Object.assign({},this._currentLayout),{rows:[...this._currentLayout.rows,t]}),this._updateConfig()}_deleteRow(e){this._currentLayout&&(this._currentLayout=Object.assign(Object.assign({},this._currentLayout),{rows:this._currentLayout.rows.filter((t=>t.id!==e))}),this._updateConfig())}_addColumn(e){if(!this._currentLayout)return;const t=e||this._selectedRowId;if(!t)return;const i=this._currentLayout.rows.findIndex((e=>e.id===t));if(-1===i)return;const n=this._currentLayout.rows[i],a=n.columns.length+1,o={id:Ht(),name:`Column ${a}`,modules:[],vertical_alignment:"top",horizontal_alignment:"left"},r=Object.assign(Object.assign({},n),{columns:[...n.columns,o],column_layout:this._getDefaultLayoutForColumnCount(a)});this._currentLayout=Object.assign(Object.assign({},this._currentLayout),{rows:[...this._currentLayout.rows.slice(0,i),r,...this._currentLayout.rows.slice(i+1)]}),this._updateConfig(),this._closeModuleSelector()}_getDefaultLayoutForColumnCount(e){switch(e){case 1:return"1-col";case 2:return"50-50";case 3:return"33-33-33";case 4:return"25-25-25-25";default:return"auto"}}_getColumnFractions(e){return{"1-col":["100%"],"50-50":["1/2","1/2"],"30-70":["1/3","2/3"],"70-30":["2/3","1/3"],"40-60":["2/5","3/5"],"60-40":["3/5","2/5"],"33-33-33":["1/3","1/3","1/3"],"25-50-25":["1/4","1/2","1/4"],"20-60-20":["1/5","3/5","1/5"],"25-25-25-25":["1/4","1/4","1/4","1/4"]}[e]||["Auto"]}_deleteColumn(e,t){if(!this._currentLayout)return;const i=this._currentLayout.rows.findIndex((t=>t.id===e));if(-1===i)return;const n=this._currentLayout.rows[i];if(n.columns.length<=1)return;const a=Object.assign(Object.assign({},n),{columns:n.columns.filter((e=>e.id!==t)),column_layout:this._getDefaultLayoutForColumnCount(n.columns.length-1)});this._currentLayout=Object.assign(Object.assign({},this._currentLayout),{rows:[...this._currentLayout.rows.slice(0,i),a,...this._currentLayout.rows.slice(i+1)]}),this._updateConfig()}_openModuleSelector(e,t){this._selectedRowId=e,this._selectedColumnId=t||null,this._showModuleSelector=!0}_closeModuleSelector(){this._showModuleSelector=!1,this._selectedRowId=null,this._selectedColumnId=null}_addModule(e){var t;if(!this._currentLayout||!this._selectedRowId)return;if("column"===e)return void this._addColumn();const i=this._createModule(e),n=this._currentLayout.rows.findIndex((e=>e.id===this._selectedRowId));if(-1===n)return;const a=this._currentLayout.rows[n],o=this._selectedColumnId||(null===(t=a.columns[0])||void 0===t?void 0:t.id);if(!o)return;const r=a.columns.findIndex((e=>e.id===o));if(-1===r)return;const s=Object.assign(Object.assign({},a.columns[r]),{modules:[...a.columns[r].modules,i]}),l=Object.assign(Object.assign({},a),{columns:[...a.columns.slice(0,r),s,...a.columns.slice(r+1)]});this._currentLayout=Object.assign(Object.assign({},this._currentLayout),{rows:[...this._currentLayout.rows.slice(0,n),l,...this._currentLayout.rows.slice(n+1)]}),this._updateConfig(),this._closeModuleSelector()}_createModule(e){var t;const i={id:Ht(),name:(null===(t=this._moduleTypes.find((t=>t.type===e)))||void 0===t?void 0:t.name)||"Module"};switch(e){case"text":return Object.assign(Object.assign({},i),{type:"text",text:"Enter your text here",font_size:16,color:"var(--primary-text-color)",alignment:"left"});case"separator":return Object.assign(Object.assign({},i),{type:"separator",separator_style:"line",thickness:1,width_percent:100,color:"var(--divider-color)"});case"horizontal":return Object.assign(Object.assign({},i),{type:"horizontal",horizontal_alignment:"center",vertical_alignment:"center",gap:"1.2rem",allow_wrap:!1,mobile_single_column:!1});case"vertical":return Object.assign(Object.assign({},i),{type:"vertical",vertical_alignment:"top",horizontal_alignment:"center",gap:"0.8rem"});case"image":return Object.assign(Object.assign({},i),{type:"image",image_type:"none"});case"info":return Object.assign(Object.assign({},i),{type:"info",width:"100%",alignment:"center",spacing:"8px",info_entities:[{id:`entity_${Date.now()}_0`,entity:"",name:"",icon:"",show_icon:!0,show_name:!1,text_size:14,name_size:14,icon_size:24,icon_color:"var(--secondary-text-color)",text_color:"var(--primary-text-color)",on_click_action:"more-info",dynamic_icon_template_mode:!1,dynamic_icon_template:"",dynamic_color_template_mode:!1,dynamic_color_template:""}]});case"bar":return Object.assign(Object.assign({},i),{type:"bar",entity:""});case"icon":return Object.assign(Object.assign({},i),{type:"icon",width:"100%",alignment:"center",spacing:"8px",icons:[{entity:"",icon_inactive:"mdi:circle",icon_active:"mdi:circle",color_inactive:"var(--secondary-text-color)",color_active:"var(--primary-color)",inactive_state:"off",active_state:"on",show_state:!0,show_name:!1,icon_size:24,text_size:14,single_click_action:"more-info",dynamic_icon_template_mode:!1,dynamic_icon_template:"",dynamic_color_template_mode:!1,dynamic_color_template:""}]});default:throw new Error(`Unknown module type: ${e}`)}}_deleteModule(e,t,i){if(!this._currentLayout)return;const n=this._currentLayout.rows.findIndex((t=>t.id===e));if(-1===n)return;const a=this._currentLayout.rows[n],o=a.columns.findIndex((e=>e.id===t));if(-1===o)return;const r=Object.assign(Object.assign({},a.columns[o]),{modules:a.columns[o].modules.filter((e=>e.id!==i))}),s=Object.assign(Object.assign({},a),{columns:[...a.columns.slice(0,o),r,...a.columns.slice(o+1)]});this._currentLayout=Object.assign(Object.assign({},this._currentLayout),{rows:[...this._currentLayout.rows.slice(0,n),s,...this._currentLayout.rows.slice(n+1)]}),this._updateConfig()}_updateRowLayout(e,t){if(!this._currentLayout)return;const i=this._currentLayout.rows.findIndex((t=>t.id===e));if(-1===i)return;const n=Object.assign(Object.assign({},this._currentLayout.rows[i]),{column_layout:t});this._currentLayout=Object.assign(Object.assign({},this._currentLayout),{rows:[...this._currentLayout.rows.slice(0,i),n,...this._currentLayout.rows.slice(i+1)]}),this._updateConfig()}_toggleRowSettings(e){this._showRowSettings=this._showRowSettings===e?null:e}_removeLastColumn(e){if(!this._currentLayout)return;const t=this._currentLayout.rows.findIndex((t=>t.id===e));if(-1===t)return;const i=this._currentLayout.rows[t];if(i.columns.length<=1)return;const n=Object.assign(Object.assign({},i),{columns:i.columns.slice(0,-1),column_layout:this._getDefaultLayoutForColumnCount(i.columns.length-1)});this._currentLayout=Object.assign(Object.assign({},this._currentLayout),{rows:[...this._currentLayout.rows.slice(0,t),n,...this._currentLayout.rows.slice(t+1)]}),this._updateConfig()}_updateRowGap(e,t){if(!this._currentLayout)return;const i=this._currentLayout.rows.findIndex((t=>t.id===e));if(-1===i)return;const n=Object.assign(Object.assign({},this._currentLayout.rows[i]),{gap:t});this._currentLayout=Object.assign(Object.assign({},this._currentLayout),{rows:[...this._currentLayout.rows.slice(0,i),n,...this._currentLayout.rows.slice(i+1)]}),this._updateConfig()}_openModuleSettings(e){this._showModuleSettings=this._showModuleSettings===e.id?null:e.id}_toggleColumnSettings(e){this._showColumnSettings=this._showColumnSettings===e?null:e}_setModuleSettingsTab(e,t){this._activeModuleSettingsTab=Object.assign(Object.assign({},this._activeModuleSettingsTab),{[e]:t})}_openRowDialog(e){this._currentEditingRow=e,this._showRowDialog=!0,this._activeDialogTab="general"}_openColumnDialog(e){this._currentEditingColumn=e,this._showColumnDialog=!0,this._activeDialogTab="general"}_openModuleDialog(e){let t="",i="";if(this._currentLayout)for(const n of this._currentLayout.rows){for(const a of n.columns)if(a.modules.some((t=>t.id===e.id))){t=n.id,i=a.id;break}if(t)break}this._currentEditingModule=e,this._currentEditingRowId=t,this._currentEditingColumnId=i,this._showModuleDialog=!0,this._activeDialogTab="general",this.requestUpdate()}_closeDialogs(){this._showRowDialog=!1,this._showColumnDialog=!1,this._showModuleDialog=!1,this._currentEditingRow=null,this._currentEditingColumn=null,this._currentEditingModule=null,this._currentEditingRowId="",this._currentEditingColumnId="",this._currentEditingModuleIndex=null}_setDialogTab(e){this._activeDialogTab=e}_startRowDrag(e,t){e.preventDefault(),console.log("Row drag started:",t.id)}_openColumnStructureDialog(e){this._currentEditingRow=e,this._showRowDialog=!0,this._activeDialogTab="structure"}_startColumnDrag(e,t){e.preventDefault(),e.stopPropagation(),console.log("Column drag started:",t.id)}_updateConfig(){if(!this._currentLayout)return;const e=function(e){const t={layout_type:e.layout_type,column_width:e.column_width},i=[],n=[],a=[],o=[];let r=!1;return e.rows.forEach((e=>{e.columns.forEach((e=>{e.modules.forEach((e=>{switch(e.type){case"text":const s=e;!r&&s.text&&"Title"===s.name&&(t.title=s.text,t.title_size=s.font_size,t.title_color=s.color,t.title_alignment=s.alignment,t.title_bold=s.bold,t.title_italic=s.italic,t.title_uppercase=s.uppercase,t.title_strikethrough=s.strikethrough,r=!0);break;case"separator":break;case"image":const l=e;i.push({id:l.id,name:l.name,image_type:l.image_type,image:l.image,image_entity:l.image_entity,image_width:l.image_width,image_crop:l.image_crop,conditional_entity:l.conditional_entity,conditional_state:l.conditional_state,conditional_type:l.conditional_type,template_mode:l.template_mode,template:l.template,priority:l.priority,single_click_action:l.single_click_action,single_entity:l.single_entity,single_navigation_path:l.single_navigation_path,single_url:l.single_url,single_service:l.single_service,single_service_data:l.single_service_data,single_action:l.single_action,double_click_action:l.double_click_action,double_entity:l.double_entity,double_navigation_path:l.double_navigation_path,double_url:l.double_url,double_service:l.double_service,double_service_data:l.double_service_data,double_action:l.double_action,hold_click_action:l.hold_click_action,hold_entity:l.hold_entity,hold_navigation_path:l.hold_navigation_path,hold_url:l.hold_url,hold_service:l.hold_service,hold_service_data:l.hold_service_data,hold_action:l.hold_action,timed_duration:l.timed_duration,is_fallback:l.is_fallback});break;case"info":const d=e;n.push({id:d.id,width:d.width,alignment:d.alignment,vertical_alignment:d.vertical_alignment,spacing:d.spacing,columns:d.columns,allow_wrap:d.allow_wrap,info_entities:d.info_entities,row_header:d.row_header,row_header_size:d.row_header_size,row_header_color:d.row_header_color,show_row_header:d.show_row_header});break;case"bar":const c=e;a.push({entity:c.entity,limit_entity:c.limit_entity,limit_indicator_color:c.limit_indicator_color,left_entity:c.left_entity,right_entity:c.right_entity,left_title:c.left_title,right_title:c.right_title,bar_color:c.bar_color,background_color:c.background_color,border_color:c.border_color,left_title_color:c.left_title_color,left_text_color:c.left_text_color,right_title_color:c.right_title_color,right_text_color:c.right_text_color,percentage_text_color:c.percentage_text_color,left_title_size:c.left_title_size,left_text_size:c.left_text_size,right_title_size:c.right_title_size,right_text_size:c.right_text_size,percentage_text_size:c.percentage_text_size,left_title_bold:c.left_title_bold,left_title_italic:c.left_title_italic,left_title_uppercase:c.left_title_uppercase,left_title_strikethrough:c.left_title_strikethrough,left_text_bold:c.left_text_bold,left_text_italic:c.left_text_italic,left_text_uppercase:c.left_text_uppercase,left_text_strikethrough:c.left_text_strikethrough,right_title_bold:c.right_title_bold,right_title_italic:c.right_title_italic,right_title_uppercase:c.right_title_uppercase,right_title_strikethrough:c.right_title_strikethrough,right_text_bold:c.right_text_bold,right_text_italic:c.right_text_italic,right_text_uppercase:c.right_text_uppercase,right_text_strikethrough:c.right_text_strikethrough,percentage_text_bold:c.percentage_text_bold,percentage_text_italic:c.percentage_text_italic,percentage_text_uppercase:c.percentage_text_uppercase,percentage_text_strikethrough:c.percentage_text_strikethrough,bar_size:c.bar_size,bar_radius:c.bar_radius,bar_style:c.bar_style,show_left:c.show_left,show_right:c.show_right,show_percentage:c.show_percentage,show_left_title:c.show_left_title,show_left_value:c.show_left_value,show_right_title:c.show_right_title,show_right_value:c.show_right_value,alignment:c.alignment,width:c.width,use_gradient:c.use_gradient,gradient_stops:c.gradient_stops,gradient_display_mode:c.gradient_display_mode,animation_entity:c.animation_entity,animation_state:c.animation_state,animation_type:c.animation_type,left_condition:c.left_condition,right_condition:c.right_condition,left_template_mode:c.left_template_mode,left_template:c.left_template,right_template_mode:c.right_template_mode,right_template:c.right_template,percentage_type:c.percentage_type,percentage_amount_entity:c.percentage_amount_entity,percentage_total_entity:c.percentage_total_entity});break;case"icon":const p=e;o.push({id:p.id,width:p.width||"100%",alignment:p.alignment||"center",vertical_alignment:p.vertical_alignment,spacing:p.spacing||"8px",columns:p.columns,icons:p.icons})}}))}))})),i.length>0&&(t.images=i),n.length>0&&(t.info_rows=n),a.length>0&&(t.bars=a),o.length>0&&(t.icon_rows=o),t}(this._currentLayout),t=Object.assign(Object.assign(Object.assign({},this.config),e),{layout:this._currentLayout,use_modular_layout:!0});this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}_onDragStart(e,t){e.dataTransfer&&(this._draggingModule=t,e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/plain",""))}_onDragOver(e,t,i){e.preventDefault(),e.dataTransfer.dropEffect="move",this._dragOverRowId=t,this._dragOverColumnId=i||null}_onDragLeave(){this._dragOverRowId=null,this._dragOverColumnId=null}_onDrop(e,t,i){var n;if(e.preventDefault(),!this._draggingModule||!this._currentLayout)return;let a="",o="";if(this._currentLayout.rows.forEach((e=>{e.columns.forEach((t=>{t.modules.some((e=>e.id===this._draggingModule.id))&&(a=e.id,o=t.id)}))})),!a||!o)return;const r=this._currentLayout.rows.findIndex((e=>e.id===a)),s=this._currentLayout.rows[r],l=s.columns.findIndex((e=>e.id===o)),d=Object.assign(Object.assign({},s.columns[l]),{modules:s.columns[l].modules.filter((e=>e.id!==this._draggingModule.id))}),c=Object.assign(Object.assign({},s),{columns:[...s.columns.slice(0,l),d,...s.columns.slice(l+1)]}),p=this._currentLayout.rows.findIndex((e=>e.id===t)),u=this._currentLayout.rows[p],g=i||(null===(n=u.columns[0])||void 0===n?void 0:n.id);if(!g)return;const m=u.columns.findIndex((e=>e.id===g)),_=Object.assign(Object.assign({},u.columns[m]),{modules:[...u.columns[m].modules,this._draggingModule]}),h=Object.assign(Object.assign({},u),{columns:[...u.columns.slice(0,m),_,...u.columns.slice(m+1)]}),v=[...this._currentLayout.rows];v[r]=c,v[p]=h,this._currentLayout=Object.assign(Object.assign({},this._currentLayout),{rows:v}),this._draggingModule=null,this._dragOverRowId=null,this._dragOverColumnId=null,this._updateConfig()}_getTotalModuleCount(e){return e.columns.reduce(((e,t)=>e+t.modules.length),0)}_renderRow(e){const t=this._getColumnLayoutOptions(e.columns.length).find((t=>t.value===e.column_layout))||this._getColumnLayoutOptions(e.columns.length)[0];return Z`
      <div
        class="row-container ${this._dragOverRowId===e.id?"drag-over":""}"
        @dragover=${t=>this._onDragOver(t,e.id)}
        @dragleave=${this._onDragLeave}
        @drop=${t=>this._onDrop(t,e.id)}
      >
        <!-- Row Header -->
        <div class="row-header">
          <div class="row-header-left">
            <ha-icon-button
              .path=${"M7,19V17H9V19H7M11,19V17H13V19H11M15,19V17H17V19H15M7,15V13H9V15H7M11,15V13H13V15H11M15,15V13H17V15H15M7,11V9H9V11H7M11,11V9H13V11H11M15,11V9H17V11H15M7,7V5H9V7H7M11,7V5H13V7H11M15,7V5H17V7H15Z"}
              title="Drag to reorder rows"
              class="row-drag-handle"
              @mousedown=${t=>this._startRowDrag(t,e)}
            ></ha-icon-button>

            <button
              class="column-structure-btn"
              @click=${()=>this._openColumnStructureDialog(e)}
              title="Change column structure"
            >
              ${t.icon?Z`${Ut(t.icon)}`:""}
              <span class="structure-label">${t.label}</span>
            </button>
          </div>

          <div class="row-header-right">
            <ha-icon-button
              .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}
              title="Delete Row"
              @click=${()=>this._deleteRow(e.id)}
              class="row-delete-btn"
            ></ha-icon-button>
          </div>
        </div>

        <!-- Row Content -->
        <div class="row-content">
          ${0===e.columns.length?Z`
                <div class="empty-row" @click=${()=>this._openModuleSelector(e.id)}>
                  <ha-icon icon="mdi:plus"></ha-icon>
                  <span>Click to add content</span>
                </div>
              `:Z`
                <div class="columns-container-vertical" style="gap: ${e.gap||8}px;">
                  ${e.columns.map(((t,i)=>this._renderColumn(e,t,i)))}
                </div>
              `}
        </div>

        ${this._showRowSettings===e.id?Z`
              <div class="row-settings">
                <div class="settings-section">
                  <h4>Row Configuration</h4>

                  <div class="setting-row">
                    <label>Columns (${e.columns.length})</label>
                    <div class="column-controls">
                      <button
                        class="add-column-btn"
                        @click=${()=>this._addColumn(e.id)}
                        ?disabled=${e.columns.length>=4}
                        title="Add Column"
                      >
                        <ha-icon icon="mdi:plus"></ha-icon>
                        Add Column
                      </button>
                      ${e.columns.length>1?Z`
                            <button
                              class="remove-column-btn"
                              @click=${()=>this._removeLastColumn(e.id)}
                              title="Remove Last Column"
                            >
                              <ha-icon icon="mdi:minus"></ha-icon>
                              Remove Column
                            </button>
                          `:Q}
                    </div>
                  </div>

                  ${e.columns.length>1?Z`
                        <div class="setting-row">
                          <label>Column Layout</label>
                          <select
                            .value=${e.column_layout||"auto"}
                            @change=${t=>this._updateRowLayout(e.id,t.target.value)}
                          >
                            ${this._getColumnLayoutOptions(e.columns.length).map((t=>Z`
                                <option
                                  value=${t.value}
                                  ?selected=${e.column_layout===t.value}
                                >
                                  ${t.label}
                                </option>
                              `))}
                          </select>
                        </div>
                      `:Q}

                  <div class="setting-row">
                    <label>Gap Between Columns</label>
                    <div class="gap-control">
                      <input
                        type="range"
                        min="0"
                        max="32"
                        step="4"
                        .value=${e.gap||8}
                        @input=${t=>this._updateRowGap(e.id,parseInt(t.target.value))}
                      />
                      <span class="gap-value">${e.gap||8}px</span>
                    </div>
                  </div>
                </div>
              </div>
            `:Q}
      </div>
    `}_renderColumn(e,t,i){const n=this._getColumnFractions(e.column_layout||"1-col")[i||0]||"Auto";return Z`
      <div
        class="column-container ${this._dragOverColumnId===t.id?"drag-over":""}"
        @dragover=${i=>this._onDragOver(i,e.id,t.id)}
        @drop=${i=>this._onDrop(i,e.id,t.id)}
        draggable="true"
        @dragstart=${e=>this._startColumnDrag(e,t)}
      >
        <!-- Column Header -->
        <div class="column-header">
          <div class="column-header-left">
            <span class="column-title">Column ${(i||0)+1}</span>
            <span class="column-fraction">${n}</span>
          </div>

          <div class="column-header-right">
            ${e.columns.length<6?Z`
                  <ha-icon-button
                    .path=${"M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"}
                    title="Add Column"
                    @click=${()=>this._addColumn(e.id)}
                    class="column-add-btn"
                  ></ha-icon-button>
                `:Q}
            <ha-icon-button
              .path=${"M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11.03L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11.03C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"}
              title="Column Settings (General/Logic/Design)"
              @click=${()=>this._openColumnDialog(t)}
              class="column-settings-btn"
            ></ha-icon-button>
            ${e.columns.length>1?Z`
                  <ha-icon-button
                    .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}
                    title="Delete Column"
                    @click=${()=>this._deleteColumn(e.id,t.id)}
                    class="column-delete-btn"
                  ></ha-icon-button>
                `:Q}
          </div>
        </div>

        <!-- Column Content -->
        <div class="column-content">
          ${this._showColumnSettings===t.id?Z`
                <div class="column-settings">
                  <div class="settings-section">
                    <h4>Column Settings</h4>

                    <div class="setting-row">
                      <label>Column Name</label>
                      <input
                        type="text"
                        .value=${t.name||""}
                        @input=${i=>this._updateColumnName(e.id,t.id,i.target.value)}
                        placeholder="Column name"
                      />
                    </div>

                    <div class="setting-row">
                      <label>Vertical Alignment</label>
                      <select
                        .value=${t.vertical_alignment||"top"}
                        @change=${i=>this._updateColumnAlignment(e.id,t.id,"vertical",i.target.value)}
                      >
                        <option value="top">Top</option>
                        <option value="center">Center</option>
                        <option value="bottom">Bottom</option>
                        <option value="stretch">Stretch</option>
                      </select>
                    </div>

                    <div class="setting-row">
                      <label>Horizontal Alignment</label>
                      <select
                        .value=${t.horizontal_alignment||"left"}
                        @change=${i=>this._updateColumnAlignment(e.id,t.id,"horizontal",i.target.value)}
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                        <option value="stretch">Stretch</option>
                      </select>
                    </div>
                  </div>
                </div>
              `:Q}
          ${0===t.modules.length?Z`
                <div
                  class="empty-column-content"
                  @click=${()=>this._openModuleSelector(e.id,t.id)}
                >
                  <ha-icon icon="mdi:plus"></ha-icon>
                  <span>Click to add content</span>
                </div>
              `:Z`
                <div class="column-modules">
                  ${t.modules.map((i=>Z`
                      <div
                        class="module-item"
                        draggable="true"
                        @dragstart=${e=>this._onDragStart(e,i)}
                        @click=${()=>this._openModuleDialog(i)}
                      >
                        <div class="module-icon">
                          <ha-icon icon=${this._getModuleIcon(i.type)}></ha-icon>
                        </div>
                        <div class="module-info">
                          <div class="module-title">${i.name}</div>
                          <div class="module-desc">${this._getElementTypeLabel(i.type)}</div>
                        </div>
                        <ha-icon-button
                          .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}
                          title="Delete Module"
                          @click=${n=>{n.stopPropagation(),this._deleteModule(e.id,t.id,i.id)}}
                          class="module-delete-btn"
                        ></ha-icon-button>
                      </div>
                    `))}
                </div>
              `}
        </div>
      </div>
    `}_updateColumnName(e,t,i){if(!this._currentLayout)return;const n=this._currentLayout.rows.findIndex((t=>t.id===e));if(-1===n)return;const a=this._currentLayout.rows[n],o=a.columns.findIndex((e=>e.id===t));if(-1===o)return;const r=Object.assign(Object.assign({},a.columns[o]),{name:i}),s=Object.assign(Object.assign({},a),{columns:[...a.columns.slice(0,o),r,...a.columns.slice(o+1)]});this._currentLayout=Object.assign(Object.assign({},this._currentLayout),{rows:[...this._currentLayout.rows.slice(0,n),s,...this._currentLayout.rows.slice(n+1)]}),this._updateConfig()}_updateColumnAlignment(e,t,i,n){if(!this._currentLayout)return;const a=this._currentLayout.rows.findIndex((t=>t.id===e));if(-1===a)return;const o=this._currentLayout.rows[a],r=o.columns.findIndex((e=>e.id===t));if(-1===r)return;const s=Object.assign(Object.assign({},o.columns[r]),{["vertical"===i?"vertical_alignment":"horizontal_alignment"]:n}),l=Object.assign(Object.assign({},o),{columns:[...o.columns.slice(0,r),s,...o.columns.slice(r+1)]});this._currentLayout=Object.assign(Object.assign({},this._currentLayout),{rows:[...this._currentLayout.rows.slice(0,a),l,...this._currentLayout.rows.slice(a+1)]}),this._updateConfig()}_getModuleIcon(e){return{text:"mdi:format-text",separator:"mdi:minus",horizontal:"mdi:view-sequential",vertical:"mdi:view-agenda",image:"mdi:image",info:"mdi:information",bar:"mdi:chart-bar",icon:"mdi:circle"}[e]||"mdi:help-circle"}_getElementTypeLabel(e){return{text:"Text Element",separator:"Separator Line",horizontal:"Horizontal Layout",vertical:"Vertical Layout",image:"Vehicle Images",info:"Info Entities",bar:"Progress Bars",icon:"Status Icons"}[e]||"Element"}_renderModulePreview(e){var t,i,n;switch(e.type){case"text":const a=e;return Z`<span
          >"${(null===(t=a.text)||void 0===t?void 0:t.substring(0,30))||"No text"}${a.text&&a.text.length>30?"...":""}"</span
        >`;case"separator":return Z`<span>Style: ${e.separator_style||"line"}</span>`;case"image":return Z`<span>Type: ${e.image_type||"none"}</span>`;case"info":return Z`<span>${(null===(i=e.info_entities)||void 0===i?void 0:i.length)||0} entities</span>`;case"bar":return Z`<span>Entity: ${e.entity||"not set"}</span>`;case"icon":return Z`<span>${(null===(n=e.icons)||void 0===n?void 0:n.length)||0} icons</span>`;default:return Z`<span>Unknown module</span>`}}_renderModuleSettings(e){return Z`
      <div class="dialog-tabs">
        <div class="tab-buttons">
          <button
            class="tab-button ${"general"===this._activeDialogTab?"active":""}"
            @click=${()=>this._setDialogTab("general")}
          >
            General
          </button>
          <button
            class="tab-button ${"logic"===this._activeDialogTab?"active":""}"
            @click=${()=>this._setDialogTab("logic")}
          >
            Logic
          </button>
          <button
            class="tab-button ${"design"===this._activeDialogTab?"active":""}"
            @click=${()=>this._setDialogTab("design")}
          >
            Design
          </button>
        </div>
        <div class="tab-content">
          ${"general"===this._activeDialogTab?this._renderGeneralSettings(e):""}
          ${"logic"===this._activeDialogTab?this._renderLogicSettings(e):""}
          ${"design"===this._activeDialogTab?this._renderDesignSettings(e):""}
        </div>
      </div>
    `}_renderGeneralSettings(e){var t,i;switch(e.type){case"text":return Z`
          <div class="setting-row">
            <label>Text Content</label>
            <textarea
              .value=${e.text||""}
              @input=${t=>this._updateModuleProperty(e.id,"text",t.target.value)}
              placeholder="Enter your text here"
              rows="3"
            ></textarea>
          </div>
        `;case"separator":const n=e;return Z`
          <div class="setting-row">
            <label>Style</label>
            <select
              .value=${n.separator_style||"line"}
              @change=${t=>this._updateModuleProperty(e.id,"separator_style",t.target.value)}
            >
              <option value="line">Line</option>
              <option value="double_line">Double Line</option>
              <option value="dotted">Dotted</option>
              <option value="double_dotted">Double Dotted</option>
              <option value="shadow">Shadow</option>
              <option value="blank">Blank</option>
            </select>
          </div>
          <div class="setting-row">
            <label>Thickness</label>
            <input
              type="number"
              .value=${n.thickness||1}
              @input=${t=>this._updateModuleProperty(e.id,"thickness",parseInt(t.target.value))}
              min="1"
              max="10"
            />
          </div>
        `;case"horizontal":const a=e;return Z`
          <div class="setting-row">
            <label>Horizontal Alignment</label>
            <div class="alignment-buttons">
              <button
                class="alignment-btn ${"left"===a.horizontal_alignment?"active":""}"
                @click=${()=>this._updateModuleProperty(e.id,"horizontal_alignment","left")}
              >
                <ha-icon icon="mdi:format-align-left"></ha-icon>
              </button>
              <button
                class="alignment-btn ${"center"===a.horizontal_alignment?"active":""}"
                @click=${()=>this._updateModuleProperty(e.id,"horizontal_alignment","center")}
              >
                <ha-icon icon="mdi:format-align-center"></ha-icon>
              </button>
              <button
                class="alignment-btn ${"right"===a.horizontal_alignment?"active":""}"
                @click=${()=>this._updateModuleProperty(e.id,"horizontal_alignment","right")}
              >
                <ha-icon icon="mdi:format-align-right"></ha-icon>
              </button>
              <button
                class="alignment-btn ${"justify"===a.horizontal_alignment?"active":""}"
                @click=${()=>this._updateModuleProperty(e.id,"horizontal_alignment","justify")}
              >
                <ha-icon icon="mdi:format-align-justify"></ha-icon>
              </button>
            </div>
          </div>
          <div class="setting-row">
            <label>Vertical Alignment</label>
            <select
              .value=${a.vertical_alignment||"center"}
              @change=${t=>this._updateModuleProperty(e.id,"vertical_alignment",t.target.value)}
            >
              <option value="top">Top</option>
              <option value="center">Center</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          <div class="setting-row">
            <label>Gap between Items</label>
            <div class="gap-control">
              <select
                .value=${a.gap||"1.2rem"}
                @change=${t=>this._updateModuleProperty(e.id,"gap",t.target.value)}
              >
                <option value="0">0</option>
                <option value="0.2rem">0.2rem</option>
                <option value="0.4rem">0.4rem</option>
                <option value="0.6rem">0.6rem</option>
                <option value="0.8rem">0.8rem</option>
                <option value="1rem">1rem</option>
                <option value="1.2rem">1.2rem</option>
                <option value="1.5rem">1.5rem</option>
                <option value="2rem">2rem</option>
              </select>
            </div>
          </div>
          <div class="setting-row">
            <label>Allow move items to next line</label>
            <input
              type="checkbox"
              .checked=${a.allow_wrap||!1}
              @change=${t=>this._updateModuleProperty(e.id,"allow_wrap",t.target.checked)}
            />
          </div>
          <div class="setting-row">
            <label>Show items in one column on mobiles</label>
            <input
              type="checkbox"
              .checked=${a.mobile_single_column||!1}
              @change=${t=>this._updateModuleProperty(e.id,"mobile_single_column",t.target.checked)}
            />
          </div>
        `;case"vertical":const o=e;return Z`
          <div class="setting-row">
            <label>Horizontal Alignment</label>
            <div class="alignment-buttons">
              <button
                class="alignment-btn ${"left"===o.horizontal_alignment?"active":""}"
                @click=${()=>this._updateModuleProperty(e.id,"horizontal_alignment","left")}
              >
                <ha-icon icon="mdi:format-align-left"></ha-icon>
              </button>
              <button
                class="alignment-btn ${"center"===o.horizontal_alignment?"active":""}"
                @click=${()=>this._updateModuleProperty(e.id,"horizontal_alignment","center")}
              >
                <ha-icon icon="mdi:format-align-center"></ha-icon>
              </button>
              <button
                class="alignment-btn ${"right"===o.horizontal_alignment?"active":""}"
                @click=${()=>this._updateModuleProperty(e.id,"horizontal_alignment","right")}
              >
                <ha-icon icon="mdi:format-align-right"></ha-icon>
              </button>
            </div>
          </div>
          <div class="setting-row">
            <label>Gap between Items</label>
            <div class="gap-control">
              <select
                .value=${o.gap||"0.8rem"}
                @change=${t=>this._updateModuleProperty(e.id,"gap",t.target.value)}
              >
                <option value="0">0</option>
                <option value="0.2rem">0.2rem</option>
                <option value="0.4rem">0.4rem</option>
                <option value="0.6rem">0.6rem</option>
                <option value="0.8rem">0.8rem</option>
                <option value="1rem">1rem</option>
                <option value="1.2rem">1.2rem</option>
                <option value="1.5rem">1.5rem</option>
                <option value="2rem">2rem</option>
              </select>
            </div>
          </div>
        `;case"image":const r=e;return Z`
          <div class="setting-row">
            <label>Image Type</label>
            <select
              .value=${r.image_type||"default"}
              @change=${t=>this._updateModuleProperty(e.id,"image_type",t.target.value)}
            >
              <option value="default">Default</option>
              <option value="none">None</option>
              <option value="status">Status</option>
              <option value="battery">Battery</option>
              <option value="fuel">Fuel</option>
              <option value="engine">Engine</option>
              <option value="location">Location</option>
              <option value="range">Range</option>
              <option value="mileage">Mileage</option>
            </select>
          </div>
          <div class="setting-row">
            <label>Image Width (%)</label>
            <input
              type="number"
              .value=${r.image_width||100}
              @input=${t=>this._updateModuleProperty(e.id,"image_width",parseInt(t.target.value))}
              min="10"
              max="100"
            />
          </div>
          <div class="setting-row">
            <label>Priority</label>
            <input
              type="number"
              .value=${r.priority||0}
              @input=${t=>this._updateModuleProperty(e.id,"priority",parseInt(t.target.value))}
              min="0"
              max="10"
            />
          </div>
        `;case"info":const s=null===(t=e.info_entities)||void 0===t?void 0:t[0];return Z`
          <div class="setting-row">
            <label>Entity</label>
            <input
              type="text"
              .value=${(null==s?void 0:s.entity)||""}
              @input=${t=>this._updateInfoEntityProperty(e.id,0,"entity",t.target.value)}
              placeholder="sensor.example"
            />
          </div>
          <div class="setting-row">
            <label>Name</label>
            <input
              type="text"
              .value=${(null==s?void 0:s.name)||""}
              @input=${t=>this._updateInfoEntityProperty(e.id,0,"name",t.target.value)}
              placeholder="Custom name"
            />
          </div>
          <div class="setting-row">
            <label>Icon</label>
            <input
              type="text"
              .value=${(null==s?void 0:s.icon)||""}
              @input=${t=>this._updateInfoEntityProperty(e.id,0,"icon",t.target.value)}
              placeholder="mdi:car"
            />
          </div>
          <div class="setting-row">
            <label>Show Icon</label>
            <input
              type="checkbox"
              .checked=${!1!==(null==s?void 0:s.show_icon)}
              @change=${t=>this._updateInfoEntityProperty(e.id,0,"show_icon",t.target.checked)}
            />
          </div>
          <div class="setting-row">
            <label>Show Name</label>
            <input
              type="checkbox"
              .checked=${(null==s?void 0:s.show_name)||!1}
              @change=${t=>this._updateInfoEntityProperty(e.id,0,"show_name",t.target.checked)}
            />
          </div>
          <div class="setting-row">
            <label>Text Size</label>
            <input
              type="number"
              .value=${(null==s?void 0:s.text_size)||14}
              @input=${t=>this._updateInfoEntityProperty(e.id,0,"text_size",parseInt(t.target.value))}
              min="8"
              max="48"
            />
          </div>
          <div class="setting-row">
            <label>Icon Size</label>
            <input
              type="number"
              .value=${(null==s?void 0:s.icon_size)||24}
              @input=${t=>this._updateInfoEntityProperty(e.id,0,"icon_size",parseInt(t.target.value))}
              min="12"
              max="48"
            />
          </div>
          <div class="setting-row">
            <label>Click Action</label>
            <select
              .value=${(null==s?void 0:s.on_click_action)||"more-info"}
              @change=${t=>this._updateInfoEntityProperty(e.id,0,"on_click_action",t.target.value)}
            >
              <option value="more-info">More Info</option>
              <option value="toggle">Toggle</option>
              <option value="navigate">Navigate</option>
              <option value="url">URL</option>
              <option value="service">Service</option>
              <option value="none">None</option>
            </select>
          </div>
          <div class="setting-row">
            <label>Dynamic Icon Template</label>
            <input
              type="checkbox"
              .checked=${(null==s?void 0:s.dynamic_icon_template_mode)||!1}
              @change=${t=>this._updateInfoEntityProperty(e.id,0,"dynamic_icon_template_mode",t.target.checked)}
            />
          </div>
          ${(null==s?void 0:s.dynamic_icon_template_mode)?Z`
                <div class="setting-row">
                  <label>Icon Template</label>
                  <textarea
                    .value=${(null==s?void 0:s.dynamic_icon_template)||""}
                    @input=${t=>this._updateInfoEntityProperty(e.id,0,"dynamic_icon_template",t.target.value)}
                    placeholder="{% if states('sensor.example') == 'on' %}mdi:car{% else %}mdi:car-off{% endif %}"
                    rows="3"
                  ></textarea>
                </div>
              `:""}
          <div class="setting-row">
            <label>Dynamic Color Template</label>
            <input
              type="checkbox"
              .checked=${(null==s?void 0:s.dynamic_color_template_mode)||!1}
              @change=${t=>this._updateInfoEntityProperty(e.id,0,"dynamic_color_template_mode",t.target.checked)}
            />
          </div>
          ${(null==s?void 0:s.dynamic_color_template_mode)?Z`
                <div class="setting-row">
                  <label>Color Template</label>
                  <textarea
                    .value=${(null==s?void 0:s.dynamic_color_template)||""}
                    @input=${t=>this._updateInfoEntityProperty(e.id,0,"dynamic_color_template",t.target.value)}
                    placeholder="{% if states('sensor.example') == 'on' %}green{% else %}red{% endif %}"
                    rows="3"
                  ></textarea>
                </div>
              `:""}
        `;case"icon":const l=null===(i=e.icons)||void 0===i?void 0:i[0];return Z`
          <div class="setting-row">
            <label>Entity</label>
            <input
              type="text"
              .value=${(null==l?void 0:l.entity)||""}
              @input=${t=>this._updateIconProperty(e.id,0,"entity",t.target.value)}
              placeholder="sensor.example"
            />
          </div>
          <div class="setting-row">
            <label>Inactive Icon</label>
            <input
              type="text"
              .value=${(null==l?void 0:l.icon_inactive)||""}
              @input=${t=>this._updateIconProperty(e.id,0,"icon_inactive",t.target.value)}
              placeholder="mdi:circle"
            />
          </div>
          <div class="setting-row">
            <label>Active Icon</label>
            <input
              type="text"
              .value=${(null==l?void 0:l.icon_active)||""}
              @input=${t=>this._updateIconProperty(e.id,0,"icon_active",t.target.value)}
              placeholder="mdi:circle"
            />
          </div>
          <div class="setting-row">
            <label>Inactive Color</label>
            <input
              type="text"
              .value=${(null==l?void 0:l.color_inactive)||""}
              @input=${t=>this._updateIconProperty(e.id,0,"color_inactive",t.target.value)}
              placeholder="var(--secondary-text-color)"
            />
          </div>
          <div class="setting-row">
            <label>Active Color</label>
            <input
              type="text"
              .value=${(null==l?void 0:l.color_active)||""}
              @input=${t=>this._updateIconProperty(e.id,0,"color_active",t.target.value)}
              placeholder="var(--primary-color)"
            />
          </div>
          <div class="setting-row">
            <label>Inactive State</label>
            <input
              type="text"
              .value=${(null==l?void 0:l.inactive_state)||""}
              @input=${t=>this._updateIconProperty(e.id,0,"inactive_state",t.target.value)}
              placeholder="off"
            />
          </div>
          <div class="setting-row">
            <label>Active State</label>
            <input
              type="text"
              .value=${(null==l?void 0:l.active_state)||""}
              @input=${t=>this._updateIconProperty(e.id,0,"active_state",t.target.value)}
              placeholder="on"
            />
          </div>
          <div class="setting-row">
            <label>Show State</label>
            <input
              type="checkbox"
              .checked=${!1!==(null==l?void 0:l.show_state)}
              @change=${t=>this._updateIconProperty(e.id,0,"show_state",t.target.checked)}
            />
          </div>
          <div class="setting-row">
            <label>Show Name</label>
            <input
              type="checkbox"
              .checked=${(null==l?void 0:l.show_name)||!1}
              @change=${t=>this._updateIconProperty(e.id,0,"show_name",t.target.checked)}
            />
          </div>
          <div class="setting-row">
            <label>Icon Size</label>
            <input
              type="number"
              .value=${(null==l?void 0:l.icon_size)||24}
              @input=${t=>this._updateIconProperty(e.id,0,"icon_size",parseInt(t.target.value))}
              min="12"
              max="48"
            />
          </div>
          <div class="setting-row">
            <label>Text Size</label>
            <input
              type="number"
              .value=${(null==l?void 0:l.text_size)||14}
              @input=${t=>this._updateIconProperty(e.id,0,"text_size",parseInt(t.target.value))}
              min="8"
              max="48"
            />
          </div>
          <div class="setting-row">
            <label>Click Action</label>
            <select
              .value=${(null==l?void 0:l.single_click_action)||"more-info"}
              @change=${t=>this._updateIconProperty(e.id,0,"single_click_action",t.target.value)}
            >
              <option value="more-info">More Info</option>
              <option value="toggle">Toggle</option>
              <option value="navigate">Navigate</option>
              <option value="url">URL</option>
              <option value="service">Service</option>
              <option value="none">None</option>
            </select>
          </div>
          <div class="setting-row">
            <label>Dynamic Icon Template</label>
            <input
              type="checkbox"
              .checked=${(null==l?void 0:l.dynamic_icon_template_mode)||!1}
              @change=${t=>this._updateIconProperty(e.id,0,"dynamic_icon_template_mode",t.target.checked)}
            />
          </div>
          ${(null==l?void 0:l.dynamic_icon_template_mode)?Z`
                <div class="setting-row">
                  <label>Icon Template</label>
                  <textarea
                    .value=${(null==l?void 0:l.dynamic_icon_template)||""}
                    @input=${t=>this._updateIconProperty(e.id,0,"dynamic_icon_template",t.target.value)}
                    placeholder="{% if states('sensor.example') == 'on' %}mdi:car{% else %}mdi:car-off{% endif %}"
                    rows="3"
                  ></textarea>
                </div>
              `:""}
          <div class="setting-row">
            <label>Dynamic Color Template</label>
            <input
              type="checkbox"
              .checked=${(null==l?void 0:l.dynamic_color_template_mode)||!1}
              @change=${t=>this._updateIconProperty(e.id,0,"dynamic_color_template_mode",t.target.checked)}
            />
          </div>
          ${(null==l?void 0:l.dynamic_color_template_mode)?Z`
                <div class="setting-row">
                  <label>Color Template</label>
                  <textarea
                    .value=${(null==l?void 0:l.dynamic_color_template)||""}
                    @input=${t=>this._updateIconProperty(e.id,0,"dynamic_color_template",t.target.value)}
                    placeholder="{% if states('sensor.example') == 'on' %}green{% else %}red{% endif %}"
                    rows="3"
                  ></textarea>
                </div>
              `:""}
        `;case"bar":const d=e;return Z`
          <div class="setting-row">
            <label>Entity</label>
            <input
              type="text"
              .value=${d.entity||""}
              @input=${t=>this._updateModuleProperty(e.id,"entity",t.target.value)}
              placeholder="sensor.example"
            />
          </div>
          <div class="setting-row">
            <label>Name</label>
            <input
              type="text"
              .value=${d.name||""}
              @input=${t=>this._updateModuleProperty(e.id,"name",t.target.value)}
              placeholder="Custom name"
            />
          </div>
          <div class="setting-row">
            <label>Show Percentage</label>
            <input
              type="checkbox"
              .checked=${!1!==d.show_percentage}
              @change=${t=>this._updateModuleProperty(e.id,"show_percentage",t.target.checked)}
            />
          </div>
          <div class="setting-row">
            <label>Bar Color</label>
            <input
              type="text"
              .value=${d.color||""}
              @input=${t=>this._updateModuleProperty(e.id,"color",t.target.value)}
              placeholder="var(--primary-color)"
            />
          </div>
          <div class="setting-row">
            <label>Background Color</label>
            <input
              type="text"
              .value=${d.background_color||""}
              @input=${t=>this._updateModuleProperty(e.id,"background_color",t.target.value)}
              placeholder="var(--secondary-background-color)"
            />
          </div>
          <div class="setting-row">
            <label>Height (px)</label>
            <input
              type="number"
              .value=${d.height||20}
              @input=${t=>this._updateModuleProperty(e.id,"height",parseInt(t.target.value))}
              min="10"
              max="100"
            />
          </div>
        `;default:return Z`<p>Settings for ${e.type} modules coming soon!</p>`}}_renderLogicSettings(e){const t=e.display_conditions||[],i=e.display_mode||"always";return Z`
      <div class="logic-settings">
        <div class="setting-group">
          <h4>Display this Element</h4>
          <div class="setting-row">
            <select
              .value=${i}
              @change=${t=>this._updateModuleProperty(e.id,"display_mode",t.target.value)}
              class="display-mode-select"
            >
              <option value="always">Always</option>
              <option value="every">If EVERY condition below is met</option>
              <option value="any">If ANY condition below is met</option>
            </select>
          </div>
        </div>

        ${"always"!==i?Z`
              <div class="setting-group">
                <div class="conditions-header">
                  <h4>Conditions</h4>
                  <button class="add-condition-btn" @click=${()=>this._addCondition(e.id)}>
                    <ha-icon icon="mdi:plus"></ha-icon>
                    Add Condition
                  </button>
                </div>

                <div class="conditions-list">
                  ${0===t.length?Z`
                        <div class="no-conditions">
                          <p>No conditions added yet. Click "Add Condition" to get started.</p>
                        </div>
                      `:t.map(((t,i)=>this._renderCondition(e.id,t,i)))}
                </div>
              </div>
            `:Q}
      </div>
    `}_renderCondition(e,t,i){return Z`
      <div class="condition-row">
        <div class="condition-header">
          <select
            .value=${t.type||"entity_state"}
            @change=${t=>this._updateCondition(e,i,"type",t.target.value)}
            class="condition-type-select"
          >
            <option value="entity_state">Entity State</option>
            <option value="template">Template</option>
            <option value="time">Time Range</option>
            <option value="date">Date Range</option>
            <option value="numeric_state">Numeric State</option>
            <option value="device_tracker">Device Tracker</option>
          </select>
          <button
            class="remove-condition-btn"
            @click=${()=>this._removeCondition(e,i)}
            title="Remove condition"
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>

        <div class="condition-content">
          ${this._renderConditionContent(e,t,i)}
        </div>
      </div>
    `}_renderConditionContent(e,t,i){switch(t.type){case"entity_state":return Z`
          <div class="condition-fields">
            <div class="field-row">
              <label>Entity</label>
              <input
                type="text"
                .value=${t.entity||""}
                @input=${t=>this._updateCondition(e,i,"entity",t.target.value)}
                placeholder="sensor.example"
              />
            </div>
            <div class="field-row">
              <label>Operator</label>
              <select
                .value=${t.operator||"equals"}
                @change=${t=>this._updateCondition(e,i,"operator",t.target.value)}
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="contains">Contains</option>
                <option value="not_contains">Does Not Contain</option>
              </select>
            </div>
            <div class="field-row">
              <label>State</label>
              <input
                type="text"
                .value=${t.state||""}
                @input=${t=>this._updateCondition(e,i,"state",t.target.value)}
                placeholder="on, off, home, etc."
              />
            </div>
          </div>
        `;case"template":return Z`
          <div class="condition-fields">
            <div class="field-row full-width">
              <label>Template (must return true/false)</label>
              <textarea
                .value=${t.template||""}
                @input=${t=>this._updateCondition(e,i,"template",t.target.value)}
                placeholder="{{ states('sensor.example') == 'on' }}"
                rows="3"
              ></textarea>
              <div class="help-text">Use Jinja2 template that evaluates to true or false</div>
            </div>
          </div>
        `;case"time":return Z`
          <div class="condition-fields">
            <div class="field-row">
              <label>From Time</label>
              <input
                type="time"
                .value=${t.time_from||""}
                @input=${t=>this._updateCondition(e,i,"time_from",t.target.value)}
              />
            </div>
            <div class="field-row">
              <label>To Time</label>
              <input
                type="time"
                .value=${t.time_to||""}
                @input=${t=>this._updateCondition(e,i,"time_to",t.target.value)}
              />
            </div>
          </div>
        `;case"numeric_state":return Z`
          <div class="condition-fields">
            <div class="field-row">
              <label>Entity</label>
              <input
                type="text"
                .value=${t.entity||""}
                @input=${t=>this._updateCondition(e,i,"entity",t.target.value)}
                placeholder="sensor.temperature"
              />
            </div>
            <div class="field-row">
              <label>Operator</label>
              <select
                .value=${t.operator||"greater_than"}
                @change=${t=>this._updateCondition(e,i,"operator",t.target.value)}
              >
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
                <option value="equals">Equals</option>
                <option value="greater_equal">Greater or Equal</option>
                <option value="less_equal">Less or Equal</option>
              </select>
            </div>
            <div class="field-row">
              <label>Value</label>
              <input
                type="number"
                .value=${t.value||""}
                @input=${t=>this._updateCondition(e,i,"value",parseFloat(t.target.value)||0)}
                placeholder="20"
              />
            </div>
          </div>
        `;case"device_tracker":return Z`
          <div class="condition-fields">
            <div class="field-row">
              <label>Device Tracker Entity</label>
              <input
                type="text"
                .value=${t.entity||""}
                @input=${t=>this._updateCondition(e,i,"entity",t.target.value)}
                placeholder="device_tracker.phone"
              />
            </div>
            <div class="field-row">
              <label>Zone/Location</label>
              <input
                type="text"
                .value=${t.state||""}
                @input=${t=>this._updateCondition(e,i,"state",t.target.value)}
                placeholder="home, work, not_home"
              />
            </div>
          </div>
        `;default:return Z`<p>Configure this condition type...</p>`}}_addCondition(e){const t=this._getCurrentModule(e);if(!t)return;const i=t.display_conditions||[],n={id:`condition_${Date.now()}`,type:"entity_state",entity:"",state:"",operator:"equals"};this._updateModuleProperty(e,"display_conditions",[...i,n])}_removeCondition(e,t){const i=this._getCurrentModule(e);if(!i)return;const n=(i.display_conditions||[]).filter(((e,i)=>i!==t));this._updateModuleProperty(e,"display_conditions",n)}_updateCondition(e,t,i,n){const a=this._getCurrentModule(e);if(!a)return;const o=a.display_conditions||[];if(t<0||t>=o.length)return;const r=[...o];r[t]="type"===i?{id:r[t].id,type:n}:Object.assign(Object.assign({},r[t]),{[i]:n}),this._updateModuleProperty(e,"display_conditions",r)}_renderColumnLogicSettings(e){const t=e.display_conditions||[],i=e.display_mode||"always";return Z`
      <div class="logic-settings">
        <div class="setting-group">
          <h4>Display this Column</h4>
          <div class="setting-row">
            <select
              .value=${i}
              @change=${e=>this._updateCurrentColumnProperty("display_mode",e.target.value)}
              class="display-mode-select"
            >
              <option value="always">Always</option>
              <option value="every">If EVERY condition below is met</option>
              <option value="any">If ANY condition below is met</option>
            </select>
          </div>
        </div>

        ${"always"!==i?Z`
              <div class="setting-group">
                <div class="conditions-header">
                  <h4>Conditions</h4>
                  <button
                    class="add-condition-btn"
                    @click=${()=>this._addColumnCondition(e.id)}
                  >
                    <ha-icon icon="mdi:plus"></ha-icon>
                    Add Condition
                  </button>
                </div>

                <div class="conditions-list">
                  ${0===t.length?Z`
                        <div class="no-conditions">
                          <p>No conditions added yet. Click "Add Condition" to get started.</p>
                        </div>
                      `:t.map(((t,i)=>this._renderColumnCondition(e.id,t,i)))}
                </div>
              </div>
            `:Q}
      </div>
    `}_renderColumnCondition(e,t,i){return Z`
      <div class="condition-row">
        <div class="condition-header">
          <select
            .value=${t.type||"entity_state"}
            @change=${t=>this._updateColumnCondition(e,i,"type",t.target.value)}
            class="condition-type-select"
          >
            <option value="entity_state">Entity State</option>
            <option value="template">Template</option>
            <option value="time">Time Range</option>
            <option value="date">Date Range</option>
            <option value="numeric_state">Numeric State</option>
            <option value="device_tracker">Device Tracker</option>
          </select>
          <button
            class="remove-condition-btn"
            @click=${()=>this._removeColumnCondition(e,i)}
            title="Remove condition"
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>

        <div class="condition-content">
          ${this._renderColumnConditionContent(e,t,i)}
        </div>
      </div>
    `}_renderColumnConditionContent(e,t,i){switch(t.type){case"entity_state":return Z`
          <div class="condition-fields">
            <div class="field-row">
              <label>Entity</label>
              <input
                type="text"
                .value=${t.entity||""}
                @input=${t=>this._updateColumnCondition(e,i,"entity",t.target.value)}
                placeholder="sensor.example"
              />
            </div>
            <div class="field-row">
              <label>Operator</label>
              <select
                .value=${t.operator||"equals"}
                @change=${t=>this._updateColumnCondition(e,i,"operator",t.target.value)}
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="contains">Contains</option>
                <option value="not_contains">Does Not Contain</option>
              </select>
            </div>
            <div class="field-row">
              <label>State</label>
              <input
                type="text"
                .value=${t.state||""}
                @input=${t=>this._updateColumnCondition(e,i,"state",t.target.value)}
                placeholder="on, off, home, etc."
              />
            </div>
          </div>
        `;case"template":return Z`
          <div class="condition-fields">
            <div class="field-row full-width">
              <label>Template (must return true/false)</label>
              <textarea
                .value=${t.template||""}
                @input=${t=>this._updateColumnCondition(e,i,"template",t.target.value)}
                placeholder="{{ states('sensor.example') == 'on' }}"
                rows="3"
              ></textarea>
              <div class="help-text">Use Jinja2 template that evaluates to true or false</div>
            </div>
          </div>
        `;case"time":return Z`
          <div class="condition-fields">
            <div class="field-row">
              <label>From Time</label>
              <input
                type="time"
                .value=${t.time_from||""}
                @input=${t=>this._updateColumnCondition(e,i,"time_from",t.target.value)}
              />
            </div>
            <div class="field-row">
              <label>To Time</label>
              <input
                type="time"
                .value=${t.time_to||""}
                @input=${t=>this._updateColumnCondition(e,i,"time_to",t.target.value)}
              />
            </div>
          </div>
        `;case"numeric_state":return Z`
          <div class="condition-fields">
            <div class="field-row">
              <label>Entity</label>
              <input
                type="text"
                .value=${t.entity||""}
                @input=${t=>this._updateColumnCondition(e,i,"entity",t.target.value)}
                placeholder="sensor.temperature"
              />
            </div>
            <div class="field-row">
              <label>Operator</label>
              <select
                .value=${t.operator||"greater_than"}
                @change=${t=>this._updateColumnCondition(e,i,"operator",t.target.value)}
              >
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
                <option value="equals">Equals</option>
                <option value="greater_equal">Greater or Equal</option>
                <option value="less_equal">Less or Equal</option>
              </select>
            </div>
            <div class="field-row">
              <label>Value</label>
              <input
                type="number"
                .value=${t.value||""}
                @input=${t=>this._updateColumnCondition(e,i,"value",parseFloat(t.target.value)||0)}
                placeholder="20"
              />
            </div>
          </div>
        `;case"device_tracker":return Z`
          <div class="condition-fields">
            <div class="field-row">
              <label>Device Tracker Entity</label>
              <input
                type="text"
                .value=${t.entity||""}
                @input=${t=>this._updateColumnCondition(e,i,"entity",t.target.value)}
                placeholder="device_tracker.phone"
              />
            </div>
            <div class="field-row">
              <label>Zone/Location</label>
              <input
                type="text"
                .value=${t.state||""}
                @input=${t=>this._updateColumnCondition(e,i,"state",t.target.value)}
                placeholder="home, work, not_home"
              />
            </div>
          </div>
        `;default:return Z`<p>Configure this condition type...</p>`}}_addColumnCondition(e){var t;const i=(null===(t=this._currentEditingColumn)||void 0===t?void 0:t.display_conditions)||[],n={id:`condition_${Date.now()}`,type:"entity_state",entity:"",state:"",operator:"equals"};this._updateCurrentColumnProperty("display_conditions",[...i,n])}_removeColumnCondition(e,t){var i;const n=((null===(i=this._currentEditingColumn)||void 0===i?void 0:i.display_conditions)||[]).filter(((e,i)=>i!==t));this._updateCurrentColumnProperty("display_conditions",n)}_updateColumnCondition(e,t,i,n){var a;const o=(null===(a=this._currentEditingColumn)||void 0===a?void 0:a.display_conditions)||[];if(t<0||t>=o.length)return;const r=[...o];r[t]="type"===i?{id:r[t].id,type:n}:Object.assign(Object.assign({},r[t]),{[i]:n}),this._updateCurrentColumnProperty("display_conditions",r)}_renderDesignSettings(e){const t=this._activeModuleSettingsTab[`${e.id}_design`]||"text";return Z`
      <div class="design-sub-tabs">
        <div class="design-tab-buttons">
          <button
            class="design-tab-btn ${"text"===t?"active":""}"
            @click=${()=>this._setModuleSettingsTab(`${e.id}_design`,"text")}
          >
            Text
          </button>
          <button
            class="design-tab-btn ${"background"===t?"active":""}"
            @click=${()=>this._setModuleSettingsTab(`${e.id}_design`,"background")}
          >
            Background
          </button>
          <button
            class="design-tab-btn ${"spacing"===t?"active":""}"
            @click=${()=>this._setModuleSettingsTab(`${e.id}_design`,"spacing")}
          >
            Spacing
          </button>
          <button
            class="design-tab-btn ${"border"===t?"active":""}"
            @click=${()=>this._setModuleSettingsTab(`${e.id}_design`,"border")}
          >
            Border
          </button>
        </div>
        <div class="design-tab-content">
          ${"text"===t?this._renderTextDesign(e):""}
          ${"background"===t?this._renderBackgroundDesign(e):""}
          ${"spacing"===t?this._renderSpacingDesign(e):""}
          ${"border"===t?this._renderBorderDesign(e):""}
        </div>
      </div>
    `}_renderTextDesign(e){return Z`
      <div class="setting-row">
        <label>Text Color</label>
        <input
          type="text"
          .value=${e.text_color||""}
          @input=${t=>this._updateModuleProperty(e.id,"text_color",t.target.value)}
          placeholder="var(--primary-text-color)"
        />
      </div>
      <div class="setting-row">
        <label>Font Size</label>
        <input
          type="number"
          .value=${e.font_size||16}
          @input=${t=>this._updateModuleProperty(e.id,"font_size",parseInt(t.target.value))}
          min="8"
          max="72"
        />
      </div>
      <div class="setting-row">
        <label>Font Family</label>
        <input
          type="text"
          .value=${e.font_family||""}
          @input=${t=>this._updateModuleProperty(e.id,"font_family",t.target.value)}
          placeholder="Roboto, sans-serif"
        />
      </div>
      <div class="setting-row">
        <label>Font Weight</label>
        <select
          .value=${e.font_weight||"normal"}
          @change=${t=>this._updateModuleProperty(e.id,"font_weight",t.target.value)}
        >
          <option value="100">100 (Thin)</option>
          <option value="200">200 (Extra Light)</option>
          <option value="300">300 (Light)</option>
          <option value="400">400 (Normal)</option>
          <option value="500">500 (Medium)</option>
          <option value="600">600 (Semi Bold)</option>
          <option value="700">700 (Bold)</option>
          <option value="800">800 (Extra Bold)</option>
          <option value="900">900 (Black)</option>
        </select>
      </div>
      <div class="setting-row">
        <label>Text Align</label>
        <div class="alignment-buttons">
          <button
            class="alignment-btn ${"left"===e.text_align?"active":""}"
            @click=${()=>this._updateModuleProperty(e.id,"text_align","left")}
          >
            <ha-icon icon="mdi:format-align-left"></ha-icon>
          </button>
          <button
            class="alignment-btn ${"center"===e.text_align?"active":""}"
            @click=${()=>this._updateModuleProperty(e.id,"text_align","center")}
          >
            <ha-icon icon="mdi:format-align-center"></ha-icon>
          </button>
          <button
            class="alignment-btn ${"right"===e.text_align?"active":""}"
            @click=${()=>this._updateModuleProperty(e.id,"text_align","right")}
          >
            <ha-icon icon="mdi:format-align-right"></ha-icon>
          </button>
        </div>
      </div>
    `}_renderBackgroundDesign(e){return Z`
      <div class="setting-row">
        <label>Background Color</label>
        <input
          type="text"
          .value=${e.background_color||""}
          @input=${t=>this._updateModuleProperty(e.id,"background_color",t.target.value)}
          placeholder="transparent"
        />
      </div>
      <div class="setting-row">
        <label>Background Image</label>
        <input
          type="text"
          .value=${e.background_image||""}
          @input=${t=>this._updateModuleProperty(e.id,"background_image",t.target.value)}
          placeholder="url(image.jpg)"
        />
      </div>
      <div class="setting-row">
        <label>Background Size</label>
        <select
          .value=${e.background_size||"cover"}
          @change=${t=>this._updateModuleProperty(e.id,"background_size",t.target.value)}
        >
          <option value="auto">Auto</option>
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="100%">100%</option>
        </select>
      </div>
      <div class="setting-row">
        <label>Background Position</label>
        <select
          .value=${e.background_position||"center"}
          @change=${t=>this._updateModuleProperty(e.id,"background_position",t.target.value)}
        >
          <option value="center">Center</option>
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>
    `}_renderSpacingDesign(e){var t,i;const n=null===(t=e.margin_linked)||void 0===t||t,a=null===(i=e.padding_linked)||void 0===i||i;return Z`
      <div class="spacing-section">
        <div class="spacing-header">
          <h4>Spacing</h4>
          <div class="spacing-actions">
            <ha-icon-button
              .path=${"M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"}
              title="Copy spacing values"
              @click=${()=>this._copySpacingValues(e.id)}
              class="action-button"
            ></ha-icon-button>
            <ha-icon-button
              .path=${"M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12M22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12Z"}
              title="Reset spacing values"
              @click=${()=>this._resetSpacingValues(e.id)}
              class="action-button"
            ></ha-icon-button>
          </div>
        </div>

        <div class="margin-section">
          <div class="spacing-label">
            <label>Margin</label>
            <ha-icon-button
              .path=${n?"M5,3C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3H5M5,5H19V19H5V5M7,7V9H9V7H7M11,7V9H13V7H11M15,7V9H17V7H15M7,11V13H9V11H7M11,11V13H13V11H11M15,11V13H17V11H15M7,15V17H9V15H7M11,15V17H13V15H11M15,15V17H17V15H15Z":"M16.06,10.94L18.06,5.94C18.31,5.34 18.05,4.66 17.45,4.41L16.55,4.05C15.95,3.8 15.27,4.06 15.02,4.66L13.02,9.66L10.96,11.72L5.96,9.72C5.36,9.47 4.68,9.73 4.43,10.33L4.07,11.23C3.82,11.83 4.08,12.51 4.68,12.76L9.68,14.76L11.74,16.82L9.74,21.82C9.49,22.42 9.75,23.1 10.35,23.35L11.25,23.71C11.85,23.96 12.53,23.7 12.78,23.1L14.78,18.1L19.78,16.1C20.38,15.85 20.64,15.17 20.39,14.57L20.03,13.67C19.78,13.07 19.1,12.81 18.5,13.06L13.5,15.06L11.44,12.94L16.06,10.94Z"}
              title="${n?"Unlink values":"Link values"}"
              @click=${()=>this._toggleSpacingLink(e.id,"margin")}
              class="link-button ${n?"linked":""}"
            ></ha-icon-button>
          </div>
          <div class="spacing-grid">
            <div class="spacing-input-group">
              <label>Left</label>
              <input
                type="text"
                .value=${e.margin_left||""}
                @input=${t=>this._updateSpacing(e.id,"margin","left",t.target.value,n)}
                placeholder="0"
              />
            </div>
            <div class="spacing-input-group">
              <label>Top</label>
              <input
                type="text"
                .value=${e.margin_top||""}
                @input=${t=>this._updateSpacing(e.id,"margin","top",t.target.value,n)}
                placeholder="0"
              />
            </div>
            <div class="spacing-input-group">
              <label>Bottom</label>
              <input
                type="text"
                .value=${e.margin_bottom||""}
                @input=${t=>this._updateSpacing(e.id,"margin","bottom",t.target.value,n)}
                placeholder="0"
              />
            </div>
            <div class="spacing-input-group">
              <label>Right</label>
              <input
                type="text"
                .value=${e.margin_right||""}
                @input=${t=>this._updateSpacing(e.id,"margin","right",t.target.value,n)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div class="padding-section">
          <div class="spacing-label">
            <label>Padding</label>
            <ha-icon-button
              .path=${a?"M5,3C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3H5M5,5H19V19H5V5M7,7V9H9V7H7M11,7V9H13V7H11M15,7V9H17V7H15M7,11V13H9V11H7M11,11V13H13V11H11M15,11V13H17V11H15M7,15V17H9V15H7M11,15V17H13V15H11M15,15V17H17V15H15Z":"M16.06,10.94L18.06,5.94C18.31,5.34 18.05,4.66 17.45,4.41L16.55,4.05C15.95,3.8 15.27,4.06 15.02,4.66L13.02,9.66L10.96,11.72L5.96,9.72C5.36,9.47 4.68,9.73 4.43,10.33L4.07,11.23C3.82,11.83 4.08,12.51 4.68,12.76L9.68,14.76L11.74,16.82L9.74,21.82C9.49,22.42 9.75,23.1 10.35,23.35L11.25,23.71C11.85,23.96 12.53,23.7 12.78,23.1L14.78,18.1L19.78,16.1C20.38,15.85 20.64,15.17 20.39,14.57L20.03,13.67C19.78,13.07 19.1,12.81 18.5,13.06L13.5,15.06L11.44,12.94L16.06,10.94Z"}
              title="${a?"Unlink values":"Link values"}"
              @click=${()=>this._toggleSpacingLink(e.id,"padding")}
              class="link-button ${a?"linked":""}"
            ></ha-icon-button>
          </div>
          <div class="spacing-grid">
            <div class="spacing-input-group">
              <label>Left</label>
              <input
                type="text"
                .value=${e.padding_left||""}
                @input=${t=>this._updateSpacing(e.id,"padding","left",t.target.value,a)}
                placeholder="0"
              />
            </div>
            <div class="spacing-input-group">
              <label>Top</label>
              <input
                type="text"
                .value=${e.padding_top||""}
                @input=${t=>this._updateSpacing(e.id,"padding","top",t.target.value,a)}
                placeholder="0"
              />
            </div>
            <div class="spacing-input-group">
              <label>Bottom</label>
              <input
                type="text"
                .value=${e.padding_bottom||""}
                @input=${t=>this._updateSpacing(e.id,"padding","bottom",t.target.value,a)}
                placeholder="0"
              />
            </div>
            <div class="spacing-input-group">
              <label>Right</label>
              <input
                type="text"
                .value=${e.padding_right||""}
                @input=${t=>this._updateSpacing(e.id,"padding","right",t.target.value,a)}
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>
    `}_renderBorderDesign(e){return Z`
      <div class="setting-row">
        <label>Border Width</label>
        <input
          type="text"
          .value=${e.border_width||""}
          @input=${t=>this._updateModuleProperty(e.id,"border_width",t.target.value)}
          placeholder="1px"
        />
      </div>
      <div class="setting-row">
        <label>Border Style</label>
        <select
          .value=${e.border_style||"solid"}
          @change=${t=>this._updateModuleProperty(e.id,"border_style",t.target.value)}
        >
          <option value="none">None</option>
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="double">Double</option>
        </select>
      </div>
      <div class="setting-row">
        <label>Border Color</label>
        <input
          type="text"
          .value=${e.border_color||""}
          @input=${t=>this._updateModuleProperty(e.id,"border_color",t.target.value)}
          placeholder="var(--divider-color)"
        />
      </div>
      <div class="setting-row">
        <label>Border Radius</label>
        <input
          type="text"
          .value=${e.border_radius||""}
          @input=${t=>this._updateModuleProperty(e.id,"border_radius",t.target.value)}
          placeholder="4px"
        />
      </div>
      <div class="setting-row">
        <label>Box Shadow</label>
        <input
          type="text"
          .value=${e.box_shadow||""}
          @input=${t=>this._updateModuleProperty(e.id,"box_shadow",t.target.value)}
          placeholder="0 2px 4px rgba(0,0,0,0.1)"
        />
      </div>
      <div class="setting-row">
        <label>Custom CSS Class</label>
        <input
          type="text"
          .value=${e.custom_class||""}
          @input=${t=>this._updateModuleProperty(e.id,"custom_class",t.target.value)}
          placeholder="my-custom-class"
        />
      </div>
    `}_toggleSpacingLink(e,t){const i=`${t}_linked`,n=this._getCurrentModuleProperty(e,i);this._updateModuleProperty(e,i,!n)}_updateSpacing(e,t,i,n,a){const o=`${t}_${i}`;this._updateModuleProperty(e,o,n),a&&["top","right","bottom","left"].forEach((a=>{a!==i&&this._updateModuleProperty(e,`${t}_${a}`,n)}))}_getCurrentModuleProperty(e,t){if(this._currentLayout)for(const i of this._currentLayout.rows)for(const n of i.columns){const i=n.modules.find((t=>t.id===e));if(i)return i[t]}}_copySpacingValues(e){var t,i;if(!this._currentLayout)return;const n=this._getCurrentModule(e);if(!n)return;const a={margin_top:n.margin_top||"",margin_right:n.margin_right||"",margin_bottom:n.margin_bottom||"",margin_left:n.margin_left||"",padding_top:n.padding_top||"",padding_right:n.padding_right||"",padding_bottom:n.padding_bottom||"",padding_left:n.padding_left||"",margin_linked:null===(t=n.margin_linked)||void 0===t||t,padding_linked:null===(i=n.padding_linked)||void 0===i||i};navigator.clipboard&&navigator.clipboard.writeText(JSON.stringify(a,null,2)),localStorage.setItem("uvc_spacing_clipboard",JSON.stringify(a))}_resetSpacingValues(e){["margin_top","margin_right","margin_bottom","margin_left","padding_top","padding_right","padding_bottom","padding_left"].forEach((t=>{this._updateModuleProperty(e,t,"")})),this._updateModuleProperty(e,"margin_linked",!0),this._updateModuleProperty(e,"padding_linked",!0)}_getCurrentModule(e){if(this._currentLayout)for(const t of this._currentLayout.rows)for(const i of t.columns){const t=i.modules.find((t=>t.id===e));if(t)return t}}_updateModuleProperty(e,t,i){if(!this._currentLayout)return;const n=this._currentLayout.rows.map((n=>Object.assign(Object.assign({},n),{columns:n.columns.map((n=>Object.assign(Object.assign({},n),{modules:n.modules.map((n=>n.id===e?Object.assign(Object.assign({},n),{[t]:i}):n))})))})));this._currentLayout=Object.assign(Object.assign({},this._currentLayout),{rows:n}),this._updateConfig()}_updateInfoEntityProperty(e,t,i,n){if(!this._currentLayout)return;const a=this._currentLayout.rows.map((a=>Object.assign(Object.assign({},a),{columns:a.columns.map((a=>Object.assign(Object.assign({},a),{modules:a.modules.map((a=>{if(a.id===e&&"info"===a.type){const e=a.info_entities||[];for(;e.length<=t;)e.push({id:`entity_${Date.now()}_${e.length}`,entity:"",name:"",icon:"",show_icon:!0,show_name:!1,text_size:14,name_size:14,icon_size:24,icon_color:"var(--secondary-text-color)",text_color:"var(--primary-text-color)",on_click_action:"more-info",dynamic_icon_template_mode:!1,dynamic_icon_template:"",dynamic_color_template_mode:!1,dynamic_color_template:""});return e[t]=Object.assign(Object.assign({},e[t]),{[i]:n}),Object.assign(Object.assign({},a),{info_entities:e})}return a}))})))})));this._currentLayout=Object.assign(Object.assign({},this._currentLayout),{rows:a}),this._updateConfig()}_updateIconProperty(e,t,i,n){if(!this._currentLayout)return;const a=this._currentLayout.rows.map((a=>Object.assign(Object.assign({},a),{columns:a.columns.map((a=>Object.assign(Object.assign({},a),{modules:a.modules.map((a=>{if(a.id===e&&"icon"===a.type){const e=a.icons||[];for(;e.length<=t;)e.push({entity:"",icon_inactive:"mdi:circle",icon_active:"mdi:circle",color_inactive:"var(--secondary-text-color)",color_active:"var(--primary-color)",inactive_state:"off",active_state:"on",show_state:!0,show_name:!1,icon_size:24,text_size:14,single_click_action:"more-info",dynamic_icon_template_mode:!1,dynamic_icon_template:"",dynamic_color_template_mode:!1,dynamic_color_template:""});return e[t]=Object.assign(Object.assign({},e[t]),{[i]:n}),Object.assign(Object.assign({},a),{icons:e})}return a}))})))})));this._currentLayout=Object.assign(Object.assign({},this._currentLayout),{rows:a}),this._updateConfig()}_renderModuleSelector(){return this._showModuleSelector?Z`
      <div class="module-selector-overlay" @click=${this._closeModuleSelector}>
        <div class="module-selector" @click=${e=>e.stopPropagation()}>
          <div class="selector-header">
            <h3>Add Module</h3>
            <ha-icon-button
              .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}
              @click=${this._closeModuleSelector}
            ></ha-icon-button>
          </div>
          <div class="module-grid">
            ${this._moduleTypes.filter((e=>"column"!==e.type)).map((e=>Z`
                  <div
                    class="module-grid-item"
                    @click=${()=>this._addModule(e.type)}
                  >
                    <div class="module-grid-icon">
                      <ha-icon icon=${e.icon}></ha-icon>
                    </div>
                    <div class="module-grid-name">${e.name}</div>
                    <div class="module-grid-desc">${e.description}</div>
                  </div>
                `))}
          </div>
        </div>
      </div>
    `:Q}render(){return this._currentLayout?Z`
      <div class="layout-tab">
        <div class="tab-header">
          <h2>Layout Builder</h2>
          <p>
            Build your card by adding rows, columns, and modules. Drag modules between columns to
            reorganize.
          </p>
        </div>

        <div class="rows-container">
          ${this._currentLayout.rows.map((e=>this._renderRow(e)))}

          <div class="add-row-button" @click=${this._addRow}>
            <ha-icon icon="mdi:plus"></ha-icon>
            <span>Add Row</span>
          </div>
        </div>

        ${this._renderModuleSelector()} ${this._renderDialogs()}
      </div>
    `:Z`<div class="loading">Initializing layout...</div>`}_renderDialogs(){return Z`
      ${this._showModuleDialog&&this._currentEditingModule?this._renderModuleDialog():Q}
      ${this._showColumnDialog&&this._currentEditingColumn?this._renderColumnDialog():Q}
      ${this._showRowDialog&&this._currentEditingRow?this._renderRowDialog():Q}
    `}_renderModuleDialog(){return this._currentEditingModule?Z`
      <div class="dialog-overlay" @click=${this._closeDialogs}>
        <div class="dialog-container" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            <h3>${this._currentEditingModule.name} Settings</h3>
            <ha-icon-button
              .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}
              @click=${this._closeDialogs}
            ></ha-icon-button>
          </div>
          <div class="dialog-content">
            ${this._renderModuleSettings(this._currentEditingModule)}
          </div>
        </div>
      </div>
    `:Q}_renderColumnDialog(){return this._currentEditingColumn?Z`
      <div class="dialog-overlay" @click=${this._closeDialogs}>
        <div class="dialog-container" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            <h3>Column Settings</h3>
            <ha-icon-button
              .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}
              @click=${this._closeDialogs}
            ></ha-icon-button>
          </div>
          <div class="dialog-content">
            <div class="dialog-tabs">
              <div class="tab-buttons">
                <button
                  class="tab-button ${"general"===this._activeDialogTab?"active":""}"
                  @click=${()=>this._setDialogTab("general")}
                >
                  General
                </button>
                <button
                  class="tab-button ${"logic"===this._activeDialogTab?"active":""}"
                  @click=${()=>this._setDialogTab("logic")}
                >
                  Logic
                </button>
                <button
                  class="tab-button ${"design"===this._activeDialogTab?"active":""}"
                  @click=${()=>this._setDialogTab("design")}
                >
                  Design
                </button>
              </div>
              <div class="tab-content">
                ${"general"===this._activeDialogTab?Z`
                      <div class="setting-row">
                        <label>Column Name</label>
                        <input
                          type="text"
                          .value=${this._currentEditingColumn.name||""}
                          @input=${e=>this._updateCurrentColumnProperty("name",e.target.value)}
                          placeholder="Column name"
                        />
                      </div>
                      <div class="setting-row">
                        <label>Vertical Alignment</label>
                        <select
                          .value=${this._currentEditingColumn.vertical_alignment||"top"}
                          @change=${e=>this._updateCurrentColumnProperty("vertical_alignment",e.target.value)}
                        >
                          <option value="top">Top</option>
                          <option value="center">Center</option>
                          <option value="bottom">Bottom</option>
                          <option value="stretch">Stretch</option>
                        </select>
                      </div>
                      <div class="setting-row">
                        <label>Horizontal Alignment</label>
                        <select
                          .value=${this._currentEditingColumn.horizontal_alignment||"left"}
                          @change=${e=>this._updateCurrentColumnProperty("horizontal_alignment",e.target.value)}
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                          <option value="stretch">Stretch</option>
                        </select>
                      </div>
                    `:"logic"===this._activeDialogTab?this._renderColumnLogicSettings(this._currentEditingColumn):Z`<p>Design settings for columns coming soon...</p>`}
              </div>
            </div>
          </div>
        </div>
      </div>
    `:Q}_renderRowDialog(){if(!this._currentEditingRow)return Q;if("structure"===this._activeDialogTab){const e=this._getColumnLayoutOptions(this._currentEditingRow.columns.length);return Z`
        <div class="dialog-overlay" @click=${this._closeDialogs}>
          <div class="dialog-container" @click=${e=>e.stopPropagation()}>
            <div class="dialog-header">
              <h3>Select Column Structure</h3>
              <ha-icon-button
                .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}
                @click=${this._closeDialogs}
              ></ha-icon-button>
            </div>
            <div class="dialog-content">
              <div class="column-structure-grid">
                ${e.map((e=>{var t;return Z`
                    <div
                      class="structure-option ${(null===(t=this._currentEditingRow)||void 0===t?void 0:t.column_layout)===e.value?"active":""}"
                      @click=${()=>{this._currentEditingRow&&(this._updateRowLayout(this._currentEditingRow.id,e.value),this._closeDialogs())}}
                    >
                      <div class="structure-icon-container">${Ut(e.icon)}</div>
                      <div class="structure-label">${e.label}</div>
                    </div>
                  `}))}
              </div>
            </div>
          </div>
        </div>
      `}return Z`
      <div class="dialog-overlay" @click=${this._closeDialogs}>
        <div class="dialog-container" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            <h3>Row Settings</h3>
            <ha-icon-button
              .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}
              @click=${this._closeDialogs}
            ></ha-icon-button>
          </div>
          <div class="dialog-content">
            <p>Row settings coming soon...</p>
          </div>
        </div>
      </div>
    `}_updateCurrentColumnProperty(e,t){if(this._currentEditingColumn&&this._currentLayout)for(const i of this._currentLayout.rows){const n=i.columns.findIndex((e=>e.id===this._currentEditingColumn.id));if(-1!==n){const a=Object.assign(Object.assign({},i.columns[n]),{[e]:t});i.columns[n]=a,this._currentEditingColumn=a,this._updateConfig();break}}}static get styles(){return c`
      .layout-tab {
        padding: 16px;
      }

      .tab-header h2 {
        margin: 0 0 8px 0;
        color: var(--primary-text-color);
      }

      .tab-header p {
        margin: 0 0 20px 0;
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      .rows-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .columns-container-vertical {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .column-fraction {
        background: var(--primary-color);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        margin-left: 8px;
      }

      .layout-row {
        background: var(--card-background-color, #fff);
        border: 2px solid var(--divider-color);
        border-radius: 8px;
        padding: 16px;
        transition: all 0.2s ease;
      }

      .layout-row.drag-over {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color, #2196f3) 10%, transparent);
      }

      .row-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--divider-color);
      }

      .row-info {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .row-name {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .module-count,
      .column-count {
        color: var(--secondary-text-color);
        font-size: 12px;
        background: var(--secondary-background-color, #f1f3f4);
        padding: 2px 8px;
        border-radius: 12px;
      }

      .column-count {
        background: var(--primary-color);
        color: white;
      }

      /* Dialog styles */
      .dialog-overlay {
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
      }

      .dialog-container {
        background: var(--card-background-color, #fff);
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        max-width: 600px;
        max-height: 80vh;
        overflow: hidden;
        width: 90vw;
      }

      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--divider-color);
      }

      .dialog-header h3 {
        margin: 0;
        color: var(--primary-text-color);
        font-size: 18px;
        font-weight: 500;
      }

      .dialog-content {
        padding: 20px;
        max-height: 60vh;
        overflow-y: auto;
      }

      .dialog-tabs {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .tab-buttons {
        display: flex;
        gap: 8px;
        border-bottom: 1px solid var(--divider-color);
        padding-bottom: 8px;
      }

      .tab-button {
        padding: 8px 16px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color, #f5f5f5);
        color: var(--secondary-text-color);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .tab-button:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .tab-button.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .tab-content {
        padding: 16px 0;
      }

      .column-structure-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .column-structure-btn:hover {
        background: var(--secondary-background-color, #f5f5f5);
        border-color: var(--primary-color);
      }

      .column-structure-btn svg {
        display: block;
      }

      .structure-label {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .structure-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .structure-icon svg {
        display: block;
      }

      /* Column Structure Grid */
      .column-structure-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 16px;
        padding: 8px;
        max-width: 500px;
      }

      .structure-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px 12px;
        border: 2px solid var(--divider-color);
        border-radius: 12px;
        background: var(--card-background-color);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
        min-height: 80px;
        justify-content: center;
      }

      .structure-option:hover {
        border-color: var(--primary-color);
        background: color-mix(
          in srgb,
          var(--primary-color, #2196f3) 5%,
          var(--card-background-color)
        );
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .structure-option.active {
        border-color: var(--primary-color);
        background: color-mix(
          in srgb,
          var(--primary-color, #2196f3) 10%,
          var(--card-background-color)
        );
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color, #2196f3) 20%, transparent);
      }

      .structure-icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 24px;
        margin-bottom: 8px;
        padding: 4px;
        border-radius: 6px;
        background: var(--secondary-background-color, #f5f5f5);
      }

      .structure-option:hover .structure-icon-container {
        background: color-mix(
          in srgb,
          var(--primary-color, #2196f3) 15%,
          var(--secondary-background-color, #f5f5f5)
        );
      }

      .structure-option.active .structure-icon-container {
        background: var(--primary-color);
      }

      .structure-option.active .structure-icon-container svg {
        fill: white !important;
        stroke: white !important;
      }

      .structure-option .structure-label {
        font-size: 11px;
        font-weight: 500;
        color: var(--secondary-text-color);
        line-height: 1.2;
        margin: 0;
      }

      .structure-option:hover .structure-label {
        color: var(--primary-text-color);
      }

      .structure-option.active .structure-label {
        color: var(--primary-color);
        font-weight: 600;
      }

      /* Logic Settings */
      .logic-settings {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .setting-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .setting-group h4 {
        margin: 0;
        color: var(--primary-text-color);
        font-size: 16px;
        font-weight: 500;
      }

      .display-mode-select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .conditions-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .add-condition-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .add-condition-btn:hover {
        background: color-mix(in srgb, var(--primary-color, #2196f3) 85%, black);
        transform: translateY(-1px);
      }

      .conditions-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .no-conditions {
        text-align: center;
        padding: 24px;
        color: var(--secondary-text-color);
        background: var(--secondary-background-color, #f5f5f5);
        border-radius: 8px;
        border: 2px dashed var(--divider-color);
      }

      .no-conditions p {
        margin: 0;
        font-style: italic;
      }

      .condition-row {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 16px;
        position: relative;
      }

      .condition-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .condition-type-select {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color, #f5f5f5);
        color: var(--primary-text-color);
        font-size: 14px;
        font-weight: 500;
      }

      .remove-condition-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: #ff5252;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-left: 12px;
      }

      .remove-condition-btn:hover {
        background: #d32f2f;
        transform: scale(1.1);
      }

      .condition-content {
        margin-top: 12px;
      }

      .condition-fields {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }

      .field-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .field-row.full-width {
        grid-column: 1 / -1;
      }

      .field-row label {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .field-row input,
      .field-row select,
      .field-row textarea {
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        transition: border-color 0.2s ease;
      }

      .field-row input:focus,
      .field-row select:focus,
      .field-row textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color, #2196f3) 20%, transparent);
      }

      .field-row textarea {
        resize: vertical;
        min-height: 80px;
      }

      .help-text {
        font-size: 11px;
        color: var(--secondary-text-color);
        font-style: italic;
        margin-top: 4px;
      }

      .row-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .row-settings,
      .column-settings,
      .module-settings {
        margin: 12px 0;
        padding: 16px;
        background: var(--secondary-background-color, #f8f9fa);
        border-radius: 8px;
        border: 1px solid var(--divider-color);
      }

      .settings-section h4 {
        margin: 0 0 16px 0;
        color: var(--primary-text-color);
        font-size: 16px;
        font-weight: 500;
      }

      .setting-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
      }

      .setting-row:last-child {
        margin-bottom: 0;
      }

      .setting-row label {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .setting-row input,
      .setting-row select,
      .setting-row textarea {
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .setting-row textarea {
        resize: vertical;
        min-height: 60px;
      }

      .setting-note {
        color: var(--secondary-text-color);
        font-size: 12px;
        background: var(--secondary-background-color);
        padding: 2px 8px;
        border-radius: 12px;
        margin-top: 4px;
      }

      .setting-hint {
        color: var(--secondary-text-color);
        font-size: 11px;
        margin: 4px 0 0 0;
        font-style: italic;
      }

      .module-settings-tabs {
        width: 100%;
      }

      .tab-buttons {
        display: flex;
        border-bottom: 1px solid var(--divider-color);
        margin-bottom: 16px;
      }

      .tab-button {
        flex: 1;
        padding: 8px 16px;
        border: none;
        background: transparent;
        color: var(--secondary-text-color);
        cursor: pointer;
        font-size: 14px;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
      }

      .tab-button:hover {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .tab-button.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
        background: var(--secondary-background-color);
      }

      .tab-content {
        min-height: 200px;
      }

      .alignment-buttons {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }

      .alignment-btn {
        padding: 8px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s ease;
        min-width: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .alignment-btn:hover {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .alignment-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .column-controls {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .add-column-btn,
      .remove-column-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border: 1px solid var(--primary-color);
        background: var(--primary-color);
        color: white;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
      }

      .add-column-btn:hover:not(:disabled),
      .remove-column-btn:hover {
        background: var(--primary-color);
        opacity: 0.9;
      }

      .add-column-btn:disabled {
        background: var(--disabled-color, #ccc);
        border-color: var(--disabled-color, #ccc);
        cursor: not-allowed;
        opacity: 0.6;
      }

      .remove-column-btn {
        background: var(--error-color, #f44336);
        border-color: var(--error-color, #f44336);
      }

      .remove-column-btn:hover {
        background: var(--error-color, #f44336);
        opacity: 0.9;
      }

      .gap-control {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .gap-control input[type='range'] {
        flex: 1;
        min-width: 120px;
      }

      .gap-value {
        min-width: 40px;
        font-size: 14px;
        color: var(--primary-text-color);
        font-weight: 500;
      }

      .row-actions select {
        padding: 4px 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 12px;
      }

      .columns-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .layout-column {
        flex: 1;
        min-width: 200px;
        background: var(--secondary-background-color, #f8f9fa);
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        padding: 12px;
        transition: all 0.2s ease;
      }

      .layout-column.drag-over {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color, #2196f3) 15%, transparent);
      }

      .column-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--divider-color);
      }

      .column-info {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .column-name {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .column-actions {
        display: flex;
        gap: 4px;
      }

      .empty-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        border: 2px dashed var(--divider-color);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--secondary-text-color);
        min-height: 80px;
      }

      .empty-column:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .empty-column ha-icon {
        --mdc-icon-size: 24px;
        margin-bottom: 6px;
      }

      .modules-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .module-item {
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 8px;
        cursor: move;
        transition: all 0.2s ease;
      }

      .module-item:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .module-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }

      .module-info {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .module-name {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 13px;
      }

      .module-type {
        color: var(--secondary-text-color);
        font-size: 11px;
        text-transform: capitalize;
        background: var(--secondary-background-color);
        padding: 1px 4px;
        border-radius: 6px;
      }

      .module-actions {
        display: flex;
        gap: 2px;
      }

      .module-preview {
        color: var(--secondary-text-color);
        font-size: 11px;
      }

      .add-row-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 16px;
        border: 2px dashed var(--divider-color);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--secondary-text-color);
      }

      .add-row-button:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .module-selector-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .module-selector {
        background: var(--card-background-color, #fff);
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      }

      .selector-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .selector-header h3 {
        margin: 0;
        color: var(--primary-text-color);
      }

      .module-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .module-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .module-option:hover {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color, #2196f3) 5%, transparent);
      }

      .option-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .option-name {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .option-description {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
        color: var(--secondary-text-color);
      }

      /* WPBakery-style Interface */
      .wpb-row {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        margin-bottom: 16px;
        transition: all 0.2s ease;
      }

      .wpb-row:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .wpb-row.drag-over {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 5%, transparent);
      }

      .wpb-row-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
        background: var(--secondary-background-color, #f8f9fa);
      }

      .wpb-row-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .wpb-control-btn {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .wpb-control-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        transform: scale(1.05);
      }

      .wpb-add-btn {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .wpb-add-btn:hover {
        background: var(--primary-color);
        opacity: 0.9;
      }

      .wpb-delete-btn:hover {
        background: var(--error-color, #f44336);
        color: white;
        border-color: var(--error-color, #f44336);
      }

      .wpb-column-layouts {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .wpb-layout-btn {
        padding: 6px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        color: var(--secondary-text-color);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .wpb-layout-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .wpb-layout-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .wpb-column {
        background: var(--secondary-background-color, #f8f9fa);
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        padding: 12px;
        min-height: 100px;
        position: relative;
        transition: all 0.2s ease;
      }

      .wpb-column:hover {
        border-color: var(--primary-color);
      }

      .wpb-column.drag-over {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      }

      .wpb-column-controls {
        display: flex;
        gap: 4px;
        margin-bottom: 12px;
        opacity: 0;
        transition: opacity 0.2s;
      }

      .wpb-column:hover .wpb-column-controls {
        opacity: 1;
      }

      .wpb-empty-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        border: 2px dashed var(--divider-color);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        color: var(--secondary-text-color);
        background: var(--card-background-color);
      }

      .wpb-empty-column:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 3%, transparent);
      }

      .wpb-empty-column ha-icon {
        --mdc-icon-size: 32px;
        margin-bottom: 8px;
        opacity: 0.7;
      }

      .wpb-elements {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .wpb-element {
        display: flex;
        align-items: center;
        padding: 12px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
      }

      .wpb-element:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }

      .wpb-element-icon {
        width: 32px;
        height: 32px;
        background: var(--primary-color);
        color: white;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        flex-shrink: 0;
      }

      .wpb-element-icon ha-icon {
        --mdc-icon-size: 18px;
      }

      .wpb-element-info {
        flex: 1;
        min-width: 0;
      }

      .wpb-element-title {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
        margin-bottom: 2px;
      }

      .wpb-element-desc {
        font-size: 12px;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .wpb-element-controls {
        opacity: 0;
        transition: opacity 0.2s;
      }

      .wpb-element:hover .wpb-element-controls {
        opacity: 1;
      }

      .wpb-delete-element {
        width: 24px;
        height: 24px;
        color: var(--secondary-text-color);
      }

      .wpb-delete-element:hover {
        color: var(--error-color, #f44336);
      }

      /* New Proper Row/Column Structure */
      .row-container {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        margin-bottom: 16px;
        overflow: hidden;
        transition: all 0.2s ease;
      }

      .row-container:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .row-container.drag-over {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 5%, transparent);
      }

      .row-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: var(--secondary-background-color, #f8f9fa);
        border-bottom: 1px solid var(--divider-color);
      }

      .row-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .row-header-right {
        display: flex;
        align-items: center;
      }

      .row-drag-handle {
        color: var(--secondary-text-color);
        cursor: grab;
      }

      .row-drag-handle:hover {
        color: var(--primary-color);
      }

      .column-structure-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        color: var(--secondary-text-color);
      }

      .column-structure-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .structure-label {
        font-size: 12px;
        font-weight: 500;
      }

      .row-delete-btn {
        color: var(--secondary-text-color);
      }

      .row-delete-btn:hover {
        color: var(--error-color, #f44336);
      }

      .row-content {
        padding: 16px;
      }

      .empty-row {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        border: 2px dashed var(--divider-color);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        color: var(--secondary-text-color);
      }

      .empty-row:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .empty-row ha-icon {
        --mdc-icon-size: 32px;
        margin-bottom: 8px;
      }

      .column-container {
        background: var(--secondary-background-color, #f8f9fa);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        transition: all 0.2s ease;
        overflow: hidden;
      }

      .column-container:hover {
        border-color: var(--primary-color);
      }

      .column-container.drag-over {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      }

      .column-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: var(--card-background-color);
        border-bottom: 1px solid var(--divider-color);
      }

      .column-header-left {
        display: flex;
        align-items: center;
      }

      .column-header-right {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .column-title {
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .column-add-btn {
        color: var(--primary-color);
      }

      .column-add-btn:hover {
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      }

      .column-settings-btn {
        color: var(--secondary-text-color);
      }

      .column-settings-btn:hover {
        color: var(--primary-color);
      }

      .column-delete-btn {
        color: var(--secondary-text-color);
      }

      .column-delete-btn:hover {
        color: var(--error-color, #f44336);
      }

      .column-content {
        padding: 12px;
        min-height: 60px;
      }

      .empty-column-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        border: 2px dashed var(--divider-color);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        color: var(--secondary-text-color);
      }

      .empty-column-content:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .empty-column-content ha-icon {
        --mdc-icon-size: 24px;
        margin-bottom: 6px;
      }

      .column-modules {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .module-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .module-item:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .module-icon {
        width: 32px;
        height: 32px;
        background: var(--primary-color);
        color: white;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .module-icon ha-icon {
        --mdc-icon-size: 18px;
      }

      .module-info {
        flex: 1;
      }

      .module-title {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
        margin-bottom: 2px;
      }

      .module-desc {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .module-delete-btn {
        color: var(--secondary-text-color);
        opacity: 0;
        transition: opacity 0.2s;
      }

      .module-item:hover .module-delete-btn {
        opacity: 1;
      }

      .module-delete-btn:hover {
        color: var(--error-color, #f44336);
      }

      /* Grid Module Selector */
      .module-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        padding: 8px;
      }

      @media (max-width: 768px) {
        .module-grid {
          grid-template-columns: 1fr;
        }
      }

      .module-grid-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px 16px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
        background: var(--card-background-color);
      }

      .module-grid-item:hover {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 5%, transparent);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .module-grid-icon {
        width: 48px;
        height: 48px;
        background: var(--primary-color);
        color: white;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
      }

      .module-grid-icon ha-icon {
        --mdc-icon-size: 24px;
      }

      .module-grid-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 4px;
      }

      .module-grid-desc {
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      /* Design Sub-tabs */
      .design-sub-tabs {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .design-tab-buttons {
        display: flex;
        gap: 8px;
        border-bottom: 1px solid var(--divider-color);
        padding-bottom: 8px;
      }

      .design-tab-btn {
        padding: 8px 16px;
        border: none;
        background: transparent;
        color: var(--secondary-text-color);
        cursor: pointer;
        border-radius: 4px;
        font-size: 14px;
        transition: all 0.2s;
      }

      .design-tab-btn:hover {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .design-tab-btn.active {
        background: var(--primary-color);
        color: var(--text-primary-color);
      }

      .design-tab-content {
        padding: 4px 0;
      }

      /* Spacing Section */
      .spacing-section {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .spacing-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--divider-color);
      }

      .spacing-header h4 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .spacing-actions {
        display: flex;
        gap: 8px;
      }

      .action-button {
        width: 36px;
        height: 36px;
        border-radius: 6px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .action-button:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
        transform: scale(1.05);
      }

      .margin-section,
      .padding-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 20px;
        background: var(--card-background-color);
        border-radius: 12px;
        border: 1px solid var(--divider-color);
      }

      .spacing-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .spacing-label label {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .link-button {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        border: 2px solid var(--primary-color);
        background: var(--primary-color);
        color: white;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .link-button:hover {
        background: var(--primary-color);
        opacity: 0.9;
        transform: scale(1.05);
      }

      .link-button.linked {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .link-button:not(.linked) {
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        border-color: var(--divider-color);
      }

      .link-button:not(.linked):hover {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border-color: var(--primary-color);
      }

      .spacing-grid {
        display: grid;
        grid-template-columns: 1fr 40px 1fr;
        grid-template-rows: 1fr 40px 1fr;
        gap: 8px;
        padding: 20px;
        border: 2px solid var(--divider-color);
        border-radius: 12px;
        background: var(--secondary-background-color, #f8f9fa);
        position: relative;
        min-height: 140px;
      }

      .spacing-grid::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 32px;
        height: 32px;
        background: var(--card-background-color);
        border: 2px solid var(--divider-color);
        border-radius: 50%;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .spacing-input-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        position: relative;
        z-index: 1;
      }

      .spacing-input-group label {
        font-size: 11px;
        color: var(--secondary-text-color);
        text-align: center;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 4px;
      }

      .spacing-input-group input {
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-weight: 500;
        text-align: center;
        width: 100%;
        box-sizing: border-box;
        transition: all 0.2s;
        min-height: 44px;
      }

      .spacing-input-group input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 15%, transparent);
      }

      /* Spacing grid positioning - creates perfect cross pattern like the image */
      .spacing-grid .spacing-input-group:nth-child(1) {
        /* Left */
        grid-row: 2;
        grid-column: 1;
        align-self: center;
      }

      .spacing-grid .spacing-input-group:nth-child(2) {
        /* Top */
        grid-row: 1;
        grid-column: 2;
        justify-self: center;
      }

      .spacing-grid .spacing-input-group:nth-child(3) {
        /* Bottom */
        grid-row: 3;
        grid-column: 2;
        justify-self: center;
      }

      .spacing-grid .spacing-input-group:nth-child(4) {
        /* Right */
        grid-row: 2;
        grid-column: 3;
        align-self: center;
      }
    `}};Nt([be({attribute:!1})],Ot.prototype,"hass",void 0),Nt([be({attribute:!1})],Ot.prototype,"config",void 0),Nt([fe()],Ot.prototype,"_currentLayout",void 0),Nt([fe()],Ot.prototype,"_showModuleSelector",void 0),Nt([fe()],Ot.prototype,"_selectedRowId",void 0),Nt([fe()],Ot.prototype,"_selectedColumnId",void 0),Nt([fe()],Ot.prototype,"_draggingModule",void 0),Nt([fe()],Ot.prototype,"_dragOverRowId",void 0),Nt([fe()],Ot.prototype,"_dragOverColumnId",void 0),Nt([fe()],Ot.prototype,"_showRowSettings",void 0),Nt([fe()],Ot.prototype,"_showColumnSettings",void 0),Nt([fe()],Ot.prototype,"_showModuleSettings",void 0),Nt([fe()],Ot.prototype,"_activeModuleSettingsTab",void 0),Nt([fe()],Ot.prototype,"_showRowDialog",void 0),Nt([fe()],Ot.prototype,"_showColumnDialog",void 0),Nt([fe()],Ot.prototype,"_showModuleDialog",void 0),Nt([fe()],Ot.prototype,"_currentEditingRow",void 0),Nt([fe()],Ot.prototype,"_currentEditingColumn",void 0),Nt([fe()],Ot.prototype,"_currentEditingModule",void 0),Nt([fe()],Ot.prototype,"_currentEditingRowId",void 0),Nt([fe()],Ot.prototype,"_currentEditingColumnId",void 0),Nt([fe()],Ot.prototype,"_currentEditingModuleIndex",void 0),Nt([fe()],Ot.prototype,"_activeDialogTab",void 0),Ot=Nt([_e("layout-tab")],Ot);var Ft=function(e,t,i,n){var a,o=arguments.length,r=o<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,n);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(r=(o<3?a(r):o>3?a(t,i,r):a(t,i))||r);return o>3&&r&&Object.defineProperty(t,i,r),r};let qt=class extends ge{_t(e,t){var i,n;return Dt(e,(null===(n=null===(i=this.hass)||void 0===i?void 0:i.locale)||void 0===n?void 0:n.language)||"en",t)}render(){return Z`
      <div class="about-tab">
        <div class="about-logo-container">
          <a href="https://ultravehiclecard.com/" target="_blank" rel="noopener">
            <img
              src="/hacsfiles/Ultra-Vehicle-Card/assets/uvc-logo.png"
              alt="${this._t("about.logo_alt","Ultra Vehicle Card")}"
              class="about-logo"
            />
          </a>
        </div>

        <div class="about-developed-by">
          ${this._t("about.developed_by","Developed by")}
          <a href="https://wjddesigns.com" target="_blank" rel="noopener">WJD Designs</a>
        </div>

        <div class="about-buttons">
          <a
            href="https://discord.com/invite/5SkUf6Ch"
            target="_blank"
            rel="noopener"
            class="about-button discord"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" class="about-button-icon">
              <path
                fill="currentColor"
                d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3847-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"
              />
            </svg>
            ${this._t("about.discord_button","Join Our Discord")}
          </a>

          <a
            href="https://github.com/WJDDesigns/Ultra-Vehicle-Card"
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
            ${this._t("about.github_button","Check Out Our Github")}
          </a>

          <a
            href="https://ultravehiclecard.com/documentation/"
            target="_blank"
            rel="noopener"
            class="about-button docs"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" class="about-button-icon">
              <path
                fill="currentColor"
                d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
              />
            </svg>
            ${this._t("about.docs_button","Visit Our Documentation")}
          </a>
        </div>

        <div class="support-section">
          <h2>${this._t("about.support_title","Support Ultra Vehicle Card")}</h2>

          <p class="support-description">
            ${this._t("about.support_description","Your generous tips fuel the development of amazing features for this card! Without support from users like you, continued innovation wouldn't be possible.")}
          </p>

          <a
            href="https://www.paypal.com/donate/?cmd=_s-xclick&hosted_button_id=4JVCZ46FZPUTG&clickref=1101lAycwnhU&gad_source=7&pid=328130457&dclid=CjgKEAjwh_i_BhCRhu7RxN_14hYSJACbYkcgx98-Vsb49UI4imjGhPA2lwk73DpbbgCri-G8TCTB9PD_BwE&ssrt=1744735247042"
            target="_blank"
            rel="noopener"
            class="about-button donate"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" class="about-button-icon">
              <path
                fill="currentColor"
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
            ${this._t("about.donate_button","LEAVE A TIP (PAYPAL)")}
          </a>
        </div>
      </div>
    `}};qt.styles=c`
    .about-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
      color: var(--primary-text-color);
    }
    .about-logo-container {
      margin-bottom: 20px;
      width: 100%;
      display: flex;
      justify-content: center;
    }
    .about-logo {
      max-width: 250px;
      height: auto;
      cursor: pointer;
      transition: transform 0.3s ease;
      background: var(--primary-color);
      padding: 6px;
      border-radius: 8px; /* Added border-radius */
    }
    .about-logo:hover {
      transform: scale(1.05);
    }
    .about-developed-by {
      font-size: 1.2em;
      margin-bottom: 30px;
      color: var(--secondary-text-color);
    }
    .about-developed-by a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: bold;
    }
    .about-developed-by a:hover {
      text-decoration: underline;
    }
    .about-buttons {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
      margin-bottom: 40px;
      width: 100%;
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
      min-width: 200px;
      color: white; /* Ensure text is white */
      border: none; /* Remove border */
    }
    .about-button ha-icon,
    .about-button svg {
      margin-right: 8px;
      fill: currentColor; /* Ensure icons inherit color */
    }
    .about-button.discord {
      background-color: #5865f2;
    }
    .about-button.github {
      background-color: #24292e;
    }
    .about-button.docs {
      background-color: #4caf50;
    }
    .about-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    .support-section {
      background-color: rgba(var(--rgb-primary-color), 0.1);
      border-radius: 12px;
      padding: 24px;
      margin-top: 20px;
      text-align: center;
      width: 100%;
      max-width: 600px;
    }
    .support-section h2 {
      color: var(--primary-color);
      margin-top: 0;
      margin-bottom: 16px;
    }
    .support-section p {
      margin-bottom: 24px;
      line-height: 1.5;
      color: var(--primary-text-color); /* Ensure text color */
    }
    .about-button.donate {
      background-color: #179bd7;
      padding: 14px 24px;
      font-weight: bold;
      letter-spacing: 0.5px;
      margin: 0 auto; /* Center donate button */
    }
    .about-button.donate:hover {
      background-color: #1486ba;
    }

    @media (max-width: 600px) {
      .about-buttons {
        flex-direction: column;
        align-items: center;
      }
      .about-button {
        width: 80%;
      }
    }
  `,Ft([be({attribute:!1})],qt.prototype,"hass",void 0),qt=Ft([_e("about-tab")],qt);var Kt=function(e,t,i,n){var a,o=arguments.length,r=o<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,n);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(r=(o<3?a(r):o>3?a(t,i,r):a(t,i))||r);return o>3&&r&&Object.defineProperty(t,i,r),r};let Gt=class extends ge{constructor(){super(...arguments),this.activeTab="layout",this._cropperActive=!1,this._cropperImage="",this._cropperTargetField="",this._vehicleCropExpanded=!1,this._actionCropExpanded=!1,this._showEntityList=!1,this._activeField="",this._entityFilter="",this._entities=[],this._editorVersion="1.2.0-debug"}setConfig(e){if(!e)throw new Error("Invalid configuration");const t=function(e){if(function(e){return!e.use_modular_layout&&(e.images&&e.images.length>0||e.info_rows&&e.info_rows.length>0||e.bars&&e.bars.length>0||e.icon_rows&&e.icon_rows.length>0||e.vehicle_image_type&&"none"!==e.vehicle_image_type||e.title&&e.title.trim().length>0)}(e)||e.title&&e.title.trim().length>0){const t=function(e){const t=[],i=()=>`${Date.now()}_${Math.random().toString(36).substr(2,9)}`;if(e.title){const n={id:i(),type:"text",name:"Title",text:e.title,font_size:e.title_size||24,color:e.title_color||"var(--primary-text-color)",alignment:e.title_alignment||"center",bold:e.title_bold||!1,italic:e.title_italic||!1,uppercase:e.title_uppercase||!1,strikethrough:e.title_strikethrough||!1,margin_bottom:8},a={id:i(),name:"Title Column",modules:[n],vertical_alignment:"top",horizontal_alignment:"center"};t.push({id:i(),name:"Title",columns:[a],column_layout:"1-col",gap:8})}if(e.images&&e.images.length>0){const n=e.images.map((e=>({id:e.id||i(),type:"image",name:e.name||"Image",image_type:e.image_type,image:e.image,image_entity:e.image_entity,image_width:e.image_width,image_crop:e.image_crop,conditional_entity:e.conditional_entity,conditional_state:e.conditional_state,conditional_type:e.conditional_type,template_mode:e.template_mode,template:e.template,priority:e.priority,single_click_action:e.single_click_action,single_entity:e.single_entity,single_navigation_path:e.single_navigation_path,single_url:e.single_url,single_service:e.single_service,single_service_data:e.single_service_data,single_action:e.single_action,double_click_action:e.double_click_action,double_entity:e.double_entity,double_navigation_path:e.double_navigation_path,double_url:e.double_url,double_service:e.double_service,double_service_data:e.double_service_data,double_action:e.double_action,hold_click_action:e.hold_click_action,hold_entity:e.hold_entity,hold_navigation_path:e.hold_navigation_path,hold_url:e.hold_url,hold_service:e.hold_service,hold_service_data:e.hold_service_data,hold_action:e.hold_action,timed_duration:e.timed_duration,is_fallback:e.is_fallback}))),a={id:i(),name:"Images Column",modules:n,vertical_alignment:"top",horizontal_alignment:"center"};t.push({id:i(),name:"Images",columns:[a],column_layout:"1-col",gap:8})}if(e.vehicle_image_type&&"none"!==e.vehicle_image_type){const n={id:i(),type:"image",name:"Vehicle Image",image_type:e.vehicle_image_type,image:e.vehicle_image,image_entity:e.vehicle_image_entity,image_width:e.vehicle_image_width||100,image_crop:e.vehicle_image_crop,priority:0},a={id:i(),name:"Vehicle Image Column",modules:[n],vertical_alignment:"top",horizontal_alignment:"center"};t.push({id:i(),name:"Vehicle Image",columns:[a],column_layout:"1-col",gap:8})}return e.info_rows&&e.info_rows.length>0&&e.info_rows.forEach((e=>{const n={id:e.id||i(),type:"info",name:e.row_header||"Info Row",width:e.width,alignment:e.alignment,vertical_alignment:e.vertical_alignment,spacing:e.spacing,columns:e.columns,allow_wrap:e.allow_wrap,info_entities:e.info_entities,row_header:e.row_header,row_header_size:e.row_header_size,row_header_color:e.row_header_color,show_row_header:e.show_row_header},a={id:i(),name:"Info Column",modules:[n],vertical_alignment:"top",horizontal_alignment:"left"};t.push({id:i(),name:e.row_header||"Info Row",columns:[a],column_layout:"1-col",gap:8})})),e.bars&&e.bars.length>0&&e.bars.forEach(((e,n)=>{const a={id:i(),type:"bar",name:`Bar ${n+1}`,entity:e.entity,limit_entity:e.limit_entity,limit_indicator_color:e.limit_indicator_color,left_entity:e.left_entity,right_entity:e.right_entity,left_title:e.left_title,right_title:e.right_title,bar_color:e.bar_color,background_color:e.background_color,border_color:e.border_color,left_title_color:e.left_title_color,left_text_color:e.left_text_color,right_title_color:e.right_title_color,right_text_color:e.right_text_color,percentage_text_color:e.percentage_text_color,left_title_size:e.left_title_size,left_text_size:e.left_text_size,right_title_size:e.right_title_size,right_text_size:e.right_text_size,percentage_text_size:e.percentage_text_size,left_title_bold:e.left_title_bold,left_title_italic:e.left_title_italic,left_title_uppercase:e.left_title_uppercase,left_title_strikethrough:e.left_title_strikethrough,left_text_bold:e.left_text_bold,left_text_italic:e.left_text_italic,left_text_uppercase:e.left_text_uppercase,left_text_strikethrough:e.left_text_strikethrough,right_title_bold:e.right_title_bold,right_title_italic:e.right_title_italic,right_title_uppercase:e.right_title_uppercase,right_title_strikethrough:e.right_title_strikethrough,right_text_bold:e.right_text_bold,right_text_italic:e.right_text_italic,right_text_uppercase:e.right_text_uppercase,right_text_strikethrough:e.right_text_strikethrough,percentage_text_bold:e.percentage_text_bold,percentage_text_italic:e.percentage_text_italic,percentage_text_uppercase:e.percentage_text_uppercase,percentage_text_strikethrough:e.percentage_text_strikethrough,bar_size:e.bar_size,bar_radius:e.bar_radius,bar_style:e.bar_style,show_left:e.show_left,show_right:e.show_right,show_percentage:e.show_percentage,show_left_title:e.show_left_title,show_left_value:e.show_left_value,show_right_title:e.show_right_title,show_right_value:e.show_right_value,alignment:e.alignment,width:e.width,use_gradient:e.use_gradient,gradient_stops:e.gradient_stops,gradient_display_mode:e.gradient_display_mode,animation_entity:e.animation_entity,animation_state:e.animation_state,animation_type:e.animation_type,left_condition:e.left_condition,right_condition:e.right_condition,left_template_mode:e.left_template_mode,left_template:e.left_template,right_template_mode:e.right_template_mode,right_template:e.right_template,percentage_type:e.percentage_type,percentage_amount_entity:e.percentage_amount_entity,percentage_total_entity:e.percentage_total_entity},o={id:i(),name:"Bar Column",modules:[a],vertical_alignment:"top",horizontal_alignment:"left"};t.push({id:i(),name:`Bar ${n+1}`,columns:[o],column_layout:"1-col",gap:8})})),e.icon_rows&&e.icon_rows.length>0&&e.icon_rows.forEach((e=>{const n={id:e.id||i(),type:"icon",name:"Icon Row",width:e.width,alignment:e.alignment,vertical_alignment:e.vertical_alignment,spacing:e.spacing,columns:e.columns,icons:e.icons},a={id:i(),name:"Icon Column",modules:[n],vertical_alignment:"top",horizontal_alignment:"center"};t.push({id:i(),name:"Icon Row",columns:[a],column_layout:"1-col",gap:8})})),{rows:t,layout_type:e.layout_type,column_width:e.column_width,gap:16}}(e);return Object.assign(Object.assign({},e),{layout:t,use_modular_layout:!0})}return e}(e);if(this.config=Object.assign({vehicle_image_type:"default",status_image_type:"none",layout_type:"single",formatted_entities:!1,show_location:!0,show_mileage:!0,show_car_state:!0,show_info_icons:!0,help_highlight:!0,sections_order:["title","image","info"],bars:[],icon_rows:[]},t),this.config.sections_order&&!this.config.sections_order.includes("info")){const e=[...this.config.sections_order],t=e.indexOf("image");-1!==t?e.splice(t+1,0,"info"):e.unshift("info"),this.config.sections_order=e}this.config.section_styles||(this.config.section_styles={}),void 0===this.config.vehicle_image_width&&(this.config.vehicle_image_width=100),void 0===this.config.action_image_width&&(this.config.action_image_width=100),this._migrateToIndividualSections(),this._migrateImagesToNewFormat()}_migrateToIndividualSections(){if(!this.config.sections_order)return;let e=[...this.config.sections_order],t=!1;const i=e.indexOf("bars");if(-1!==i&&this.config.bars&&this.config.bars.length>0){const n=this.config.bars.map(((e,t)=>`bar_${t}`));e.splice(i,1,...n),t=!0}if(this.config.bars&&this.config.bars.length>0){const i=e.filter((e=>e.startsWith("bar_")));if(i.length<this.config.bars.length){const n=i.map((e=>parseInt(e.substring(4)))).sort(((e,t)=>e-t)),a=[];for(let e=0;e<this.config.bars.length;e++)n.includes(e)||a.push(`bar_${e}`);if(a.length>0){let o=-1;if(i.length>0){const t=`bar_${Math.max(...n)}`;o=e.indexOf(t)}else{const t=e.indexOf("info"),i=e.indexOf("icons");o=-1!==t?t:-1!==i?i-1:e.length-1}-1!==o&&(e.splice(o+1,0,...a),t=!0)}}}const n=e.indexOf("icons");if(-1!==n&&this.config.icon_rows&&this.config.icon_rows.length>0&&!e.some((e=>e.startsWith("icon_row_")))){const i=this.config.icon_rows.map((e=>`icon_row_${e.id}`));e.splice(n,1,...i),t=!0}t&&(this.config=Object.assign(Object.assign({},this.config),{sections_order:e}),this._fireConfigChanged())}_migrateImagesToNewFormat(){if(!this.config)return;const e=this.config.vehicle_image_type&&"none"!==this.config.vehicle_image_type,t=this.config.action_images&&this.config.action_images.length>0,i=this.config.images&&this.config.images.length>0;if(!e&&!t||i)return;const n=[];let a=!1;if(e){const e={id:this._generateUniqueId(),name:"Vehicle Image",image_type:this.config.vehicle_image_type,image:this.config.vehicle_image,image_entity:this.config.vehicle_image_entity,image_width:this.config.vehicle_image_width||100,image_crop:this.config.vehicle_image_crop,priority:0};n.push(e),a=!0}if(t){const e=this.config.action_images.map(((e,t)=>({id:e.id||this._generateUniqueId(),name:`Action Image ${t+1}`,image_type:e.image_type,image:e.image,image_entity:e.image_entity,image_width:e.image_width||100,image_crop:e.image_crop,conditional_entity:e.entity,conditional_state:e.state,conditional_type:"show",template_mode:e.template_mode,template:e.template,priority:e.priority||t+1})));n.push(...e),a=!0}a&&(n.sort(((e,t)=>(e.priority||0)-(t.priority||0))),this.config=Object.assign(Object.assign({},this.config),{images:n}))}async _handleFileUploadEvent(e){const{file:t,id:i,configKey:n}=e.detail;if(t)if(this.hass&&this.hass.auth&&this.hass.auth.data&&this.hass.auth.data.access_token)try{const a=await async function(e,t){var i;if(!t)throw console.error("[UPLOAD] Missing file."),new Error("No file provided for upload.");if(!(e&&e.auth&&e.auth.data&&e.auth.data.access_token))throw console.error("[UPLOAD] Missing Home Assistant authentication details."),new Error("Authentication details are missing.");const n=new FormData;n.append("file",t);let a="";a=e.connection&&"string"==typeof(null===(i=e.connection.options)||void 0===i?void 0:i.url)?e.connection.options.url.replace(/^ws/,"http"):"function"==typeof e.hassUrl?e.hassUrl():`${window.location.protocol}//${window.location.host}`;const o=`${a.replace(/\/$/,"")}/api/image/upload`;try{const t=await fetch(o,{method:"POST",headers:{Authorization:`Bearer ${e.auth.data.access_token}`},body:n});if(!t.ok){const e=await t.text();throw console.error(`[UPLOAD] Failed to upload image via ${o}: ${t.status} ${t.statusText}`,e),new Error(`Failed to upload image via ${o}: ${t.statusText}`)}const i=await t.json();if(!i||!i.id)throw console.error(`[UPLOAD] Invalid response from ${o}: missing id`,i),new Error(`Invalid response from ${o}: missing id`);return`/api/image/serve/${i.id}`}catch(e){throw console.error(`[UPLOAD] Error during fetch to ${o}:`,e),new Error(`Upload via ${o} failed: ${e instanceof Error?e.message:"Unknown network error"}`)}}(this.hass,t);if(i&&this.config.action_images){const e=this.config.action_images.findIndex((e=>e.id===i));if(-1!==e){const t=[...this.config.action_images.slice(0,e),Object.assign(Object.assign({},this.config.action_images[e]),{image:a}),...this.config.action_images.slice(e+1)];this._updateConfig({action_images:t})}else console.warn(`[UPLOAD EVENT] Action image with ID "${i}" not found.`),n&&this._updateConfig({[n]:a})}else n?this._updateConfig({[n]:a}):console.error("[UPLOAD EVENT] Event detail missing required ID or configKey.",e.detail)}catch(e){console.error("[UPLOAD EVENT] Upload failed:",e)}else console.error("[UPLOAD EVENT] Hass object appears invalid or missing auth!");else console.error("[UPLOAD EVENT] Missing file in event detail.",e.detail)}_getCleanConfig(){const e=Object.assign({},this.config);return e.section_styles&&(Object.keys(e.section_styles).forEach((t=>{const i=e.section_styles[t],n=i.marginTop||0,a=i.marginBottom||0;0===n&&0===a?delete e.section_styles[t]:(0===n&&delete i.marginTop,0===a&&delete i.marginBottom)})),0===Object.keys(e.section_styles).length&&delete e.section_styles),e.sections_columns&&0===Object.keys(e.sections_columns).length&&delete e.sections_columns,e}_updateConfig(e){this.config&&e&&(this.config=Object.assign(Object.assign({},this.config),e),this._fireConfigChanged())}_updateConfigFromEvent(e){e.stopPropagation();const t=e.detail.config;t&&this._updateConfig(t)}_fireConfigChanged(){this._configChangedTimeout&&clearTimeout(this._configChangedTimeout),this._configChangedTimeout=window.setTimeout((()=>{const e=this._getCleanConfig();lt(this,"config-changed",{config:e})}),50)}_getFriendlyName(e){}_truncateText(e,t=15){}_generateUniqueId(){}_formatFieldName(e){}_getImageSchema(e){}_renderCropSliders(e){}_updateImageCrop(e,t,i){}_resetTitleSize(){}_t(e,t){}_fireForceGradientRefreshEvent(){this.dispatchEvent(new CustomEvent("force-gradient-refresh",{bubbles:!0,composed:!0,detail:{timestamp:Date.now()}})),document.dispatchEvent(new CustomEvent("force-card-update",{bubbles:!0,composed:!0}))}_forceSaveConfig(){setTimeout((()=>{this._fireConfigChanged()}),1e3)}_handleRequestTabChange(e){var t;e.detail&&e.detail.tab&&(this.activeTab=e.detail.tab,this._highlightService.handleTabChange(this.activeTab,this.config||{},!1!==(null===(t=this.config)||void 0===t?void 0:t.help_highlight)))}render(){var e;if(!this.config||!this.hass)return Q;const t=(null===(e=this.hass.locale)||void 0===e?void 0:e.language)||"en";return Z`
      <div class="card-config">
        <div class="tabs">
          ${[{id:"layout",icon:"mdi:view-dashboard",labelKey:"editor.tabs.layout",defaultLabel:"Layout"},{id:"settings",icon:"mdi:cog",labelKey:"editor.tabs.settings",defaultLabel:"Settings"},{id:"about",icon:"mdi:help-circle-outline",labelKey:"editor.tabs.about",defaultLabel:"About"}].map((e=>Z`
              <div
                class="tab ${this.activeTab===e.id?"active":""}"
                @click=${()=>{var t;this.activeTab=e.id,this._highlightService.handleTabChange(e.id,this.config||{},!1!==(null===(t=this.config)||void 0===t?void 0:t.help_highlight))}}
                title=${Dt(e.labelKey,t,e.defaultLabel)}
              >
                <ha-icon class="tab-icon" .icon=${e.icon}></ha-icon>
                <span class="tab-label">${Dt(e.labelKey,t,e.defaultLabel)}</span>
              </div>
            `))}
        </div>

        ${"layout"===this.activeTab?Z`
              <layout-tab
                .hass=${this.hass}
                .config=${this.config}
                @config-changed=${this._updateConfigFromEvent}
              ></layout-tab>
            `:""}
        ${"settings"===this.activeTab?Z`
              <settings-tab
                .hass=${this.hass}
                .config=${this.config}
                @config-changed=${this._updateConfigFromEvent}
                @file-upload=${this._handleFileUploadEvent}
              ></settings-tab>
            `:""}
        ${"about"===this.activeTab?Z` <about-tab .hass=${this.hass}></about-tab> `:""}
      </div>
    `}static get styles(){return c`
      /* Base layout */
      .card-config {
        display: flex;
        flex-direction: column;
      }

      /* Tab navigation */
      .tabs {
        display: flex;
        width: 100%;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
        overflow-x: auto; /* Allow horizontal scrolling if tabs still overflow on very small screens */
        -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
        scrollbar-width: none; /* Hide scrollbar for Firefox */
      }

      /* Hide scrollbar for Chrome, Safari, and Opera */
      .tabs::-webkit-scrollbar {
        display: none;
      }

      .tab {
        flex: 1 1 auto; /* Allow tabs to shrink but also grow if space allows */
        min-width: 0; /* Prevent overflow issues with flex items */
        padding: 8px 12px; /* Adjusted padding */
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px; /* Align with border */
        color: var(--secondary-text-color);
        transition: all 0.2s ease;
        text-align: center;
        display: flex; /* For aligning icon and label */
        flex-direction: column; /* Stack icon and label vertically by default if both shown */
        align-items: center; /* Center content horizontally */
        justify-content: center; /* Center content vertically */
        white-space: nowrap; /* Prevent text wrapping that could break layout */
      }
      .tab:hover {
        background-color: rgba(var(--rgb-primary-color), 0.1);
        color: var(--primary-text-color);
      }
      .tab.active {
        border-bottom: 2px solid var(--primary-color);
        color: var(--primary-color);
        font-weight: 500;
      }

      .tab-icon {
        display: none; /* Hidden by default on larger screens */
        font-size: 24px; /* Default icon size */
        --mdc-icon-size: 24px;
      }

      .tab-label {
        display: inline; /* Shown by default on larger screens */
        font-size: 14px; /* Default label size */
      }

      /* Responsive styles for tabs */
      @media (max-width: 768px) {
        .tabs {
          justify-content: space-around; /* Distribute icons more evenly */
        }
        .tab {
          padding: 8px; /* Reduce padding for smaller screens */
          min-width: 50px; /* Ensure tabs have a minimum width for touch targets */
          flex-grow: 0; /* Prevent icons from growing too much */
        }
        .tab-icon {
          display: inline-block; /* Show icons on smaller screens */
        }
        .tab-label {
          display: none; /* Hide text labels on smaller screens */
        }
      }

      /* Styles for content sections previously in this file */
      /* e.g., .settings-section, .bar, .mini-bar, .section-group, etc. */
      /* Keep styles for potential globally used elements if any */

      /* Keep Cropper styles if cropper overlay is rendered here */
      .cropper-overlay {
        /* ... */
      }
      .cropper-container {
        /* ... */
      }
      /* ... other cropper styles ... */
    `}firstUpdated(){var e;super.firstUpdated(),this.addEventListener("request-tab-change",this._handleRequestTabChange),this._highlightService=et.getInstance(),this._refreshEntityList(),this._highlightService.handleTabChange(this.activeTab,this.config||{},!1!==(null===(e=this.config)||void 0===e?void 0:e.help_highlight)),setTimeout((()=>{this._migrateToIndividualSections(),this._forceSaveConfig()}),100),document.addEventListener("click",(e=>{var t;(null===(t=this.shadowRoot)||void 0===t?void 0:t.contains(e.target))||(this._showEntityList=!1)})),this._loadCropperJS()}_refreshEntityList(){}_onEntityInputChange(e){}_onEntityFocus(e,t){}_getFilteredEntities(){}_selectEntity(e,t){}async _loadCropperJS(){}_renderImageCropper(){}_applyCrop(){}updated(e){}};Kt([be({attribute:!1})],Gt.prototype,"hass",void 0),Kt([be()],Gt.prototype,"config",void 0),Kt([fe()],Gt.prototype,"activeTab",void 0),Kt([fe()],Gt.prototype,"_cropperActive",void 0),Kt([fe()],Gt.prototype,"_cropperImage",void 0),Kt([fe()],Gt.prototype,"_cropperTargetField",void 0),Kt([fe()],Gt.prototype,"_vehicleCropExpanded",void 0),Kt([fe()],Gt.prototype,"_actionCropExpanded",void 0),Kt([fe()],Gt.prototype,"_showEntityList",void 0),Kt([fe()],Gt.prototype,"_activeField",void 0),Kt([fe()],Gt.prototype,"_entityFilter",void 0),Kt([fe()],Gt.prototype,"_entities",void 0),Gt=Kt([_e("ultra-vehicle-card-editor")],Gt);var Wt=function(e,t,i,n){var a,o=arguments.length,r=o<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,n);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(r=(o<3?a(r):o>3?a(t,i,r):a(t,i))||r);return o>3&&r&&Object.defineProperty(t,i,r),r};let Zt=class extends ge{constructor(){super(...arguments),this.value="",this.label="Navigation Target",this.disabled=!1}_valueChanged(e){const t=e.detail.value;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t},bubbles:!0,composed:!0}))}render(){return Z`
      <div class="navigation-picker">
        ${this.label?Z`<label class="label">${this.label}</label>`:""}
        ${this.helper?Z`<div class="helper">${this.helper}</div>`:""}

        <ha-selector
          .hass=${this.hass}
          .selector=${{navigation:{}}}
          .value=${this.value}
          .disabled=${this.disabled}
          @value-changed=${this._valueChanged}
        ></ha-selector>
      </div>
    `}};Zt.styles=c`
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
  `,Wt([be({attribute:!1})],Zt.prototype,"hass",void 0),Wt([be()],Zt.prototype,"value",void 0),Wt([be()],Zt.prototype,"label",void 0),Wt([be()],Zt.prototype,"helper",void 0),Wt([be({type:Boolean})],Zt.prototype,"disabled",void 0),Zt=Wt([_e("navigation-picker")],Zt),window.customCards=window.customCards||[],window.customCards.push({type:"ultra-vehicle-card",name:"Ultra Vehicle Card",description:"A card that displays vehicle information with fuel/charge level, range, location, mileage, and a customizable icon grid.",preview:!0,documentationURL:"https://github.com/WJDDesigns/Ultra-Vehicle-Card",version:tt})})();