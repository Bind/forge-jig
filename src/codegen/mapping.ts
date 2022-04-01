import { STORAGE_SLOT } from '../constants';
import {
  getDataToStoreCasting,
  getTypeFunctionSignature,
  isSolidityType,
  SOLIDITY_TYPES,
} from '../solidityTypes';
import {
  isStorageInfoArray,
  isStorageInfoMapping,
  isStorageInfoStruct,
} from '../storage/predicate';
import {
  StorageInfoArray,
  StorageInfoMapping,
  StorageInfoStruct,
} from '../storage/types';
import { getArrayKeys } from './array';
import { writeStructToSlot } from './struct';

export function soliditySetMappingFunctionFromStorageInfo(
  name: string,
  mapping: StorageInfoMapping
) {
  const value = getMappingValue(mapping);
  const keys = getMappingKeys(mapping);

  const args = keys.map((k, i) => `${getTypeFunctionSignature(k)} key${i}`);

  const slot_encoding = getEncodingFuncMapping(
    `${name}${STORAGE_SLOT}`,
    'key',
    0,
    mapping
  );
  if (isSolidityType(value)) {
    return mappingSetterBodySolidityType(name, args, slot_encoding, value);
  } else if (isStorageInfoStruct(value)) {
    return mappingSetterBodyStruct(name, args, slot_encoding, value);
  } else if (isStorageInfoArray(value)) {
    console.log('Storage info array not handled for mapping!');

    return '';
  } else {
    console.log('value not handled for mapping!');
    return '';
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
      'unhandled type in soliditySetMappingFunctionFromStorageInfo'
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
    return getEncodingFuncArray(
      storage_slot_declaration,
      key_declaration,
      iterator + 1,
      value
    );
  } else {
    throw new Error(
      'unhandled type in soliditySetMappingFunctionFromStorageInfo'
    );
  }
}

// need more tests here
export function getEncodingFuncArray(
  storage_slot_declaration: string,
  key_declaration: string,
  iterator: number,
  info: StorageInfoArray
): string {
  const value = info.value;
  if (isSolidityType(value)) {
    if (iterator == 0) {
      return `uint256(keccak256(abi.encode(${storage_slot_declaration})))`;
    } else {
      return `uint256(keccak256(abi.encode(${storage_slot_declaration} + ${key_declaration}${
        iterator - 1
      })))`;
    }
  } else if (isStorageInfoMapping(value)) {
    throw new Error('Should not get nested mapping');
  } else if (isStorageInfoStruct(value)) {
    if (iterator == 0) {
      return `uint256(keccak256(abi.encode(${storage_slot_declaration})))`;
    } else {
      return `uint256(keccak256(abi.encode(${storage_slot_declaration} + ${key_declaration}${
        iterator - 1
      })))`;
    }
  } else if (isStorageInfoArray(value)) {
    const slot = `uint256(keccak256(abi.encode(${storage_slot_declaration})))`;
    return getEncodingFuncArray(slot, key_declaration, iterator + 1, value);
  } else {
    throw new Error(
      'unhandled type in soliditySetMappingFunctionFromStorageInfo'
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
  function ${name}(${args.join(', ')}, ${getTypeFunctionSignature(
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
        function ${name}(${args.join(', ')},${
    struct.layout.name
  } memory value) public{
          uint256 slot = ${slot_encoding};
        ${writeStructToSlot('slot', 'value', struct)}
        }
        `;
}
