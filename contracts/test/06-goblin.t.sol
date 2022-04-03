// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import "ds-test/test.sol";
import "contracts/jig/GoblinJig.sol";
import "contracts/06-goblin.sol";
import "forge-std/stdlib.sol";
import "forge-std/Vm.sol";
import "./utils/console.sol";

contract GoblinTest is DSTest {
    Goblin b;
    GoblinJig jig;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));

    function setUp() public {
        b = new Goblin();
        jig = new GoblinJig(address(b));
    }

    function testSetAck() public {
        (uint8 yo, uint8 wassup) = b.ack();
        Yo memory ack = Yo(yo, wassup);
        assert(ack.yo == 33);
        assert(ack.wassup == 44);
        ack.yo = 66;
        jig.ack(ack);
        (yo, wassup) = b.ack();
        assert(ack.yo == 66);
        assert(ack.wassup == 44);
    }

    function testSetGreetings() public {
        (
            uint64 hello,
            uint64 howdy,
            uint64 hi,
            uint64 hola,
            uint8 salutations
        ) = b.greetings();
        assert(hello == 11);
        assert(howdy == 22);
        assert(hi == 33);
        assert(hola == 44);
        assert(salutations == 1);
        Hello memory momentOfTruth = Hello(1, 2, 3, 4, 5);
        jig.greetings(momentOfTruth);
        (hello, howdy, hi, hola, salutations) = b.greetings();
        assert(hello == 1);
        assert(howdy == 2);
        assert(hi == 3);
        assert(hola == 4);
        assert(salutations == 5);
    }
}
