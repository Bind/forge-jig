import {
  ArrayTypeName,
  ASTNode,
  ASTNodeSelector,
  ElementaryTypeName,
  Mapping,
  SourceUnit,
  StructDefinition,
  UserDefinedTypeName,
  VariableDeclaration,
} from 'solc-typed-ast';
import * as path from 'path';
import { getBySelector, getParentSourceUnit } from './ast/find';
import { isEnum, isStruct } from './ast/predicate';
import { StorageLayout } from './storage';
import { MappingPointer } from './storage/mapping';
import { isSolidityType, SOLIDITY_TYPES } from './solidityTypes';
import { StorageInfoArray } from './storage/types';

export function getStructLayout(
  ast: SourceUnit[],
  structDeclaration: UserDefinedTypeName,
  rootSlot: number
): StorageLayout {
  const selector: ASTNodeSelector = (node) =>
    node.id === structDeclaration.referencedDeclaration;
  const structDefinition = getBySelector(ast, selector) as StructDefinition;
  if (!(structDefinition instanceof StructDefinition))
    throw new Error('not StructDefinition');
  const source = getParentSourceUnit(structDeclaration);

  const storage = generateContractLayout(
    ast,
    structDefinition.name,
    structDefinition.children,
    rootSlot
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
        variant: 'struct',
        layout: getStructLayout(ast, valueType, rootSlot),
        pointer: {
          slot: rootSlot,
          offset: 0,
        },
      },
    };
  } else {
    console.log(valueType);
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
      variant: 'array',
      pointer: { slot: rootSlot, offset: 0 },
      value: valueTypeString,
    };
  } else if (
    valueType instanceof UserDefinedTypeName &&
    isStruct(ast, valueType)
  ) {
    return {
      variant: 'array',
      pointer: { slot: rootSlot, offset: 0 },
      value: {
        variant: 'struct',
        layout: getStructLayout(ast, valueType, rootSlot),
        pointer: {
          slot: rootSlot,
          offset: 0,
        },
      },
    };
  } else {
    console.log(valueType);
    throw new Error(` ${valueTypeString} is not handled for array layouts`);
  }
}

export function generateContractLayout(
  ast: SourceUnit[],
  storageName: string,
  declarations: readonly ASTNode[],
  rootSlot: number = 0
): StorageLayout {
  const stor = new StorageLayout(storageName, rootSlot);
  for (let idx in declarations) {
    let declaration = declarations[idx];
    if (!(declaration instanceof VariableDeclaration)) {
      console.log('Is not Instance');
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
      } else {
        const structLayout = getStructLayout(
          ast,
          declaration.vType,
          stor.getLength()
        );
        stor.appendStruct(declaration.name, structLayout);
      }
    } else if (declaration.vType instanceof Mapping) {
      stor.appendMapping(
        declaration.name,
        getMappingLayout(ast, declaration.vType, stor.getLength())
      );
    } else if (declaration.vType instanceof ArrayTypeName) {
      console.log(declaration);

      stor.appendArray(
        declaration.name,
        generateArrayLayout(ast, declaration.vType, stor.getLength())
      );
    }
  }
  return stor;
}
