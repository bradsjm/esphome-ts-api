"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var sense_client_exports = {};
__export(sense_client_exports, {
  SenseClient: () => SenseClient
});
module.exports = __toCommonJS(sense_client_exports);
var import_events = require("events");
var import_ws = __toESM(require("ws"));
var import_axios = __toESM(require("axios"));
var import_querystring = require("querystring");
var import_memoizee = __toESM(require("memoizee"));
const API_URL = "https://api.sense.com/apiservice/api/v1/";
const WS_URL = "wss://clientrt.sense.com/monitors/%id%/realtimefeed?access_token=%token%";
const RECONNECT_INTERVAL = 1e4;
const MAX_RECONNECT_INTERVAL = 6e4;
const WATCHDOG_INTERVAL = 6e4;
const API_MAX_AGE = 3e5;
const API_TIMEOUT = 5e3;
const WSS_TIMEOUT = 5e3;
class SenseClient extends import_events.EventEmitter {
  constructor(options) {
    super();
    this.reconnectInterval = RECONNECT_INTERVAL;
    this._autoReconnect = true;
    this.options = options;
    this.httpsClient = import_axios.default.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT
    });
    this._getDevicesMemoized = (0, import_memoizee.default)(this._getDevices, { promise: true, maxAge: API_MAX_AGE });
  }
  get account() {
    return this._account;
  }
  get autoReconnect() {
    return this._autoReconnect;
  }
  set autoReconnect(value) {
    this._autoReconnect = value;
  }
  async authenticate() {
    var _a;
    this._account = void 0;
    const response = await this.httpsClient.post(
      "authenticate",
      (0, import_querystring.stringify)({
        email: this.options.email,
        password: this.options.password,
        remember_me: true
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    ).catch((error) => this.httpErrorHandler(error));
    if ((_a = response == null ? void 0 : response.data) == null ? void 0 : _a.authorized) {
      this.httpsClient.defaults.headers.common["Authorization"] = "bearer " + response.data.access_token;
      this._account = response.data;
      this.emit("authenticated", response.data);
      return true;
    }
    this._account = void 0;
    return false;
  }
  async getDevices(monitorId) {
    return this._getDevicesMemoized(monitorId);
  }
  async logout() {
    await this.httpsClient.get("logout");
    this._account = void 0;
    this.emit("logout");
  }
  async renewToken() {
    var _a, _b, _c;
    const response = await this.httpsClient.post("renew", (0, import_querystring.stringify)({
      "user_id": (_a = this._account) == null ? void 0 : _a.user_id,
      "refresh_token": (_b = this._account) == null ? void 0 : _b.refresh_token
    }), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }).catch((error) => this.httpErrorHandler(error));
    if ((_c = response == null ? void 0 : response.data) == null ? void 0 : _c.authorized) {
      this.httpsClient.defaults.headers.common["Authorization"] = "bearer " + response.data.access_token;
      this._account = { ...this._account, ...response.data };
      this.emit("token", response.data);
      return true;
    }
    this._account = void 0;
    return false;
  }
  async start() {
    if (!this._account) {
      throw new Error("Must authenticate first before starting websocket");
    }
    const id = String(this._account.monitors[0].id);
    const token = this._account.access_token;
    const wsUrl = WS_URL.replace("%id%", id).replace("%token%", token);
    const ws = new import_ws.default(wsUrl, [], {
      timeout: WSS_TIMEOUT
    });
    ws.onopen = () => this.onConnected();
    ws.onmessage = (event) => this.onMessage(event);
    ws.onclose = () => this.onDisconnected();
    ws.onerror = (error) => this.emit("error", error);
    this.webSocket = ws;
    this.scheduleReconnect();
  }
  async stop() {
    this.unscheduleReconnect();
    this.unscheduleWatchdog();
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = void 0;
    }
  }
  async _getDevices(monitorId) {
    const response = await this.httpsClient.get(
      `monitors/${monitorId}/devices`
    ).catch((error) => this.httpErrorHandler(error));
    if (response == null ? void 0 : response.data) {
      console.log(JSON.stringify(response.data));
      this.emit("devices", response.data);
      return response.data;
    }
  }
  httpErrorHandler(error) {
    let errorString = void 0;
    if (!error) {
      errorString = "Unknown Error";
    } else if (import_axios.default.isAxiosError(error)) {
      if (error.response) {
        errorString = `HTTP error ${error.response.status} ${error.response.statusText}}`;
      } else if (error.code) {
        errorString = error.code;
      } else if (error.request) {
        errorString = "No response received";
      }
    } else {
      errorString = error.message;
    }
    if (errorString) {
      this.emit("error", new Error(errorString));
    }
  }
  onConnected() {
    this.emit("connected");
    this.unscheduleReconnect();
  }
  async onDisconnected() {
    this.emit("disconnected");
    if (this.autoReconnect) {
      await this.renewToken();
      this.scheduleReconnect();
    }
  }
  onMessage(event) {
    this.scheduleWatchdog();
    try {
      const json = JSON.parse(event.data.toString());
      if (json.type == "error") {
        this.emit("error", new Error("sense error: " + json.payload.error_reason));
      } else {
        this.emit(json.type, json.payload);
      }
    } catch (error) {
      this.emit("error", error);
    }
  }
  scheduleReconnect() {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = void 0;
    }
    if (!this._autoReconnect)
      return;
    if (this.reconnectTimer)
      return;
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectInterval = Math.min(this.reconnectInterval * 2, MAX_RECONNECT_INTERVAL);
      this.reconnectTimer = void 0;
      await this.start();
    }, this.reconnectInterval);
  }
  scheduleWatchdog() {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
    }
    this.watchdogTimer = setTimeout(() => this.scheduleReconnect(), WATCHDOG_INTERVAL);
  }
  unscheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = void 0;
      this.reconnectInterval = RECONNECT_INTERVAL;
    }
  }
  unscheduleWatchdog() {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = void 0;
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SenseClient
});
//# sourceMappingURL=sense-client.js.map
