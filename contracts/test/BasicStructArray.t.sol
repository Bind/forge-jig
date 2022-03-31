// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import 'ds-test/test.sol';
import 'contracts/jig/BasicStructArrayJig.sol';
import 'contracts/basic-struct-array.sol';
import 'forge-std/stdlib.sol';
import 'forge-std/Vm.sol';
import './utils/console.sol';

contract BasicStructStructJigTest is DSTest {
    BasicStructArray b;
    BasicStructArrayJig jig;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256('hevm cheat code'))))));

    function setUp() public {
        b = new BasicStructArray();
        jig = new BasicStructArrayJig(address(b));
    }

    function testSetGreetingsStructArray() public {
        (
            uint64 hello,
            uint64 howdy,
            uint64 hi,
            uint64 hola,
            uint8 salutations,
            uint8 test
        ) = b.greetings();
        assert(hello == 11);
        assert(howdy == 22);
        assert(hi == 33);
        assert(hola == 44);
        assert(salutations == 1);
        assert(test == 55);
        Yo[] memory yos = new Yo[](2);
        yos[0] = Yo(144, 145);
        yos[1] = Yo(146, 147);
        Hello memory momentOfTruth = Hello(1, 2, 3, 4, 5, yos, 66);

        jig.set_greetings(momentOfTruth);
        Yo[] memory fetched_yos = b.get_yos();
        (hello, howdy, hi, hola, salutations, test) = b.greetings();
        assert(hello == 1);
        assert(howdy == 2);
        assert(hi == 3);
        assert(hola == 4);
        assert(salutations == 5);
        assert(test == 66);
        assert(fetched_yos[0].yo == 144);
        assert(fetched_yos[0].wassup == 145);
        assert(fetched_yos[1].yo == 146);
        assert(fetched_yos[1].wassup == 147);
    }
}
