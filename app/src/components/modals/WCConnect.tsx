import { Text, Group, Stack, Button, Modal, TextInput } from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Web3Wallet,
	type Web3WalletTypes,
	type IWeb3Wallet,
} from "@walletconnect/web3wallet";
import type { SessionTypes } from "@walletconnect/types";
import { getSdkError } from "@walletconnect/utils";

import WalletConnect from "../../assets/walletconnect.svg";
import { shortenAddress } from "../../utils/shortenAddr";
import { SafeOwner, WCRequest, WCRequestContent } from "../../utils/types";
import { signerType } from "../../utils/constants";
import { buildSession, web3WalletParams } from "../../utils/walletconnect";
import { BottunStyle } from "../../styles/styles";

type WCConnectProps = {
	owner: SafeOwner | undefined;
	isDarkTheme: boolean;
	opened: boolean;
	setOpened: (value: boolean) => void;
	handleSafeTxSession: (wcRequest: WCRequest) => void;
};

export const WCConnect = (props: WCConnectProps) => {
	const [web3wallet, setWeb3Wallet] = useState<IWeb3Wallet>();
	const [pairingCode, setPairingCode] = useState("");
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const [session, setSession] = useState<SessionTypes.Struct>();

	console.log("isConnected: ", isConnected);
	console.log("session: ", session);

	const pair = async () => {
		if (pairingCode && web3wallet) {
			try {
				await web3wallet.pair({ uri: pairingCode });
				setIsConnected(true);
			} catch (e) {
				console.error("Error pairing with uri", e);
			}
		}
	};

	const onSessionProposal = useCallback(
		async ({ id, params }: Web3WalletTypes.SessionProposal) => {
			console.log("params: ", params);
			console.log("id: ", id);
			if (!web3wallet) {
				console.error("Web3Wallet not available");
				return;
			}

			if (!props.owner) {
				console.error("Owner not available");
				return;
			}

			try {
				const session = await buildSession(
					web3wallet,
					params,
					id,
					props.owner?.address
				);
				setSession(session);
			} catch (error) {
				await web3wallet?.rejectSession({
					id,
					reason: getSdkError("USER_REJECTED"),
				});
			}
		},
		[web3wallet, props]
	);

	const onSessionRequest = useCallback(
		async (event: Web3WalletTypes.SessionRequest) => {
			// TODO: chekc if the owner is the same as the one in the session

			if (!props.owner) {
				console.error("Address not available");
				return;
			}

			if (!session) {
				console.error("Session not available");
				return;
			}

			if (!web3wallet) {
				console.error("Web3Wallet not available");
				return;
			}

			const { topic, params, id } = event;
			console.log("onSessionRequest... ");
			console.log("params: ", params);
			console.log("id: ", id);
			console.log("topic: ", topic);
			const safeTxHash = "0x" + params.request.params[0].data.slice(10);
			console.log("safeTxHash: ", safeTxHash);

			const response = {
				id,
				jsonrpc: "2.0",
				result:
					"0x6bce5ca720a6c4af97e0742229670575ac6433b43d6ea6642e78c539a7653aeb",
			};

			const wcRequest: WCRequest = {
				web3wallet,
				session,
				requestContent: {
					message: safeTxHash,
					method: params.request.method,
					topic,
					response,
				} as WCRequestContent,
			};

			await props.handleSafeTxSession(wcRequest);

			await web3wallet?.respondSessionRequest({
				topic,
				response: response,
			});
		},
		[props, session, web3wallet]
	);

	useEffect(() => {
		const initWeb3Wallet = async () => {
			try {
				const w3w = await Web3Wallet.init(web3WalletParams);
				setWeb3Wallet(w3w);
			} catch (e) {
				console.error("Error initializing web3wallet", e);
			}
		};
		if (!web3wallet && props.owner && props.owner.address) {
			console.log("init");
			initWeb3Wallet();
		}
	}, [web3wallet, props]);

	// useEffect(() => {
	// 	if (web3wallet) {
	// 		web3wallet.on("session_proposal", onSessionProposal);
	// 		web3wallet.on("session_request", onSessionRequest);

	// 		const activeSessions = web3wallet?.getActiveSessions();
	// 		console.log("activeSessions: ", activeSessions);
	// 		if (activeSessions) {
	// 			const currentSession = Object.values(activeSessions)[1];
	// 			console.log("currentSession: ", currentSession);
	// 			setSession(currentSession);
	// 			console.log(
	// 				"Object.keys(activeSessions).length > 0: ",
	// 				Object.keys(activeSessions).length > 1
	// 			);
	// 			setIsConnected(Object.keys(activeSessions).length > 1);
	// 		}
	// 	}
	// }, [onSessionProposal, onSessionRequest, web3wallet]);
	const sessionRef = useRef<SessionTypes.Struct>();

	useEffect(() => {
		sessionRef.current = session; // Always keep sessionRef up-to-date with session state
	}, [session]);

	useEffect(() => {
		if (web3wallet) {
			const handleSessionRequest = (event: Web3WalletTypes.SessionRequest) => {
				console.log("sessionRef current: ", sessionRef.current);
				if (sessionRef.current) {
					onSessionRequest(event);
				}
			};

			web3wallet.on("session_proposal", onSessionProposal);
			web3wallet.on("session_request", handleSessionRequest);

			// Rest of your logic...
			const activeSessions = web3wallet?.getActiveSessions();
			console.log("activeSessions: ", activeSessions);
			if (activeSessions) {
				const sessionsLen = Object.keys(activeSessions).length;
				const currentSession =
					sessionsLen > 1
						? Object.values(activeSessions)[1]
						: Object.values(activeSessions)[0];
				console.log("currentSession: ", currentSession);
				setSession(currentSession);
				console.log(
					"Object.keys(activeSessions).length > 0: ",
					Object.keys(activeSessions).length > 1
				);
				setIsConnected(
					sessionsLen > 1
						? Object.keys(activeSessions).length > 1
						: Object.keys(activeSessions).length > 0
				);
			}

			return () => {
				// Don't forget to clean up
				web3wallet.off("session_proposal", onSessionProposal);
				web3wallet.off("session_request", handleSessionRequest);
			};
		}
	}, [onSessionProposal, onSessionRequest, web3wallet]);

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
					{!isConnected ? (
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
								onChange={(e) => setPairingCode(e.target.value)}
							/>

							<Button
								onClick={() => {
									pair();
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
									setSession(undefined);
									setIsConnected(false);
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
