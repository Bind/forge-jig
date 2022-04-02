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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileContractLayouts = exports.compileContractLayout = void 0;
__exportStar(require("./src"), exports);
__exportStar(require("./src/create"), exports);
__exportStar(require("./src/types"), exports);
__exportStar(require("./src/predicate"), exports);
const ast_1 = require("ast");
const create_1 = require("./src/create");
async function compileContractLayout(file, contractName) {
    const ast = await (0, ast_1.generateAST)(await (0, ast_1.compile)(file));
    const contractDefinition = (0, ast_1.getContractDefinition)(ast, contractName);
    const declarations = (0, ast_1.getVariableDeclarationsForContract)(ast, contractDefinition);
    return (0, create_1.generateContractLayout)(ast, contractName, declarations);
}
exports.compileContractLayout = compileContractLayout;
async function compileContractLayouts(file) {
    const ast = await (0, ast_1.generateAST)(await (0, ast_1.compile)(file));
    const contractDefinitions = (0, ast_1.getContractDefinitions)(ast);
    return contractDefinitions
        .filter((c) => {
        const unit = (0, ast_1.getParentSourceUnit)(c);
        return unit.absolutePath.includes(file);
    })
        .map((c) => {
        const dec = (0, ast_1.getVariableDeclarationsForContract)(ast, c);
        return (0, create_1.generateContractLayout)(ast, c.name, dec);
    });
}
exports.compileContractLayouts = compileContractLayouts;
