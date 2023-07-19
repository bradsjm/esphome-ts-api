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
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
const API_URL = "https://api.sense.com/apiservice/api/v1/";
const WS_URL = "wss://clientrt.sense.com/monitors/%id%/realtimefeed";
const RECONNECT_INTERVAL = 1e4;
const MAX_RECONNECT_INTERVAL = 6e4;
const API_TIMEOUT = 5e3;
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
  static isTokenExpired(token) {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 5)
      return true;
    let jwtPayload;
    try {
      jwtPayload = import_jsonwebtoken.default.decode(tokenParts.slice(2).join("."));
    } catch (e) {
      return true;
    }
    if (!(jwtPayload == null ? void 0 : jwtPayload.exp))
      return true;
    const currentTimestampInSeconds = Date.now() / 1e3;
    return currentTimestampInSeconds >= jwtPayload.exp;
  }
  async logout() {
    await this.httpsClient.get("logout");
    this._account = void 0;
    this.emit("logout");
  }
  async start() {
    this.scheduleReconnect();
    if (!await this.authorize()) {
      return;
    }
    const id = String(this._account.monitors[0].id);
    const token = this._account.access_token;
    const params = (0, import_querystring.stringify)({ access_token: token });
    const wsUrl = WS_URL.replace("%id%", id) + "?" + params;
    const ws = new import_ws.default(wsUrl, [], { timeout: API_TIMEOUT });
    ws.on("open", () => this.onConnected());
    ws.on("message", (event) => this.onMessage(event));
    ws.on("close", (code, reason) => this.onDisconnected(code, reason));
    ws.on("error", (error) => this.emit("error", error));
    this.webSocket = ws;
  }
  async stop() {
    this.unscheduleReconnect();
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = void 0;
    }
  }
  async authenticate() {
    var _a;
    this._account = void 0;
    const response = await this.httpsClient.post(
      "authenticate",
      (0, import_querystring.stringify)({
        email: this.options.email,
        password: this.options.password
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
  async authorize() {
    var _a;
    if (((_a = this._account) == null ? void 0 : _a.access_token) == null) {
      return this.authenticate();
    }
    if (this._account.refresh_token && SenseClient.isTokenExpired(this._account.access_token)) {
      return this.renewToken();
    }
    return true;
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
  async onDisconnected(code, reason) {
    this.emit("disconnected", code, reason);
    if (this.autoReconnect) {
      this.scheduleReconnect();
    }
  }
  onMessage(data) {
    try {
      const json = JSON.parse(data.toString());
      if (json.type == "error") {
        this.emit("error", new Error("sense error: " + json.payload.error_reason));
      } else {
        this.emit(json.type, json.payload);
      }
    } catch (error) {
      this.emit("error", error);
    }
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
  scheduleReconnect() {
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
  unscheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = void 0;
      this.reconnectInterval = RECONNECT_INTERVAL;
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SenseClient
});
//# sourceMappingURL=sense-client.js.map
