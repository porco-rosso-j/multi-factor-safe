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
	"0x87c539e13ad3f81ae01b641b37aa1df1a9bf3f765e08d1c69dfef95f4e0e2227";
const byteArray = hexStringToBytes(hexString);
console.log(byteArray); // Output: Uint8Array [ 49, 167, 188 ]
