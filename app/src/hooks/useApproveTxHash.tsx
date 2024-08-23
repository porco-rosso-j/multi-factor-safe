import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";
import { CompiledCircuit } from "@noir-lang/types";
import PasswordCircuit from "../circuits/password.json";
import PrivateEoACircuit from "../circuits/k256.json";
import {
	getCommitmentHash,
	getSaltForPasswordCiruict,
	getSecretBytesAndHashFromSecret,
} from "../utils/secret";
import { SafeOwner, SignatureParam } from "../utils/types";
import { sendApproveHashTx } from "../utils/relayer";
import { Signer, ethers } from "ethers";
import {
	getPrivateOwnerHash,
	getSafeMFAOpHash,
	recoverPubKey,
} from "../utils/k256";
import { parseHexToStrArray } from "../utils/parser";

export function useSendApproveTxHash() {
	async function sendApproveTxHash(
		safeAddress: string,
		safeTxHash: string,
		owner: SafeOwner,
		param: SignatureParam
	): Promise<string> {
		let signature;
		if (owner.type === 2) {
			if (!("qrCode" in param)) {
				throw new Error("QR Code is required for type 5");
			}
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
			if (!("privateSigner" in param)) {
				throw new Error("Signer is required for type 4");
			}
			signature = await getPrivateEOASignature(
				param.privateSigner,
				safeTxHash,
				owner.address
			);
		} else {
			return "";
		}

		if (!signature) {
			return "";
		}

		const txHash = await sendApproveHashTx(
			safeAddress,
			owner.address,
			safeTxHash,
			signature
		);
		return txHash;
	}

	return {
		sendApproveTxHash,
	};
}

export const getAadhaarSignature = async (
	qrData: string,
	safeTxHash: string,
	signerAdapterAddress: string
): Promise<string | undefined> => {
	try {
		// signal
		const safeMFAOpHash = await getSafeMFAOpHash(
			signerAdapterAddress,
			safeTxHash
		);
		return "";
	} catch (error) {
		console.error("Error signing message", error);
	}
};

export const getPasswordSignature = async (
	password: string,
	safeTxHash: string,
	signerAdapterAddress: string
): Promise<string | undefined> => {
	try {
		const passwordCircuit = PasswordCircuit as CompiledCircuit;
		const backend = new BarretenbergBackend(passwordCircuit);
		const noir = new Noir(passwordCircuit);

		const salt = await getSaltForPasswordCiruict();

		const { secretBytes, secretHash } = await getSecretBytesAndHashFromSecret(
			//secret
			password,
			salt
		);

		const commitmentHash = await getCommitmentHash(
			signerAdapterAddress as string,
			safeTxHash
		);

		const input = {
			preimage: secretBytes,
			password_hash: secretHash,
			salt: salt,
			commitment_hash: commitmentHash,
		};

		const { witness } = await noir.execute(input);
		const proof = await backend.generateProof(witness);
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
		const privateEoACircuit = PrivateEoACircuit as CompiledCircuit;
		const backend = new BarretenbergBackend(privateEoACircuit);
		const noir = new Noir(privateEoACircuit, backend);

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

		const { witness } = await noir.execute(input);
		console.log("witness: ", witness);
		const proof = await noir.generateProof(input);
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
