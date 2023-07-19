import { expect } from "chai";
import { SenseClient, SenseClientOptions } from "./sense-client";
import { SenseUpdate } from "../interfaces";

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
