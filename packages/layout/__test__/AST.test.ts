import * as dotenv from "dotenv";
import * as fs from "fs";
dotenv.config();

import {
  ArrayTypeName,
  ElementaryTypeName,
  Mapping,
  UserDefinedTypeName,
} from "solc-typed-ast";
import {
  getContractDefinition,
  getVariableDeclarationsForContract,
} from "@forge-jig/ast/src/find";
import { generateAST, compile } from "@forge-jig/ast/src/solc";
import {
  generateContractLayout,
  isStorageInfoStruct,
  compileContractLayout,
} from "../src";

const CONTRACT_DIR = process.env.CONTRACT_DIR || "../../contracts/";

const files = fs.readdirSync(CONTRACT_DIR);

type SlotAssertion = {
  name: string;
  offset?: number;
  slot?: number;
  children?: SlotAssertion[];
};

type Assertions = {
  [key: string]: {
    name: string;
    storage: boolean;
    expectedSlots: number;
    variables: string[];
    explicitSlotChecks: SlotAssertion[];
  };
};

export const assertions: Assertions = {
  "01-baby.sol": {
    name: "Baby",
    storage: true,
    expectedSlots: 1,
    variables: ["uint256"],
    explicitSlotChecks: [
      {
        name: "simple",
        slot: 0,
        offset: 0,
      },
    ],
  },
  "05-slime.sol": {
    name: "Slime",
    storage: true,
    expectedSlots: 1,
    variables: ["struct Initialized"],
    explicitSlotChecks: [
      {
        name: "init",
        children: [
          {
            name: "initialized",
            slot: 0,
            offset: 0,
          },
          {
            name: "owner",
            slot: 0,
            offset: 1,
          },
        ],
      },
    ],
  },
  "06-goblin.sol": {
    name: "Goblin",
    storage: true,
    expectedSlots: 3,
    variables: ["struct Hello", "struct Yo"],
    explicitSlotChecks: [
      {
        name: "greetings",
        children: [
          { name: "hello", offset: 0, slot: 0 },
          { name: "howdy", offset: 8, slot: 0 },
          { name: "hi", offset: 16, slot: 0 },
          { name: "hola", offset: 24, slot: 0 },
          { name: "salutations", offset: 0, slot: 1 },
        ],
      },
      {
        name: "ack",
        children: [
          { name: "yo", offset: 0, slot: 2 },
          { name: "wassup", offset: 1, slot: 2 },
        ],
      },
    ],
  },
  "03-empty.sol": {
    name: "Empty",
    storage: false,
    expectedSlots: 0,
    variables: [],
    explicitSlotChecks: [],
  },
  "13-salamander.sol": {
    name: "Salamander",
    storage: true,
    expectedSlots: 1,
    variables: ["mapping(uint256 => uint256)"],
    explicitSlotChecks: [],
  },
  "02-catepillar.sol": {
    name: "Catepillar",
    storage: true,
    expectedSlots: 1,
    variables: ["uint256[]"],
    explicitSlotChecks: [],
  },
  "04-roshambo.sol": {
    name: "RoShamBo",
    storage: true,
    expectedSlots: 1,
    variables: ["enum Moves"],
    explicitSlotChecks: [],
  },
  "07-gold.sol": {
    name: "Gold",
    storage: true,
    expectedSlots: 7,
    variables: [
      "string",
      "string",
      "uint256",
      "mapping(address => uint256)",
      "mapping(address => mapping(address => uint256))",
      "mapping(address => uint256)",
      "uint8",
    ],
    explicitSlotChecks: [],
  },
};

const isolate: string[] = [];
for (let idx in files) {
  let file = files[idx] as keyof typeof assertions;
  if (isolate.length > 0 && !isolate.includes(file as string)) continue;
  if (typeof assertions?.[file] == "undefined") continue;
  describe("\ngenerate and parse Solidity AST for " + file, () => {
    it("parsed AST", async () => {
      const ast = await generateAST(await compile(CONTRACT_DIR + file));
      const contractDefinition = getContractDefinition(
        ast,
        assertions[file].name
      );
      const children = getVariableDeclarationsForContract(
        ast,
        contractDefinition
      );
      expect(children).toBeTruthy();
    });

    it(`plucked storage`, async () => {
      const ast = await generateAST(await compile(CONTRACT_DIR + file));
      const contractDefinition = getContractDefinition(
        ast,
        assertions[file].name
      );
      const declarations = getVariableDeclarationsForContract(
        ast,
        contractDefinition
      );
      const storage = generateContractLayout(
        ast,
        contractDefinition.name,
        declarations
      );
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
    it("generated layout", async () => {
      const storage = await compileContractLayout(
        CONTRACT_DIR + file,
        assertions[file].name
      );
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
