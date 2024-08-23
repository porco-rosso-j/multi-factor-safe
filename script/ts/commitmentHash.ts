import * as ethers from "ethers";

export async function getCommitmentHash(
	address: string,
	hash: string
): Promise<string[]> {
	const packedHash = ethers.solidityPackedKeccak256(
		["address", "bytes32"],
		[address, hash]
		// [address, ethers.keccak256(ethers.getBytes(hash))]
	);
	console.log("packedHash: ", packedHash);
	const parsed = await parseUint8ArrayToBytes32(ethers.getBytes(packedHash));
	console.log("parsed commitment hash: ", parsed);
	return parsed;
}

export async function parseUint8ArrayToBytes32(
	value: Uint8Array
): Promise<string[]> {
	const array: string[] = [];

	// console.log("value: ", value);
	for (let i = 0; i < value.length; i++) {
		const element = `0x${value[i].toString(16).padStart(2, "0")}`;
		array[i] = ethers.zeroPadValue(element, 32);
	}
	// console.log("array: ", array);
	return array;
}

// for password test
getCommitmentHash(
	"0x595EE62794254fFD1Ea860aE8E8936E39B48e16b",
	"0x12bd7a332765c0c0efb5015fb23ec0654567604f547b0dbe0ca94b20ad5fbf40"
);
// 0x50c589cf29bbcccb48cc7aceea1dc4f639c5704a0f32b2a5de4a10c9bfa014e8

// for anon-aadhaar test
// getCommitmentHash(
// 	"0x41fae757dc522bF485F23eFBf19304F014A33088",
// 	"0x12bd7a332765c0c0efb5015fb23ec0654567604f547b0dbe0ca94b20ad5fbf40"
// );
