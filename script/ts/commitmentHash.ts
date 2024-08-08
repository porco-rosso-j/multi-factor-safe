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

getCommitmentHash(
	"0x09d4E28B9710c097A14A46099De60FBaACE8f492",
	"0x3bdea30bbfc5b7ad564b0bd2ae76bbf432c055feb740e1919bf225c7db7e0422"
);
