// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

// forge script script/Deploy.s.sol:DeployModule --broadcast --rpc-url https://eth-sepolia.g.alchemy.com/v2/JG3mOl7GCd3oU_skAHEpl7qWDsoyitZA --legacy

import {console2} from "forge-std/console2.sol";
import {Script} from "forge-std/Script.sol";
import {UltraVerifier} from "src/validators/password/plonk_vk.sol";
import {PasswordValidator} from "src/validators/password/PasswordValidator.sol";
import {Safe7579SignatureValidator} from "src/Safe7579SignatureValidator.sol";

// forge script script/sol/Deploy.s.sol:DeploySignerValidator --broadcast --rpc-url https://eth-sepolia.g.alchemy.com/v2/JG3mOl7GCd3oU_skAHEpl7qWDsoyitZA --legacy

contract DeploySignerValidator is Script {
    address deployerAddress = vm.envAddress("ADDRESS");
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    UltraVerifier verifier;
    PasswordValidator passwordValidator;
    Safe7579SignatureValidator safe7579SignatureValidator;

    bytes32 passwordHash =
        0x032e60c0d43ea621d6f898a9596f7ca72cb6c127493094d691c032b66fa1f056;

    // function run() external {
    //     vm.startBroadcast(deployerPrivateKey);

    //     verifier = new UltraVerifier();
    //     passwordValidator = new PasswordValidator(address(verifier));
    //     safe7579SignatureValidator = new Safe7579SignatureValidator(
    //         address(passwordValidator),
    //         abi.encode(passwordHash)
    //     );

    //     console2.logAddress(address(verifier));
    //     console2.logAddress(address(passwordValidator));
    //     console2.logAddress(address(safe7579SignatureValidator));

    //     // 0x3A3C512bB2c96331D3f6E9ca6d3e484E80adA8a3
    //     // 0x6c10f1B3aA8Ac413decb1C75116e43FD8BCFFfaf
    //     // 0xe30e892F0c2C571aC94F9cBd2754B1285E29e861

    //     // 0x29AD8548663b07807180a04E3B3943984b1CAFCA
    //     // 0xAc1c9DAac25f4BB101437903E3EB4Be8031d1EBd
    //     // 0x6C75bcD0F0c1A0ac23bE69e5CF10DF20C405f1C6

    //     vm.stopBroadcast();
    // }

    // with already deployed verifier and 7579 validator
    function run() external {
        vm.startBroadcast(deployerPrivateKey);

        address _verifier = 0x29AD8548663b07807180a04E3B3943984b1CAFCA;
        address _passwordValidator = 0xAc1c9DAac25f4BB101437903E3EB4Be8031d1EBd;
        address _safe7579SignatureValidator = address(
            new Safe7579SignatureValidator(
                _passwordValidator,
                abi.encode(passwordHash)
            )
        );

        console2.logAddress(_safe7579SignatureValidator);

        vm.stopBroadcast();
    }
}
