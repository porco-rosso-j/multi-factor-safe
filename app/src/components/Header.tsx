import { Group, Text, Button, Anchor, Box } from "@mantine/core";
import { IconSun, IconMoonFilled } from "@tabler/icons-react";
import { imgGithub, imgGithubWhite } from "../assets/index";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ConnectButton } from "./ConnectButton";

type HeaderProps = {
	isDarkTheme: boolean;
	toggleTheme: () => void;
};
export function Header(props: HeaderProps) {
	const location = useLocation();

	const navigate = useNavigate();
	const [menuId, setMenuId] = useState(0);

	useEffect(() => {
		if (menuId == 0) {
			let newMenuId = 0;
			if (location.pathname == "/recovery") {
				newMenuId = 1;
			}
			setMenuId(newMenuId);
		}
	}, [location, menuId]);

	const menuTextStyle = (_menuId: number) => {
		return {
			color: props.isDarkTheme ? "white" : "black",
			opacity: menuId == _menuId ? "100%" : "50%",
			fontSize: "18px",
			cursor: "pointer",
		};
	};

	const handleNavigate = (menu_id: number) => {
		setMenuId(menu_id);
		navigate(menu_id == 0 ? "/" : menu_id == 1 ? "/recovery" : "/");
	};

	const handleRequest = async () => {
		console.log("todo");
	};

	const BottunStyle = {
		marginRight: "35px",
		color: props.isDarkTheme ? "black" : "white",
		backgroundColor: props.isDarkTheme ? "white" : "black",
	};

	return (
		<Group py={20} justify="space-between">
			<Text
				size="25px"
				ml={35}
				c={props.isDarkTheme ? "white" : "black"}
				style={{ fontFamily: "Verdana, sans-serif" }}
			>
				Safe MFA
			</Text>
			<Group gap={30} mt={5}>
				<Text style={menuTextStyle(0)} onClick={() => handleNavigate(0)}>
					Safe Signer
				</Text>
				<Text style={menuTextStyle(1)} onClick={() => handleNavigate(1)}>
					Recovery
				</Text>
			</Group>

			<Group gap={30}>
				<Anchor
					pt={7}
					mr={-3}
					href="https://github.com/porco-rosso-j/multi-factor-safe"
					target="_blank"
					rel="noreferrer"
				>
					<img
						src={props.isDarkTheme ? imgGithubWhite : imgGithub}
						alt="github"
						style={{
							width: 25,
							height: 25,
						}}
					/>
				</Anchor>
				{props.isDarkTheme ? (
					<IconSun
						style={{ color: "white" }}
						onClick={() => {
							props.toggleTheme();
						}}
					/>
				) : (
					<IconMoonFilled
						style={{ color: "black" }}
						onClick={() => {
							props.toggleTheme();
						}}
					/>
				)}
				<Box mr={35}>
					<ConnectButton
						isDarkTheme={props.isDarkTheme}
						toggleTheme={props.toggleTheme}
					/>
				</Box>
			</Group>
		</Group>
	);
}
