// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

contract Graveyard {
    mapping(uint8 => uint256[]) public graveyards;

    constructor() {
        graveyards[1].push(1000);
        graveyards[1].push(1001);
        graveyards[1].push(1002);
        graveyards[2].push(2000);
        graveyards[3].push(3000);
    }
}
