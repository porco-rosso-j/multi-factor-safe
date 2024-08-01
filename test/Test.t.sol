// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.25;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";

contract TTest is Test {
    function testGenSalt() public {
        address caller = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        console2.logAddress(caller);
        bytes32 value = bytes32(
            abi.encodePacked(caller, uint32(block.chainid))
        );

        console2.logBytes32(value);
    }
}
