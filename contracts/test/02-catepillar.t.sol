// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import "ds-test/test.sol";
import "contracts/jig/CatepillarJig.sol";
import "contracts/02-catepillar.sol";
import "forge-std/stdlib.sol";
import "forge-std/Vm.sol";
import "./utils/console.sol";

contract CatepillarTest is DSTest {
    Catepillar b;
    CatepillarJig jig;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));

    function setUp() public {
        b = new Catepillar();
        jig = new CatepillarJig(address(b));
    }

    function testManualArray() public {
        uint256 first = b.simple_array(uint256(0));
        uint256 second = b.simple_array(uint256(1));
        uint256 last = b.simple_array(uint256(2));
        assert(first == 3);
        assert(second == 2);
        assert(last == 1);

        vm.store(
            address(b),
            bytes32(uint256(keccak256(abi.encode(0))) + 1),
            bytes32(uint256(10))
        );
        console.log(b.simple_array(0));
        console.log(b.simple_array(1));
        console.log(b.simple_array(2));
        assert(b.simple_array(1) == 10);
    }

    function testArrayJig() public {
        uint256 first = b.simple_array(uint256(0));
        uint256 second = b.simple_array(uint256(1));
        uint256 last = b.simple_array(uint256(2));
        assert(first == 3);
        assert(second == 2);
        assert(last == 1);
        jig.simple_array(1, 10);
        console.log(b.simple_array(0));
        console.log(b.simple_array(1));
        console.log(b.simple_array(2));
        assert(b.simple_array(1) == 10);
    }
}
