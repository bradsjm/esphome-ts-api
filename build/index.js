"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiClient = exports.ServiceDiscovery = exports.isIMessageType = exports.isIMessage = exports.isIEntityKey = exports.isIResponseEntity = void 0;
var type_guards_1 = require("./type-guards");
Object.defineProperty(exports, "isIResponseEntity", { enumerable: true, get: function () { return type_guards_1.isIResponseEntity; } });
Object.defineProperty(exports, "isIEntityKey", { enumerable: true, get: function () { return type_guards_1.isIEntityKey; } });
Object.defineProperty(exports, "isIMessage", { enumerable: true, get: function () { return type_guards_1.isIMessage; } });
Object.defineProperty(exports, "isIMessageType", { enumerable: true, get: function () { return type_guards_1.isIMessageType; } });
var net_1 = require("./net");
Object.defineProperty(exports, "ServiceDiscovery", { enumerable: true, get: function () { return net_1.ServiceDiscovery; } });
Object.defineProperty(exports, "createApiClient", { enumerable: true, get: function () { return net_1.createApiClient; } });
//# sourceMappingURL=index.js.map