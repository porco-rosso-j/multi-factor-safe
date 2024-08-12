import {
	CopyButton,
	ActionIcon,
	Tooltip,
	rem,
	TextInput,
	Button,
} from "@mantine/core";
import { useState } from "react";

type PasswordInputProps = {
	address: string;
};

export function PasswordInput(props: PasswordInputProps) {
	const [password, setPassword] = useState<string>("");
	return (
		<>
			<TextInput
				variant="filled"
				label="Password"
				radius="sm"
				style={{ width: "90%" }}
				width="150px"
				placeholder="Enter paring code"
				onChange={(e) => setPassword(e.target.value)}
			/>
		</>
	);
}
