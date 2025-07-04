import type { APIEvent } from "@solidjs/start/server";
import crypto from "node:crypto";
import { getKV } from "~/utils/env";

type Admin = {
	username: string;
	passwordHash: string;
};

export const POST = async (event: APIEvent) => {
	const { request } = event;

	const env = process.env as unknown as {
		ADMIN_USERNAME: string;
		ADMIN_SECRET: string;
	};

	const kv = getKV("RELAY_PULSE_KV");

	const { username, password, secret } = await request.json();

	// Check if admin already exists
	const adminKey = "admin";
	const existing = await kv.get(adminKey);
	if (existing) {
		return new Response(
			JSON.stringify({ ok: false, error: "Admin already exists" }),
			{ status: 400 },
		);
	}

	// Check against env vars
	if (username !== env.ADMIN_USERNAME || secret !== env.ADMIN_SECRET) {
		return new Response(
			JSON.stringify({ ok: false, error: "Invalid admin credentials" }),
			{ status: 401 },
		);
	}

	const passwordHash = await hash(password);
	const admin: Admin = { username, passwordHash };
	await kv.put(adminKey, JSON.stringify(admin));

	return new Response(JSON.stringify({ ok: true }), { status: 200 });
};

async function hash(password: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const salt = crypto.randomBytes(16).toString("hex");

		crypto.scrypt(password, salt, 64, (err, derivedKey) => {
			if (err) reject(err);
			resolve(`${salt}:${derivedKey.toString("hex")}`);
		});
	});
}
