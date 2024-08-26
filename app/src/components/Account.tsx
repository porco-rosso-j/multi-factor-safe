/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { Box, Text, Group, Stack } from "@mantine/core";
import { IconReload } from "@tabler/icons-react";
import { CopyButtonIcon } from "../components";
import { shortenAddress, getSafe } from "../utils";
import { useUserContext } from "../contexts";
import { AccountBoxStyle } from "../styles/styles";

type AccountPageProps = {
	isDarkTheme: boolean;
};

export function Account(props: AccountPageProps) {
	const { safe, signer, saveSafe } = useUserContext();
	console.log("signer in Account: ", signer);
	console.log("safe in Account: ", safe);

	const reloadSafe = async () => {
		console.log("reloadSafe...");
		if (safe) {
			const _safe = await getSafe(safe.address);
			if (_safe) {
				saveSafe(_safe);
			}
		}
	};

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
						<div style={{ flex: 1 }} />
						<IconReload
							size={20}
							style={{
								color: props.isDarkTheme ? "white" : "black",
								marginRight: "5px",
								cursor: "pointer",
								transition: "transform 0.2s, color 0.2s", // Smooth transition for transform and color changes
							}}
							onClick={() => {
								reloadSafe();
							}}
						/>
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
