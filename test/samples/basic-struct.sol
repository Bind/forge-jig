// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

struct Initialized {
    bool initialized;
    address owner;
}

contract Basic {
    Initialized init;
}
