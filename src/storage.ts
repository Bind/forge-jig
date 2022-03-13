import { getByteSizeFromType, isSolidityType, SOLIDITY_TYPES } from './types';

type StorageInfoVariants = 'simple' | 'struct' | 'mapping' | 'array' | 'enum';
type StorageInfo = {
  variant: StorageInfoVariants;
  size: number; // Number of bytes long
  offset: number; // Number of Bytes from start of slot
  slotPointer: number; // Slot Number
};
type StorageInfoMapping = StorageInfo & {
  variant: 'mapping';
  key: SOLIDITY_TYPES;
  value: SOLIDITY_TYPES | 'struct';
};
type StorageInfoStruct = {
  variant: 'struct';
  layout: StorageLayout;
  slotPointer: number; // Slot Number
};
type StorageInfos = StorageInfo | StorageInfoMapping | StorageInfoStruct;

export class StorageLayout {
  variables: { [key: string]: StorageInfos } = {};
  slotPointer: number = 0; // current slot being written to
  private offset: number = 0; // bytes

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
      this.variables[name] = {
        variant: 'simple',
        size: byteSize,
        offset: this.offset,
        slotPointer: this.slotPointer,
      };
      this.appendBytes(byteSize);
    } else if (typeString == 'struct') {
      if (!layout) throw new Error('struct requires layout param');
      const slotSize = layout?.getLength();
      this.variables[name] = {
        variant: 'struct',
        slotPointer: this.nextEmptySlot(),
        layout,
      };
      this.appendSlots(slotSize);
    } else if (typeString == 'enum') {
      this.variables[name] = {
        variant: 'enum',
        size: 1,
        offset: this.offset,
        slotPointer: this.slotPointer,
      };
      this.appendBytes(1);
    } else {
      const slot = this.nextEmptySlot();
      this.variables[name] = {
        variant: typeString,
        size: 32,
        offset: 0,
        slotPointer: slot,
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
      this.slotPointer += 2;
      // reset offset
      this.offset = 0;
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
      return this.slotPointer + 1;
    } else {
      return this.slotPointer;
    }
  }
}
