import { useEffect, useState } from "react";
import { Box, Text, Group, Stack, Divider, Button } from "@mantine/core";
import { useUserContext } from "../contexts";
import { BottunStyle, MainBoxStyle } from "../styles/styles";
import { shortenAddress } from "../utils/shortenAddr";
import { signerType } from "../utils/constants";
import { IconSettings } from "@tabler/icons-react";
import WalletConnect from "../assets/walletconnect.svg";
import { getSignerType } from "../utils/validator";
import { WCConnect } from "../components/modals/WCConnect";
import { SafeOwner, SignatureParam, WCRequest } from "../utils/types";
import { useSendApproveTxHash } from "../hooks/useApproveTxHash";
import { CopyButtonIcon } from "../components";
import { Approve } from "../components/Approve";
import { useWalletConnect } from "../hooks/useWalletConnect";
import { getSdkError } from "@walletconnect/utils";

type SafeSignerPageProps = {
	isDarkTheme: boolean;
};

export function SafeSigner(props: SafeSignerPageProps) {
	const { sendApproveTxHash } = useSendApproveTxHash();
	const { signer, safe, selectedOwner, saveSelectedOwner } = useUserContext();
	const [owners, setOwners] = useState<SafeOwner[]>([]);

	const [wcConnectOpened, setWCConnectOpened] = useState(false);
	const [isExecuted, setIsExecuted] = useState(false);
	const [isApprovalRequested, setIsApprovalRequested] = useState(false);

	const {
		web3wallet,
		session,
		wcRequest,
		isWCConnected,
		setSession,
		pair,
		setPairingCode,
		setIsWCConnected,
	} = useWalletConnect();
	// } = useWalletConnect(selectedOwner);

	useEffect(() => {
		console.log("useEffect in SafeSigner...");
		const loadOwners = async () => {
			if (safe === undefined) {
				return;
			}
			const _owners: SafeOwner[] = [];
			for (let i = 0; i < safe.owners.length; i++) {
				const signerType = await getSignerType(safe.owners[i]);
				const _owner: SafeOwner = {
					address: safe.owners[i],
					type: signerType,
				};
				_owners.push(_owner);
			}
			setOwners(_owners);
		};

		if (safe !== undefined && owners.length === 0) {
			loadOwners();
		}
	}, [owners, safe]);

	useEffect(() => {
		console.log("wcRequest in useEffect: ", wcRequest);
		if (!wcRequest) {
			return;
		}
		setIsApprovalRequested(true);
	}, [wcRequest]);
	console.log("wcRequest : ", wcRequest);

	const handleOpenWCConnect = (signerId: number) => {
		console.log("handleOpenWCConnect signerId: ", signerId);
		saveSelectedOwner(owners[signerId]);
		setWCConnectOpened(true);
	};

	const handleSendApproveHashTx = async (
		param: SignatureParam
	): Promise<string> => {
		console.log("handleSendApproveHashTx...");
		console.log("selectedOwner: ", selectedOwner);
		console.log("wcRequest: ", wcRequest);
		console.log("safe: ", safe);
		if (!wcRequest) {
			return "";
		}
		if (!safe) {
			return "";
		}
		if (!selectedOwner) {
			return "";
		}

		return await sendApproveTxHash(
			safe.address,
			wcRequest.requestContent.message,
			selectedOwner,
			param
		);
	};

	const textTextStyle = {
		color: props.isDarkTheme ? "white" : "black",
		TextAlign: "center",
	};
	return (
		<>
			<Box style={MainBoxStyle(props.isDarkTheme)}>
				{!isWCConnected ? (
					<>
						<Text style={textTextStyle} size="25px">
							Signers
						</Text>
						<Group
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
							}}
							ml={25}
							mt={15}
							w="45%"
						>
							<Text style={textTextStyle}> Id</Text>
							<Text style={textTextStyle}> address </Text>
							<Text style={textTextStyle}> method </Text>
						</Group>
						<Divider
							opacity={0.5}
							mt={5}
							mx={15}
							style={{ borderColor: props.isDarkTheme ? "white" : "black" }}
						/>
						<Stack
							align="center"
							mt={20}
							px={10}
							style={{ maxHeight: "310px", overflowY: "auto" }}
						>
							{owners.length !== 0 ? (
								owners.map((signer: SafeOwner, index: number) => (
									<Box
										key={index}
										pr={15}
										pl={5}
										py={15}
										style={{
											width: "100%",
											boxShadow: "black",
											borderRadius: "5px",
											borderColor: props.isDarkTheme ? "white" : "black",
											borderWidth: "1px",
											borderStyle: "solid",
										}}
									>
										<Group
											ml={10}
											style={{
												display: "flex",
												justifyContent: "space-between",
											}}
										>
											<Group gap={50}>
												<Text
													style={{
														color: props.isDarkTheme ? "white" : "black",
														fontSize: "16px",
													}}
												>
													{index + 1}
												</Text>
												<Box w={130}>
													<Text
														style={{
															color: props.isDarkTheme ? "white" : "black",
															fontSize: "16px",
														}}
													>
														{shortenAddress(signer.address)}
													</Text>
												</Box>

												<Text
													style={{
														color: props.isDarkTheme ? "white" : "black",
														fontSize: "16px",
													}}
												>
													{signerType[signer.type]}
												</Text>
											</Group>
											{signerType[signer.type] !== "EOA" && (
												<Group mr={10} gap={30}>
													<img
														src={WalletConnect}
														alt="delivery"
														onClick={() => handleOpenWCConnect(index)}
													/>
													<IconSettings
														style={{
															color: props.isDarkTheme ? "white" : "black",
														}}
														onClick={() => {
															// props.toggleTheme();
														}}
													/>
												</Group>
											)}
										</Group>
									</Box>
								))
							) : (
								<Text
									my={30}
									c={props.isDarkTheme ? "white" : "black"}
									style={{ textAlign: "center" }}
								>
									No Signer Found...
								</Text>
							)}
						</Stack>
						{/* TODO: disable when safe isnt detected */}
						<Box mt={20} style={{ display: "flex", justifyContent: "center" }}>
							<Button disabled={!signer} style={BottunStyle(props.isDarkTheme)}>
								Add Signer
							</Button>
						</Box>

						{wcConnectOpened && (
							<WCConnect
								isDarkTheme={props.isDarkTheme}
								setOpened={setWCConnectOpened}
								opened={wcConnectOpened}
								owner={selectedOwner}
								web3wallet={web3wallet}
								session={session}
								setSession={setSession}
								isWCConnected={isWCConnected}
								setIsWCConnected={setIsWCConnected}
								pair={pair}
								setPairingCode={setPairingCode}
							/>
						)}
					</>
				) : (
					<>
						<Stack gap={2} align="left" ml={5}>
							<Group mb={10}>
								<Text style={textTextStyle} size="25px">
									Connected Signer:{" "}
								</Text>
								<Text mr={-5} style={textTextStyle} size="25px">
									{selectedOwner ? shortenAddress(selectedOwner.address) : ""}
								</Text>
								<CopyButtonIcon address={safe ? safe.address : ""} />
							</Group>
							<Group>
								<Text mr={-5} style={textTextStyle} size="md">
									Signer Type:{" "}
								</Text>
								<Text style={textTextStyle} size="md">
									{selectedOwner ? signerType[selectedOwner.type] : ""}
								</Text>
							</Group>
						</Stack>
						<Stack gap={10} align="center" my={10}>
							<>
								{isApprovalRequested ? (
									<Box
										style={{ justifyContent: "center", alignItems: "center" }}
										mt={10}
									>
										<Approve
											isDarkTheme={props.isDarkTheme}
											owner={selectedOwner}
											wcRequest={wcRequest as WCRequest}
											isExecuted={isExecuted}
											setIsExecuted={setIsExecuted}
											handleSendApproveHashTx={handleSendApproveHashTx}
										/>
									</Box>
								) : (
									// TODO: add link to `Safe App`
									// e.g. safe.global.app/home?safe=sep:0x4d8152386Ce4aC935d8Cfed93Ae06077025eAd9E
									<>
										<Text
											my={10}
											style={{ ...textTextStyle, textAlign: "center" }}
										>
											Initiate transaction in Safe App
										</Text>
									</>
								)}
							</>

							<Button
								variant="filled"
								color="gray"
								mt={15}
								onClick={() => {
									web3wallet?.disconnectSession({
										topic: session?.topic as string,
										reason: getSdkError("USER_DISCONNECTED"),
									});
									// setSession(undefined);
									setSession(undefined);
									setIsWCConnected(false);
									setIsApprovalRequested(false);
									saveSelectedOwner(undefined);
								}}
							>
								Disconnect
							</Button>
						</Stack>
					</>
				)}
			</Box>
		</>
	);
}
// {wcApproveOpened && (
// 	<WCApprove
// 		owner={selectedOwner}
// 		wcRequest={wcRequest as WCRequest}
// 		isDarkTheme={props.isDarkTheme}
// 		opened={wcApproveOpened}
// 		setOpened={setWCApproveOpened}
// 		isExecuted={isExecuted}
// 		setIsExecuted={setIsExecuted}
// 		handleSendApproveHashTx={handleSendApproveHashTx}
// 	/>
// )}
