// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import "ds-test/test.sol";
import "contracts/jig/SlimeJig.sol";
import "contracts/05-slime.sol";
import "forge-std/stdlib.sol";
import "forge-std/Vm.sol";
import "./utils/console.sol";

contract SlimeTest is DSTest {
    Slime b;
    SlimeJig jig;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));

    function setUp() public {
        b = new Slime();
        jig = new SlimeJig(address(b));
    }

    function testJig(address adr) public {
        (bool initialized, address owner) = b.init();
        // Initialized Correctly
        assert(initialized);
        assert(owner == address(uint160(type(uint256).max)));
        Initialized memory f = Initialized(false, adr);
        jig.init(f);
        (initialized, owner) = b.init();
        assert(!initialized);
        assert(owner == adr);
    }
}
