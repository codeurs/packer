/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./example/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./example/index.js":
/*!**************************!*\
  !*** ./example/index.js ***!
  \**************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _index_less__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.less */ \"./example/index.less\");\n/* harmony import */ var _index_less__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_0__);\n\nconsole.log('ok');\n\n//# sourceURL=webpack:///./example/index.js?");

/***/ }),

/***/ "./example/index.less":
/*!****************************!*\
  !*** ./example/index.less ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("throw new Error(\"Module build failed: ModuleBuildError: Module build failed: TypeError: Path must be a string. Received undefined\\n    at assertPath (path.js:28:11)\\n    at Object.dirname (path.js:1364:5)\\n    at /home/ben/projects/packer/node_modules/iconfont-webpack-plugin/lib/postcss-plugin.js:156:24\\n    at LazyResult.run (/home/ben/projects/packer/node_modules/postcss-loader/node_modules/postcss/lib/lazy-result.js:277:20)\\n    at LazyResult.asyncTick (/home/ben/projects/packer/node_modules/postcss-loader/node_modules/postcss/lib/lazy-result.js:192:32)\\n    at processing.Promise.then._this2.processed (/home/ben/projects/packer/node_modules/postcss-loader/node_modules/postcss/lib/lazy-result.js:231:20)\\n    at new Promise (<anonymous>)\\n    at LazyResult.async (/home/ben/projects/packer/node_modules/postcss-loader/node_modules/postcss/lib/lazy-result.js:228:27)\\n    at LazyResult.then (/home/ben/projects/packer/node_modules/postcss-loader/node_modules/postcss/lib/lazy-result.js:134:21)\\n    at Promise.resolve.then.then (/home/ben/projects/packer/node_modules/postcss-loader/lib/index.js:147:8)\\n    at <anonymous>\\n    at runLoaders (/home/ben/projects/packer/node_modules/webpack/lib/NormalModule.js:236:20)\\n    at /home/ben/projects/packer/node_modules/loader-runner/lib/LoaderRunner.js:364:11\\n    at /home/ben/projects/packer/node_modules/loader-runner/lib/LoaderRunner.js:230:18\\n    at context.callback (/home/ben/projects/packer/node_modules/loader-runner/lib/LoaderRunner.js:111:13)\\n    at Promise.resolve.then.then.catch (/home/ben/projects/packer/node_modules/postcss-loader/lib/index.js:196:71)\\n    at <anonymous>\");\n\n//# sourceURL=webpack:///./example/index.less?");

/***/ })

/******/ });