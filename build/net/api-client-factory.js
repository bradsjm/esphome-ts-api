"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiClient = void 0;
const api_client_plain_1 = require("./api-client-plain");
const api_client_noise_1 = require("./api-client-noise");
/**
 * The createApiClient function is used to create a new instance of the ApiClientBase class.
 * If the encryptionKey is set, then the ApiClientNoise class is used, otherwise the ApiClientPlain class is used.
 *
 * @param opts {ESPHomeOpts} options passed to the constructor function
 */
function createApiClient(opts) {
    if (opts.encryptionKey) {
        return new api_client_noise_1.ApiClientNoise(opts);
    }
    else {
        return new api_client_plain_1.ApiClientPlain(opts);
    }
}
exports.createApiClient = createApiClient;
//# sourceMappingURL=api-client-factory.js.map