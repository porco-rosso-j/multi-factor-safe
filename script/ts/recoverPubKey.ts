import { ContractTransactionResponse, SigningKey, ethers } from "ethers";

// https://github.com/porco-rosso-j/safe-recovery-noir/blob/3740261eb5e343ea54830b772d8fc5b38af4207b/front/src/hooks/useProposeRecover.tsx#L98

const recoverPubKey = async (message: string, signature: string) => {
	const address = ethers.recoverAddress(message, signature);
	console.log("address: ", address);
	const pubKey = SigningKey.recoverPublicKey(message, signature);
	console.log("pubKey: ", pubKey);
};

const message =
	"0xa20bdd52652691998f8ca46194a43785115dc63f7da99335e5dd5b1b029968a6";
const signature =
	"0x1953bc0f1f8a7d3d4bd215bd98005c83daac5ec0c1869d6dc498d2f7e5da4ed95d87d036cb977f4cc5bd5c058db93b66dc8adbeb5b6cc1e33dc839a3895c24d11c";

recoverPubKey(message, signature);
// 0x041ed0f1d7675efe75469851cd529401a9a4433c0514aefaddf24f0141d25566a8788a49c71be6c78b581edfde6550d7b7ce7f386f36522cad56408fca037b2307
