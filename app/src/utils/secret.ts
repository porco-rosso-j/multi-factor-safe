import { ethers } from "ethers";
import { Barretenberg, Fr } from "@aztec/bb.js";

type SecretBytesAndHash = {
	secretBytes: string[];
	secretHash: string;
};

export async function getSecretBytesAndHashFromSecret(
	_secret: string,
	salt: string[]
): Promise<SecretBytesAndHash> {
	const PaddedSecretBytes = await getPaddedSecretBytes(_secret);
	console.log("PaddedSecretBytes: ", PaddedSecretBytes);

	const _hash = await pedersenHash(PaddedSecretBytes);
	console.log("_hash: ", _hash);

	const hash = await pedersenHash([_hash, ...salt]);
	console.log("hash: ", hash);
	return {
		secretBytes: PaddedSecretBytes,
		secretHash: hash,
	};
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

// export async function getPaddedSecretBytes(_secret: string): Promise<bigint[]> {
// 	const textEncoder = new TextEncoder();
// 	const secretBytes = textEncoder.encode(_secret);
// 	console.log("secretBytes: ", secretBytes);

// 	let secretBytesBigInt: bigint[] = Array.from(secretBytes, (byte) =>
// 		BigInt(byte)
// 	);

// 	const expectedLength = 10;

// 	if (secretBytesBigInt.length < expectedLength) {
// 		// Calculate how many zeros to add
// 		const zerosToAdd = Array.from(
// 			{ length: expectedLength - secretBytesBigInt.length },
// 			() => 0n
// 		);

// 		// Concatenate the current array with the new zeros array
// 		secretBytesBigInt = secretBytesBigInt.concat(zerosToAdd);
// 	}

// 	return secretBytesBigInt;
// }

// hex string -> uint8 -> bytes32 array

// export async function parseUint8ArrayToStrArray(
// 	value: Uint8Array
// ): Promise<string[]> {
// 	const array: string[] = [];
// 	for (let i = 0; i < value.length; i++) {
// 		array[i] = value[i].toString();
// 	}
// 	return array;
// }

export async function parseUint8ArrayToBytes32(
	value: Uint8Array
): Promise<string[]> {
	const array: string[] = [];

	console.log("value: ", value);
	for (let i = 0; i < value.length; i++) {
		const element = `0x${value[i].toString(16).padStart(2, "0")}`;
		array[i] = ethers.zeroPadValue(element, 32);
	}
	console.log("array: ", array);
	return array;
}

export async function pedersenHash(inputs: string[]): Promise<string> {
	const bb: Barretenberg = await Barretenberg.new();
	console.log("inputs: ", inputs);
	const inputArray: Fr[] = inputs.map((str) => Fr.fromString(str));
	console.log("inputArray Fr: ", inputArray);
	return (await bb.pedersenHash(inputArray, 0)).toString();
}

// export async function pedersenHash(inputs: bigint[]): Promise<string> {
// 	const bb: Barretenberg = await Barretenberg.new();
// 	console.log("inputs: ", inputs);
// 	const inputArray: Fr[] = inputs.map((value) => new Fr(value));
// 	console.log("inputArray Fr: ", inputArray);
// 	return (await bb.pedersenHash(inputArray, 0)).toString();
// }

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
