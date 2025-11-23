import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NextRequest } from "next/server";
import { errorResponse } from "@/lib/responses";

type RelayPulseEnv = {
  RELAY_PULSE_BUCKET: R2Bucket;
};

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    if (!key) {
      return errorResponse("Key parameter is required", 400);
    }

    const { env } = getCloudflareContext<RelayPulseEnv>();
    const object = await env.RELAY_PULSE_BUCKET.get(key);

    if (object === null) {
      return new Response("Object Not Found", { status: 404 });
    }

    const headers = createMetadataHeaders(object);
    return new Response(object.body, { headers });
  } catch {
    return errorResponse("Internal Server Error", 500);
  }
}

function createMetadataHeaders(object: R2ObjectBody): Headers {
  const headers = new Headers();
  const metadata = object.httpMetadata ?? null;

  if (metadata?.contentType) {
    headers.set("Content-Type", metadata.contentType);
  }
  if (metadata?.contentLanguage) {
    headers.set("Content-Language", metadata.contentLanguage);
  }
  if (metadata?.contentDisposition) {
    headers.set("Content-Disposition", metadata.contentDisposition);
  }
  if (metadata?.contentEncoding) {
    headers.set("Content-Encoding", metadata.contentEncoding);
  }
  if (metadata?.cacheControl) {
    headers.set("Cache-Control", metadata.cacheControl);
  }

  const cacheExpiry = metadata?.cacheExpiry;
  if (cacheExpiry !== undefined && cacheExpiry !== null) {
    headers.set("Expires", new Date(cacheExpiry).toUTCString());
  }

  if (object.httpEtag) {
    headers.set("ETag", object.httpEtag);
  }

  return headers;
}
