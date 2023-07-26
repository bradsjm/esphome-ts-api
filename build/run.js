"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = require("./net");
const api_pb_1 = require("./protos/api_pb");
async function runApiClient() {
    // Instantiate your custom API client with required options
    const client = (0, net_1.createApiClient)({
        host: "192.168.1.100",
        port: 6053,
        password: "my-password",
        encryptionKey: "my-encryption-key",
        expectedServerName: "esphome-server", // Optional: expected server name for verification
    });
    try {
        // Send a message to the ESPHome device and await the response
        const requestMessage = api_pb_1.DeviceInfoRequest.create({});
        const response = await client.sendMessageAwaitResponse(requestMessage, api_pb_1.DeviceInfoResponse);
        // Handle the response message
        console.log("Received response from ESPHome device:");
        console.log(response.payload.friendlyName);
        // Listen for specific message types
        client.onMessage(api_pb_1.BinarySensorStateResponse, (message) => {
            console.log(`Received binary sensor state response: ${message.payload.key} = ${message.payload.state}`);
        });
        // Wait for a specific message to be received
        await client.receiveMessage(api_pb_1.ListEntitiesDoneResponse);
        // Connect to the ESPHome device
        client.connect();
    }
    catch (error) {
        console.error("Error communicating with ESPHome device:", error);
    }
    finally {
        // Don't forget to close the connection when done
        client.destroy();
    }
}
runApiClient();
//# sourceMappingURL=run.js.map