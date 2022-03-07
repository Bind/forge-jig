import { generateAST, compile } from '../src';

describe('generateAST', () => {
  it('works', async () => {
    generateAST(await compile());
  });
});
