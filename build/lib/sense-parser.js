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
var sense_parser_exports = {};
__export(sense_parser_exports, {
  SenseParser: () => SenseParser
});
module.exports = __toCommonJS(sense_parser_exports);
var import_events = require("events");
var import_device_icons = require("./device-icons");
const GENERIC_DEVICES = ["unknown", "always_on", "solar"];
class SenseParser extends import_events.EventEmitter {
  constructor(options) {
    super();
    this.previousDeviceList = [];
    this.options = options;
    this.lastUpdateTime = {
      gridVoltages: {},
      gridFrequency: {},
      gridWatts: {},
      device: {}
    };
  }
  static isLocallyAdministered(macAddress) {
    return typeof macAddress === "string" && ["2", "6", "A", "E"].includes(macAddress[1].toUpperCase());
  }
  parse(update) {
    if (update.voltage != null) {
      update.voltage = update.voltage.map((voltage) => Math.round(voltage));
      this.emitIfDue("gridVoltages", "grid", update.voltage, this.options.generalUpdateSeconds);
    }
    if (update.hz != null) {
      update.hz = Math.round(update.hz);
      this.emitIfDue("gridFrequency", "grid", update.hz, this.options.generalUpdateSeconds);
    }
    if (update.channels != null) {
      update.channels = update.channels.map((watts) => Math.round(watts));
      this.emitIfDue("gridWatts", "grid", update.channels, this.options.generalUpdateSeconds);
    }
    const filtered = update.devices.filter(
      (device) => !this.options.deviceFilter.includes(device.name) && !this.options.deviceFilter.includes(device.id) && device.tags["DeviceListAllowed"] === "true" && !SenseParser.isLocallyAdministered(String(device.tags["DUID"]))
    );
    this.handleMissingDevices(filtered);
    this.parseActiveDevices(filtered);
  }
  emitIfDue(eventName, key, data, interval) {
    const currentTime = Date.now();
    if (!this.lastUpdateTime[eventName][key] || currentTime - this.lastUpdateTime[eventName][key] >= interval * 1e3) {
      this.emit(eventName, data);
      this.lastUpdateTime[eventName][key] = interval ? currentTime : 0;
    }
  }
  handleMissingDevices(deviceList) {
    this.previousDeviceList.forEach((lastDevice) => {
      if (!deviceList.some((device) => device.id === lastDevice.id)) {
        this.emitIfDue("device", lastDevice.id, { ...lastDevice, w: 0 }, 0);
      }
    });
    this.previousDeviceList = deviceList;
  }
  parseActiveDevices(devices) {
    devices.forEach((device) => {
      device.w = Math.round(device.w);
      const interval = GENERIC_DEVICES.includes(device.id) ? this.options.generalUpdateSeconds : this.options.deviceUpdateSeconds;
      device.icon = (0, import_device_icons.getIcon)(device.icon);
      this.emitIfDue("device", device.id, device, interval);
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SenseParser
});
//# sourceMappingURL=sense-parser.js.map
