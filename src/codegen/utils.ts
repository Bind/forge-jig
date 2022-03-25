import {
  getByteSizeFromType,
  getDataToStoreCasting,
  getTypeFunctionSignature,
} from '../solidityTypes';
import { StorageInfo, StorageInfos } from '../storage/types';

export function solidityConstSlotOffset(name: string, info: StorageInfos) {
  console.log(`uint8 ${name}_slot_offset = uint8(${info.pointer.offset});\n`);
  return `uint8 ${name}_slot_offset = uint8(${info.pointer.offset});\n`;
}

export function solidityConstFromStorageInfo(name: string, info: StorageInfos) {
  return `bytes32 ${name}_storage_slot = bytes32(uint256(${
    info.pointer.slot
  }));\n${info.pointer.offset > 0 ? solidityConstSlotOffset(name, info) : ''}`;
}
export function soliditySetFunctionFromStorageInfo(
  name: string,
  info: StorageInfo
) {
  return `
      function ${name}(${getTypeFunctionSignature(info.type)} value) public {
          vm.store(target, ${name}_storage_slot, ${getDataToStoreCasting(
    info.type
  )});
      }
      `;
}
export function generateLoadCall(name: string) {
  return `uint256 raw_slot = uint256(vm.load(target, ${name}_storage_slot));`;
}
export function generateClearCall(info: StorageInfo) {
  return `raw_slot = clear(raw_slot, ${getByteSizeFromType(info.type)}, ${
    info.pointer.offset
  });`;
}
export function generateMaskCall(name: string, info: StorageInfo) {
  return `raw_slot = set(raw_slot, uint256(${getDataToStoreCasting(
    info.type,
    `value.${name}`
  )}), ${info.pointer.offset});`;
}

export function generateStoreCall(name: string) {
  return `vm.store(target, ${name}_storage_slot, bytes32(raw_slot));`;
}

export function soliditySetFunctionFromStorageInfoWithOffset(
  name: string,
  info: StorageInfo
) {
  return `
      function ${name}(${getTypeFunctionSignature(info.type)} value) public {
          ${generateLoadCall(name)}
          ${generateClearCall(info)}
          ${generateMaskCall(name, info)}
          ${generateStoreCall(name)}

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
          vm.store(target, ${name}_storage_slot, bytes32(uint256(value)));
      }
      `;
  }
}
