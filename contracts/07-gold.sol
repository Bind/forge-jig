// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

import "solmate/tokens/ERC20.sol";

contract Gold is ERC20("Gold", "GOLD", 18) {
    uint8 public simple;
}
