import {
  getDataToStoreCasting,
  getTypeFunctionSignature,
  isSolidityType,
  SOLIDITY_TYPES,
} from '../solidityTypes';
import {
  isStorageInfo,
  isStorageInfoMapping,
  isStorageInfoStruct,
} from '../storage/predicate';
import { StorageInfoMapping, StorageInfoStruct } from '../storage/types';
import { overwriteInfo } from './struct';
import { generateLoadCall } from './utils';

export function soliditySetMappingFunctionFromStorageInfo(
  name: string,
  info: StorageInfoMapping
) {
  const mappingValue = getMappingValue(info);
  const keys = getMappingKeys(info);

  const args = keys.map((k, i) => `${getTypeFunctionSignature(k)} key${i}`);
  let slotEncoding = '';
  keys.forEach((_, i) => {
    if (slotEncoding === '') {
      slotEncoding = `keccak256(abi.encode(key${i}, bytes32(${name}_storage_slot)))`;
    } else {
      slotEncoding = `keccak256(abi.encode(key${i}, ${slotEncoding}))`;
    }
  });
  slotEncoding = `uint256(${slotEncoding})`;
  if (isSolidityType(mappingValue)) {
    return mappingSetterBodySolidityType(
      name,
      args,
      slotEncoding,
      mappingValue
    );
  } else {
    return mappingSetterBodyStruct(name, args, slotEncoding, mappingValue);
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
  slotEncoding: string,
  final_value: SOLIDITY_TYPES
) {
  return `
  function ${name}(${args.join(', ')}, ${getTypeFunctionSignature(
    final_value
  )} value) public {
      uint256 slot = ${slotEncoding};
      vm.store(target, bytes32(slot), ${getDataToStoreCasting(final_value)});
  }
  `;
}

export function mappingSetterBodyStruct(
  name: string,
  args: string[],
  slotEncoding: string,
  final_value: StorageInfoStruct
) {
  let prevSlot = final_value.layout.slotRoot;
  return `
        function set_${name}(${args.join(', ')},${
    final_value.layout.name
  } memory value) public{
          uint256 slot = ${slotEncoding};
          ${generateLoadCall('slot')}
          ${Object.keys(final_value.layout.variables)
            .filter((key: string) => {
              return isStorageInfo(final_value.layout.variables[key]);
            })
            .map((key: string) => {
              const storage = final_value.layout.variables[key];
              if (isStorageInfo(storage)) {
                let calls = '';
                if (storage.pointer.slot > prevSlot) {
                  prevSlot = storage.pointer.slot;
                  calls += generateLoadCall(
                    'slot',
                    prevSlot - final_value.layout.slotRoot,
                    false
                  );
                }
                calls += overwriteInfo(
                  'slot',
                  key,
                  storage,
                  prevSlot - final_value.layout.slotRoot
                );
                return calls;
              } else {
                return '';
              }
            })
            .join('\n')}
        }
        `;
}
