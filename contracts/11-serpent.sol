// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

contract Serpent {
    uint8[][] public simple_array;

    constructor() {
        simple_array.push([1, 2, 3, 4, 5]);
        simple_array.push([4, 5, 6]);
        simple_array.push([7, 8, 9]);
    }
}
