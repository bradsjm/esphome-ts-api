import { expect } from "chai";
import { SenseClient, SenseClientOptions } from "./sense-client";
import { SenseAuthResponse, SenseUpdate } from "../interfaces";

describe("SenseClient", () => {
    // initializing logic
    const clientOptions: SenseClientOptions = {
        email: process.env.LOGIN ?? "",
        password: process.env.PASSWORD ?? "",
    };

    const client = new SenseClient(clientOptions);
    client.on("error", (error) => {
        console.log(`http error: ${error}`);
    });

    it("email and password are set", () => {
        expect(clientOptions.email.length, "email set").is.greaterThan(0);
        expect(clientOptions.password.length, "password set").is.greaterThan(0);
    });

    it("can authenticate to sense server", async () => {
        let eventEmitted = false;
        client.once("authenticated", (response: SenseAuthResponse) => {
            console.log(`authenticated result: ${JSON.stringify(response)}`);
            eventEmitted = true;
            expect(response.authorized, "authorized").to.be.true;
            expect(response.user_id, "userid").to.be.a("number");
            expect(response.access_token, "token").to.be.a("string");
        });
        const result = await client.authenticate();
        expect(result, "result").to.be.true;
        expect(eventEmitted, "eventEmitted").to.be.true;
    });

    it("can renew token", async () => {
        let eventEmitted = false;
        client.once("token", (response: SenseAuthResponse) => {
            console.log(`renew token result: ${JSON.stringify(response)}`);
            eventEmitted = true;
            expect(response.authorized).to.be.true;
            expect(response.user_id).to.be.a("number");
            expect(response.access_token).to.be.a("string");
        });
        const result = await client.renewToken();
        expect(result, "renew token returns true").to.be.true;
        expect(eventEmitted, "token event sent").to.be.true;
    });

    it("can get devices", async () => {
        const monitorId = client.account?.monitors[0].id;
        expect(monitorId, "monitorId").to.be.a("number");
        const result = await client.getDevices(monitorId!);
        expect(result, "device response not null").not.null;
        expect(result, "device response is array").to.be.an("array");
        expect(result?.length, "device length is greater than zero").to.be.greaterThan(0);
    });

    it("can start websocket connection", (done) => {
        client.once("connected", () => {
            console.log("connected to websocket");
            done();
        });
        client.start();
    });

    it("can receive websocket hello message", (done) => {
        client.once("hello", (payload) => {
            console.log(`received websocket message: ${JSON.stringify(payload)}`);
            expect(payload).to.be.an("object", "json object");
            expect(payload).to.have.property("online", true);
            done();
        });
    });

    it("can receive realtime_update message", (done) => {
        client.once("realtime_update", (payload: SenseUpdate) => {
            console.log(`received websocket message: ${JSON.stringify(payload)}`);
            expect(payload).to.be.an("object", "json object");
            expect(payload).to.have.property("epoch").greaterThan(0);
            done();
        });
    });

    it("can stop websocket connection", (done) => {
        client.once("disconnected", () => {
            console.log("websocket closed");
            done();
        });
        client.stop();
    });

    it("can logout from sense server", async () => {
        let eventEmitted = false;
        client.once("logout", () => {
            console.log("logged out of Sense API");
            eventEmitted = true;
        });
        await client.logout();
        expect(eventEmitted, "eventEmitted").to.be.true;
    });
});
