import * as dotenv from 'dotenv';
dotenv.config();
import {
  ASTNode,
  ASTNodeSelector,
  ASTReader,
  compileSol,
  ContractDefinition,
  ElementaryTypeName,
  SourceUnit,
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

export function countStorageSlots(
  ast: SourceUnit[],
  declarations: VariableDeclaration[]
): number {
  const stor = new ContractStorage();
  ast;
  for (let idx in declarations) {
    let declaration = declarations[idx];
    console.log(declarations);
    if (
      declaration.vType instanceof ElementaryTypeName &&
      isSolidityType(declaration.typeString)
    ) {
      const bytes = getByteSizeFromType(declaration.typeString);
      stor.appendData(bytes);
    }
  }
  return stor.getLength();
}
