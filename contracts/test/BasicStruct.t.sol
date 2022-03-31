// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import 'ds-test/test.sol';
import 'contracts/jig/BasicStructJig.sol';
import 'contracts/basic-struct.sol';
import 'forge-std/stdlib.sol';
import 'forge-std/Vm.sol';
import './utils/console.sol';

contract BasicJigTest is DSTest {
    BasicStruct b;
    BasicStructJig jig;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256('hevm cheat code'))))));

    function clear(
        uint256 slotData,
        uint8 length,
        uint8 offset
    ) public returns (uint256) {
        unchecked {
            return
                slotData &
                (type(uint256).max ^
                    (((1 << (8 * length)) - 1) << (offset * 8)));
        }
    }

    // Must be zeroed out first
    function set(
        uint256 slotData,
        uint256 value,
        uint8 offset
    ) public returns (uint256) {
        return slotData | (value << (offset * 8));
    }

    function setUp() public {
        b = new BasicStruct();
        jig = new BasicStructJig(address(b));
    }

    function testRawStructPacking() public {
        (bool initialized, address owner) = b.init();
        // Initialized Correctly
        assert(initialized);
        assert(owner == address(uint160(type(uint256).max)));
        // Load raw slot
        uint256 stuff = uint256(vm.load(address(b), 0));
        // zero out boolean
        stuff = clear(stuff, 1, 0);
        vm.store(address(b), 0, bytes32(set(uint256(stuff), 0, 0)));
        stuff = uint256(vm.load(address(b), 0));
        // Load and check that boolean was false
        (initialized, owner) = b.init();
        assert(initialized == false);
        // Set true and cehck again
        vm.store(address(b), 0, bytes32(set(uint256(stuff), 1, 0)));
        (initialized, owner) = b.init();
        assert(initialized);
        // Zero out address
        stuff = clear(stuff, 20, 1);
        // set address
        stuff = set(stuff, uint256(uint160(address(1))), 1);
        // store update slot data
        vm.store(address(b), 0, bytes32(stuff));
        // fetch via contract
        (initialized, owner) = b.init();
        // validate store was successful
        assert(owner == address(1));
    }

    function testJig() public {
        (bool initialized, address owner) = b.init();
        // Initialized Correctly
        assert(initialized);
        assert(owner == address(uint160(type(uint256).max)));
        Initialized memory f = Initialized(false, address(0));
        jig.init(f);
        (initialized, owner) = b.init();
        assert(!initialized);
        assert(owner == address(0));
    }

    function set(Initialized memory init) public {}
}
