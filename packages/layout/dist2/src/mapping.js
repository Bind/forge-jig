"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mappingPointerToStorage = void 0;
const predicate_1 = require("./predicate");
function mappingPointerToStorage(mapping) {
    const value = mapping.value;
    return {
        variant: "mapping",
        key: mapping.key,
        value: (0, predicate_1.isMappingPointer)(value)
            ? mappingPointerToStorage(value)
            : mapping.value,
        pointer: { slot: 0, offset: 0 },
    };
}
exports.mappingPointerToStorage = mappingPointerToStorage;
