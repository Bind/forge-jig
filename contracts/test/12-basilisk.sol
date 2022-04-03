// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import "ds-test/test.sol";
import "contracts/jig/BasiliskJig.sol";
import "contracts/12-basilisk.sol";
import "forge-std/stdlib.sol";
import "forge-std/Vm.sol";
import "./utils/console.sol";

contract BasiliskTest is DSTest {
    Basilisk b;
    BasiliskJig jig;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));

    function setUp() public {
        b = new Basilisk();
        jig = new BasiliskJig(address(b));
    }

    function testArrayStructJig(
        uint128 pos,
        uint8 f,
        uint8 s,
        uint256 t,
        uint8 l
    ) public {
        (uint8 first, uint8 second, uint256 third, uint8 last) = b.simple_array(
            0
        );
        assert(first == 1);
        assert(second == 2);
        assert(third == 3);
        assert(last == 4);
        jig.simple_array(pos, Entity(f, s, t, l));
        (first, second, third, last) = b.simple_array(pos);
        assert(first == f);
        assert(second == s);
        assert(third == t);
        assert(last == l);
    }
}
