import { Barretenberg, Fr } from "@aztec/bb.js";

export async function pedersenHash(inputs: string[]): Promise<string> {
	const bb: Barretenberg = await Barretenberg.new();
	const inputArray: Fr[] = inputs.map((str) => Fr.fromString(str));
	return (await bb.pedersenHash(inputArray, 0)).toString();
}

export async function pedersenHashBigInt(inputs: bigint[]): Promise<string> {
	const bb: Barretenberg = await Barretenberg.new();
	const inputArray: Fr[] = inputs.map((str) => new Fr(str));
	return (await bb.pedersenHash(inputArray, 0)).toString();
}
