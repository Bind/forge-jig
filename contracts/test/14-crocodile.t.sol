// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import "ds-test/test.sol";
import "contracts/jig/CrocodileJig.sol";
import "contracts/14-crocodile.sol";
import "forge-std/stdlib.sol";
import "forge-std/Vm.sol";
import "./utils/console.sol";

contract CrocodileTest is DSTest {
    Crocodile b;
    CrocodileJig jig;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));

    function setUp() public {
        b = new Crocodile();
        jig = new CrocodileJig(address(b));
    }

    function testManualSlotOverwriting() public {
        (uint8 first, uint8 second, uint256 last) = b.simple_mapping(1);
        assert(first == 1);
        assert(second == 2);
        assert(last == 3);
        vm.store(address(b), keccak256(abi.encode(1, 0)), bytes32(uint256(8)));
        vm.store(
            address(b),
            bytes32(abi.encode(uint256(keccak256(abi.encode(1, 0))) + 1)),
            bytes32(uint256(8))
        );
        (first, second, last) = b.simple_mapping(1);
        assert(first == 8);
        assert(second == 0);
        assert(last == 8);
    }

    function testMappingJig(
        uint8 f,
        uint8 s,
        uint256 l
    ) public {
        (uint8 first, uint8 second, uint256 last) = b.simple_mapping(1);
        assert(first == 1);
        assert(second == 2);
        assert(last == 3);

        jig.simple_mapping(1, Entity(f, s, l));
        (first, second, last) = b.simple_mapping(1);
        assert(first == f);
        assert(second == s);
        assert(last == l);
    }
}
