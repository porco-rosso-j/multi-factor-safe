import { Core } from "@walletconnect/core";
import {
	Web3Wallet,
	type Web3WalletTypes,
	type IWeb3Wallet,
} from "@walletconnect/web3wallet";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	BarretenbergBackend,
	BarretenbergVerifier as Verifier,
} from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";
import { CompiledCircuit, ProofData } from "@noir-lang/types";
import circuit from "./circuits/password.json";

import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import {
	createWalletClient,
	hexToString,
	http,
	type PrivateKeyAccount,
	type WalletClient,
} from "viem";
import { mainnet, sepolia } from "viem/chains";
import type { SessionTypes } from "@walletconnect/types";
import {
	getCommitmentHash,
	getSaltForPasswordCiruict,
	getSecretBytesAndHashFromSecret,
} from "./utils/secret";

function App() {
	const [web3wallet, setWeb3Wallet] = useState<IWeb3Wallet>();
	const [wallet, setWallet] = useState<WalletClient>();
	const [account, setAccount] = useState<PrivateKeyAccount>();
	const [secret, setSecret] = useState<string>("");

	const [uri, setUri] = useState<string>();
	console.log("uri: ", uri);
	const [address, setAddress] = useState<string>();
	console.log("address: ", address);
	const [session, setSession] = useState<SessionTypes.Struct>();
	console.log("session: ", session);

	const [isConnected, setIsConnected] = useState<boolean>(false);
	console.log(isConnected);
	const [requestContent, setRequestContent] = useState({
		method: "",
		message: "",
		topic: "",
		response: {},
	});

	console.log("requestContent: ", requestContent);

	const dialogRef = useRef<HTMLDialogElement>(null);

	const chain = sepolia;

	const init = async () => {
		const core = new Core({
			projectId: import.meta.env.VITE_PROJECT_ID,
			relayUrl: import.meta.env.VITE_RELAY_URL,
			logger: "trace",
		});
		const w3w = await Web3Wallet.init({
			core,
			metadata: {
				name: "SafeMultisig Demo",
				description: "Demo Client as Wallet/Peer",
				url: "www.walletconnect.com",
				icons: [],
			},
		});
		console.log("w3w", w3w);

		setWeb3Wallet(w3w);
		console.log("setWeb3Wallet");
	};

	const onSessionProposal = useCallback(
		async ({ id, params }: Web3WalletTypes.SessionProposal) => {
			console.log("id: ", id);
			console.log("params: ", params);

			try {
				if (!address) {
					throw new Error("Address not available");
				}
				const namespaces = {
					proposal: params,
					supportedNamespaces: {
						eip155: {
							chains: [`eip155:${chain.id}`],
							methods: [
								"eth_sendTransaction",
								"personal_sign",
								"eth_sign",
								"eth_signTypedData",
								"eth_signTypedData_v4",
							],
							events: ["accountsChanged", "chainChanged"],
							accounts: [`eip155:${chain.id}:${address}`],
						},
					},
				};

				console.log("namespaces", namespaces);

				const approvedNamespaces = buildApprovedNamespaces(namespaces);

				const session = await web3wallet?.approveSession({
					id,
					namespaces: approvedNamespaces,
				});

				setSession(session);
			} catch (error) {
				await web3wallet?.rejectSession({
					id,
					reason: getSdkError("USER_REJECTED"),
				});
			}
		},
		[address, chain, web3wallet]
	);

	const onAcceptSessionRequest = async () => {
		const { topic, response } = requestContent;
		console.log("topic: ", topic);
		console.log("response: ", response);

		await web3wallet?.respondSessionRequest({
			topic,
			response: response as {
				id: number;
				jsonrpc: string;
				result: `0x${string}`;
			},
		});
		dialogRef.current?.close();
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
		dialogRef.current?.close();
	};

	const onSessionRequest = useCallback(
		async (event: Web3WalletTypes.SessionRequest) => {
			const { topic, params, id } = event;
			console.log("params: ", params);
			console.log("id: ", id);
			console.log("topic: ", topic);

			const { request } = params;
			console.log("request: ", request);

			const requestParamsMessage = request.params[0];
			console.log("requestParamsMessage: ", requestParamsMessage);

			const passwordCircuit = circuit as CompiledCircuit;
			const backend = new BarretenbergBackend(passwordCircuit);
			const noir = new Noir(passwordCircuit);

			const salt = await getSaltForPasswordCiruict();
			console.log("salt: ", salt);

			const { secretBytes, secretHash } = await getSecretBytesAndHashFromSecret(
				//secret
				"test",
				salt
			);

			console.log("address: ", address);
			const commitmentHash = await getCommitmentHash(
				address as string,
				requestParamsMessage
			);

			const input = {
				preimage: secretBytes,
				password_hash: secretHash,
				salt: salt,
				commitment_hash: commitmentHash,
			};

			console.log("input: ", input);

			const { witness } = await noir.execute(input);
			const proof = await backend.generateProof(witness);
			console.log("proof: ", proof.proof);
			console.log("public inputs: ", proof.publicInputs);
			// const isValid = await backend.verifyProof(proof);
			// console.log("isValid: ", isValid);

			// const message = hexToString(requestParamsMessage);
			// console.log("message: ", message);

			// const signedMessage = await wallet?.signMessage({
			// 	account: account as PrivateKeyAccount,
			// 	message,
			// });

			// console.log("signedMessage: ", signedMessage);

			// console.log("proof str: ", proof.proof.toString());
			const proofStr = Array.from(proof.proof)
				.map((byte) => byte.toString(16).padStart(2, "0"))
				.join("");

			console.log("proof str: ", proofStr);

			setRequestContent({
				message: requestParamsMessage, // test
				method: request.method,
				topic,
				response: {
					id,
					jsonrpc: "2.0",
					result: "0x" + proofStr + "00",
					// result: "0x" + proofStr,
				},
			});

			dialogRef.current?.showModal();
		},
		[address]
	);

	const handleAddr = async (addr: string) => {
		setAddress(addr);
	};

	const pair = async () => {
		console.log("pair");
		console.log("web3wallet", web3wallet);
		if (uri && web3wallet) {
			try {
				console.log("pairing with uri", uri);
				await web3wallet.pair({ uri });
				setIsConnected(true);
			} catch (e) {
				console.error("Error pairing with uri", e);
			}
		}
	};

	useEffect(() => {
		if (address) {
			console.log("init");
			init();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	useEffect(() => {
		if (web3wallet) {
			web3wallet.on("session_proposal", onSessionProposal);
			web3wallet.on("session_request", onSessionRequest);

			const activeSessions = web3wallet?.getActiveSessions();

			if (activeSessions) {
				const currentSession = Object.values(activeSessions)[0];
				setSession(currentSession);
				setIsConnected(Object.keys(activeSessions).length > 0);
			}
		}
	}, [onSessionProposal, onSessionRequest, web3wallet]);

	return (
		<>
			<p>
				{" "}
				{address ? (
					"Address: " + address
				) : (
					<div className="form-container">
						<p>Safe owner address: </p>
						<input
							type="text"
							onChange={(e) => handleAddr(e.target.value)}
							placeholder="Enter Address"
							className="uri-input"
						/>
					</div>
				)}{" "}
			</p>

			<div className="form-container">
				<input
					type="text"
					onChange={(e) => setUri(e.target.value)}
					placeholder="Enter URI"
					className="uri-input"
				/>
				<button type="button" onClick={pair}>
					Pair
				</button>
			</div>
			<a
				className="my-1"
				href="https://react-app.walletconnect.com/"
				target="_blank"
				rel="noreferrer noopener"
			>
				Use this to test
			</a>
			{isConnected && (
				<button
					type="button"
					onClick={() => {
						web3wallet?.disconnectSession({
							topic: session?.topic as string,
							reason: {
								code: 5000,
								message: "User disconnected",
							},
						});
						setIsConnected(false);
					}}
				>
					Disconnect Session
				</button>
			)}
			<dialog ref={dialogRef}>
				<h3>
					New approval for <span>{requestContent.method}</span>
				</h3>
				<code>{requestContent.message}</code>
				<div className="btn-container">
					<button type="button" onClick={onAcceptSessionRequest}>
						Accept
					</button>
					<button type="button" onClick={onRejectSessionRequest}>
						Reject
					</button>
				</div>
			</dialog>
		</>
	);
}

export default App;
