/**
 * Notification System Types & Interfaces
 */

export type NotificationProvider =
  | "telegram"
  | "discord"
  | "slack"
  | "email"
  | "ntfy"
  | "gotify"
  | "apprise";

export type NotificationStatus = "pending" | "sent" | "failed";

export type ServiceStatus = "up" | "down" | "timeout" | "error";

/**
 * Base interface for all notification providers
 */
export type INotificationProvider<T = unknown> = {
  send(
    payload: NotificationPayload,
    credentials: T
  ): Promise<NotificationResult>;
  validate(credentials: unknown): credentials is T;
  test(credentials: T): Promise<boolean>;
};

/**
 * Notification channel stored in KV
 */
export type NotificationChannel = {
  id: string; // UUID
  name: string;
  provider: NotificationProvider;
  enabled: boolean;
  credentials: string; // Encrypted JSON
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};

/**
 * Decrypted credentials for each provider
 */
export type NotificationCredentials =
  | TelegramCredentials
  | DiscordCredentials
  | SlackCredentials
  | EmailCredentials
  | NtfyCredentials
  | GotifyCredentials
  | AppriseCredentials;

export type TelegramCredentials = {
  provider: "telegram";
  botToken: string;
  chatId: string;
};

export type DiscordCredentials = {
  provider: "discord";
  webhookUrl: string;
  username?: string;
  avatarUrl?: string;
};

export type SlackCredentials = {
  provider: "slack";
  webhookUrl: string;
  channel?: string;
};

export type EmailCredentials = {
  provider: "email";
  // Resend API configuration
  // Sign up at: https://resend.com/signup
  // Free tier: 100 emails/day, 3,000 emails/month
  // Paid plans start at $20/month for 50,000 emails/month
  resendApiKey: string;
  // Email addresses
  fromEmail: string; // Must be from a verified domain in Resend
  toEmails: string[];
};

export type NtfyCredentials = {
  provider: "ntfy";
  serverUrl: string; // e.g., https://ntfy.sh
  topic: string;
  token?: string; // Optional auth token
  priority?: number; // 1-5
};

export type GotifyCredentials = {
  provider: "gotify";
  serverUrl: string;
  appToken: string;
  priority?: number; // 0-10
};

export type AppriseCredentials = {
  provider: "apprise";
  appriseUrl: string;
};

/**
 * Service-to-Channel mapping stored in KV
 */
export type ServiceNotificationMapping = {
  serviceId: number;
  channelId: string;
  alertThreshold: number; // Number of consecutive failures before alerting
  notifyOnRecovery: boolean; // Send notification when service recovers
};

/**
 * Notification payload sent to providers
 */
export type NotificationPayload = {
  serviceId: number;
  serviceName: string;
  status: ServiceStatus;
  message: string;
  timestamp: string; // ISO string
  responseTime?: number;
  statusCode?: number;
  incidentId?: number;
  isRecovery?: boolean;
};

/**
 * Result from sending notification
 */
export type NotificationResult = {
  success: boolean;
  provider: NotificationProvider;
  error?: string;
  timestamp: string;
};

/**
 * Configuration for a service's notifications
 */
export type ServiceNotificationConfig = {
  serviceId: number;
  channels: Array<{
    channel: NotificationChannel;
    mapping: ServiceNotificationMapping;
  }>;
};

/**
 * Notification history entry (optional, can log to KV)
 */
export type NotificationHistory = {
  id: string; // UUID
  channelId: string;
  serviceId: number;
  payload: NotificationPayload;
  result: NotificationResult;
  timestamp: string;
};
