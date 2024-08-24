import {
	LogInWithAnonAadhaar,
	useAnonAadhaar,
	useProver,
} from "@anon-aadhaar/react";
import {
	AnonAadhaarCore,
	deserialize,
	packGroth16Proof,
} from "@anon-aadhaar/core";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Text, Stack } from "@mantine/core";
import { TextStyle } from "../styles/styles";
import { getCommitmentHash, getMFAOpHash } from "../utils/secret";

type AadhaarProps = {
	isDarkTheme: boolean;
	address: string;
	safeTxHash: string;
	handleSetProof: (proof: string) => void;
};

export const Aadhaar = (props: AadhaarProps) => {
	const [anonAadhaar] = useAnonAadhaar();
	const [, latestProof] = useProver();

	console.log("safeTxHash: ", props.safeTxHash);
	console.log(
		"getMFAOpHash(props.address, props.safeTxHash): ",
		getMFAOpHash(props.address, props.safeTxHash)
	);

	useEffect(() => {
		// To do: fix the hook in the react lib
		const aaObj = localStorage.getItem("anonAadhaar");
		console.log("aaObj: ", aaObj);
		if (!aaObj) return;
		const anonAadhaarProofs = JSON.parse(aaObj!).anonAadhaarProofs;
		console.log("anonAadhaarProofs: ", anonAadhaarProofs);
		if (!anonAadhaarProofs) return;

		deserialize(
			anonAadhaarProofs[Object.keys(anonAadhaarProofs).length - 1].pcd
		).then((core: AnonAadhaarCore) => {
			const packedGroth16Proof = packGroth16Proof(core.proof.groth16Proof);
			console.log("packedGroth16Proof: ", packedGroth16Proof);
			const encoder = ethers.AbiCoder.defaultAbiCoder();
			const proofData = encoder.encode(
				["uint", "uint", "uint[4]", "uint[8]"],
				[
					BigInt(1234),
					Number(core.proof.timestamp),
					[
						core.proof.ageAbove18,
						core.proof.gender,
						core.proof.pincode,
						core.proof.state,
					],
					packedGroth16Proof,
				]
			);

			console.log("nullifier: ", core.proof.nullifier);
			console.log("nullifier bigint: ", BigInt(core.proof.nullifier));

			props.handleSetProof(proofData);
		});
	}, [anonAadhaar, latestProof, props]);
	return (
		<>
			<Stack align="center">
				<Text mb={5} size={"18px"} style={TextStyle(props.isDarkTheme)}>
					Login and generate proof
				</Text>

				<LogInWithAnonAadhaar
					nullifierSeed={1234}
					signal={getMFAOpHash(props.address, props.safeTxHash)}
				/>
			</Stack>
		</>
	);
};
