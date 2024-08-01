// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.25;

import {Test} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {console2} from "forge-std/console2.sol";
import {SafeTestTools, SafeInstance, Safe, DeployedSafe, SafeTestLib, Enum, Sort, VM_ADDR} from "safe-tools/SafeTestTools.sol";
import {Verifier as AnonAaadhaarVerifier} from "@anon-aadhaar/contracts/src/Verifier.sol";
import {AnonAadhaar} from "@anon-aadhaar/contracts/src/AnonAadhaar.sol";
import {TestInputs} from "./TestInputs.sol";
import {AadhaarValidator} from "../src/validators/aadhaar/AadhaarValidator.sol";
import {UltraVerifier as PasswordVerifier} from "../src/validators/password/plonk_vk.sol";
import {PasswordValidator} from "../src/validators/password/PasswordValidator.sol";
import {Safe7579SignatureValidator} from "../src/Safe7579SignatureValidator.sol";

// 1. deploy erc7579 validator
// 2. deploy adapter signer
// 3. deploy Safe with adapter signer

// owner setup
// 1. EOA
// 2. password
// 3. anon-aadhaar
// threshold = 3

// safeOpHash == commitment
// keccak256(safeOpHash) == commitmentHash

contract SafeMultiFactorTest is Test, SafeTestTools, TestInputs {
    using SafeTestLib for SafeInstance;
    using Sort for address[];

    uint public ownerPK =
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    address owner = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

    // Signer Adapter
    address anonAadhaarSignerAdapter;
    address passwordSignerAdapter;

    // AnonAadhaar verifier and validator
    AnonAaadhaarVerifier anonAaadhaarVerifier;
    AnonAadhaar anonAadhaar;
    AadhaarValidator anonAadhaarValidator;

    // Password verifier and validator
    PasswordVerifier passwordVerifier;
    PasswordValidator passwordValidator;

    // Safe contracts
    SafeInstance safeInstance;

    mapping(address => bytes) public signerToData;

    function setUp() public {
        /// setup validators and signer adapters
        // anon aadhaar contracts and validator

        anonAaadhaarVerifier = new AnonAaadhaarVerifier();
        anonAadhaar = new AnonAadhaar(
            address(anonAaadhaarVerifier),
            anonAadhaarTestPubKeyHash
        );
        anonAadhaarValidator = new AadhaarValidator(address(anonAadhaar));

        // password verifier and validator
        passwordVerifier = new PasswordVerifier();
        passwordValidator = new PasswordValidator(address(passwordVerifier));

        // signer adapters
        anonAadhaarSignerAdapter = address(
            new Safe7579SignatureValidator(
                address(anonAadhaarValidator),
                abi.encode(aadhaarUserDataHash)
            )
        );

        console2.logString("anonAadhaarSignerAdapter address: ");
        console2.logAddress(anonAadhaarSignerAdapter);

        signerToData[anonAadhaarSignerAdapter] = aadhaarProofData;

        passwordSignerAdapter = address(
            new Safe7579SignatureValidator(
                address(passwordValidator),
                abi.encode(passwordHash)
            )
        );

        console2.logString("passwordSignerAdapter address: ");
        console2.logAddress(passwordSignerAdapter);

        signerToData[passwordSignerAdapter] = passwordProofData;

        uint256[] memory ownerPKs = new uint256[](1);
        ownerPKs[0] = ownerPK;

        // setup safe with EOA signer
        safeInstance = _setupSafe(ownerPKs, 1, 100 ether);

        // add anonAadhaarSignerAdapter as owner
        addOwner(anonAadhaarSignerAdapter, 1);

        // add passwordSignerAdapter as owner
        addOwner(passwordSignerAdapter, 3);

        assertEq(safeInstance.safe.getThreshold(), 3);
        assertEq(safeInstance.safe.getOwners().length, 3);
    }

    function testSafeTx() public {
        // construct safe tx
        uint value = 1 ether;
        uint256 _nonce = safeInstance.safe.nonce();

        // 0x87c539e13ad3f81ae01b641b37aa1df1a9bf3f765e08d1c69dfef95f4e0e2227
        bytes32 safeTxHash = safeInstance.safe.getTransactionHash({
            to: owner,
            value: value,
            data: bytes(""),
            operation: Enum.Operation.Call,
            safeTxGas: 0,
            baseGas: 0,
            gasPrice: 0,
            gasToken: address(0),
            refundReceiver: payable(address(0)),
            _nonce: _nonce
        });

        console2.logBytes32(safeTxHash);
        // 0x12bd7a332765c0c0efb5015fb23ec0654567604f547b0dbe0ca94b20ad5fbf40

        console2.logString("anonAadhaarSignature safe op hash: ");
        console2.logBytes32(
            keccak256(abi.encodePacked(anonAadhaarSignerAdapter, safeTxHash))
        );
        // 0x687f1fe30ca2db05608adc61300aa7073ba2492e9fa51d18844cdb99cffed07d

        console2.logString("passwordSignature safe op hash: ");
        console2.logBytes32(
            keccak256(abi.encodePacked(passwordSignerAdapter, safeTxHash))
        );
        // 0x87c539e13ad3f81ae01b641b37aa1df1a9bf3f765e08d1c69dfef95f4e0e2227

        // uint balanceBefore = owner.balance;
        bytes memory signatures = constructSignatures(safeTxHash);
        // console2.logBytes(signatures);

        safeInstance.execTransaction(
            owner,
            value,
            bytes(""),
            Enum.Operation.Call,
            0,
            0,
            0,
            address(0),
            payable(address(0)),
            signatures
        );

        uint balanceAfter = owner.balance;
        console2.logUint(balanceAfter);
        assertEq(balanceAfter, balanceBefore + value);
    }

    function constructSignatures(
        bytes32 safeTxHash
    ) public returns (bytes memory) {
        address[] memory owners = safeInstance.safe.getOwners();
        owners = Sort.sort(owners);

        bytes memory signatures;
        bytes memory signatureBytes;
        uint position = 65 * owners.length;

        for (uint i = 0; i < owners.length; i++) {
            console2.logAddress(owners[i]);

            bytes memory signerData = signerToData[owners[i]];
            if (signerData.length != 0) {
                (
                    bytes memory _signature,
                    bytes memory _signatureBytes
                ) = genContractSignature(owners[i], position, signerData);

                signatures = bytes.concat(signatures, _signature);
                signatureBytes = bytes.concat(signatureBytes, _signatureBytes);

                position += _signatureBytes.length;
            } else {
                bytes memory ecdsaSignature = genECDSASignature(
                    ownerPK,
                    safeTxHash
                );

                signatures = bytes.concat(signatures, ecdsaSignature);
            }
        }

        return bytes.concat(signatures, signatureBytes);
    }

    function genECDSASignature(
        uint256 privateKey,
        bytes32 safeTxHash
    ) public returns (bytes memory) {
        (uint8 v, bytes32 r, bytes32 s) = Vm(VM_ADDR).sign(
            privateKey,
            safeTxHash
        );
        return abi.encodePacked(r, s, v);
    }

    function genContractSignature(
        address contractAddress,
        uint position,
        bytes memory data
    ) public returns (bytes memory, bytes memory) {
        bytes memory signature = bytes.concat(
            abi.encode(contractAddress, position),
            bytes1(0x00)
        );

        bytes memory signatureBytes = abi.encodePacked(data.length, data);

        return (signature, signatureBytes);
    }

    function addOwner(address newOwner, uint threshold) public {
        safeInstance.execTransaction(
            address(safeInstance.safe),
            0,
            abi.encodeWithSignature(
                "addOwnerWithThreshold(address,uint256)",
                newOwner,
                threshold
            )
        );
    }
}

/*
 */
