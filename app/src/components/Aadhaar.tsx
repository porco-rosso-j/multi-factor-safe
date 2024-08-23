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
import { useEffect } from "react";
import { ethers } from "ethers";
import { Text, Stack } from "@mantine/core";
import { TextStyle } from "../styles/styles";

type AadhaarProps = {
	isDarkTheme: boolean;
	address: string;
	safeMFAOpHash: string;
	handleSetProof: (proof: string) => void;
};

export const Aadhaar = (props: AadhaarProps) => {
	const [anonAadhaar] = useAnonAadhaar();
	const [, latestProof] = useProver();

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

			props.handleSetProof(proofData);
		});
	}, [anonAadhaar, latestProof, props]);
	return (
		<>
			<Stack align="center" gap={10}>
				<Text style={TextStyle(props.isDarkTheme)}>
					Click Button to login and generate proof
				</Text>

				<LogInWithAnonAadhaar
					nullifierSeed={1234}
					signal={props.safeMFAOpHash}
				/>
			</Stack>
		</>
	);
};
