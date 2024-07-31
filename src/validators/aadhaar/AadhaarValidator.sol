// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.25;

import {ERC7579ValidatorBase} from "modulekit/Modules.sol";
import {PackedUserOperation} from "modulekit/external/ERC4337.sol";
import {IAnonAadhaar} from "@anon-aadhaar/contracts/interfaces/IAnonAadhaar.sol";

// test
import {console2} from "forge-std/console2.sol";

/**
 * @title AadhaarValidator
 * @dev Module that allows users to designate Aadhaar card  owners that can validate transactions
 * @author porco_rosso_j
 */
contract AadhaarValidator is ERC7579ValidatorBase {
    /*//////////////////////////////////////////////////////////////////////////
                            CONSTANTS & STORAGE
    //////////////////////////////////////////////////////////////////////////*/

    error InvalidUserDataHash();

    address public immutable anonAadhaarAddr;

    // account => userDataHash
    mapping(address account => uint256 userDataHash)
        public accountToUserDataHash;

    constructor(address _anonAadhaarAddr) {
        anonAadhaarAddr = _anonAadhaarAddr;
    }

    /*//////////////////////////////////////////////////////////////////////////
                                     CONFIG
    //////////////////////////////////////////////////////////////////////////*/

    /**
     * Initializes the module with the threshold and owners
     * @dev data is encoded as follows: abi.encode(threshold, owners)
     *
     * @param data encoded data containing the threshold and owners
     */
    function onInstall(bytes calldata data) external override {
        // decode the threshold and owners
        uint256 userDataHash = abi.decode(data, (uint256));

        if (userDataHash == 0) {
            revert InvalidUserDataHash();
        }

        // cache the account address
        address account = msg.sender;

        // set the userDataHash
        accountToUserDataHash[account] = userDataHash;
    }

    /**
     * Handles the uninstallation of the module and clears the threshold and owners
     * @dev the data parameter is not used
     */
    function onUninstall(bytes calldata) external override {
        // cache the account address
        address account = msg.sender;

        // remove the userDataHash
        accountToUserDataHash[account] = 0;
    }

    /**
     * Checks if the module is initialized
     *
     * @param smartAccount address of the smart account
     * @return true if the module is initialized, false otherwise
     */
    function isInitialized(address smartAccount) public view returns (bool) {
        return accountToUserDataHash[smartAccount] != 0;
    }

    /**
     * Sets the threshold for the account
     * @dev the function will revert if the module is not initialized
     *
     * @param _userDataHash uint256 userDataHash to set
     */
    function setUserDataHash(uint256 _userDataHash) external {
        // cache the account address
        address account = msg.sender;
        // check if the module is initialized and revert if it is not
        if (!isInitialized(account)) revert NotInitialized(account);

        // make sure that the threshold is set
        if (_userDataHash == 0) {
            revert InvalidUserDataHash();
        }

        // set the userDataHash
        accountToUserDataHash[account] = _userDataHash;
    }

    /*//////////////////////////////////////////////////////////////////////////
                                     MODULE LOGIC
    //////////////////////////////////////////////////////////////////////////*/

    /**
     * Validates a user operation
     *
     * @param userOp PackedUserOperation struct containing the UserOperation
     * @param userOpHash bytes32 hash of the UserOperation
     *
     * @return ValidationData the UserOperation validation result
     */
    function validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) external view override returns (ValidationData) {
        // validate the signature with the config
        bool isValid = _validateSignatureWithConfig(
            userOp.sender,
            userOpHash,
            userOp.signature
        );

        // return the result
        if (isValid) {
            return VALIDATION_SUCCESS;
        }
        return VALIDATION_FAILED;
    }

    /**
     * Validates an ERC-1271 signature with the sender
     *
     * @param hash bytes32 hash of the data
     * @param data bytes data containing the signatures
     *
     * @return bytes4 EIP1271_SUCCESS if the signature is valid, EIP1271_FAILED otherwise
     */
    function isValidSignatureWithSender(
        address,
        bytes32 hash,
        bytes calldata data
    ) external view override returns (bytes4) {
        // validate the signature with the config
        bool isValid = _validateSignatureWithConfig(msg.sender, hash, data);

        // return the result
        if (isValid) {
            return EIP1271_SUCCESS;
        }
        return EIP1271_FAILED;
    }

    /**
     * Validates a signature with the data (stateless validation)
     *
     * @param hash bytes32 hash of the data
     * @param signature bytes data containing the signatures
     * @param data bytes data containing the data
     *
     * @return bool true if the signature is valid, false otherwise
     */
    function validateSignatureWithData(
        bytes32 hash,
        bytes calldata signature,
        bytes calldata data
    ) external view returns (bool) {
        // decode the userDataHash and check that it's valid
        uint256 userDataHash = abi.decode(data, (uint256));
        if (userDataHash == 0) {
            return false;
        }

        return _verifyProof(data, userDataHash, hash);
    }

    /*//////////////////////////////////////////////////////////////////////////
                                     INTERNAL
    //////////////////////////////////////////////////////////////////////////*/

    function _validateSignatureWithConfig(
        address account,
        bytes32 hash,
        bytes calldata data
    ) internal view returns (bool) {
        // get the userDataHash and check that its set
        uint256 userDataHash = accountToUserDataHash[account];
        if (userDataHash == 0) {
            return false;
        }

        return _verifyProof(data, userDataHash, hash);
    }

    function _verifyProof(
        bytes memory proof,
        uint256 userDataHash,
        bytes32 hash
    ) internal view returns (bool) {
        (
            uint256 nullifierSeed,
            uint256 timestamp,
            uint[4] memory revealArray,
            uint[8] memory groth16Proof
        ) = abi.decode(proof, (uint, uint, uint[4], uint[8]));

        console2.logString("hash: ");
        console2.logBytes32(hash);

        if (
            IAnonAadhaar(anonAadhaarAddr).verifyAnonAadhaarProof(
                nullifierSeed,
                userDataHash,
                timestamp,
                uint(hash), // safe tx hash bound to proof
                revealArray,
                groth16Proof
            )
        ) {
            // if the threshold is met, return true
            return true;
        }
        // if the threshold is not met, return false
        return false;
    }

    /*//////////////////////////////////////////////////////////////////////////
                                     METADATA
    //////////////////////////////////////////////////////////////////////////*/

    /**
     * Returns the type of the module
     *
     * @param typeID type of the module
     *
     * @return true if the type is a module type, false otherwise
     */
    function isModuleType(
        uint256 typeID
    ) external pure override returns (bool) {
        return typeID == TYPE_VALIDATOR;
    }

    /**
     * Returns the name of the module
     *
     * @return name of the module
     */
    function name() external pure virtual returns (string memory) {
        return "AadhaarValidator";
    }

    /**
     * Returns the version of the module
     *
     * @return version of the module
     */
    function version() external pure virtual returns (string memory) {
        return "1.0.0";
    }
}
