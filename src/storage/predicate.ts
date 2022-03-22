import { isSolidityType, SOLIDITY_TYPES } from '../solidityTypes';
import { ArrayPointer } from './array';
import { MappingPointer } from './mapping';
import {
  StorageInfo,
  StorageInfoMapping,
  StorageInfos,
  StorageInfoStruct,
} from './types';

export function isStorageInfoStruct(value: any): value is StorageInfoStruct {
  return (<StorageInfoStruct>value).layout !== undefined;
}
export function isStorageInfoMapping(value: any): value is StorageInfoMapping {
  return (<StorageInfoMapping>value).variant == 'mapping';
}
export function isStorageInfo(value: StorageInfos): value is StorageInfo {
  return isSolidityType((<StorageInfo>value).type);
}

export function isMappingPointer(
  value: SOLIDITY_TYPES | MappingPointer | StorageInfoStruct | ArrayPointer
): value is MappingPointer {
  return (<MappingPointer>value).slot !== undefined;
}
