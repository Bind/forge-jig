import {
  ArrayTypeName,
  ASTNode,
  ASTNodeSelector,
  ContractDefinition,
  ElementaryTypeName,
  Mapping,
  PragmaDirective,
  SourceUnit,
  StructDefinition,
  UserDefinedTypeName,
  VariableDeclaration,
} from "solc-typed-ast";
import * as path from "path";
import {
  isEnum,
  isStruct,
  isContract,
  getBySelector,
  getParentSourceUnit,
  getPragma,
} from "@forge-jig/ast";
import { StorageLayout } from "./StorageLayout";
import { MappingPointer } from "./mapping";
import { isSolidityType, SOLIDITY_TYPES } from "@forge-jig/types";
import { StorageInfoArray } from "./types";

export function getImportNameFromStruct(node: StructDefinition) {
  if (node.parent instanceof SourceUnit) {
    return node.name;
  } else if (node.parent instanceof ContractDefinition) {
    return node.parent.name;
  } else {
    throw new Error("unexpected case for generate an import name");
  }
}

export function getStructLayout(
  ast: SourceUnit[],
  structDeclaration: UserDefinedTypeName,
  rootSlot: number
): StorageLayout {
  const selector: ASTNodeSelector = (node) =>
    node.id === structDeclaration.referencedDeclaration;
  const structDefinition = getBySelector(ast, selector);
  if (!(structDefinition instanceof StructDefinition))
    throw new Error("not StructDefinition");
  const source = getParentSourceUnit(structDeclaration);
  const importName = getImportNameFromStruct(structDefinition);
  const storage = generateContractLayout(
    ast,
    structDefinition.raw.canonicalName,
    structDefinition.children,
    rootSlot,
    importName
  );
  storage.setSource(path.resolve(source.sourceEntryKey));
  return storage;
}

export function getMappingLayout(
  ast: SourceUnit[],
  mappingDeclaration: Mapping,
  rootSlot: number
): MappingPointer {
  const keyTypeString = mappingDeclaration.vKeyType.typeString;
  const valueTypeString = mappingDeclaration.vValueType.typeString;
  const valueType = mappingDeclaration.vValueType;

  if (isSolidityType(keyTypeString) && isSolidityType(valueTypeString)) {
    return {
      slot: rootSlot,
      key: keyTypeString,
      value: valueTypeString,
    };
  } else if (isSolidityType(keyTypeString) && valueType instanceof Mapping) {
    return {
      slot: rootSlot,
      key: keyTypeString,
      value: getMappingLayout(ast, valueType, rootSlot),
    };
  } else if (
    isSolidityType(keyTypeString) &&
    valueType instanceof UserDefinedTypeName &&
    isStruct(ast, valueType)
  ) {
    return {
      slot: rootSlot,
      key: keyTypeString as SOLIDITY_TYPES,
      value: {
        variant: "struct",
        layout: getStructLayout(ast, valueType, rootSlot),
        pointer: {
          slot: rootSlot,
          offset: 0,
        },
      },
    };
  } else if (valueType instanceof ArrayTypeName) {
    return {
      slot: rootSlot,
      key: keyTypeString as SOLIDITY_TYPES,
      value: generateArrayLayout(ast, valueType, rootSlot),
    };
  } else {
    console.log(valueType, "is not handled");
    throw new Error(`${keyTypeString} or ${valueTypeString} is not handled `);
  }
}
export function generateArrayLayout(
  ast: SourceUnit[],
  arrayDeclaration: ArrayTypeName,
  rootSlot: number
): StorageInfoArray {
  const valueType = arrayDeclaration.vBaseType;
  const valueTypeString = arrayDeclaration.vBaseType.typeString;
  if (isSolidityType(valueTypeString)) {
    return {
      variant: "array",
      pointer: { slot: rootSlot, offset: 0 },
      value: valueTypeString,
    };
  } else if (
    valueType instanceof UserDefinedTypeName &&
    isStruct(ast, valueType)
  ) {
    return {
      variant: "array",
      pointer: { slot: rootSlot, offset: 0 },
      value: {
        variant: "struct",
        layout: getStructLayout(ast, valueType, rootSlot),
        pointer: {
          slot: rootSlot,
          offset: 0,
        },
      },
    };
  } else if (valueType instanceof ArrayTypeName) {
    return {
      variant: "array",
      pointer: { slot: rootSlot, offset: 0 },
      value: generateArrayLayout(ast, valueType, rootSlot),
    };
  } else {
    console.log(valueType, "is not handled");
    throw new Error(` ${valueTypeString} is not handled for array layouts`);
  }
}

function toPragmaString(node: PragmaDirective) {
  return `pragma ${node.vIdentifier} ${node.vValue};`;
}

export function generateContractLayout(
  ast: SourceUnit[],
  storageName: string,
  declarations: readonly ASTNode[],
  rootSlot: number = 0,
  importName: string = ""
): StorageLayout {
  const stor = new StorageLayout(
    storageName,
    rootSlot,
    toPragmaString(getPragma(ast[0])),
    importName
  );

  for (let idx in declarations) {
    let declaration = declarations[idx];
    if (!(declaration instanceof VariableDeclaration)) {
      console.log("Is not Instance");
      console.log(declaration);
      continue;
    }
    if (
      declaration.vType instanceof ElementaryTypeName &&
      isSolidityType(declaration.typeString)
    ) {
      stor.appendSolidityType(declaration.name, declaration.typeString);
    } else if (declaration.vType instanceof UserDefinedTypeName) {
      if (isEnum(ast, declaration.vType)) {
        stor.appendEnum(declaration.name);
      } else if (isStruct(ast, declaration.vType)) {
        const structLayout = getStructLayout(
          ast,
          declaration.vType,
          stor.getLength()
        );
        stor.appendStruct(declaration.name, structLayout);
      } else if (isContract(ast, declaration.vType)) {
        stor.appendSolidityType(declaration.name, "address");
      } else {
        console.log(declaration.vType, "is not handled");
      }
    } else if (declaration.vType instanceof Mapping) {
      stor.appendMapping(
        declaration.name,
        getMappingLayout(ast, declaration.vType, stor.getLength())
      );
    } else if (declaration.vType instanceof ArrayTypeName) {
      stor.appendArray(
        declaration.name,
        generateArrayLayout(ast, declaration.vType, stor.getLength())
      );
    }
  }
  return stor;
}
