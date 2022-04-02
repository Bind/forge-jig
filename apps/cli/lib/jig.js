#!/usr/bin/env node
"use strict";
var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = { enumerable: true, get: function() {
      return m[k];
    } };
  }
  Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar = this && this.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k in mod)
      if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
        __createBinding(result, mod, k);
  }
  __setModuleDefault(result, mod);
  return result;
};
var __importDefault = this && this.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const codegen_1 = require("codegen");
const glob = __importStar(require("glob"));
const fs = __importStar(require("fs"));
const layout_1 = require("layout");
const utils_1 = require("utils");
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv)).command("make <pattern> [options]", "generate a jig for solidity contract", () => {
  return yargs_1.default.positional("pattern", {
    type: "string",
    demandOption: true
  });
}, async (argv) => {
  const { pattern } = argv;
  const foundryConfig = (0, utils_1.getFoundryConfig)();
  const projectRoot = (0, utils_1.getProjectRoot)();
  const context = {
    config: foundryConfig,
    rootPath: projectRoot,
    processPath: process.cwd()
  };
  const files = glob.sync(pattern);
  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    const layouts = await (0, layout_1.compileContractLayouts)(file);
    layouts.forEach((layout) => {
      const greeting = `crafting jig for ${file}
`;
      process.stdout.write(greeting);
      const jig = (0, codegen_1.generateJig)(`${layout.name}`, layout, context);
      console.log(`writing to ${foundryConfig.default.src + `/jig/${layout.name}Jig.sol`}`);
      fs.mkdirSync(projectRoot + "/" + foundryConfig.default.src + `/jig/`, {
        recursive: true
      });
      fs.writeFileSync(projectRoot + "/" + foundryConfig.default.src + `/jig/${layout.name}Jig.sol`, jig, {});
    });
  }
  process.exit(0);
}).strict().alias({ h: "help" }).argv;
