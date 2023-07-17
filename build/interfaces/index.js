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
var interfaces_exports = {};
__export(interfaces_exports, {
  Device: () => import_sense_update.Device,
  SenseAuthResponse: () => import_sense_auth_response.SenseAuthResponse,
  SenseDevices: () => import_sense_devices.SenseDevices,
  SenseMonitor: () => import_sense_auth_response.SenseMonitor,
  SenseMonitorAttributes: () => import_sense_monitor_attributes.SenseMonitorAttributes,
  SenseSettings: () => import_sense_settings.SenseSettings,
  SenseUpdate: () => import_sense_update.SenseUpdate
});
module.exports = __toCommonJS(interfaces_exports);
var import_sense_auth_response = require("./sense-auth-response");
var import_sense_devices = require("./sense-devices");
var import_sense_update = require("./sense-update");
var import_sense_settings = require("../types/sense-settings");
var import_sense_monitor_attributes = require("../types/sense-monitor-attributes");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Device,
  SenseAuthResponse,
  SenseDevices,
  SenseMonitor,
  SenseMonitorAttributes,
  SenseSettings,
  SenseUpdate
});
//# sourceMappingURL=index.js.map
