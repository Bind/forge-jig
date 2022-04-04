import { ASTReader, compileSol } from "solc-typed-ast";
import { getRemappings } from "@forge-jig/foundry";

export async function compile(path: string) {
  const { data } = await compileSol(path, "auto", getRemappings());
  return data;
}

export function generateAST(data: any) {
  const reader = new ASTReader();
  return reader.read(data);
}
