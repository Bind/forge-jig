import { SLOT_CONTENT } from '../constants';
import {
  getByteSizeFromType,
  getDataToStoreCasting,
  getTypeFunctionSignature,
} from '../solidityTypes';
import { StorageInfo, StorageInfos } from '../storage/types';

export function solidityConstSlotOffset(name: string, info: StorageInfos) {
  return `uint8 ${name}_slot_offset = uint8(${info.pointer.offset});\n`;
}

export function solidityConstFromStorageInfo(name: string, info: StorageInfos) {
  return `uint256 ${name}_storage_slot = uint256(${info.pointer.slot});\n${
    info.pointer.offset > 0 ? solidityConstSlotOffset(name, info) : ''
  }`;
}
export function soliditySetFunctionFromStorageInfo(
  name: string,
  info: StorageInfo
) {
  return `
      function ${name}(${getTypeFunctionSignature(info.type)} value) public {
          vm.store(target, bytes32(${name}_storage_slot), ${getDataToStoreCasting(
    info.type
  )});
      }
      `;
}
export function generateLoadCall(
  slot_declaration: string,
  slot_content_declaration: string,
  offset: number = 0,
  allocate: boolean = true
) {
  return `${
    allocate ? 'uint256 ' : ''
  }${slot_content_declaration} = uint256(vm.load(target, bytes32(${slot_declaration} + uint256(${offset}))));`;
}

export function generateClearCallStruct(info: StorageInfo) {
  return generateClearCall(
    SLOT_CONTENT,
    getByteSizeFromType(info.type),
    info.pointer.offset
  );
}

export function generateClearCall(
  slot_content_declaration: string,
  size: number,
  offset: number | string
) {
  return `${slot_content_declaration} = clear(${slot_content_declaration}, ${size}, ${offset});`;
}

export function generateMaskCallStruct(
  name: string,
  info: StorageInfo,
  struct_declaration: string = 'value'
) {
  return `slot_content = set(slot_content, uint256(${getDataToStoreCasting(
    info.type,
    `${struct_declaration}.${name}`
  )}), ${info.pointer.offset});`;
}
export function generateMaskCall(
  slot_content_declaration: string,
  value_declaration: string,
  offset: string | number
) {
  return `${slot_content_declaration} = set(${slot_content_declaration}, uint256(${value_declaration}), ${offset});`;
}

export function generateStoreCall(
  slot_content_declaration: string,
  slot_declaration: string,
  offset: number | string = 0
) {
  return `vm.store(target, bytes32(${slot_declaration} + uint256(${offset})), bytes32(${slot_content_declaration}));`;
}

export function soliditySetFunctionFromStorageInfoWithOffset(
  name: string,
  info: StorageInfo
) {
  return `
      function ${name}(${getTypeFunctionSignature(info.type)} value) public {
          ${generateLoadCall(name + '_storage_slot', SLOT_CONTENT)}
          ${generateClearCallStruct(info)}
          ${generateMaskCallStruct(name, info)}
          ${generateStoreCall(SLOT_CONTENT, name + '_storage_slot')}

      }
      `;
}
export function soliditySetEnumFunctionFromStorageInfo(
  name: string,
  info: StorageInfo
) {
  if (info.pointer.offset > 0) {
    return soliditySetFunctionFromStorageInfoWithOffset(name, info);
  } else {
    return `
      function ${name}(uint8 value) public {
          vm.store(target, bytes32(${name}_storage_slot), bytes32(uint256(value)));
      }
      `;
  }
}
