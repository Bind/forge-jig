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

Currently working on getting a working release deployed to NPM, but if you're feeling brave please clone the repository! You should be able to get the jig cli script added to your env by running `npm run local` `yarn local` `pnpm local` yada yada.

# Usage

`$ jig make src/Contract.sol`

This will generate the helper contract at `src/jig/ContractJig.sol`

# Quirks

- Haven't tested on Windows/Linux
- Haven't tested with Node version <16
- You need to have a foundry.toml at the root of your repo so that jig can infer remappings correctly.
- ~~Jig currently doesn't handle Contracts as storage variables but will soooon.~~
- Jig currently doesn't output prettier'ed code but will sooooooon.

# How

Jig is built on top of the [solc-type-ast](https://github.com/ConsenSys/solc-typed-ast) library built by Consensys. By traversing the AST of your contract source, Jig is able to parse out the storage declarations, apply some math, and spit out this helper contract. In addition, if your storage variables are a struct, Jig will import the struct declaration into its contract file and use that struct as part of the function signature. This gets booooonkers, but allows users to quickly push complicated state into a contract.

# Inspiration

[forge-std](https://github.com/brockelmore/forge-std) is a major improvement over the native vm.store, we would not have been able to build up enough intuition for the edge cases in storage layouts without it.

# Notes

Currently Jig only outputs a helper contract but could be reconfigured to output a json structure representing storage slots as well.
