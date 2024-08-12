import {
	createContext,
	useContext,
	useState,
	ReactNode,
	useEffect,
} from "react";
import { Signer } from "ethers";
import { Safe } from "../utils/types";

const UserContext = createContext<UserContextState | null>(null);

export const UserContextProvider = UserContext.Provider;

interface UserContextState {
	signer: Signer | undefined;
	safe: Safe | undefined;
	signerAdapter: Signer | undefined;
	saveSigner: (signer: Signer) => void;
	saveSafe: (safe: Safe) => void;
	saveSignerAdapter: (signerAdapter: Signer) => void;
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
	const [safe, setSafe] = useState<Safe | undefined>();
	const [signerAdapter, setSignerAdapter] = useState<Signer | undefined>();

	const removeInstances = () => {
		setSigner(undefined);
		setSafe(undefined);
		setSignerAdapter(undefined);
		localStorage.removeItem(`safe`);
		localStorage.removeItem(`signer_adapter`);
	};

	const saveSigner = (_signer: Signer) => {
		setSigner(_signer);
		// localStorage.setItem(`signer`, JSON.stringify(_signer));
	};

	const saveSafe = (_safe: Safe) => {
		setSafe(_safe);
		if (_safe) {
			localStorage.setItem(`safe`, JSON.stringify(_safe));
		}
	};

	const saveSignerAdapter = (_signerAdapter: Signer) => {
		setSignerAdapter(_signerAdapter);
		// localStorage.setItem(`signer_adapter`, JSON.stringify(_signerAdapter));
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

	const contextValue: UserContextState = {
		signer,
		safe,
		signerAdapter,
		saveSigner,
		saveSafe,
		saveSignerAdapter,
		removeInstances,
	};
	return (
		<UserContextProvider value={contextValue}>{children}</UserContextProvider>
	);
};
