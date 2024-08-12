import { ethers } from "ethers";
import { provider } from "./relayer";
import { Safe } from "./types";

export const getSafe = async (address: string): Promise<Safe | undefined> => {
	const safeInterface = new ethers.Interface([
		`function getOwners() view returns (address[] memory)`,
		`function getThreshold() view returns (uint256)`,
	]);
	const ownerData = safeInterface.encodeFunctionData("getOwners");
	const thresholdData = safeInterface.encodeFunctionData("getThreshold");
	let owners;
	let threshold;

	try {
		owners = safeInterface.decodeFunctionResult(
			"getOwners",
			await provider.call({ to: address, data: ownerData })
		)[0];

		threshold = safeInterface.decodeFunctionResult(
			"getThreshold",
			await provider.call({ to: address, data: thresholdData })
		)[0];
		console.log("owners: ", owners);
		console.log("threshold: ", threshold);
	} catch (err) {
		console.log("err: ", err);
		return undefined;
	}

	return { address, owners, threshold: Number(threshold) };
};
