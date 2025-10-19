/**
 * Gotify Notification Provider
 * Uses self-hosted Gotify server
 */

import { formatMessage } from "../formatter";
import type {
    GotifyCredentials,
    INotificationProvider,
    NotificationPayload,
    NotificationResult,
} from "../types";

export class GotifyProvider
    implements INotificationProvider<GotifyCredentials> {
    async send(
        payload: NotificationPayload,
        credentials: GotifyCredentials,
    ): Promise<NotificationResult> {
        try {
            const { serverUrl, appToken, priority } = credentials;
            const message = formatMessage("gotify", payload);

            const url = `${serverUrl}/message?token=${appToken}`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: `${payload.serviceName} - ${payload.status.toUpperCase()}`,
                    message,
                    priority: priority || 5,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Gotify error: ${error}`);
            }

            return {
                success: true,
                provider: "gotify",
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                success: false,
                provider: "gotify",
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString(),
            };
        }
    }

    validate(credentials: any): credentials is GotifyCredentials {
        return (
            typeof credentials === "object" &&
            typeof credentials.serverUrl === "string" &&
            credentials.serverUrl.startsWith("http") &&
            typeof credentials.appToken === "string" &&
            credentials.appToken.length > 0
        );
    }

    async test(credentials: GotifyCredentials): Promise<boolean> {
        try {
            const { serverUrl, appToken, priority } = credentials;

            const url = `${serverUrl}/message?token=${appToken}`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: "🔔 Test Notification from Relay Pulse",
                    message: "Your Gotify notification channel is configured correctly!",
                    priority: priority || 5,
                }),
            });

            return response.ok;
        } catch (error) {
            console.error("Gotify test failed:", error);
            return false;
        }
    }
}
