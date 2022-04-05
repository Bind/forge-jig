// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import "ds-test/test.sol";
import "forge-std/stdlib.sol";
import "forge-std/Vm.sol";
import "contracts/20-crown.sol";
import "contracts/jig/CrownJig.sol";
import "./utils/console.sol";

contract Hood is Authority {
    function canCall(
        address,
        address,
        bytes4
    ) public pure returns (bool) {
        return false;
    }
}

contract Scepter is Authority {
    function canCall(
        address,
        address,
        bytes4
    ) public pure returns (bool) {
        return true;
    }
}

contract CrownTest is DSTest {
    using stdStorage for StdStorage;
    Crown crown;
    CrownJig jig;
    Scepter scept;
    Hood hood;

    Vm public constant VM =
        Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));

    function setUp() public {
        scept = new Scepter();
        hood = new Hood();
        crown = new Crown(hood);
        jig = new CrownJig(address(crown));
    }

    function testSetAuthority(
        address user,
        address target,
        bytes4 func
    ) public {
        assert(!crown.canCall(user, target, func));
        jig.authority(address(scept));
        assert(crown.canCall(user, target, func));
    }
}
