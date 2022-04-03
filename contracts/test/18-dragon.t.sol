// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import "ds-test/test.sol";
import {DragonJig} from "contracts/jig/DragonJig.sol";

import "contracts/18-dragon.sol";
import "forge-std/stdlib.sol";
import "forge-std/Vm.sol";
import "./utils/console.sol";

contract DragonTest is DSTest {
    Dragon b;
    DragonJig jig;
    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256("hevm cheat code"))))));

    function setUp() public {
        b = new Dragon();
        jig = new DragonJig(address(b));
    }

    function testInsane() public {
        uint256 t = 100;
        uint8 h = 12;
        uint8 d = 14;
        uint8[] memory moves = new uint8[](2);
        moves[0] = 20;
        moves[1] = 21;
        uint8 s = 3;
        uint256[] memory statusLog = new uint256[](2);
        statusLog[0] = 300;
        statusLog[1] = 301;
        bool dead = true;
        GameEntity memory hero = GameEntity(t, h, d, moves, s, statusLog, dead);
        jig.entities(address(0), 0, hero);
        (uint256 ft, uint8 fh, uint8 fd, uint8 fs, bool fdead) = b.entities(
            address(0),
            0
        );
        assert(ft == t);
        assert(fh == h);
        assert(fd == d);
        assert(fs == s);
        assert(fdead);

        uint8[] memory fetchedMoves = b.getMoveset(address(0), 0);
        assert(fetchedMoves[0] == 20);
        assert(fetchedMoves[1] == 21);
        uint256[] memory fetchedActions = b.getActionLog(address(0), 0);
        assert(fetchedActions[0] == 300);
        assert(fetchedActions[1] == 301);
    }

    function testInsaneMoveset() public {
        uint256 t = 100;
        uint8 h = 12;
        uint8 d = 14;
        uint8[] memory moves = new uint8[](33);
        moves[32] = 90;
        uint8 s = 3;
        uint256[] memory statusLog = new uint256[](2);
        bool dead = true;
        GameEntity memory hero = GameEntity(t, h, d, moves, s, statusLog, dead);
        jig.entities(address(0), 0, hero);
        uint8[] memory fetchedMoves = b.getMoveset(address(0), 0);
        assert(fetchedMoves[32] == 90);
    }

    function testInsaneRandPostion(address owner, uint256 id) public {
        uint256 t = 100;
        uint8 h = 12;
        uint8 d = 14;
        uint8[] memory moves = new uint8[](2);
        moves[0] = 20;
        moves[1] = 21;
        uint8 s = 3;
        uint256[] memory statusLog = new uint256[](2);
        statusLog[0] = 300;
        statusLog[1] = 301;
        bool dead = true;
        GameEntity memory hero = GameEntity(t, h, d, moves, s, statusLog, dead);
        jig.entities(owner, id, hero);
        uint8[] memory fetchedMoves = b.getMoveset(owner, id);
        assert(fetchedMoves[0] == 20);
        assert(fetchedMoves[1] == 21);
        uint256[] memory fetchedActions = b.getActionLog(owner, id);
        assert(fetchedActions[0] == 300);
        assert(fetchedActions[1] == 301);
    }
}
