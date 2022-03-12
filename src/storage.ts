export class ContractStorage {
  slotPointer: number = 0; // current slot being written to
  private offset: number = 0; // bytes
  willOverflow(size: number): boolean {
    return this.offset + size > 32;
  }
  appendData(size: number) {
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
  getLength() {
    if (this.offset > 0) {
      return this.slotPointer + 1;
    } else {
      return this.slotPointer;
    }
  }
}
