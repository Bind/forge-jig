import {
  ASTNodeSelector,
  ContractDefinition,
  EnumDefinition,
  IdentifierPath,
  SourceUnit,
  StructDefinition,
  UserDefinedTypeName,
} from "solc-typed-ast";
import { getBySelector } from "./find";

export function isEnum(
  ast: SourceUnit[],
  structDeclaration: UserDefinedTypeName
): boolean {
  const selector: ASTNodeSelector = (node) =>
    node.id === structDeclaration.referencedDeclaration;
  const structDefinition = getBySelector(ast, selector);
  return structDefinition instanceof EnumDefinition;
}

export function isStruct(
  ast: SourceUnit[],
  structDeclaration: UserDefinedTypeName
): boolean {
  const selector: ASTNodeSelector = (node) =>
    node.id === structDeclaration.referencedDeclaration;
  const structDefinition = getBySelector(ast, selector);
  return structDefinition instanceof StructDefinition;
}

export function isContract(
  ast: SourceUnit[],
  contractDeclaration: UserDefinedTypeName
): boolean {
  const selector: ASTNodeSelector = (node) =>
    node.id === contractDeclaration.referencedDeclaration;
  const contractDefinition = getBySelector(ast, selector);
  return contractDefinition instanceof ContractDefinition;
}
