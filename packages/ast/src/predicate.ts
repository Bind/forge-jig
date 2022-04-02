import {
  ASTNodeSelector,
  EnumDefinition,
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
