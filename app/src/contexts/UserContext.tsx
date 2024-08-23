import {
	createContext,
	useContext,
	useState,
	ReactNode,
	useEffect,
} from "react";
import { Signer } from "ethers";
import { Safe, SafeOwner } from "../utils/types";

const UserContext = createContext<UserContextState | null>(null);

export const UserContextProvider = UserContext.Provider;

interface UserContextState {
	signer: Signer | undefined;
	signerAdapter: Signer | undefined;
	safe: Safe | undefined;
	selectedOwner: SafeOwner | undefined;
	saveSigner: (signer: Signer) => void;
	saveSignerAdapter: (signerAdapter: Signer) => void;
	saveSafe: (safe: Safe) => void;
	saveSelectedOwner: (selectedOwner: SafeOwner | undefined) => void;
	removeInstances: () => void;
}

export const useUserContext = () => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error("useUserContext must be used within a UserContextProvider");
	}
	return context;
};

interface UserContextProps {
	children: ReactNode;
}

export const UserContextProviderComponent: React.FC<UserContextProps> = ({
	children,
}) => {
	const [signer, setSigner] = useState<Signer | undefined>();
	const [signerAdapter, setSignerAdapter] = useState<Signer | undefined>();
	const [safe, setSafe] = useState<Safe | undefined>();
	const [selectedOwner, setSelectedOwner] = useState<SafeOwner | undefined>();

	const removeInstances = () => {
		setSigner(undefined);
		setSafe(undefined);
		setSignerAdapter(undefined);
		setSelectedOwner(undefined);
		localStorage.removeItem(`safe`);
		localStorage.removeItem(`signer_adapter`);
	};

	const saveSigner = (_signer: Signer) => {
		setSigner(_signer);
	};

	const saveSafe = (_safe: Safe) => {
		setSafe(_safe);
		if (_safe) {
			localStorage.setItem(`safe`, JSON.stringify(_safe));
		}
	};

	const saveSignerAdapter = (_signerAdapter: Signer) => {
		setSignerAdapter(_signerAdapter);
	};

	const saveSelectedOwner = (_selectedOwner: SafeOwner | undefined) => {
		setSelectedOwner(_selectedOwner);
		localStorage.setItem(
			`selected_owner`,
			JSON.stringify(_selectedOwner ?? null)
		);
	};

	useEffect(() => {
		console.log("[UserContextProviderComponent] useEffect safe... ");
		console.log("safe: ", safe);
		if (!safe) {
			const _safe = localStorage.getItem("safe");
			console.log("_safe: ", _safe);
			if (_safe && _safe !== "undefined") {
				setSafe(JSON.parse(_safe));
			}
		}
	}, [safe]);

	useEffect(() => {
		console.log("[UserContextProviderComponent] useEffect selectedOwner... ");
		console.log("selectedOwner: ", selectedOwner);
		if (!selectedOwner) {
			const _selectedOwner = localStorage.getItem("selected_owner");
			console.log("_selectedOwner: ", _selectedOwner);
			if (_selectedOwner && _selectedOwner !== "undefined") {
				setSelectedOwner(JSON.parse(_selectedOwner));
			}
		}
	}, [selectedOwner]);

	const contextValue: UserContextState = {
		signer,
		signerAdapter,
		safe,
		selectedOwner,
		saveSigner,
		saveSafe,
		saveSignerAdapter,
		saveSelectedOwner,
		removeInstances,
	};
	return (
		<UserContextProvider value={contextValue}>{children}</UserContextProvider>
	);
};
