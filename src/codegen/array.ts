import {
  getByteSizeFromType,
  getTypeFunctionSignature,
  isSolidityType,
  SOLIDITY_TYPES,
} from '../solidityTypes';
import { StorageInfoArray } from '../storage/types';

export function soliditySetArrayFunctionFromStorageInfo(
  name: string,
  info: StorageInfoArray
) {
  if (isSolidityType(info.value)) {
    const slotEncoding = `uint256(keccak256(abi.encode(${name}_storage_slot)))`;
    return `  function ${name}( uint256 key, ${getTypeFunctionSignature(
      info.value
    )} value) public {
        //check array length
        uint8 offset = uint8(key * ${getByteSizeFromType(
          info.value as SOLIDITY_TYPES
        )} % 32);
        uint8 slotOffset = uint8((key * ${getByteSizeFromType(
          info.value as SOLIDITY_TYPES
        )} - offset) / 32);
        uint256 arrayLength = uint256(vm.load(target, bytes32(${name}_storage_slot)));  
        if (arrayLength < key){
          vm.store(target, bytes32(${name}_storage_slot), bytes32(key));
        }
        uint256 slot = ${slotEncoding} + slotOffset;
        uint256 raw_slot = uint256(vm.load(target, bytes32(slot)));
        raw_slot = clear(raw_slot, ${getByteSizeFromType(info.value)}, offset);
        raw_slot = set(raw_slot, value, offset);
        vm.store(target, bytes32(slot), bytes32(raw_slot));
    }
    `;
  } else {
    // Handle struct in array;
    console.log(info);
    return '';
  }
}
