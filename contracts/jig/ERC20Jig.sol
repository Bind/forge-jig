// THIS FILE WAS GENERATED
// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;
import 'forge-std/stdlib.sol';
import 'forge-std/Vm.sol';

contract BasicERC20Jig {
    address target;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256('hevm cheat code'))))));

    constructor(address _contractAddress) {
        target = _contractAddress;
    }

    bytes32 name_storage_slot = bytes32(uint256(0));
    bytes32 symbol_storage_slot = bytes32(uint256(1));
    bytes32 totalSupply_storage_slot = bytes32(uint256(2));
    bytes32 balanceOf_storage_slot = bytes32(uint256(3));
    bytes32 allowance_storage_slot = bytes32(uint256(4));
    bytes32 nonces_storage_slot = bytes32(uint256(5));
    bytes32 simple_storage_slot = bytes32(uint256(6));

    function name(string memory value) public {
        vm.store(target, name_storage_slot, bytes32(bytes(value)));
    }

    function symbol(string memory value) public {
        vm.store(target, symbol_storage_slot, bytes32(bytes(value)));
    }

    function totalSupply(uint256 value) public {
        vm.store(target, totalSupply_storage_slot, bytes32(uint256(value)));
    }

    function simple(uint8 value) public {
        vm.store(target, simple_storage_slot, bytes32(uint256(value)));
    }
}
