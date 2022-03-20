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
import { StorageLayout } from './storage';
import { isSolidityType } from './types';
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
  const structDefinition = getBySelector(ast, selector) as StructDefinition;
  return structDefinition instanceof EnumDefinition;
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
  return generateStorageLayout(ast, structDefinition.children, rootSlot);
}
export function getMappingLayout(
  ast: SourceUnit[],
  mappingDeclaration: Mapping,
  rootSlot: number
) {
  ast;
  rootSlot;
  mappingDeclaration;
}

export function generateStorageLayout(
  ast: SourceUnit[],
  declarations: readonly ASTNode[],
  rootSlot: number = 0
): StorageLayout {
  const stor = new StorageLayout(rootSlot);
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
      getMappingLayout(ast, declaration.vType, stor.getLength());
      stor.appendVariableDeclaration(declaration.name, 'mapping');
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
  return generateStorageLayout(ast, declarations);
}
