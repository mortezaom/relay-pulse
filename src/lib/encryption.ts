import bcrypt from "bcryptjs";
import { type JWTPayload, jwtVerify, SignJWT } from "jose";

const JWT_SECRET = process.env.RELAY_JWT_SECRET;

const encodedKey = new TextEncoder().encode(JWT_SECRET);

export const hashPassword = (password: string) => {
	return bcrypt.hashSync(password, 10);
};

export const comparePassword = (
	inPassword: string,
	hashedPassword: string,
) => {
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
