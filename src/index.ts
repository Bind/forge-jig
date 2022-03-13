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
  Mapping,
  SourceUnit,
  StructDefinition,
  UserDefinedTypeName,
  VariableDeclaration,
} from 'solc-typed-ast';
import { StorageLayout } from './storage';
import { isSolidityType } from './types';

export async function compile(path: string) {
  const { data } = await compileSol(path, 'auto', []);
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
  const unit = ast.find(s => s.getChildrenBySelector(selector));
  if (!unit) throw new Error('Unable to find node with selector');
  return unit.getChildrenBySelector(selector)[0];
}

export function getContractDefinition(
  ast: SourceUnit[],
  contractName: string
): ContractDefinition {
  const selector: ASTNodeSelector = n =>
    n instanceof ContractDefinition && n.raw.name == contractName;
  const unit = ast.find(s => s.getChildrenBySelector(selector));
  if (!unit)
    throw new Error('Unable to find contract with name ' + contractName);
  return unit.getChildrenBySelector(selector)[0] as ContractDefinition;
}

export function getASTStorageFromContractDefinition(
  node: ContractDefinition
): VariableDeclaration[] {
  const selector: ASTNodeSelector = n =>
    n instanceof VariableDeclaration && n.parent instanceof ContractDefinition;
  return node.getChildrenBySelector(selector);
}

function isEnum(
  ast: SourceUnit[],
  structDeclaration: UserDefinedTypeName
): boolean {
  const selector: ASTNodeSelector = node =>
    node.id === structDeclaration.referencedDeclaration;
  const structDefinition = getBySelector(ast, selector) as StructDefinition;
  return structDefinition instanceof EnumDefinition;
}

export function getStructStorageLayout(
  ast: SourceUnit[],
  structDeclaration: UserDefinedTypeName
): StorageLayout {
  const selector: ASTNodeSelector = node =>
    node.id === structDeclaration.referencedDeclaration;
  const structDefinition = getBySelector(ast, selector) as StructDefinition;
  if (!(structDefinition instanceof StructDefinition))
    throw new Error('not StructDefinition');
  return generateStorageMap(ast, structDefinition.children);
}

export function generateStorageMap(
  ast: SourceUnit[],
  declarations: readonly ASTNode[]
): StorageLayout {
  const stor = new StorageLayout();
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
        const structLayout = getStructStorageLayout(ast, declaration.vType);
        stor.appendVariableDeclaration(
          declaration.name,
          'struct',
          structLayout
        );
      }
    } else if (declaration.vType instanceof Mapping) {
      stor.appendVariableDeclaration(declaration.name, 'mapping');
    } else if (declaration.vType instanceof ArrayTypeName) {
      stor.appendVariableDeclaration(declaration.name, 'array');
    }
  }
  return stor;
}
