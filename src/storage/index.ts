import { MappingPointer, mappingPointerToStorage } from './mapping';
import { StorageInfo, StorageInfos, StoragePointer } from './types';
import { getByteSizeFromType, SOLIDITY_TYPES } from '../solidityTypes';

export class StorageLayout {
  name: string;
  variables: { [key: string]: StorageInfos } = {};
  sourceUnitPath: string = '';
  slotRoot: number = 0;
  endOfStorage: StoragePointer = { slot: 0, offset: 0 };
  constructor(name: string, rootSlot: number) {
    this.name = name;
    this.endOfStorage.slot = rootSlot;
    this.slotRoot = rootSlot;
  }
  setSource(sourceUnitPath: string) {
    this.sourceUnitPath = sourceUnitPath;
  }
  willOverflow(size: number): boolean {
    return this.endOfStorage.offset + size > 32;
  }
  /**
   * Append a Mapping to Storage
   * @param name
   * @param mapping
   */
  appendMapping(name: string, mapping: MappingPointer) {
    const slot = this.nextEmptySlot();

    const mappingStorage = mappingPointerToStorage(mapping);
    const pointer = {
      offset: 0,
      slot,
    };
    mappingStorage.pointer = pointer;

    this.variables[name] = mappingStorage;
    this.insertSlots(1);
  }

  /**
   * Append a built-in Solidity Variable to Storage
   * @param name
   * @param typeString
   */
  appendSolidityType(name: string, typeString: SOLIDITY_TYPES) {
    const byteSize = getByteSizeFromType(typeString);
    if (this.willOverflow(byteSize)) {
      const pointer = {
        offset: 0,
        slot: this.endOfStorage.slot + 1,
      };

      this.variables[name] = {
        variant: 'simple',
        size: byteSize,
        pointer,
        type: typeString,
      };
    } else {
      const pointer = {
        offset: this.endOfStorage.offset,
        slot: this.endOfStorage.slot,
      };

      this.variables[name] = {
        variant: 'simple',
        size: byteSize,
        pointer,
        type: typeString,
      };
    }
    this.insertBytes(byteSize);
  }

  /**
   * Append a struct variable to Storage
   * @param name
   * @param layout
   */
  appendStruct(name: string, layout: StorageLayout) {
    const slotSize = layout?.getLength();
    const pointer = {
      offset: 0,
      slot: this.nextEmptySlot(),
      size: 0,
    };
    this.variables[name] = {
      variant: 'struct',
      layout,
      pointer,
    };
    this.insertSlots(slotSize);
  }

  /**
   * Append an Enum Variable to Storage
   * @param name
   */
  appendEnum(name: string) {
    const pointer = {
      offset: this.endOfStorage.offset,
      slot: this.endOfStorage.slot,
    };
    this.variables[name] = {
      variant: 'enum',
      size: 1,
      pointer,
    } as StorageInfo;
    this.insertBytes(1);
  }

  /**
   * Append an Array Variable to Storage
   * @param name
   */
  appendArray(name: string) {
    // TODO
    const slot = this.nextEmptySlot();
    const pointer = {
      offset: 0,
      slot,
    };
    this.variables[name] = {
      variant: 'array',
      type: 'uint256',
      size: 32,
      pointer,
    };
    this.insertSlots(1);
  }

  /**
   * Increment the end-of-storage pointer by size
   * if offset + bytes > 32 : (slot + 1; offset = size)
   * else offset += size
   * @param num  bytes
   */
  insertBytes(num: number) {
    if (num === 32 && this.endOfStorage.offset === 0) {
      // Nothing currently packed in slot write to current slot and increment counter
      this.endOfStorage.slot += 1;
    } else if (num === 32) {
      // active slot has data, increment slot pointer, write to slot, increment again
      this.endOfStorage.slot += 2;
      // reset offset
      this.endOfStorage.offset = 0;
    } else if (this.willOverflow(num)) {
      // active slot has data, increment slot pointer, write to slot, increment again
      this.endOfStorage.slot += 1;
      // reset offset
      this.endOfStorage.offset = num;
    } else {
      this.endOfStorage.offset += num;
    }
  }

  /**
   * Increment the end-of-storage pointer by number of slots
   * leaves unused bytes if an offset exists
   * @param num slots
   */
  insertSlots(num: number) {
    if (this.endOfStorage.offset > 0) {
      this.endOfStorage.slot += 1;
      this.endOfStorage.offset = 0;
    }
    this.endOfStorage.slot += num;
  }

  /**
   * Get the next slot that is completely empty
   * @returns the slot number
   */
  nextEmptySlot() {
    return this.endOfStorage.offset > 0
      ? this.endOfStorage.slot + 1
      : this.endOfStorage.slot;
  }

  /**
   * get the number of slots used, if there is an offset, round up
   * @returns the number of slots
   */
  getLength() {
    if (this.endOfStorage.offset > 0) {
      return this.endOfStorage.slot + 1 - this.slotRoot;
    } else {
      return this.endOfStorage.slot - this.slotRoot;
    }
  }
  get(name: string) {
    return this.variables[name];
  }
  getStoragePointer(name: string) {
    return this.variables[name].pointer;
  }
}
