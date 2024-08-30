/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
	readonly VITE_WC_PROJECT_ID_WALLET: string;
	readonly VITE_WC_PROJECT_ID_APP: string;
	readonly VITE_RELAY_URL: string;
	readonly VITE_RELATER_PRIVATE_KEY: string;
	readonly VITE_SEPOLIA_RPC_URL: string;
	readonly VITE_LOCAL: string;
	// more env variables...
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
