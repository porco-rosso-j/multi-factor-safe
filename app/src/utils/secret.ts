import { ethers } from "ethers";
import { parseUint8ArrayToBytes32 } from "./parser";
import { provider } from "./relayer";
import { pedersenHash } from "./pedersen";

export async function getPasswordHash(owner: string): Promise<string> {
	const passwordValidatorInterface = new ethers.Interface([
		`function accountToPasswordHash(address account) view returns (bytes32)`,
	]);

	let passwordHash = "";
	try {
		passwordHash = passwordValidatorInterface.decodeFunctionResult(
			"accountToPasswordHash",
			await provider.call({
				to: "0xAc1c9DAac25f4BB101437903E3EB4Be8031d1EBd",
				data: passwordValidatorInterface.encodeFunctionData(
					"accountToPasswordHash",
					[owner]
					// ["0xE1dedAd3f3Ac2B0C578e87fC57d4861D8102Cc9e"]
				),
			})
		)[0];
		console.log("passwordHash: ", passwordHash);
	} catch (err) {
		console.log("err: ", err);
	}
	return passwordHash;
}

export async function getSecretBytes(_secret: string): Promise<string[]> {
	const PaddedSecretBytes = await getPaddedSecretBytes(_secret);
	console.log("PaddedSecretBytes: ", PaddedSecretBytes);
	return PaddedSecretBytes;
}

export async function computePasswordHash(_secret: string): Promise<string> {
	const salt = await getSaltForPasswordCiruict();

	const PaddedSecretBytes = await getPaddedSecretBytes(_secret);
	console.log("PaddedSecretBytes: ", PaddedSecretBytes);

	const _hash = await pedersenHash(PaddedSecretBytes);
	console.log("_hash: ", _hash);

	const hash = await pedersenHash([_hash, ...salt]);
	console.log("hash: ", hash);
	return hash;
}

export async function getPaddedSecretBytes(_secret: string): Promise<string[]> {
	const textEncoder = new TextEncoder();
	const secretBytes = textEncoder.encode(_secret);
	console.log("secretBytes: ", secretBytes);

	const secretBytes32Array = await parseUint8ArrayToBytes32(secretBytes);
	console.log("secretBytes32Array: ", secretBytes32Array);
	const length = secretBytes.length;
	const lengthComplement = 10 - length;
	for (let i = 0; i < lengthComplement; i++) {
		secretBytes32Array[length + i] = "0x0";
	}
	return secretBytes32Array;
}

export async function getSaltForPasswordCiruict(): Promise<string[]> {
	const _salt = ethers.getBytes(ethers.solidityPacked(["uint256"], [11155111]));
	console.log("_salt: ", _salt);
	return await parseUint8ArrayToBytes32(_salt);
}

export async function getCommitmentHash(
	address: string,
	hash: string
): Promise<string[]> {
	const packedHash = ethers.solidityPackedKeccak256(
		["address", "bytes32"],
		[address, hash]
		// [address, ethers.keccak256(hash)]
	);
	console.log("packedHash: ", packedHash);
	return await parseUint8ArrayToBytes32(ethers.getBytes(packedHash));
}

export function getMFAOpHash(address: string, safeTxHash: string) {
	return ethers.solidityPackedKeccak256(
		["address", "bytes32"],
		[address, safeTxHash]
	);
}
