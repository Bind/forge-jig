export * from "./StorageLayout";
export * from "./create";
export * from "./types";
export * from "./predicate";
import { generateContractLayout } from "./create";
import { StorageLayout } from "./StorageLayout";
import { err, Err, ok, Result } from "neverthrow";
import {
  getContractDefinition,
  getContractDefinitions,
  getParentSourceUnit,
  getVariableDeclarationsForContract,
  generateAST,
  compile,
} from "@forge-jig/ast";

export async function compileContractLayout(
  file: string,
  contractName: string
): Promise<Result<StorageLayout, any>> {
  const compileResult = await compile(file);
  if (compileResult.isOk()) {
    const ast = await generateAST(compileResult.value);
    const contractDefinition = getContractDefinition(ast, contractName);
    const declarations = getVariableDeclarationsForContract(
      ast,
      contractDefinition
    );
    return ok(generateContractLayout(ast, contractName, declarations));
  }
  return err("failed to compile");
}

export async function compileContractLayouts(
  file: string
): Promise<Result<StorageLayout[], any>> {
  const compileResult = await compile(file);
  if (compileResult.isOk()) {
    const ast = await generateAST(compileResult.value);
    const contractDefinitions = getContractDefinitions(ast);
    return ok(
      contractDefinitions
        .filter((c) => {
          const unit = getParentSourceUnit(c);
          return unit.absolutePath.includes(file);
        })
        .map((c) => {
          const dec = getVariableDeclarationsForContract(ast, c);
          return generateContractLayout(ast, c.name, dec);
        })
    );
  }
  return err("failed to compile");
}
