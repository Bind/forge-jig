"use strict";
exports.__esModule = true;
exports.getDataToStoreCasting = exports.getTypeFunctionSignature = exports.getByteSizeFromType = exports.isSolidityType = exports.isFixedBytes = exports.isInt = exports.isUint = exports.isStringType = exports.isAddress = exports.isBool = exports.STRING_TYPES = exports.ADDRESS_TYPES = exports.BOOL_TYPES = exports.UINT_TYPES = exports.INT_TYPES = exports.FIXED_BYTE_TYPES = void 0;
exports.FIXED_BYTE_TYPES = [
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
];
exports.INT_TYPES = [
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
];
exports.UINT_TYPES = [
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
];
exports.BOOL_TYPES = ['bool'];
exports.ADDRESS_TYPES = ['address'];
exports.STRING_TYPES = ['string'];
function isBool(value) {
    return !!exports.BOOL_TYPES.find(function (validKey) { return validKey === value; });
}
exports.isBool = isBool;
function isAddress(value) {
    return !!exports.ADDRESS_TYPES.find(function (validKey) { return validKey === value; });
}
exports.isAddress = isAddress;
function isStringType(value) {
    return !!exports.STRING_TYPES.find(function (validKey) { return validKey === value; });
}
exports.isStringType = isStringType;
function isUint(value) {
    return !!exports.UINT_TYPES.find(function (validKey) { return validKey === value; });
}
exports.isUint = isUint;
function isInt(value) {
    return !!exports.INT_TYPES.find(function (validKey) { return validKey === value; });
}
exports.isInt = isInt;
function isFixedBytes(value) {
    return !!exports.FIXED_BYTE_TYPES.find(function (validKey) { return validKey === value; });
}
exports.isFixedBytes = isFixedBytes;
function isSolidityType(value) {
    return (isFixedBytes(value) ||
        isInt(value) ||
        isUint(value) ||
        isBool(value) ||
        isAddress(value) ||
        isStringType(value));
}
exports.isSolidityType = isSolidityType;
function getByteSizeFromType(t) {
    if (isFixedBytes(t)) {
        return exports.FIXED_BYTE_TYPES.indexOf(t) + 1;
    }
    else if (isUint(t)) {
        return exports.UINT_TYPES.indexOf(t) === 0
            ? 32
            : exports.UINT_TYPES.indexOf(t);
    }
    else if (isInt(t)) {
        return exports.INT_TYPES.indexOf(t) === 0 ? 32 : exports.INT_TYPES.indexOf(t);
    }
    else if (isBool(t)) {
        return 1;
    }
    else if (isAddress(t)) {
        return 20;
    }
    else if (isStringType(t)) {
        return 32;
    }
    throw new Error('unhandled type: ' + t);
}
exports.getByteSizeFromType = getByteSizeFromType;
function getTypeFunctionSignature(t) {
    if (!isSolidityType(t)) {
        return "".concat(t, " memory");
    }
    else if (isStringType(t)) {
        return "".concat(t, " memory");
    }
    else {
        return t;
    }
}
exports.getTypeFunctionSignature = getTypeFunctionSignature;
function getDataToStoreCasting(t, varName) {
    if (varName === void 0) { varName = 'value'; }
    if (!isSolidityType(t)) {
        throw new Error("".concat(JSON.stringify(t), " not handled in casting"));
    }
    else if (isStringType(t)) {
        return "bytes32(bytes(".concat(varName, "))");
    }
    else if (isUint(t)) {
        return "bytes32(uint256(".concat(varName, "))");
    }
    else if (isInt(t)) {
        return "bytes32(int256(".concat(varName, "))");
    }
    else if (isAddress(t)) {
        return "bytes32(uint256(uint160(".concat(varName, ")))");
    }
    else if (isBool(t)) {
        return "bytes32(uint256(".concat(varName, " ? 1: 0))");
    }
    else {
        return "bytes32(".concat(varName, ")");
    }
}
exports.getDataToStoreCasting = getDataToStoreCasting;
