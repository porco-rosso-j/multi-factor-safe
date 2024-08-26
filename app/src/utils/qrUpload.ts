import { ChangeEvent, Dispatch, SetStateAction } from "react";
import jsQR from "jsqr";

export enum AadhaarQRValidation {
	QR_CODE_SCANNED = "QR code scanned, verifying QR Code 🔎",
	SIGNATURE_VERIFIED = "Signature verified ✅",
	ERROR_PARSING_QR = "QR code invalid ❌",
}

export function text(emoji: string, text: string) {
	const msp = "\u2003"; // 1em space
	return `${emoji}${msp}${text}`;
}

export const uploadQRpng = (
	e: ChangeEvent<HTMLInputElement>,
	setQrStatus: Dispatch<SetStateAction<AadhaarQRValidation | null>>
): Promise<{ qrValue: string }> => {
	return new Promise((resolve, reject) => {
		if (e.target.files) {
			try {
				const fileReader = new FileReader();
				fileReader.readAsDataURL(e.target.files[0]);
				fileReader.onload = (e) => {
					if (e.target && e.target.result) {
						try {
							const image = new Image();
							image.onload = () => {
								const canvas = document.createElement("canvas");
								canvas.width = image.width;
								canvas.height = image.height;
								const ctx = canvas.getContext("2d");

								if (!ctx) throw Error("Image cannot be reconstructed");

								ctx.drawImage(image, 0, 0);
								const imageData = ctx.getImageData(
									0,
									0,
									image.width,
									image.height
								);

								const qrValue = jsQR(imageData.data, image.width, image.height);

								if (qrValue != null) {
									resolve({
										qrValue: qrValue.data,
									});
									setQrStatus(AadhaarQRValidation.QR_CODE_SCANNED);
								} else {
									setQrStatus(AadhaarQRValidation.ERROR_PARSING_QR);
								}
							};
							image.src = e.target.result.toString();
						} catch (error) {
							setQrStatus(AadhaarQRValidation.ERROR_PARSING_QR);
							console.error(error);
							reject(error);
						}
					}
				};
			} catch {
				setQrStatus(null);
				reject(new Error("No file selected"));
			}
		}
	});
};
