import { ethers } from "ethers";
import Safe7579SignatureValidatorABI from "./Safe7579SignatureValidator.json";
// jq '.abi' out/Safe7579SignatureValidator.sol/Safe7579SignatureValidator.json > app/src/utils/Safe7579SignatureValidator.json

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
): Promise<string> => {
	const signerAdapter = new ethers.Contract(
		adapterAddress,
		Safe7579SignatureValidatorABI,
		wallet
	);

	const tx = await signerAdapter.approveHashOnSafe(
		safeAddress,
		safeTxHash,
		signature
	);
	console.log("tx: ", tx);
	const txReceipt = await tx.wait();
	console.log("txReceipt: ", txReceipt);
	return txReceipt.transactionHash;
};
