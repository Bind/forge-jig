import { getByteSizeFromType, isSolidityType, SOLIDITY_TYPES } from './types';
type StoragePointer = {
  slot: number; // Storage Slot Number
  offset: number; // Storage Slot Offset Bytes
};

type StorageInfoVariants = 'simple' | 'struct' | 'mapping' | 'array' | 'enum';
type StorageInfo = {
  variant: StorageInfoVariants;
  size: number; // Number of bytes long
  pointer: StoragePointer;
};
type StorageInfoMapping = StorageInfo & {
  variant: 'mapping';
  key: SOLIDITY_TYPES;
  value: SOLIDITY_TYPES | 'struct';
  pointer: StoragePointer;
};
type StorageInfoStruct = {
  variant: 'struct';
  layout: StorageLayout;
  pointer: StoragePointer; // Slot Number
};
type StorageInfos = StorageInfo | StorageInfoMapping | StorageInfoStruct;

export function isStorageInfoStruct(
  value: StorageInfos
): value is StorageInfoStruct {
  return (<StorageInfoStruct>value).layout !== undefined;
}
export class StorageLayout {
  variables: { [key: string]: StorageInfos } = {};
  slotRoot: number = 0;
  slotPointer: number = 0; // current slot being written to
  private offset: number = 0; // bytes
  constructor(rootSlot: number) {
    this.slotPointer = rootSlot;
    this.slotRoot = rootSlot;
  }

  willOverflow(size: number): boolean {
    return this.offset + size > 32;
  }
  appendVariableDeclaration(
    name: string,
    typeString: SOLIDITY_TYPES | StorageInfoVariants,
    layout?: StorageLayout
  ) {
    if (isSolidityType(typeString)) {
      const byteSize = getByteSizeFromType(typeString);
      if (this.willOverflow(byteSize)) {
        const pointer = {
          offset: 0,
          slot: this.slotPointer + 1,
        };
        this.variables[name] = {
          variant: 'simple',
          size: byteSize,
          pointer,
        };
      } else {
        const pointer = {
          offset: this.offset,
          slot: this.slotPointer,
        };
        this.variables[name] = {
          variant: 'simple',
          size: byteSize,
          pointer,
        };
      }
      this.appendBytes(byteSize);
    } else if (typeString == 'struct') {
      if (!layout) throw new Error('struct requires layout param');
      const slotSize = layout?.getLength();
      const pointer = {
        offset: 0,
        slot: this.nextEmptySlot(),
      };
      this.variables[name] = {
        variant: 'struct',
        layout,
        pointer,
      };
      this.appendSlots(slotSize);
    } else if (typeString == 'enum') {
      const pointer = {
        offset: this.offset,
        slot: this.slotPointer,
      };
      this.variables[name] = {
        variant: 'enum',
        size: 1,
        pointer,
      };
      this.appendBytes(1);
    } else {
      const slot = this.nextEmptySlot();
      const pointer = {
        offset: 0,
        slot,
      };
      this.variables[name] = {
        variant: typeString,
        size: 32,
        pointer,
      };
      this.appendSlots(1);
    }
  }
  appendBytes(size: number) {
    if (size == 32 && this.offset == 0) {
      // Nothing currently packed in slot write to current slot and increment counter
      this.slotPointer += 1;
    } else if (size == 32) {
      // active slot has data, increment slot pointer, write to slot, increment again
      this.slotPointer += 2;
      // reset offset
      this.offset = 0;
    } else if (this.willOverflow(size)) {
      // active slot has data, increment slot pointer, write to slot, increment again
      this.slotPointer += 1;
      // reset offset
      this.offset = size;
    } else {
      this.offset += size;
    }
  }
  nextEmptySlot() {
    return this.offset > 0 ? this.slotPointer + 1 : this.slotPointer;
  }
  appendSlots(count: number) {
    if (this.offset > 0) {
      this.slotPointer += 1;
      this.offset = 0;
    }
    this.slotPointer += count;
  }
  getLength() {
    if (this.offset > 0) {
      return this.slotPointer + 1 - this.slotRoot;
    } else {
      return this.slotPointer - this.slotRoot;
    }
  }
  get(name: string) {
    return this.variables[name];
  }
  getStoragePointer(name: string) {
    this.variables[name].pointer;
  }
}
