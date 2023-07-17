"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var lib_exports = {};
__export(lib_exports, {
  SenseClient: () => import_sense_client.SenseClient,
  SenseClientOptions: () => import_sense_client.SenseClientOptions,
  SenseParser: () => import_sense_parser.SenseParser,
  SenseParserOptions: () => import_sense_parser.SenseParserOptions,
  getIcon: () => import_device_icons.getIcon
});
module.exports = __toCommonJS(lib_exports);
var import_sense_client = require("./sense-client");
var import_sense_parser = require("./sense-parser");
var import_device_icons = require("./device-icons");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SenseClient,
  SenseClientOptions,
  SenseParser,
  SenseParserOptions,
  getIcon
});
//# sourceMappingURL=index.js.map
