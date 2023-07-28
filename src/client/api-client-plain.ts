import { ApiClientBase, IMessage } from "./api-client-base";
import { HelloRequest } from "../protos/api_pb";

/**
 * A net client for the ESPHome Native API using plain text communication.
 */
export class ApiClientPlain extends ApiClientBase {

    /**
     * The writeVarInt function takes a number and returns a Buffer.
     * The number is encoded as an unsigned variable-length integer using the LEB128 encoding.
     * The first byte of the integer is written, and if it's less than 0x80 (128), then that's
     * the number. If it's greater than or equal to 0x80, then we continue writing more bytes:
     * The next byte has its 7 least significant bits written as another part of our number, plus one;
     * and so on until we get a byte less than 0x80. This allows us to encode numbers using fewer bytes
     * for small numbers and more bytes for large ones.
     *
     * @param value {number} the integer that is being converted into a varint
     *
     * @return A buffer with a varint representation of the number
     */
    protected static writeVarInt(value: number): Uint8Array {
        if (value <= 0x7F) return Buffer.from([ value ])
        const result: number[] = [];
        while (value) {
            const temp = value & 0x7F;
            value >>= 7;
            result.push(value ? temp | 0x80 : temp);
        }

        return new Uint8Array(result);
    }

    /**
     * The readVarInt function reads a variable-length integer from the given buffer using the LEB128 encoding.
     * The first byte of the integer is read, and if it's less than 0x80 (128), then that's
     * the number. If it's greater than or equal to 0x80, then we continue reading more bytes:
     * The next byte has its 7 least significant bits added as another part of our number, plus one;
     * and so on until we get a byte less than 0x80. This allows us to encode numbers using fewer bytes for small numbers
     * and more bytes for large ones.
     *
     * @param buffer {Uint8Array} Pass the data received from the socket
     * @return [number, number] A tuple with the number and the number of bytes read
     */
    private static readVarInt(buffer: Uint8Array): [ number, number ] {
        let result = 0;
        let bitpos = 0;
        let size = 0;
        for (const byte of buffer) {
            result |= (byte & 0x7F) << bitpos;
            bitpos += 7;
            size++;
            if ((byte & 0x80) === 0) return [ result, size ];
        }
        return [ 0, 0 ];
    }

    /**
     * The sendMessage function is used to send a message to the ESPHome device.
     * It will first lookup the message type and serialize the message.
     *
     * @param message {T} the message that is being written
     * @return A boolean indicating if the message was sent
     */
    public async sendMessage<T extends object>(message: T): Promise<boolean> {
        const messageId = this.getMessageId(message);
        const serialized = this.serializeMessage(message);
        if (!serialized || !messageId) return Promise.resolve(false);

        // Encode the message with the required header into a frame
        const frame = this.encodeFrame(messageId, serialized);

        // Write the frame to the connection.
        return this.write(frame);
    }

    /**
     * The decodeFrame function takes a Uint8Array of bytes and returns an object containing the message ID, payload,
     * and size of the frame. The function first extracts the start byte (0 or 1) and then uses readVarInt to extract
     * both the frame length (the number of bytes in this frame) as well as its message ID. If either value is invalid,
     * undefined is returned. Otherwise, we extract just that portion of our buffer that contains this entire frame's data
     * into a new Uint8Array called payload . Finally we return an object with all three values:
     * {messageId , payload , size}
     *
     * @param bytes {Uint8Array} the data received from the socket
     * @return The messageid, payload and size of the frame
     */
    protected decodeFrame(bytes: Uint8Array): { messageId: number, payload: Uint8Array, size: number } | undefined {
        // Extract the start byte and the frame length.
        const startByte = bytes[0];
        const [ frameSize, lengthSize ] = ApiClientPlain.readVarInt(bytes.subarray(1));
        const [ messageId, messageIdSize ] = ApiClientPlain.readVarInt(bytes.subarray(1 + lengthSize));

        // Check that the start byte is 0 or 1 and that the buffer contains the entire frame.
        if (startByte > 1 || 1 + lengthSize + messageIdSize + frameSize > bytes.length) {
            return undefined;
        }

        // Extract the frame data.
        const start = 1 + lengthSize + messageIdSize;
        const payload = bytes.subarray(start, start + frameSize);
        return { messageId, payload, size: start + frameSize };
    }

    /**
     * The encodeFrame function takes a messageId and an array of bytes as input.
     * It returns a new Uint8Array with the following structure:
     * [ 0x00, sizeVarInt, idVarInt, ...bytes ]
     *
     * @param messageId {number} Identify the message type
     * @param bytes {Uint8Array} Pass the message data to be encoded
     *
     * @return A uint8array, which is an array of bytes
     */
    protected encodeFrame(messageId: number, bytes: Uint8Array): Uint8Array {
        const prefix = 0x00;
        const sizeVarInt = ApiClientPlain.writeVarInt(bytes.length);
        const idVarInt = ApiClientPlain.writeVarInt(messageId);
        return new Uint8Array([ prefix, ...sizeVarInt, ...idVarInt, ...bytes ]);
    }

    /**
     * Invoked when the socket is connected.
     * Sends a HelloRequest to the ESPHome device.
     */
    protected override async handleConnect(): Promise<void> {
        await super.handleConnect();

        await this.sendMessage(HelloRequest.create({}));
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
    protected async parseDataFrame(buffer: Buffer): Promise<number | undefined> {
        // Decode the frame into the message id and payload
        const result = this.decodeFrame(buffer);
        if (!result) {
            return undefined; // If the frame is incomplete, stop processing frames.
        }

        // Lookup the message type and emit the message
        const messageType = this.messageTypes.get(result.messageId);
        if (!messageType) {
            // Most likely this is a message we don't yet know about. Skip it.
            return undefined;
        }

        const message = this.deserializeMessage(result.messageId, result.payload);
        this.emit(messageType.typeName, {
            type: messageType.typeName,
            options: messageType.options,
            fields: messageType.fields,
            payload: message
        } as IMessage<any>);
    }
}
