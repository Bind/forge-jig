import { isSolidityType } from '../../types';
import { MappingPointer } from './mapping';
import {
  StorageInfo,
  StorageInfoArray,
  StorageInfoMapping,
  StorageInfos,
  StorageInfoStruct,
} from './types';

export function isStorageInfoStruct(value: any): value is StorageInfoStruct {
  return (value as StorageInfoStruct).layout !== undefined;
}
export function isStorageInfoMapping(value: any): value is StorageInfoMapping {
  return (value as StorageInfoMapping).variant === 'mapping';
}
export function isStorageInfoArray(value: any): value is StorageInfoArray {
  return (value as StorageInfoArray).variant === 'array';
}
export function isStorageInfo(value: StorageInfos): value is StorageInfo {
  return isSolidityType((value as StorageInfo).type);
}

export function isMappingPointer(
  value: MappingPointer['value']
): value is MappingPointer {
  return (value as MappingPointer).slot !== undefined;
}

export function hasMapping(storage: StorageInfoStruct): boolean {
  return !!Object.keys(storage.layout.variables).find((v) => {
    //@ts-ignore
    let variable = storage.layout.variables[v!];
    if (isSolidityType(variable)) {
      return false;
    } else if (isStorageInfoStruct(variable)) {
      return hasMapping(variable);
    } else if (isStorageInfoMapping(variable)) {
      return true;
    } else {
      return false;
    }
  });
}
