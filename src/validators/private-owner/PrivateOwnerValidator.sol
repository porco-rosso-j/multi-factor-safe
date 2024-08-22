// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.25;

import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ERC7579ValidatorBase} from "modulekit/Modules.sol";
import {PackedUserOperation} from "modulekit/external/ERC4337.sol";
import {UltraVerifier as Verifier} from "./plonk_vk.sol";

// test
import {console2} from "forge-std/console2.sol";

/**
 * @title PrivateOwnerValidator
 * @dev Module that allows users to designate hidden EOA owners that can validate transactions
 * @author porco_rosso_j
 */
contract PrivateOwnerValidator is ERC7579ValidatorBase {
    using MessageHashUtils for bytes32;

    /*//////////////////////////////////////////////////////////////////////////
                            CONSTANTS & STORAGE
    //////////////////////////////////////////////////////////////////////////*/

    error InvalidPrivateOwnerHash();

    address public immutable verifier;

    // account => userDataHash
    mapping(address account => bytes32 ownerHash) public accountToOwnerHash;

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
        bytes32 ownerHash = abi.decode(data, (bytes32));

        if (ownerHash == bytes32(0)) {
            revert InvalidPrivateOwnerHash();
        }

        // cache the account address
        address account = msg.sender;

        // set the userDataHash
        accountToOwnerHash[account] = ownerHash;
    }

    /**
     * Handles the uninstallation of the module and clears the threshold and owners
     * @dev the data parameter is not used
     */
    function onUninstall(bytes calldata) external override {
        // cache the account address
        address account = msg.sender;

        // remove the userDataHash
        accountToOwnerHash[account] = bytes32(0);
    }

    /**
     * Checks if the module is initialized
     *
     * @param smartAccount address of the smart account
     * @return true if the module is initialized, false otherwise
     */
    function isInitialized(address smartAccount) public view returns (bool) {
        return accountToOwnerHash[smartAccount] != bytes32(0);
    }

    /**
     * Sets the ownerHash for the account
     * @dev the function will revert if the module is not initialized
     *
     * @param _ownerHash uint256 ownerHash to set
     */
    function setPrivateOwnerHash(bytes32 _ownerHash) external {
        // cache the account address
        address account = msg.sender;
        // check if the module is initialized and revert if it is not
        if (!isInitialized(account)) revert NotInitialized(account);

        // make sure that the ownerHash is set
        if (_ownerHash == bytes32(0)) {
            revert InvalidPrivateOwnerHash();
        }

        // set the ownerHash
        accountToOwnerHash[account] = _ownerHash;
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
        // decode the ownerHash
        bytes32 ownerHash = abi.decode(data, (bytes32));

        // check that ownerHash is set
        if (ownerHash == bytes32(0)) {
            return false;
        }

        return _verifyProof(signature, ownerHash, hash);
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
        bytes32 ownerHash = accountToOwnerHash[account];
        if (ownerHash == bytes32(0)) {
            return false;
        }

        return _verifyProof(data, ownerHash, hash);
    }

    // TODO: first salt:
    // 1: safe addr -> msg.sender
    // 2: signer addr -> address(this)
    // 3: owner addr -> no as it should be private

    // might need more siloed salt(domain separator)
    // hash(safe, signer, chainid)
    function _verifyProof(
        bytes memory proof,
        bytes32 ownerHash,
        bytes32 hash
    ) internal view returns (bool) {
        // set public inputs
        bytes32[] memory publicInputs = new bytes32[](33);
        publicInputs = _constructPublicInputs(
            ownerHash,
            // _getDomainSeparator(),
            hash.toEthSignedMessageHash() // hash of safeMfaOpHash
        );

        // check if the proof is valid
        if (Verifier(verifier).verify(proof, publicInputs)) {
            // if proof is valid, return true
            return true;
        }
        // if proof is invalid, false
        return false;
    }

    function _constructPublicInputs(
        bytes32 ownerHash,
        bytes32 hash
    ) internal pure returns (bytes32[] memory) {
        bytes32[] memory publicInputs = new bytes32[](33);
        publicInputs[0] = ownerHash;
        for (uint256 i = 0; i < 32; i++) {
            publicInputs[i + 1] = bytes32(uint256(uint8(hash[i])));
        }
        return publicInputs;
    }

    // function _constructPublicInputs(
    //     bytes32 ownerHash,
    //     bytes32 domainSeparator,
    //     bytes32 hash
    // ) internal pure returns (bytes32[] memory) {
    //     bytes32[] memory publicInputs = new bytes32[](65);
    //     publicInputs[0] = ownerHash;

    //     for (uint256 i = 0; i < 32; i++) {
    //         // Process domainSeparator
    //         publicInputs[i + 1] = bytes32(uint256(uint8(domainSeparator[i])));
    //         // Process hash
    //         publicInputs[i + 33] = bytes32(uint256(uint8(hash[i])));
    //     }
    //     return publicInputs;
    // }

    // TODO: domain separator may better have address(this) or other siloed salt
    // suppose one person uses one private eoa as some of private signers in a Safe on a chain.
    // observers can tell there are essentially the same signers in the group
    // but it's challenging to put the pre-computed address of the signer adapter
    // into ownerHash that is a param required at initialization
    // a walkaround?: put a value the private owner can set is stored in this contract
    // function _getDomainSeparator() internal view returns (bytes32) {
    //     return
    //         keccak256(
    //             abi.encodePacked(
    //                 msg.sender, // safe
    //                 block.chainid // chainId
    //             )
    //         );
    // }

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
        return "PrivateOwnerValidator";
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
