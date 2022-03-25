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
  info: StorageInfo
) {
  return `
          ${generateClearCall(info)}
          ${generateMaskCall(var_name, info)}
          ${generateStoreCall(slot_name)}
  `;
}

export function soliditySetStructFunction(
  name: string,
  info: StorageInfoStruct
) {
  return `
        function set_${name}(${info.layout.name} memory value) public{
          ${generateLoadCall(name)}
          ${Object.keys(info.layout.variables)
            .filter((key: string) => {
              return isStorageInfo(info.layout.variables[key]);
            })
            .map((key: string) => {
              const storage = info.layout.variables[key];
              if (isStorageInfo(storage)) {
                return overwriteInfo(name, key, storage);
              } else {
                return '';
              }
            })
            .join('\n')}
        }
        `;
}
