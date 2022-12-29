import { ASTReader, compileSol } from "solc-typed-ast";
import { getRemappings } from "@forge-jig/foundry";
import { ok } from "neverthrow";

export async function compile(path: string, remappings?: string[]) {
  if (!remappings) {
    const result = getRemappings();
    if (result.isOk()) {
      remappings = result.value;
    } else return result;
  }
  const { data } = await compileSol(path, "auto", remappings);
  //@ts-ignore
  console.log(data);
  return ok(data);
}

export function generateAST(data: any) {
  const reader = new ASTReader();
  return reader.read(data);
}
