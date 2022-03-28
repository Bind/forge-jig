import {
  getByteSizeFromType,
  getTypeFunctionSignature,
  isSolidityType,
  SOLIDITY_TYPES,
} from '../solidityTypes';
import { isStorageInfoArray, isStorageInfoStruct } from '../storage/predicate';
import { StorageInfoArray, StorageInfoStruct } from '../storage/types';

export function getArrayKeys(info: StorageInfoArray): SOLIDITY_TYPES[] {
  const value = info.value;

  if (isSolidityType(value)) {
    return ['uint256'];
  } else if (isStorageInfoArray(value)) {
    return ['uint256', ...getArrayKeys(value)];
  } else {
    return ['uint256'];
  }
}
export function getArrayValue(
  info: StorageInfoArray
): SOLIDITY_TYPES | StorageInfoStruct {
  const value = info.value;

  if (isSolidityType(value)) {
    return value;
  } else if (isStorageInfoArray(value)) {
    return getArrayValue(value);
  } else if (isStorageInfoStruct(value)) {
    return value;
  } else {
    throw new Error('unhandled type in getArrayValue');
  }
}

// export function checkArrayLength(name: string, keys: SOLIDITY_TYPES[]) {
//   return ` uint256 arrayLength = uint256(vm.load(target, bytes32(${name}_storage_slot)));
//   if (arrayLength < key){
//     vm.store(target, bytes32(${name}_storage_slot), bytes32(key));
//   }`;
// }

export function soliditySetArrayFunctionFromStorageInfo(
  name: string,
  info: StorageInfoArray
) {
  const value = getArrayValue(info);
  const keys = getArrayKeys(info);

  let slotEncoding = '';

  keys.forEach((_, i) => {
    if (slotEncoding === '') {
      slotEncoding = `(uint256(keccak256(abi.encode(${name}_storage_slot))))`;
    } else if (i < keys.length) {
      slotEncoding = `keccak256(abi.encode(${slotEncoding} + key${i - 1}))`;
    }
  });
  const args = keys.map((k, i) => `${getTypeFunctionSignature(k)} key${i}`);
  slotEncoding = `uint256(${slotEncoding})`;
  if (isSolidityType(value)) {
    return `  function ${name}( ${args.join(', ')}, ${getTypeFunctionSignature(
      value
    )} value) public {
        //check array length
        uint8 offset = uint8(key${keys.length - 1} * ${getByteSizeFromType(
      value
    )} % 32);
        uint8 slotOffset = uint8((key${keys.length - 1} * ${getByteSizeFromType(
      value
    )} - offset) / 32);
        uint256 slot = ${slotEncoding} + slotOffset;
        uint256 raw_slot = uint256(vm.load(target, bytes32(slot)));
        raw_slot = clear(raw_slot, ${getByteSizeFromType(value)}, offset);
        raw_slot = set(raw_slot, value, offset);
        vm.store(target, bytes32(slot), bytes32(raw_slot));
    }
    `;
  } else {
    // Handle struct in array;
    console.log(info);
    return '';
  }
}
