// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console} from "forge-std/Test.sol";

contract Setup is Test {
    function setUp() public {
        vm.createSelectFork(vm.rpcUrl(RPC), FORK_BLOCK);
        vm.prank(_owner);
    }
}