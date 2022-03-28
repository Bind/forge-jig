// import { getTypeFunctionSignature } from '../solidityTypes';
import { isStorageInfo } from '../storage/predicate';
import { StorageInfo, StorageInfoStruct } from '../storage/types';
import {
  generateClearCall,
  generateLoadCall,
  generateMaskCall,
  generateStoreCall,
} from './utils';

export function overwriteInfo(
  slot_name: string,
  struct_declaration: string,
  property_name: string,
  info: StorageInfo,
  offset: number
) {
  return `
          ${generateClearCall(info)}
          ${generateMaskCall(property_name, info, struct_declaration)}
          ${generateStoreCall(slot_name, offset)}
  `;
}

export function soliditySetStructFunction(
  name: string,
  info: StorageInfoStruct
) {
  return `
        function set_${name}(${info.layout.name} memory value) public{
          ${writeStructToSlot(name + '_storage_slot', 'value', info)}
        }
        `;
}

/**
 *
 * @param slot_declaration The variable holding the slot uint256 in solidity code
 * @param struct struct storage information
 */
export function writeStructToSlot(
  slot_declaration: string,
  struct_declaration: string,
  struct: StorageInfoStruct
) {
  let prevSlot = struct.layout.slotRoot;
  return `
  ${generateLoadCall(slot_declaration)}
  ${Object.keys(struct.layout.variables)
    .filter((key: string) => {
      return isStorageInfo(struct.layout.variables[key]);
    })
    .map((key: string) => {
      const storage = struct.layout.variables[key];
      if (isStorageInfo(storage)) {
        let calls = '';
        if (storage.pointer.slot > prevSlot) {
          prevSlot = storage.pointer.slot;
          calls += generateLoadCall(
            slot_declaration,
            prevSlot - struct.layout.slotRoot,
            false
          );
        }
        calls += overwriteInfo(
          slot_declaration,
          struct_declaration,
          key,
          storage,
          prevSlot - struct.layout.slotRoot
        );
        return calls;
      } else {
        return '';
      }
    })
    .join('\n')}
`;
}
