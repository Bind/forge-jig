// SPDX-License-Identifier: UNLICENSED
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

contract Dragon {
    mapping(address => mapping(uint256 => GameEntity)) public entities;

    constructor() {}

    function getMoveset(address owner, uint256 insanoId)
        public
        view
        returns (uint8[] memory)
    {
        return entities[owner][insanoId].moveset;
    }

    function getActionLog(address owner, uint256 insanoId)
        public
        view
        returns (uint256[] memory)
    {
        return entities[owner][insanoId].actionLog;
    }
}
