import { ARRAY_LENGTH, SLOT_CONTENT, STORAGE_SLOT } from '../constants';
import {
  getByteSizeFromType,
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
    return ['uint128'];
  } else if (isStorageInfoArray(value)) {
    return ['uint128', ...getArrayKeys(value)];
  } else {
    return ['uint128'];
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
// need more tests here
export function getEncodingFuncArrayLength(
  storage_slot_declaration: string,
  key_declaration: string,
  iterator: number,
  info: StorageInfoArray,
  skip: boolean = false
): string {
  console.log('info variant?', info.variant);
  console.log('is skip true?', skip);
  console.log('info value?', info.value);
  const value = info.value;
  if (isSolidityType(value)) {
    if (iterator == 0 || skip) {
      return `${storage_slot_declaration}`;
    } else {
      return `${storage_slot_declaration} + ${key_declaration}${iterator - 1}`;
    }
  } else if (isStorageInfoMapping(value)) {
    throw new Error('Should not get nested mapping');
  } else if (isStorageInfoStruct(value)) {
    if (iterator == 0 || skip) {
      return `${storage_slot_declaration}`;
    } else {
      return `${storage_slot_declaration} + ${key_declaration}${iterator - 1}`;
    }
  } else if (isStorageInfoArray(value)) {
    const slot = `uint256(keccak256(abi.encode(${storage_slot_declaration})))`;
    return getEncodingFuncArrayLength(
      slot,
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
// export function checkArrayLength(name: string, keys: SOLIDITY_TYPES[]) {
//   return ` uint256 arrayLength = uint256(vm.load(target, bytes32(${name}${STORAGE_SLOT})));
//   if (arrayLength < key){
//     vm.store(target, bytes32(${name}${STORAGE_SLOT}), bytes32(key));
//   }`;
// }

export function soliditySetArrayFunctionFromStorageInfo(
  name: string,
  info: StorageInfoArray
) {
  const value = getArrayValue(info);
  const keys = getArrayKeys(info);

  let length_slot_encoding = getEncodingFuncArrayLength(
    `${name}${STORAGE_SLOT}`,
    'key',
    0,
    info
  );

  const args = keys.map((k, i) => `${getTypeFunctionSignature(k)} key${i}`);
  if (isSolidityType(value)) {
    return arraySetterBodySolidityType(name, args, length_slot_encoding, value);
  } else if (isStorageInfoStruct(value)) {
    return arraySetterBodyStruct(name, args, length_slot_encoding, value);
  } else {
    throw new Error(`${info} not handled in array codegen`);
  }
}

export function arraySetterBodySolidityType(
  name: string,
  args: string[],
  length_slot_encoding: string,
  value: SOLIDITY_TYPES
) {
  return `  function ${name}( ${args.join(', ')}, ${getTypeFunctionSignature(
    value
  )} value) public {

    uint256 ${name}Array = ${length_slot_encoding};
    uint256 ${ARRAY_LENGTH} = uint256(
        VM.load(target, bytes32(${name}Array))
    );
      if (${ARRAY_LENGTH} <= key${args.length - 1}) {
        VM.store(
            target,
            bytes32(${name}Array),
            bytes32(uint256(key${args.length - 1}) + 1)
        );
    }
      uint8 offset = uint8(key${args.length - 1} * ${getByteSizeFromType(
    value
  )} % 32);
      uint256 slotOffset = (key${args.length - 1} * ${getByteSizeFromType(
    value
  )} - offset) / 32;

      uint256 slot = uint256(keccak256(abi.encode((${name}Array)))) + slotOffset;
      uint256 ${SLOT_CONTENT} = uint256(VM.load(target, bytes32(slot)));
      ${SLOT_CONTENT} = clear(${SLOT_CONTENT}, ${getByteSizeFromType(
    value
  )}, offset);
      ${SLOT_CONTENT} = set(${SLOT_CONTENT}, value, offset);
      VM.store(target, bytes32(slot), bytes32(${SLOT_CONTENT}));
  }
  `;
}

export function arraySetterBodyStruct(
  name: string,
  args: string[],
  length_slot_encoding: string,
  struct: StorageInfoStruct
) {
  return `
        function ${name}(${args.join(', ')},${
    struct.layout.name
  } memory value) public{
         uint256 ${name}Array = ${length_slot_encoding};
          uint256 struct_size = ${struct.layout.getLength()};
          uint256 ${ARRAY_LENGTH} = uint256(
            VM.load(target, bytes32(${name}${STORAGE_SLOT}))
        );

          if (${ARRAY_LENGTH} <= key${args.length - 1}) {
            VM.store(
                target,
                bytes32(${name}${STORAGE_SLOT}),
                bytes32(uint256(key${args.length - 1}) + 1)
            );
        }
          uint256 slot = uint256(keccak256(abi.encode((${name}Array)))) + struct_size * key${
    args.length - 1
  };
          ${writeStructToSlot('slot', 'value', struct)}
        }
        `;
}

export function checkDynamicLength(
  slot_declaration: string,
  array_declaration: string
) {
  return `
  uint256 ${ARRAY_LENGTH} = uint256(
    VM.load(target, bytes32(${slot_declaration}))
);
  if (${ARRAY_LENGTH} < ${array_declaration}.length) {
    VM.store(
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
      uint8 contentOffset = uint8(${index} * ${size} % 32);
      uint8 slotOffset = uint8((${index} * ${size} - content_offset) / 32);
      uint256 ${output_slot_declaration} = (uint256(keccak256(abi.encode(${slot_declaration}))) + slotOffset);
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
        'arraySlot'
      )}
      ${writeSolidityTypeToSlot(
        'arraySlot',
        SLOT_CONTENT,
        `${array_declaration}[i]`,
        value,
        'contentOffset'
      )}
`
    : `
    uint256 structSize = ${value.layout.getLength()};
    uint256 arraySlot = (uint256(keccak256(abi.encode(${slot_declaration}))) + structSize * i);
    ${writeStructToSlot('arraySlot', `${array_declaration}[i]`, value, false)}
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
