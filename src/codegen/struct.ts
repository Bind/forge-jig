// import { getTypeFunctionSignature } from '../solidityTypes';
import {
  isStorageInfo,
  isStorageInfoArray,
  isStorageInfoStruct,
} from '../storage/predicate';
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
  struct: StorageInfoStruct,
  allocate_slot_pointer: boolean = true
): string {
  let prevSlot = struct.layout.slotRoot;
  return `
  ${generateLoadCall(slot_declaration, 0, allocate_slot_pointer)}
  ${Object.keys(struct.layout.variables)
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
      } else if (isStorageInfoStruct(storage)) {
        //probably need to bump slot here
        let slot_name = ` ${key}_storage_slot`;
        prevSlot = storage.pointer.slot;
        let calls = `uint256 ${slot_name} = ${slot_declaration} + uint256(${
          prevSlot - struct.layout.slotRoot
        });`;

        calls += writeStructToSlot(
          slot_name,
          `${struct_declaration}.${key}`,
          storage,
          false
        );

        return calls;
      } else if (isStorageInfoArray(storage)) {
        return '//Struct { array} not implemented';
      } else {
        return '';
      }
    })
    .join('\n')}
`;
}
