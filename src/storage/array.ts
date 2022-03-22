import { SOLIDITY_TYPES } from '../solidityTypes';
import { StorageInfoStruct } from './types';

export interface ArrayPointer {
  slot: number;
  value: SOLIDITY_TYPES | StorageInfoStruct | ArrayPointer;
}
