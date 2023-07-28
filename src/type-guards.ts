import { IMessageType } from "@protobuf-ts/runtime";
import { IEntityKey, IMessage, IResponseEntity } from "./client";

/**
 * Type guard for IMessageType<T>
 *
 * @param arg The value to check
 * @returns True if arg is an IMessageType<T>
 */
export function isIMessageType<T extends object>(arg: any): arg is IMessageType<T> {
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

/**
 * Type guard for IMessage<T>
 *
 * @param arg The value to check
 * @returns True if arg is an IMessage<T>
 */
export function isIMessage<T extends object>(arg: any): arg is IMessage<T> {
    return arg &&
        Array.isArray(arg.fields) &&
        typeof arg.options === "object" &&
        typeof arg.payload === "object" &&
        typeof arg.type === "string";
}

/**
 * Type guard for IEntityKey
 *
 * @param arg The value to check
 * @returns True if arg is an IEntityKey
 */
export function isIEntityKey(arg: any): arg is IEntityKey {
    return arg && typeof arg.key === "number";
}

/**
 * Type guard for IResponseEntity
 *
 * @param arg The value to check
 * @returns True if arg is an IResponseEntity
 */
export function isIResponseEntity(arg: any): arg is IResponseEntity {
    return arg &&
        typeof arg.key === "number" &&
        typeof arg.name === "string" &&
        typeof arg.objectId === "string" &&
        typeof arg.uniqueId === "string";
}
