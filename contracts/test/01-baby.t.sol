// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import "ds-test/test.sol";
import "contracts/jig/BabyJig.sol";
import "contracts/01-baby.sol";

contract BabyTest is DSTest {
    Baby b;
    BabyJig m;

    function setUp() public {
        b = new Baby();
        m = new BabyJig(address(b));
    }

    function testJigBasic() public {
        m.simple(1);
        assert(b.simple() == 1);
    }

    function testJig(uint256 rand) public {
        m.simple(rand);
        assert(b.simple() == rand);
    }
}
