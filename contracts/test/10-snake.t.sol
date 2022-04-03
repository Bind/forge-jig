// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import "ds-test/test.sol";
import "contracts/jig/SnakeJig.sol";
import "contracts/10-snake.sol";
import "forge-std/stdlib.sol";
import "forge-std/Vm.sol";
import "./utils/console.sol";

contract SnakeTest is DSTest {
    Snake b;
    SnakeJig jig;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));

    function setUp() public {
        b = new Snake();
        jig = new SnakeJig(address(b));
    }

    function testManualArray() public {
        uint8 first = b.simple_array(uint8(0));
        uint8 second = b.simple_array(uint8(1));
        uint8 last = b.simple_array(uint8(2));
        assert(first == 3);
        assert(second == 2);
        assert(last == 1);

        vm.store(
            address(b),
            bytes32(uint256(keccak256(abi.encode(0)))),
            bytes32(uint256(10))
        );
        console.log(b.simple_array(0));
        console.log(b.simple_array(1));
        console.log(b.simple_array(2));
        assert(b.simple_array(0) == 10);
    }

    function testArraySmallJig() public {
        uint8 first = b.simple_array(uint8(0));
        uint8 second = b.simple_array(uint8(1));
        uint8 last = b.simple_array(uint8(2));
        assert(first == 3);
        assert(second == 2);
        assert(last == 1);
        jig.simple_array(1, 10);
        assert(b.simple_array(1) == 10);
    }

    function testArraySmallJigOOR() public {
        uint8 first = b.simple_array(uint8(0));
        uint8 second = b.simple_array(uint8(1));
        uint8 last = b.simple_array(uint8(2));
        assert(first == 3);
        assert(second == 2);
        assert(last == 1);
        jig.simple_array(1000, 10);
        assert(b.simple_array(1000) == 10);
    }
}
