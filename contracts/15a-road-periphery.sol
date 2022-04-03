// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

library Types {
    struct Recipe {
        uint256[] inputs;
        uint256[] inputAmounts;
        uint256[] outputs;
        uint256[] outputAmounts;
    }

    enum MobSpecies {
        NONE,
        BOAR,
        BEAR,
        WOLF,
        SERPENT,
        GOBLIN,
        TROLL
    }

    enum MobMutation {
        NONE,
        SMALL,
        FAST,
        BIG,
        LEADER
    }

    struct Mob {
        MobSpecies species;
        MobMutation mutation;
        uint8 health;
        uint8 attack;
        uint8 damageTaken;
    }

    enum HeroClass {
        NONE,
        CLERIC,
        MONK,
        MAGE,
        ROGUE,
        KNIGHT
    }

    struct Hero {
        HeroClass class;
        uint8 health;
        uint8 damageTaken;
        uint8 attack;
    }

    enum SquadStatus {
        NONE,
        DEPLOYED,
        CALLED,
        IDLE
    }

    enum BandStatus {
        NONE,
        PUB,
        DUNGEON,
        DEAD
    }

    struct Squad {
        SquadStatus status;
        Mob[] members;
        uint256[] loot;
        address owner;
    }

    struct GameStorage {
        // Deposit Management
        uint256 mobCounter;
        mapping(address => mapping(uint256 => uint256)) deposits;
        mapping(address => mapping(uint256 => uint256)) lockedDeposits;
        // Loot Management
        mapping(address => mapping(uint256 => uint256)) loot;
        mapping(uint256 => mapping(uint256 => uint256)) mobLoot;
        // Encounter Pool
        mapping(uint256 => Types.Squad) pool;
        mapping(uint8 => uint256[]) graveyards; // depth -  Mob IDs
        mapping(uint8 => uint256[]) decks; // depth - Mob IDs
        // Band
        mapping(address => Band) bands; // Band Address - Band Struct
        mapping(address => uint8) depths; // Band Address - dungeon depth
        // Battle
        mapping(uint256 => address) mobStrats;
        mapping(address => address) bandStrats;
        mapping(address => uint256) battles; // Band Address to Mob ID
    }
}

struct Band {
    Types.BandStatus status;
    Types.Hero[] members;
    // Need to track to Drop on Death
    uint256[] loot;
}
