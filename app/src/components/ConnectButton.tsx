import { Button } from "@mantine/core";
import {
	useWeb3ModalProvider,
	useWeb3ModalState,
	useWeb3ModalAccount,
	useWeb3Modal,
	useDisconnect,
} from "@web3modal/ethers/react";
import { BottunStyle } from "../styles/styles";
import { getSigner, supportedChainID, switchNetwork } from "../utils/login";
import { useUserContext } from "../contexts";
import { useEffect } from "react";
import { W3mFrameProvider } from "@web3modal/wallet";
import { EthereumProvider } from "@walletconnect/ethereum-provider";

type ConnectButtonProps = {
	isDarkTheme: boolean;
	toggleTheme: () => void;
};
export function ConnectButton(props: ConnectButtonProps) {
	const { safe, signer, saveSigner } = useUserContext();

	const { walletProvider } = useWeb3ModalProvider();
	const { disconnect } = useDisconnect();
	const { address, isConnected, chainId } = useWeb3ModalAccount();
	const { selectedNetworkId } = useWeb3ModalState();
	const modal = useWeb3Modal();

	console.log("walletProvider: ", walletProvider);
	if (walletProvider instanceof EthereumProvider) {
		console.log("[recoverSigner] session: ", walletProvider?.session);
	}
	console.log("address: ", address);
	console.log("isConnected: ", isConnected);
	console.log("chainId: ", chainId);
	console.log("selectedNetworkId: ", selectedNetworkId);
	console.log("signer: ", signer);

	useEffect(() => {
		console.log("useEffect for recoverSigner... ");
		const recoverSigner = async () => {
			// if (safe) {
			// 	if (safe.address !== address) {
			// 		console.log("signer should be the same as safe. disconnecting...");
			// 		disconnect();
			// 	}
			// } else {
			// 	saveSigner(await getSigner(walletProvider));
			// }

			saveSigner(await getSigner(walletProvider));
		};

		if (isConnected && walletProvider && address && signer == undefined) {
			recoverSigner();
		}
	}, [
		isConnected,
		walletProvider,
		signer,
		saveSigner,
		safe,
		address,
		disconnect,
	]);

	return (
		<>
			<Button
				style={BottunStyle(props.isDarkTheme)}
				onClick={() => {
					modal.open();
				}}
			>
				{isConnected ? "Connected" : "Connect"}
			</Button>
		</>
	);
}
