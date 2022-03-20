// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.8.0;

import 'ds-test/test.sol';
import 'forge-std/stdlib.sol';
import 'forge-std/Vm.sol';
import 'contracts/jig/ERC20Jig.sol';
import 'contracts/basic-erc20.sol';
import './utils/console.sol';

contract BasicERC20JigTest is DSTest {
    using stdStorage for StdStorage;
    Basic b;
    BasicERC20Jig m;
    StdStorage stdstore;

    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256('hevm cheat code'))))));

    function setUp() public {
        b = new Basic();
        m = new BasicERC20Jig(address(b));
    }

    function testJigBasic() public {
        m.simple(1);
        assert(b.simple() == 1);
    }

    function testJig(uint8 rand) public {
        m.simple(rand);
        assert(b.simple() == rand);
    }
}
