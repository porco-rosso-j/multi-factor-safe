// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.25;

import {VM_ADDR} from "safe-tools/SafeTestTools.sol";
import {Vm} from "forge-std/Vm.sol";
import {Test} from "forge-std/Test.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {console2} from "forge-std/console2.sol";
import {ISignatureValidator} from "../../src/interfaces/ISignatureValidator.sol";
import {ISafe} from "../../src/interfaces/ISafe.sol";
import {Enum} from "safe-tools/SafeTestTools.sol";

contract TTest is Test {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    bytes32 private constant SAFE_TX_TYPEHASH =
        0xbb8310d486368db6bd6f849402fdd73ad53d316b5a4b2644ad6efe0f941286d8;

    function test_genSaltLocal() public {
        address caller = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        console2.logAddress(caller);
        bytes32 value = bytes32(
            abi.encodePacked(caller, uint32(block.chainid))
        );

        console2.logBytes32(value);
    }

    function test_genSaltProd() public {
        address safe = 0x4d8152386Ce4aC935d8Cfed93Ae06077025eAd9E;
        bytes32 domainSeparator = keccak256(
            abi.encodePacked(
                safe, // safe
                uint32(11155111) // sepolia chainId
            )
        );

        console2.logBytes32(domainSeparator);
    }

    function test_genCommitmentHash() public {
        bytes32 txDataHash = bytes32(
            0x0000000000000000000000000000000000000000000000000000000000000000
        );
        console2.logBytes32(txDataHash); // safe tx hash

        bytes32 safeOpHash = keccak256(
            abi.encodePacked(
                address(0x09d4E28B9710c097A14A46099De60FBaACE8f492),
                bytes32(
                    0x3bdea30bbfc5b7ad564b0bd2ae76bbf432c055feb740e1919bf225c7db7e0422
                ),
                txDataHash
            )
        );

        console2.logBytes32(safeOpHash);
        // 0x4c8c4130ac8e80c270afbafddb66225e64af8156cd204132afec9d76067a0695

        // correct, on-chain,
        // 0xc489c65f87752f28b34626904a10fd39825de3224fbae999d1f851f737b972f6
    }

    // forge test --match-test test_isValidSignaturePasswordSepolia -vvvvv --fork-url https://eth-sepolia.g.alchemy.com/v2/JG3mOl7GCd3oU_skAHEpl7qWDsoyitZA

    function test_isValidSignaturePasswordSepolia() public {
        address passwordSignerAdapter = 0x6C75bcD0F0c1A0ac23bE69e5CF10DF20C405f1C6;
        bytes32 safeTxHash = bytes32(
            0x9265d2ad62d35991bea02265c8f8749b3f0999af36c7198753b53c22f87a7b3b
        );

        bytes memory data = abi.encode(safeTxHash);
        bytes memory signature = bytes(
            hex"1da89d706970ee3bb81042b7970fe7c7c8a8742eb6f227741e23800e8fe1db0f1b28e792ace8f8e28fd04d5f9daf4858fc39f769d562b0c6c4078eae95e08679066e87a01183238eb28cb744a00416f4730052defd85bc9b6d973af59c23ba0d061b13ac50c0286b5b6c380c272f34415b7073a52d0f216ddb95c71c7be8de881642d274a45fa70e6365f01bb10b2ab023eb05d6c448a646bc1927abb6a142111f4b03bb7ae6d5ce02b35d242fab53cfca78aecb0dbd2f32eb611f90ad3ee2e41f9f60745ff65ae17e2e0f61a773dbb20e397d3b7a136c90f88fd4bd1c25565c284fb599487da230ee5c577cff9724d08c7bbac62b23e2e1955906cb07da0d380a968216f3f0ab6c0a274b079c3e6e9c4f4dbfd17ecb0dd0725a5cde66422b9815d622cec09dd85b6ac3881da6c075b646ee278c26657f172ff04369b05ef03000fe26afb0381d3934c455c7292c8901ddbbf7ea63eb9773dadc1c78f986ea5009bb204027266dfe14802362ea7921d46d5b677ddf87a33e4cee757b46f285c32bff2274084a85f69f6a60648c665f6a34868acb5a15468dfbe6b9998ddc0ae62f768c7319d3b6be7188331d8dd320d92eafdea8e5117cebdea59ca94a692c7e2072eed688be71bdb4cc63b32914772c57b56b6c677a030bbde912bcfb9bec1b2f36de09045d3d1583560ba8b630e2293bd84ccd1192232b617aac29ca0351da0649f4270c8a584c7996591cee9ba66c078ca35eade40b6a4fc5109aa0c1c0d21739bffb5e772a2438d158ddeaecb7f26249df8c56e774b92fd286f33bd2d76a0fe8020f892ee501387d2563eb939cdcfe95cb747deae790d6ce010948f1ea1f069660ff8a94d44febdd8cbda410f8d4d7038d96952d410f60e9820b06574d1108db3d912115f516682d8cdc21bcb0b850344fd90f8d33a4a6e3e84c8abe840b10935ff30c356c2e1e3bc79b8675ee29deed26d38fb4ff40b2da8a7657f1022528dc8991aee82797e5907289a96992a9445ed221d1d3aa232fb03f680a24cc6328baf5d47240362ffb042c96b96223d4445d7caf8f46e36753c3bbdca39d73810581e6027bc2bd70fe771731116e0ebf1cbbcd5d652d11d7d9ed961303f9010b25f2859e2fb291bd83cbe1eea040d5abcf53d292ba5d1306619e7ab0328a63d0108e373965994b95df1529d2492af73fd5558dc85fbfb4f217dd246d339afd6f166885469f03314dafd32cd91fca9dde9fd4102f1138b5204c2ee7faaa312ca525880a81fc2f1dd071f8f0adb03cd5324f9f74d756caa02c9b8ac4a7d4e3917d1977bd8ad47465c9057b28f235a354e59e2dddebeaaea06c8f4e0521e4cbce68098faae87cc4e2a7f20237226d51667491fbbe55b1d08a13de5902f6a888af7a1bd62e081504f03e8211fefbb4a07249707b9729c052ead3f3ffaf3c8594365b150834d9dc0f5a5947ce33a74768358a6f1e1fbb7ec4026a2af0a9bb42d97eb22b2d00e3e0d4a90af35f1762e653621418fe6ea98b940ad4687612818c5fe0f603788008b5a8371d19ed1410ad70650021d1999d23e39eeacd4b2c227a36230719482c08278708f320548c5523d99b389c874396159a9e144695e55309ff4b560e82a9b7994d8cf19b437d947bb3329c2197728daa1427f9a572c23883f30b1120b338f48f3a38bd70cab7a8c5f4413ce40b17edff7590f64b50e84ea1c2fca726d4a2cf1d1090a33672c8259dc155a44d6d09200fe7d5f681cfbc88e8d02bd70e271d7f91589debedd2eb2fe37262f36125b4f6c801a94aff41c8a453971b7513c65eaf7a45d5ade1cf22ea211d10d91b040517f4babd954e2d2067cc0135151736bae9f562c9c4b10078549ee7ca9b6e4ce2e11ca5a0007d75a47729fce39e22b9c76235c8758b47ad267bb99ae1f02c84cfd6366d1ad3a32f27d0991e6a1e21bd06e6c9993efa8fc192472764c6f9a731a8750a1f65b1240895e3ea75ae7005f42f92853983df31afc01edcc1ea0e14acb2c139e076f3b232c30f26fd87f01fa2d2a01666ce82512cdb79fcf1814cf7e448a4da787fda21690995562e15620c473444dca5ebbc37978eb22dcfd3363e968e08eade63f28b81ae747bb9af983060988a84031223e33f3d851414908997de3ed8363ff307561edcfdb37d2b60134a16ed1c928895aab7837892d6b22a3b32ed8cd612317c74a79179861c4b57199d25136f8223c037693032024118c0f8d7d73ae4e7920f3ef9ce575b2128d700641c8e37324cadaedc84142f39f0a62743833b2a795da1d618da0794282d1c15759d7fbb6f1286ce6bc70b6003475eb8609f0b2ab7adaba9a88d3f582a7d1923ee8a68875fe742ac6346ec42026359fce65f530e1cc860ae6dfa027be910e029e90b503986b65e3ee641f78abb50d843cceb09d4c3965d374f095131530e942e4d50a64b2470771a91a83b22faeaba7cf8634318ec487d00da3238b595332213346a4f9f32f0e673840b37953326c43d426bbf68d0f4bc9a71be9b495ed7ef099adf7772a42cf73e80988a3719730c1acb706a15b303403eb0ed8364f4a2fe287d6a8d2ce313fd0933429c4d15777e3e65e7949a4c047de920f870fe975cb60282afe35998b82f1ce44e7182cdb88a27123bebb701220f8cc5f18cd8b97cc527c5e80d954d83eefeadae2d4f5bbee85305de2b39ebe9467f197e76425dfaff0efdd03fa9d334339964c58730728093fc4e288416cd52c4d39627f9d4a0617612bd59f8e7383b3c98a44ddbc450ea432c7e0afbce97487c9d31a73b876260d2244ae691e41e24cf355305903de7449437d0b592ce911f0eedf8de43dc24cc362a5d6172ecd9d863a9c0372311ef79a8f73fd0c4ebcf1ea5f47158c361e1b5b4022ca0c0b87514d22526b77f52cd3855261a5b9949ae18dabdf465a4dbb105580278e695587d28cd36db84a34b0f238c648d5ab58c875387cdd04bf67a60e38d0fdf5a84e82c2782ba6b55bf2546d972322e31a49e84624d8e704b753b2537d1"
        );

        vm.startPrank(0x4d8152386Ce4aC935d8Cfed93Ae06077025eAd9E);
        bytes4 ret = ISignatureValidator(passwordSignerAdapter)
            .isValidSignature(data, signature);

        console2.logBytes4(ret);

        vm.stopPrank();
    }

    // execTransaction
    // forge test --match-test test_execTransaction -vvvvv --fork-url https://eth-sepolia.g.alchemy.com/v2/JG3mOl7GCd3oU_skAHEpl7qWDsoyitZA
    function test_execTransaction() public {
        ISafe safe = ISafe(0x4d8152386Ce4aC935d8Cfed93Ae06077025eAd9E);

        bytes memory signature = bytes(
            hex"00000000000000000000000009d4E28B9710c097A14A46099De60FBaACE8f492000000000000000000000000000000000000000000000000000000000000008200a87cc55e794e12dc5ad4e86383d0dede0071febb24c5bc965d4567d1a704f8ef7bd49ca1fa43d1833b2dfeef341583a504027ba354b618fccdfde8f64de6f87620000000000000000000000000000000000000000000000000000000000000086016cefa1710e4b8fec84850afd383a118cbdedbcfa7c2fc0e3fb6a514f3fa5e0008784cd4a037f25acdeb88efe6702e4981f58d802ed590b6704b41255e6825be048eae2aeb0f730a6836908828504cacc93a93d4b4be9697bf3a69fd74af36f41c036d1d2f2e59f048cfb1bacbeafd31cb2b7e4e2e6a9ed3b693d9010c1c0a6407fba652a0539b72a1b49a9eeac800ec882113f22b082960b8b9c53f0f54a6c01ada0cd159317150ed9807e331d89042fe39566c2d9a8fec38fdd5c08647a78409eb9e8702b569c1865fdeb9ddd5e4f7accd9742d32618e7b5e84891f234f2221d12052034f17c0c0e30771f60a700016931690cc5cc274e4d4d774741f7bc7d050930134502b5ebbec5224c8934f96c747529f1746f23f92a0daf117e7c19e62933a4a7e97da62840e5098b20cd5599ca1998a4a2dfc0720a7439d96da64526194beffae955ed55ffb10451afdda5664724f7bfec12297e15f1fb6139137b301ea67519cf4c9832b555ec5a31c43b26bab6fdd9c51f0661430c1d06292bc59003de7aafef498bd74a32f6109904070abe4f6a21d4a0531227521687aeaea50804605a03481e17a255732bf4b76e0184b04db50f03df0a2a0217043b9c7db98c1f67f13f140bcc954778ba9061817d7fd9d1015098d710ba6007f157a66c7cab0cc563eb2e3f60b61eef0704686e672ed518f1941a0f07d88787ee212eadabc72b1cd3ed3fa6aada072fe5ec2e52d65d550f255219e02a574368ba69f31a254f17005de5c9181caab277dc7a1d645a8a53c3b012fdc42e4813c6850f5530eb9d058d51f34b24b6a815de51f78f9f84908cba54a9aa6cbc5003bd1a4180ded84114eddd19041ad5135d5c96091d69de77c48280a52ddef03995c84f2da0a9669713146bb31f677f3f99692b07839ed1df40d4a9cef0c56a62efb8defb7d632bb3277ebe95cbc01d4edde29613ad6bd80a970b7ffd2df883da3cc518a6491a38852cf34ce0d79c58b5546b68841162e1e7522b3bd5717f381d67f6f8ddcbef285b073c22c4bbb0a9cd5a1c506413af9c7b554215b68ca4c229e328d719be7db81216ae6a85a410c47186b6f87d9963520c045d9af23a2dda6cac46bfbdab940fe92657ab075403dfb6cffeb742c7ef7b65b44250270434aebec813194a1215ff6d0aa4646dc43654a04745d3960477732ec9746d48862f3bcdf996b5c2b917a44e2cf12d5fb43a8e3047fa732ca0a2d885c1ddb9653d6ae04e8ed20579ee27405d2f6b5410995f348feb789f3f8e0be3d0426fc43f3b656ad716e08ee67025d8ef217e8ba95fc9236afcb05eb4ed8dea60931ccc6d99e7db8626a45e47a4371afa06a854be71760062f234e54a2ea47cf5f45c615350171473ae78f85efb0bc144154b517f4b1f4599f1f6c82a7d827952a4a4767765867ffa8efe7189781baa8810bfb94503c420593aa82f192124b3943268b0ade0053dbed54eb9a1c79fe1972cba4a28d039d28eae1a0233729c786d6b3f13ac6c84560b7155d08171f6b45d114261f2e4982a72b859e11b08766e78bf985dc89695feaa319c63b74c2aa67b20d05e831ad0c89e1ee5f932efdd29e3a205c73ec6dad58b27f130d968dc7aa92aadc8262006a454af6752f7188209d6235f9138668dd751d53c8ff49e11ab851df8eeb82b6353e1e42a842bba1595e595273cbb2a63f8eb949a2b4980b17cfa2845f81deb540f96097e21d21afc224bf716b0662939d2c35983c77188a9d6522e8459496433c4e4d06a46ccfcdc6c570a6e20a8de5d07717cc8fff309624777040d209e25e8b358d27cf8f1e0545a7aef01742b8ff21ccbead4e3ece4b41b1425cdf8aa136ec29db5b849ce5053ea6213ec5bc0f4c3838957d0065345ee574924f7c5b87df082b46f31ad58765efebc5aa5e9b2e0fcf783cfef48b2e4c7e56b0e656d789de8216c33e985984ea36e48bc36ef2e65a3ae5237662abcf4ae2c07149d75f8008beca7ef29639f9d49fd25e52426523d84face02ee3e83fa1e512d16d8cf86c315bc19d29c52999f6f056e9cf6cba73a87333c46b4866e1c0999a81892ff81a1ad8ce58953faae848783ad926737f54c69008f90ad4e0ddc0b0f272b88bf7a441a8bba33984f1971fd7d20c0768a4ccd0662dfdd9f2577c19ff5bf036acd87f51928f6c25601097b2507155b0dd4debab5000ef5b4bbf28e219ad00e6eba4b0663bca71cfa696769b245e312d83e2cfea39170d88068d3f273f6cc197d7e98bc1e9f3d8387af514da04eb0c38691d268456647032a541fe47ad8fa022abd89c98f04a336e02d6c15d64047aaa5ee550662ddc30e8274185d46403c1f8702a8af5b08c24b3d5fb3394485575c343ce5b36fe08bd9aa019b40342dbe00a16d43ed1f6bf74f7d2e64a3ef76de353760c1a9251f3c65b4547933b2735e2b5e5d983d99ca726817d0f3d946c2177935357705f9c4424027ecfbd80b59382c5da207b3e6d6ed6afeb6244532df2a1f7e63458d61a2046d7e8ee3dfc817c721d3bcba9172b5b957bad05e6ce9167db7e3b4114351af14be8f170beb45e2a20142ff5407dcb4fa2b952e8a6deb63214a83ce679c7ec946f461e7d656c887f109da8565205ef2835d9b7c3db4513746857a80d3cd2c4d854f5889413bfaea0d1e1f7cda75709638c2d29063087ecbf799ed28a642ce4501380e46e31d1ddee517349f3c29b79fcaa80c82a5126fb209100e68c18fd3ed24cbfdb1a41714fb26145cb1c3032d19017531991c3ce5c455cfd62447606e727f73f7c34685f8e5a01a1025d8af4b877d4c68e81851bc15eaa7d238c1aca304db479db0f4f27e8b0a17ab04e51a9a3463e65746478d488d2aa4912a1274b388682cdead8f209c52ed28be2bcaa303f6875f8979c4c8a35876d9e276c1888d0ec79bab66ecab7f07d90f102b63016e3efb3f05ad1606c3ca6f34371343b0b5e03fafc5d6abd3ea6c0127bd61b20ab2c0d28d4fec801c51a8542ede3e1dd90c5cd533bd8d3d7f6fa211"
        );

        bool ret = safe.execTransaction(
            address(0x91A399E2F7B768e627f1f7Aff2Df88bA73813911),
            100000000000000,
            bytes(""),
            Enum.Operation.Call,
            0,
            0,
            0,
            address(0),
            payable(address(0)),
            signature
        );

        console2.logBool(ret);
    }

    // // forge test --match-test test_getK256Signature -vvv
    // function test_getK256Signature() public {
    //     // address deployerAddress = vm.envAddress("ADDRESS");
    //     uint256 privateKey = vm.envUint("PRIVATE_KEY");

    //     (uint8 v, bytes32 r, bytes32 s) = Vm(VM_ADDR).sign(
    //         privateKey,
    //         bytes32(
    //             0x032e60c0d43ea621d6f898a9596f7ca72cb6c127493094d691c032b66fa1f056
    //         )
    //     );

    //     bytes memory signature = abi.encodePacked(r, s, v);
    //     console2.logBytes(signature);
    //     // 0xbf26330415a5eb86b1daf960c56a568ba9bb5b242c64e41eced58366796e82bd1fd0a574bd3893d233c3d4c2bc63907704ce75a1a115b5c6d39363fa629a3a191c
    // }

    // forge test --match-test test_getK256Signature -vvv
    function test_getK256Signature() public {
        // address deployerAddress = vm.envAddress("ADDRESS");
        uint256 privateKey = vm.envUint("PRIVATE_KEY");

        // (uint8 v, bytes32 r, bytes32 s) = Vm(VM_ADDR).sign(
        //     privateKey,

        // );
        bytes32 hash = bytes32(
            0xa29873d0d92580fe336372e52d0762aedcbefdf05e4eca4b37cafb2a4d9d49c9
        );

        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        console2.logBytes32(ethSignedHash);
        // 0x91ab97ad2c0931d0f7ca11bf3df933740342135737468935c75cc6fc4dcd7ca6

        (uint8 v, bytes32 r, bytes32 s) = Vm(VM_ADDR).sign(
            privateKey,
            bytes32(ethSignedHash)
        );

        bytes memory signature = abi.encodePacked(r, s, v);
        console2.logBytes(signature);
        // 0xf0f140755cdb9a75d19637e1f57e40153e0c5b9c50fb59b4e935a33a344ea0063b869e0b8f5f5bb68c6ef038d93d855b1bef9d9529c2440aefd5ca0c9fff2e2f1b

        address recoveredSigner = ECDSA.recover(ethSignedHash, signature);
        console2.logAddress(recoveredSigner);
        // 0x91A399E2F7B768e627f1f7Aff2Df88bA73813911
    }

    function test_signMessage() public {
        bytes32 hash = bytes32(
            0x5e09f329248597177bf930dcfcfab7c36937b0b290c95e06027c6b055d708bb4
        );

        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        console2.logBytes32(ethSignedHash);
    }
}
