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

    // Calling object.writeHttpMetadata(headers) appears to
    // cause a serialization (Devalue) issue.
    const headers = new Headers();

    const meta = (object as any).httpMetadata || {};
    if (meta.contentType) headers.set("Content-Type", meta.contentType);
    if (meta.contentLanguage) headers.set("Content-Language", meta.contentLanguage);
    if (meta.contentDisposition) headers.set("Content-Disposition", meta.contentDisposition);
    if (meta.contentEncoding) headers.set("Content-Encoding", meta.contentEncoding);
    if (meta.cacheControl) headers.set("Cache-Control", meta.cacheControl);
    if (meta.cacheExpiry) headers.set("Expires", new Date(meta.cacheExpiry).toUTCString());

    // Set ETag
    if ((object as any).httpEtag) {
      headers.set("ETag", (object as any).httpEtag);
    }

    return new Response(object.body, {
      headers,
    });
  } catch (e) {
    console.error(e);
    return errorResponse("Internal Server Error", 500);
  }
}
