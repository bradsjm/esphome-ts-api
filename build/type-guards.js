"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIResponseEntity = exports.isIEntityKey = exports.isIMessage = exports.isIMessageType = void 0;
/**
 * Type guard for IMessageType<T>
 *
 * @param arg The value to check
 * @returns True if arg is an IMessageType<T>
 */
function isIMessageType(arg) {
    return arg &&
        typeof arg.typeName === "string" &&
        Array.isArray(arg.fields) &&
        typeof arg.options === "object" &&
        typeof arg.create === "function" &&
        typeof arg.fromBinary === "function" &&
        typeof arg.toBinary === "function" &&
        typeof arg.fromJson === "function" &&
        typeof arg.fromJsonString === "function" &&
        typeof arg.toJson === "function" &&
        typeof arg.toJsonString === "function" &&
        typeof arg.clone === "function" &&
        typeof arg.mergePartial === "function" &&
        typeof arg.equals === "function" &&
        typeof arg.is === "function" &&
        typeof arg.isAssignable === "function" &&
        typeof arg.internalJsonRead === "function" &&
        typeof arg.internalJsonWrite === "function" &&
        typeof arg.internalBinaryWrite === "function" &&
        typeof arg.internalBinaryRead === "function";
}
exports.isIMessageType = isIMessageType;
/**
 * Type guard for IMessage<T>
 *
 * @param arg The value to check
 * @returns True if arg is an IMessage<T>
 */
function isIMessage(arg) {
    return arg &&
        Array.isArray(arg.fields) &&
        typeof arg.options === "object" &&
        typeof arg.payload === "object" &&
        typeof arg.type === "string";
}
exports.isIMessage = isIMessage;
/**
 * Type guard for IEntityKey
 *
 * @param arg The value to check
 * @returns True if arg is an IEntityKey
 */
function isIEntityKey(arg) {
    return arg && typeof arg.key === "number";
}
exports.isIEntityKey = isIEntityKey;
/**
 * Type guard for IResponseEntity
 *
 * @param arg The value to check
 * @returns True if arg is an IResponseEntity
 */
function isIResponseEntity(arg) {
    return arg &&
        typeof arg.key === "number" &&
        typeof arg.name === "string" &&
        typeof arg.objectId === "string" &&
        typeof arg.uniqueId === "string";
}
exports.isIResponseEntity = isIResponseEntity;
//# sourceMappingURL=type-guards.js.map