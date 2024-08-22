import { SigningKey, ethers } from "ethers";
import { parseHexToStrArray } from "./parser";
import { pedersenHashBigInt } from "./pedersen";

// export const getDomainSeparator = async (
// 	safeAddress: string,
// 	chainId: number
// ): Promise<string[]> => {
// 	// const domainSeparator = ethers.solidityPackedKeccak256(
// 	// 	["address", "uint32"],
// 	// 	[safeAddress, chainId]
// 	// );
// 	const domainSeparator = ethers.solidityPackedKeccak256(
// 		["address", "uint256"],
// 		[safeAddress, chainId]
// 	);
// 	console.log("domainSeparator: ", domainSeparator);
// 	return await parseHexToStrArray(domainSeparator);
// };

// export const getPrivateOwnerHash = async (
// 	privateOwnerAddress: string,
// 	domainSeparator: string[]
// ): Promise<string> => {
// 	const inputArray: string[] = [privateOwnerAddress, ...domainSeparator];
// 	const ownerHash = await pedersenHashBigInt(inputArray.map((s) => BigInt(s)));

// 	console.log("ownerHash: ", ownerHash);
// 	return ownerHash;
// };
export const getPrivateOwnerHash = async (
	privateOwnerAddress: string
): Promise<string> => {
	const ownerHash = await pedersenHashBigInt([BigInt(privateOwnerAddress)]);

	console.log("ownerHash: ", ownerHash);
	return ownerHash;
};

export const recoverPubKey = async (
	message: string,
	signature: string
): Promise<string> => {
	const address = ethers.recoverAddress(message, signature);
	console.log("address: ", address);
	const pubKey = SigningKey.recoverPublicKey(message, signature);
	console.log("pubKey: ", pubKey);
	return pubKey;
};

export async function getSafeMFAOpHash(
	address: string,
	safeTxHash: string
): Promise<string> {
	const packedHash = ethers.solidityPackedKeccak256(
		["address", "bytes32"],
		[address, safeTxHash]
	);
	return packedHash;
}
