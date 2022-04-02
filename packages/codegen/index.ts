import {
  StorageLayout,
  hasMapping,
  isStorageInfoArray,
  isStorageInfoMapping,
  isStorageInfoStruct,
  isStorageInfo,
  isStorageInfoEnum,
} from "layout";

import { FoundryContext } from "foundry";
import { soliditySetMappingFunctionFromStorageInfo } from "./src/mapping";
import {
  solidityConstFromStorageInfo,
  soliditySetEnumFunctionFromStorageInfo,
  soliditySetFunctionFromStorageInfo,
} from "./src/utils";
import { generateJigImports } from "./src/imports";
import { soliditySetStructFunction } from "./src/struct";
import { soliditySetArrayFunctionFromStorageInfo } from "./src/array";

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
${imports}

interface CheatCodes {
  function store(address,bytes32,bytes32) external;
  function load(address,bytes32) external returns (bytes32);
}

contract ${contractName}Jig {
    address internal target;
    CheatCodes public constant VM =
    CheatCodes(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));
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
  let body = "";
  const vars = Object.keys(layout.variables);
  vars.forEach((key) => {
    body += solidityConstFromStorageInfo(key, layout.variables[key]);
  });

  vars.forEach((key) => {
    const storageInfo = layout.variables[key];
    if (isStorageInfo(storageInfo)) {
      body += soliditySetFunctionFromStorageInfo(key, storageInfo);
    } else if (isStorageInfoArray(storageInfo)) {
      body += soliditySetArrayFunctionFromStorageInfo(key, storageInfo);
    } else if (isStorageInfoMapping(storageInfo)) {
      body += soliditySetMappingFunctionFromStorageInfo(key, storageInfo);
    } else if (isStorageInfoStruct(storageInfo)) {
      if (hasMapping(storageInfo)) {
        body += generateJigBody(storageInfo.layout);
      } else {
        body += soliditySetStructFunction(key, storageInfo);
      }
    } else if (isStorageInfoEnum(storageInfo)) {
      body += soliditySetEnumFunctionFromStorageInfo(key, storageInfo);
    } else {
      throw new Error(
        "Issue generate code for \n" + JSON.stringify(storageInfo)
      );
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
