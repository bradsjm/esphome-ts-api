"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TcpConnection = void 0;
const net_1 = require("net");
const events_1 = __importDefault(require("events"));
/**
 * A wrapper around a net.Socket that handles automatic reconnection and pinging
 * and provides a pipeline for transforming inbound and outbound data.
 *
 * @event close Emitted when the connection is closed.
 * @event connect Emitted when the connection is established.
 * @event data Emitted when data is received.
 * @event end Emitted when the connection is ended.
 * @event error Emitted when an error occurs.
 * @event lookup Emitted after resolving the host name but before connecting.
 * @event ready Emitted when the write buffer is drained.
 * @event timeout Emitted if the connection times out from inactivity.
 * @event drain Emitted when the write buffer becomes empty.
 * @event reconnect Emitted when a reconnect attempt is made.
 *
 */
class TcpConnection extends events_1.default {
    /**
     * Creates a new Connection ready to connect.
     *
     * @param options The options for the connection.
     * @param options.autoReconnect Whether to automatically reconnect when the connection is closed.
     * @param options.maxBackoffTime The maximum time to wait between reconnect attempts.
     * @param options.maxReconnectAttempts The maximum number of times to attempt to reconnect.
     * @param options.pingInterval The interval at which to send ping payloads.
     * @param options.pingPayload The payload to send when pinging.
     * @param options.pingTimeout The time to wait for a response to a ping before reconnecting.
     * @param options.socket The socket to use for the connection.
     *
     * Other options are passed directly to net.connect().
     * @param options.host The host to connect to.
     * @param options.port The port to connect to.     * @param options.localAddress The local interface to bind for net connections.
     * @param options.localPort The local port to bind for net connections.
     * @param options.family The IP address family to use when resolving host and hostname. Valid values are 4 or 6. When unspecified, both IP v4 and v6 will be used.
     * @param options.hints The hints passed to getaddrinfo(3) to resolve host and hostname. When unspecified, it is set to 0 (meaning hints aren't specified).
     * @param options.lookup A function that gets executed on a new connection. It is passed the hostname and a callback as arguments. The callback must be called with the canonical hostname (as a string) and any other DNS records (as an array of objects) that get returned from dns.lookup().
     * @param options.timeout The connection timeout in milliseconds.
     * @param options.noDelay Disables the Nagle algorithm (defaults to true).
     * @param options.keepAlive Enables/disables keep-alive functionality (defaults to true).
     * @param options.initialDelay The number of milliseconds to wait before sending the first keepalive probe on an idle socket.
     * @param options.autoSelectFamily When set to true, it tries to connect first with IPv6. When set to false, it tries to connect first with IPv4.
     * @param options.autoSelectFamilyAttemptTimeout The timeout for trying to connect with the first family (IPv6 or IPv4).
     */
    constructor(options) {
        super();
        this.pipeline = [];
        this.connectionOptions = {
            autoReconnect: true,
            maxReconnectAttempts: 60,
            maxBackoffTime: 90000,
            pingInterval: 20000,
            pingTimeout: 90000,
            noDelay: true,
            keepAlive: true,
            ...options
        };
        this._socket = this.connectionOptions.socket ?? new net_1.Socket(this.connectionOptions);
        this._reconnectAttempts = 0;
        this._wasManuallyClosed = false;
        this.initialize();
    }
    /**
     * Gets the number of times the connection has been reconnected.
     */
    get reconnectAttempts() {
        return this._reconnectAttempts;
    }
    /**
     * Gets whether the connection was manually closed.
     */
    get wasManuallyClosed() {
        return this._wasManuallyClosed;
    }
    /**
     * Gets whether the connection is currently waiting to reconnect.
     */
    get isReconnecting() {
        return this._socket.readyState != "open" && this.watchdogTimer != undefined;
    }
    /**
     * Gets the current ready state of the underlying socket.
     */
    get readyState() {
        return this._socket.readyState;
    }
    /**
     * Gets the underlying socket.
     */
    get socket() {
        return this._socket;
    }
    /**
     * Registers a transformer in the pipeline.
     * Transformers are executed in the order they are registered.
     *
     * @param transformer {ITransformer} The transformer to register.
     *
     * @returns {TcpConnection} The connection.
     */
    addTransformer(transformer) {
        this.pipeline.push(transformer);
        return this;
    }
    /**
     * Removes all the pipeline transformers.
     */
    clearPipeline() {
        this.pipeline = [];
    }
    /**
     * Connect to the device.
     *
     * @emit error Emitted if an error occurs while connecting.
     */
    connect() {
        try {
            this._socket.connect(this.connectionOptions);
        }
        catch {
            if (this.connectionOptions.autoReconnect && this._reconnectAttempts < this.connectionOptions.maxReconnectAttempts) {
                this.reconnect();
            }
        }
    }
    /**
     * The destroy function is used to close the socket and remove all listeners.
     */
    destroy() {
        this.clearWatchdogTimer();
        this.clearPingTimer();
        this.removeAllListeners();
        this._socket.removeAllListeners();
        this._socket.destroy();
    }
    /**
     * Closes the connection.
     *
     * @param force Whether to force the connection to close. Defaults to false.
     *              If true, the socket will be destroyed instead of ended.
     */
    disconnect(force = false) {
        this._wasManuallyClosed = true;
        this.clearWatchdogTimer();
        this.clearPingTimer();
        if (force) {
            this._socket.resetAndDestroy();
        }
        else {
            this._socket.destroy();
        }
    }
    /**
     * Removes a transformer from the pipeline.
     *
     * @param transformer {ITransformer} The transformer to remove.
     */
    removeTransformer(transformer) {
        this.pipeline = this.pipeline.filter(t => t !== transformer);
    }
    /**
     * Writes data to the device.
     * The data is processed by the outbound pipeline before being written to the socket.
     * If the socket is not open, the data will not be written.
     * If an error occurs while writing, the error event will be emitted.
     *
     * @param data {Buffer|Uint8Array|string} The data to write.
     * @param encoding {BufferEncoding} The encoding to use if data is a string.
     *
     * @emits "error" Emitted if an error occurs while writing.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if the data was written successfully.
     */
    async write(data, encoding) {
        if (this._socket.readyState !== "open")
            return Promise.resolve(false);
        let payload;
        try {
            // Convert the data to a buffer if it isn't already.
            const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
            // Process the data through the outbound pipeline.
            payload = this.processPipeline(this.pipeline, buffer, "outbound");
            if (!payload)
                return Promise.resolve(false);
        }
        catch (error) {
            if (error instanceof Error) {
                this.emit("error", error);
            }
            return Promise.reject(error);
        }
        // Write the data to the socket and return a promise.
        return new Promise((resolve, reject) => {
            this._socket.write(payload, encoding, (error) => {
                if (error) {
                    this.emit("error", error);
                    reject(error);
                }
                else {
                    resolve(true);
                }
            });
        });
    }
    /**
     * The addHandler function adds a handler to the socket.
     *
     * @param event {string} Specify the event that will be listened for
     * @param handler {(...args: any[])} Pass in a function that will be called when the event is triggered
     *
     * @return The netconnection object
     */
    addHandler(event, handler) {
        this._socket.on(event, handler);
    }
    /**
     * Clears the ping timer.
     */
    clearPingTimer() {
        if (this.pingTimer)
            clearInterval(this.pingTimer);
        this.pingTimer = undefined;
    }
    /**
     * Clears the reconnect watchdogTimer.
     */
    clearWatchdogTimer() {
        if (this.watchdogTimer)
            clearTimeout(this.watchdogTimer);
        this.watchdogTimer = undefined;
    }
    /**
     * The handlError function is called when an error occurs.
     * It emits the &quot;error&quot; event and then reconnects to the server.
     *
     * @param error {Error} the error object
     *
     * @emits "error" Emitted when an error occurs.
     */
    handlError(error) {
        this.emit("error", error);
        this.reconnect();
    }
    /**
     * The handleClose function is called when the connection to the server closes.
     * Invoked when the the connection has been closed by both ends and no more data will be transferred.
     * It emits a close event, clears any ping timers, and reconnects if necessary.
     *
     * @param hadError {boolean} Determine if the connection was closed due to an error
     *
     * @emits "close" Emitted when the connection is closed.
     */
    handleClose(hadError) {
        this.emit("close", hadError);
        this.clearPingTimer();
        this.reconnect();
    }
    /**
     * The handleConnect function is called when the connection to the server has been established.
     * It emits a &quot;connect&quot; event and resets the reconnection attempts counter.
     *
     * @emits "connect" Emitted when the connection to the server has been established.
     */
    async handleConnect() {
        this.emit("connect");
        this._reconnectAttempts = 0;
    }
    /**
     * The handleData function is called when the socket receives data.
     * It processes the data through a pipeline of filters, and then emits an event with the processed data.
     *
     * @param data {Buffer} Store the data in a buffer
     *
     * @emits "data" Emitted when data is received.
     */
    async handleData(data) {
        const processedData = this.processPipeline(this.pipeline, data, "inbound");
        this.emit("data", processedData);
        this.clearWatchdogTimer();
        return processedData;
    }
    /**
     * The handleEnd function is called when no more data can be read.
     * Note that the socket may still be open at this point.
     * It emits an &quot;end&quot; event to notify listeners.
     *
     * @emits "end" Emitted when no more data can be read.
     */
    handleEnd() {
        this.emit("end");
    }
    /**
     * The handleLookup function is called when the DNS lookup has completed.
     *
     * @param error {Error} Pass the error object to the callback function
     * @param address {string} Store the address of the host
     * @param family {string} Specify the address family of the hostname
     * @param host {string} Specify the hostname of the server
     *
     * @emits "lookup" Emitted after resolving the host name but before connecting.
     */
    handleLookup(error, address, family, host) {
        this.emit("lookup", error, address, family, host);
    }
    /**
     * The handleReady function is called when the socket is ready to be used.
     * Triggered immediately after 'connect'.
     * It emits a ready event, and starts the ping timer.
     *
     * @emits "ready" Emitted when the socket is ready to be used.
     */
    async handleReady() {
        this.emit("ready");
        this.clearPingTimer();
        if (this.connectionOptions.pingInterval) {
            this.pingTimer = setInterval(() => this.ping(), this.connectionOptions.pingInterval);
        }
    }
    /**
     * The handleTimeout function is called when the socket times out.
     * It emits a timeout event and then reconnects to the server.
     *
     * @emits "timeout"x Emitted if the socket times out from inactivity.
     */
    handleTimeout() {
        this.emit("timeout");
        this.reconnect();
    }
    /**
     * Initializes the connection and adds event listeners.
     */
    initialize() {
        // Invoked when data is received.
        this.addHandler("data", this.handleData.bind(this));
        // Invoked when the the connection has been closed by both ends and no more data will be transferred.
        this.addHandler("close", this.handleClose.bind(this));
        // Invoked when an error occurs.
        this.addHandler("error", this.handlError.bind(this));
        // Invoked when a socket connection is successfully established.
        this.addHandler("connect", this.handleConnect.bind(this));
        // Indicates that no more data can be read. Note that the socket may still be open at this point.
        this.addHandler("end", this.handleEnd.bind(this));
        // Invoked after resolving the host name but before connecting.
        this.addHandler("lookup", this.handleLookup.bind(this));
        // Invoked when the socket is ready to be used. Triggered immediately after 'connect'.
        this.addHandler("ready", this.handleReady.bind(this));
        // Invoked if the socket times out from inactivity.
        this.addHandler("timeout", this.handleTimeout.bind(this));
    }
    /**
     * Sends a ping event which should cause an appropriate ping packet to be dispatched.
     * The connection will be closed/reconnected if a response is not received within the timeout.
     *
     * @emit ping Emitted when a ping payload is sent.
     */
    ping() {
        if (!this.watchdogTimer && this.connectionOptions.pingTimeout) {
            this.emit("ping");
            this.clearWatchdogTimer();
            this.watchdogTimer = setTimeout(() => this.reconnect(), this.connectionOptions.pingTimeout);
        }
    }
    /**
     * Processes data through a pipeline of transformers.
     * Transformers are executed in the order they are registered.
     *
     * @param pipeline {ITransformer[]} The pipeline transformers to process the data through.
     * @param data {Buffer} The data to process.
     * @param direction {"inbound"|"outbound"} The direction of the data.
     * @returns {Buffer|Uint8Array|string} The processed data.
     */
    processPipeline(pipeline, data, direction) {
        let processedData = data;
        const errorHandler = (error) => this.emit("error", error);
        for (const transformer of pipeline) {
            if (direction === "inbound" && transformer.handleRead) {
                transformer.handleRead(processedData, (data) => processedData = data, errorHandler);
            }
            else if (direction === "outbound" && transformer.handleWrite) {
                transformer.handleWrite(processedData, (data) => processedData = data, errorHandler);
            }
        }
        return processedData;
    }
    /**
     * Attempts to reconnect to the device after a delay acccording to the following rules:
     *
     * * If the socket is not already closed, the socket is destroyed.
     * * If the socket is closed and the connection was manually closed, nothing happens.
     * * If the socket is closed and the connection was not manually closed, a reconnect attempt is made.
     * * If the maximum number of reconnect attempts has been reached, nothing happens.
     *
     * The backoff time (milliseconds) is calculated using the formula 1000 * 2^attempts and is capped
     * at the maximum backoff time.
     *
     * @emit reconnect Emitted when a reconnect attempt is made.
     */
    reconnect() {
        if (this._socket.readyState !== "closed")
            this._socket.resetAndDestroy();
        if (this.connectionOptions.autoReconnect && !this._wasManuallyClosed && this._reconnectAttempts < this.connectionOptions.maxReconnectAttempts) {
            this._reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this._reconnectAttempts), this.connectionOptions.maxBackoffTime);
            this.clearWatchdogTimer();
            this.watchdogTimer = setTimeout(() => this.connect(), delay);
            this.emit("reconnect", this._reconnectAttempts, delay);
        }
    }
}
exports.TcpConnection = TcpConnection;
//# sourceMappingURL=tcp-connection.js.map