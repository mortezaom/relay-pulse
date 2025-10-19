/**
 * Slack Notification Provider
 * Uses Slack Webhooks
 */

import { formatMessage } from "../formatter";
import type {
    INotificationProvider,
    NotificationPayload,
    NotificationResult,
    SlackCredentials,
} from "../types";

export class SlackProvider implements INotificationProvider<SlackCredentials> {
    async send(
        payload: NotificationPayload,
        credentials: SlackCredentials,
    ): Promise<NotificationResult> {
        try {
            const { webhookUrl } = credentials;
            const message = formatMessage("slack", payload);

            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(message),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Slack webhook error: ${error}`);
            }

            return {
                success: true,
                provider: "slack",
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                success: false,
                provider: "slack",
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString(),
            };
        }
    }

    validate(credentials: any): credentials is SlackCredentials {
        return (
            typeof credentials === "object" &&
            typeof credentials.webhookUrl === "string" &&
            credentials.webhookUrl.startsWith("https://hooks.slack.com/")
        );
    }

    async test(credentials: SlackCredentials): Promise<boolean> {
        try {
            const { webhookUrl } = credentials;

            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    blocks: [
                        {
                            type: "header",
                            text: {
                                type: "plain_text",
                                text: "🔔 Test Notification",
                                emoji: true,
                            },
                        },
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: "Your Slack notification channel is configured correctly!",
                            },
                        },
                        {
                            type: "context",
                            elements: [
                                {
                                    type: "mrkdwn",
                                    text: "Relay Pulse Monitoring System",
                                },
                            ],
                        },
                    ],
                }),
            });

            return response.ok;
        } catch (error) {
            console.error("Slack test failed:", error);
            return false;
        }
    }
}
