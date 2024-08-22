import { Text, Group, Stack, Button, Modal, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";

import WalletConnect from "../../assets/walletconnect.svg";
import { shortenAddress } from "../../utils/shortenAddr";
import { SafeOwner, SignatureParam, WCRequest } from "../../utils/types";
import { signerType } from "../../utils/constants";
import { Signer } from "ethers";
import { useUserContext } from "../../contexts";

type WCApproveProps = {
	isDarkTheme: boolean;
	owner: SafeOwner | undefined;
	wcRequest: WCRequest;
	opened: boolean;
	setOpened: (value: boolean) => void;
	isExecuted: boolean;
	setIsExecuted: (value: boolean) => void;
	handleSendApproveHashTx: (param: SignatureParam) => Promise<string>;
};

export const WCApprove = (props: WCApproveProps) => {
	const [password, setPassword] = useState<string>();
	const [signatureParam, setSignatureParam] = useState<SignatureParam>();
	const [isApproved, setIsApproved] = useState<boolean>(false);
	const { signer } = useUserContext();

	const web3wallet = props.wcRequest.web3wallet;
	const requestContent = props.wcRequest.requestContent;

	const onAcceptSessionRequest = async (txHash: string) => {
		const { topic, response } = requestContent;
		console.log("topic: ", topic);
		console.log("response: ", response);

		await web3wallet?.respondSessionRequest({
			topic,
			response: {
				id: response.id,
				jsonrpc: response.jsonrpc,
				result: txHash,
			} as {
				id: number;
				jsonrpc: string;
				result: `0x${string}`;
			},
		});
	};

	const onRejectSessionRequest = async () => {
		const { topic, response } = requestContent;
		const { id } = response as { id: number };
		await web3wallet?.respondSessionRequest({
			topic,
			response: {
				id,
				jsonrpc: "2.0",
				error: {
					code: 5000,
					message: "User rejected.",
				},
			},
		});
	};

	const handleApprove = async () => {
		console.log("handleApprove...");

		if (props.owner?.type === 3 && password) {
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

	useEffect(() => {
		if (props.opened && isApproved && signatureParam && !props.isExecuted) {
			handleAfterApprove();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props, isApproved, signatureParam]);

	// useEffect(() => {
	// 	if (props.owner?.type === 3 && signer) {
	// 		setSignatureParam({
	// 			privateSigner: signer,
	// 		});
	// 	}

	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [props, signer, signatureParam, setSignatureParam]);

	const textTextStyle = {
		color: "black",
		TextAlign: "center",
	};

	return (
		<>
			<Modal
				opened={props.opened}
				onClose={() => {
					setIsApproved(false);
					props.setOpened(false);
					props.setIsExecuted(false);
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
					{!props.isExecuted ? (
						<>
							<Text style={textTextStyle}>Approve Safe Transaction?</Text>
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
												"0x" + props.wcRequest.requestContent.message
											)}
										</Text>
										<Text style={textTextStyle}>
											{signerType[props.owner.type]}{" "}
										</Text>
									</Stack>
								</Group>
							)}

							{props.owner?.type === 3 ? (
								<TextInput
									variant="filled"
									radius="sm"
									label="Password"
									style={{ width: "80%" }}
									width="150px"
									placeholder="testpassword"
									onChange={(e) => setPassword(e.target.value)}
									// onChange={(e) => {
									// 	setSignatureParam({
									// 		password: e.target.value,
									// 	});
									// }}
								/>
							) : props.owner?.type === 4 ? (
								<Text style={textTextStyle}>
									{" "}
									Connect Private Signer Wallet
								</Text>
							) : null}

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
						</>
					) : (
						<>
							<Text style={{ ...textTextStyle, fontSize: "25px" }}>
								Approved!
							</Text>
							<Text style={textTextStyle}>
								Check Safe UI and execute the transaction
							</Text>
						</>
					)}
				</Stack>
			</Modal>
		</>
	);
};
