import { getByteSizeFromType, isSolidityType, SOLIDITY_TYPES } from './types';
type StoragePointer = {
  slot: number; // Storage Slot Number
  offset: number; // Storage Slot Offset Bytes
};
export interface MappingPointer {
  slot: number;
  key: SOLIDITY_TYPES;
  value: SOLIDITY_TYPES | MappingPointer | StorageInfoStruct;
}

type StorageInfoVariants = 'simple' | 'struct' | 'mapping' | 'array' | 'enum';
export type StorageInfo = {
  variant: StorageInfoVariants;
  type: SOLIDITY_TYPES;
  size: number; // Number of bytes long
  pointer: StoragePointer;
};
export type StorageInfoEnum = {
  variant: 'enum';
  size: number; // Number of bytes long
  pointer: StoragePointer;
};
export type StorageInfoMapping = {
  variant: 'mapping';
  key: SOLIDITY_TYPES;
  value: SOLIDITY_TYPES | StorageInfoStruct | StorageInfoMapping;
  pointer: StoragePointer;
};
export type StorageInfoStruct = {
  variant: 'struct';
  layout: StorageLayout;
  pointer: StoragePointer; // Slot Number
};
export type StorageInfos = StorageInfo | StorageInfoMapping | StorageInfoStruct;

export function isStorageInfoStruct(
  value: StorageInfos
): value is StorageInfoStruct {
  return (<StorageInfoStruct>value).layout !== undefined;
}
export function isStorageInfoMapping(
  value: StorageInfos
): value is StorageInfoMapping {
  return (<StorageInfoMapping>value).variant == 'mapping';
}
export function isStorageInfo(value: StorageInfos): value is StorageInfo {
  return isSolidityType((<StorageInfo>value).type);
}
export function isMappingPointer(
  value: SOLIDITY_TYPES | MappingPointer | StorageInfoStruct
): value is MappingPointer {
  return (<MappingPointer>value).slot !== undefined;
}

export function mappingPointerToStorage(
  mapping: MappingPointer
): StorageInfoMapping {
  const value = mapping.value;
  return {
    variant: 'mapping',
    key: mapping.key,
    value: isMappingPointer(value)
      ? mappingPointerToStorage(value)
      : (mapping.value as SOLIDITY_TYPES | StorageInfoMapping),
    pointer: { slot: 0, offset: 0 },
  };
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
  appendMappingDeclaration(name: string, mapping: MappingPointer) {
    const slot = this.nextEmptySlot();
    const mappingStorage = mappingPointerToStorage(mapping);
    const pointer = {
      offset: 0,
      slot,
    };
    mappingStorage.pointer = pointer;

    this.variables[name] = mappingStorage;
    this.appendSlots(1);
  }
  appendVariableDeclaration(
    name: string,
    typeString: SOLIDITY_TYPES | StorageInfoVariants,
    layout?: StorageLayout
  ) {
    // TODO: Refactor
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
          type: typeString,
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
          type: typeString,
        };
      }
      this.appendBytes(byteSize);
    } else if (typeString == 'struct') {
      if (!layout) throw new Error('struct requires layout param');
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
      } as StorageInfo;
      this.appendBytes(1);
    } else if (typeString == 'mapping') {
      const slot = this.nextEmptySlot();
      const pointer = {
        offset: 0,
        slot,
      };
      this.variables[name] = {
        variant: 'mapping',
        // TODO: FIXME
        key: 'address',
        value: 'address',
        pointer,
      };
      this.appendSlots(1);
    } else if (typeString == 'array') {
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
