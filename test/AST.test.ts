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
  generateStorageLayout,
  compileStorageLayout,
} from '../src/ast';
import { isStorageInfoStruct } from '../src/storage';

const CONTRACT_DIR = process.env.CONTRACT_DIR || './contracts/';

const files = fs.readdirSync(CONTRACT_DIR);

type SlotAssertion = {
  name: string;
  offset?: number;
  slot?: number;
  children?: SlotAssertion[];
};

type Assertions = {
  [key: string]: {
    storage: boolean;
    expectedSlots: number;
    variables: string[];
    explicitSlotChecks: SlotAssertion[];
  };
};

const assertions: Assertions = {
  'basic.sol': {
    storage: true,
    expectedSlots: 1,
    variables: ['uint256'],
    explicitSlotChecks: [
      {
        name: 'simple',
        slot: 0,
        offset: 0,
      },
    ],
  },
  'basic-struct.sol': {
    storage: true,
    expectedSlots: 1,
    variables: ['struct Initialized'],
    explicitSlotChecks: [
      {
        name: 'init',
        children: [
          {
            name: 'initialized',
            slot: 0,
            offset: 0,
          },
          {
            name: 'owner',
            slot: 0,
            offset: 1,
          },
        ],
      },
    ],
  },
  'basic-struct2.sol': {
    storage: true,
    expectedSlots: 3,
    variables: ['struct Hello', 'struct Yo'],
    explicitSlotChecks: [
      {
        name: 'greetings',
        children: [
          { name: 'hello', offset: 0, slot: 0 },
          { name: 'howdy', offset: 8, slot: 0 },
          { name: 'hi', offset: 16, slot: 0 },
          { name: 'hola', offset: 24, slot: 0 },
          { name: 'salutations', offset: 0, slot: 1 },
        ],
      },
      {
        name: 'ack',
        children: [
          { name: 'yo', offset: 0, slot: 2 },
          { name: 'wassup', offset: 1, slot: 2 },
        ],
      },
    ],
  },
  'basic-foo.sol': {
    storage: false,
    expectedSlots: 0,
    variables: [],
    explicitSlotChecks: [],
  },
  'basic-mapping.sol': {
    storage: true,
    expectedSlots: 1,
    variables: ['mapping(uint256 => uint256)'],
    explicitSlotChecks: [],
  },
  'basic-array.sol': {
    storage: true,
    expectedSlots: 1,
    variables: ['uint256[]'],
    explicitSlotChecks: [],
  },
  'basic-enum.sol': {
    storage: true,
    expectedSlots: 1,
    variables: ['enum AliveEnum'],
    explicitSlotChecks: [],
  },
  'basic-erc20.sol': {
    storage: true,
    expectedSlots: 10,
    variables: [
      'string',
      'string',
      'uint8',
      'uint256',
      'mapping(address => uint256)',
      'mapping(address => mapping(address => uint256))',
      'uint256',
      'bytes32',
      'mapping(address => uint256)',
      'uint8',
    ],
    explicitSlotChecks: [],
  },
};

const isolate: string[] = [];
for (let idx in files) {
  let file = files[idx] as keyof typeof assertions;
  if (isolate.length > 0 && !isolate.includes(file as string)) continue;
  if (typeof assertions?.[file] == 'undefined') continue;
  describe('\ngenerate and parse Solidity AST for ' + file, () => {
    it('parsed AST', async () => {
      const ast = await generateAST(await compile(CONTRACT_DIR + file));
      const contractDefinition = getContractDefinition(ast, 'Basic');
      const children = getASTStorageFromContractDefinition(
        ast,
        contractDefinition
      );
      expect(children).toBeTruthy();
    });

    it(`plucked storage`, async () => {
      const ast = await generateAST(await compile(CONTRACT_DIR + file));
      const contractDefinition = getContractDefinition(ast, 'Basic');
      const declarations = getASTStorageFromContractDefinition(
        ast,
        contractDefinition
      );
      const storage = generateStorageLayout(ast, declarations);
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
    it('generated layout', async () => {
      const storage = await compileStorageLayout(CONTRACT_DIR + file, 'Basic');
      if (assertions[file].explicitSlotChecks) {
        assertions[file].explicitSlotChecks.forEach((v) => {
          const storageInfo = storage.get(v.name);
          if (isStorageInfoStruct(storageInfo)) {
            v.children!.forEach((child) => {
              const childLayout = storageInfo.layout.get(child.name);
              expect(child.slot).toBe(childLayout.pointer.slot);
              expect(child.offset).toBe(childLayout.pointer.offset);
            });
          } else {
            expect(v.slot).toBe(storageInfo.pointer.slot);
            expect(v.offset).toBe(storageInfo.pointer.offset);
          }
        });
      }
    });
  });
}
