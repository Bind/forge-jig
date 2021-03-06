// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import "ds-test/test.sol";
import "forge-std/stdlib.sol";
import "forge-std/Vm.sol";
import "contracts/jig/GoldJig.sol";
import "contracts/07-gold.sol";
import "./utils/console.sol";

contract GoldTest is DSTest {
    using stdStorage for StdStorage;
    Gold b;
    GoldJig jig;
    StdStorage stdstore;

    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));

    function setUp() public {
        b = new Gold();
        jig = new GoldJig(address(b));
    }

    function testJigBasic() public {
        jig.simple(1);
        assert(b.simple() == 1);
    }

    function testJig(uint8 rand) public {
        jig.simple(rand);
        assert(b.simple() == rand);
    }

    function testJigBalance(address owner, uint256 rand) public {
        jig.balanceOf(owner, rand);
        assert(b.balanceOf(owner) == rand);
    }

    function testJigAllowance(
        address owner,
        address allowed,
        uint256 rand
    ) public {
        jig.allowance(owner, allowed, rand);
        assert(b.allowance(owner, allowed) == rand);
    }
}
