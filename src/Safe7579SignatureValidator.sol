// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.25;

import {IValidator} from "erc7579/interfaces/IERC7579Module.sol";
import {ISignatureValidator} from "./interfaces/ISignatureValidator.sol";
import {ISafe} from "./interfaces/ISafe.sol";

/// This contract acts as safe owner and relays EIP1271 validation to given ERC7579 validator

contract Safe7579SignatureValidator is ISignatureValidator {
    error NotSafeOwner();
    error ValidatorNotInitialized();

    bytes4 internal constant EIP1271_MAGIC_VALUE = 0x1626ba7e;
    bytes4 internal constant EIP1271_MAGIC_VALUE_LEGACY = 0x20c13b0b;
    bytes4 internal constant EIP1271_FAILED_VALUE = 0xffffffff;

    address public immutable validator;

    constructor(address _validator, bytes memory data) {
        IValidator(_validator).onInstall(data);
        validator = _validator;
    }

    // EIP-1271 function
    function isValidSignature(
        bytes32 hash,
        bytes memory data
    ) public view override returns (bytes4 magicValue) {
        bytes32 safeOpHash = keccak256(abi.encodePacked(address(this), hash));

        // validate signature with 7579 validator
        if (_isValidSignature(safeOpHash, data)) {
            return EIP1271_MAGIC_VALUE; // legacy EIP-1271 magic value used in safe
        } else {
            return EIP1271_FAILED_VALUE;
        }
    }

    // legacy EIP-1271 functione for safe <= 1.4.1
    function isValidSignature(
        bytes memory data,
        bytes memory signature
    ) public view override returns (bytes4 magicValue) {
        // decode data into hash
        bytes32 safeOpHash = keccak256(
            abi.encodePacked(address(this), keccak256(data))
        );

        // validate signature with 7579 validator
        if (_isValidSignature(safeOpHash, signature)) {
            return EIP1271_MAGIC_VALUE_LEGACY; // legacy EIP-1271 magic value used in safe
        } else {
            return EIP1271_FAILED_VALUE;
        }
    }

    function _isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) internal view returns (bool) {
        // check if msg.sender, i.e. Safe, has this address as one of the owners
        if (!_isSafeOwner(msg.sender)) {
            revert NotSafeOwner();
        }

        // check if this address has already been registered as "account" in the validator
        if (!IValidator(validator).isInitialized(address(this))) {
            revert ValidatorNotInitialized();
        }

        // validate signature with 7579 validator
        return
            IValidator(validator).isValidSignatureWithSender(
                address(this),
                hash,
                signature
            ) == EIP1271_MAGIC_VALUE;
    }

    // it's important to disable this contract once it's removed from the safe
    function _isSafeOwner(address sender) internal view returns (bool) {
        address[] memory owners = ISafe(sender).getOwners();
        for (uint8 i = 0; i < owners.length; i++) {
            if (owners[i] == address(this)) {
                return true;
            }
        }

        return false;
    }
}
