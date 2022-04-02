import { ArrayTypeName, ASTNode, Mapping, SourceUnit, UserDefinedTypeName } from "solc-typed-ast";
import { StorageLayout } from ".";
import { MappingPointer } from "./mapping";
import { StorageInfoArray } from "./types";
export declare function getStructLayout(ast: SourceUnit[], structDeclaration: UserDefinedTypeName, rootSlot: number): StorageLayout;
export declare function getMappingLayout(ast: SourceUnit[], mappingDeclaration: Mapping, rootSlot: number): MappingPointer;
export declare function generateArrayLayout(ast: SourceUnit[], arrayDeclaration: ArrayTypeName, rootSlot: number): StorageInfoArray;
export declare function generateContractLayout(ast: SourceUnit[], storageName: string, declarations: readonly ASTNode[], rootSlot?: number): StorageLayout;
//# sourceMappingURL=create.d.ts.map