/**
 * Apprise Notification Provider (Legacy Support)
 * Uses self-hosted Apprise API
 */

import { formatMessage } from "../formatter";
import type {
    AppriseCredentials,
    INotificationProvider,
    NotificationPayload,
    NotificationResult,
} from "../types";

export class AppriseProvider
    implements INotificationProvider<AppriseCredentials> {
    async send(
        payload: NotificationPayload,
        credentials: AppriseCredentials,
    ): Promise<NotificationResult> {
        try {
            const { appriseUrl } = credentials;
            const message = formatMessage("apprise", payload);

            const response = await fetch(appriseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Relay-Pulse-Monitor/2.0",
                },
                body: JSON.stringify({
                    body: message,
                    title: `${payload.serviceName} - ${payload.status.toUpperCase()}`,
                    type:
                        payload.isRecovery || payload.status === "up"
                            ? "success"
                            : "failure",
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Apprise error: ${error}`);
            }

            return {
                success: true,
                provider: "apprise",
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                success: false,
                provider: "apprise",
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString(),
            };
        }
    }

    validate(credentials: any): credentials is AppriseCredentials {
        return (
            typeof credentials === "object" &&
            typeof credentials.appriseUrl === "string" &&
            credentials.appriseUrl.startsWith("http")
        );
    }

    async test(credentials: AppriseCredentials): Promise<boolean> {
        try {
            const { appriseUrl } = credentials;

            const response = await fetch(appriseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Relay-Pulse-Monitor/2.0",
                },
                body: JSON.stringify({
                    body: "Your Apprise notification channel is configured correctly!",
                    title: "🔔 Test Notification from Relay Pulse",
                    type: "success",
                }),
            });

            return response.ok;
        } catch (error) {
            console.error("Apprise test failed:", error);
            return false;
        }
    }
}
