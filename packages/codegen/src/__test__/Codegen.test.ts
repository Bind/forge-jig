import * as dotenv from "dotenv";

import * as fs from "fs";
import { compileContractLayout } from "layout";
import { generateJig } from "../../index";

import { getFoundryConfig, getProjectRoot, FoundryContext } from "foundry";
dotenv.config();

export const assertions = {
  "basic.sol": {
    name: "Basic",
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
  "basic-struct.sol": {
    name: "BasicStruct",
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
  "basic-struct2.sol": {
    name: "BasicStruct2",
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
  "basic-empty.sol": {
    name: "BasicEmpty",
    storage: false,
    expectedSlots: 0,
    variables: [],
    explicitSlotChecks: [],
  },
  "basic-mapping.sol": {
    name: "BasicMapping",
    storage: true,
    expectedSlots: 1,
    variables: ["mapping(uint256 => uint256)"],
    explicitSlotChecks: [],
  },
  "basic-array.sol": {
    name: "BasicArray",
    storage: true,
    expectedSlots: 1,
    variables: ["uint256[]"],
    explicitSlotChecks: [],
  },
  "basic-enum.sol": {
    name: "BasicEnum",
    storage: true,
    expectedSlots: 1,
    variables: ["enum AliveEnum"],
    explicitSlotChecks: [],
  },
  "basic-erc20.sol": {
    name: "BasicERC20",
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

const CONTRACT_DIR = process.env.CONTRACT_DIR || "../../contracts/";
const files = fs.readdirSync(CONTRACT_DIR);
const foundryConfig = getFoundryConfig();
const projectRoot = getProjectRoot();
const context: FoundryContext = {
  config: foundryConfig,
  rootPath: projectRoot,
  processPath: process.cwd(),
};

const isolate: string[] = [];
for (let idx in files) {
  let file = files[idx] as keyof typeof assertions;
  if (isolate.length > 0 && !isolate.includes(file as string)) continue;
  if (typeof assertions?.[file] == "undefined") continue;
  describe(file + ": code gen works", () => {
    it("successfully generates jig contract", async () => {
      const layout = await compileContractLayout(
        CONTRACT_DIR + file,
        assertions[file].name
      );
      console.log(generateJig(assertions[file].name, layout, context));
    });
  });
}
