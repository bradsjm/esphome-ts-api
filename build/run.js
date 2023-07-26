"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = require("./net");
const api_pb_1 = require("./protos/api_pb");
// const client = createApiClient({
//     host: "10.10.20.169",
//     port: 6053,
//     encryptionKey: "cU9UQpCS9xESU70eOC5ZHwhaY8AY8p3xDO0Kn+fcS20="
// });
const client = (0, net_1.createApiClient)({
    host: "10.10.20.119",
    port: 6053,
});
client.on("error", (error) => {
    console.error(error);
});
client.once("connect", async () => {
    console.log("connected");
});
client.on("data", (data) => {
    console.debug(`received ${data.length} bytes`);
});
client.onMessageOnce(api_pb_1.HelloResponse, async (message) => {
    console.info(`received HelloResponse: ${JSON.stringify(message, null, 2)}`);
    await client.sendMessage(api_pb_1.ConnectRequest.create({}));
});
client.onMessageOnce(api_pb_1.ConnectResponse, async (message) => {
    console.info(`received ConnectResponse: ${message.payload.invalidPassword}`);
    await client.sendMessage(api_pb_1.DeviceInfoRequest.create({}));
});
client.onMessageOnce(api_pb_1.DeviceInfoResponse, async (message) => {
    console.info(`received DeviceInfoResponse: ${JSON.stringify(message, null, 2)}`);
});
client.connect();
//# sourceMappingURL=run.js.map