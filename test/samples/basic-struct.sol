//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

struct Initialized {
    bool initialized;
    address owner;
}

contract Basic {
    Initialized init;
}
