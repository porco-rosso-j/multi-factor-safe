import { Group, Text } from "@mantine/core";

type FooterProps = {
	isDarkTheme: boolean;
};
export function Footer(props: FooterProps) {
	return (
		<Group
			mt={30}
			pb={20}
			justify="center"
			style={{
				color: props.isDarkTheme ? "white" : "black",
				bottom: 0,
				left: 0,
				right: 0,
			}}
		>
			<Text>Powered by Safe and ERC7579</Text>
		</Group>
	);
}
