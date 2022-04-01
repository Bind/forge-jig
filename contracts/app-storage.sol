// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;
struct Hello {
    uint64 hello;
    uint64 howdy;
    uint64 hi;
    uint64 hola;
    uint8 salutations;
}

struct Yo {
    uint8 yo;
    uint8 wassup;
}

struct S {
    address owner;
    mapping(uint256 => uint256) balanceOf;
    mapping(uint256 => uint256) owners;
    uint8[] stuff;
}

contract AppStorage {
    Hello public greetings;
    Yo public ack;
    uint256 howdy;
    S s;

    constructor() {
        s.owner = msg.sender;
        s.balanceOf[1000] = 1000;
        s.owners[1001] = 1001;
        s.stuff.push(2);
    }

    function owner() public returns (address) {
        return s.owner;
    }

    function balanceOf(uint256 key) public returns (uint256) {
        return s.balanceOf[key];
    }

    function owners(uint256 key) public returns (uint256) {
        return s.owners[key];
    }

    function stuff(uint256 key) public returns (uint8) {
        return s.stuff[key];
    }
}
