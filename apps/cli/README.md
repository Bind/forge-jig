Jig: a tool used to expedite some repetitive task and ensure that the results do not vary from project to project.

Jig generates a helper contract that abstracts away all storage slot math.

For example:

```
// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

contract Baby {
    uint256 public simple;
    
}
```

Turns into...

```
// THIS FILE WAS GENERATED
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

interface CheatCodes {
...
}

contract BabyJig {
    address internal target;
    CheatCodes public constant VM =
        CheatCodes(
            address(bytes20(uint160(uint256(keccak256("hevm cheat code")))))
        );

    constructor(address _contractAddress) {
        target = _contractAddress;
    }

    ...
    
    uint256 public simpleStorageSlot = uint256(0);

    function simple(uint256 value) public {
        VM.store(target, bytes32(simpleStorageSlot), bytes32(uint256(value)));
    }
}
```


which allows you to do things like...

```
contract BabyTest is DSTest {
    Baby baby;
    BabyJig jig;

    function setUp() public {
        baby = new Baby();
        jig = new BabyJig(address(b));
    }

    function testJig(uint256 rand) public {
        jig.simple(rand);
        assert(b.simple() == rand);
    }
}
```

Check out the [sample contracts](https://github.com/Bind/forge-fixtures/tree/main/contracts) to see how far Jig can push this pattern.  


# How
Jig is built on top the [solc-type-ast](https://github.com/ConsenSys/solc-typed-ast) library built by Consensys. By traversing the AST of your contract source, Jig as able to parse out the storage declarations, apply some math, and spit out this helper contract. In addition, if your storage variables are a struct, Jig will import the struct declaration into its contract file and use that struct as part of the function signature. This gets booooonkers, but allows users to quickly push complicated state into a contract. 


# Inspiration

[forge-std](https://github.com/brockelmore/forge-std) is a major improvement over the native vm.store, we would not have been able to build up enough intuition 

# TODO

- [x] generate storage layout from contract source

  - [x] parse out top level contract storage
  - [x] parse out struct declarations
  - [x] map contract storage vars to slots

    - [x] mappings
    - [x] arrays
    - [x] custom structs
      - [x] packed
      - [x] multi-slot
      - [x] nested

- [x] generate JigContract

  - [x] generate struct imports for helper contract to consume
  - [x] codegen slot storage helper per storage variable

    - [x] builtin solidity types
    - [x] mapping
      - [x] nested mapping
      - [x] struct
      - [x] solidity type
      - [x] array
    - [x] array
      - [x] manage array length
      - [x] nested array
      - [x] struct
      - [x] solidity type
    - [x] struct
      - [x] packed
      - [x] multi-slot
      - [x] nested
      - [x] array
      - [x] solidity type

- [x] deep merge foundry.toml default values with local config
- [x] flatten structs to better handle AppStorage pattern
- [x] rename test contracts
- [ ] build test cases around solmate

- [x] migrate to mono repo
  - [x] split out storage layout processing into own package
  - [x] split out built-in type processing into own package
- [] refactor codegen to be more recursion focused
  - [] move magic strings into constants file

## About

- uses [pnpm](https://pnpm.io/)
- uses [tsdx](https://tsdx.io/)

Storage Slot Tricks

- multiple structs will not be packed into 1 slot
- structs will always start in a new storage slot
- in order to add an element to an array you must also increment the length

