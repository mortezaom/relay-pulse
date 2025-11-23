/**
 * Test Notification Channel API
 * POST /api/notification-channels/test - Test notification credentials
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  testNotificationChannel,
  validateCredentials,
} from "@/lib/notifications";
import type {
  NotificationCredentials,
  NotificationProvider,
} from "@/lib/notifications/types";

export const runtime = "edge";

/**
 * POST - Test notification channel credentials
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      credentials?: NotificationCredentials;
    };
    const { credentials } = body;

    if (!credentials?.provider) {
      return NextResponse.json(
        { ok: false, message: "Credentials with provider type are required" },
        { status: 400 }
      );
    }

    const provider = credentials.provider as NotificationProvider;

    // Validate credentials format first
    if (!validateCredentials(provider, credentials)) {
      return NextResponse.json(
        { ok: false, message: "Invalid credentials for the selected provider" },
        { status: 400 }
      );
    }

    // Test the notification
    const testResult = await testNotificationChannel(
      provider,
      credentials as NotificationCredentials
    );

    if (testResult) {
      return NextResponse.json({
        ok: true,
        message: "Test notification sent successfully!",
      });
    }
    return NextResponse.json(
      {
        ok: false,
        message: "Test failed. Please check your credentials and try again.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Test notification failed:", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Test failed unexpectedly",
      },
      { status: 500 }
    );
  }
}
