// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import "ds-test/test.sol";
import "contracts/jig/ClosetJig.sol";
import "contracts/16-closet.sol";
import "forge-std/stdlib.sol";
import "forge-std/Vm.sol";
import "./utils/console.sol";

contract ClosetTest is DSTest {
    Closet b;
    ClosetJig jig;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));

    function setUp() public {
        b = new Closet();
        jig = new ClosetJig(address(b));
    }

    function testAppStorageOwner(address ser) public {
        assert(b.owner() == address(this));
        jig.owner(ser);
        assert(b.owner() == ser);
    }

    function testAppStorageBalanceOf(uint256 ser, uint256 amount) public {
        jig.balanceOf(ser, amount);
        assert(b.balanceOf(ser) == amount);
    }

    function testAppStorageOwners(uint256 ser, uint256 amount) public {
        jig.owners(ser, amount);
        assert(b.owners(ser) == amount);
    }

    function testAppStorageStuff(uint128 ser, uint8 amount) public {
        jig.stuff(ser, amount);
        assert(b.stuff(ser) == amount);
    }
}
