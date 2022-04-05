// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

import "solmate/auth/authorities/RolesAuthority.sol";

contract Crown is Auth {
    constructor(Authority _authority) Auth(msg.sender, _authority) {}

    function canCall(
        address user,
        address target,
        bytes4 func
    ) public view returns (bool) {
        return authority.canCall(user, target, func);
    }
}
