import {
  getDataToStoreCasting,
  getTypeFunctionSignature,
  isSolidityType,
  SOLIDITY_TYPES,
} from '../solidityTypes';
import {
  isStorageInfoMapping,
  isStorageInfoStruct,
} from '../storage/predicate';
import { StorageInfoMapping } from '../storage/types';

export function soliditySetMappingFunctionFromStorageInfo(
  name: string,
  info: StorageInfoMapping
) {
  const flattened_keys: SOLIDITY_TYPES[] = [];
  let final_value: SOLIDITY_TYPES = 'uint';

  const flatten = (info: StorageInfoMapping) => {
    const value = info.value;

    if (isSolidityType(value)) {
      flattened_keys.push(info.key);
      final_value = info.value as SOLIDITY_TYPES;
      return;
    } else if (isStorageInfoMapping(value)) {
      flattened_keys.push(info.key);
      flatten(value);
    } else if (isStorageInfoStruct(value)) {
      // Accept up a custom struct
      // value.layout
      // TODO
    } else {
      throw new Error(
        'unhandled type in soliditySetMappingFunctionFromStorageInfo'
      );
    }
  };
  flatten(info);
  const args = flattened_keys.map(
    (k, i) => `${getTypeFunctionSignature(k)} key${i}`
  );
  let slotEncoding = '';
  flattened_keys.forEach((_, i) => {
    if (slotEncoding === '') {
      slotEncoding = `keccak256(abi.encode(key${i}, ${name}_storage_slot))`;
    } else {
      slotEncoding = `keccak256(abi.encode(key${i}, ${slotEncoding}))`;
    }
  });

  return `
      function ${name}(${args.join(', ')}, ${getTypeFunctionSignature(
    final_value
  )} value) public {
          bytes32 slot = ${slotEncoding};
          vm.store(target, slot, ${getDataToStoreCasting(final_value)});
      }
      `;
}
