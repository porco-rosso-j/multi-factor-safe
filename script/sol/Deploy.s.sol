// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

// forge script script/Deploy.s.sol:DeployModule --broadcast --rpc-url https://eth-sepolia.g.alchemy.com/v2/JG3mOl7GCd3oU_skAHEpl7qWDsoyitZA --legacy

import {console2} from "forge-std/console2.sol";
import {Script} from "forge-std/Script.sol";
import {UltraVerifier as PasswordVerifier} from "src/validators/password/plonk_vk.sol";
import {UltraVerifier as PrivateOwnerVerifier} from "src/validators/private-owner/plonk_vk.sol";
import {PasswordValidator} from "src/validators/password/PasswordValidator.sol";
import {PrivateOwnerValidator} from "src/validators/private-owner/PrivateOwnerValidator.sol";
import {Safe7579SignatureValidator} from "src/Safe7579SignatureValidator.sol";
import {Safe7579SignatureValidatorFactory} from "src/Safe7579SignatureValidatorFactory.sol";
import {AadhaarValidator} from "src/validators/aadhaar/AadhaarValidator.sol";

// forge script script/sol/Deploy.s.sol:DeploySignerValidator --broadcast --rpc-url https://eth-sepolia.g.alchemy.com/v2/JG3mOl7GCd3oU_skAHEpl7qWDsoyitZA --legacy

contract DeploySignerValidator is Script {
    address deployerAddress = vm.envAddress("ADDRESS");
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    Safe7579SignatureValidator signerAdapterImpl;
    Safe7579SignatureValidatorFactory signerAdapterFactory;
    address signerAdapterFactoryAddress =
        0x2BC704F24B9c047E157dFf95C8595e0d9e5938FD;

    PasswordVerifier passwordVerifier;
    PasswordValidator passwordValidator;
    Safe7579SignatureValidator passwordSignerAdapter;

    PrivateOwnerVerifier privateOwnerVerifier;
    PrivateOwnerValidator privateOwnerValidator;
    Safe7579SignatureValidator privateOwnerSignerAdapter;

    // https://github.com/anon-aadhaar/anon-aadhaar/blob/v2.3.1/packages/contracts/deployed-contracts/sepolia.json
    address anonAaadhaar = 0x6bE8Cec7a06BA19c39ef328e8c8940cEfeF7E281;
    AadhaarValidator anonAadhaarValidator;
    Safe7579SignatureValidator anonAadhaarSignerAdapter;

    // -s runDeployFactoryAndImpl
    function runDeployFactoryAndImpl() public {
        vm.startBroadcast(deployerPrivateKey);
        // TODO: factory is also supposed to be upgradable
        signerAdapterFactory = new Safe7579SignatureValidatorFactory(
            deployerAddress,
            new address[](0)
        );

        console2.logString("signerAdapterFactory: ");
        console2.logAddress(address(signerAdapterFactory));

        signerAdapterImpl = signerAdapterFactory
            .safe7579SignatureValidatorImpl();

        console2.logString("signerAdapterImpl: ");
        console2.logAddress(address(signerAdapterImpl));
        vm.stopBroadcast();

        //   signerAdapterFactory:
        //   0x2BC704F24B9c047E157dFf95C8595e0d9e5938FD
        //   signerAdapterImpl:
        //   0xf26b6B0EAE94a6cF5a9CCa6a36AbD8909a5176c1
    }

    function runVerifierAndValidatorDeploy() external {
        vm.startBroadcast(deployerPrivateKey);

        ///// Password /////
        // passwordVerifier = new PasswordVerifier();
        // passwordValidator = new PasswordValidator(address(passwordVerifier));

        // console2.logString("passwordVerifier: ");
        // console2.logAddress(address(passwordVerifier));
        // console2.logString("passwordValidator: ");
        // console2.logAddress(address(passwordValidator));

        ///// Private Owner /////
        // privateOwnerVerifier = new PrivateOwnerVerifier();
        // privateOwnerValidator = new PrivateOwnerValidator(
        //     address(privateOwnerVerifier)
        // );

        // console2.logString("privateOwnerVerifier: ");
        // console2.logAddress(address(privateOwnerVerifier));
        // console2.logString("privateOwnerValidator: ");
        // console2.logAddress(address(privateOwnerValidator));

        /*
        privateOwnerVerifier: 
        0x9FAc2Bc1f0575883d2F24A29ebC6987502fa1432
        privateOwnerValidator: 
        0x86b185121035AbcbBc186a6ba442ecFbe9E23f0d
        */

        ///// Anon Aadhaar /////
        anonAadhaarValidator = new AadhaarValidator(anonAaadhaar);
        console2.logString("anonAadhaarValidator: ");
        console2.logAddress(address(anonAadhaarValidator));
        /// 0xd1B1602f3a801A7Bb1076170aC3b65d39132ae2e

        vm.stopBroadcast();
    }

    // with already deployed verifier and 7579 validator
    // -s runPasswordValidatorDeploy
    function runPasswordValidatorDeploy() external {
        vm.startBroadcast(deployerPrivateKey);

        address _passwordValidator = 0xAc1c9DAac25f4BB101437903E3EB4Be8031d1EBd;
        addValidatorIfNotEnabled(_passwordValidator);

        bytes32 passwordHash = 0x032e60c0d43ea621d6f898a9596f7ca72cb6c127493094d691c032b66fa1f056;

        address _passwordSignerAdapter = address(
            signerAdapterFactory.createSafe7579SignatureValidator(
                _passwordValidator,
                abi.encode(passwordHash),
                0
            )
        );

        console2.logString("passwordSignerAdapter: ");
        console2.logAddress(_passwordSignerAdapter);

        vm.stopBroadcast();
    }

    // -s runPrivateOwnerValidatorDeploy
    function runPrivateOwnerValidatorDeploy() external {
        vm.startBroadcast(deployerPrivateKey);

        bytes32 ownerHash = 0x137ad2247d8e089ca5dc03f9a70e5bc68392ac2916495968a80c35582c1a3c37;
        address _privateOwnerValidator = 0x86b185121035AbcbBc186a6ba442ecFbe9E23f0d;

        addValidatorIfNotEnabled(_privateOwnerValidator);

        address _privateOwnerSignerAdapter = address(
            Safe7579SignatureValidatorFactory(signerAdapterFactoryAddress)
                .createSafe7579SignatureValidator(
                    _privateOwnerValidator,
                    abi.encode(ownerHash),
                    0
                )
        );
        console2.logString("privateOwnerSignerAdapter: ");
        console2.logAddress(_privateOwnerSignerAdapter);
        // 0x7b3594D7aa7182A5767Cd5b44bCc2Aa8F7582E36
        // new : 0x2A8edc02CfDc67baE006a21D4A4F1650420595d5
        // new ( no domain separator): 0x2a52159E1C78b4c0bBC3340BfcFAcB273A129fcB

        vm.stopBroadcast();
    }

    // -s runAonAadhaarValidatorDeploy
    function runAonAadhaarValidatorDeploy() external {
        vm.startBroadcast(deployerPrivateKey);

        uint userDataHash = 7946664694698614794431553425553810756961743235367295886353548733878558886762;
        address _anonAaadhaarValidator = 0xd1B1602f3a801A7Bb1076170aC3b65d39132ae2e;

        // addValidatorIfNotEnabled(_anonAaadhaarValidator);

        address _anonAadhaarSignerAdapter = address(
            Safe7579SignatureValidatorFactory(signerAdapterFactoryAddress)
                .createSafe7579SignatureValidator(
                    _anonAaadhaarValidator,
                    abi.encode(userDataHash),
                    0
                )
        );
        console2.logString("anonAadhaarSignerAdapter: ");
        console2.logAddress(_anonAadhaarSignerAdapter);
        // 0x90d648969AaCCBbc56C22cfCf8a41765820EBe9d

        vm.stopBroadcast();
    }

    function addValidatorIfNotEnabled(address _validator) public {
        if (
            !Safe7579SignatureValidatorFactory(signerAdapterFactoryAddress)
                .getIsValidatorEnabled(_validator)
        ) {
            Safe7579SignatureValidatorFactory(signerAdapterFactoryAddress)
                .addValidator(_validator);
        }
    }
}
