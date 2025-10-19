/**
 * Notification Channel API - Single Channel Operations
 * GET /api/notification-channels/[id] - Get channel details
 * PATCH /api/notification-channels/[id] - Update channel
 * DELETE /api/notification-channels/[id] - Delete channel
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { credentialsSchema } from "@/data/notification-channels-data";
import { verifyJWTToken } from "@/lib/encryption";
import {
    deleteChannel as deleteChannelFromKV,
    encryptCredentials,
    getChannel,
    saveChannel,
    validateCredentials,
} from "@/lib/notifications";

const JWT_SECRET = process.env.RELAY_JWT_SECRET!;

/**
 * GET - Get a specific channel (without credentials)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const token = request.cookies.get("auth-token")?.value;
        const user = await verifyJWTToken(token || null);

        if (!user) {
            return NextResponse.json(
                { ok: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;
        const env = process.env as any;
        const channel = await getChannel(id, env);

        if (!channel) {
            return NextResponse.json(
                { ok: false, message: "Channel not found" },
                { status: 404 },
            );
        }

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
        console.error("Failed to get channel:", error);
        return NextResponse.json(
            { ok: false, message: "Failed to retrieve channel" },
            { status: 500 },
        );
    }
}

/**
 * PATCH - Update a channel
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const token = request.cookies.get("auth-token")?.value;
        const user = await verifyJWTToken(token || null);

        if (!user) {
            return NextResponse.json(
                { ok: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;
        const env = process.env as any;
        const existingChannel = await getChannel(id, env);

        if (!existingChannel) {
            return NextResponse.json(
                { ok: false, message: "Channel not found" },
                { status: 404 },
            );
        }

        const body: any = await request.json();
        const updates: any = {};

        // Update name if provided
        if (body.name !== undefined) {
            updates.name = body.name;
        }

        // Update enabled status if provided
        if (body.enabled !== undefined) {
            updates.enabled = body.enabled;
        }

        // Update credentials if provided
        if (body.credentials !== undefined) {
            const credValidation = credentialsSchema.safeParse(body.credentials);
            if (!credValidation.success) {
                return NextResponse.json(
                    { ok: false, message: "Invalid credentials" },
                    { status: 400 },
                );
            }

            if (!validateCredentials(existingChannel.provider, body.credentials)) {
                return NextResponse.json(
                    {
                        ok: false,
                        message: "Invalid credentials for the selected provider",
                    },
                    { status: 400 },
                );
            }

            updates.credentials = await encryptCredentials(
                body.credentials,
                JWT_SECRET,
            );
        }

        // Update channel
        const updatedChannel = {
            ...existingChannel,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        await saveChannel(updatedChannel, env);

        // Return without credentials
        return NextResponse.json({
            ok: true,
            data: {
                channel: {
                    id: updatedChannel.id,
                    name: updatedChannel.name,
                    provider: updatedChannel.provider,
                    enabled: updatedChannel.enabled,
                    createdAt: updatedChannel.createdAt,
                    updatedAt: updatedChannel.updatedAt,
                },
            },
        });
    } catch (error) {
        console.error("Failed to update channel:", error);
        return NextResponse.json(
            { ok: false, message: "Failed to update channel" },
            { status: 500 },
        );
    }
}

/**
 * DELETE - Delete a channel
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const token = request.cookies.get("auth-token")?.value;
        const user = await verifyJWTToken(token || null);

        if (!user) {
            return NextResponse.json(
                { ok: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;
        const env = process.env as any;
        const channel = await getChannel(id, env);

        if (!channel) {
            return NextResponse.json(
                { ok: false, message: "Channel not found" },
                { status: 404 },
            );
        }

        await deleteChannelFromKV(id, env);

        return NextResponse.json({
            ok: true,
            data: { message: "Channel deleted successfully" },
        });
    } catch (error) {
        console.error("Failed to delete channel:", error);
        return NextResponse.json(
            { ok: false, message: "Failed to delete channel" },
            { status: 500 },
        );
    }
}
