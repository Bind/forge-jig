// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import 'ds-test/test.sol';
import 'contracts/jig/BasicStructStructJig.sol';
import 'contracts/basic-struct-struct.sol';
import 'forge-std/stdlib.sol';
import 'forge-std/Vm.sol';
import './utils/console.sol';

contract BasicStructStructJigTest is DSTest {
    BasicStructStruct b;
    BasicStructStructJig jig;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256('hevm cheat code'))))));

    function setUp() public {
        b = new BasicStructStruct();
        jig = new BasicStructStructJig(address(b));
    }

    function testSetGreetingsStructStruct() public {
        (
            uint64 hello,
            uint64 howdy,
            uint64 hi,
            uint64 hola,
            uint8 salutations,
            Yo memory yo,
            uint8 test
        ) = b.greetings();
        assert(hello == 11);
        assert(howdy == 22);
        assert(hi == 33);
        assert(hola == 44);
        assert(salutations == 1);
        assert(test == 55);
        assert(yo.yo == 100);
        assert(yo.wassup == 101);
        Hello memory momentOfTruth = Hello(1, 2, 3, 4, 5, Yo(200, 201), 66);
        jig.greetings(momentOfTruth);
        (hello, howdy, hi, hola, salutations, yo, test) = b.greetings();
        assert(hello == 1);
        assert(howdy == 2);
        assert(hi == 3);
        assert(hola == 4);
        assert(salutations == 5);
        assert(yo.yo == 200);
        assert(yo.wassup == 201);
        assert(test == 66);
    }
}
