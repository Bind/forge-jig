import {
  getDataToStoreCasting,
  getTypeFunctionSignature,
} from '../solidityTypes';
import { StorageInfo, StorageInfos } from '../storage/types';

export function solidityConstFromStorageInfo(name: string, info: StorageInfos) {
  return `bytes32 ${name}_storage_slot = bytes32(uint256(${info.pointer.slot}));\n`;
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
export function soliditySetEnumFunctionFromStorageInfo(
  name: string,
  _: StorageInfo
) {
  return `
      function ${name}(uint8 value) public {
          vm.store(target, ${name}_storage_slot, bytes32(uint256(value)));
      }
      `;
}
