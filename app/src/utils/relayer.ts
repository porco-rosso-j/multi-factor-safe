import { ethers } from "ethers";
import { Safe7579SignatureValidatorAbi } from "./index";
import { TransactionResult } from "./types";
// jq '.abi' out/Safe7579SignatureValidator.sol/Safe7579SignatureValidator.json > app/src/utils/Safe7579SignatureValidator.json
// jq '.abi' out/Safe7579SignatureValidatorFactory.sol/Safe7579SignatureValidatorFactory.json > app/src/utils/Safe7579SignatureValidatorFactory.json
export const provider = new ethers.JsonRpcProvider(
	import.meta.env.VITE_SEPOLIA_RPC_URL
);
export const wallet = new ethers.Wallet(
	import.meta.env.VITE_RELATER_PRIVATE_KEY as string,
	provider
);

export const sendApproveHashTx = async (
	safeAddress: string,
	adapterAddress: string,
	safeTxHash: string,
	signature: string
): Promise<TransactionResult> => {
	const signerAdapter = new ethers.Contract(
		adapterAddress,
		Safe7579SignatureValidatorAbi,
		wallet
	);

	const tx = await signerAdapter.approveHashOnSafe(
		safeAddress,
		safeTxHash,
		signature,
		{ gasLimit: 1000000 }
	);

	try {
		console.log("tx: ", tx);
		const txReceipt = await tx.wait();
		console.log("txReceipt: ", txReceipt);
		return {
			txHash: txReceipt.hash,
			success: true,
		};
	} catch (e) {
		console.error("Error sending transaction", e);
		return {
			txHash: tx.hash,
			success: false,
			erorrMessage: "Error sending transaction",
		};
	}
};
