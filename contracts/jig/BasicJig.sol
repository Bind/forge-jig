// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;
import 'forge-std/stdlib.sol';
import 'forge-std/Vm.sol';

contract BasicJig {
    address target;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256('hevm cheat code'))))));

    constructor(address _contractAddress) {
        target = _contractAddress;
    }

    bytes32 simple_storage_slot = 0;

    function simple(uint256 value) public {
        vm.store(target, simple_storage_slot, bytes32(value));
    }
}