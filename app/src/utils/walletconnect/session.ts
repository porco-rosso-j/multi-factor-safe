import { Core } from "@walletconnect/core";
import { buildApprovedNamespaces } from "@walletconnect/utils";
import { sepolia } from "viem/chains";
import { SessionTypes } from "@walletconnect/types";
import { IWeb3Wallet } from "@walletconnect/web3wallet";

export const core = new Core({
	projectId: import.meta.env.VITE_WC_PROJECT_ID_WALLET,
	relayUrl: import.meta.env.VITE_RELAY_URL,
	// logger: "trace",
});

export const web3WalletParams = {
	core,
	metadata: {
		name: "Safe MFA Wallet",
		description: "Demo Client as Wallet/Peer",
		url: "www.walletconnect.com",
		icons: [],
	},
};

export const buildSession = async (
	web3wallet: IWeb3Wallet | undefined,
	params: any,
	id: number,
	address: string
): Promise<SessionTypes.Struct | undefined> => {
	const namespaces = {
		proposal: params,
		supportedNamespaces: {
			eip155: {
				chains: [`eip155:${sepolia.id}`],
				methods: ["eth_sendTransaction", "personal_sign"],
				events: ["accountsChanged", "chainChanged"],
				accounts: [`eip155:${sepolia.id}:${address}`],
			},
		},
	};

	return await web3wallet?.approveSession({
		id,
		namespaces: buildApprovedNamespaces(namespaces),
	});
};
