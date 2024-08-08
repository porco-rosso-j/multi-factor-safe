import { Barretenberg, Fr } from "@aztec/bb.js";

async function main() {
	const inputArray: bigint[] = [1n, 2n, 3n];

	const result = await pedersenHash(inputArray);
	console.log("result: ", result);
}

export async function pedersenHash(inputs: bigint[]): Promise<string> {
	const bb: Barretenberg = await Barretenberg.new();
	console.log("inputs: ", inputs);
	const inputArray: Fr[] = inputs.map((str) => new Fr(str));
	console.log("inputArray Fr: ", inputArray);
	return (await bb.pedersenHash(inputArray, 0)).toString();
}

// 0x0c21b8e26f60b476d9568df4807131ff70d8b7fffb03fa07960aa1cac9be7c46

main();

/*
export async function getSecretBytesAndHashFromSecret(
	_secret: string,
	salt: string[]
): Promise<SecretBytesAndHash> {
	const PaddedSecretBytes = await getPaddedSecretBytes(_secret);
	console.log("PaddedSecretBytes: ", PaddedSecretBytes);

	const _hash = await pedersenHash(PaddedSecretBytes);
	console.log("_hash: ", _hash);

	const hash = await pedersenHash([
		BigInt(_hash),
		...salt.map((s) => BigInt(s)),
	]);
	console.log("hash: ", hash);
	return {
		secretBytes: PaddedSecretBytes.map((s) => s.toString()),
		secretHash: hash,
	};
}
*/
