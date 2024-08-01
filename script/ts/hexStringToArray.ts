function hexStringToBytes(hex: string): Uint8Array {
	// Remove "0x" prefix if present
	if (hex.startsWith("0x")) {
		hex = hex.slice(2);
	}

	// Ensure the string length is even
	if (hex.length % 2 !== 0) {
		throw new Error("Invalid hex string length");
	}

	// Create a Uint8Array with the appropriate length
	const byteArray = new Uint8Array(hex.length / 2);

	// Convert each pair of hex digits to a byte
	for (let i = 0; i < byteArray.length; i++) {
		byteArray[i] = parseInt(hex.substr(i * 2, 2), 16);
	}

	return byteArray;
}

// Example usage:
const hexString =
	"0xf39fd6e51aad88f6f4ce6ab8827279cfffb9226600007a690000000000000000";
const byteArray = hexStringToBytes(hexString);
console.log(byteArray); // Output: Uint8Array [ 49, 167, 188 ]
