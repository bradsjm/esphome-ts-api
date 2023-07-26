"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.void$ = exports.APISourceType = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
/**
 * @generated from protobuf enum APISourceType
 */
var APISourceType;
(function (APISourceType) {
    /**
     * @generated from protobuf enum value: SOURCE_BOTH = 0;
     */
    APISourceType[APISourceType["SOURCE_BOTH"] = 0] = "SOURCE_BOTH";
    /**
     * @generated from protobuf enum value: SOURCE_SERVER = 1;
     */
    APISourceType[APISourceType["SOURCE_SERVER"] = 1] = "SOURCE_SERVER";
    /**
     * @generated from protobuf enum value: SOURCE_CLIENT = 2;
     */
    APISourceType[APISourceType["SOURCE_CLIENT"] = 2] = "SOURCE_CLIENT";
})(APISourceType = exports.APISourceType || (exports.APISourceType = {}));
// @generated message type with reflection information, may provide speed optimized methods
class void$$Type extends runtime_4.MessageType {
    constructor() {
        super("void", []);
    }
    create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, runtime_3.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            (0, runtime_2.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        return target ?? this.create();
    }
    internalBinaryWrite(message, writer, options) {
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_1.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message void
 */
exports.void$ = new void$$Type();
//# sourceMappingURL=api_options_pb.js.map