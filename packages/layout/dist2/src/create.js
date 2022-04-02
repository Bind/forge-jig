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
exports.generateContractLayout = exports.generateArrayLayout = exports.getMappingLayout = exports.getStructLayout = void 0;
const solc_typed_ast_1 = require("solc-typed-ast");
const path = __importStar(require("path"));
const ast_1 = require("ast");
const _1 = require(".");
const types_1 = require("types");
function getStructLayout(ast, structDeclaration, rootSlot) {
    const selector = (node) => node.id === structDeclaration.referencedDeclaration;
    const structDefinition = (0, ast_1.getBySelector)(ast, selector);
    if (!(structDefinition instanceof solc_typed_ast_1.StructDefinition))
        throw new Error("not StructDefinition");
    const source = (0, ast_1.getParentSourceUnit)(structDeclaration);
    const storage = generateContractLayout(ast, structDefinition.name, structDefinition.children, rootSlot);
    storage.setSource(path.resolve(source.sourceEntryKey));
    return storage;
}
exports.getStructLayout = getStructLayout;
function getMappingLayout(ast, mappingDeclaration, rootSlot) {
    const keyTypeString = mappingDeclaration.vKeyType.typeString;
    const valueTypeString = mappingDeclaration.vValueType.typeString;
    const valueType = mappingDeclaration.vValueType;
    if ((0, types_1.isSolidityType)(keyTypeString) && (0, types_1.isSolidityType)(valueTypeString)) {
        return {
            slot: rootSlot,
            key: keyTypeString,
            value: valueTypeString,
        };
    }
    else if ((0, types_1.isSolidityType)(keyTypeString) && valueType instanceof solc_typed_ast_1.Mapping) {
        return {
            slot: rootSlot,
            key: keyTypeString,
            value: getMappingLayout(ast, valueType, rootSlot),
        };
    }
    else if ((0, types_1.isSolidityType)(keyTypeString) &&
        valueType instanceof solc_typed_ast_1.UserDefinedTypeName &&
        (0, ast_1.isStruct)(ast, valueType)) {
        return {
            slot: rootSlot,
            key: keyTypeString,
            value: {
                variant: "struct",
                layout: getStructLayout(ast, valueType, rootSlot),
                pointer: {
                    slot: rootSlot,
                    offset: 0,
                },
            },
        };
    }
    else if (valueType instanceof solc_typed_ast_1.ArrayTypeName) {
        return {
            slot: rootSlot,
            key: keyTypeString,
            value: generateArrayLayout(ast, valueType, rootSlot),
        };
    }
    else {
        console.log(valueType);
        throw new Error(`${keyTypeString} or ${valueTypeString} is not handled `);
    }
}
exports.getMappingLayout = getMappingLayout;
function generateArrayLayout(ast, arrayDeclaration, rootSlot) {
    const valueType = arrayDeclaration.vBaseType;
    const valueTypeString = arrayDeclaration.vBaseType.typeString;
    if ((0, types_1.isSolidityType)(valueTypeString)) {
        return {
            variant: "array",
            pointer: { slot: rootSlot, offset: 0 },
            value: valueTypeString,
        };
    }
    else if (valueType instanceof solc_typed_ast_1.UserDefinedTypeName &&
        (0, ast_1.isStruct)(ast, valueType)) {
        return {
            variant: "array",
            pointer: { slot: rootSlot, offset: 0 },
            value: {
                variant: "struct",
                layout: getStructLayout(ast, valueType, rootSlot),
                pointer: {
                    slot: rootSlot,
                    offset: 0,
                },
            },
        };
    }
    else if (valueType instanceof solc_typed_ast_1.ArrayTypeName) {
        return {
            variant: "array",
            pointer: { slot: rootSlot, offset: 0 },
            value: generateArrayLayout(ast, valueType, rootSlot),
        };
    }
    else {
        console.log(valueType);
        throw new Error(` ${valueTypeString} is not handled for array layouts`);
    }
}
exports.generateArrayLayout = generateArrayLayout;
function toPragmaString(node) {
    return `pragma ${node.vIdentifier} ${node.vValue};`;
}
function generateContractLayout(ast, storageName, declarations, rootSlot = 0) {
    const stor = new _1.StorageLayout(storageName, rootSlot, toPragmaString((0, ast_1.getPragma)(ast[0])));
    for (let idx in declarations) {
        let declaration = declarations[idx];
        if (!(declaration instanceof solc_typed_ast_1.VariableDeclaration)) {
            console.log("Is not Instance");
            console.log(declaration);
            continue;
        }
        if (declaration.vType instanceof solc_typed_ast_1.ElementaryTypeName &&
            (0, types_1.isSolidityType)(declaration.typeString)) {
            stor.appendSolidityType(declaration.name, declaration.typeString);
        }
        else if (declaration.vType instanceof solc_typed_ast_1.UserDefinedTypeName) {
            if ((0, ast_1.isEnum)(ast, declaration.vType)) {
                stor.appendEnum(declaration.name);
            }
            else if ((0, ast_1.isStruct)(ast, declaration.vType)) {
                const structLayout = getStructLayout(ast, declaration.vType, stor.getLength());
                stor.appendStruct(declaration.name, structLayout);
            }
            else {
                console.log(declaration.vType);
            }
        }
        else if (declaration.vType instanceof solc_typed_ast_1.Mapping) {
            stor.appendMapping(declaration.name, getMappingLayout(ast, declaration.vType, stor.getLength()));
        }
        else if (declaration.vType instanceof solc_typed_ast_1.ArrayTypeName) {
            stor.appendArray(declaration.name, generateArrayLayout(ast, declaration.vType, stor.getLength()));
        }
    }
    return stor;
}
exports.generateContractLayout = generateContractLayout;
