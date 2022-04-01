import { SOLIDITY_TYPES } from '../../types';
import { StorageInfoStruct } from './types';

export interface ArrayPointer {
  slot: number;
  value: SOLIDITY_TYPES | StorageInfoStruct | ArrayPointer;
}
