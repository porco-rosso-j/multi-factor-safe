// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.25;

import {Test} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {console2} from "forge-std/console2.sol";
import {SafeTestTools, SafeInstance, Safe, DeployedSafe, SafeTestLib, Enum, Sort, VM_ADDR} from "safe-tools/SafeTestTools.sol";
import {UltraVerifier} from "../../src/validators/private-owner/plonk_vk.sol";

contract PrivateOwnerTest is Test {
    // Password verifier and validator
    UltraVerifier verifier =
        UltraVerifier(0x81a2F0DbA20f5F7e099856Aa9BCcD3014FC23F54);

    function setUp() public {
        /// setup validators and signer adapters
        // anon aadhaar contracts and validator
    }

    function test_verify() public {
        bytes memory proof = bytes(
            hex"25962aea7e0812dcc53d3c358179c9aec791a8b662ca4145d49789108770497e29a8c356508a399f22dbc35b3f36ae45fd91cc54feceeb551073f356d18bc0e82b614fbb37b68cc452cd26d50b34adcd13aace73d94579752539e77f8b2c39b40b6ab9d8a631292613dddc469a53609787dd6988dd092ede47960fc3e0dab7500ebb4212b125b714f41edd6dfd4c510553b7155919e1a3523d5783e77c7d6e3709fd84fd92fc54e92e60e0711fa7ea1859f8b2069ae57c92105c6d3a7ca91e1327fe24ac4219edad7f277723819ffec11b6ee6cd2ae8a860d66339a43e3516c10529e98f107ce88f490b303c75818e2ff920a58842844bf53568e31e030e072626b940fde8713e3ff745fc8139f6010acd74d37e48e17d99382f3a125f8cfdb82d679db45e2e7d550b5c2c4a2a396308abb246cf89e3dc98cd5288fd348d63aa10785800ee0cf43bf683f5ae87d45759d62bac1f536f1eb329be2e7ff98054b311f1742f5eb073d7b6850b62bf43a10d4bab5b114a146d11c4f59740a558252a2fe59d09235be270373c0ce858b43afb90fea0abf1bda055fe97be42030c16c11a29dc38d690d04aff025a4546042d1927ac356a83821992b1a11390a8f783ef27830fdf4173fac78015a7bb13e929b2811b6693d7bea718bb8f64bd2c2653642cfa3f4601c68ff1d47ddf067077e8c3e625b40e5c47ce5cba0e4cca5b6d73302375ca036cc4a062bf349ae01f4fc3faa305def7b90143d3495eeb3d33e632ee2802e33daa9500309a565e8abaa236ccecf86130be8868f5319b48090898caa20c5ae389d89e504d44175f3ef8869107bb786fedf5905463e8da47c29b19ba0e24e8d640434946b71b2a2777c7fa00d7c642bbae5b934247f575c6b7c3152dc00c6b85bcf93f2674338671892ab5d5dd90997fb146268de20badf2628810247c14f67e038d58aca1d33867abd4580d4a0d8826021e9cc4fa57e295f4101f24ff0b67f25c004830131d388a60164e182ab85fe923b672cf1756c7d25f14459302084720d0d4466c7c05461cac4f4494bd004a4ca64f782debdba4372b06d507fa2996f297cfe4e97019f42c9171d59cb2e9930097e20c3d1df82d6c8ce8f8e3f32867c48aac4d0cc4b4077e952d61e7b167dff50406fc84d4bef2732f3539c5910a147be52053639402096f686bf361a3e18ee1d652e5e0dbc51117f1487e86250d62c306ed4837e42ce6c791d002e6cda6c3a2d50b6e0aaebca09db86199789a29c26c9e367de1e33533660cc2c49d42f948ee79ad0afd82c39efc99ab299d0e14946bfb3e3383a02795ce5261fd5dc93c8fa20dd69c737dcfb529440abec13d096c6c336f61d4605b7d3adff6732f84ef9bb1ed378360aa95974b88bb5914c82987df398394815763b48d0be5e5596126fee122fc919380cde538198c11e6f0198a28d3e85f9edb3c5d64534efc82317c21ab150017d045eea20fe440a864dd140bd1ee1adddd65671f9fd0c49807de01a3ba8658ea6c995257cbd6d96c872f2c732e6ee9d74ec6d294dc0a2f17165d21a7ed5ae9ae6139125436970b34bfc90edbe9e46a4aa3432e2803eece195a4ef9d1329ca529ec74de6504e6c548f76a1ebc7f3aece77b92ed695f6d9849bd0da0c1ef14cee7b2f4860ef80ff96385be127570c325a198f2d98cf30cc6391b5511f302c6387d9e1ce360c3a3abb9ef2307c6f5926945d763bb8baf76662fbc9d1ecd27c671dbfc2d4c9887cc94dc802b12c918e78fc62dfc97a757646b7ff22ceed1f5a67bbc6572bba335ddbf1b4f212ab8292066a3d764d5eb6ba471652ecd7f61d7a34b06ff26389856738ada7ca127ebe062af40ee02c07ebb6a83aaf0f0aaa1fffec5988bee6764194e7ed9dba32369103addd63f823ff5dea3e97f49ddc7a59a2e9146879afda685a07449587921594af71327cee892fd5f1c04c6c9203e7704d0871ce351ceeb242298bec89324218d39433ecc7b6639072760e8a8dccbf0847760439b5f479afc4afe25cb9825c1f14952a76034d8c1b2d9116190cb994a4bb237d8aca4262727fa9aafc31b0753090b70bf246fa62eea7d7343f4b7e46cfe8c32049bd38bff04e4b1b612a9111ed71ed48dd41abce76ab7e049cd3aefe9f721bfce07dbbf5f2c44523b641411602c717c3719068a1691aa08e862781dfd412bb5c1713a641f71b6fd80e07f2b6c1ad1427d1b1bc77858bf219c80fae871aa9e6bf9cc38ac475eed36cb7f42168895dcb63e74efc722438eb4269f657d318e1f46222a4b14b17136612a51bf252a48e07eccfb7a5855e65e5817fb51bc727a6c61d47dd4cf1100b229eb18701a0c7daee0031a55b058b0772f030e3f0f5b3e2332301d88174dc62fcdbaee26086c7ff55b5146dfc392b137b18860eaab23eb7e154a7ec335dbb4a95160dcf32a65f46d0ca9e89dd61fbe48a1311e37a3388a47452137aefdd7a7bb37eb905f114b136ba7f4e81c61619e2a74e44e905978b56c12ce69400b1ce5673810372106d448b8e1f1b417dc9d49a43df0bd783e9d8adc79cb85d5399f2654c4feb5131653a626a98daf1d0a3332e0382039cfd3c7ffee600c34ea97f053071f4a9c7004b849e4e47003659f2478f146373e057527b4f25b58e920b8ddff6383b8977e2cbbc52c21af745a038e4d7784ccbd9d787bd6ac684e34dab7eb5e2f36673c9e0504249d1c5497e7ea331245d134bd04a86a0d0c3dae7ffaf4d363595e6b651f0022b4c1b0f0179aa1602d85b05af6740b64ee90bb74f0577462cd036f685c80034567a6e7d7e789cd89ac0766fc7b97cdf1e97a1eedb26e73051b630cbe42cf22998ef1f09214b069fe35f82be10b4ad1a4f9a576b9e8f5794a24dfa7812f201c8eaa2094d288586f87aa7f117f91039904dab857689e92bcf28caf8767d1f42934de783c47a61661830bc7248411fa21219da6c27cebbfe13514e3207267bb077896b1236c7e2b6eaf878bbc29c6084ee5758848941325886d8bdd89900fd5"
        );

        bytes32[] memory publicInputs = new bytes32[](65);

        vm.startPrank(0x4d8152386Ce4aC935d8Cfed93Ae06077025eAd9E);
        bytes32 domainSeparator = _getDomainSeparator();
        console2.logBytes32(domainSeparator);
        publicInputs = _constructPublicInputs(
            bytes32(
                0x261ff032949e8c78c678a9092b7c20553d94e58bbbf0964ac0500e76c817e00a
            ), // ownerHash
            domainSeparator,
            bytes32(
                0x71bae008138e7eb1bac7dbe82a31369a913589729cef2dedfe4c5c92d6b7d547
            ) // hash of safe mfa op. doesnt have to hash this in contract?
        );

        bool isValid = verifier.verify(proof, publicInputs);
        console2.logBool(isValid);

        vm.stopPrank();
    }

    function _constructPublicInputs(
        bytes32 ownerHash,
        bytes32 domainSeparator,
        bytes32 hash
    ) internal pure returns (bytes32[] memory) {
        bytes32[] memory publicInputs = new bytes32[](65);
        publicInputs[0] = ownerHash;

        for (uint256 i = 0; i < 32; i++) {
            // Process domainSeparator
            publicInputs[i + 1] = bytes32(uint256(uint8(domainSeparator[i])));
            // Process hash
            publicInputs[i + 33] = bytes32(uint256(uint8(hash[i])));
        }
        return publicInputs;
    }

    // TODO: domain separator may better have address(this) or other siloed salt
    // suppose one person uses one private eoa as some of private signers in a Safe on a chain.
    // observers can tell there are essentially the same signers in the group
    // but it's challenging to put the pre-computed address of the signer adapter
    // into ownerHash that is a param required at initialization
    // a walkaround?: put a value the private owner can set is stored in this contract
    function _getDomainSeparator() internal view returns (bytes32) {
        address thisAddress = 0x4d8152386Ce4aC935d8Cfed93Ae06077025eAd9E;
        //     address thisAddress = msg.sender;
        console2.logAddress(thisAddress);
        return
            keccak256(
                abi.encodePacked(
                    thisAddress,
                    // uint32(block.chainid) // chainId
                    block.chainid // chainId
                )
            );
    }
}
