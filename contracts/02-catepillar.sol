// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

contract Catepillar {
    uint256[] public simple_array;

    constructor() {
        simple_array.push(3);
        simple_array.push(2);
        simple_array.push(1);
    }
}
