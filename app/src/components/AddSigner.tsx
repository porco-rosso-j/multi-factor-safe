/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
	Box,
	Text,
	Group,
	Stack,
	Select,
	Button,
	TextInput,
	Anchor,
} from "@mantine/core";
import { useUserContext } from "../contexts";
import { TextStyle } from "../styles/styles";
import { CopyButtonIcon } from "../components";
import { shortenAddress, shortenTxHash } from "../utils/shortenAddr";
import { FileInput } from "./FileInput";
import { AadhaarQRValidation, uploadQRpng } from "../utils/qrUpload";
import { verifySignature } from "@anon-aadhaar/react";
import { copmuteUserNullifier } from "../utils/computeUserDataHash";
import { ethers } from "ethers";
import { computePasswordHash } from "../utils/secret";
import { getPrivateOwnerHash } from "../utils/k256";
import { deploySignerValidator } from "../utils/validator";
import { useDebouncedValue } from "@mantine/hooks";

type AddSignerPageProps = {
	isDarkTheme: boolean;
	setIsAddSigner: (value: boolean) => void;
};

export function AddSigner(props: AddSignerPageProps) {
	const [password, setPassword] = useState<string>();
	const [debouncedPassword] = useDebouncedValue(password, 300);
	const [passwordHash, setPasswordHash] = useState<string>();
	const [privateOwnerAddress, setPrivateOwnerAddress] = useState<string>();
	const [privateOwnerHash, setPrivateOwnerHash] = useState<string>();

	const [qrStatus, setQrStatus] = useState<null | AadhaarQRValidation>(null);
	console.log("qrStatus: ", qrStatus);
	const [qrData, setQrData] = useState<string>("");
	console.log("qrData: ", qrData);

	const [userDataHash, setUserDataHash] = useState<string | null>("");
	console.log("userDataHash: ", userDataHash);

	const { safe, signer, saveSafe } = useUserContext();
	const [value, setValue] = useState<string>("Aadhaar");

	const [addSignerSuccess, setAddSignerSuccess] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [deployedSigner, setDeployedSigner] = useState<string>("");

	console.log("value: ", value);

	// TODO: not just signer adapter deployment but also adding it to safe with safe-sdk
	// this can be optional via check bo

	const handleAddSigner = async () => {
		console.log("handleAddSigner...");
		setAddSignerSuccess(false);
		setErrorMessage("");
		setTxHash("");
		setLoading(true);

		if (!signer) {
			setErrorMessage("Signer not set. Please connect a wallet");
			setLoading(false);
			return;
		}

		const encoder = ethers.AbiCoder.defaultAbiCoder();
		let data = "";
		let signerType = 0;
		if (value === "Aadhaar") {
			if (!userDataHash) {
				setErrorMessage("Aadhaar QR code not scanned");
				return;
			}

			data = encoder.encode(["uint256"], [userDataHash]);
			signerType = 2;
		} else if (value === "Password") {
			if (!password || !passwordHash) {
				setErrorMessage("Password Signer params not set");
				return;
			}

			data = encoder.encode(["bytes32"], [passwordHash]);
			signerType = 3;
		} else if (value === "Private EOA") {
			if (!privateOwnerAddress || !privateOwnerHash) {
				setErrorMessage("Private EOA params not set");
				return;
			}

			data = encoder.encode(["bytes32"], [privateOwnerHash]);
			signerType = 4;
		} else {
			setErrorMessage("Invalid signing option");
			return;
		}

		if (!data) {
			setErrorMessage("Error generating deployment params");
			return;
		}

		const txResult = await deploySignerValidator(signer, signerType, data);
		console.log("result: ", txResult);

		if (txResult.success && txResult.signerAddress) {
			setErrorMessage("");
			setAddSignerSuccess(true);
			setDeployedSigner(txResult.signerAddress);
		} else {
			setErrorMessage(txResult.errorMessage ? txResult.errorMessage : "");
		}

		setTxHash(txResult.txHash);
		setLoading(false);
	};

	useEffect(() => {
		if (debouncedPassword) {
			computePasswordHash(debouncedPassword).then(setPasswordHash);
		}
	}, [debouncedPassword]);

	useEffect(() => {
		if (privateOwnerAddress) {
			getPrivateOwnerHash(privateOwnerAddress).then((hash) =>
				setPrivateOwnerHash(hash)
			);
		}
	}, [privateOwnerAddress]);

	useEffect(() => {
		if (qrData && !userDataHash) {
			verifySignature(qrData, true)
				.then((verified) => {
					verified.isSignatureValid
						? setQrStatus(AadhaarQRValidation.SIGNATURE_VERIFIED)
						: setQrStatus(AadhaarQRValidation.ERROR_PARSING_QR);
				})
				.catch((error) => {
					setQrStatus(AadhaarQRValidation.ERROR_PARSING_QR);
					console.error(error);
				});

			copmuteUserNullifier(1234, qrData).then((userDataHash) => {
				console.log("userDataHash: ", userDataHash);
				setUserDataHash(userDataHash.toString());
			});
		}
	}, [qrData]);

	useEffect(() => {
		console.log("useEffect... in AddSigner ");
	}, [signer, safe, saveSafe]);

	const textTextStyle = {
		color: props.isDarkTheme ? "white" : "black",
		TextAlign: "center",
	};
	return (
		<Box style={{ justifyContent: "center", alignItems: "center" }} mt={20}>
			<Stack
				align="center"
				gap={5}
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
				<Select
					label={
						<Text
							style={{
								...textTextStyle,
								fontSize: "14px",
								opacity: "70%",
								marginBottom: "5px",
							}}
						>
							Signer Type
						</Text>
					}
					defaultValue={"Aadhaar"}
					placeholder={"Aadhaar"}
					data={["Aadhaar", "Password", "Private EOA"]}
					style={{ width: "90%" }}
					onSearchChange={setValue}
				/>

				{addSignerSuccess ? (
					<Stack align="center">
						<Text size={"20px"} style={textTextStyle}>
							Successfully Created 🎉
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
						<Group gap={10} mt={-10}>
							<Text style={textTextStyle}>Deployed Signer Validator: </Text>
							<Anchor
								href={"https://sepolia.etherscan.io/address/" + deployedSigner}
								target="_blank"
								rel="noreferrer"
								underline="always"
							>
								{deployedSigner ? shortenAddress(deployedSigner) : ""}
							</Anchor>
						</Group>

						{/* 
                        !!!! Don't delete this despite being commented-out !!!
                        <Anchor
							mb={5}
							href={
								"https://app.safe.global/settings/setup?safe=sep:" +
								safe?.address
							}
							target="_blank"
							rel="noreferrer"
						>
							Go to Safe App
						</Anchor> */}
					</Stack>
				) : (
					<>
						{value === "Aadhaar" ? (
							<Stack align="center">
								<Text style={TextStyle(props.isDarkTheme)}>
									Upload your Aadhaar secure QR Code
								</Text>
								<FileInput
									isDarkTheme={props.isDarkTheme}
									onChange={async (e) => {
										const { qrValue } = await uploadQRpng(e, setQrStatus);
										setQrData(qrValue);
									}}
									id={"handlePdfChange"}
								/>
								{userDataHash && (
									<Group
										mb={10}
										gap={50}
										style={{ justifyContent: "space-between" }}
									>
										<Stack align="left" gap={3}>
											<Text style={textTextStyle}> Status: </Text>
											<Text style={textTextStyle}> User Nullifier: </Text>
										</Stack>
										<Stack style={{ alignItems: "flex-end" }} gap={3}>
											<Text style={textTextStyle}>{qrStatus}</Text>
											<Text style={textTextStyle}>
												{userDataHash ? shortenAddress(userDataHash) : ""}
											</Text>
										</Stack>
									</Group>
								)}
							</Stack>
						) : value === "Password" ? (
							<Stack align="center">
								<Text style={TextStyle(props.isDarkTheme)}>
									Enter a password to sign the transaction
								</Text>
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
									style={{ width: "100%", backgroundColor: "transparent" }}
									placeholder="satoshi20090103"
									onChange={(e) => setPassword(e.target.value)}
								/>
								{passwordHash && (
									<Group>
										<Text mr={-5} style={TextStyle(props.isDarkTheme)}>
											{" "}
											Password Hash: {shortenTxHash(passwordHash)}
										</Text>
										<CopyButtonIcon address={passwordHash} />
									</Group>
								)}
							</Stack>
						) : value === "Private EOA" ? (
							<Stack align="center">
								<Text style={TextStyle(props.isDarkTheme)}>
									Enter an EOA address you want to designate as private owner
								</Text>
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
											Address{" "}
										</Text>
									}
									style={{ width: "100%", backgroundColor: "transparent" }}
									placeholder="0x123..."
									onChange={(e) => setPrivateOwnerAddress(e.target.value)}
								/>
								{privateOwnerHash && (
									<Group>
										<Text mr={-5} style={TextStyle(props.isDarkTheme)}>
											{" "}
											Owner Hash: {shortenTxHash(privateOwnerHash)}
										</Text>
										<CopyButtonIcon address={privateOwnerHash} />
									</Group>
								)}
							</Stack>
						) : null}
					</>
				)}

				<Group>
					<Button
						variant="filled"
						color="gray"
						onClick={() => {
							setAddSignerSuccess(false);
							props.setIsAddSigner(false);
						}}
					>
						Back
					</Button>
					<Button
						disabled={addSignerSuccess}
						variant="outline"
						color="green"
						loading={loading}
						onClick={() => handleAddSigner()}
					>
						Confirm
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
		</Box>
	);
}
