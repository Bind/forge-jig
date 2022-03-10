import * as dotenv from 'dotenv';
dotenv.config();
import * as fs from 'fs';
import {
  ArrayTypeName,
  ElementaryTypeName,
  Mapping,
  UserDefinedTypeName,
} from 'solc-typed-ast';
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
    skip: false,
  },
  'basic-struct.sol': {
    storage: true,
    variables: ['struct Initialized'],
    skip: false,
  },
  'basic-foo.sol': {
    storage: false,
    variables: [],
    skip: false,
  },
  'basic-mapping.sol': {
    storage: true,
    variables: ['mapping(uint256 => uint256)'],
    skip: false,
  },
  'basic-array.sol': {
    storage: true,
    variables: ['uint256[]'],
    skip: false,
  },
} as const;

for (let idx in files) {
  let file = files[idx];
  if (assertions[file as keyof typeof assertions]?.skip) continue;
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
            children[0].vType instanceof UserDefinedTypeName ||
            children[0].vType instanceof Mapping ||
            children[0].vType instanceof ArrayTypeName
        ).toBe(true);
        expect(children[0].vType?.typeString).toBe(
          assertions[file as keyof typeof assertions].variables[0]
        );
      }
    });
  });
}
