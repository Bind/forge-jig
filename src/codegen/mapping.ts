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
import { StorageInfoMapping, StorageInfoStruct } from '../storage/types';
import { writeStructToSlot } from './struct';

export function soliditySetMappingFunctionFromStorageInfo(
  name: string,
  mapping: StorageInfoMapping
) {
  const value = getMappingValue(mapping);
  const keys = getMappingKeys(mapping);

  const args = keys.map((k, i) => `${getTypeFunctionSignature(k)} key${i}`);
  let slot_encoding = '';
  keys.forEach((_, i) => {
    if (slot_encoding === '') {
      slot_encoding = `keccak256(abi.encode(key${i}, bytes32(${name}_storage_slot)))`;
    } else {
      slot_encoding = `keccak256(abi.encode(key${i}, ${slot_encoding}))`;
    }
  });
  slot_encoding = `uint256(${slot_encoding})`;
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
  } else {
    return [info.key];
  }
}
export function getMappingValue(
  info: StorageInfoMapping
): SOLIDITY_TYPES | StorageInfoStruct {
  const value = info.value;

  if (isSolidityType(value)) {
    return value;
  } else if (isStorageInfoMapping(value)) {
    return getMappingValue(value);
  } else if (isStorageInfoStruct(value)) {
    return value;
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
      vm.store(target, bytes32(slot), ${getDataToStoreCasting(value)});
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
