import {
  getByteSizeFromType,
  getDataToStoreCasting,
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
        uint256 arrayLength = uint256(vm.load(target, bytes32(key)));  
     uint8 byteSize = ${getByteSizeFromType(info.value as SOLIDITY_TYPES)};
     if (arrayLength < key){
       vm.store(target, bytes32(${name}_storage_slot), bytes32(key));
     }
        uint256 slot = ${slotEncoding};
        vm.store(target, bytes32(slot), ${getDataToStoreCasting(info.value)});
    }
    `;
  } else {
    // Handle struct in array;
    console.log(info);
    return '';
  }
}
