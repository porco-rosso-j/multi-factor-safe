import { ethers } from "ethers";

export async function parseHexToStrArray(hex: string): Promise<string[]> {
	return parseUint8ArrayToBytes32(ethers.getBytes(hex));
}

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
