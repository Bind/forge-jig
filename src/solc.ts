import { ASTReader, compileSol } from 'solc-typed-ast';
import { getRemappings } from './utils/remappings';

export async function compile(path: string) {
  const { data } = await compileSol(path, 'auto', getRemappings());
  return data;
}

export function generateAST(data: any) {
  const reader = new ASTReader();
  return reader.read(data);
}
