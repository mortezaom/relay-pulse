import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import * as z from "zod/v4-mini";
import {
	COOKIE_AUTH_KEY,
	getAuthUser,
	saveAuthUser,
} from "@/data/user-storage";
import { generateJWTToken, hashPassword } from "@/lib/encryption";
import { errorResponse, successResponse } from "@/lib/responses";

const setupSchema = z.object({
	email: z.email(),
	password: z.string().check(z.minLength(8), z.trim()),
	secret: z.string().check(z.trim()),
});

export async function POST(request: NextRequest) {
	try {
		const cfEnv = getCloudflareContext().env;

		const hasAccount = await getAuthUser(cfEnv);

		if (hasAccount) {
			return errorResponse("Already Done!", 400);
		}

		const body = setupSchema.safeParse(await request.json());

		if (!body.success) {
			return errorResponse(z.prettifyError(body.error), 422);
		}

		const { email, password, secret } = body.data;

		const { RELAY_AUTH_EMAIL, RELAY_AUTH_SECRET } = process.env;

		if (email !== RELAY_AUTH_EMAIL || secret !== RELAY_AUTH_SECRET) {
			return errorResponse("Setup is not possible!", 401);
		}

		const hashedPassword = hashPassword(password);

		const savedUser = await saveAuthUser(cfEnv, {
			email: email,
			password: hashedPassword,
		});

		const authToken = await generateJWTToken({
			email: savedUser.email,
		});

		(await cookies()).set({
			name: COOKIE_AUTH_KEY,
			value: authToken,
			secure: true,
			httpOnly: true,
			maxAge: 60 * 60,
		});

		return successResponse({ redirect: "/dashboard" });
	} catch (error) {
		return errorResponse(`${error}`, 500);
	}
}
