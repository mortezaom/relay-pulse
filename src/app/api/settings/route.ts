/**
 * Global Settings API
 * GET /api/settings - Get current settings
 * POST /api/settings - Update settings
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getGlobalSettings, saveGlobalSettings } from "@/lib/settings";

export const runtime = "edge";

/**
 * GET - Retrieve global settings
 */
export async function GET(_request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const settings = await getGlobalSettings(env);

    return NextResponse.json({
      ok: true,
      data: { settings },
    });
  } catch (error) {
    console.error("Failed to get settings:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to retrieve settings" },
      { status: 500 }
    );
  }
}

/**
 * POST - Update global settings
 */
export async function POST(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const body = (await request.json()) as {
      appName?: string;
      defaultMonitoringInterval?: number;
      defaultAlertThreshold?: number;
      maxServices?: number;
      tcpCheckerUrl?: string;
    };

    // Get current settings
    const currentSettings = await getGlobalSettings(env);

    // Update only provided fields
    const updatedSettings = {
      ...currentSettings,
      ...(body.appName !== undefined && { appName: body.appName }),
      ...(body.defaultMonitoringInterval !== undefined && {
        defaultMonitoringInterval: body.defaultMonitoringInterval,
      }),
      ...(body.defaultAlertThreshold !== undefined && {
        defaultAlertThreshold: body.defaultAlertThreshold,
      }),
      ...(body.maxServices !== undefined && { maxServices: body.maxServices }),
      ...(body.tcpCheckerUrl !== undefined && {
        tcpCheckerUrl: body.tcpCheckerUrl,
      }),
    };

    // Save updated settings
    await saveGlobalSettings(updatedSettings, env);

    return NextResponse.json({
      ok: true,
      data: { settings: updatedSettings },
    });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to update settings" },
      { status: 500 }
    );
  }
}
