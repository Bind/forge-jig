export * from "./StorageLayout";
export * from "./create";
export * from "./types";
export * from "./predicate";
import { generateContractLayout } from "./create";
import { StorageLayout } from "./StorageLayout";

import {
  getContractDefinition,
  getContractDefinitions,
  getParentSourceUnit,
  getVariableDeclarationsForContract,
  generateAST,
  compile,
} from "ast";

export async function compileContractLayout(
  file: string,
  contractName: string
): Promise<StorageLayout> {
  const ast = await generateAST(await compile(file));
  const contractDefinition = getContractDefinition(ast, contractName);
  const declarations = getVariableDeclarationsForContract(
    ast,
    contractDefinition
  );
  return generateContractLayout(ast, contractName, declarations);
}

export async function compileContractLayouts(
  file: string
): Promise<StorageLayout[]> {
  const ast = await generateAST(await compile(file));
  const contractDefinitions = getContractDefinitions(ast);
  return contractDefinitions
    .filter((c) => {
      const unit = getParentSourceUnit(c);
      return unit.absolutePath.includes(file);
    })
    .map((c) => {
      const dec = getVariableDeclarationsForContract(ast, c);
      return generateContractLayout(ast, c.name, dec);
    });
}
