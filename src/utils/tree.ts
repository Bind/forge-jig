import {
  ASTNodeCallback,
  ContractDefinition,
  FunctionDefinition,
  SourceUnit,
  StateVariableVisibility,
  VariableDeclaration,
} from 'solc-typed-ast';

export function ASTToTreeString(units: SourceUnit[]) {
  let treeString = '';
  const INDENT = '|   ';
  const walker: ASTNodeCallback = node => {
    const level = node.getParents().length;
    const indent = INDENT.repeat(level);

    let message = node.type + ' #' + node.id;

    if (node instanceof SourceUnit) {
      message += ' -> ' + node.absolutePath;
    } else if (node instanceof ContractDefinition) {
      message += ' -> ' + node.kind + ' ' + node.name;

      const interfaceId = node.interfaceId;

      if (interfaceId !== undefined) {
        message += ` [id: ${interfaceId}]`;
      }
    } else if (node instanceof FunctionDefinition) {
      const signature = node.canonicalSignature;

      if (signature) {
        const selector = node.canonicalSignatureHash;

        message += ` -> ${signature} [selector: ${selector}]`;
      } else {
        message += ` -> ${node.kind}`;
      }
    } else if (node instanceof VariableDeclaration) {
      if (node.stateVariable) {
        message += ` -> ${node.typeString} ${node.visibility} ${node.name}`;

        if (node.visibility === StateVariableVisibility.Public) {
          const signature = node.getterCanonicalSignature;
          const selector = node.getterCanonicalSignatureHash;

          message += ` [getter: ${signature}, selector: ${selector}]`;
        }
      } else {
        message +=
          node.name === ''
            ? ` -> ${node.typeString}`
            : ` -> ${node.typeString} ${node.name}`;
      }
    }

    treeString = treeString + '\n' + indent + message;
  };

  for (const unit of units) {
    unit.walk(walker);
  }

  return treeString;
}
