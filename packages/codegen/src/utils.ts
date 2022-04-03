import { SLOT_CONTENT, STORAGE_SLOT } from "./constants";
import {
  getByteSizeFromType,
  getDataToStoreCasting,
  getTypeFunctionSignature,
} from "types";
import { StorageInfo, StorageInfos, StorageInfoEnum } from "layout";

export function solidityConstslotOffset(name: string, info: StorageInfos) {
  return `uint8 public  ${name}slotOffset = uint8(${info.pointer.offset});\n`;
}

export function solidityConstFromStorageInfo(name: string, info: StorageInfos) {
  return `uint256 public ${name}${STORAGE_SLOT} = uint256(${
    info.pointer.slot
  });\n${info.pointer.offset > 0 ? solidityConstslotOffset(name, info) : ""}`;
}
export function soliditySetFunctionFromStorageInfo(
  name: string,
  info: StorageInfo
) {
  return `
      function ${name}(${getTypeFunctionSignature(info.type)} value) public {
        VM.store(target, bytes32(${name}${STORAGE_SLOT}), ${getDataToStoreCasting(
    info.type
  )});
      }
      `;
}
export function generateLoadCall(
  slot_declaration: string,
  slot_content_declaration: string,
  offset: number = 0,
  allocate: boolean = true
) {
  return `${
    allocate ? "uint256 " : ""
  }${slot_content_declaration} = uint256(VM.load(target, bytes32(${slot_declaration} + uint256(${offset}))));`;
}

export function generateClearCallStruct(info: StorageInfo) {
  return generateClearCall(
    SLOT_CONTENT,
    getByteSizeFromType(info.type),
    info.pointer.offset
  );
}

export function generateClearCall(
  slot_content_declaration: string,
  size: number,
  offset: number | string
) {
  return `${slot_content_declaration} = clear(${slot_content_declaration}, ${size}, ${offset});`;
}

export function generateMaskCallStruct(
  name: string,
  info: StorageInfo,
  struct_declaration: string = "value"
) {
  return `${SLOT_CONTENT} = set(${SLOT_CONTENT}, uint256(${getDataToStoreCasting(
    info.type,
    `${struct_declaration}.${name}`
  )}), ${info.pointer.offset});`;
}
export function generateMaskCall(
  slot_content_declaration: string,
  value_declaration: string,
  offset: string | number
) {
  return `${slot_content_declaration} = set(${slot_content_declaration}, uint256(${value_declaration}), ${offset});`;
}

export function generateStoreCall(
  slot_content_declaration: string,
  slot_declaration: string,
  offset: number | string = 0
) {
  return `VM.store(target, bytes32(${slot_declaration} + uint256(${offset})), bytes32(${slot_content_declaration}));`;
}

export function soliditySetFunctionFromStorageInfoWithOffset(
  name: string,
  info: StorageInfo
) {
  return `
      function ${name}(${getTypeFunctionSignature(info.type)} value) public {
          ${generateLoadCall(name + STORAGE_SLOT, SLOT_CONTENT)}
          ${generateClearCallStruct(info)}
          ${generateMaskCallStruct(name, info)}
          ${generateStoreCall(SLOT_CONTENT, name + STORAGE_SLOT)}

      }
      `;
}
export function soliditySetFunctionFromStorageInfoEnumWithOffset(
  name: string,
  info: StorageInfoEnum
) {
  return `
      function ${name}(${getTypeFunctionSignature(name)} value) public {
          ${generateLoadCall(name + STORAGE_SLOT, SLOT_CONTENT)}
          ${generateClearCall(SLOT_CONTENT, 1, info.pointer.offset)}
          ${generateMaskCall(SLOT_CONTENT, "value", info.pointer.offset)}
          ${generateStoreCall(SLOT_CONTENT, name + STORAGE_SLOT)}

      }
      `;
}
export function soliditySetEnumFunctionFromStorageInfo(
  name: string,
  info: StorageInfoEnum
) {
  if (info.pointer.offset > 0) {
    return soliditySetFunctionFromStorageInfoEnumWithOffset(name, info);
  } else {
    return `
      function ${name}(uint8 value) public {
        VM.store(target, bytes32(${name}${STORAGE_SLOT}), bytes32(uint256(value)));
      }
      `;
  }
}
