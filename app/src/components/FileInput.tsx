import React, { useState, ChangeEvent } from "react";
import { Group, Button, Text, InputWrapper, Stack } from "@mantine/core";
import { TextStyle } from "../styles/styles";

type FileInputProps = {
	isDarkTheme: boolean;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	id: string;
};

export const FileInput = (props: FileInputProps) => {
	const [fileName, setFileName] = useState("");

	return (
		<Stack align="center">
			<Button
				variant="light"
				component="label"
				htmlFor={props.id}
				style={{
					cursor: "pointer",
				}}
			>
				Choose file
				<input
					type="file"
					id={props.id}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						if (!e.target.files) return;
						setFileName(e.target.files[0].name);
						props.onChange(e);
					}}
					accept="image/*"
					hidden
				/>
			</Button>
			<Text size={"xs"} mt={-10} style={TextStyle(props.isDarkTheme)}>
				{fileName ? "Name: " + fileName : ""}
			</Text>
		</Stack>
	);
};

// import React, { FunctionComponent, ChangeEvent, useState } from "react";
// import styled from "styled-components";

// interface FileInputProps {
// 	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
// 	id: string;
// }

// export const FileInput: FunctionComponent<FileInputProps> = ({
// 	onChange,
// 	id,
// }) => {
// 	const [fileName, setFileName] = useState<string>("No file selected");
// 	return (
// 		<InputFile>
// 			<UploadButton htmlFor={id}>Choose file</UploadButton>
// 			<input
// 				type="file"
// 				id={id}
// 				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
// 					if (!e.target.files) return;
// 					setFileName(e.target.files[0].name);
// 					onChange(e);
// 				}}
// 				accept="image/*"
// 				hidden
// 			/>
// 			<FileName id="file-chosen">{fileName}</FileName>
// 		</InputFile>
// 	);
// };

// const FileName = styled.span`
// 	margin-left: 5px;
// `;

// const InputFile = styled.div`
// 	display: flex;
// 	align-items: center;
// 	overflow: hidden;
// 	white-space: nowrap;
// 	text-overflow: ellipsis;
// 	max-width: 80%;
// 	border-radius: 0.5rem;
// 	border-width: 1px;
// 	border-color: #d1d5db;
// 	max-width: 100%;
// 	font-size: 0.875rem;
// 	line-height: 1.25rem;
// 	color: #111827;
// 	background-color: #f9fafb;
// 	cursor: pointer;
// 	margin-top: 0.3rem;
// `;

// const UploadButton = styled.label`
// 	color: #111827;
// 	background-color: #345c93;
// 	color: white;
// 	padding: 0.5rem;
// 	font-family: sans-serif;
// 	cursor: pointer;
// `;
