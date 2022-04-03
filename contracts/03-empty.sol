// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

contract Empty {
    function foo() public {
        uint256 simple = 0;
        for (uint256 y = 1; y < 10; y++) {
            simple = y;
        }
    }
}
