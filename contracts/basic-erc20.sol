// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

import 'solmate/tokens/ERC20.sol';

contract BasicERC20 is ERC20('erc20', 'ERC', 18) {
    uint8 public simple;
}
