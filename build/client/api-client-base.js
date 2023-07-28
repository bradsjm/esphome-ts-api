"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClientBase = void 0;
const tcp_connection_1 = require("../net/tcp-connection");
const api = __importStar(require("../protos/api_pb"));
const runtime_1 = require("@protobuf-ts/runtime");
/**
 * A net client for the ESPHome Native API.
 */
class ApiClientBase extends tcp_connection_1.TcpConnection {
    /**
     * The constructor function for the ESPHome class.
     *
     * @param espHomeOptions {ESPHomeOpts} options that were passed to the constructor function
     *
     * @return A new instance of the class
     */
    constructor(espHomeOptions) {
        super(espHomeOptions);
        this.espHomeOptions = espHomeOptions;
        this.buffer = Buffer.alloc(0);
        this.bufferIndex = 0;
        // Create a map of message ids to message types used when receiving messages.
        this.messageTypes = new Map(Object.values(api)
            .filter(type => type?.options?.id) // Filter out messages without an id.
            .map(type => [type.options.id, type]));
        // Register all the event handlers.
        this.registerGlobalHandlers();
    }
    /**
     * The destroy function is called when the stream is no longer needed.
     * It can be used to clean up resources such as event listeners or timers.
     */
    destroy() {
        super.destroy();
        this.removeAllListeners();
        this.buffer = Buffer.alloc(0);
        this.bufferIndex = 0;
    }
    /**
     * The offMessage function is a syntactic suger wrapper for the EventEmitter.off function.
     * It removes the specified listener from the message event.
     *
     * @param event {IMessageType<any>} Specify the type of message that will be listened for
     * @param listener (message: {IMessage<T>}) Specify the type of message that will be received
     *
     * @return The instance of the class that it is called on for chaining calls
     */
    offMessage(event, listener) {
        super.off(event.typeName, listener);
        return this;
    }
    /**
     * The onMessage function is a syntactic suger wrapper for the EventEmitter.on function.
     * It adds the specified listener to the message event and returns a function that then
     * be used to remove the listener.
     *
     * @param event {IMessageType<any>} Specify the type of message that will be listened for
     * @param listener (message: {IMessage<T>}) Specify the type of message that will be received
     *
     * @return A function that can be used to remove the listener
     */
    onMessage(event, listener) {
        super.on(event.typeName, listener);
        return {
            name: event.typeName,
            listener: listener,
            off: () => super.off(event.typeName, listener)
        };
    }
    /**
     * The onMessageOnce function is a syntactic suger wrapper for the EventEmitter.once function,
     * which allows you to register an event listener that will be called at most once.
     * It returns a function that can then be used to remove the listener.
     *
     * @param event {IMessageType<any>} Specify the type of message that will be listened for
     * @param listener (message: {IMessage<T>}) Specify the type of message that will be received
     *
     * @return A function that can be used to remove the listener
     */
    onMessageOnce(event, listener) {
        super.once(event.typeName, listener);
        return {
            name: event.typeName,
            listener: listener,
            off: () => super.off(event.typeName, listener)
        };
    }
    /**
     * The receiveMessage function is used to wait for a specific message to be received.
     * It returns a promise that resolves to the message when it is received or rejects
     * with an error if the timeout is reached.
     *
     * @param event {IMessageType<any>} Specify the type of message that will be listened for
     * @param timeout {number} The timeout in milliseconds (default: 5 seconds)
     * @return promise that resolves to the message when it is received or rejects if timeout
     */
    async receiveMessage(event, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const subscription = this.onMessageOnce(event, (message) => {
                resolve(message);
            });
            setTimeout(() => {
                subscription.off();
                reject(new Error(`Timeout waiting for message ${event.typeName}`));
            }, timeout);
        });
    }
    /**
     * The sendMessageAwaitResponse function is used to send an API message to the ESPHome device
     * and wait for a response message to be received. It returns a promise that resolves to the
     * response message when it is received or rejects with an error if the timeout is reached.
     *
     * @param message {T} the message that is being sent
     * @param responseMessageType the type of message that is being waited for
     * @param timeout {number} The timeout in milliseconds (default: 5 seconds)
     */
    async sendMessageAwaitResponse(message, responseMessageType, timeout = 5000) {
        const response = this.receiveMessage(responseMessageType, timeout);
        await this.sendMessage(message);
        return response;
    }
    /**
     * The deserializeMessage function takes a messageId and payload as parameters.
     * It then uses the messageId to find the corresponding MessageType in this.messages,
     * which is a Map of all registered messages (see registerMessage). If no matching MessageType is found, undefined is returned.
     * Otherwise, it calls fromBinary on the MessageType with payload and this.espHomeOptions.binaryReadOptions as arguments to deserialize it into an object that can be used by client code (see BinarySerializer for more information).
     *
     * @param messageId {number} the type of message that is being read
     * @param payload {Uint8Array} the binary serialized message
     *
     * @return The deserialized message object
     */
    deserializeMessage(messageId, payload) {
        const messageType = this.messageTypes.get(messageId);
        return messageType ? messageType.fromBinary(payload, this.espHomeOptions.binaryReadOptions) : undefined;
    }
    /**
     * Returns the message id of the given message or undefined if the message id is not known.
     *
     * @param message {object} the message that is being read
     * @return The message id of the given message or undefined if the message id is not known
     */
    getMessageId(message) {
        const messageType = this.getMessageType(message);
        return messageType?.options?.id;
    }
    /**
     * Returns the message type of the given message.
     *
     * @param message {T} the message that is being read
     * @return The message type of the given message or undefined if the message type is not known
     */
    getMessageType(message) {
        return message[runtime_1.MESSAGE_TYPE];
    }
    /**
     * The handleData function is called whenever new data is received from the socket.
     * It will decode all the frames in the buffer and emit any messages that are found.
     *
     * @param data {Buffer} Pass the data received from the socket
     *
     * @return A promise that resolves to a buffer
     */
    async handleData(data) {
        data = await super.handleData(data);
        // Add the new data to the buffer.
        this.buffer = Buffer.concat([this.buffer, data]);
        // Process all the frames in the buffer
        while (true) {
            // Wait until we have at least 3 bytes (the minimum possible message size)
            if (this.bufferIndex + 3 > this.buffer.length) {
                break;
            }
            // Read the message from the payload, if undefined, then we don't have a full frame yet.
            const length = await this.parseDataFrame(this.buffer.subarray(this.bufferIndex));
            // Advance the buffer index by the length of the frame.
            if (length) {
                this.bufferIndex += length;
            }
        }
        return data;
    }
    /**
     * Serializes the given message into a Uint8Array.
     *
     * @param message {T} the message that is being written
     * @return The serialized message or undefined if the message type is not known
     */
    serializeMessage(message) {
        const messageType = this.getMessageType(message);
        return messageType?.toBinary(message, this.espHomeOptions.binaryWriteOptions);
    }
    /**
     * The registerGlobalHandlers function is called from the constructor and is used to register all the event handlers.
     * It registers handlers for the GetTimeRequest and PingRequest messages from the device.
     */
    registerGlobalHandlers() {
        // Register handler for time requests from the ESPHome device
        this.on(api.GetTimeRequest.typeName, async () => {
            await this.sendMessage(api.GetTimeResponse.create({
                epochSeconds: Math.floor(Date.now() / 1000)
            }));
        });
        // Register handler for ping requests from the ESPHome device
        this.on(api.PingRequest.typeName, async () => {
            await this.sendMessage(api.PingResponse.create());
        });
    }
}
exports.ApiClientBase = ApiClientBase;
//# sourceMappingURL=api-client-base.js.map