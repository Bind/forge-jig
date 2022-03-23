import { StorageLayout } from '../storage';

import {
  isStorageInfoMapping,
  isStorageInfoStruct,
} from '../storage/predicate';

import { FoundryContext } from '../utils/types';
import { soliditySetMappingFunctionFromStorageInfo } from './mapping';
import {
  solidityConstFromStorageInfo,
  soliditySetEnumFunctionFromStorageInfo,
  soliditySetFunctionFromStorageInfo,
} from './utils';
import { generateJigImports } from './imports';

function template(contractName: string, imports: string, body: string) {
  return `
// THIS FILE WAS GENERATED
// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;
import "forge-std/stdlib.sol";
import "forge-std/Vm.sol";
${imports}

contract ${contractName}Jig {
    address target;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));
    constructor(address _contractAddress){
      target = _contractAddress;
    }
    function zero_bytes(
      uint256 slotData,
      uint8 length,
      uint8 offset
  ) internal returns (uint256) {
      return
          (slotData & type(uint256).max) ^
          (((1 << (2**(length + 1))) - 1) << (2**offset));
  }

  // Must be zeroed out first
  function set_bytes(
      uint256 slotData,
      uint256 value,
      uint8 offset
  ) internal returns (uint256) {
      return slotData | (value << (2**offset));
  }
    ${body}
}`;
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
        if (isStorageInfoStruct(storageInfo)) {
          body += soliditySetStructFunction(key, storageInfo);
        }
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

export function generateJig(
  contractName: string,
  layout: StorageLayout,
  context: FoundryContext
) {
  return template(
    contractName,
    generateJigImports(layout, context),
    generateJigBody(layout)
  );
}
