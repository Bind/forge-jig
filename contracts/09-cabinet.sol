// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

struct Hello {
    uint64 hello;
    uint64 howdy;
    uint64 hi;
    uint64 hola;
    uint8 salutations;
    Yo[] yos;
    uint8 overflow_test;
}

struct Yo {
    uint8 yo;
    uint8 wassup;
}

contract Cabinet {
    Hello public greetings;

    constructor() {
        greetings.hello = 11;
        greetings.howdy = 22;
        greetings.hi = 33;
        greetings.hola = 44;
        greetings.salutations = 1;
        greetings.yos.push(Yo(100, 101));
        greetings.overflow_test = 55;
    }

    function get_yos() public view returns (Yo[] memory) {
        return greetings.yos;
    }
}
