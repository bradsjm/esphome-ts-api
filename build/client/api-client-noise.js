"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoiseEncryptor = exports.ApiClientNoise = void 0;
const api_client_base_1 = require("./api-client-base");
const api_pb_1 = require("../protos/api_pb");
const createNoise = require("@richardhopton/noise-c.wasm");
/**
 * The HandshakeEnum is used to track the state of the encryption handshake.
 */
var HandshakeEnum;
(function (HandshakeEnum) {
    HandshakeEnum[HandshakeEnum["NONE"] = 0] = "NONE";
    HandshakeEnum[HandshakeEnum["HELLO"] = 1] = "HELLO";
    HandshakeEnum[HandshakeEnum["HANDSHAKE"] = 2] = "HANDSHAKE";
    HandshakeEnum[HandshakeEnum["READY"] = 3] = "READY";
})(HandshakeEnum || (HandshakeEnum = {}));
/**
 * Noise Protocol Framework used for the encryption of ESPHome data.
 *
 * * NNpsk0: No client send, No server send, Pre-shared key, no (0) round trips
 * * Curve25519: an elliptic curve used for Diffie-Hellman key agreement
 * * ChaChaPoly: ChaCha20-Poly1305 AEAD cipher suite used for symmetric encryption of data
 * * SHA256: SHA-256 hash function used for hashing
 */
const NOISE_PROTOCOL = "Noise_NNpsk0_25519_ChaChaPoly_SHA256";
/**
 * A net noise for the ESPHome Native API using noise encrypted communication.
 */
class ApiClientNoise extends api_client_base_1.ApiClientBase {
    /**
     * The constructor function for the ESPHome class.
     *
     * @param espHomeOptions {ESPHomeOpts} options that were passed to the constructor function
     */
    constructor(espHomeOptions) {
        super(espHomeOptions);
        this.espHomeOptions = espHomeOptions;
        this.handshakeState = HandshakeEnum.NONE;
        // Check that the encryption key is set.
        if (!espHomeOptions.encryptionKey) {
            throw new Error("Encryption key is required");
        }
        // Initialize the noise encryption instance.
        this.noiseEncryptor = new NoiseEncryptor(espHomeOptions.encryptionKey);
        void this.noiseEncryptor.initialize(NOISE_PROTOCOL);
    }
    /**
     * The sendMessage function is used to send a message to the ESPHome device.
     * It will automatically serialize the message and encode with the message id and length.
     *
     * @param message {T} the message that is being written
     * @return A promise that resolves to true if the message was sent successfully, otherwise false
     */
    async sendMessage(message) {
        const serialized = this.serializeMessage(message);
        const messageId = this.getMessageId(message);
        if (!serialized || !messageId)
            return Promise.resolve(false);
        // Encrypted protobuf serialized messages are prefixed with the message id and length.
        return this.write(new Uint8Array([
            (messageId >> 8) & 255, messageId & 255,
            (serialized.length >> 8) & 255, serialized.length & 255,
            ...serialized
        ]));
    }
    /**
     * The write function is used to write data to the socket.
     * It will automatically encrypt and encode the data into a frame before writing it
     * if encryption handshake is complete and the encryptor is enabled.
     *
     * @param buffer {Uint8Array} the data to be written to the socket
     * @return A promise that resolves to true if the data was written successfully, otherwise false
     */
    async write(buffer = new Uint8Array()) {
        // If the handshake is complete, encrypt the payload.
        buffer = this.noiseEncryptor.encrypt(buffer);
        // Prefix the frame with the encryption protocol and frame length.
        buffer = new Uint8Array([
            0x01,
            (buffer.length >> 8) & 255, buffer.length & 255,
            ...buffer
        ]);
        // Write the buffer to the socket.
        return super.write(buffer);
    }
    /**
     * Invoked when the socket is connected.
     * It sends an empty message to initiate the encryption protocol handshake.
     */
    async handleConnect() {
        await super.handleConnect();
        await this.write();
        this.handshakeState = HandshakeEnum.HELLO;
    }
    /**
     * The parseDataFrame function is called whenever a new frame is received from the socket.
     * It will attempt to decode the frame and emit the message if it is found.
     * It returns the length of the frame if it was decoded, otherwise undefined.
     *
     * @param buffer {Buffer} the buffer containing the frame
     * @return The length of the frame if it was decoded, otherwise undefined
     */
    async parseDataFrame(buffer) {
        const startByte = buffer[0];
        const frameSize = (buffer[1] << 8) | buffer[2];
        // Check that the start byte is 0 or 1 and that the buffer contains the entire frame.
        if (startByte != 1 || 3 + frameSize > buffer.length) {
            return undefined;
        }
        // Extract the payload from the buffer.
        buffer = buffer.subarray(3, 3 + frameSize);
        switch (this.handshakeState) {
            case HandshakeEnum.HELLO:
                if (!await this.handleHello(buffer, this.espHomeOptions.expectedServerName)) {
                    this.disconnect();
                    return undefined;
                }
                this.handshakeState = HandshakeEnum.HANDSHAKE;
                break;
            case HandshakeEnum.HANDSHAKE:
                this.noiseEncryptor.handleHandshake(buffer);
                this.handshakeState = HandshakeEnum.READY;
                await this.sendMessage(api_pb_1.HelloRequest.create({}));
                break;
            case HandshakeEnum.READY:
                this.handlePayload(buffer);
                break;
        }
        return 3 + frameSize;
    }
    /**
     * Handles the hello message from the ESPHome device.
     * It checks that the encryption protocol is 0x01 and that the server name matches if specified.
     * It then sends the noise handshake message.
     *
     * @param payload {Uint8Array} the payload of the hello message
     * @param expectedServerName {string} the expected server name (optional)
     * @return true if the hello message was handled successfully, otherwise false
     */
    async handleHello(payload, expectedServerName) {
        // Check that the encryption protocol is 0x01.
        const chosenProto = payload[0];
        if (chosenProto != 0x01) {
            throw new Error(`Unknown protocol selected by server ${chosenProto}`);
        }
        // Check that the server name matches if specified.
        const serverName = payload.subarray(1, payload.indexOf(0)).toString();
        if (expectedServerName && serverName != expectedServerName) {
            throw new Error(`Server name mismatch ${serverName} != ${expectedServerName}`);
        }
        this.emit("serverName", serverName);
        // Send the noise handshake message.
        await this.write(new Uint8Array([0, ...this.noiseEncryptor.writeMessage()]));
        return true;
    }
    /**
     * Decrypts the payload and emits the message if it was deserialized successfully.
     * It returns true if the payload was decrypted successfully, otherwise false.
     *
     * @param payload {Uint8Array} the payload to be decrypted
     * @return true if the payload was decrypted successfully, otherwise false
     */
    handlePayload(payload) {
        payload = this.noiseEncryptor.decrypt(payload);
        if (payload.length < 4) {
            this.emit("error", new Error("Unable to decrypt payload"));
            return false;
        }
        const messageId = (payload[0] << 8) | payload[1];
        const messageLength = (payload[2] << 8) | payload[3];
        const messageType = this.messageTypes.get(messageId);
        if (!messageType) {
            // Most likely this is a message we don't yet know about. Skip it.
            return false;
        }
        // Deserialize the message.
        const message = this.deserializeMessage(messageId, payload.subarray(4, 4 + messageLength));
        if (!message) {
            this.emit("error", new Error(`Unable to deserialize message ${messageType.typeName}`));
            return false;
        }
        // Emit the message.
        this.emit(messageType.typeName, {
            type: messageType.typeName,
            options: messageType.options,
            fields: messageType.fields,
            payload: message
        });
        return true;
    }
}
exports.ApiClientNoise = ApiClientNoise;
class NoiseEncryptor {
    /**
     * The constructor function for the NoiseEncryptor class.
     *
     * @param psk {string} the pre-shared key to use for encryption
     */
    constructor(psk) {
        this.psk = psk;
    }
    /**
     * Returns true if the noise instance is initialized, otherwise false.
     */
    get isInitialized() {
        return this.noiseInstance != undefined;
    }
    /**
     * Returns true if the encryptor and decryptor are ready, otherwise false.
     */
    get isReady() {
        return this.encryptor != undefined && this.decryptor != undefined;
    }
    /**
     * Decrypts the payload using the decryptor.
     *
     * @param payload {Uint8Array} the payload to be decrypted
     * @return the decrypted payload
     */
    decrypt(payload) {
        if (!this.decryptor) {
            throw new Error("Decryption not ready");
        }
        return this.decryptor.DecryptWithAd(NoiseEncryptor.NONE, payload);
    }
    /**
     * Encrypts the payload using the encryptor.
     *
     * @param payload {Uint8Array} the payload to be encrypted
     * @return the encrypted payload
     */
    encrypt(payload) {
        if (!this.encryptor) {
            throw new Error("Encryption not ready");
        }
        return this.encryptor.EncryptWithAd(NoiseEncryptor.NONE, payload);
    }
    /**
     * Handles the handshake message from the ESPHome device.
     * It checks that the header is 0 and then splits the noise instance into encryptor and decryptor.
     * It returns true if the handshake was handled successfully, otherwise false.
     *
     * @param payload {Uint8Array} the payload of the handshake message
     * @return true if the handshake was handled successfully, otherwise false
     */
    handleHandshake(payload) {
        const header = payload[0];
        const message = payload.subarray(1);
        if (header != 0) {
            throw new Error(`Handshake failure: ${message.toString()}`);
        }
        if (!this.noiseInstance) {
            throw new Error("Handshake failure: noise not initialized");
        }
        this.noiseInstance.ReadMessage(message, true);
        [this.encryptor, this.decryptor] = this.noiseInstance.Split();
    }
    /**
     * Initializes the noise instance with the specified protocol and pre-shared key.
     *
     * @param protocol {string} the noise protocol to use
     */
    async initialize(protocol) {
        if (!this.noiseInstance) {
            this.noiseInstance = await this.createNoiseInstance(protocol, this.psk);
        }
    }
    /**
     * Writes a message to the noise instance.
     *
     * @param payload {Uint8Array} the payload to be written (optional)
     */
    writeMessage(payload) {
        if (!this.noiseInstance) {
            throw new Error("Handshake failure: noise not initialized");
        }
        return this.noiseInstance.WriteMessage(payload);
    }
    /**
     * Creates a new noise instance with the specified protocol and pre-shared key.
     * The noise instance is created asynchronously using the WASM module.
     *
     * @param protocol the noise protocol to use
     * @param psk the pre-shared key to use
     * @return a promise that resolves to the noise instance
     */
    async createNoiseInstance(protocol, psk) {
        return new Promise((resolve, reject) => {
            createNoise(noise => {
                const instance = noise.HandshakeState(protocol, noise.constants.NOISE_ROLE_INITIATOR);
                try {
                    instance.Initialize(new Uint8Array(Buffer.from("NoiseAPIInit\x00\x00")), // prologue
                    null, // local static private key (none)
                    null, // remote static public key (none)
                    Buffer.from(psk, "base64") // preshared key
                    );
                    resolve(instance);
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
}
// An empty Uint8Array that can be re-used for parameters.
NoiseEncryptor.NONE = new Uint8Array();
exports.NoiseEncryptor = NoiseEncryptor;
//# sourceMappingURL=api-client-noise.js.map