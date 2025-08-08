import { errorResponse } from "@/lib/responses";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    if (!key) {
      return errorResponse("Key parameter is required", 400);
    }

    const cfEnv = getCloudflareContext().env;

    const object = await cfEnv.RELAY_PULSE_BUCKET.get(key);

    if (object === null) {
      return new Response("Object Not Found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);

    return new Response(object.body, {
      headers,
    });
  } catch {
    return errorResponse("Internal Server Error", 500);
  }
}
