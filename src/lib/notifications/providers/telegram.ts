/**
 * Telegram Notification Provider
 * Uses Telegram Bot API
 */

import { formatMessage } from "../formatter";
import type {
  INotificationProvider,
  NotificationPayload,
  NotificationResult,
  TelegramCredentials,
} from "../types";

export class TelegramProvider
  implements INotificationProvider<TelegramCredentials>
{
  async send(
    payload: NotificationPayload,
    credentials: TelegramCredentials
  ): Promise<NotificationResult> {
    try {
      const { botToken, chatId } = credentials;
      const message = formatMessage("telegram", payload);

      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message.text,
            parse_mode: message.parse_mode,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Telegram API error: ${error}`);
      }

      return {
        success: true,
        provider: "telegram",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        provider: "telegram",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  validate(credentials: unknown): credentials is TelegramCredentials {
    if (typeof credentials !== "object" || credentials === null) {
      return false;
    }

    const { botToken, chatId } = credentials as {
      botToken?: unknown;
      chatId?: unknown;
    };

    return (
      typeof botToken === "string" &&
      botToken.length > 0 &&
      typeof chatId === "string" &&
      chatId.length > 0
    );
  }

  async test(credentials: TelegramCredentials): Promise<boolean> {
    try {
      const { botToken, chatId } = credentials;

      // Test by sending a simple message
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: "🔔 Test notification from Relay Pulse\n\nYour Telegram notification channel is configured correctly!",
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Telegram test failed:", error);
      return false;
    }
  }
}
