import { Text, Stack } from "@mantine/core";
import { TextStyle } from "../styles/styles";

type RecoveryPageProps = {
	isDarkTheme: boolean;
};

export function Recovery(props: RecoveryPageProps) {
	return (
		<Stack align="center">
			<Text mt={50} style={TextStyle(props.isDarkTheme)}>
				Coming Soon
			</Text>
		</Stack>
	);
}
