import {
  ASTNode,
  ASTNodeSelector,
  ContractDefinition,
  InheritanceSpecifier,
  PragmaDirective,
  SourceUnit,
  VariableDeclaration,
} from "solc-typed-ast";

export function getBySelector(
  ast: SourceUnit[],
  selector: ASTNodeSelector
): ASTNode {
  const unit = ast.find((s) => s.getChildrenBySelector(selector).length > 0);
  if (!unit) throw new Error("Unable to find node with selector");
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
    n instanceof ContractDefinition && n.raw.name === contractName;
  const unit = ast.find((s) => s.getChildrenBySelector(selector));
  if (!unit)
    throw new Error("Unable to find contract with name " + contractName);
  return unit.getChildrenBySelector(selector)[0] as ContractDefinition;
}
export function getContractDefinitionFromInheritanceSpecifier(
  ast: SourceUnit[],
  node: InheritanceSpecifier
): ContractDefinition {
  const selector: ASTNodeSelector = (n) => {
    return n.id === node.vBaseType.referencedDeclaration;
  };
  const unit = ast.find((s) => {
    return (
      typeof s.getChildrenBySelector(selector) !== undefined &&
      s.getChildrenBySelector(selector).length > 0
    );
  });
  if (!unit) throw new Error("Unable to find contract for inheritance");
  const contract = unit.getChildrenBySelector(selector)[0];
  if (contract instanceof ContractDefinition) {
    return contract;
  } else {
    throw Error("no contract for " + node.vBaseType.referencedDeclaration);
  }
}

export function getVariableDeclarationsForContract(
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
          ...getVariableDeclarationsForContract(ast, contractDec),
        ];
      } else {
        return [];
      }
    }, []);
  const implSlots = node.getChildrenBySelector(
    selector
  ) as VariableDeclaration[];
  return [...inheritedSlots, ...implSlots].filter(
    (n) => n.mutability !== "immutable"
  );
}

export function getParentSourceUnit(node: ASTNode): SourceUnit {
  if (node instanceof SourceUnit) return node;
  if (!node.parent) throw new Error("no parent for node");
  if (node.parent instanceof SourceUnit) return node.parent;

  let parent = node.parent;
  while (parent.parent !== undefined) {
    parent = parent.parent;
    if (parent instanceof SourceUnit) {
      return parent;
    }
  }
  throw new Error("couldn't find source unit");
}

export function getPragma(node: ASTNode): PragmaDirective {
  const root = getParentSourceUnit(node);
  return root.getChildrenByType(PragmaDirective)[0];
}
