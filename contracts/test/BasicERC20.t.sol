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
    BasicJig jig;
    StdStorage stdstore;

    Vm public constant vm =
        Vm(address(bytes20(uint160(uint256(keccak256('hevm cheat code'))))));

    function setUp() public {
        b = new Basic();
        jig = new BasicJig(address(b));
    }

    function testJigBasic() public {
        jig.simple(1);
        assert(b.simple() == 1);
    }

    function testJig(uint8 rand) public {
        jig.simple(rand);
        assert(b.simple() == rand);
    }

    function testJigBalance(address owner, uint256 rand) public {
        jig.balanceOf(owner, rand);
        assert(b.balanceOf(owner) == rand);
    }

    function testJigAllowance(
        address owner,
        address allowed,
        uint256 rand
    ) public {
        jig.allowance(owner, allowed, rand);
        assert(b.allowance(owner, allowed) == rand);
    }
}
