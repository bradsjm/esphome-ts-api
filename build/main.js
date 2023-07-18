"use strict";
var import_adapter_core = require("@iobroker/adapter-core");
var import_events = require("events");
var import_lib = require("./lib");
class SenseEnergyMonitor extends import_adapter_core.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "sense-energy-monitor"
    });
    import_events.EventEmitter.captureRejections = true;
    this.on("ready", this.onReady.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  async onReady() {
    this.setState("info.connection", false, true);
    const client = new import_lib.SenseClient({ email: this.config.email, password: this.config.password });
    client.on("authenticated", async () => {
      this.log.info("authenticated to Sense");
    });
    client.on("connected", async () => {
      this.log.info("connected to Sense websocket");
    });
    client.on("hello", async () => {
      this.log.info("receiving data from Sense");
      await this.setStateAsync("info.connection", true, true);
    });
    client.on("disconnected", async (reason) => {
      this.log.info("disconnected from Sense API due to " + reason);
      await this.setStateAsync("info.connection", false, true);
    });
    client.on("error", async (error) => {
      this.log.error(error);
      await this.setStateAsync("info.connection", false, true);
    });
    const parser = new import_lib.SenseParser({
      deviceFilter: this.config.deviceFilter,
      deviceUpdateSeconds: this.config.deviceUpdateSeconds,
      generalUpdateSeconds: this.config.generalUpdateSeconds
    });
    client.on("realtime_update", parser.parse.bind(parser));
    this.expireSeconds = Math.max(this.config.deviceUpdateSeconds, this.config.generalUpdateSeconds) * 2;
    parser.on("gridVoltages", (voltages) => {
      this.setState("grid.voltageL1", { val: voltages[0], ack: true, expire: this.expireSeconds });
      this.setState("grid.voltageL2", { val: voltages[1], ack: true, expire: this.expireSeconds });
      this.log.debug(`voltage update: ${voltages.join("V, ")}V`);
    });
    parser.on("gridFrequency", (hz) => {
      this.setState("grid.frequency", { val: hz, ack: true, expire: this.expireSeconds });
      this.log.debug(`frequency update: ${hz}hz`);
    });
    parser.on("gridWatts", (watts) => {
      this.setState("grid.wattage", { val: watts[0] + watts[1], ack: true, expire: this.expireSeconds });
      this.setState("grid.wattageL1", { val: watts[0], ack: true, expire: this.expireSeconds });
      this.setState("grid.wattageL2", { val: watts[1], ack: true, expire: this.expireSeconds });
      this.log.debug(`gridWatts update: ${watts.join("W, ")}W`);
    });
    parser.on("device", async (device) => {
      this.log.debug(`device update: ${device.name} (${device.id}) ${device.w}W`);
      await this.setObjectNotExistsAsync(`devices.${device.id}`, {
        type: "device",
        common: {
          name: device.name,
          icon: device.icon
        },
        native: {}
      });
      await this.setObjectNotExistsAsync(`devices.${device.id}.watts`, {
        type: "state",
        common: {
          name: `${device.name} Watts`,
          type: "number",
          role: "value",
          unit: "W",
          read: true,
          write: false
        },
        native: {}
      });
      await this.setObjectNotExistsAsync(`devices.${device.id}.power`, {
        type: "state",
        common: {
          name: `${device.name} Power`,
          type: "boolean",
          role: "switch.power",
          read: true,
          write: false
        },
        native: {}
      });
      await this.setStateAsync(`devices.${device.id}.watts`, {
        val: device.w,
        ack: true,
        expire: device.w ? this.expireSeconds : void 0
      });
      await this.setStateAsync(`devices.${device.id}.power`, {
        val: device.w > this.config.onWattThreshold,
        ack: true,
        expire: device.w ? this.expireSeconds : void 0
      });
    });
    this.client = client;
    this.parser = parser;
    await client.start();
  }
  onUnload(callback) {
    this.log.info("shutting down Sense Energy Monitor adapter");
    try {
      if (this.client) {
        this.client.removeAllListeners();
        this.client.stop().then(() => this.client = void 0);
      }
    } finally {
      callback();
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new SenseEnergyMonitor(options);
} else {
  (() => new SenseEnergyMonitor())();
}
//# sourceMappingURL=main.js.map
