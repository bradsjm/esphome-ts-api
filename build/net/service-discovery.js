"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceDiscovery = void 0;
const events_1 = __importDefault(require("events"));
const multicast_dns_1 = __importDefault(require("multicast-dns"));
// The service name that we are looking for
const SERVICE_NAME = "_esphomelib._tcp.local";
/**
 * The Service Discovery class is used to discover devices on the local net.
 */
class ServiceDiscovery extends events_1.default {
    /**
     * Creates an instance of ServiceDiscovery.
     *
     * @param options {mdns.Options} Options for multicast-dns (optional)
     */
    constructor(options = {}) {
        super();
        this.options = options;
    }
    /**
     * The destroy function is used to stop the mDNS service and release resources.
     */
    destroy() {
        if (this.mdns) {
            this.mdns.removeAllListeners();
            this.mdns.destroy();
        }
        this.mdns = undefined;
    }
    /**
     * The start function is used to start the mDNS service.
     * It will query for services with the name _esphomelib._tcp.local
     * and emit a device event for each device found.
     *
     * @emits error: {Error} Emitted if an error occurs
     */
    start() {
        this.mdns = (0, multicast_dns_1.default)(this.options);
        this.mdns.on("response", this.onResponse.bind(this));
        this.mdns.query(SERVICE_NAME, "PTR", (err) => {
            if (err instanceof Error)
                this.emit("error", err);
        });
    }
    /**
     * The response function is called when a response packet is received.
     * It checks the response for the PTR record, and if it exists, it will
     * iterate through all of the additional records to find A and TXT records.
     * If an A record exists, then we know that this device has a hostname (and not just an IP address).
     * If a TXT record exists, then we know that this device has metadata associated with it.
     * The metadata is stored in key-value pairs separated by commas within quotes.
     *
     * @param response: ResponsePacket Parse the response packet
     * @param rinfo: RemoteInfo Get the ip address of the device
     *
     * @emits device: {DeviceInfo} Emitted when a device is found
     */
    onResponse(response, rinfo) {
        // Check if the response contains any answers
        if (!response.additionals)
            return;
        // Check if the response contains a PTR record for the service name
        const PTR = response.answers.find((answer) => answer.type === "PTR" && answer.name === SERVICE_NAME);
        if (!PTR)
            return;
        // Check if the response contains additional records
        if (response.answers.length >= response.additionals.length) {
            response.additionals = response.additionals.concat(response.answers);
        }
        // Parse the response
        const device = {
            address: rinfo.address,
            family: rinfo.family,
            host: "",
            port: 0,
            meta: {},
            ...this.parseRecords(response.additionals)
        };
        // Emit the device event
        this.emit("device", device);
    }
    /**
     * The parseRecords function takes an array of Answer objects and returns a partial DeviceInfo object.
     *
     * @param records: {Array<Answer>} The array of records that we received from the device.
     *
     * @return A Partial<DeviceInfo> object containing the information from the records.
     */
    parseRecords(records) {
        const device = {};
        records.forEach((answer) => {
            switch (answer.type) {
                case "A":
                    device.host = answer.name;
                    break;
                case "SRV":
                    device.port = answer.data.port;
                    break;
                case "TXT":
                    device.meta = this.parseTXTRecord(answer);
                    break;
            }
        });
        return device;
    }
    /**
     * The parseTXTRecord function takes a TXT record and returns an object with the key-value pairs.
     *
     * @param record: {TxtAnswer} The TXT record that we want to parse
     *
     * @return An record with key-value pairs
     */
    parseTXTRecord(record) {
        const keyValuePairs = {};
        record.data.toString().split(",").forEach((e) => {
            const [key, value] = e.split("=");
            keyValuePairs[key] = value;
        });
        return keyValuePairs;
    }
}
exports.ServiceDiscovery = ServiceDiscovery;
//# sourceMappingURL=service-discovery.js.map