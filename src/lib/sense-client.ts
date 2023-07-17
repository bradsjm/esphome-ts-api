import { EventEmitter } from "events";
import WebSocket from "ws";
import axios from "axios";
import { SenseAuthResponse, SenseDevices } from "../interfaces"
import { stringify } from "querystring";
import memoize from "memoizee";

const API_URL = "https://api.sense.com/apiservice/api/v1/"
const WS_URL = "wss://clientrt.sense.com/monitors/%id%/realtimefeed?access_token=%token%"

const RECONNECT_INTERVAL = 10000; // Initial reconnect interval (10 seconds)
const MAX_RECONNECT_INTERVAL = 60000; // Maximum reconnect interval (60 seconds)
const WATCHDOG_INTERVAL = 60000; // If no message received in this time (60 seconds)

const API_MAX_AGE = 300000 // 5 minutes
const API_TIMEOUT = 5000 // 5 seconds
const WSS_TIMEOUT = 5000 // 5 seconds

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
    private readonly _getDevicesMemoized;
    private readonly httpsClient;
    private options;
    private reconnectInterval = RECONNECT_INTERVAL;
    private reconnectTimer?: NodeJS.Timeout;
    private watchdogTimer?: NodeJS.Timeout;
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

        // Memoize the getDevices function to prevent unnecessary requests to the Sense API
        this._getDevicesMemoized = memoize(this._getDevices, { promise: true, maxAge: API_MAX_AGE });
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
     * The authenticate function is used to authenticate the user with the Sense API.
     * It uses the email and password provided in the options object to make a POST request
     * to /authenticate endpoint, which returns an access token that will be used for subsequent requests.
     *
     * @returns true if the authentication was successful, false otherwise
     */
    public async authenticate(): Promise<boolean> {
        this._account = undefined;
        const response = await this.httpsClient.post<SenseAuthResponse>(
            "authenticate", stringify({
                email: this.options.email,
                password: this.options.password,
                remember_me: true
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
     * The getDevices function is used to retrieve the devices associated with a monitor.
     * This function is memoized to prevent unnecessary requests to the Sense API.
     *
     * @param monitorId: number Specify the monitor to get data from
     *
     * @return A sense device array
     */
    public async getDevices(monitorId: number): Promise<SenseDevices | undefined> {
        return this._getDevicesMemoized(monitorId);
    }

    /**
     * The logout function logs the user out of Sense.
     */
    public async logout(): Promise<void> {
        await this.httpsClient.get("logout");
        this._account = undefined;
        this.emit("logout");
    }

    /**
     * The renewToken function is used to renew the access token for a Sense account.
     * This function should be called when the access token expires, which happens after 1 hour of inactivity.
     * The function will automatically update the authorization header with the new access token and emit an event
     * that can be listened to by other modules.
     *
     * @returns true if the token was renewed successfully, false otherwise
     */
    public async renewToken(): Promise<boolean> {
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
     * The start function is used to start the websocket connection that provides real-time energy data events.
     * It will throw an error if you have not authenticated first.
     */
    public async start(): Promise<void> {
        if (!this._account) {
            throw new Error("Must authenticate first before starting websocket");
        }
        const id = String(this._account.monitors[0].id);
        const token = this._account.access_token;
        const wsUrl = WS_URL.replace("%id%", id).replace("%token%", token);
        const ws = new WebSocket(wsUrl, [], {
            timeout: WSS_TIMEOUT,
        });
        ws.onopen = () => this.onConnected();
        ws.onmessage = (event) => this.onMessage(event);
        ws.onclose = () => this.onDisconnected();
        ws.onerror = (error) => this.emit("error", error);
        this.webSocket = ws;

        // Schedule a reconnect attempt in case of failure
        this.scheduleReconnect();
    }

    /**
     * The stop function closes the websocket connection.
     */
    public async stop(): Promise<void> {
        this.unscheduleReconnect();
        this.unscheduleWatchdog();

        if (this.webSocket) {
            this.webSocket.close();
            this.webSocket = undefined;
        }
    }

    /**
     * The getDevices function is used to retrieve the devices associated with a monitor.
     *
     * @param monitorId: number Specify the monitor to get data from
     *
     * @return A sense device array
     */
    private async _getDevices(monitorId: number): Promise<SenseDevices | undefined> {
        const response = await this.httpsClient.get<SenseDevices>(
            `monitors/${monitorId}/devices`).catch((error) => this.httpErrorHandler(error));
        if (response?.data) {
            console.log(JSON.stringify(response.data));
            this.emit("devices", response.data);
            return response.data;
        }
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

    private async onDisconnected(): Promise<void> {
        this.emit("disconnected");
        if (this.autoReconnect) {
            await this.renewToken();
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
    private onMessage(event: WebSocket.MessageEvent): void {
        // Reset the watchdog timer
        this.scheduleWatchdog();

        try {
            const json: SenseWebSocketMessage = JSON.parse(event.data.toString());
            if (json.type == "error") {
                this.emit("error", new Error("sense error: " + json.payload.error_reason));
            } else {
                this.emit(json.type, json.payload);
            }
        } catch (error) {
            this.emit("error", error);
        }
    }

    /**
     * Schedules a reconnect attempt to the panel.
     * If a reconnect attempt is not already in progress, a reconnect attempt will be scheduled after a delay.
     * The delay period doubles with each subsequent attempt up to a maximum of 60 seconds.
     */
    private scheduleReconnect(): void {
        // Clear the watchdog timer if it is set
        if (this.watchdogTimer) {
            clearTimeout(this.watchdogTimer);
            this.watchdogTimer = undefined;
        }

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
     * The scheduleWatchdog function is used to schedule a watchdog timer that will
     * reconnect the client if it has not received any messages from the server in
     * WATCHDOG_INTERVAL milliseconds.
     */
    private scheduleWatchdog(): void {
        if (this.watchdogTimer) {
            clearTimeout(this.watchdogTimer);
        }

        this.watchdogTimer = setTimeout(() => this.scheduleReconnect(), WATCHDOG_INTERVAL);
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

    /**
     * The unscheduleWatchdog function clears the watchdog timer.
     */
    private unscheduleWatchdog(): void {
        if (this.watchdogTimer) {
            clearTimeout(this.watchdogTimer);
            this.watchdogTimer = undefined;
        }
    }
}
