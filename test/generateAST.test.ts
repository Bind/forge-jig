import * as dotenv from 'dotenv';
dotenv.config();
import * as fs from 'fs';
import { ElementaryTypeName, UserDefinedTypeName } from 'solc-typed-ast';
import {
  generateAST,
  compile,
  getContractDefinition,
  getASTStorageFromContractDefinition,
} from '../src';

const files = fs.readdirSync('test/samples/');

const assertions = {
  'basic.sol': {
    storage: true,
    variables: ['uint256'],
  },
  'basic-struct.sol': {
    storage: true,
    variables: ['Initialized'],
  },
  'basic-foo.sol': {
    storage: false,
    variables: [],
  },
} as const;

for (let idx in files) {
  let file = files[idx];
  describe('\ngenerate and parse Solidity AST for ' + file, () => {
    it('parsed AST', async () => {
      const ast = await generateAST(await compile('test/samples/' + file));
      const contractDefinition = getContractDefinition(ast, 'Basic');
      const children = getASTStorageFromContractDefinition(contractDefinition);
      expect(children).toBeTruthy();
    });

    it(`plucked storage`, async () => {
      const ast = await generateAST(await compile('test/samples/' + file));
      const contractDefinition = getContractDefinition(ast, 'Basic');
      const children = getASTStorageFromContractDefinition(contractDefinition);
      if (assertions[file as keyof typeof assertions].storage) {
        expect(
          children[0].vType instanceof ElementaryTypeName ||
            children[0].vType instanceof UserDefinedTypeName
        ).toBe(true);

        const vtype = children[0].vType as
          | ElementaryTypeName
          | UserDefinedTypeName;
        expect(vtype.name).toBe(
          assertions[file as keyof typeof assertions].variables[0]
        );
      }
    });
  });
}
