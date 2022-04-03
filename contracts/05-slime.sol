// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

struct Initialized {
    bool initialized;
    address owner;
}

contract Slime {
    Initialized public init;

    constructor() {
        init.initialized = true;
        init.owner = address(uint160(type(uint256).max));
    }
}
