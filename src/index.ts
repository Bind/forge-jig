import * as dotenv from 'dotenv';
dotenv.config();
export async function compile() {
  const { data } = await compileSol('test/samples/basic.sol', 'auto', []);
  console.log(data);
  return data;
}

export function generateAST(data: any) {
  const reader = new ASTReader();
  const units = reader.read(data);
  console.log(ASTToTreeString(units));
  console.log('AST HEAD');

  // console.log(util.inspect(reader.context.map.get(1), false, null, true));
}
