import { SOLIDITY_TYPES } from '../solidityTypes';
import { StorageInfoMapping, StorageInfoStruct } from './types';

export interface MappingPointer {
  slot: number;
  key: SOLIDITY_TYPES;
  value: SOLIDITY_TYPES | MappingPointer | StorageInfoStruct;
}

export function isMappingPointer(
  value: SOLIDITY_TYPES | MappingPointer | StorageInfoStruct
): value is MappingPointer {
  return (<MappingPointer>value).slot !== undefined;
}

export function mappingPointerToStorage(
  mapping: MappingPointer
): StorageInfoMapping {
  const value = mapping.value;
  return {
    variant: 'mapping',
    key: mapping.key,
    value: isMappingPointer(value)
      ? mappingPointerToStorage(value)
      : (mapping.value as SOLIDITY_TYPES | StorageInfoMapping),
    pointer: { slot: 0, offset: 0 },
  };
}
