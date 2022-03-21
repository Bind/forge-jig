// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

struct Entity {
    uint8 first;
    uint8 second;
    uint256 last;
}

contract BasicMappingStruct {
    mapping(uint256 => Entity) simple_mapping;

    constructor() {}
}
