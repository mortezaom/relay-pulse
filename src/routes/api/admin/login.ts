import type { APIEvent } from "@solidjs/start/server";
import crypto from "node:crypto";
import { getKV } from "~/utils/env";

type Admin = {
	username: string;
	passwordHash: string;
};

export const POST = async ({ request }: APIEvent) => {
	const { username, password } = await request.json();

	const kv = getKV("RELAY_PULSE_KV");

	const adminKey = "admin";
	const data = await kv.get(adminKey);
	if (!data) {
		return new Response(
			JSON.stringify({ ok: false, error: "Admin not set up" }),
			{ status: 400 },
		);
	}

	const admin: Admin = JSON.parse(data);
	if (username !== admin.username) {
		return new Response(
			JSON.stringify({ ok: false, error: "Wrong username" }),
			{ status: 401 },
		);
	}

	const valid = await verify(password, admin.passwordHash);
	if (!valid) {
		return new Response(
			JSON.stringify({ ok: false, error: "Wrong password" }),
			{ status: 401 },
		);
	}

	return new Response(JSON.stringify({ ok: true }), { status: 200 });
};

async function verify(password: string, hash: string) {
	return new Promise((resolve, reject) => {
		const [salt, key] = hash.split(":");
		crypto.scrypt(password, salt, 64, (err, derivedKey) => {
			if (err) reject(err);
			resolve(key === derivedKey.toString("hex"));
		});
	});
}
