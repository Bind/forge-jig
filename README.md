# <h1 align="center">Forge Jig</h1>

**Jig allows you to easily set the state of a contract**

Jig inspects a target contract's source code and will generate a contract to easily overwrite the target's state. This is inspired by the DappTools 'User Contract' pattern, highlighted by [blacksmith](https://github.com/pbshgthm/blacksmith). Jig is especially powerful for contracts that follow the AppStorage pattern and use complex structs to define their internal state. 


### Quick Start

`$ npm i @forge-jig/cli -g`

`$ jig make src/Contract.sol`

This will generate a jig contract at `src/jig/ContractJig.sol`

### Examples

**simple**

```
// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;

contract Baby {
    uint256 public simple;

}
```

**generates...**

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

**which allows you to...**

```
contract BabyTest is DSTest {
    Baby baby;
    BabyJig jig;

    function setUp() public {
        baby = new Baby();
        jig = new BabyJig(address(baby));
    }

    function testJig(uint256 rand) public {
        jig.simple(rand);
        assert(baby.simple() == rand);
    }
}
```


**deranged**

```
pragma solidity >=0.4.22 <0.9.0;

struct GameEntity {
    uint256 entityType;
    uint8 health;
    uint8 damageTaken;
    uint8[] moveset;
    uint8 status;
    uint256[] actionLog;
    bool dead;
}

contract Hydra {
    mapping(address => mapping(uint256 => GameEntity[])) public entities;

    constructor() {}

    function getMoveset(
        address owner,
        uint256 insanoId,
        uint256 pos
    ) public view returns (uint8[] memory) {
        return entities[owner][insanoId][pos].moveset;
    }

    function getActionLog(
        address owner,
        uint256 insanoId,
        uint256 pos
    ) public view returns (uint256[] memory) {
        return entities[owner][insanoId][pos].actionLog;
    }
}
```


**generates...**

```
// THIS FILE WAS GENERATED
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import {GameEntity} from "contracts/19-hydra.sol";

interface CheatCodes {
    ...
}

contract HydraJig {
    address internal target;
    CheatCodes public constant VM =
        CheatCodes(
            address(bytes20(uint160(uint256(keccak256("hevm cheat code")))))
        );

    constructor(address _contractAddress) {
        target = _contractAddress;
    }
    ...

    uint256 public entitiesStorageSlot = uint256(0);

    function entities(
        address key0,
        uint256 key1,
        uint128 key2,
        GameEntity memory value
    ) public {
        uint256 entitiesArray = uint256(
            keccak256(
                abi.encode(
                    key1,
                    bytes32(
                        keccak256(
                            abi.encode(key0, bytes32(entitiesStorageSlot))
                        )
                    )
                )
            )
        );
        uint256 struct_size = 6;
        uint256 entitiesArrayLength = uint256(
            VM.load(target, bytes32(entitiesArray))
        );

        if (entitiesArrayLength <= key2) {
            VM.store(
                target,
                bytes32(entitiesArray),
                bytes32(uint256(key2) + 1)
            );
        }
        uint256 slotGameEntity = uint256(
            keccak256(abi.encode((entitiesArray)))
        ) + struct_size * key2;

        uint256 slotContent = uint256(
            VM.load(target, bytes32(slotGameEntity + uint256(0)))
        );

        slotContent = clear(slotContent, 32, 0);
        slotContent = set(
            slotContent,
            uint256(bytes32(uint256(value.entityType))),
            0
        );
        VM.store(
            target,
            bytes32(slotGameEntity + uint256(0)),
            bytes32(slotContent)
        );

        slotContent = uint256(
            VM.load(target, bytes32(slotGameEntity + uint256(1)))
        );
        slotContent = clear(slotContent, 1, 0);
        slotContent = set(
            slotContent,
            uint256(bytes32(uint256(value.health))),
            0
        );
        VM.store(
            target,
            bytes32(slotGameEntity + uint256(1)),
            bytes32(slotContent)
        );

        slotContent = clear(slotContent, 1, 1);
        slotContent = set(
            slotContent,
            uint256(bytes32(uint256(value.damageTaken))),
            1
        );
        VM.store(
            target,
            bytes32(slotGameEntity + uint256(1)),
            bytes32(slotContent)
        );

        uint256 movesetStorageSlot = slotGameEntity + uint256(2);

        uint256 ArrayLength = uint256(
            VM.load(target, bytes32(movesetStorageSlot))
        );
        if (ArrayLength < value.moveset.length) {
            VM.store(
                target,
                bytes32(movesetStorageSlot),
                bytes32(value.moveset.length)
            );
        }
        slotContent = uint256(
            VM.load(target, bytes32(movesetStorageSlot + uint256(0)))
        );
        for (uint256 i = 0; i < value.moveset.length; i++) {
            uint8 contentOffset = uint8((i * 1) % 32);
            uint8 slotOffset = uint8((((i * 1) - contentOffset) / 32));
            uint256 arraySlot = (uint256(
                keccak256(abi.encode(movesetStorageSlot))
            ) + slotOffset);

            uint256 slotContent = uint256(
                VM.load(target, bytes32(arraySlot + uint256(0)))
            );
            slotContent = clear(slotContent, 1, contentOffset);
            slotContent = set(
                slotContent,
                uint256(bytes32(uint256(value.moveset[i]))),
                contentOffset
            );
            VM.store(
                target,
                bytes32(arraySlot + uint256(0)),
                bytes32(slotContent)
            );
        }

        slotContent = uint256(
            VM.load(target, bytes32(slotGameEntity + uint256(3)))
        );
        slotContent = clear(slotContent, 1, 0);
        slotContent = set(
            slotContent,
            uint256(bytes32(uint256(value.status))),
            0
        );
        VM.store(
            target,
            bytes32(slotGameEntity + uint256(3)),
            bytes32(slotContent)
        );

        uint256 actionLogStorageSlot = slotGameEntity + uint256(4);

        ArrayLength = uint256(VM.load(target, bytes32(actionLogStorageSlot)));
        if (ArrayLength < value.actionLog.length) {
            VM.store(
                target,
                bytes32(actionLogStorageSlot),
                bytes32(value.actionLog.length)
            );
        }
        slotContent = uint256(
            VM.load(target, bytes32(actionLogStorageSlot + uint256(0)))
        );
        for (uint256 i = 0; i < value.actionLog.length; i++) {
            uint8 contentOffset = uint8((i * 32) % 32);
            uint8 slotOffset = uint8((((i * 32) - contentOffset) / 32));
            uint256 arraySlot = (uint256(
                keccak256(abi.encode(actionLogStorageSlot))
            ) + slotOffset);

            uint256 slotContent = uint256(
                VM.load(target, bytes32(arraySlot + uint256(0)))
            );
            slotContent = clear(slotContent, 32, contentOffset);
            slotContent = set(
                slotContent,
                uint256(bytes32(uint256(value.actionLog[i]))),
                contentOffset
            );
            VM.store(
                target,
                bytes32(arraySlot + uint256(0)),
                bytes32(slotContent)
            );
        }

        slotContent = uint256(
            VM.load(target, bytes32(slotGameEntity + uint256(5)))
        );
        slotContent = clear(slotContent, 1, 0);
        slotContent = set(
            slotContent,
            uint256(bytes32(uint256(value.dead ? 1 : 0))),
            0
        );
        VM.store(
            target,
            bytes32(slotGameEntity + uint256(5)),
            bytes32(slotContent)
        );
    }
}
```

**which allows you to...**

```

contract HydraTest is DSTest {
    Hydra hydra;
    HydraJig jig;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));

    function setUp() public {
        hydra = new Hydra();
        jig = new HydraJig(address(b));
    }

    function testHydra() public {
        uint8[] memory moves = new uint8[](2);
        moves[0] = 20;
        moves[1] = 21;
        uint256[] memory statusLog = new uint256[](2);
        statusLog[0] = 300;
        statusLog[1] = 301;
        bool dead = true;
        GameEntity memory villain = GameEntity(
            1,
            100,
            45,
            moves,
            3,
            statusLog,
            false
        );
        jig.entities(address(0), 0, 0, villain);
        ...
    }
}
```

Check out the [sample contracts](https://github.com/Bind/forge-fixtures/tree/main/contracts) to see how far Jig can push this pattern.

### Quirks

- Haven't tested on Windows/Linux
- Haven't tested with Node version <16
- You need to have a foundry.toml at the root of your repo so that jig can infer remappings correctly.
- Jig currently doesn't handle Contracts as storage variables but will soooon.
- Jig currently doesn't output prettier'ed code but will sooooooon.

### How

Jig is built on top of the [solc-typed-ast](https://github.com/ConsenSys/solc-typed-ast) library built by Consensys. By traversing the AST of your contract source, Jig is able to parse out the storage declarations, apply some math, and spit out a contract. In addition, if your storage variables are a struct, Jig will import the struct declaration into its contract file and use that struct as part of its function signatures. This gets booooonkers, but allows users to quickly push complicated state into a contract.

### Inspiration

[forge-std](https://github.com/brockelmore/forge-std) is a major improvement over the native vm.store, we would not have been able to build up enough intuition for the edge cases in storage layouts without it.

### Notes

Currently Jig only outputs a helper contract but could be reconfigured to output a json structure representing storage slots as well.
