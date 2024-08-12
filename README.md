# Safe MFA(Multi-Factor Authentication)

## Technical Overview
Safe is natively signature-type-agnostic in the sense that it can not only have EOA owners but also support contract owners with any sort of signature validation schemes via two types of contract signature flows in `checkNSignatures()` method: 1. [EIP-1271 signature](https://docs.safe.global/advanced/smart-account-signatures#contract-signature-eip-1271) and 2. [pre-validated signature](https://docs.safe.global/advanced/smart-account-signatures#pre-validated-signatures). The former calls into external owner contract’s ERC-1271 specific method `isValidSignature()` to perform 1271 verification while the latter just verifies that a certain Safe tx hash has been approved by given owner address by checking a mapping `approvedHashes`.

This project leverages these signature types supported by Safe to allow ERC-7579 validators to virtually serve as safe owners by deploying adapters as proxies. This allows Safe to go multi-factor as straightforwardly as possible in the sense that doesn’t enable on a single module but just by tapping into ERC7579 validator modules.

The following diagram is an example flow of signature validation for a 4/4 Safe with three of them being the adapter contracts that relay EIP1271 validation from Safe's `checkNSignatures()` method to ERC7579 validators.

<p align="center">
  <img width="600" alt="Screenshot 2024-08-05 at 17 08 58" src="https://github.com/user-attachments/assets/ccbf5a20-334e-4f75-8e59-a097f6502149">
</p>

The pre-validated signature flow is as follows:

<p align="center">
  <img width="600" alt="Screenshot 2024-08-11 at 21 38 01" src="https://github.com/user-attachments/assets/96309a98-400d-4b2f-a6b9-ef94030a27af">
</p>


### EIP1271 vs Pre-validated Signature flows

Since the signatures are aggregated off-chain in the EIP-1271 flow, it's less costly in terms of gas compared with `approveHash()` which requires on-chain transactions for each signing. However, the latter is more robust because it doesn't have to rely on a centralized signature aggregator, i.e. Safe Transaction Service.

Since signatures can be aggregated off-chain in the EIP-1271 flow using off-chain signature aggregator, e.g. Safe Transaction Service or its variant, it's less costly in terms of transaction gas overhead compared with pre-validated signature flow which requires separate on-chain transactions from signer adapters.

Safe Web App currently doesn’t support off-chain signature aggregation for external smart contracts except Safe: a situation where Safe is one of the owners of another Safe. For the reasons above, at this point, our first demo app ( see below ) only works in the pre-validated signature flow.

## Validators

Safe MFA can support an expanding range of signature validation schemes as the number of ERC7579 validators continues to grow. Existing validators like [Webauthn](https://github.com/zerodevapp/kernel-7579-plugins/tree/master/validators/webauthn), [MultiFactor](https://docs.rhinestone.wtf/module-sdk/modules/multi-factor), and [Farcaster](https://github.com/Destiner/module-frame), can surely be integrated out of the box.

Also we’ve prototyped the following three new ERC7579 validators that leverage zero-knowledge proofs. The `AadhaarValidator` is built on top of [AnonAadhaar](https://github.com/anon-aadhaar), while the others leverage [Noir](https://noir-lang.org/docs/) —- `PasswordValidator`, which verifies the knowledge of secret password, and `PrivateOwnerValidator` verifies ECDSA K256 signature without exposing signer’s Ethereum address on-chain, so-called zkECDSA.

| ERC7579 Validator     | Description                                           |
| --------------------- | ----------------------------------------------------- |
| AadhaarValidator      | Aadhaar owners that can validate transactions         |
| PasswordValidator     | Owners with a password that can validate transactions |
| PrivateOwnerValidator | A hidden EOA owner that can validate transactions     |

Many more experimental validators can be developed, such as [Email](https://zkemail.gitbook.io/zk-email), [Passports](https://www.proofofpassport.com/), [Japanese government-issued ID](https://github.com/MynaWallet), etc...

## Use cases

### Multi-Factor Multi-sig

Individuals and on-chain organizations, e.g. DAOs, can manage Safe multisig with enhanced security and flexibility by adding multiple signing schemes, e.g. zkEmail's EmailWallet integration to enable [2FA for Safe](https://prove.email/blog/2fa).

### Multi-Factor Social Recovery

Safe offers a native recovery feature that allows Safe to add a guardian with a delay. You can essentially enable multi-factor social recovery by creating a new Safe with multiple signing schemes and assigning it as the guardian, which allows your family and friends who don't know anything about crypto to help recover your Safe using their passports and government-issued ID cards.

## Safe MFA App (WIP)

Safe MFA web app is expected to have the following capabilities:

1. Add new owner ( signer adapter ) to your Safe
2. Sign transactions using the signer with supported methods
3. Setup multi-factor social recovery for your Safe
   
<p align="center">
  <img width="600" alt="Screenshot 2024-08-11 at 0 00 08" src="https://github.com/user-attachments/assets/a090ffe5-ae1e-4799-9a17-4290a98dce5d">
</p>


