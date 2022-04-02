import { MappingPointer } from "./mapping";
import { StorageInfoArray, StorageInfos, StoragePointer } from "./types";
import { SOLIDITY_TYPES } from "types";
export declare class StorageLayout {
    name: string;
    variables: {
        [key: string]: StorageInfos;
    };
    pragma: string;
    sourceUnitPath: string;
    slotRoot: number;
    endOfStorage: StoragePointer;
    constructor(name: string, rootSlot: number, pragma?: string);
    setSource(sourceUnitPath: string): void;
    willOverflow(size: number): boolean;
    /**
     * Append a Mapping to Storage
     * @param name
     * @param mapping
     */
    appendMapping(name: string, mapping: MappingPointer): void;
    /**
     * Append a built-in Solidity Variable to Storage
     * @param name
     * @param typeString
     */
    appendSolidityType(name: string, typeString: SOLIDITY_TYPES): void;
    /**
     * Append a struct variable to Storage
     * @param name
     * @param layout
     */
    appendStruct(name: string, layout: StorageLayout): void;
    /**
     * Append an Enum Variable to Storage
     * @param name
     */
    appendEnum(name: string): void;
    /**
     * Append an Array Variable to Storage
     * @param name
     */
    appendArray(name: string, layout: StorageInfoArray): void;
    /**
     * Increment the end-of-storage pointer by size
     * if offset + bytes > 32 : (slot + 1; offset = size)
     * else offset += size
     * @param num  bytes
     */
    insertBytes(num: number): void;
    /**
     * Increment the end-of-storage pointer by number of slots
     * leaves unused bytes if an offset exists
     * @param num slots
     */
    insertSlots(num: number): void;
    /**
     * Get the next slot that is completely empty
     * @returns the slot number
     */
    nextEmptySlot(): number;
    /**
     * get the number of slots used, if there is an offset, round up
     * @returns the number of slots
     */
    getLength(): number;
    get(name: string): StorageInfos;
    getStoragePointer(name: string): StoragePointer;
}
//# sourceMappingURL=index.d.ts.map