import { MappingPointer } from "./mapping";
import { StorageInfo, StorageInfoArray, StorageInfoMapping, StorageInfos, StorageInfoStruct } from "./types";
export declare function isStorageInfoStruct(value: any): value is StorageInfoStruct;
export declare function isStorageInfoMapping(value: any): value is StorageInfoMapping;
export declare function isStorageInfoArray(value: any): value is StorageInfoArray;
export declare function isStorageInfo(value: StorageInfos): value is StorageInfo;
export declare function isMappingPointer(value: MappingPointer["value"]): value is MappingPointer;
export declare function hasMapping(storage: StorageInfoStruct): boolean;
//# sourceMappingURL=predicate.d.ts.map