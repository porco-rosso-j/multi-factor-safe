import { Text, Group, Stack, Button, TextInput } from "@mantine/core";
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

type ApproveProps = {
	isDarkTheme: boolean;
	owner: SafeOwner | undefined;
	wcRequest: WCRequest;
	isExecuted: boolean;
	setIsExecuted: (value: boolean) => void;
	handleSendApproveHashTx: (param: SignatureParam) => Promise<string>;
};

export const Approve = (props: ApproveProps) => {
	const [password, setPassword] = useState<string>();
	const [aadhaarProof, setAadhaarProof] = useState<string>();
	const [signatureParam, setSignatureParam] = useState<SignatureParam>();
	const [isApproved, setIsApproved] = useState<boolean>(false);
	const { signer } = useUserContext();
	const web3wallet = props.wcRequest.web3wallet;
	const requestContent = props.wcRequest.requestContent;

	const { _onAcceptSessionRequest, _onRejectSessionRequest } = useWalletConnect(
		props.owner
	);

	console.log("type: ", props.owner?.type);
	console.log("props.wcRequest: ", props.wcRequest);
	console.log("requestContent: ", requestContent);

	const onAcceptSessionRequest = async (txHash: string) => {
		_onAcceptSessionRequest(web3wallet, txHash, requestContent);
	};

	const onRejectSessionRequest = async () => {
		_onRejectSessionRequest(requestContent);
	};
	const handleApprove = async () => {
		console.log("handleApprove...");

		if (props.owner?.type === 2 && aadhaarProof) {
			setSignatureParam({
				proof: aadhaarProof,
			});
		} else if (props.owner?.type === 3 && password) {
			setSignatureParam({
				password: password,
			});
		} else if (props.owner?.type === 4 && signer) {
			setSignatureParam({
				privateSigner: signer,
			});
		} else {
			console.log("signatureParam is undefined");
		}

		setIsApproved(true);
	};
	const handleAfterApprove = async () => {
		if (!signatureParam) {
			console.log("signatureParam is undefined");
			return;
		}
		const txHash = await props.handleSendApproveHashTx(signatureParam);
		props.setIsExecuted(true);
		await onAcceptSessionRequest(txHash);
	};

	const handleSetProof = async (_proof: string) => {
		setAadhaarProof(_proof);
	};

	useEffect(() => {
		if (isApproved && signatureParam && !props.isExecuted) {
			handleAfterApprove();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props, isApproved, signatureParam]);

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
					my={20}
					p={10}
					style={{
						height: "250px",
						width: "500px",
						boxShadow: "rgb(0 0 0 / 8%) 0rem 0.37rem 0.62rem",
						borderRadius: "0.5rem",
						borderColor: props.isDarkTheme ? "white" : "black",
						borderWidth: "1px",
						borderStyle: "solid",
					}}
				>
					<Text style={{ ...textTextStyle, size: "25px" }}>
						Approve Safe Transaction
					</Text>
					<>
						{props.owner && (
							<Group
								mb={10}
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
							<>
								<Aadhaar
									isDarkTheme={props.isDarkTheme}
									address={props.owner.address}
									safeMFAOpHash={requestContent.message}
									handleSetProof={handleSetProof}
								/>
							</>
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

					<Group>
						<Button
							onClick={() => {
								onRejectSessionRequest();
							}}
						>
							Reject
						</Button>
						<Button onClick={() => handleApprove()}>Approve</Button>
					</Group>
				</Stack>
			) : (
				<>
					<Text style={{ ...textTextStyle, fontSize: "25px" }}>Approved!</Text>
					<Text style={textTextStyle}>
						Check Safe UI and execute the transaction
					</Text>
				</>
			)}
		</>
	);
};
