declare module "@richardhopton/noise-c.wasm" {
    export = createNoise;

    function createNoise(cb: (noise: Noise) => void): void;

}

interface Noise {
    constants: {
        NOISE_ROLE_INITIATOR: number;
        NOISE_ROLE_RESPONDER: number;
    }

    /**
     * The HandshakeState object, API is close to the spec: http://noiseprotocol.org/noise.html#the-handshakestate-object
     *
     * NOTE: If you ever get an exception with Error object, whose message is one of constants.NOISE_ERROR_* keys, object is no longer usable and there is no need
     * to call free() method, as it was called for you automatically already (except in ReadMessage with fallback_supported == true)
     *
     * @param protocol_name {string} The name of the Noise protocol to use, for instance, Noise_N_25519_ChaChaPoly_BLAKE2b
     * @param role {number}    The role for the new object, either constants.NOISE_ROLE_INITIATOR or constants.NOISE_ROLE_RESPONDER
     */
    HandshakeState(protocol_name: string, role: number): HandshakeState;

}

/**
 * The SymmetricState object, API is close to the spec: http://noiseprotocol.org/noise.html#the-symmetricstate-object
 *
 * NOTE: If you ever get an exception with Error object, whose message is one of constants.NOISE_ERROR_* keys, object is no longer usable and there is no need
 * to call free() method, as it was called for you automatically already
 *
 * @param {string} protocol_name The name of the Noise protocol to use, for instance, Noise_N_25519_ChaChaPoly_BLAKE2b
 */
interface SymmetricState {
    /**
     * @param {Uint8Array} ciphertext
     *
     * @return {Uint8Array}
     */
    DecryptAndHash(ciphertext: Uint8Array): Uint8Array;

    /**
     * @param {Uint8Array} plaintext
     *
     * @return {Uint8Array}
     */
    EncryptAndHash(plaintext: Uint8Array): Uint8Array;

    /**
     * @param {Uint8Array} data
     */
    MixHash(data: Uint8Array): void;

    /**
     * @param {Uint8Array} input_key_material
     */
    MixKey(input_key_material: Uint8Array): void;

    /**
     * @param {Uint8Array} input_key_material
     */
    MixKeyAndHash(input_key_material: Uint8Array): void;

    /**
     * @return {CipherState[]}
     */
    Split(): CipherState[];

    /**
     * Call this when object is not needed anymore to avoid memory leaks
     */
    free(): void;
}

interface CreateLib {
    /**
     * Create a new X25519 or X448 keypair
     *
     * @param {number} curve_id constants.NOISE_DH_CURVE25519 or constants.NOISE_DH_CURVE448
     *
     * @return {!Uint8Array[]} `[private_key, public_key]`
     *
     * @throws {TypeError} In case incorrect `curve_id` specified
     */
    CreateKeyPair(curve_id): Uint8Array[];
}

/**
 * The CipherState object, API is close to the spec: http://noiseprotocol.org/noise.html#the-cipherstate-object
 *
 * NOTE: If you ever get an exception with Error object, whose message is one of constants.NOISE_ERROR_* keys, object is no longer usable and there is no need
 * to call free() method, as it was called for you automatically already (except in EncryptWithAd and DecryptWithAd)
 *
 * @param {string} cipher constants.NOISE_CIPHER_CHACHAPOLY, constants.NOISE_CIPHER_AESGCM, etc.
 */
interface CipherState {
    /**
     * @param {Uint8Array} ad
     * @param {Uint8Array} ciphertext
     *
     * @return {Uint8Array}
     */
    DecryptWithAd(ad: Uint8Array, ciphertext: Uint8Array): Uint8Array;

    /**
     * @param {Uint8Array} ad
     * @param {Uint8Array} plaintext
     *
     * @return {Uint8Array}
     */
    EncryptWithAd(ad: Uint8Array, plaintext: Uint8Array): Uint8Array;

    HasKey(): boolean;

    /**
     * @param key {Uint8Array} 32-byte key
     */
    InitializeKey(key: Uint8Array): void;

    /**
     * @return {boolean}
     */
    Rekey(): boolean;

    /**
     * @param {number} nonce
     */
    SetNonce(nonce: number): void;
}

interface HandshakeState {
    /**
     * Might be called when GetAction() returned constants.NOISE_ACTION_FAILED and switching to fallback protocol is desired, don't forget to call Initialize()
     * after FallbackTo()
     *
     * @param pattern_id {number} One of constants.NOISE_PATTERN_*_FALLBACK*
     */
    FallbackTo(pattern_id: number): void;

    /**
     * @return {number} One of constants.NOISE_ACTION_*
     */
    GetAction(): number;

    /**
     * Gets the channel binding has if the handshake is completed otherwise throws `Error`
     *
     * @return {Uint8Array}
     *
     * @throws {Error}
     */
    GetHandshakeHash(): Uint8Array;

    /**
     * Gets raw remote static public key if available
     *
     * @return {Uint8Array} `null` if not available
     */
    GetRemotePublicKey(): Uint8Array | null;

    /**
     * Must be called after object creation and after switch to a fallback handshake.
     *
     * In case of fallback handshake it is not required to specify values that are the same as in previous Initialize() call, those will be used by default
     *
     * @param prologue {null|Uint8Array} Prologue value
     * @param ls {null|Uint8Array} Local static private key
     * @param rs {null|Uint8Array} Remote static public key
     * @param psk {null|Uint8Array} Pre-shared symmetric key
     */
    Initialize(prologue: Uint8Array | null, ls: Uint8Array | null, rs: Uint8Array | null, psk: Uint8Array | null): void;

    /**
     * Read Message
     *
     * @param message {Uint8Array} Message received from the other side
     * @param payload_needed {boolean} false if the application does not need the message payload
     * @param fallback_supported {boolean} true if application is ready to switch to fallback pattern (will throw, but without free() call on read failure)
     *
     * @return {null|Uint8Array}
     */
    ReadMessage(message: Uint8Array, payload_needed: boolean, fallback_supported = false): Uint8Array | null;

    /**
     * @return {CipherState[]} [send, receive]
     */
    Split(): CipherState[];

    /**
     * Write message
     *
     * @param payload {null|Uint8Array} null if no payload is required*
     * @return {Uint8Array} Message that should be sent to the other side
     */
    WriteMessage(payload: (Uint8Array | null) = null): Uint8Array;

    /**
     * Call this when object is not needed anymore to avoid memory leaks
     */
    free(): void;
}
