/**
 * Discord Notification Provider
 * Uses Discord Webhooks
 */

import { formatMessage } from "../formatter";
import type {
    DiscordCredentials,
    INotificationProvider,
    NotificationPayload,
    NotificationResult,
} from "../types";

export class DiscordProvider
    implements INotificationProvider<DiscordCredentials> {
    async send(
        payload: NotificationPayload,
        credentials: DiscordCredentials,
    ): Promise<NotificationResult> {
        try {
            const { webhookUrl, username, avatarUrl } = credentials;
            const message = formatMessage("discord", payload);

            const body: any = {
                ...message,
            };

            if (username) body.username = username;
            if (avatarUrl) body.avatar_url = avatarUrl;

            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Discord webhook error: ${error}`);
            }

            return {
                success: true,
                provider: "discord",
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                success: false,
                provider: "discord",
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString(),
            };
        }
    }

    validate(credentials: any): credentials is DiscordCredentials {
        return (
            typeof credentials === "object" &&
            typeof credentials.webhookUrl === "string" &&
            credentials.webhookUrl.startsWith("https://discord.com/api/webhooks/")
        );
    }

    async test(credentials: DiscordCredentials): Promise<boolean> {
        try {
            const { webhookUrl, username, avatarUrl } = credentials;

            const body: any = {
                embeds: [
                    {
                        title: "🔔 Test Notification",
                        description:
                            "Your Discord notification channel is configured correctly!",
                        color: 0x2ecc71,
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: "Relay Pulse Monitoring",
                        },
                    },
                ],
            };

            if (username) body.username = username;
            if (avatarUrl) body.avatar_url = avatarUrl;

            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            return response.ok;
        } catch (error) {
            console.error("Discord test failed:", error);
            return false;
        }
    }
}
