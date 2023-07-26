# ESPHome Typescript API

## Description

This is a comprehensive description of 'project_name'. It outlines what the project is about, what problems it solves,
and a high-level overview of the major components.

The `ApiClientBase` class is a net client for communicating with ESPHome devices using the ESPHome Native API. It
provides a set of methods for sending and receiving messages to and from the ESPHome device.

## Functionality

The `ApiClientBase` class offers the following functionality:

1. **Sending Messages:** You can use the `sendMessage` method to send API messages to the ESPHome device. The message
   types are defined in the `protos/api.proto` file.

2. **Receiving Messages:** The class provides methods for handling incoming messages. You can use
   the `onMessage`, `onMessageOnce`, and `receiveMessage` methods to listen for specific message types and respond
   accordingly.

3. **Serializing and Deserializing Messages:** The class handles serialization and deserialization of messages. It
   automatically converts message objects to binary data and vice versa.

4. **Timeout Handling:** The `receiveMessage` method allows setting a timeout. If the specified message is not received
   within the timeout duration, the promise will be rejected.

## Installation

Here's a step-by-step guide on how to get a development environment running.

1. npm install --save esphome-ts-api

## Usage

Here's a quick rundown on how to use 'project_name':

'usage_example'

## Contributing

Contributions are what make an open-source community an amazing place to learn, inspire, and contribute. Any
contributions you make are greatly appreciated.

## Contact

If you have any questions, feel free to reach out!

'contact_info'

## License

Include information about your project's license here.

## Example Usage

```typescript
import { createApiClient, IMessage } from "./net";
import {
    BinarySensorStateResponse,
    DeviceInfoRequest,
    DeviceInfoResponse,
    ListEntitiesDoneResponse
} from "./protos/api_pb";

async function runApiClient() {
    // Instantiate your custom API client with required options
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
        client.onMessage(BinarySensorStateResponse, (message: IMessage<BinarySensorStateResponse>) => {
            console.log(`Received binary sensor state response: ${message.payload.key} = ${message.payload.state}`);
        });

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
