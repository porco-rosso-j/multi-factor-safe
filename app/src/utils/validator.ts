import { ethers } from "ethers";
import { provider } from "./relayer";

const validatorMap = new Map<string, number>([
	["0x0000000000000000000000000000000000000000", 0],
	["0x0000000000000000000000000000000000000001", 1],
	["0xd1B1602f3a801A7Bb1076170aC3b65d39132ae2e", 2],
	["0xAc1c9DAac25f4BB101437903E3EB4Be8031d1EBd", 3],
	// ["0xCFF0bfcD80AbE450C2C87eE6c630A548E9f1d684", 4],
	["0x86b185121035AbcbBc186a6ba442ecFbe9E23f0d", 4],
]);

const signerAdapterInterface = new ethers.Interface([
	`function validator() view returns (address)`,
]);

export const getSignerType = async (address: string): Promise<number> => {
	let validatorAddress = "";

	if (await isContract(address)) {
		try {
			validatorAddress = signerAdapterInterface.decodeFunctionResult(
				"validator",
				await provider.call({
					to: address,
					data: signerAdapterInterface.encodeFunctionData("validator"),
				})
			)[0];
			console.log("validatorAddress: ", validatorAddress);
		} catch (err) {
			console.log("err: ", err);
			return 1;
		}

		return validatorMap.has(validatorAddress)
			? (validatorMap.get(validatorAddress) as number)
			: 1;
	} else {
		return 0;
	}
};

async function isContract(address: string): Promise<boolean> {
	try {
		// Fetch the code at the address
		const code = await provider.getCode(address);
		// If code is more than '0x', then it is a contract
		return code !== "0x";
	} catch (error) {
		console.error("Failed to fetch code for address:", error);
		return false; // In case of any error, assume not a contract
	}
}
