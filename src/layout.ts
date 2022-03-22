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
      slot: 0,
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
      stor.appendVariableDeclaration(declaration.name, declaration.typeString);
    } else if (declaration.vType instanceof UserDefinedTypeName) {
      if (isEnum(ast, declaration.vType)) {
        stor.appendVariableDeclaration(declaration.name, 'enum');
      } else {
        const structLayout = getStructLayout(
          ast,
          declaration.vType,
          stor.getLength()
        );
        stor.appendVariableDeclaration(
          declaration.name,
          'struct',
          structLayout
        );
      }
    } else if (declaration.vType instanceof Mapping) {
      stor.appendMappingDeclaration(
        declaration.name,
        getMappingLayout(ast, declaration.vType, stor.getLength())
      );
    } else if (declaration.vType instanceof ArrayTypeName) {
      stor.appendVariableDeclaration(declaration.name, 'array');
    }
  }
  return stor;
}
