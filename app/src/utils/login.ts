import { BrowserProvider, ethers, Signer } from "ethers";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";

const projectId = import.meta.env.VITE_WC_PROJECT_ID_APP;
if (!projectId) {
	throw new Error("VITE_PROJECT_ID is not set");
}

const ethersConfig = defaultConfig({
	metadata: {
		name: "Safe MFA App",
		description: "Web3Modal Laboratory",
		url: "https://web3modal.com",
		icons: ["https://avatars.githubusercontent.com/u/37784886"],
	},
	// defaultChainId: 5,
	defaultChainId: 11155111,
	rpcUrl: "https://cloudflare-eth.com",
});

const chains = [
	{
		chainId: 11155111,
		name: "Sepolia",
		currency: "ETH",
		explorerUrl: "https://sepolia.etherscan.io/",
		rpcUrl: "https://sepolia.gateway.tenderly.co",
	},
];

// 3. Create modal
createWeb3Modal({
	ethersConfig,
	chains,
	projectId,
	// enableAnalytics: true,
});

// export const supportedChainID = 5;
export const supportedChainID = 11155111;

export const getSigner = async (walletProvider: any): Promise<Signer> => {
	console.log("getSigner walletProvider: ", walletProvider);
	const provider = new BrowserProvider(walletProvider);
	return provider.getSigner();
};

export const switchNetwork = async (walletProvider: any) => {
	try {
		await walletProvider.request({
			method: "wallet_switchEthereumChain",
			params: [{ chainId: ethers.toQuantity(supportedChainID) }],
		});
		console.log("done");
	} catch (err: any) {
		// This error code indicates that the chain has not been added to MetaMask
		if (err.code === 4902) {
			await walletProvider.request({
				method: "wallet_addEthereumChain",
				params: [
					{
						chainName: "Sepolia",
						chainId: ethers.toQuantity(supportedChainID),
						nativeCurrency: {
							name: "ETH",
							decimals: 18,
							symbol: "ETH",
						},
						rpcUrls: ["https://sepolia.gateway.tenderly.co"],
					},
				],
			});
		}
	}
};
