import {
	Text,
	Group,
	Stack,
	Button,
	TextInput,
	Box,
	Anchor,
} from "@mantine/core";
import { useEffect, useState } from "react";

import WalletConnect from "../assets/walletconnect.svg";
import { shortenAddress } from "../utils/shortenAddr";
import { SafeOwner, SignatureParam, WCRequest } from "../utils/types";
import { signerType } from "../utils/constants";
import { Signer } from "ethers";
import { useUserContext } from "../contexts";
import { Aadhaar } from "./Aadhaar";
import { IWeb3Wallet } from "@walletconnect/web3wallet";
import { useWalletConnect } from "../hooks/useWalletConnect";
import { error } from "console";

type ApproveProps = {
	isDarkTheme: boolean;
	owner: SafeOwner | undefined;
	wcRequest: WCRequest;
	isExecuted: boolean;
	setIsExecuted: (value: boolean) => void;
	handleSendApproveHashTx: (param: SignatureParam) => Promise<string>;
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
		setLoading(true);

		if (props.owner?.type === 2) {
			if (!aadhaarProof) {
				setErrorMessage("Generate Aadhaar Proof");
				return;
			}
			setSignatureParam({
				proof: aadhaarProof,
			});
		} else if (props.owner?.type === 3) {
			if (!password) {
				setErrorMessage("Enter password");
				return;
			}
			setSignatureParam({
				password: password,
			});
		} else if (props.owner?.type === 4 && signer) {
			if (!signer) {
				setErrorMessage("Signer Not Connected");
				return;
			}
			setSignatureParam({
				privateSigner: signer,
			});
		} else {
			console.log("signatureParam is undefined");
			setErrorMessage("Type Not Supported");
		}
	};

	const handleAfterApprove = async () => {
		console.log("handleAfterApprove...");
		if (!signatureParam) {
			console.log("signatureParam is undefined");
			return;
		}
		const txHash = await props.handleSendApproveHashTx(signatureParam);
		console.log("txHash: ", txHash);
		setTxHash(txHash);
		setLoading(false);
		props.setIsExecuted(true);
		await onAcceptSessionRequest(txHash);
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
	{
		/* <img src={WalletConnect} alt="delivery" height={50} width={50} /> */
	}
	return (
		<>
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
								// safeMFAOpHash={requestContent.message}
								safeTxHash={requestContent ? requestContent.message : ""}
								handleSetProof={handleSetProof}
							/>
						) : props.owner?.type === 3 ? (
							<TextInput
								variant="filled"
								radius="sm"
								label="Password"
								style={{ width: "80%" }}
								width="150px"
								placeholder="testpassword"
								onChange={(e) => setPassword(e.target.value)}
							/>
						) : props.owner?.type === 4 ? (
							<Text style={textTextStyle}> Connect Private Signer Wallet</Text>
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
							<Text size={"14px"} style={{ color: "red" }}>
								{errorMessage}
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
						>
							{shortenAddress(txHash)}
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
		</>
	);
};
