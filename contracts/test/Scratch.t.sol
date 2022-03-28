// THIS FILE WAS GENERATED
// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;
import 'forge-std/stdlib.sol';
import 'forge-std/Vm.sol';
import 'ds-test/test.sol';

contract ScratchJigTest is DSTest {
    using stdStorage for StdStorage;
    address target;
    StdStorage stdstore;

    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256('hevm cheat code'))))));

    constructor(address _contractAddress) {
        target = _contractAddress;
    }

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

    function testBasicClear() public {
        assert(false);
        assert(clear(uint256(3), 32, 0) == uint256(0));
    }
}
