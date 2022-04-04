import { STORAGE_SLOT } from "./constants";
import {
  getDataToStoreCasting,
  getTypeFunctionSignature,
  isSolidityType,
  SOLIDITY_TYPES,
} from "@forge-jig/types";
import {
  isStorageInfoArray,
  isStorageInfoMapping,
  isStorageInfoStruct,
  StorageInfoArray,
  StorageInfoMapping,
  StorageInfoStruct,
} from "@forge-jig/layout";
import {
  arraySetterBodySolidityType,
  arraySetterBodyStruct,
  getArrayKeys,
  getArrayValue,
  getEncodingFuncArrayLength,
} from "./array";
import { writeStructToSlot } from "./struct";

export function soliditySetMappingFunctionFromStorageInfo(
  name: string,
  mapping: StorageInfoMapping
) {
  const value = getMappingValue(mapping);
  const keys = getMappingKeys(mapping);

  const args = keys.map((k, i) => `${getTypeFunctionSignature(k)} key${i}`);

  const slot_encoding = getEncodingFuncMapping(
    `${name}${STORAGE_SLOT}`,
    "key",
    0,
    mapping
  );

  if (isSolidityType(value)) {
    return mappingSetterBodySolidityType(name, args, slot_encoding, value);
  } else if (isStorageInfoStruct(value)) {
    return mappingSetterBodyStruct(name, args, slot_encoding, value);
  } else if (isStorageInfoArray(value)) {
    const arrayValue = getArrayValue(value);
    if (isSolidityType(arrayValue)) {
      return arraySetterBodySolidityType(name, args, slot_encoding, arrayValue);
    } else {
      return arraySetterBodyStruct(name, args, slot_encoding, arrayValue);
    }
  } else {
    console.log("value not handled for mapping!");
    return "";
  }
}

export function getMappingKeys(info: StorageInfoMapping): SOLIDITY_TYPES[] {
  const value = info.value;

  if (isSolidityType(value)) {
    return [info.key];
  } else if (isStorageInfoMapping(value)) {
    return [info.key, ...getMappingKeys(value)];
  } else if (isStorageInfoArray(value)) {
    return [info.key, ...getArrayKeys(value)];
  } else {
    return [info.key];
  }
}
export function getMappingValue(
  info: StorageInfoMapping
): SOLIDITY_TYPES | StorageInfoStruct | StorageInfoArray {
  const value = info.value;

  if (isSolidityType(value)) {
    return value;
  } else if (isStorageInfoMapping(value)) {
    return getMappingValue(value);
  } else if (isStorageInfoStruct(value)) {
    return value;
  } else if (isStorageInfoArray(value)) {
    return value;
  } else {
    throw new Error(
      "unhandled type in soliditySetMappingFunctionFromStorageInfo"
    );
  }
}

// need more tests here
export function getEncodingFuncMapping(
  storage_slot_declaration: string,
  key_declaration: string,
  iterator: number,
  info: StorageInfoMapping
): string {
  const value = info.value;
  if (isSolidityType(value)) {
    return `uint256(keccak256(abi.encode(${key_declaration}${iterator}, bytes32(${storage_slot_declaration}))))`;
  } else if (isStorageInfoMapping(value)) {
    const slot = `keccak256(abi.encode(${key_declaration}${iterator}, bytes32(${storage_slot_declaration})))`;
    return getEncodingFuncMapping(slot, key_declaration, iterator + 1, value);
  } else if (isStorageInfoStruct(value)) {
    return `uint256(keccak256(abi.encode(${key_declaration}${iterator}, bytes32(${storage_slot_declaration}))))`;
  } else if (isStorageInfoArray(value)) {
    const slot = `uint256(keccak256(abi.encode(${key_declaration}${iterator}, bytes32(${storage_slot_declaration}))))`;
    return getEncodingFuncArrayLength(
      slot,
      key_declaration,
      iterator + 1,
      value,
      true
    );
  } else {
    throw new Error(
      "unhandled type in soliditySetMappingFunctionFromStorageInfo"
    );
  }
}

export function mappingSetterBodySolidityType(
  name: string,
  args: string[],
  slot_encoding: string,
  value: SOLIDITY_TYPES
) {
  return `
  function ${name}(${args.join(", ")}, ${getTypeFunctionSignature(
    value
  )} value) public {
      uint256 slot = ${slot_encoding};
      VM.store(target, bytes32(slot), ${getDataToStoreCasting(value)});
  }
  `;
}

export function mappingSetterBodyStruct(
  name: string,
  args: string[],
  slot_encoding: string,
  struct: StorageInfoStruct
) {
  return `
        function ${name}(${args.join(", ")},${
    struct.layout.name
  } memory value) public{
          uint256 slot = ${slot_encoding};
        ${writeStructToSlot("slot", "value", struct)}
        }
        `;
}
