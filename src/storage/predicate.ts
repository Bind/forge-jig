import { isSolidityType, SOLIDITY_TYPES } from '../solidityTypes';
import { ArrayPointer } from './array';
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
  value: SOLIDITY_TYPES | MappingPointer | StorageInfoStruct | ArrayPointer
): value is MappingPointer {
  return (value as MappingPointer).slot !== undefined;
}
