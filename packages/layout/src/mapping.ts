import { SOLIDITY_TYPES } from "types";
import { ArrayPointer } from "./array";
import { isMappingPointer } from "./predicate";
import {
  StorageInfoArray,
  StorageInfoMapping,
  StorageInfoStruct,
} from "./types";

export interface MappingPointer {
  slot: number;
  key: SOLIDITY_TYPES;
  value:
    | SOLIDITY_TYPES
    | MappingPointer
    | StorageInfoStruct
    | ArrayPointer
    | StorageInfoArray;
}

export function mappingPointerToStorage(
  mapping: MappingPointer
): StorageInfoMapping {
  const value = mapping.value;
  return {
    variant: "mapping",
    key: mapping.key,
    value: isMappingPointer(value)
      ? mappingPointerToStorage(value)
      : (mapping.value as SOLIDITY_TYPES | StorageInfoMapping),
    pointer: { slot: 0, offset: 0 },
  };
}
