// src/utils/env.ts
import { getRequestEvent } from "solid-js/web";
import type { CloudflareEnv } from "~/types/env";

export function getEnv(): CloudflareEnv {
	const event = getRequestEvent();
	return event?.nativeEvent?.context?.cloudflare?.env as CloudflareEnv;
}

export function getKV(binding: keyof CloudflareEnv = "RELAY_PULSE_KV") {
	const env = getEnv();
	return env[binding];
}
