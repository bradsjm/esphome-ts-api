import { TcpConnection, NetConnectionOpts } from "./tcp-connection";
import * as api from "../protos/api_pb";
import {
    BinaryReadOptions,
    BinaryWriteOptions,
    FieldInfo,
    IMessageType,
    JsonValue, MESSAGE_TYPE
} from "@protobuf-ts/runtime";

/**
 * A function that is returned from onMessage and onMessageOnce that provides an easy
 * way to unsubscribe from a subscription using the off function.
 */
export type Unsubscribe = {
    name: string;
    listener: (message: any) => void;
    off: () => void;
}

/**
 * The IMessage interface is used to represent a message received from the ESPHome device.
 * The entity contains:
 * * the message type name (e.g. "ListEntitiesBinarySensorRequest")
 * * options (e.g. { "id": 1 })
 * * field meta data (e.g. { "name": "key", "no": 1, "type": "uint32" })
 * * the message payload itself (e.g. { "key": 1 })
 */
export interface IMessage<T extends object> {
    fields: ReadonlyArray<FieldInfo>;
    options: { readonly [name: string]: JsonValue };
    payload: Readonly<T>;
    type: string;
}

/**
 * The IEntityKey interface is used to identify an ESPHome entity by its key (integer).
 */
export interface IEntityKey {
    key: number;
}

/**
 * The IResponseEntity interface is used to identify an ESPHome response message.
 * It contains the name, objectId and uniqueId of the entity along with the key.
 */
export interface IResponseEntity extends IEntityKey {
    name: string;
    objectId: string;
    uniqueId: string;

    [name: string]: boolean | number | string | Array<boolean | number | string>;
}

/**
 * Options for a ESPHome Api Client.
 */
export interface ESPHomeOpts extends NetConnectionOpts {
    // Binary options for reading messages (optional).
    binaryReadOptions?: BinaryReadOptions;
    // Binary options for writing messages (optional).
    binaryWriteOptions?: BinaryWriteOptions;
    // The optional client info string to send to the ESPHome device upon connection.
    clientInfo?: string;
    // Noise Encryption Key (Base 64) should match the key in the ESPHome configuration.
    encryptionKey?: string;
    // The expected server name to verify the ESPHome device against (optional).
    expectedServerName?: string;
    // The password for the ESPHome device should match the password in the ESPHome configuration.
    password?: string;
}

/**
 * A net client for the ESPHome Native API.
 */
export abstract class ApiClientBase extends TcpConnection {
    protected buffer: Buffer = Buffer.alloc(0);
    protected bufferIndex = 0;
    protected readonly messageTypes: Map<number, IMessageType<any>>;

    /**
     * The constructor function for the ESPHome class.
     *
     * @param espHomeOptions {ESPHomeOpts} options that were passed to the constructor function
     *
     * @return A new instance of the class
     */
    constructor(protected espHomeOptions: ESPHomeOpts) {
        super(espHomeOptions);

        // Create a map of message ids to message types used when receiving messages.
        this.messageTypes = new Map((Object.values(api) as IMessageType<any>[])
            .filter(type => type?.options?.id) // Filter out messages without an id.
            .map(type => [ type.options.id as number, type ]));

        // Register all the event handlers.
        this.registerGlobalHandlers();
    }

    /**
     * The destroy function is called when the stream is no longer needed.
     * It can be used to clean up resources such as event listeners or timers.
     */
    override destroy(): void {
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
    public offMessage<T extends object>(event: IMessageType<any>, listener: (message: IMessage<T>) => void): this {
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
    public onMessage<T extends object>(event: IMessageType<any>, listener: (message: IMessage<T>) => void): Unsubscribe {
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
    public onMessageOnce<T extends object>(event: IMessageType<any>, listener: (message: IMessage<T>) => void): Unsubscribe {
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
    public async receiveMessage<T extends object>(event: IMessageType<any>, timeout: number = 5000): Promise<IMessage<T>> {
        return new Promise<IMessage<T>>((resolve, reject) => {
            const subscription = this.onMessageOnce(event, (message: IMessage<T>) => {
                resolve(message);
            });

            setTimeout(() => {
                subscription.off();
                reject(new Error(`Timeout waiting for message ${event.typeName}`));
            }, timeout);
        });
    }

    /**
     * The sendMessage function is used to send an API message to the ESPHome device.
     * The message types are defined in the protos/api.proto file.
     *
     * @param message {T} the message that is being sent
     */
    public abstract sendMessage<T extends object>(message: T): Promise<boolean>;

    /**
     * The sendMessageAwaitResponse function is used to send an API message to the ESPHome device
     * and wait for a response message to be received. It returns a promise that resolves to the
     * response message when it is received or rejects with an error if the timeout is reached.
     *
     * @param message {T} the message that is being sent
     * @param responseMessageType the type of message that is being waited for
     * @param timeout {number} The timeout in milliseconds (default: 5 seconds)
     */
    public async sendMessageAwaitResponse<T extends object, R extends object>(message: T, responseMessageType: IMessageType<R>, timeout: number = 5000): Promise<IMessage<R>> {
        const response = this.receiveMessage<R>(responseMessageType, timeout);
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
    protected deserializeMessage(messageId: number, payload: Uint8Array): any {
        const messageType = this.messageTypes.get(messageId);
        return messageType ? messageType.fromBinary(payload, this.espHomeOptions.binaryReadOptions) : undefined;
    }

    /**
     * Returns the message id of the given message or undefined if the message id is not known.
     *
     * @param message {object} the message that is being read
     * @return The message id of the given message or undefined if the message id is not known
     */
    protected getMessageId(message: object): number | undefined {
        const messageType = this.getMessageType(message);
        return messageType?.options?.id as (number | undefined);
    }

    /**
     * Returns the message type of the given message.
     *
     * @param message {T} the message that is being read
     * @return The message type of the given message or undefined if the message type is not known
     */
    protected getMessageType<T extends object>(message: T): IMessageType<T> | undefined {
        return (message as any)[MESSAGE_TYPE] as IMessageType<T> | undefined;
    }

    /**
     * The handleData function is called whenever new data is received from the socket.
     * It will decode all the frames in the buffer and emit any messages that are found.
     *
     * @param data {Buffer} Pass the data received from the socket
     *
     * @return A promise that resolves to a buffer
     */
    protected override async handleData(data: Buffer): Promise<Buffer> {
        data = await super.handleData(data);

        // Add the new data to the buffer.
        this.buffer = Buffer.concat([ this.buffer, data ]);

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
     * The handleFrame function is called whenever a new frame is received from the socket.
     * It will attempt to decode the frame and emit the message if it is found.
     * It returns the length of the frame if it was decoded, otherwise undefined.
     *
     * @param buffer {Buffer} the buffer containing the frame
     *
     * @return The length of the frame if it was decoded, otherwise undefined
     */
    protected abstract parseDataFrame(buffer: Buffer): Promise<number | undefined>;

    /**
     * Serializes the given message into a Uint8Array.
     *
     * @param message {T} the message that is being written
     * @return The serialized message or undefined if the message type is not known
     */
    protected serializeMessage<T extends object>(message: T): Uint8Array | undefined {
        const messageType = this.getMessageType(message);
        return messageType?.toBinary(message, this.espHomeOptions.binaryWriteOptions);
    }

    /**
     * The registerGlobalHandlers function is called from the constructor and is used to register all the event handlers.
     * It registers handlers for the GetTimeRequest and PingRequest messages from the device.
     */
    private registerGlobalHandlers(): void {
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
