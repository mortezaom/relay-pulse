import type { KVNamespace, ScheduledEvent } from "@cloudflare/workers-types";
import net from "net";

export interface Env {
	RELAY_PULSE_KV: KVNamespace;
}

export default {
	async scheduled(_: ScheduledEvent, env: Env) {
		const MONITORS = [
			{ id: "1", url: "https://example.com" },
			{ id: "2", url: "https://another.com" },
		];

		const now = new Date();
		const dayKey = now.toISOString().slice(0, 10).replace(/-/g, "");
		const minuteIdx = now.getHours() * 60 + now.getMinutes();

		for (const monitor of MONITORS) {
			let isUp = false;
			try {
				const res = await fetch(monitor.url, { method: "GET" });
				isUp = res.ok;
			} catch {
				isUp = false;
			}

			const key = `monitor:${monitor.id}:day:${dayKey}`;
			let statusString =
				(await env.RELAY_PULSE_KV.get(key)) || ".".repeat(1440);

			// Update the current minute
			statusString =
				statusString.slice(0, minuteIdx) +
				(isUp ? "1" : "0") +
				statusString.slice(minuteIdx + 1);

			await env.RELAY_PULSE_KV.put(key, statusString);
		}
	},

	async fetch(request: Request, env: Env) {
		const url = new URL(request.url);

		const netTest = await checkTcpPort("google.com", 80);

		console.log("TCP Test Result:", netTest);

		// Example: GET /status-all?id=1
		if (url.pathname === "/status-all") {
			const id = url.searchParams.get("id");
			if (!id) {
				return new Response("Missing id", { status: 400 });
			}

			const prefix = `monitor:${id}:day:`;
			const list = await env.RELAY_PULSE_KV.list({ prefix });

			const days: Record<
				string,
				{
					statusString: string;
					uptimePercent: number;
					notChecked: number;
				}
			> = {};

			for (const key of list.keys) {
				const date = key.name.slice(prefix.length);
				const statusString = await env.RELAY_PULSE_KV.get(key.name);
				if (statusString) {
					const upCount = statusString
						.split("")
						.filter((c) => c === "1").length;
					const checked = statusString
						.split("")
						.filter((c) => c !== ".").length;
					const notChecked = statusString
						.split("")
						.filter((c) => c === ".").length;
					const percent = checked === 0 ? 0 : (upCount / checked) * 100;
					days[date] = {
						statusString,
						uptimePercent: percent,
						notChecked,
					};
				}
			}

			return Response.json({
				id,
				days,
			});
		}

		return new Response("Not found", { status: 404 });
	},
};

export function checkTcpPort(
	host: string,
	port: number,
	timeoutMs = 3000,
): Promise<boolean> {
	return new Promise((resolve) => {
		const socket = new net.Socket();

		const onError = () => {
			socket.destroy();
			resolve(false);
		};

		socket.setTimeout(timeoutMs);
		socket.once("error", onError);
		socket.once("timeout", onError);

		socket.connect(port, host, () => {
			socket.end();
			resolve(true);
		});
	});
}
