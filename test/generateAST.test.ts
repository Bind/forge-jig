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
  countStorageSlots,
} from '../src';

const files = fs.readdirSync('test/samples/');

const assertions = {
  'basic.sol': {
    storage: true,
    expectedSlots: 1,
    variables: ['uint256'],
    skip: false,
  },
  'basic-struct.sol': {
    storage: true,
    expectedSlots: 1,
    variables: ['struct Initialized'],
    skip: false,
  },
  'basic-foo.sol': {
    storage: false,
    expectedSlots: 0,
    variables: [],
    skip: false,
  },
  'basic-mapping.sol': {
    storage: true,
    expectedSlots: 1,
    variables: ['mapping(uint256 => uint256)'],
    skip: false,
  },
  'basic-array.sol': {
    storage: true,
    expectedSlots: 1,
    variables: ['uint256[]'],
    skip: false,
  },
  'basic-enum.sol': {
    storage: true,
    expectedSlots: 1,
    variables: ['enum AliveEnum'],
    skip: false,
  },
} as const;

for (let idx in files) {
  let file = files[idx] as keyof typeof assertions;
  if (assertions[file]?.skip) continue;
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
      const declarations = getASTStorageFromContractDefinition(
        contractDefinition
      );
      const slots = countStorageSlots(ast, declarations);
      if (assertions[file].storage) {
        expect(slots).toBe(assertions[file].expectedSlots);
        expect(
          declarations[0].vType instanceof ElementaryTypeName ||
            declarations[0].vType instanceof UserDefinedTypeName ||
            declarations[0].vType instanceof Mapping ||
            declarations[0].vType instanceof ArrayTypeName
        ).toBe(true);
        expect(declarations[0].vType?.typeString).toBe(
          assertions[file].variables[0]
        );
      }
    });
  });
}
