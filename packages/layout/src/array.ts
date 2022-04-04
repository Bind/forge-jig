import { SOLIDITY_TYPES } from "@forge-jig/types";
import { StorageInfoStruct } from "./types";

export interface ArrayPointer {
  slot: number;
  value: SOLIDITY_TYPES | StorageInfoStruct | ArrayPointer;
}
