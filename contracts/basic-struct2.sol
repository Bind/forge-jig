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

contract BasicStruct2 {
    Hello greetings;
    Yo ack;

    constructor() {
        greetings.hello = 11;
        greetings.howdy = 22;
        greetings.hi = 33;
        greetings.hola = 44;
        greetings.salutations = 1;
        ack.yo = 33;
        ack.wassup = 44;
    }
}
