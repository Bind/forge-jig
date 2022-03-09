import * as dotenv from 'dotenv';
dotenv.config();
import {
  ASTNodeSelector,
  ASTReader,
  compileSol,
  ContractDefinition,
  SourceUnit,
  VariableDeclaration,
} from 'solc-typed-ast';

export async function compile() {
  const { data } = await compileSol('test/samples/basic.sol', 'auto', []);
  console.log(data);
  return data;
}

export function generateAST(data: any) {
  const reader = new ASTReader();
  return reader.read(data);
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
