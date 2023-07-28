import { ApiClientBase, ESPHomeOpts } from "./api-client-base";
import { ApiClientPlain } from "./api-client-plain";
import { ApiClientNoise } from "./api-client-noise";

/**
 * The createApiClient function is used to create a new instance of the ApiClientBase class.
 * If the encryptionKey is set, then the ApiClientNoise class is used, otherwise the ApiClientPlain class is used.
 *
 * @param opts {ESPHomeOpts} options passed to the constructor function
 */
export function createApiClient(opts: ESPHomeOpts): ApiClientBase {
    if (opts.encryptionKey) {
        return new ApiClientNoise(opts);
    } else {
        return new ApiClientPlain(opts);
    }
}
