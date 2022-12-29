import * as dotenv from "dotenv";

import * as fs from "fs";
import { compileContractLayout } from "@forge-jig/layout";
import { generateJig } from "../index";

import {
  getFoundryConfig,
  getProjectRoot,
  FoundryContext,
} from "@forge-jig/foundry";
dotenv.config();

export const assertions = {
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
