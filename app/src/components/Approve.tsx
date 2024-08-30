import {
	Text,
	Group,
	Stack,
	Button,
	TextInput,
	Anchor,
	Box,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
	type SafeOwner,
	type SignatureParam,
	type TransactionResult,
	type WCRequest,
	shortenAddress,
	shortenTxHash,
	signerType,
} from "../utils";
import { ConnectButton, Aadhaar } from "../components";
import { useUserContext } from "../contexts";
import { useWalletConnect } from "../hooks/useWalletConnect";

type ApproveProps = {
	isDarkTheme: boolean;
	owner: SafeOwner | undefined;
	wcRequest: WCRequest;
	isExecuted: boolean;
	setIsExecuted: (value: boolean) => void;
	handleSendApproveHashTx: (
		param: SignatureParam
	) => Promise<TransactionResult>;
};

export const Approve = (props: ApproveProps) => {
	const { signer, safe } = useUserContext();

	const [password, setPassword] = useState<string>();
	const [aadhaarProof, setAadhaarProof] = useState<string>();
	const [signatureParam, setSignatureParam] = useState<SignatureParam>();

	const [errorMessage, setErrorMessage] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	console.log("errorMessage: ", errorMessage);
	const web3wallet = props.wcRequest.web3wallet;
	const requestContent = props.wcRequest.requestContent;

	const { _onAcceptSessionRequest, _onRejectSessionRequest } =
		useWalletConnect();

	console.log("type: ", props.owner?.type);
	// console.log("props.wcRequest: ", props.wcRequest);
	// console.log("requestContent: ", requestContent);

	const onAcceptSessionRequest = async (txHash: string) => {
		_onAcceptSessionRequest(web3wallet, txHash, requestContent);
	};

	const onRejectSessionRequest = async () => {
		_onRejectSessionRequest(requestContent);
	};
	const handleApprove = async () => {
		console.log("handleApprove...");
		setErrorMessage("");
		setTxHash("");
		setLoading(true);

		console.log("props.owner: ", props.owner);

		if (props.owner?.type === 2) {
			if (!aadhaarProof) {
				setErrorMessage("Generate Aadhaar Proof");
				setLoading(false);
				return;
			}
			setSignatureParam({
				proof: aadhaarProof,
			});
		} else if (props.owner?.type === 3) {
			if (!password) {
				setErrorMessage("Enter password");
				setLoading(false);
				return;
			}
			setSignatureParam({
				password: password,
			});
		} else if (props.owner?.type === 4) {
			if (!signer) {
				setErrorMessage("Signer Not Connected");
				setLoading(false);
				return;
			}
			setSignatureParam({
				privateSigner: signer,
			});
		} else {
			console.log("signatureParam is undefined");
			setErrorMessage("Type Not Supported");
			setLoading(false);
		}
	};

	const handleAfterApprove = async () => {
		console.log("handleAfterApprove...");
		if (!signatureParam) {
			console.log("signatureParam is undefined");
			return;
		}
		const txResult = await props.handleSendApproveHashTx(signatureParam);
		console.log("txHash: ", txHash);
		if (txResult.success) {
			props.setIsExecuted(true);
			await onAcceptSessionRequest(txResult.txHash);
		} else {
			setErrorMessage(
				txResult.erorrMessage
					? txResult.erorrMessage
					: "Error sending transaction: "
			);
		}
		setTxHash(txResult.txHash);
		setLoading(false);
	};

	const handleSetProof = async (_proof: string) => {
		console.log("handleSetProof...");
		console.log("_proof: ", _proof);
		setAadhaarProof(_proof);
	};

	useEffect(() => {
		if (signatureParam && !props.isExecuted) {
			handleAfterApprove();
			setSignatureParam(undefined);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props, signatureParam]);

	const textTextStyle = {
		color: props.isDarkTheme ? "white" : "black",
		TextAlign: "center",
	};
	return (
		<Box style={{ justifyContent: "center", alignItems: "center" }} mt={10}>
			{!props.isExecuted ? (
				<Stack
					align="center"
					gap={5}
					mt={5}
					mb={10}
					py={20}
					style={{
						height: "340px",
						width: "650px",
						boxShadow: "rgb(0 0 0 / 8%) 0rem 0.37rem 0.62rem",
						borderRadius: "0.3rem",
						borderColor: props.isDarkTheme ? "white" : "black",
						borderWidth: "1px",
						borderStyle: "solid",
						display: "flex", // Ensures flexbox is used
						flexDirection: "column", // Explicitly set to column just to be clear
						justifyContent: "space-between", // Distributes space between children vertically
					}}
				>
					<Text style={textTextStyle} size="20px">
						Approve Safe Transaction
					</Text>
					<>
						{props.owner && (
							<Group
								// mb={10}
								gap={50}
								style={{ justifyContent: "space-between" }}
							>
								<Stack align="left" gap={3}>
									<Text style={textTextStyle}> Safe tx: </Text>
									<Text style={textTextStyle}> Type: </Text>
								</Stack>
								<Stack style={{ alignItems: "flex-end" }} gap={3}>
									<Text style={textTextStyle}>
										{shortenAddress(
											requestContent ? requestContent.message : ""
											// "0x0000000000000000000000000000000000000000000000000000000000000032"
										)}
									</Text>
									<Text style={textTextStyle}>
										{signerType[props.owner.type]}{" "}
									</Text>
								</Stack>
							</Group>
						)}
					</>

					<>
						{props.owner?.type === 2 ? (
							<Aadhaar
								isDarkTheme={props.isDarkTheme}
								address={props.owner.address}
								safeTxHash={requestContent ? requestContent.message : ""}
								// safeTxHash={
								// 	"0x0000000000000000000000000000000000000000000000000000000000000032"
								// }
								handleSetProof={handleSetProof}
							/>
						) : props.owner?.type === 3 ? (
							<TextInput
								variant="filled"
								radius="sm"
								label={
									<Text
										style={{
											...textTextStyle,
											fontSize: "12px",
											opacity: "50%",
										}}
									>
										{" "}
										Password{" "}
									</Text>
								}
								style={{ width: "50%", backgroundColor: "transparent" }}
								placeholder="satoshi20090103"
								onChange={(e) => setPassword(e.target.value)}
							/>
						) : props.owner?.type === 4 ? (
							<Stack align="center">
								<Text style={textTextStyle}>
									{" "}
									Connect an EOA wallet you designated as private owner
								</Text>
								<ConnectButton
									isDarkTheme={props.isDarkTheme}
									toggleTheme={() => ({})}
								/>
							</Stack>
						) : null}
					</>

					<Stack align="center">
						<Group>
							<Button
								variant="light"
								color="red"
								onClick={() => {
									onRejectSessionRequest();
								}}
							>
								Reject
							</Button>
							<Button
								variant="outline"
								color="green"
								loading={loading}
								onClick={() => handleApprove()}
							>
								Approve
							</Button>
						</Group>
						{errorMessage && (
							<Text size={"14px"} style={{ color: "red", textAlign: "center" }}>
								{errorMessage}{" "}
								{txHash && (
									<Anchor
										href={"https://sepolia.etherscan.io/tx/" + txHash}
										target="_blank"
										rel="noreferrer"
										underline="always"
										ml={1}
										style={{
											fontSize: "14px",
											color: "red",
										}}
									>
										{shortenTxHash(txHash)}
									</Anchor>
								)}
							</Text>
						)}
					</Stack>
				</Stack>
			) : (
				// TODO: can show the threshold status after the transaction is executed
				<Stack
					align="center"
					gap={10}
					mt={5}
					mb={10}
					py={50}
					style={{
						height: "340px",
						width: "650px",
						boxShadow: "rgb(0 0 0 / 8%) 0rem 0.37rem 0.62rem",
						borderRadius: "0.3rem",
						borderColor: props.isDarkTheme ? "white" : "black",
						borderWidth: "1px",
						borderStyle: "solid",
					}}
				>
					<Text mt={50} mb={20} size={"20px"} style={textTextStyle}>
						Successfully Approved 🎉
					</Text>
					<Group gap={10}>
						<Text style={textTextStyle}>Transaction Hash: </Text>

						<Anchor
							href={"https://sepolia.etherscan.io/tx/" + txHash}
							target="_blank"
							rel="noreferrer"
							underline="always"
						>
							{txHash ? shortenTxHash(txHash) : ""}
						</Anchor>
					</Group>

					<Anchor
						href={
							"https://app.safe.global/transactions/queue?safe=sep:" +
							safe?.address
						}
						target="_blank"
						rel="noreferrer"
					>
						Go back to Safe App
					</Anchor>
				</Stack>
			)}
		</Box>
	);
};
