import * as dotenv from 'dotenv';
dotenv.config();
import {
  ArrayTypeName,
  ASTNode,
  ASTNodeSelector,
  ASTReader,
  compileSol,
  ContractDefinition,
  ElementaryTypeName,
  EnumDefinition,
  InheritanceSpecifier,
  Mapping,
  SourceUnit,
  StructDefinition,
  UserDefinedTypeName,
  VariableDeclaration,
} from 'solc-typed-ast';
import { MappingPointer, StorageLayout } from './storage';
import { isSolidityType, SOLIDITY_TYPES } from './types';
import { getRemappings } from './utils/remappings';

export async function compile(path: string) {
  const { data } = await compileSol(path, 'auto', getRemappings());
  return data;
}

export function generateAST(data: any) {
  const reader = new ASTReader();
  return reader.read(data);
}

export function getBySelector(
  ast: SourceUnit[],
  selector: ASTNodeSelector
): ASTNode {
  const unit = ast.find((s) => s.getChildrenBySelector(selector));
  if (!unit) throw new Error('Unable to find node with selector');
  return unit.getChildrenBySelector(selector)[0];
}

export function getContractDefinitions(
  ast: SourceUnit[]
): ContractDefinition[] {
  const selector: ASTNodeSelector = (n) => n instanceof ContractDefinition;
  const cdefs = ast.map((unit) => unit.getChildrenBySelector(selector));
  return cdefs.flat(1) as ContractDefinition[];
}
export function getContractDefinition(
  ast: SourceUnit[],
  contractName: string
): ContractDefinition {
  const selector: ASTNodeSelector = (n) =>
    n instanceof ContractDefinition && n.raw.name == contractName;
  const unit = ast.find((s) => s.getChildrenBySelector(selector));
  if (!unit)
    throw new Error('Unable to find contract with name ' + contractName);
  return unit.getChildrenBySelector(selector)[0] as ContractDefinition;
}
export function getContractDefinitionFromInheritanceSpecifier(
  ast: SourceUnit[],
  node: InheritanceSpecifier
): ContractDefinition {
  const selector: ASTNodeSelector = (n) => {
    return n.id == node.vBaseType.referencedDeclaration;
  };
  const unit = ast.find((s) => {
    return (
      typeof s.getChildrenBySelector(selector) !== undefined &&
      s.getChildrenBySelector(selector).length > 0
    );
  });
  if (!unit) throw new Error('Unable to find contract for inheritance');
  const contract = unit.getChildrenBySelector(selector)[0];
  if (contract instanceof ContractDefinition) {
    return contract;
  } else {
    throw Error('no contract for ' + node.vBaseType.referencedDeclaration);
  }
}

export function getASTStorageFromContractDefinition(
  ast: SourceUnit[],
  node: ContractDefinition
): VariableDeclaration[] {
  const selector: ASTNodeSelector = (n) =>
    n instanceof VariableDeclaration && n.parent instanceof ContractDefinition;

  const inheritanceSelector: ASTNodeSelector = (n) =>
    n instanceof InheritanceSpecifier;

  const inheritedContracts = node.getChildrenBySelector(
    inheritanceSelector
  ) as InheritanceSpecifier[];
  const inheritedSlots: VariableDeclaration[] = inheritedContracts
    .map((n) => {
      return getContractDefinitionFromInheritanceSpecifier(ast, n);
    })
    .reduce((acc: VariableDeclaration[], contractDec) => {
      if (contractDec instanceof ContractDefinition) {
        return [
          ...acc,
          ...getASTStorageFromContractDefinition(ast, contractDec),
        ];
      } else {
        return [];
      }
    }, []);
  const implSlots = node.getChildrenBySelector(
    selector
  ) as VariableDeclaration[];
  return [...inheritedSlots, ...implSlots].filter(
    (n) => n.mutability !== 'immutable'
  );
}

function isEnum(
  ast: SourceUnit[],
  structDeclaration: UserDefinedTypeName
): boolean {
  const selector: ASTNodeSelector = (node) =>
    node.id === structDeclaration.referencedDeclaration;
  const structDefinition = getBySelector(ast, selector);
  return structDefinition instanceof EnumDefinition;
}
function isStruct(
  ast: SourceUnit[],
  structDeclaration: UserDefinedTypeName
): boolean {
  const selector: ASTNodeSelector = (node) =>
    node.id === structDeclaration.referencedDeclaration;
  const structDefinition = getBySelector(ast, selector);
  return structDefinition instanceof StructDefinition;
}

export function getStructStorageLayout(
  ast: SourceUnit[],
  structDeclaration: UserDefinedTypeName,
  rootSlot: number
): StorageLayout {
  const selector: ASTNodeSelector = (node) =>
    node.id === structDeclaration.referencedDeclaration;
  const structDefinition = getBySelector(ast, selector) as StructDefinition;
  if (!(structDefinition instanceof StructDefinition))
    throw new Error('not StructDefinition');
  return generateStorageLayout(
    ast,
    structDefinition.name,
    structDefinition.children,
    rootSlot
  );
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
        layout: getStructStorageLayout(ast, valueType, rootSlot),
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

export function generateStorageLayout(
  ast: SourceUnit[],
  storageName: string,
  declarations: readonly ASTNode[],
  rootSlot: number = 0
): StorageLayout {
  const stor = new StorageLayout(storageName, rootSlot);
  ast;
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
        const structLayout = getStructStorageLayout(
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

export async function compileStorageLayout(
  file: string,
  contractName: string
): Promise<StorageLayout> {
  const ast = await generateAST(await compile(file));
  const contractDefinition = getContractDefinition(ast, contractName);
  const declarations = getASTStorageFromContractDefinition(
    ast,
    contractDefinition
  );
  return generateStorageLayout(ast, contractName, declarations);
}

export async function compileStorageLayouts(
  file: string
): Promise<StorageLayout[]> {
  const ast = await generateAST(await compile(file));
  const contractDefinitions = getContractDefinitions(ast);
  return contractDefinitions.map((c) => {
    const dec = getASTStorageFromContractDefinition(ast, c);
    return generateStorageLayout(ast, c.name, dec);
  });
}
