export const FIXED_BYTE_TYPES = [
  'bytes1',
  'bytes2',
  'bytes3',
  'bytes4',
  'bytes5',
  'bytes6',
  'bytes7',
  'bytes8',
  'bytes9',
  'bytes10',
  'bytes11',
  'bytes12',
  'bytes13',
  'bytes14',
  'bytes15',
  'bytes16',
  'bytes17',
  'bytes18',
  'bytes19',
  'bytes20',
  'bytes21',
  'bytes22',
  'bytes23',
  'bytes24',
  'bytes25',
  'bytes26',
  'bytes27',
  'bytes28',
  'bytes29',
  'bytes30',
  'bytes31',
  'bytes32',
] as const;
type FIXED_BYTES = typeof FIXED_BYTE_TYPES[number];

export const INT_TYPES = [
  'int',
  'int8',
  'int16',
  'int24',
  'int32',
  'int40',
  'int48',
  'int56',
  'int64',
  'int72',
  'int80',
  'int88',
  'int96',
  'int104',
  'int112',
  'int120',
  'int128',
  'int136',
  'int144',
  'int152',
  'int160',
  'int168',
  'int176',
  'int184',
  'int192',
  'int200',
  'int208',
  'int216',
  'int224',
  'int232',
  'int240',
  'int248',
  'int256',
] as const;
export type INT = typeof INT_TYPES[number];

export const UINT_TYPES = [
  'uint',
  'uint8',
  'uint16',
  'uint24',
  'uint32',
  'uint40',
  'uint48',
  'uint56',
  'uint64',
  'uint72',
  'uint80',
  'uint88',
  'uint96',
  'uint104',
  'uint112',
  'uint120',
  'uint128',
  'uint136',
  'uint144',
  'uint152',
  'uint160',
  'uint168',
  'uint176',
  'uint184',
  'uint192',
  'uint200',
  'uint208',
  'uint216',
  'uint224',
  'uint232',
  'uint240',
  'uint248',
  'uint256',
] as const;

export type UINT = typeof UINT_TYPES[number];

export type SOLIDITY_TYPES = FIXED_BYTES | INT | UINT;

export function isUint(value: string): value is UINT {
  return !!UINT_TYPES.find(validKey => validKey === value);
}
export function isInt(value: string): value is INT {
  return !!INT_TYPES.find(validKey => validKey === value);
}
export function isFixedBytes(value: string): value is FIXED_BYTES {
  return !!FIXED_BYTE_TYPES.find(validKey => validKey === value);
}
export function isSolidityType(value: string): value is SOLIDITY_TYPES {
  return isFixedBytes(value) || isInt(value) || isUint(value);
}

export function getByteSizeFromType(t: SOLIDITY_TYPES) {
  if (isFixedBytes(t)) {
    return FIXED_BYTE_TYPES.indexOf(t as FIXED_BYTES) + 1;
  }
  if (isUint(t)) {
    return UINT_TYPES.indexOf(t as UINT) === 0
      ? 32
      : UINT_TYPES.indexOf(t as UINT);
  }
  if (isInt(t)) {
    return INT_TYPES.indexOf(t as INT) === 0 ? 32 : INT_TYPES.indexOf(t as INT);
  }
  return 0;
}
