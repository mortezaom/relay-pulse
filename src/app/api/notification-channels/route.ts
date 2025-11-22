/**
 * Notification Channels API
 * GET /api/notification-channels - List all channels
 * POST /api/notification-channels - Create a new channel
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createChannelSchema } from "@/data/notification-channels-data";
import { verifyJWTToken } from "@/lib/encryption";
import { getJwtSecret } from "@/lib/jwt-secret";
import {
    encryptCredentials,
    getAllChannels,
    saveChannel,
    validateCredentials,
} from "@/lib/notifications";
import type { NotificationChannel } from "@/lib/notifications/types";

/**
 * GET - List all notification channels
 */
export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const token = request.cookies.get("auth-token")?.value;
        const user = await verifyJWTToken(token || null);

        if (!user) {
            return NextResponse.json(
                { ok: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const env = process.env as any;
        const channels = await getAllChannels(env);

        // Don't return encrypted credentials
        const safeChannels = channels.map((ch) => ({
            id: ch.id,
            name: ch.name,
            provider: ch.provider,
            enabled: ch.enabled,
            createdAt: ch.createdAt,
            updatedAt: ch.updatedAt,
        }));

        return NextResponse.json({ ok: true, data: { channels: safeChannels } });
    } catch (error) {
        console.error("Failed to get channels:", error);
        return NextResponse.json(
            { ok: false, message: "Failed to retrieve channels" },
            { status: 500 },
        );
    }
}

/**
 * POST - Create a new notification channel
 */
export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const token = request.cookies.get("auth-token")?.value;
        const user = await verifyJWTToken(token || null);

        if (!user) {
            return NextResponse.json(
                { ok: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await request.json();

        // Validate input
        const validationResult = createChannelSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { ok: false, message: "Invalid input", errors: validationResult.error },
                { status: 400 },
            );
        }

        const { name, provider, credentials, enabled } = validationResult.data;

        // Validate credentials for the specific provider
        if (!validateCredentials(provider, credentials)) {
            return NextResponse.json(
                { ok: false, message: "Invalid credentials for the selected provider" },
                { status: 400 },
            );
        }

        // Encrypt credentials
        const jwtSecret = await getJwtSecret();
        const encryptedCredentials = await encryptCredentials(
            credentials,
            jwtSecret,
        );

        // Create channel object
        const channel: NotificationChannel = {
            id: crypto.randomUUID(),
            name,
            provider,
            enabled: enabled ?? true,
            credentials: encryptedCredentials,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Save to KV
        const env = process.env as any;
        await saveChannel(channel, env);

        // Return without credentials
        return NextResponse.json({
            ok: true,
            data: {
                channel: {
                    id: channel.id,
                    name: channel.name,
                    provider: channel.provider,
                    enabled: channel.enabled,
                    createdAt: channel.createdAt,
                    updatedAt: channel.updatedAt,
                },
            },
        });
    } catch (error) {
        console.error("Failed to create channel:", error);
        return NextResponse.json(
            { ok: false, message: "Failed to create channel" },
            { status: 500 },
        );
    }
}
