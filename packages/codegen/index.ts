import { StorageLayout } from '../layout/src';

import {
  hasMapping,
  isStorageInfoArray,
  isStorageInfoMapping,
  isStorageInfoStruct,
} from 'layout/src/predicate';

import { FoundryContext } from '../utils/types';
import { soliditySetMappingFunctionFromStorageInfo } from './src/mapping';
import {
  solidityConstFromStorageInfo,
  soliditySetEnumFunctionFromStorageInfo,
  soliditySetFunctionFromStorageInfo,
} from './src/utils';
import { generateJigImports } from './src/imports';
import { soliditySetStructFunction } from './src/struct';
import { soliditySetArrayFunctionFromStorageInfo } from './src/array';

function template(
  contractName: string,
  pragma: string,
  imports: string,
  body: string
) {
  return `
// THIS FILE WAS GENERATED
// SPDX-License-Identifier: MIT
${pragma}
import "forge-std/stdlib.sol";
import "forge-std/Vm.sol";
${imports}

contract ${contractName}Jig {
    address internal target;
    Vm public constant VM =
        Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));
    constructor(address _contractAddress){
      target = _contractAddress;
    }
      function clear(
        uint256 slotData,
        uint8 length,
        uint8 offset
    ) public pure returns (uint256) {
      if (length == 32){
        return uint256(0);
      }
        unchecked {
            return
                slotData &
                (type(uint256).max ^
                    (((1 << (8 * length)) - 1) << (offset * 8)));
        }
    }

    // Must be zeroed out first
    function set(
        uint256 slotData,
        uint256 value,
        uint8 offset
    ) public pure returns (uint256) {
        return slotData | (value << (offset * 8));
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
        if (isStorageInfoArray(storageInfo)) {
          body += soliditySetArrayFunctionFromStorageInfo(key, storageInfo);
        }
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
          if (hasMapping(storageInfo)) {
            body += generateJigBody(storageInfo.layout);
          } else {
            body += soliditySetStructFunction(key, storageInfo);
          }
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
    layout.pragma,
    generateJigImports(layout, context),
    generateJigBody(layout)
  );
}
