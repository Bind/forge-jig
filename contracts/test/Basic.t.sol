// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import 'ds-test/test.sol';
import 'contracts/jig/BasicJig.sol';
import 'contracts/basic.sol';

contract BasicJigTest is DSTest {
    Basic b;
    BasicJig m;

    function setUp() public {
        b = new Basic();
        m = new BasicJig(address(b));
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
