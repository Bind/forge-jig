// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

struct Entity {
    uint8 first;
    uint8 second;
    uint256 third;
    uint8 last;
}

contract Basilisk {
    Entity[] public simple_array;

    constructor() {
        simple_array.push(Entity(1, 2, 3, 4));
        simple_array.push(Entity(5, 6, 7, 8));
        simple_array.push(Entity(5, 6, 7, 8));
        simple_array.push(Entity(5, 6, 7, 8));
        simple_array.push(Entity(5, 6, 7, 8));
        simple_array.push(Entity(5, 6, 7, 8));
    }
}
