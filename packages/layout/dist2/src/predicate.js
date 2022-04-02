"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMapping = exports.isMappingPointer = exports.isStorageInfo = exports.isStorageInfoArray = exports.isStorageInfoMapping = exports.isStorageInfoStruct = void 0;
const types_1 = require("types");
function isStorageInfoStruct(value) {
    return value.layout !== undefined;
}
exports.isStorageInfoStruct = isStorageInfoStruct;
function isStorageInfoMapping(value) {
    return value.variant === "mapping";
}
exports.isStorageInfoMapping = isStorageInfoMapping;
function isStorageInfoArray(value) {
    return value.variant === "array";
}
exports.isStorageInfoArray = isStorageInfoArray;
function isStorageInfo(value) {
    return (0, types_1.isSolidityType)(value.type);
}
exports.isStorageInfo = isStorageInfo;
function isMappingPointer(value) {
    return value.slot !== undefined;
}
exports.isMappingPointer = isMappingPointer;
function hasMapping(storage) {
    return !!Object.keys(storage.layout.variables).find((v) => {
        //@ts-ignore
        let variable = storage.layout.variables[v];
        if ((0, types_1.isSolidityType)(variable)) {
            return false;
        }
        else if (isStorageInfoStruct(variable)) {
            return hasMapping(variable);
        }
        else if (isStorageInfoMapping(variable)) {
            return true;
        }
        else {
            return false;
        }
    });
}
exports.hasMapping = hasMapping;
