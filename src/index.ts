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
import { ContractStorage } from './storage';
import { getByteSizeFromType, isSolidityType } from './types';

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

export function getStructLayout(
  ast: SourceUnit[],
  structDeclaration: UserDefinedTypeName
): number {
  const selector: ASTNodeSelector = node =>
    node.id === structDeclaration.referencedDeclaration;
  const structDefinition = getBySelector(ast, selector) as StructDefinition;
  if (structDefinition instanceof EnumDefinition) {
    return 1;
  } else if (structDefinition instanceof StructDefinition) {
    return countStorageSlots(ast, structDefinition.children);
  } else {
    console.log(structDefinition);

    throw new Error('definitionType not handled');
  }
}

export function countStorageSlots(
  ast: SourceUnit[],
  declarations: readonly ASTNode[]
): number {
  const stor = new ContractStorage();
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
      const bytes = getByteSizeFromType(declaration.typeString);
      stor.appendBytes(bytes);
    } else if (declaration.vType instanceof UserDefinedTypeName) {
      const structSlots = getStructLayout(ast, declaration.vType);
      stor.appendSlots(structSlots);
    } else if (declaration.vType instanceof Mapping) {
      stor.appendSlots(1);
    } else if (declaration.vType instanceof ArrayTypeName) {
      stor.appendSlots(1);
    }
  }
  return stor.getLength();
}
