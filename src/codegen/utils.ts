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
  name: string,
  offset: number = 0,
  allocate: boolean = true
) {
  return `${
    allocate ? 'uint256 ' : ''
  }raw_slot = uint256(vm.load(target, bytes32(${name} + uint256(${offset}))));`;
}

export function generateClearCall(info: StorageInfo) {
  return `raw_slot = clear(raw_slot, ${getByteSizeFromType(info.type)}, ${
    info.pointer.offset
  });`;
}
export function generateMaskCall(
  name: string,
  info: StorageInfo,
  struct_declaration: string = 'value'
) {
  return `raw_slot = set(raw_slot, uint256(${getDataToStoreCasting(
    info.type,
    `${struct_declaration}.${name}`
  )}), ${info.pointer.offset});`;
}

export function generateStoreCall(name: string, offset: number = 0) {
  return `vm.store(target, bytes32(${name} + uint256(${offset})), bytes32(raw_slot));`;
}

export function soliditySetFunctionFromStorageInfoWithOffset(
  name: string,
  info: StorageInfo
) {
  return `
      function ${name}(${getTypeFunctionSignature(info.type)} value) public {
          ${generateLoadCall(name + '_storage_slot')}
          ${generateClearCall(info)}
          ${generateMaskCall(name, info)}
          ${generateStoreCall(name + '_storage_slot')}

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
