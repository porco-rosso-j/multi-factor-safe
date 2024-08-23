import { useCallback, useEffect, useRef, useState } from "react";
import {
	Web3Wallet,
	type Web3WalletTypes,
	type IWeb3Wallet,
} from "@walletconnect/web3wallet";
import type { SessionTypes } from "@walletconnect/types";
import { getSdkError } from "@walletconnect/utils";
import { buildSession, web3WalletParams } from "../utils/walletconnect";
import { SafeOwner, WCRequest, WCRequestContent } from "../utils/types";

export function useWalletConnect(owner: SafeOwner | undefined) {
	const [web3wallet, setWeb3Wallet] = useState<IWeb3Wallet>();
	const [pairingCode, setPairingCode] = useState<string>("");
	const [session, setSession] = useState<SessionTypes.Struct>();
	const [wcRequest, setWcRequest] = useState<WCRequest>();
	const [isWCConnected, setIsWCConnected] = useState(false);

	const pair = async () => {
		console.log("pairingCode: ", pairingCode);
		console.log("web3wallet: ", web3wallet);
		if (pairingCode) {
			let _web3wallet = web3wallet;
			if (!_web3wallet) {
				console.log("initWeb3Wallet...");
				_web3wallet = await initWeb3Wallet();
			}
			// TODO: clean up existing connections?
			console.log("_web3wallet: ", _web3wallet);
			if (_web3wallet) {
				try {
					console.log("paring.....: ");
					await _web3wallet.pair({ uri: pairingCode, activatePairing: true });
					setIsWCConnected(true);
				} catch (e) {
					console.error("Error pairing with uri", e);
				}
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

			if (!owner) {
				console.error("Owner not available");
				return;
			}

			try {
				const session = await buildSession(
					web3wallet,
					params,
					id,
					owner.address
				);
				setSession(session);
			} catch (error) {
				await web3wallet?.rejectSession({
					id,
					reason: getSdkError("USER_REJECTED"),
				});
			}
		},
		[owner, web3wallet]
	);

	const onSessionRequest = useCallback(
		async (event: Web3WalletTypes.SessionRequest) => {
			// TODO: chekc if the owner is the same as the one in the session

			if (!owner) {
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

			setWcRequest(wcRequest);
			console.log("wcRequest set: ", wcRequest);

			await web3wallet?.respondSessionRequest({
				topic,
				response: response,
			});
		},

		[owner, session, web3wallet]
	);

	const initWeb3Wallet = async (): Promise<IWeb3Wallet | undefined> => {
		try {
			const w3w = await Web3Wallet.init(web3WalletParams);
			console.log("w3w: ", w3w);
			setWeb3Wallet(w3w);
			return w3w;
		} catch (e) {
			console.error("Error initializing web3wallet", e);
		}
	};

	useEffect(() => {
		// TODO: owner should be stored in local storage
		// otherwise, auto-recover web3 wallet is hard
		/// console.log("props.owner: ", props.owner);

		// if (!web3wallet && props.owner && props.owner.address) {
		// 	console.log("init");
		// 	initWeb3Wallet();
		// }
		if (!web3wallet) {
			console.log("initWeb3Wallet...");
			initWeb3Wallet();
		}
	}, [web3wallet]);

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
				setIsWCConnected(
					sessionsLen > 1
						? Object.keys(activeSessions).length > 1
						: Object.keys(activeSessions).length > 0
				);
			}
			// props.setIsWCConnected(true);

			return () => {
				// Don't forget to clean up
				web3wallet.off("session_proposal", onSessionProposal);
				web3wallet.off("session_request", handleSessionRequest);
			};
		}
	}, [onSessionProposal, onSessionRequest, web3wallet]);

	const _onAcceptSessionRequest = async (
		web3wallet: IWeb3Wallet,
		txHash: string,
		requestContent: WCRequestContent
	) => {
		const { topic, response } = requestContent;
		console.log("topic: ", topic);
		console.log("response: ", response);

		await web3wallet.respondSessionRequest({
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

	const _onRejectSessionRequest = async (requestContent: WCRequestContent) => {
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

	return {
		web3wallet,
		session,
		wcRequest,
		isWCConnected,
		pair,
		setSession,
		setPairingCode,
		setIsWCConnected,
		_onAcceptSessionRequest,
		_onRejectSessionRequest,
	};
}
