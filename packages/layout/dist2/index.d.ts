export * from "./src";
export * from "./src/create";
export * from "./src/types";
export * from "./src/predicate";
import { StorageLayout } from "./src/index";
export declare function compileContractLayout(file: string, contractName: string): Promise<StorageLayout>;
export declare function compileContractLayouts(file: string): Promise<StorageLayout[]>;
//# sourceMappingURL=index.d.ts.map