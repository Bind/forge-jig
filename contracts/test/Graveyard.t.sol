// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import 'ds-test/test.sol';
import 'contracts/jig/GraveyardJig.sol';
import 'contracts/graveyard.sol';
import 'forge-std/stdlib.sol';
import 'forge-std/Vm.sol';
import './utils/console.sol';

contract GraveyardTest is DSTest {
    Graveyard b;
    GraveyardJig jig;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256('hevm cheat code'))))));

    function setUp() public {
        b = new Graveyard();
        jig = new GraveyardJig(address(b));
    }

    function testGraveyard(
        uint8 depth,
        uint8 pos,
        uint256 val
    ) public {
        uint256 stuff = b.graveyards(1, 1);
        assert(stuff == 1001);
        jig.graveyards(depth, pos, val);
        stuff = b.graveyards(depth, pos);
        assert(stuff == val);
    }
}
