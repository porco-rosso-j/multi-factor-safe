import { SessionTypes } from "@walletconnect/types";
import { IWeb3Wallet } from "@walletconnect/web3wallet";
import { Signer } from "ethers";

export type Safe = {
	address: string;
	owners: string[];
	threshold: number;
};

export type SafeOwner = {
	address: string;
	type: number;
};

export type WCRequest = {
	web3wallet: IWeb3Wallet;
	session: SessionTypes.Struct;
	requestContent: WCRequestContent;
};

export type WCRequestContent = {
	method: string;
	message: string;
	topic: string;
	response: any;
};

export type SignatureParam =
	| PasswordParams
	| PrivateEOAParams
	| AnonAadhaarParams;

export type PasswordParams = {
	password: string;
};

export type PrivateEOAParams = {
	privateSigner: Signer;
};

export type AnonAadhaarParams = {
	proof: string;
};

export type TransactionResult = {
	txHash: string;
	success: boolean;
	erorrMessage?: string;
};
