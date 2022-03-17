import {
  isStorageInfo,
  StorageInfo,
  StorageInfos,
  StorageLayout,
} from './storage';

function template(contractName: string, body: string) {
  return `
// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;
import "forge-std/stdlib.sol";
import "forge-std/Vm.sol";

contract ${contractName}Molding {
    address mold;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));
    constructor(address _contractAddress){
       mold = _contractAddress;
    }
    ${body}
}`;
}

function solidityConstFromStorageInfo(name: string, info: StorageInfos) {
  return `bytes32 ${name}_storage_slot = ${info.pointer.slot};`;
}
function soliditySetFunctionFromStorageInfo(name: string, info: StorageInfo) {
  return `
    function ${name}(${info.type} value) public {
        vm.store(mold, ${name}_storage_slot, bytes32(value));
    }
    `;
}
export function generateMoldingBody(layout: StorageLayout) {
  let body = '';
  const vars = Object.keys(layout.variables);
  vars.forEach((key) => {
    body += solidityConstFromStorageInfo(key, layout.variables[key]);
  });
  vars.forEach((key) => {
    const storageInfo = layout.variables[key];
    if (isStorageInfo(storageInfo)) {
      body += soliditySetFunctionFromStorageInfo(key, storageInfo);
    }
  });
  return body;
}

export function generateMolding(contractName: string, layout: StorageLayout) {
  return template(contractName, generateMoldingBody(layout));
}
