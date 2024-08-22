import { ethers } from "ethers";
import { pedersenHash } from "./pedersenTest";
import { parseUint8ArrayToBytes32 } from "./commitmentHash";

const getOwnerHash = async (
	ownerAddress: string,
	safeAddress: string,
	chainId: number
) => {
	// const domainSeparator = ethers.solidityPackedKeccak256(
	// 	["address", "uint32"],
	// 	[safeAddress, chainId]
	// );
	const domainSeparator = ethers.solidityPackedKeccak256(
		["address", "uint256"],
		[safeAddress, chainId]
	);
	console.log("domainSeparator: ", domainSeparator);
	// 0xbcb864b0ee24f7f5fc72cecff9ac7f9ea5b2fd58b33c5032b53a9c17b4ed1f91
	const parsedDomainSeparator = await parseUint8ArrayToBytes32(
		ethers.getBytes(domainSeparator)
	);

	const inputArray: string[] = [ownerAddress, ...parsedDomainSeparator];
	const ownerHash = await pedersenHash(inputArray.map((s) => BigInt(s)));

	console.log("ownerHash: ", ownerHash);
};

// Example usage:
getOwnerHash(
	"0x91a399e2f7b768e627f1f7aff2df88ba73813911",
	"0x4d8152386ce4ac935d8cfed93ae06077025ead9e",
	11155111
);
