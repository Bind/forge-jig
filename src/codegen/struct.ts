// import { getTypeFunctionSignature } from '../solidityTypes';
import { SLOT_CONTENT } from '../constants';
import {
  isStorageInfo,
  isStorageInfoArray,
  isStorageInfoStruct,
} from '../storage/predicate';
import { StorageInfo, StorageInfoStruct } from '../storage/types';
import { writeArrayToSlot } from './array';
import {
  generateClearCallStruct,
  generateLoadCall,
  generateMaskCallStruct,
  generateStoreCall,
} from './utils';

export function overwriteInfo(
  slot_declaration: string,
  struct_declaration: string,
  property_name: string,
  info: StorageInfo,
  slot_offset: number
) {
  return `
          ${generateClearCallStruct(info)}
          ${generateMaskCallStruct(property_name, info, struct_declaration)}
          ${generateStoreCall(SLOT_CONTENT, slot_declaration, slot_offset)}
  `;
}

export function soliditySetStructFunction(
  name: string,
  info: StorageInfoStruct
) {
  return `
        function ${name}(${info.layout.name} memory value) public{
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
  ${generateLoadCall(slot_declaration, SLOT_CONTENT, 0, allocate_slot_pointer)}
  ${Object.keys(struct.layout.variables)
    .map((key: string) => {
      const storage = struct.layout.variables[key];
      if (isStorageInfo(storage)) {
        let calls = '';
        if (storage.pointer.slot > prevSlot) {
          prevSlot = storage.pointer.slot;
          calls += generateLoadCall(
            slot_declaration,
            SLOT_CONTENT,
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
        let slot_name = ` ${key}_storage_slot`;
        prevSlot = storage.pointer.slot;
        let calls = `uint256 ${slot_name} = ${slot_declaration} + uint256(${
          prevSlot - struct.layout.slotRoot
        });`;
        calls += writeArrayToSlot(
          slot_name,
          `${struct_declaration}.${key}`,
          storage
        );
        return calls;
      } else {
        return '';
      }
    })
    .join('\n')}
`;
}
