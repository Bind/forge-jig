// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import "ds-test/test.sol";
import "contracts/jig/SerpentJig.sol";
import "contracts/11-serpent.sol";
import "forge-std/stdlib.sol";
import "forge-std/Vm.sol";
import "./utils/console.sol";

contract SerpentTest is DSTest {
    Serpent b;
    SerpentJig jig;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));

    function setUp() public {
        b = new Serpent();
        jig = new SerpentJig(address(b));
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

    // TODO: Need to check for length of each nested array
    // function testArrayArrayJigOOR() public {
    //     jig.simple_array(1000, 0, 10);
    //     assert(b.simple_array(1000, 0) == 10);
    //     jig.simple_array(1000, 1000, 10);
    //     assert(b.simple_array(1000, 1000) == 10);
    //     jig.simple_array(0, 1000, 10);
    //     assert(b.simple_array(0, 1000) == 10);
    // }
}
