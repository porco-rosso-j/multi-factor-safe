import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";
import { CompiledCircuit } from "@noir-lang/types";
import circuit from "../circuits/password.json";
import {
	getCommitmentHash,
	getSaltForPasswordCiruict,
	getSecretBytesAndHashFromSecret,
} from "../utils/secret";
import { SafeOwner } from "../utils/types";
import { sendApproveHashTx } from "../utils/relayer";

export function useSendApproveTxHash() {
	async function sendApproveTxHash(
		safeAddress: string,
		safeTxHash: string,
		owner: SafeOwner,
		password: string
	): Promise<string> {
		let signature;
		if (owner.type === 3) {
			signature = await getPasswordSignature(
				password,
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

export const getPasswordSignature = async (
	password: string,
	safeTxHash: string,
	address: string
) => {
	try {
		const passwordCircuit = circuit as CompiledCircuit;
		const backend = new BarretenbergBackend(passwordCircuit);
		const noir = new Noir(passwordCircuit);

		const salt = await getSaltForPasswordCiruict();

		const { secretBytes, secretHash } = await getSecretBytesAndHashFromSecret(
			//secret
			password,
			salt
		);

		const commitmentHash = await getCommitmentHash(
			address as string,
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
