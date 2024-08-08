// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.25;
import {Enum} from "safe-tools/SafeTestTools.sol";

interface ISafe {
    function getOwners() external view returns (address[] memory);
    function execTransaction(
        address to,
        uint256 value,
        bytes calldata data,
        Enum.Operation operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address payable refundReceiver,
        bytes memory signatures
    ) external payable returns (bool success);
}
