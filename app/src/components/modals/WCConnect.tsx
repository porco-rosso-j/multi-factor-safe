import { Text, Group, Stack, Button, Modal, TextInput } from "@mantine/core";
import { type IWeb3Wallet } from "@walletconnect/web3wallet";
import type { SessionTypes } from "@walletconnect/types";
import { getSdkError } from "@walletconnect/utils";
import WalletConnect from "../../assets/walletconnect.svg";
import { shortenAddress } from "../../utils/shortenAddr";
import { SafeOwner } from "../../utils/types";
import { signerType } from "../../utils/constants";
import { BottunStyle } from "../../styles/styles";

type WCConnectProps = {
	isDarkTheme: boolean;
	opened: boolean;
	setOpened: (value: boolean) => void;
	owner: SafeOwner | undefined;
	web3wallet: IWeb3Wallet | undefined;
	session: SessionTypes.Struct | undefined;
	setSession: (value: SessionTypes.Struct | undefined) => void;
	isWCConnected: boolean;
	setIsWCConnected: (value: boolean) => void;
	setPairingCode: (value: string) => void;
	pair: () => Promise<void>;
};

export const WCConnect = (props: WCConnectProps) => {
	const web3wallet = props.web3wallet ? props.web3wallet : undefined;
	const session = props.session ? props.session : undefined;

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
					{!props.isWCConnected ? (
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
								onClick={() => {
									props.pair();
								}}
							>
								Pair
							</Button>
						</>
					) : (
						<>
							<Text style={{ ...textTextStyle, fontSize: "25px" }}>
								Connected!
							</Text>
							<Text style={textTextStyle}>
								Now the owner can sign transactions on Safe UI
							</Text>
							<Button
								style={BottunStyle(props.isDarkTheme)}
								onClick={() => {
									web3wallet?.disconnectSession({
										topic: session?.topic as string,
										reason: getSdkError("USER_DISCONNECTED"),
									});
									props.setSession(undefined);
									props.setIsWCConnected(false);
								}}
							>
								Disconnect Session
							</Button>
						</>
					)}
				</Stack>
			</Modal>
		</>
	);
};
