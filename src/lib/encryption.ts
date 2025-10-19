import bcrypt from "bcryptjs";
import { type JWTPayload, jwtVerify, SignJWT } from "jose";

const JWT_SECRET = process.env.RELAY_JWT_SECRET;

const encodedKey = new TextEncoder().encode(JWT_SECRET);

export const hashPassword = (password: string) => {
	return bcrypt.hashSync(password, 10);
};

export const comparePassword = (inPassword: string, hashedPassword: string) => {
	return bcrypt.compareSync(inPassword, hashedPassword);
};

export const generateJWTToken = (data: object) => {
	return new SignJWT({ ...data })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("1h")
		.sign(encodedKey);
};

export async function verifyJWTToken(
	token: string | null,
): Promise<(JWTPayload & { email: string }) | null> {
	if (!token) return null;
	try {
		const { payload } = await jwtVerify(token, encodedKey, {
			algorithms: ["HS256"],
		});
		return payload as JWTPayload & { email: string };
	} catch {
		return null;
	}
}

/**
 * Encrypt data using Web Crypto API (AES-GCM)
 */
export async function encrypt(data: string, password: string): Promise<string> {
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);

	// Generate key from password
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		encoder.encode(password),
		{ name: "PBKDF2" },
		false,
		["deriveBits", "deriveKey"]
	);

	// Generate salt
	const salt = crypto.getRandomValues(new Uint8Array(16));

	// Derive encryption key
	const key = await crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt,
			iterations: 100000,
			hash: "SHA-256",
		},
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt"]
	);

	// Generate IV
	const iv = crypto.getRandomValues(new Uint8Array(12));

	// Encrypt data
	const encryptedBuffer = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		dataBuffer
	);

	// Combine salt + iv + encrypted data
	const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
	combined.set(salt, 0);
	combined.set(iv, salt.length);
	combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);

	// Return as base64
	return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt data using Web Crypto API (AES-GCM)
 */
export async function decrypt(encryptedData: string, password: string): Promise<string> {
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();

	// Decode base64
	const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

	// Extract salt, iv, and encrypted data
	const salt = combined.slice(0, 16);
	const iv = combined.slice(16, 28);
	const encryptedBuffer = combined.slice(28);

	// Generate key from password
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		encoder.encode(password),
		{ name: "PBKDF2" },
		false,
		["deriveBits", "deriveKey"]
	);

	// Derive decryption key
	const key = await crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt,
			iterations: 100000,
			hash: "SHA-256",
		},
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		false,
		["decrypt"]
	);

	// Decrypt data
	const decryptedBuffer = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv },
		key,
		encryptedBuffer
	);

	return decoder.decode(decryptedBuffer);
}
