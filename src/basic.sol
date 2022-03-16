// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

contract Basic {
    uint256 test;

    function foo() public {
        uint256 test2 = 0;
        for (uint256 y = 1; y < 10; y++) {
            test2 = y;
        }
    }
}
