"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertions = void 0;
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
dotenv.config();
const solc_typed_ast_1 = require("solc-typed-ast");
const find_1 = require("ast/src/find");
const solc_1 = require("ast/src/solc");
const __1 = require("../..");
const CONTRACT_DIR = process.env.CONTRACT_DIR || "../../contracts/";
const files = fs.readdirSync(CONTRACT_DIR);
exports.assertions = {
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
const isolate = [];
for (let idx in files) {
    let file = files[idx];
    if (isolate.length > 0 && !isolate.includes(file))
        continue;
    if (typeof exports.assertions?.[file] == "undefined")
        continue;
    describe("\ngenerate and parse Solidity AST for " + file, () => {
        it("parsed AST", async () => {
            const ast = await (0, solc_1.generateAST)(await (0, solc_1.compile)(CONTRACT_DIR + file));
            const contractDefinition = (0, find_1.getContractDefinition)(ast, exports.assertions[file].name);
            const children = (0, find_1.getVariableDeclarationsForContract)(ast, contractDefinition);
            expect(children).toBeTruthy();
        });
        it(`plucked storage`, async () => {
            const ast = await (0, solc_1.generateAST)(await (0, solc_1.compile)(CONTRACT_DIR + file));
            const contractDefinition = (0, find_1.getContractDefinition)(ast, exports.assertions[file].name);
            const declarations = (0, find_1.getVariableDeclarationsForContract)(ast, contractDefinition);
            const storage = (0, __1.generateContractLayout)(ast, contractDefinition.name, declarations);
            if (exports.assertions[file].storage) {
                expect(storage.getLength()).toBe(exports.assertions[file].expectedSlots);
                expect(declarations[0].vType instanceof solc_typed_ast_1.ElementaryTypeName ||
                    declarations[0].vType instanceof solc_typed_ast_1.UserDefinedTypeName ||
                    declarations[0].vType instanceof solc_typed_ast_1.Mapping ||
                    declarations[0].vType instanceof solc_typed_ast_1.ArrayTypeName).toBe(true);
                expect(declarations[0].vType?.typeString).toBe(exports.assertions[file].variables[0]);
            }
        });
        it("generated layout", async () => {
            const storage = await (0, __1.compileContractLayout)(CONTRACT_DIR + file, exports.assertions[file].name);
            if (exports.assertions[file].explicitSlotChecks) {
                exports.assertions[file].explicitSlotChecks.forEach((v) => {
                    const storageInfo = storage.get(v.name);
                    if ((0, __1.isStorageInfoStruct)(storageInfo)) {
                        v.children.forEach((child) => {
                            const childLayout = storageInfo.layout.get(child.name);
                            expect(child.slot).toBe(childLayout.pointer.slot);
                            expect(child.offset).toBe(childLayout.pointer.offset);
                        });
                    }
                    else {
                        expect(v.slot).toBe(storageInfo.pointer.slot);
                        expect(v.offset).toBe(storageInfo.pointer.offset);
                    }
                });
            }
        });
    });
}
