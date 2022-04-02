import { SOLIDITY_TYPES } from "types";
import { ArrayPointer } from "./array";
import { StorageInfoArray, StorageInfoMapping, StorageInfoStruct } from "./types";
export interface MappingPointer {
    slot: number;
    key: SOLIDITY_TYPES;
    value: SOLIDITY_TYPES | MappingPointer | StorageInfoStruct | ArrayPointer | StorageInfoArray;
}
export declare function mappingPointerToStorage(mapping: MappingPointer): StorageInfoMapping;
//# sourceMappingURL=mapping.d.ts.map