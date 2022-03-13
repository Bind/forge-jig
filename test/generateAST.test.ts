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
  generateStorageMap,
} from '../src';

const files = fs.readdirSync('test/samples/');

const assertions = {
  'basic.sol': {
    storage: true,
    expectedSlots: 1,
    variables: ['uint256'],
  },
  'basic-struct.sol': {
    storage: true,
    expectedSlots: 1,
    variables: ['struct Initialized'],
  },
  'basic-struct2.sol': {
    storage: true,
    expectedSlots: 3,
    variables: ['struct Hello', 'struct Yo'],
  },
  'basic-foo.sol': {
    storage: false,
    expectedSlots: 0,
    variables: [],
  },
  'basic-mapping.sol': {
    storage: true,
    expectedSlots: 1,
    variables: ['mapping(uint256 => uint256)'],
  },
  'basic-array.sol': {
    storage: true,
    expectedSlots: 1,
    variables: ['uint256[]'],
  },
  'basic-enum.sol': {
    storage: true,
    expectedSlots: 1,
    variables: ['enum AliveEnum'],
  },
} as const;

const isolate = ['basic-struct2.sol'];
for (let idx in files) {
  let file = files[idx] as keyof typeof assertions;
  if (isolate.length > 0 && !isolate.includes(file)) continue;
  describe('\ngenerate and parse Solidity AST for ' + file, () => {
    it('parsed AST', async () => {
      const ast = await generateAST(await compile('test/samples/' + file));
      console.log(ast);
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
      const storage = generateStorageMap(ast, declarations);
      if (assertions[file].storage) {
        expect(storage.getLength()).toBe(assertions[file].expectedSlots);
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
