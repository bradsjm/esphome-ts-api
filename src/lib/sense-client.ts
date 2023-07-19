import { EventEmitter } from "events";
import WebSocket from "ws";
import axios from "axios";
import { SenseAuthResponse } from "../interfaces"
import { stringify } from "querystring";
import jwt from "jsonwebtoken";

const API_URL = "https://api.sense.com/apiservice/api/v1/"
const WS_URL = "wss://clientrt.sense.com/monitors/%id%/realtimefeed"

const RECONNECT_INTERVAL = 10000; // Initial reconnect interval (10 seconds)
const MAX_RECONNECT_INTERVAL = 60000; // Maximum reconnect interval (60 seconds)

const API_TIMEOUT = 5000 // 5 seconds

export type SenseClientOptions = {
    email: string;
    password: string;
}

type SenseWebSocketMessage = {
    type: string;
    payload: any;
}

/**
 * SenseClient is the main class for interacting with the Sense API.
 */
export class SenseClient extends EventEmitter {
    private readonly httpsClient;
    private options;
    private reconnectInterval = RECONNECT_INTERVAL;
    private reconnectTimer?: NodeJS.Timeout;
    private webSocket?: WebSocket;

    /**
     * Creates a new SenseClient instance.
     */
    constructor(options: SenseClientOptions) {
        super();
        this.options = options;
        this.httpsClient = axios.create({
            baseURL: API_URL,
            timeout: API_TIMEOUT
        });
    }

    private _account?: SenseAuthResponse;

    /**
     * The sense account property contains the SenseAuthResponse object returned by the Sense API.
     */
    get account(): Readonly<SenseAuthResponse> | undefined {
        return this._account;
    }

    private _autoReconnect = true;

    /**
     * Returns if the autoReconnect function is enabled or disabled.
     *
     * @return A boolean value indicating if the autoReconnect function is enabled or disabled
     */
    get autoReconnect(): boolean {
        return this._autoReconnect;
    }

    /**
     * Sets the autoReconnect property to true or false.
     *
     * @param value: boolean Set the value of autoreconnect to true or false
     */
    set autoReconnect(value: boolean) {
        this._autoReconnect = value;
    }

    /**
     * The isTokenExpired function checks to see if the token has expired.
     *
     * @param token: string Pass in the token
     *
     * @return True if the token has expired or is invalid and false otherwise.
     */
    private static isTokenExpired(token: string): boolean {
        const tokenParts = token.split(".");

        // Check if the token has the expected number of parts
        if (tokenParts.length !== 5) return true;

        // Decode the token and get the expiration timestamp
        let jwtPayload: { exp: number } | null;
        try {
            jwtPayload = jwt.decode(tokenParts.slice(2).join(".")) as { exp: number };
        } catch (e) {
            return true;
        }

        // Check if we got an expiration timestamp
        if (!jwtPayload?.exp) return true;

        // Convert milliseconds to seconds for comparison
        const currentTimestampInSeconds = Date.now() / 1000;
        return currentTimestampInSeconds >= jwtPayload.exp;
    }

    /**
     * The logout function logs the user out of Sense and removes the login token.
     */
    public async logout(): Promise<void> {
        await this.httpsClient.get("logout");
        this._account = undefined;
        this.emit("logout");
    }

    /**
     * The start function is used to start the websocket connection that provides real-time energy data events.
     * It will attempt to authenticate the user if the token has expired or is not present.
     * If the authentication is successful, it will then attempt to connect to the websocket.
     * Sense will drop the connection after 15 minutes so the client will automatically reconnect.
     */
    public async start(): Promise<void> {
        // Schedule a reconnect attempt in case of failure
        this.scheduleReconnect();

        // Attempt to authenticate or renew the token
        if (!await this.authorize()) {
            return;
        }

        const id = String(this._account!.monitors[0].id);
        const token = this._account!.access_token;
        const params = stringify({ access_token: token });
        const wsUrl = WS_URL.replace("%id%", id) + "?" + params;

        const ws = new WebSocket(wsUrl, [], { timeout: API_TIMEOUT });
        ws.on("open", () => this.onConnected());
        ws.on("message", (event) => this.onMessage(event));
        ws.on("close", (code, reason) => this.onDisconnected(code, reason));
        ws.on("error", (error) => this.emit("error", error));
        this.webSocket = ws;
    }

    /**
     * The stop function closes the websocket connection.
     */
    public async stop(): Promise<void> {
        this.unscheduleReconnect();

        if (this.webSocket) {
            this.webSocket.close();
            this.webSocket = undefined;
        }
    }

    /**
     * The authenticate function is used to authenticate the user with the Sense API.
     * It uses the email and password provided in the options object to make a POST request
     * to /authenticate endpoint, which returns an access token that will be used for subsequent requests.
     *
     * @returns true if the authentication was successful, false otherwise
     */
    private async authenticate(): Promise<boolean> {
        this._account = undefined;
        const response = await this.httpsClient.post<SenseAuthResponse>(
            "authenticate", stringify({
                email: this.options.email,
                password: this.options.password
            }), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).catch((error) => this.httpErrorHandler(error));
        if (response?.data?.authorized) {
            this.httpsClient.defaults.headers.common["Authorization"] = "bearer " + response.data.access_token;
            this._account = response.data;
            this.emit("authenticated", response.data);
            return true;
        }
        this._account = undefined;
        return false;
    }

    /**
     * The authorize function is used to authenticate the user and get a token.
     * If the user has already been authenticated, it will check if the refresh token is expired.
     * If it's not expired, then it will renew the access token using that refresh token.
     * Otherwise, if there's no existing authentication or if there's an existing authentication but with an expired
     * refresh_token, then we'll call authenticate() to get a new set of tokens (access_token and refresh_token).
     *
     * @return A boolean indicating whether the authorization was successful or not.
     */
    private async authorize(): Promise<boolean> {
        // Use Case 1: There is no token
        if (this._account?.access_token == null) {
            return this.authenticate();
        }

        // Use Case 2: There is a token but it has expired
        if (this._account.refresh_token && SenseClient.isTokenExpired(this._account.access_token)) {
            return this.renewToken();
        }

        // Use Case 3: There is a token and it has not expired
        return true;
    }

    /**
     * The httpErrorHandler function is a helper function that handles errors from the http request.
     *
     * @param error: any Pass in the error object that is returned by axios
     */
    private httpErrorHandler(error: Error): void {
        let errorString: string | undefined = undefined;
        if (!error) {
            errorString = "Unknown Error";
        } else if (axios.isAxiosError(error)) {
            if (error.response) {
                // The request was made and the server responded with a status code that falls out of the range of 2xx the http status code mentioned above
                errorString = `HTTP error ${error.response.status} ${error.response.statusText}}`
            } else if (error.code) {
                errorString = error.code;
            } else if (error.request) {
                // The request was made but no response was received
                errorString = "No response received"
            }
        } else {
            errorString = error.message;
        }

        if (errorString) {
            this.emit("error", new Error(errorString));
        }
    }

    private onConnected(): void {
        this.emit("connected");

        // Cancel any pending reconnect attempts
        this.unscheduleReconnect();
    }

    /**
     * The onDisconnected function is called when the client disconnects from the server.
     * It emits a "disconnected" event with a reason string, and if autoReconnect is enabled,
     * it will schedule a reconnection attempt.
     *
     * @param code number Pass the close code
     * @param reason: string Pass the reason for disconnection
     *
     * @emits disconnected
     */
    private async onDisconnected(code: number, reason: Buffer): Promise<void> {
        this.emit("disconnected", code, reason);
        if (this.autoReconnect) {
            this.scheduleReconnect();
        }
    }

    /**
     * The onMessage function is called when the WebSocket receives a message.
     * It parses the JSON data and emits an event based on its type.
     * If it's an error, it emits an "error" event with the payload as its argument.
     * Otherwise, it emits a type-based event with the payload as its argument.
     *
     */
    private onMessage(data: WebSocket.RawData): void {
        try {
            const json: SenseWebSocketMessage = JSON.parse(data.toString());
            if (json.type == "error") {
                this.emit("error", new Error("sense error: " + json.payload.error_reason));
            } else {
                /*
                 * Message types:
                 *      "hello": Initial message sent by the server
                 *      "monitor_info": Monitor info update
                 *      "data_change": Data change event
                 *      "device_states": Device states
                 *      "realtime_update": Realtime data update
                 */
                this.emit(json.type, json.payload);
            }
        } catch (error) {
            this.emit("error", error);
        }
    }

    /**
     * The renewToken function is used to renew the access token for a Sense account.
     * This function should be called when the access token expires, which happens after 1 hour of inactivity.
     * The function will automatically update the authorization header with the new access token and emit an event
     * that can be listened to by other modules.
     *
     * @returns true if the token was renewed successfully, false otherwise
     */
    private async renewToken(): Promise<boolean> {
        const response = await this.httpsClient.post<SenseAuthResponse>("renew", stringify({
            "user_id": this._account?.user_id,
            "refresh_token": this._account?.refresh_token
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).catch((error) => this.httpErrorHandler(error));
        if (response?.data?.authorized) {
            this.httpsClient.defaults.headers.common["Authorization"] = "bearer " + response.data.access_token;
            this._account = { ...this._account, ...response.data };
            this.emit("token", response.data);
            return true;
        }
        this._account = undefined;
        return false;
    }

    /**
     * Schedules a reconnect attempt to the panel.
     * If a reconnect attempt is not already in progress, a reconnect attempt will be scheduled after a delay.
     * The delay period doubles with each subsequent attempt up to a maximum of 60 seconds.
     */
    private scheduleReconnect(): void {
        // Don't schedule reconnect if autoReconnect is disabled
        if (!this._autoReconnect) return;

        // Don't schedule reconnect if we're already trying to reconnect
        if (this.reconnectTimer) return;

        // Schedule a reconnect attempt
        this.reconnectTimer = setTimeout(async () => {
            // Double the reconnect delay for the next attempt, up to a maximum
            this.reconnectInterval = Math.min(this.reconnectInterval * 2, MAX_RECONNECT_INTERVAL);
            this.reconnectTimer = undefined;
            await this.start();
        }, this.reconnectInterval);
    }

    /**
     * The unscheduleReconnect function clears the reconnectTimer if it is set.
     * It also sets the reconnectInterval to its default value of RECONNECT_INTERVAL.
     */
    private unscheduleReconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
            this.reconnectInterval = RECONNECT_INTERVAL;
        }
    }
}
