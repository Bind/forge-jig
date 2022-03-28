// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import 'ds-test/test.sol';
import 'contracts/jig/BasicArrayArrayJig.sol';
import 'contracts/basic-array-array.sol';
import 'forge-std/stdlib.sol';
import 'forge-std/Vm.sol';
import './utils/console.sol';

contract BasicArrayArrayJigTest is DSTest {
    BasicArrayArray b;
    BasicArrayArrayJig jig;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256('hevm cheat code'))))));

    function setUp() public {
        b = new BasicArrayArray();
        jig = new BasicArrayArrayJig(address(b));
    }

    function testArrayArrayJig() public {
        uint8 first = b.simple_array(0, 0);
        uint8 second = b.simple_array(0, 1);
        uint8 third = b.simple_array(0, 2);
        assert(first == 1);
        assert(second == 2);
        assert(third == 3);
        jig.simple_array(0, 1, 10);
        assert(b.simple_array(0, 0) == 1);
        assert(b.simple_array(0, 1) == 10);
        assert(b.simple_array(0, 2) == 3);
    }
}
