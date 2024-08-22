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
import { WCApprove } from "../components/modals/WCApprove";
import { SafeOwner, SignatureParam, WCRequest } from "../utils/types";
import { useSendApproveTxHash } from "../hooks/useApproveTxHash";

type SafeSignerPageProps = {
	isDarkTheme: boolean;
};

export function SafeSigner(props: SafeSignerPageProps) {
	const { sendApproveTxHash } = useSendApproveTxHash();
	const { signer, safe } = useUserContext();
	const [owners, setOwners] = useState<SafeOwner[]>([]);
	console.log("safe in SafeSigner page: ", safe);

	const [isExecuted, setIsExecuted] = useState(false);
	const [wcConnectOpened, setWCConnectOpened] = useState(false);
	const [wcApproveOpened, setWCApproveOpened] = useState(false);
	const [selectedOwner, setSelectedOwner] = useState<SafeOwner | undefined>(
		undefined
	);
	console.log("wcConnectOpened: ", wcConnectOpened);
	console.log("selectedOwner: ", selectedOwner);

	const [wcRequest, setWcRequest] = useState<WCRequest>();

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
		if (!wcRequest) {
			return;
		}
		setWCApproveOpened(true);
		setWCConnectOpened(false);
	}, [wcRequest]);

	const handleOpenWCConnect = (signerId: number) => {
		console.log("handleOpenWCConnect signerId: ", signerId);
		setSelectedOwner(owners[signerId]);
		setWCConnectOpened(true);
	};

	const handleSafeTxSession = async (wcRequest: WCRequest) => {
		console.log("handleSafeTxSession...");
		setWcRequest(wcRequest);
	};

	const handleSendApproveHashTx = async (
		param: SignatureParam
	): Promise<string> => {
		console.log("handleSendApproveHashTx...");
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
		<Box style={MainBoxStyle(props.isDarkTheme)}>
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
								style={{ display: "flex", justifyContent: "space-between" }}
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
											style={{ color: props.isDarkTheme ? "white" : "black" }}
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
					owner={selectedOwner}
					isDarkTheme={props.isDarkTheme}
					opened={wcConnectOpened}
					setOpened={setWCConnectOpened}
					handleSafeTxSession={handleSafeTxSession}
				/>
			)}

			{wcApproveOpened && (
				<WCApprove
					owner={selectedOwner}
					wcRequest={wcRequest as WCRequest}
					isDarkTheme={props.isDarkTheme}
					opened={wcApproveOpened}
					setOpened={setWCApproveOpened}
					isExecuted={isExecuted}
					setIsExecuted={setIsExecuted}
					handleSendApproveHashTx={handleSendApproveHashTx}
				/>
			)}
		</Box>
	);
}
