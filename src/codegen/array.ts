import {
  getByteSizeFromType,
  getTypeFunctionSignature,
  isSolidityType,
  SOLIDITY_TYPES,
} from '../solidityTypes';
import {
  isStorageInfo,
  isStorageInfoArray,
  isStorageInfoStruct,
} from '../storage/predicate';
import { StorageInfoArray, StorageInfoStruct } from '../storage/types';
import { overwriteInfo } from './struct';
import { generateLoadCall } from './utils';

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

  let slot_encoding = '';

  keys.forEach((_, i) => {
    if (slot_encoding === '') {
      slot_encoding = `(uint256(keccak256(abi.encode(${name}_storage_slot))))`;
    } else if (i < keys.length) {
      slot_encoding = `keccak256(abi.encode(${slot_encoding} + key${i - 1}))`;
    }
  });
  let length_slot_encoding = '';
  keys.forEach((_, i) => {
    if (length_slot_encoding === '') {
      length_slot_encoding = `${name}_storage_slot`;
    } else if (i < keys.length) {
      length_slot_encoding = `uint256(keccak256(abi.encode(${length_slot_encoding}))) + key${
        i - 1
      }`;
    }
  });

  const args = keys.map((k, i) => `${getTypeFunctionSignature(k)} key${i}`);
  slot_encoding = `uint256(${slot_encoding})`;
  if (isSolidityType(value)) {
    return `  function ${name}( ${args.join(', ')}, ${getTypeFunctionSignature(
      value
    )} value) public {
        //check array length
        uint256 array_length = uint256(
          vm.load(target, bytes32(${length_slot_encoding}))
      );
        if (array_length < key${keys.length - 1}) {
          vm.store(
              target,
              bytes32(${length_slot_encoding}),
              bytes32(key${keys.length - 1} + 1)
          );
      }
        uint8 offset = uint8(key${keys.length - 1} * ${getByteSizeFromType(
      value
    )} % 32);
        uint8 slotOffset = uint8((key${keys.length - 1} * ${getByteSizeFromType(
      value
    )} - offset) / 32);
        uint256 slot = ${slot_encoding} + slotOffset;
        uint256 raw_slot = uint256(vm.load(target, bytes32(slot)));
        raw_slot = clear(raw_slot, ${getByteSizeFromType(value)}, offset);
        raw_slot = set(raw_slot, value, offset);
        vm.store(target, bytes32(slot), bytes32(raw_slot));
    }
    `;
  } else if (isStorageInfoStruct(value)) {
    // Handle struct in array;
    console.log(info);
    return arraySetterBodyStruct(name, args, slot_encoding, value);
  } else {
    throw new Error(`${info} not handled in array codegen`);
  }
}

export function arraySetterBodyStruct(
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
          uint256 struct_size = ${final_value.layout.getLength()};
          uint256 array_length = uint256(
            vm.load(target, bytes32(simple_array_storage_slot))
        );

          if (array_length < key${args.length - 1}) {
            vm.store(
                target,
                bytes32(${name}_storage_slot),
                bytes32(key${args.length - 1} + 1)
            );
        }
          uint256 slot = ${slotEncoding} + struct_size * key${args.length - 1};
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
