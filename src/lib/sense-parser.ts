import { Device, SenseUpdate } from "../interfaces";
import { EventEmitter } from "events";
import { getIcon } from "./device-icons";

type EventNames = "gridVoltages" | "gridFrequency" | "gridWatts" | "device";

export type SenseParserOptions = {
    deviceUpdateSeconds: number;
    generalUpdateSeconds: number;
    deviceFilter: string[];
}

const GENERIC_DEVICES = [ "unknown", "always_on", "solar" ]

/**
 * SenseParser is used to parse real-time messages from Sense.
 * It emits the following events: 'gridVoltages', 'gridFrequency', 'gridWatts' and 'device'.
 */
export class SenseParser extends EventEmitter {
    private readonly lastUpdateTime: Record<EventNames, Record<string, number>>;
    private readonly options: SenseParserOptions;
    private previousDeviceList: Device[] = [];

    /**
     * Creates a new SenseParser instance.
     */
    constructor(options: SenseParserOptions) {
        super();
        this.options = options;
        // Initialize last update times for each type of event
        this.lastUpdateTime = {
            gridVoltages: {},
            gridFrequency: {},
            gridWatts: {},
            device: {}
        };
    }

    /**
     * The parse function is used to parse real-time messages from Sense.
     *
     * @param {SenseUpdate} update - The SenseUpdate object to parse.
     */
    public parse(update: SenseUpdate): void {
        // Emit grid voltages, frequency, and watts if it has been more than a second
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

        // Detect devices no longer active
        this.handleMissingDevices(update.devices);

        // Parse active devices
        this.parseActiveDevices(update.devices);
    }

    /**
     * Emit event if more than specified time has passed since the last update.
     *
     * @param {string} eventName - Name of the event to emit.
     * @param {string} key - Key to check the last update time against.
     * @param {any} data - Data to be sent with the event.
     * @param {number} interval - Minimum time in milliseconds that must have elapsed since the last update.
     */
    private emitIfDue(eventName: EventNames, key: string, data: any, interval: number): void {
        const currentTime = Date.now();
        // If this key has not been used before or enough time has passed
        if (!this.lastUpdateTime[eventName][key] || currentTime - this.lastUpdateTime[eventName][key] >= (interval * 1000)) {
            this.emit(eventName, data);
            this.lastUpdateTime[eventName][key] = interval ? currentTime : 0;
        }
    }


    /**
     * The handleMissingDevices function is used to find devices that are no longer present in the current deviceList list.
     * It does this by comparing the previousDeviceList with the current deviceList list and emitting a 0 watt event for any
     * devices that were previously present but are not in the new deviceList list. The function also updates
     * previousDeviceList to be equal to whatever was passed into it as an argument (the new, updated deviceList list).
     * This way, when handleMissingDevices is called again on a future iteration of getDataAndPublish(), it will have
     * access to both lists of devices so that it can compare them.
     *
     * @param deviceList: {Device[]} the array of devices from the sense api
     */
    private handleMissingDevices(deviceList: Device[]): void {
        // Find devices no longer present to emit a 0 watt event
        this.previousDeviceList.forEach(lastDevice => {
            if (!deviceList.some(device => device.id === lastDevice.id)) {
                this.emitIfDue("device", lastDevice.id, { ...lastDevice, w: 0 }, 0);
            }
        });

        // Update the previousDeviceList
        this.previousDeviceList = deviceList;
    }

    /**
     * The parseActiveDevices function takes an array of devices and emits a device event for each one.
     *
     * @param devices: {Device[]} array of devices from the sense api
     */
    private parseActiveDevices(devices: Device[]): void {
        const filtered = devices.filter((device) =>
            !this.options.deviceFilter.includes(device.name) &&
            !this.options.deviceFilter.includes(device.id) &&
            device.tags["DeviceListAllowed"] === "true");

        // Emit device event for each device
        filtered.forEach((device) => {
            // Round watt value to the nearest integer
            device.w = Math.round(device.w);

            // Set interval to the deviceUpdateSeconds if the device is not a generic device, otherwise use generalUpdateSeconds
            const interval = GENERIC_DEVICES.includes(device.id) ? this.options.generalUpdateSeconds : this.options.deviceUpdateSeconds;

            // Convert from icon name to icon SVG
            device.icon = getIcon(device.icon)

            // Emit device event if it has been more than the configured interval for this device id
            this.emitIfDue("device", device.id, device, interval);
        });
    }
}
