import { Signer, ethers } from "ethers";
import {
	type SafeOwner,
	type SignatureParam,
	type TransactionResult,
	getCommitmentHash,
	getPasswordHash,
	getSaltForPasswordCiruict,
	getSecretBytes,
	sendApproveHashTx,
	getPrivateOwnerHash,
	getSafeMFAOpHash,
	recoverPubKey,
	parseHexToStrArray,
	privateEoACircuit,
	passwordCircuit,
} from "../utils";

export function useSendApproveTxHash() {
	async function sendApproveTxHash(
		safeAddress: string,
		safeTxHash: string,
		owner: SafeOwner,
		param: SignatureParam
	): Promise<TransactionResult> {
		let signature;
		if (owner.type === 2) {
			if (!("proof" in param)) {
				throw new Error("proof is required for type 2");
			}

			signature = param.proof;
		} else if (owner.type === 3) {
			if (!("password" in param)) {
				throw new Error("Password is required for type 3");
			}
			signature = await getPasswordSignature(
				param.password,
				safeTxHash,
				owner.address
			);
		} else if (owner.type === 4) {
			// TODO: can check if this signer is correct comparing hash with the one stored on contract
			if (!("privateSigner" in param)) {
				throw new Error("Signer is required for type 4");
			}
			signature = await getPrivateEOASignature(
				param.privateSigner,
				safeTxHash,
				owner.address
			);
		} else {
			return { txHash: "", success: false };
		}

		if (!signature) {
			return {
				txHash: "",
				success: false,
				erorrMessage: "Error generating signature",
			};
		}

		const txResult = await sendApproveHashTx(
			safeAddress,
			owner.address,
			safeTxHash,
			signature
		);
		return txResult;
	}

	return {
		sendApproveTxHash,
	};
}

export const getPasswordSignature = async (
	password: string,
	safeTxHash: string,
	signerAdapterAddress: string
): Promise<string | undefined> => {
	try {
		// const passwordCircuit = PasswordCircuit as CompiledCircuit;
		// const backend = new BarretenbergBackend(passwordCircuit);
		// const noir = new Noir(passwordCircuit);

		const salt = await getSaltForPasswordCiruict();

		const secretBytes = await getSecretBytes(password);
		const passwordHash = await getPasswordHash(signerAdapterAddress);
		console.log("passwordHash: ", passwordHash);

		const commitmentHash = await getCommitmentHash(
			signerAdapterAddress as string,
			safeTxHash
		);

		const input = {
			preimage: secretBytes,
			password_hash: passwordHash,
			salt: salt,
			commitment_hash: commitmentHash,
		};

		// const { witness } = await passwordCircuit.execute(input);
		const proof = await passwordCircuit.generateProof(input);
		console.log("proof: ", proof.proof);
		console.log("public inputs: ", proof.publicInputs);
		const proofStr =
			"0x" +
			Array.from(proof.proof)
				.map((byte) => byte.toString(16).padStart(2, "0"))
				.join("");

		return proofStr;
	} catch (error) {
		console.error("Error signing message", error);
	}
};

export const getPrivateEOASignature = async (
	signer: Signer,
	safeTxHash: string,
	signerAdapterAddress: string
): Promise<string | undefined> => {
	console.log("safeTxHash in getPrivateEOASignature: ", safeTxHash);
	try {
		// const privateEoACircuit = PrivateEoACircuit as CompiledCircuit;
		// const backend = new BarretenbergBackend(privateEoACircuit);
		// const noir = new Noir(privateEoACircuit, backend);

		const ownerHash = await getPrivateOwnerHash(await signer.getAddress());
		console.log("ownerHash: ", ownerHash);

		const safeMFAOpHash = await getSafeMFAOpHash(
			signerAdapterAddress as string,
			safeTxHash
		);
		console.log("safeMFAOpHash: ", safeMFAOpHash);

		const messageHash = ethers.hashMessage(ethers.getBytes(safeMFAOpHash));
		console.log("messageHash: ", messageHash);

		const ecdsaSignature = await signer.signMessage(
			ethers.getBytes(safeMFAOpHash)
		);
		console.log("ecdsaSignature: ", ecdsaSignature);

		const pubkey = await recoverPubKey(messageHash, ecdsaSignature);
		console.log("pubkey: ", pubkey);

		const parsedMessageHash = await parseHexToStrArray(messageHash);
		const parsedPubKey = await parseHexToStrArray(pubkey);
		const parsedSignature = await parseHexToStrArray(ecdsaSignature);

		const input = {
			owner_hash: ownerHash,
			hashed_message: parsedMessageHash,
			pub_key: parsedPubKey.slice(1, 65),
			signature: parsedSignature.slice(0, -1),
		};

		console.log("input: ", input);

		// const { witness } = await privateEoACircuit.execute(input);
		// console.log("witness: ", witness);

		const proof = await privateEoACircuit.generateProof(input);
		console.log("proof: ", proof.proof);
		console.log("public inputs: ", proof.publicInputs);

		// const isValid = await noir.verifyProof(proof);
		// console.log("isValid: ", isValid);

		const proofStr =
			"0x" +
			Array.from(proof.proof)
				.map((byte) => byte.toString(16).padStart(2, "0"))
				.join("");

		console.log("proofStr: ", proofStr);
		return proofStr;
	} catch (error) {
		console.error("Error signing message", error);
	}
};
