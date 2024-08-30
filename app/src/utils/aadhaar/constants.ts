import { artifactUrls } from "@anon-aadhaar/core";

type ArtifactsLinks = {
	zkey_url: string;
	wasm_url: string;
	vkey_url: string;
};

export const initArgsLocal: ArtifactsLinks = {
	zkey_url: "/public/circuit_final.zkey",
	vkey_url: "/public/vkey.json",
	wasm_url: "/public/aadhaar-verifier.wasm",
};

export const initArgs = {
	wasmURL: artifactUrls.v2.wasm,
	zkeyURL: artifactUrls.v2.chunked,
	vkeyURL: artifactUrls.v2.vk,
};

export const nullifierSeed = 1234;
