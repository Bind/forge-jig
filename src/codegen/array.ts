import { SLOT_CONTENT } from '../constants';
import {
  getByteSizeFromType,
  getDataToStoreCasting,
  getTypeFunctionSignature,
  isSolidityType,
  SOLIDITY_TYPES,
} from '../solidityTypes';
import { isStorageInfoArray, isStorageInfoStruct } from '../storage/predicate';
import { StorageInfoArray, StorageInfoStruct } from '../storage/types';
import { writeStructToSlot } from './struct';
import {
  generateClearCall,
  generateLoadCall,
  generateMaskCall,
  generateStoreCall,
} from './utils';

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
        uint256 slot_content = uint256(vm.load(target, bytes32(slot)));
        slot_content = clear(slot_content, ${getByteSizeFromType(
          value
        )}, offset);
        slot_content = set(slot_content, value, offset);
        vm.store(target, bytes32(slot), bytes32(slot_content));
    }
    `;
  } else if (isStorageInfoStruct(value)) {
    return arraySetterBodyStruct(name, args, slot_encoding, value);
  } else {
    throw new Error(`${info} not handled in array codegen`);
  }
}

export function arraySetterBodyStruct(
  name: string,
  args: string[],
  slot_encoding: string,
  struct: StorageInfoStruct
) {
  return `
        function ${name}(${args.join(', ')},${
    struct.layout.name
  } memory value) public{
          uint256 struct_size = ${struct.layout.getLength()};
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
          uint256 slot = ${slot_encoding} + struct_size * key${args.length - 1};
          ${writeStructToSlot('slot', 'value', struct)}
        }
        `;
}

export function checkDynamicLength(
  slot_declaration: string,
  array_declaration: string
) {
  return `
  uint256 array_length = uint256(
    vm.load(target, bytes32(${slot_declaration}))
);
  if (array_length < ${array_declaration}.length) {
    vm.store(
        target,
        bytes32(${slot_declaration}),
        bytes32(${array_declaration}.length)
    );
}`;
}

export function declareOffsets(
  index: string,
  size: number,
  slot_declaration: string,
  output_slot_declaration: string
) {
  return `
      uint8 content_offset = uint8(${index} * ${size} % 32);
      uint8 slot_offset = uint8((${index} * ${size} - content_offset) / 32);
      uint256 ${output_slot_declaration} = (uint256(keccak256(abi.encode(${slot_declaration}))) + slot_offset);
      `;
}

export function writeArrayToSlot(
  slot_declaration: string,
  array_declaration: string,
  array: StorageInfoArray
) {
  const value = getArrayValue(array);

  const innerLoop = isSolidityType(value)
    ? `${declareOffsets(
        'i',
        getByteSizeFromType(value),
        slot_declaration,
        'array_slot'
      )}
      ${writeSolidityTypeToSlot(
        'array_slot',
        SLOT_CONTENT,
        `${array_declaration}[i]`,
        value,
        'content_offset'
      )}
`
    : `
    uint256 struct_size = ${value.layout.getLength()};
    uint256 array_slot = (uint256(keccak256(abi.encode(${slot_declaration}))) + struct_size * i);
    ${writeStructToSlot('array_slot', `${array_declaration}[i]`, value, false)}
    `;

  return `
  ${checkDynamicLength(slot_declaration, array_declaration)}
  ${generateLoadCall(slot_declaration, SLOT_CONTENT, 0, false)}
  for (uint256 i = 0; i < ${array_declaration}.length; i++){
   ${innerLoop}
  }
  `;
}

export function writeSolidityTypeToSlot(
  slot_declaration: string,
  content_name: string,
  variable_declaration: string,
  variable_type: SOLIDITY_TYPES,
  content_offset: string | number
) {
  return `
  ${generateLoadCall(slot_declaration, content_name)}
  ${generateClearCall(
    content_name,
    getByteSizeFromType(variable_type),
    content_offset
  )}
  ${generateMaskCall(
    content_name,
    getDataToStoreCasting(variable_type, variable_declaration),
    content_offset
  )}
  ${generateStoreCall(content_name, slot_declaration, content_offset)}

`;
}
