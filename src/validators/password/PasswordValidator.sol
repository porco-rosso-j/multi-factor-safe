// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.25;

import {ERC7579ValidatorBase} from "modulekit/Modules.sol";
import {PackedUserOperation} from "modulekit/external/ERC4337.sol";
import {UltraVerifier as Verifier} from "./plonk_vk.sol";

// test
import {console2} from "forge-std/console2.sol";

/*

TODO: passwordHash needs domain separator to have greater security 
innterPasswordHash = keccak256(password)
domainSeparator = keccak256(chainId, address)
passwordHash == keccak256(innterPasswordHash, domainSeparator)

*/

/**
 * @title PasswordValidator
 * @dev Module that allows users to designate owners that can validate transactions
 * @author porco_rosso_j
 */
contract PasswordValidator is ERC7579ValidatorBase {
    /*//////////////////////////////////////////////////////////////////////////
                            CONSTANTS & STORAGE
    //////////////////////////////////////////////////////////////////////////*/

    error InvalidPasswordHash();

    address public immutable verifier;

    // account => userDataHash
    mapping(address account => bytes32 passwordHash)
        public accountToPasswordHash;

    constructor(address _verifier) {
        verifier = _verifier;
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
        bytes32 passwordHash = abi.decode(data, (bytes32));

        if (passwordHash == bytes32(0)) {
            revert InvalidPasswordHash();
        }

        // cache the account address
        address account = msg.sender;

        // set the userDataHash
        accountToPasswordHash[account] = passwordHash;
    }

    /**
     * Handles the uninstallation of the module and clears the threshold and owners
     * @dev the data parameter is not used
     */
    function onUninstall(bytes calldata) external override {
        // cache the account address
        address account = msg.sender;

        // remove the userDataHash
        accountToPasswordHash[account] = bytes32(0);
    }

    /**
     * Checks if the module is initialized
     *
     * @param smartAccount address of the smart account
     * @return true if the module is initialized, false otherwise
     */
    function isInitialized(address smartAccount) public view returns (bool) {
        return accountToPasswordHash[smartAccount] != bytes32(0);
    }

    /**
     * Sets the passwordHash for the account
     * @dev the function will revert if the module is not initialized
     *
     * @param _passwordHash uint256 passwordHash to set
     */
    function setPasswordHash(bytes32 _passwordHash) external {
        // cache the account address
        address account = msg.sender;
        // check if the module is initialized and revert if it is not
        if (!isInitialized(account)) revert NotInitialized(account);

        // make sure that the passwordHash is set
        if (_passwordHash == bytes32(0)) {
            revert InvalidPasswordHash();
        }

        // set the passwordHash
        accountToPasswordHash[account] = _passwordHash;
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
        // decode the passwordHash
        bytes32 passwordHash = abi.decode(data, (bytes32));

        // check that passwordHash is set
        if (passwordHash == bytes32(0)) {
            return false;
        }

        return _verifyProof(signature, passwordHash, hash);
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
        bytes32 passwordHash = accountToPasswordHash[account];
        if (passwordHash == bytes32(0)) {
            return false;
        }

        return _verifyProof(data, passwordHash, hash);
    }

    function _verifyProof(
        bytes memory proof,
        bytes32 passwordHash,
        bytes32 hash
    ) internal view returns (bool) {
        // set public inputs
        bytes32[] memory publicInputs = new bytes32[](65);

        publicInputs = _constructPublicInputs(
            passwordHash,
            bytes32(abi.encodePacked(block.chainid)),
            hash // commitmentHash ( safe op hash)
        );

        // check if the proof is valid
        // signature == proof
        if (Verifier(verifier).verify(proof, publicInputs)) {
            // if proof is valid, return true
            return true;
        }
        // if proof is invalid, false
        return false;
    }

    function _constructPublicInputs(
        bytes32 passwordHash,
        bytes32 salt,
        bytes32 commitmentHash
    ) internal pure returns (bytes32[] memory) {
        bytes32[] memory publicInputs = new bytes32[](65);
        publicInputs[0] = passwordHash;

        for (uint256 i = 0; i < 32; i++) {
            // Process salt
            publicInputs[i + 1] = bytes32(uint256(uint8(salt[i])));
            // Process commitmentHash
            publicInputs[i + 33] = bytes32(uint256(uint8(commitmentHash[i])));
        }
        return publicInputs;
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
        return "Validator";
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
