import { useEffect, useState } from "react";
import { Box, Text, Group, Stack } from "@mantine/core";
import { useUserContext } from "../contexts";
import { AccountBoxStyle } from "../styles/styles";
import { CopyButtonIcon } from "../components";
import { shortenAddress } from "../utils/shortenAddr";
import { getSafe } from "../utils/safe";

/*
TODO: 
- wallet connection via WC / MM
- show owner list vertically if user clicks an arrow or redirect to safe's setting ui
- put etherscan icon 
- 

*/

type AccountPageProps = {
	isDarkTheme: boolean;
};

export function Account(props: AccountPageProps) {
	const { safe, signer, saveSafe } = useUserContext();
	console.log("signer in Account: ", signer);
	console.log("safe in Account: ", safe);

	useEffect(() => {
		console.log("useEffect... in Account ");
		const checkIsSafe = async () => {
			if (signer === undefined) {
				return;
			}
			console.log("getIsSafe...");
			// const isSafe = await getIsSafe(await signer.getAddress());
			const _safe = await getSafe(await signer.getAddress());
			console.log("safe: ", _safe);
			if (_safe && _safe.owners.length != 0 && _safe.threshold != 0) {
				saveSafe(_safe);
			}
		};

		if (signer !== undefined && safe === undefined) {
			checkIsSafe();
		}
	}, [signer, safe, saveSafe]);

	const textTextStyle = {
		color: props.isDarkTheme ? "white" : "black",
		TextAlign: "center",
	};
	return (
		<>
			<Box style={AccountBoxStyle(props.isDarkTheme)}>
				<Stack gap={2} align="left" ml={5}>
					<Group mb={10}>
						<Text style={textTextStyle} size="25px">
							Safe Address:{" "}
						</Text>
						<Text mr={-5} style={textTextStyle} size="25px">
							{safe ? shortenAddress(safe.address) : ""}
						</Text>
						<CopyButtonIcon address={safe ? safe.address : ""} />
					</Group>
					<Group>
						<Text mr={-5} style={textTextStyle} size="md">
							Threshold:{" "}
						</Text>
						<Text style={textTextStyle} size="md">
							{safe ? safe.threshold : 0}
						</Text>
					</Group>
					<Group>
						<Text mr={-5} style={textTextStyle} size="md">
							Owner Count:{" "}
						</Text>
						<Text style={textTextStyle} size="md">
							{safe ? safe.owners.length : 0}
						</Text>
					</Group>
				</Stack>
			</Box>
		</>
	);
}
