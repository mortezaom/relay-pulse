/**
 * ntfy Notification Provider
 * Uses ntfy.sh or self-hosted ntfy server
 */

import { formatMessage } from "../formatter";
import type {
  INotificationProvider,
  NotificationPayload,
  NotificationResult,
  NtfyCredentials,
} from "../types";

export class NtfyProvider implements INotificationProvider<NtfyCredentials> {
  async send(
    payload: NotificationPayload,
    credentials: NtfyCredentials
  ): Promise<NotificationResult> {
    try {
      const { serverUrl, topic, token, priority } = credentials;
      const message = formatMessage("ntfy", payload);

      const url = `${serverUrl}/${topic}`;
      const tags =
        payload.isRecovery || payload.status === "up"
          ? "white_check_mark"
          : "rotating_light";

      const headers: Record<string, string> = {
        "Content-Type": "text/plain; charset=utf-8",
        Title: `${payload.serviceName} - ${payload.status.toUpperCase()}`,
        Priority: String(priority || 3),
        Tags: tags,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: message,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ntfy error: ${error}`);
      }

      return {
        success: true,
        provider: "ntfy",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        provider: "ntfy",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  validate(credentials: unknown): credentials is NtfyCredentials {
    if (typeof credentials !== "object" || credentials === null) {
      return false;
    }

    const { serverUrl, topic } = credentials as Record<string, unknown>;

    return (
      typeof serverUrl === "string" &&
      serverUrl.startsWith("http") &&
      typeof topic === "string" &&
      topic.length > 0
    );
  }

  async test(credentials: NtfyCredentials): Promise<boolean> {
    try {
      const { serverUrl, topic, token, priority } = credentials;

      const url = `${serverUrl}/${topic}`;
      const headers: Record<string, string> = {
        "Content-Type": "text/plain; charset=utf-8",
        Title: "🔔 Test Notification from Relay Pulse",
        Priority: String(priority || 3),
        Tags: "white_check_mark",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: "Your ntfy notification channel is configured correctly!",
      });

      return response.ok;
    } catch (error) {
      console.error("ntfy test failed:", error);
      return false;
    }
  }
}
