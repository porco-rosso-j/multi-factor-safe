# Safe MFA(Multi-Factor Authentication)

Safe is natively signature-type-agnostic in the sense that it can not only have EOA owners but also support contract owners with any type of signature validations via EIP1271. This project leverages Safe's EIP-1271 signature validation flow to allow ERC-7579 validators to serve as safe owners by deploying adapters as proxies. This allows Safe to go multi-factor by tapping into ERC7579 validator modules in the simplest way in the sense that no single module has to be enabled on Safe.

The following diagram is an example flow of signature validation for a 4/4 Safe with three of them being the adapter contracts that relay EIP1271 validation from Safe's `checkNSignatures()` method to ERC7579 validators.

![Screenshot 2024-08-05 at 17 08 58](https://github.com/user-attachments/assets/ccbf5a20-334e-4f75-8e59-a097f6502149)

## Validators

This project plans to develop as many useful ERC7579 validators as possible, especially ones leveraging zero-knowledge proofs to offer greater privacy and security for Safe. Currently, we have the following three ERC7579 validators for a showcase.

| ERC7579 Validator           | Description                                    |
| --------------- | ------------------------------------------ |
| AadhaarValidator          | Aadhaar owners that can validate transactions |
| PasswordValidator | Owners with a password that can validate transactions |
| PrivateOwnerValidator  | A hidden EOA owner that can validate transactions |

Many more experimental validators can be developed, such as [Email](https://zkemail.gitbook.io/zk-email), [Passports](https://www.proofofpassport.com/), [Japanese government-issued ID](https://github.com/MynaWallet), etc... Also, any existing ERC7579 validators, such as [Webauthn](https://github.com/zerodevapp/kernel-7579-plugins/tree/master/validators/webauthn), [MultiFactor](https://docs.rhinestone.wtf/module-sdk/modules/multi-factor), and [Farcaster](https://github.com/Destiner/module-frame), can be integrated out of the box.

## Use cases

### Multi-Factor Multi-sig for individuals and on-chain organizations ( DAOs )
Individuals and DAOs can manage Safe multisig with enhanced security and flexibility by adding multiple signing schemes, e.g. zkEmail's EmailWallet integration to enable [2FA for Safe](https://prove.email/blog/2fa).

### Multi-Factor Social Recovery
Safe offers a native recovery feature that allows Safe to add a guardian with a delay. You can essentially enable multi-factor social recovery by creating a new Safe with multiple signing schemes and assigning it as the guardian, which allows your family and friends who don't know anything about crypto to help recover your Safe using their passports and government-issued ID cards.

### Integration into other Multi-sig wallets
Other safe-based wallets like Nest Wallet and Candide, as well as non-safe multi-sig wallets such as Ambire and Instadapp, also support EIP1271 validation for multi-sig owners. They can utilize our adapter to let their accounts go multi-factor utilizing existing ERC7579 validators.

## TODO
### Figure out how UI looks like
the current plan is to work on option 1 first as a demo and later consider extending it to either 2 or 3.

#### option 1: a modified fork of Safe UI + external app
Currently, the official Safe Web App doesn't allow contract accounts, e.g. ERC4337 wallets, to add signatures off-chain: external contract wallets can connect wallet with Safe UI via Wallet Connect but need to add signatures on-chain. Therefore, the Safe front end needs to be forked and modified so that contract signatures sent from external websites via Wallet Connect can be collected off-chain.

This external web app lets users manage "owners" for Safes, connecting the signer with Safe UI via WC and signing transactions off-chain.

#### option 2: a modified fork of Safe UI + widget/modal
The idea is the same as option 1 but offers an embedded UI for the Safe web app so that users don't have to leave for another website.

#### option 3: standalone website
Create a standalone website that works the same as Safe Web App and has multi-factor capability.
