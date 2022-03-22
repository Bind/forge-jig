import { StorageLayout } from '../storage';

import { isStorageInfoMapping } from '../storage/predicate';

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
