import {
  isStorageInfoMapping,
  StorageInfo,
  StorageInfoMapping,
  StorageInfos,
  StorageLayout,
} from './storage';
import {
  getDataToStoreCasting,
  getTypeFunctionSignature,
  isSolidityType,
  SOLIDITY_TYPES,
} from './types';

function template(contractName: string, body: string) {
  return `
// THIS FILE WAS GENERATED
// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;
import "forge-std/stdlib.sol";
import "forge-std/Vm.sol";

contract ${contractName}Jig {
    address target;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));
    constructor(address _contractAddress){
      target = _contractAddress;
    }
    ${body}
}`;
}

function solidityConstFromStorageInfo(name: string, info: StorageInfos) {
  return `bytes32 ${name}_storage_slot = bytes32(uint256(${info.pointer.slot}));\n`;
}
function soliditySetFunctionFromStorageInfo(name: string, info: StorageInfo) {
  return `
    function ${name}(${getTypeFunctionSignature(info.type)} value) public {
        vm.store(target, ${name}_storage_slot, ${getDataToStoreCasting(
    info.type
  )});
    }
    `;
}
function soliditySetEnumFunctionFromStorageInfo(name: string, _: StorageInfo) {
  return `
    function ${name}(uint8 value) public {
        vm.store(target, ${name}_storage_slot, bytes32(uint256(value));
    }
    `;
}
function soliditySetMappingFunctionFromStorageInfo(
  name: string,
  info: StorageInfoMapping
) {
  const flattened_keys: SOLIDITY_TYPES[] = [];
  let final_value: SOLIDITY_TYPES = 'uint';

  const flatten = (info: StorageInfoMapping) => {
    if (isSolidityType(info.value as string)) {
      flattened_keys.push(info.key);
      final_value = info.value as SOLIDITY_TYPES;
      return;
    } else {
      flattened_keys.push(info.key);
      flatten(info.value as StorageInfoMapping);
    }
  };
  flatten(info);
  const args = flattened_keys.map(
    (k, i) => `${getTypeFunctionSignature(k)} key${i}`
  );
  let slotEncoding = '';
  flattened_keys.forEach((_, i) => {
    if (slotEncoding === '') {
      slotEncoding = `keccak256(abi.encode(key${i}, ${name}_storage_slot))`;
    } else {
      slotEncoding = `keccak256(abi.encode(key${i}, ${slotEncoding}))`;
    }
  });

  return `
    function ${name}(${args.join(', ')}, ${getTypeFunctionSignature(
    final_value
  )} value) public {
        bytes32 slot = ${slotEncoding};
        vm.store(target, slot, ${getDataToStoreCasting(final_value)});
    }
    `;
}
export function generateJigBody(layout: StorageLayout) {
  let body = '';
  const vars = Object.keys(layout.variables);
  vars.forEach((key) => {
    body += solidityConstFromStorageInfo(key, layout.variables[key]);
  });
  vars.forEach((key) => {
    const storageInfo = layout.variables[key];
    switch (storageInfo.variant) {
      case 'simple':
        body += soliditySetFunctionFromStorageInfo(key, storageInfo);
        break;
      case 'array':
        // TODO: Implement
        body += '';
        break;
      case 'mapping':
        if (isStorageInfoMapping(storageInfo)) {
          body += soliditySetMappingFunctionFromStorageInfo(key, storageInfo);
        } else {
          throw new Error(
            'storageInfo.variant=mapping must be of type StorageInfoMapping'
          );
        }
        break;
      case 'struct':
        // TODO: Implement
        body += '';
        break;
      case 'enum':
        body += soliditySetEnumFunctionFromStorageInfo(key, storageInfo);
        break;
      default:
        throw new Error(`${layout.variables[key].variant} is not handled`);
    }
  });
  return body;
}

export function generateJig(contractName: string, layout: StorageLayout) {
  return template(contractName, generateJigBody(layout));
}
