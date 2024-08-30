import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider, AppShell, Box, Stack } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Recovery, SafeSigner } from "./pages/index";
import { useTheme, UserContextProviderComponent } from "./contexts";
import { Account, Footer, Header } from "./components";
import { AnonAadhaarProvider } from "@anon-aadhaar/react";
import { initArgsLocal } from "./utils/aadhaar/constants";

const isLocal = import.meta.env.VITE_LOCAL === "true";

export default function App() {
	const { isDarkTheme, toggleTheme } = useTheme();

	return (
		<MantineProvider>
			<AppShell
				style={{
					backgroundColor: isDarkTheme ? "#000000" : "#ffffff",
					background: isDarkTheme
						? "linear-gradient(135deg, #000000, #2e3f34)"
						: "linear-gradient(135deg, #ffffff, #32df6c)",
				}}
				withBorder
			>
				<AppShell.Main>
					<Notifications />
					<UserContextProviderComponent>
						<AnonAadhaarProvider
							_artifactslinks={isLocal ? initArgsLocal : undefined}
							_useTestAadhaar={true}
						>
							<HashRouter>
								<Header isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />
								<Box
									style={{
										display: "flex",
										flexDirection: "column",
										minHeight: "90vh",
									}}
								>
									<Stack
										align="center"
										justify="space-round"
										px={30}
										style={{ flexGrow: 1 }}
									>
										<Stack>
											<Account isDarkTheme={isDarkTheme} />
											<Routes>
												<Route
													path="/"
													element={<SafeSigner isDarkTheme={isDarkTheme} />}
												/>
												<Route
													path="/recovery"
													element={<Recovery isDarkTheme={isDarkTheme} />}
												/>
											</Routes>
										</Stack>
									</Stack>
									<Footer isDarkTheme={isDarkTheme} />
								</Box>
							</HashRouter>
						</AnonAadhaarProvider>
					</UserContextProviderComponent>
				</AppShell.Main>
			</AppShell>
		</MantineProvider>
	);
}
