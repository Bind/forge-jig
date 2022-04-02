import { StorageLayout } from ".";
import { SOLIDITY_TYPES } from "types";
export declare type StoragePointer = {
    slot: number;
    offset: number;
};
export declare type StorageInfoVariants = "simple" | "struct" | "mapping" | "array" | "enum";
export declare type StorageInfo = {
    variant: StorageInfoVariants;
    type: SOLIDITY_TYPES;
    size: number;
    pointer: StoragePointer;
};
export declare type StorageInfoEnum = {
    variant: "enum";
    size: number;
    pointer: StoragePointer;
};
export declare type StorageInfoMapping = {
    variant: "mapping";
    key: SOLIDITY_TYPES;
    value: SOLIDITY_TYPES | StorageInfoStruct | StorageInfoMapping;
    pointer: StoragePointer;
};
export declare type StorageInfoArray = {
    variant: "array";
    value: SOLIDITY_TYPES | StorageInfoStruct | StorageInfoArray | StorageInfoEnum;
    pointer: StoragePointer;
};
export declare type StorageInfoStruct = {
    variant: "struct";
    layout: StorageLayout;
    pointer: StoragePointer;
};
export declare type StorageInfos = StorageInfo | StorageInfoMapping | StorageInfoStruct | StorageInfoArray;
//# sourceMappingURL=types.d.ts.map