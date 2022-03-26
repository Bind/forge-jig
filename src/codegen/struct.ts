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
  var_name: string,
  info: StorageInfo,
  offset: number
) {
  return `
          ${generateClearCall(info)}
          ${generateMaskCall(var_name, info)}
          ${generateStoreCall(slot_name, offset)}
  `;
}

export function soliditySetStructFunction(
  name: string,
  info: StorageInfoStruct
) {
  let prevSlot = info.layout.slotRoot;
  return `
        function set_${name}(${info.layout.name} memory value) public{
          ${generateLoadCall(name + '_storage_slot')}
          ${Object.keys(info.layout.variables)
            .filter((key: string) => {
              return isStorageInfo(info.layout.variables[key]);
            })
            .map((key: string) => {
              const storage = info.layout.variables[key];
              if (isStorageInfo(storage)) {
                let calls = '';
                if (storage.pointer.slot > prevSlot) {
                  prevSlot = storage.pointer.slot;
                  calls += generateLoadCall(
                    name + '_storage_slot',
                    prevSlot - info.layout.slotRoot,
                    false
                  );
                }
                calls += overwriteInfo(
                  name + '_storage_slot',
                  key,
                  storage,
                  prevSlot - info.layout.slotRoot
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
