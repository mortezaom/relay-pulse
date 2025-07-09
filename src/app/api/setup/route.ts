import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-static";

export async function GET() {
	const myKv = getCloudflareContext().env.RELAY_PULSE_KV;
	const foo = await myKv.get("foo");

	return Response.json({ data: "Hello World!", foo });
}
