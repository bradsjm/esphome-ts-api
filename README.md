# ESPHome Typescript API

## Description

The `createApiClient` factory creates a net client for communicating with ESPHome devices using the ESPHome Native API.
It provides a set of methods for sending and receiving messages to and from the ESPHome device and supports encryption.

## Functionality

The `creatApiClient` factory will return an `ApiClient` class (either ApiClientPlain or ApiClientNoise) depending on
if encryptionKey option is provided. The class offers the following functionality:

1. **Connecting:** You can use the `connect` method to connect to the ESPHome device. The class will automatically
   handle encryption and decryption of messages (as long as encryption is enabled on the ESPHome device). It will also
   reconnect automatically if the connection is lost.

2. **Handling Connection Events**: The class will emit `connect` and `disconnect` events when the connection state
   changes. You can use the `onConnect` and `onDisconnect` methods to listen for these events.

3. **Sending Messages:** You can use the `sendMessage` method to send API messages to the ESPHome device. The message
   types are defined in the `protos/api.proto` file.

4. **Receiving Messages:** The class provides methods for handling incoming messages. You can use
   the `onMessage`, `onMessageOnce`, and `receiveMessage` methods to listen for specific message types and respond
   accordingly.

5. **Handling Errors:** The class will emit an `error` event if an error occurs. You can use the `onError` method to
   listen for errors.

6. **Disconnecting:** Use the `disconnect` method to disconnect from the ESPHome device.

## Installation

Use the following command to install the package:

1. npm install --save esphome-ts-api

## Usage

## Example Usage

The following example shows how to use the `createApiClient` factory to create a client and connect to an ESPHome
device.

The options object passed to the `createApiClient` factory can contain the following properties:

- `autoReconnect` Whether to automatically reconnect to the ESPHome device if the connection is lost. Defaults to
  `true`.
- `maxBackoffTime` The maximum backoff time in milliseconds to wait between reconnect attempts. Defaults to `90000`.
- `maxReconnectAttempts` The maximum number of reconnect attempts to make before giving up. Defaults to `60`.
- `clientInfo` The optional client info string to send to the ESPHome device upon connection.
- `encryptionKey` Noise Encryption Key (Base 64) should match the key in the ESPHome configuration.
- `expectedServerName` The expected server name to verify the ESPHome device against (optional).
- `password` The password for the ESPHome device should match the password in the ESPHome configuration.

```typescript
import { createApiClient, IMessage } from "esphome-ts-api/net";
import {
    BinarySensorStateResponse,
    DeviceInfoRequest,
    DeviceInfoResponse,
    ListEntitiesDoneResponse,
    ListEntitiesBinarySensorResponse,
    ListEntitiesRequest
} from "esphome-ts-api/protos/api_pb";

async function runApiClient() {
    // Instantiate your ESPHome API client with required options
    const client = createApiClient({
        host: '192.168.1.100', // ESPHome device IP address
        port: 6053, // ESPHome device API port
        password: 'my-password', // Optional: API password
        encryptionKey: 'my-encryption-key', // Optional: API encryption key
        expectedServerName: 'esphome-server', // Optional: expected server name for verification
    });

    try {
        // Send a message to the ESPHome device and await the response
        const requestMessage = DeviceInfoRequest.create({})
        const response = await client.sendMessageAwaitResponse(requestMessage, DeviceInfoResponse);

        // Handle the response message
        console.log('Received response from ESPHome device:');
        console.log(response.payload.friendlyName);

        // Listen for specific message types
        client.onMessage(ListEntitiesBinarySensorResponse, (message: IMessage<ListEntitiesBinarySensorResponse>) => {
            console.log(`Received binary sensor state response: ${message.payload.key} = ${message.payload.state}`);
        });

        // Send a request for entities to the ESPHome device
        client.sendMessage(ListEntitiesRequest.create({}));

        // Wait for a specific message to be received
        await client.receiveMessage(ListEntitiesDoneResponse);

        // Connect to the ESPHome device
        client.connect();
    } catch (error) {
        console.error('Error communicating with ESPHome device:', error);
    } finally {
        // Don't forget to close the connection when done
        client.destroy();
    }
}

runApiClient();
```

## Contributing

Contributions are what make an open-source community an amazing place to learn, inspire, and contribute. Any
contributions you make are greatly appreciated. Please see the [contributing guide](CONTRIBUTING.md) for more
information.

## Acknowledgements

This code would not be possible without the amazing work of the [ESPHome](https://esphome.io/) team. Thank you for
making home automation easy and fun! This code is based on the existing Python client code in the
[aioesphomeapi](https://github.com/esphome/aioesphomeapi) project.

## License

Distributed under the MIT License. See `LICENSE` for more information.
