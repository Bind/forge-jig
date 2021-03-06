import { StorageLayout } from "./StorageLayout";
import { SOLIDITY_TYPES } from "@forge-jig/types";
export type StoragePointer = {
  slot: number; // Storage Slot Number
  offset: number; // Storage Slot Offset Bytes
};
export type StorageInfoVariants =
  | "simple"
  | "struct"
  | "mapping"
  | "array"
  | "enum";

export type StorageInfo = {
  variant: "simple";
  type: SOLIDITY_TYPES;
  size: number; // Number of bytes long
  pointer: StoragePointer;
};
export type StorageInfoEnum = {
  variant: "enum";
  size: number; // Number of bytes long
  pointer: StoragePointer;
};
export type StorageInfoMapping = {
  variant: "mapping";
  key: SOLIDITY_TYPES;
  value: SOLIDITY_TYPES | StorageInfoStruct | StorageInfoMapping;
  pointer: StoragePointer;
};
export type StorageInfoArray = {
  variant: "array";
  value:
    | SOLIDITY_TYPES
    | StorageInfoStruct
    | StorageInfoArray
    | StorageInfoEnum;
  pointer: StoragePointer;
};
export type StorageInfoStruct = {
  variant: "struct";
  layout: StorageLayout;
  pointer: StoragePointer; // Slot Number
};
export type StorageInfos =
  | StorageInfo
  | StorageInfoMapping
  | StorageInfoStruct
  | StorageInfoArray
  | StorageInfoEnum;
