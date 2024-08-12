export const AccountBoxStyle = (isDarkTheme: boolean) => {
	return {
		width: "700px",
		minWidth: "300px",
		height: "130px",
		padding: "20px",
		margin: "0 30px",
		marginTop: "1.5rem",
		// marginBottom: "1.5rem",
		boxShadow: "rgb(0 0 0 / 8%) 0rem 0.37rem 0.62rem",
		borderRadius: "0.5rem",
		borderColor: isDarkTheme ? "white" : "black",
		borderWidth: "1px",
		borderStyle: "solid",
		/// background: "black",
	};
};

export const MainBoxStyle = (isDarkTheme: boolean) => {
	return {
		width: "700px",
		minWidth: "300px",
		padding: "20px",
		margin: "auto 30px",
		marginBottom: "1rem",
		boxShadow: "rgb(0 0 0 / 8%) 0rem 0.37rem 0.62rem",
		borderRadius: "0.5rem",
		borderColor: isDarkTheme ? "white" : "black",
		borderWidth: "1px",
		borderStyle: "solid",
		/// background: "black",
	};
};

export const BottunStyle = (isDarkTheme: boolean) => {
	return {
		marginRight: "35px",
		color: isDarkTheme ? "black" : "white",
		backgroundColor: isDarkTheme ? "white" : "black",
	};
};
