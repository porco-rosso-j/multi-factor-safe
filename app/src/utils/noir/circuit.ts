import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";
import { CompiledCircuit } from "@noir-lang/types";

import PasswordCircuit from "./artifacts/password.json";
import PrivateEoACircuit from "./artifacts/k256.json";

const _passwordCircuit = PasswordCircuit as CompiledCircuit;
const _passwordCircuitBackend = new BarretenbergBackend(_passwordCircuit);
export const passwordCircuit = new Noir(
	_passwordCircuit,
	_passwordCircuitBackend
);

const _privateEoACircuit = PrivateEoACircuit as CompiledCircuit;
const _privateEoACircuitBackend = new BarretenbergBackend(_privateEoACircuit);
export const privateEoACircuit = new Noir(
	_privateEoACircuit,
	_privateEoACircuitBackend
);
