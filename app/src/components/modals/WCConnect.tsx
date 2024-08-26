import { Text, Group, Stack, Button, Modal, TextInput } from "@mantine/core";
import WalletConnect from "../../assets/walletconnect.svg";
import { shortenAddress } from "../../utils/shortenAddr";
import { SafeOwner } from "../../utils/types";
import { signerType } from "../../utils/constants";
import { useEffect, useState } from "react";

type WCConnectProps = {
	isDarkTheme: boolean;
	opened: boolean;
	setOpened: (value: boolean) => void;
	owner: SafeOwner | undefined;
	isWCConnected: boolean;
	pair: () => Promise<void>;
	setPairingCode: (value: string) => void;
};

export const WCConnect = (props: WCConnectProps) => {
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (props.isWCConnected) {
			setLoading(false);
		}
	}, [props.isWCConnected]);

	const textTextStyle = {
		color: "black",
		TextAlign: "center",
	};

	return (
		<>
			<Modal
				opened={props.opened}
				onClose={() => {
					props.setOpened(false);
				}}
				withCloseButton={true}
				centered
			>
				<Stack
					align="center"
					mb={20}
					px={10}
					style={{
						maxHeight: "310px",
						overflowY: "auto",
					}}
				>
					<img src={WalletConnect} alt="delivery" height={50} width={50} />
					<>
						<Text style={textTextStyle}>
							Connect this owner to Safe via WalletConnect?
						</Text>
						{props.owner && (
							<Group
								mb={10}
								gap={50}
								style={{ justifyContent: "space-between" }}
							>
								<Stack align="left" gap={3}>
									<Text style={textTextStyle}> Owner: </Text>
									<Text style={textTextStyle}> Type: </Text>
								</Stack>
								<Stack style={{ alignItems: "flex-end" }} gap={3}>
									<Text style={textTextStyle}>
										{shortenAddress(props.owner.address)}
									</Text>
									<Text style={textTextStyle}>
										{signerType[props.owner.type]}{" "}
									</Text>
								</Stack>
							</Group>
						)}

						<TextInput
							variant="filled"
							radius="sm"
							style={{ width: "90%" }}
							width="150px"
							placeholder="Enter paring code"
							onChange={(e) => props.setPairingCode(e.target.value)}
						/>

						<Button
							loading={loading}
							onClick={() => {
								setLoading(true);
								props.pair();
							}}
						>
							Pair
						</Button>
					</>
				</Stack>
			</Modal>
		</>
	);
};
