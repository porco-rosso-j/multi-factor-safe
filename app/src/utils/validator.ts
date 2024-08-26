import { Signer, ethers } from "ethers";
import { provider } from "./relayer";
import Safe7579SignatureValidatorFactoryAbi from "./Safe7579SignatureValidatorFactory.json";

const validatorMap = new Map<string, number>([
	["0x0000000000000000000000000000000000000000", 0],
	["0x0000000000000000000000000000000000000001", 1],
	["0xd1B1602f3a801A7Bb1076170aC3b65d39132ae2e", 2],
	["0xAc1c9DAac25f4BB101437903E3EB4Be8031d1EBd", 3],
	["0x86b185121035AbcbBc186a6ba442ecFbe9E23f0d", 4],
]);

const signerTypeToValidatorAddress = new Map<number, string>([
	[0, "0x0000000000000000000000000000000000000000"],
	[1, "0x0000000000000000000000000000000000000001"],
	[2, "0xd1B1602f3a801A7Bb1076170aC3b65d39132ae2e"],
	[3, "0xAc1c9DAac25f4BB101437903E3EB4Be8031d1EBd"],
	[4, "0x86b185121035AbcbBc186a6ba442ecFbe9E23f0d"],
]);

export const signerValidatorFactoryAddress =
	"0x2BC704F24B9c047E157dFf95C8595e0d9e5938FD";

export const computeSignerValidatorAddress = async (
	signerType: number,
	data: string
) => {
	const signerValidatorFactory = new ethers.Contract(
		signerValidatorFactoryAddress,
		Safe7579SignatureValidatorFactoryAbi,
		provider
	);

	const signerValidatorAddress = await signerValidatorFactory
		.getFunction("getAddress")
		.staticCall(signerTypeToValidatorAddress.get(signerType), data, 0);
	console.log("signerValidatorAddress: ", signerValidatorAddress);

	return signerValidatorAddress;
};

type CreateSignerValidatorResult = {
	txHash: string;
	success: boolean;
	signerAddress?: string;
	errorMessage?: string;
};

export const deploySignerValidator = async (
	signer: Signer,
	signerType: number,
	data: string
): Promise<CreateSignerValidatorResult> => {
	const signerValidatorFactory = new ethers.Contract(
		signerValidatorFactoryAddress,
		Safe7579SignatureValidatorFactoryAbi,
		signer
	);

	const signerValidatorAddress = await computeSignerValidatorAddress(
		signerType,
		data
	);

	const tx = await signerValidatorFactory.createSafe7579SignatureValidator(
		signerTypeToValidatorAddress.get(signerType),
		data,
		0,
		{ gasLimit: 700000 }
	);
	console.log("tx: ", tx);

	try {
		const txReceipt = await tx.wait();
		console.log("txReceipt: ", txReceipt);
		console.log("signerValidatorAddress: ", signerValidatorAddress);

		return {
			txHash: txReceipt.hash,
			success: true,
			signerAddress: signerValidatorAddress,
		};
	} catch (e) {
		console.error("Error sending transaction", e);
		return {
			txHash: tx.hash,
			success: false,
			errorMessage: "Error sending transaction",
		};
	}
};

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
