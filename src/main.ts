import { Adapter, AdapterOptions } from "@iobroker/adapter-core";
import { EventEmitter } from "events";
import { SenseClient, SenseParser } from "./lib";
import { Device } from "./interfaces";

class SenseEnergyMonitor extends Adapter {
    private client?: SenseClient;
    private expireSeconds?: number;
    private parser?: SenseParser;

    public constructor(options: Partial<AdapterOptions> = {}) {
        super({
            ...options,
            name: "sense-energy-monitor",
        });
        EventEmitter.captureRejections = true;
        this.on("ready", this.onReady.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        // Reset the connection indicator during startup
        this.setState("info.connection", false, true);

        // Create a new SenseClient instance and authenticate with the Sense API
        const client = new SenseClient({ email: this.config.email, password: this.config.password });
        client.on("authenticated", async () => {
            this.log.info("authenticated with Sense API");
            await client.start(); // start real-time updates
        });
        client.on("connected", async () => {
            this.log.info("receiving Sense API real-time updates");
            await this.setStateAsync("info.connection", false, true);
        });
        client.on("disconnected", async () => {
            this.log.info("disconnected from Sense API");
            await this.setStateAsync("info.connection", false, true);
        });
        client.on("error", async (error) => {
            this.log.error(error);
            await this.setStateAsync("info.connection", false, true);
        })

        this.parser = new SenseParser({
            deviceFilter: this.config.deviceFilter,
            deviceUpdateSeconds: this.config.deviceUpdateSeconds,
            generalUpdateSeconds: this.config.generalUpdateSeconds,
        });
        this.expireSeconds = Math.max(this.config.deviceUpdateSeconds, this.config.generalUpdateSeconds) * 2;

        this.parser.on("gridVoltages", (voltages: number[]) => {
            this.setState("grid.voltageL1", { val: voltages[0], ack: true, expire: this.expireSeconds });
            this.setState("grid.voltageL2", { val: voltages[1], ack: true, expire: this.expireSeconds });
            this.log.debug(`voltage update: ${voltages.join("V, ")}V`);
        });

        this.parser.on("gridFrequency", (hz: number) => {
            this.setState("grid.frequency", { val: hz, ack: true, expire: this.expireSeconds });
            this.log.debug(`frequency update: ${hz}hz`);
        });

        this.parser.on("gridWatts", (watts: number[]) => {
            this.setState("grid.wattage", { val: watts[0] + watts[1], ack: true, expire: this.expireSeconds });
            this.setState("grid.wattageL1", { val: watts[0], ack: true, expire: this.expireSeconds });
            this.setState("grid.wattageL2", { val: watts[1], ack: true, expire: this.expireSeconds });
            this.log.debug(`gridWatts update: ${watts.join("W, ")}W`);
        });

        this.parser.on("device", async (device: Device) => {
            this.log.debug(`device update: ${device.name} (${device.id}) ${device.w}W`);

            await this.setObjectNotExistsAsync(`devices.${device.id}`, {
                type: "device",
                common: {
                    name: device.name,
                    icon: device.icon
                },
                native: {},
            });

            await this.setObjectNotExistsAsync(`devices.${device.id}.watts`, {
                type: "state",
                common: {
                    name: `${device.name} Watts`,
                    type: "number",
                    role: "value",
                    unit: "W",
                    read: true,
                    write: false,
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
                    write: false,
                },
                native: {}
            });

            await this.setStateAsync(`devices.${device.id}.watts`, {
                val: device.w,
                ack: true,
                expire: device.w ? this.expireSeconds : undefined
            });

            await this.setStateAsync(`devices.${device.id}.power`, {
                val: device.w > this.config.onWattThreshold,
                ack: true,
                expire: device.w ? this.expireSeconds : undefined
            });
        });

        client.on("realtime_update", this.parser.parse.bind(this.parser));

        await client.authenticate();
        this.client = client;
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    private onUnload(callback: () => void): void {
        this.log.info("shutting down Sense Energy Monitor adapter");
        try {
            if (this.client) {
                this.client.removeAllListeners();
                this.client.stop().then(() => this.client = undefined);
            }
        } finally {
            callback();
        }
    }


}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<AdapterOptions> | undefined) => new SenseEnergyMonitor(options);
} else {
    // otherwise start the instance directly
    (() => new SenseEnergyMonitor())();
}
