"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkultra_card"] = self["webpackChunkultra_card"] || []).push([["src_modules_pagebreak-module_ts"],{

/***/ "./src/modules/pagebreak-module.ts":
/*!*****************************************!*\
  !*** ./src/modules/pagebreak-module.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   UltraPageBreakModule: () => (/* binding */ UltraPageBreakModule)\n/* harmony export */ });\n/* harmony import */ var lit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lit */ \"./src/node_modules/lit/index.js\");\n/* harmony import */ var _base_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base-module */ \"./src/modules/base-module.ts\");\n\n\nclass UltraPageBreakModule extends _base_module__WEBPACK_IMPORTED_MODULE_1__.BaseUltraModule {\n    constructor() {\n        super(...arguments);\n        this.metadata = {\n            type: 'pagebreak',\n            title: 'Page Break',\n            description: 'Separates slider content into pages',\n            author: 'WJD Designs',\n            version: '1.0.0',\n            icon: 'mdi:format-page-break',\n            category: 'layout',\n            tags: ['slider', 'page', 'break', 'separator', 'divider'],\n        };\n    }\n    createDefault(id, hass) {\n        return {\n            id: id || this.generateId('pagebreak'),\n            type: 'pagebreak',\n            display_mode: 'always',\n            display_conditions: [],\n        };\n    }\n    renderGeneralTab(module, hass, config, updateModule) {\n        var _a;\n        const lang = ((_a = hass === null || hass === void 0 ? void 0 : hass.locale) === null || _a === void 0 ? void 0 : _a.language) || 'en';\n        return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html) `\n      ${this.injectUcFormStyles()}\n      <div class=\"module-general-settings\">\n        <!-- Info Section -->\n        <div\n          class=\"settings-section\"\n          style=\"background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;\"\n        >\n          <div style=\"display: flex; align-items: flex-start; gap: 12px;\">\n            <ha-icon\n              icon=\"mdi:information\"\n              style=\"color: var(--info-color); margin-top: 2px; flex-shrink: 0; font-size: 24px;\"\n            ></ha-icon>\n            <div style=\"font-size: 14px; line-height: 1.5; color: var(--primary-text-color);\">\n              <strong>How Page Breaks Work:</strong><br />\n              Page breaks are only visible in the editor. When used inside a Slider Layout, they\n              separate content into different slides. All modules before a page break belong to one\n              page, and modules after it belong to the next page.\n            </div>\n          </div>\n        </div>\n      </div>\n    `;\n    }\n    renderPreview(module, hass, config, previewContext) {\n        // Page breaks are only for editor organization - don't render anything in the card preview\n        return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html) ``;\n    }\n    validate(module) {\n        const baseValidation = super.validate(module);\n        return baseValidation;\n    }\n    getStyles() {\n        return `\n      .pagebreak-module-container {\n        user-select: none;\n      }\n    `;\n    }\n}\n\n\n//# sourceURL=webpack://ultra-card/./src/modules/pagebreak-module.ts?");

/***/ })

}]);