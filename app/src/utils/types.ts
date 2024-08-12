import { SessionTypes } from "@walletconnect/types";
import { IWeb3Wallet } from "@walletconnect/web3wallet";

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
