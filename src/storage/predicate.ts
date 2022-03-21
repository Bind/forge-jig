import { isSolidityType } from '../solidityTypes';
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
