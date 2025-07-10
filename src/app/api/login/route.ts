import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import * as z from "zod/v4-mini";
import { COOKIE_AUTH_KEY, getAuthUser } from "@/data/user-storage";
import { comparePassword, generateJWTToken } from "@/lib/encryption";
import { errorResponse, successResponse } from "@/lib/responses";

const loginSchema = z.object({
	email: z.email(),
	password: z.string().check(z.minLength(8), z.trim()),
});

export async function POST(request: NextRequest) {
	try {
		const cfEnv = getCloudflareContext().env;

		const body = loginSchema.safeParse(await request.json());

		if (!body.success) {
			return errorResponse(z.prettifyError(body.error), 422);
		}

		const { email, password } = body.data;

		const authUser = await getAuthUser(cfEnv);

		if (
			!authUser ||
			authUser.email !== email ||
			!comparePassword(password, authUser.password)
		) {
			return errorResponse("Email or Password is incorrect!", 401);
		}

		const authToken = await generateJWTToken({
			email: authUser.email,
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
