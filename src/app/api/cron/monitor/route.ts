/**
 * Cron Monitoring Route
 *
 * This endpoint is triggered by Cloudflare Cron to run scheduled monitoring tasks.
 * It handles both regular service monitoring (every 5 minutes) and daily cleanup (2 AM).
 *
 * Security: Only responds to requests with the cf-cron-trigger header
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NextRequest } from "next/server";
import { handleScheduled } from "@/lib/monitoring/scheduler";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { env } = getCloudflareContext();

  try {
    // Verify this is a cron trigger (security measure)
    // Cloudflare automatically adds this header for cron-triggered requests
    const cronHeader = request.headers.get("cf-cron");

    // For development/testing, allow manual triggers with a special header
    const isDev = process.env.NODE_ENV === "development";
    const manualTrigger = request.headers.get("x-manual-trigger");

    if (!(cronHeader || (isDev && manualTrigger))) {
      return Response.json(
        {
          error: "Unauthorized",
          message:
            "This endpoint can only be triggered by Cloudflare Cron or manual trigger in development",
        },
        { status: 401 }
      );
    }

    // Execute the scheduled monitoring tasks
    await handleScheduled(env);

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Monitoring tasks completed successfully",
    });
  } catch (error) {
    console.error("Cron execution failed:", error);

    return Response.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
