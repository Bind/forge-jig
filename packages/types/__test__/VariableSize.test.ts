import {
  FIXED_BYTE_TYPES,
  getByteSizeFromType,
  INT_TYPES,
  SOLIDITY_TYPES,
  UINT_TYPES,
} from "../index";

type Assertions = {
  [key in SOLIDITY_TYPES]: {
    size: number;
  };
};
const assertions: Assertions = {
  bytes1: { size: 1 },
  bytes2: { size: 2 },
  bytes3: { size: 3 },
  bytes4: { size: 4 },
  bytes5: { size: 5 },
  bytes6: { size: 6 },
  bytes7: { size: 7 },
  bytes8: { size: 8 },
  bytes9: { size: 9 },
  bytes10: { size: 10 },
  bytes11: { size: 11 },
  bytes12: { size: 12 },
  bytes13: { size: 13 },
  bytes14: { size: 14 },
  bytes15: { size: 15 },
  bytes16: { size: 16 },
  bytes17: { size: 17 },
  bytes18: { size: 18 },
  bytes19: { size: 19 },
  bytes20: { size: 20 },
  bytes21: { size: 21 },
  bytes22: { size: 22 },
  bytes23: { size: 23 },
  bytes24: { size: 24 },
  bytes25: { size: 25 },
  bytes26: { size: 26 },
  bytes27: { size: 27 },
  bytes28: { size: 28 },
  bytes29: { size: 29 },
  bytes30: { size: 30 },
  bytes31: { size: 31 },
  bytes32: { size: 32 },
  int: { size: 32 },
  int8: { size: 1 },
  int16: { size: 2 },
  int24: { size: 3 },
  int32: { size: 4 },
  int40: { size: 5 },
  int48: { size: 6 },
  int56: { size: 7 },
  int64: { size: 8 },
  int72: { size: 9 },
  int80: { size: 10 },
  int88: { size: 11 },
  int96: { size: 12 },
  int104: { size: 13 },
  int112: { size: 14 },
  int120: { size: 15 },
  int128: { size: 16 },
  int136: { size: 17 },
  int144: { size: 18 },
  int152: { size: 19 },
  int160: { size: 20 },
  int168: { size: 21 },
  int176: { size: 22 },
  int184: { size: 23 },
  int192: { size: 24 },
  int200: { size: 25 },
  int208: { size: 26 },
  int216: { size: 27 },
  int224: { size: 28 },
  int232: { size: 29 },
  int240: { size: 30 },
  int248: { size: 31 },
  int256: { size: 32 },
  uint: { size: 32 },
  uint8: { size: 1 },
  uint16: { size: 2 },
  uint24: { size: 3 },
  uint32: { size: 4 },
  uint40: { size: 5 },
  uint48: { size: 6 },
  uint56: { size: 7 },
  uint64: { size: 8 },
  uint72: { size: 9 },
  uint80: { size: 10 },
  uint88: { size: 11 },
  uint96: { size: 12 },
  uint104: { size: 13 },
  uint112: { size: 14 },
  uint120: { size: 15 },
  uint128: { size: 16 },
  uint136: { size: 17 },
  uint144: { size: 18 },
  uint152: { size: 19 },
  uint160: { size: 20 },
  uint168: { size: 21 },
  uint176: { size: 22 },
  uint184: { size: 23 },
  uint192: { size: 24 },
  uint200: { size: 25 },
  uint208: { size: 26 },
  uint216: { size: 27 },
  uint224: { size: 28 },
  uint232: { size: 29 },
  uint240: { size: 30 },
  uint248: { size: 31 },
  uint256: { size: 32 },
  bool: { size: 1 },
  address: { size: 32 },
  string: { size: 32 },
};

describe("validates number of bytes used for different solidity data types", () => {
  for (let idx in UINT_TYPES) {
    const t = UINT_TYPES[idx];
    it(`${t} is ${assertions[t].size} bytes`, () => {
      expect(getByteSizeFromType(t)).toBe(assertions[t].size);
    });
  }
  for (let idx in INT_TYPES) {
    const t = INT_TYPES[idx];
    it(`${t} is ${assertions[t].size} bytes`, () => {
      expect(getByteSizeFromType(t)).toBe(assertions[t].size);
    });
  }
  for (let idx in FIXED_BYTE_TYPES) {
    const t = FIXED_BYTE_TYPES[idx];
    it(`${t} is ${assertions[t].size} bytes`, () => {
      expect(getByteSizeFromType(t)).toBe(assertions[t].size);
    });
  }
});
