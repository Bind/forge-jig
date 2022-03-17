// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import 'ds-test/test.sol';
import 'contracts/molding/BasicMolding.sol';
import 'contracts/basic.sol';

contract BasicMoldingTest is DSTest {
    Basic b;
    BasicMolding m;

    function setUp() public {
        b = new Basic();
        m = new BasicMolding(address(b));
    }

    function testMoldingBasic() public {
        m.simple(1);
        assert(b.simple() == 1);
    }

    function testMolding(uint256 rand) public {
        m.simple(rand);
        assert(b.simple() == rand);
    }
}
