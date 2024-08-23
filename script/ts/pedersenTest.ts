import { Barretenberg, Fr } from "@aztec/bb.js";

export async function pedersenHash(inputs: bigint[]): Promise<string> {
	const bb: Barretenberg = await Barretenberg.new();
	// console.log("inputs: ", inputs);
	const inputArray: Fr[] = inputs.map((str) => new Fr(str));
	//console.log("inputArray Fr: ", inputArray);
	return (await bb.pedersenHash(inputArray, 0)).toString();
}

// 0x0c21b8e26f60b476d9568df4807131ff70d8b7fffb03fa07960aa1cac9be7c46

async function main() {
	// const inputArray: bigint[] = [1n, 2n, 3n];
	const inputArray: bigint[] = [0x91a399e2f7b768e627f1f7aff2df88ba73813911n];

	// const inputArray: bigint[] = [
	// 	0x91a399e2f7b768e627f1f7aff2df88ba73813911n,
	// 	104n,
	// 	180n,
	// 	171n,
	// 	96n,
	// 	220n,
	// 	243n,
	// 	144n,
	// 	50n,
	// 	0n,
	// 	243n,
	// 	196n,
	// 	36n,
	// 	122n,
	// 	173n,
	// 	193n,
	// 	146n,
	// 	6n,
	// 	179n,
	// 	23n,
	// 	80n,
	// 	130n,
	// 	243n,
	// 	86n,
	// 	120n,
	// 	244n,
	// 	174n,
	// 	100n,
	// 	147n,
	// 	213n,
	// 	51n,
	// 	243n,
	// 	148n,
	// ];

	const _domainSeparator = [
		188, 184, 100, 176, 238, 36, 247, 245, 252, 114, 206, 207, 249, 172, 127,
		158, 165, 178, 253, 88, 179, 60, 80, 50, 181, 58, 156, 23, 180, 237, 31,
		145,
	];

	// const inputArray: bigint[] = [
	// 	0x91a399e2f7b768e627f1f7aff2df88ba73813911n,
	// 	..._domainSeparator.map((s) => BigInt(s)),
	// ];

	const result = await pedersenHash(inputArray);
	console.log("result: ", result);
}

main();
