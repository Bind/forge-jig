import {
  generateAST,
  compile,
  getContractDefinition,
  getASTStorageFromContractDefinition,
} from '../src';

describe('generateAST', () => {
  it('works', async () => {
    const ast = await generateAST(await compile());
    const contractDefinition = getContractDefinition(ast, 'Basic');
    console.log(getASTStorageFromContractDefinition(contractDefinition));
  });
});
