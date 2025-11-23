/**
 * Notification Channels Data Layer
 * Validation schemas and types
 */

import { z } from "zod/v4-mini";
import type { NotificationProvider } from "@/lib/notifications/types";

/**
 * Base channel schema
 */
export const baseChannelSchema = z.object({
  id: z.string(), // UUID, generated on server
  name: z
    .string()
    .check(
      z.maxLength(50),
      z.minLength(2, "Name must be at least 2 characters long")
    ),
  provider: z.enum([
    "telegram",
    "discord",
    "slack",
    "email",
    "ntfy",
    "gotify",
    "apprise",
  ]),
  enabled: z.boolean(),
});

/**
 * Telegram credentials schema
 */
export const telegramCredentialsSchema = z.object({
  provider: z.literal("telegram"),
  botToken: z.string().check(z.minLength(1, "Bot token is required")),
  chatId: z.string().check(z.minLength(1, "Chat ID is required")),
});

/**
 * Discord credentials schema
 */
export const discordCredentialsSchema = z.object({
  provider: z.literal("discord"),
  webhookUrl: z
    .string()
    .check(
      z.refine(
        (val: string) => val.startsWith("https://discord.com/api/webhooks/"),
        "Must be a valid Discord webhook URL"
      )
    ),
  username: z.string(),
  avatarUrl: z.string(),
});

/**
 * Slack credentials schema
 */
export const slackCredentialsSchema = z.object({
  provider: z.literal("slack"),
  webhookUrl: z
    .string()
    .check(
      z.refine(
        (val: string) => val.startsWith("https://hooks.slack.com/"),
        "Must be a valid Slack webhook URL"
      )
    ),
  channel: z.string(),
});

/**
 * Email credentials schema - using Resend API
 */
export const emailCredentialsSchema = z.object({
  provider: z.literal("email"),
  // Resend API configuration
  resendApiKey: z.string().check(
    z.minLength(1, "Resend API key is required"),
    z.refine(
      (val: string) => val.startsWith("re_"),
      "Must be a valid Resend API key (starts with 're_')"
    )
  ),
  // Email addresses
  fromEmail: z
    .string()
    .check(
      z.refine(
        (val: string) => val.includes("@"),
        "Must be a valid email address"
      )
    ),
  toEmails: z
    .array(z.string())
    .check(z.minLength(1, "At least one recipient email is required")),
});

/**
 * ntfy credentials schema
 */
export const ntfyCredentialsSchema = z.object({
  provider: z.literal("ntfy"),
  serverUrl: z
    .string()
    .check(
      z.refine(
        (val: string) => val.startsWith("http"),
        "Must start with http or https"
      )
    ),
  topic: z.string().check(z.minLength(1, "Topic is required")),
  token: z.string(),
  priority: z.number(),
});

/**
 * Gotify credentials schema
 */
export const gotifyCredentialsSchema = z.object({
  provider: z.literal("gotify"),
  serverUrl: z
    .string()
    .check(
      z.refine(
        (val: string) => val.startsWith("http"),
        "Must start with http or https"
      )
    ),
  appToken: z.string().check(z.minLength(1, "App token is required")),
  priority: z.number(),
});

/**
 * Apprise credentials schema
 */
export const appriseCredentialsSchema = z.object({
  provider: z.literal("apprise"),
  appriseUrl: z
    .string()
    .check(
      z.refine(
        (val: string) => val.startsWith("http"),
        "Must start with http or https"
      )
    ),
});

/**
 * Union of all credential schemas
 */
export const credentialsSchema = z.union([
  telegramCredentialsSchema,
  discordCredentialsSchema,
  slackCredentialsSchema,
  emailCredentialsSchema,
  ntfyCredentialsSchema,
  gotifyCredentialsSchema,
  appriseCredentialsSchema,
]);

/**
 * Complete channel creation schema (base + credentials)
 */
export const createChannelSchema = z.intersection(
  baseChannelSchema,
  z.object({
    credentials: credentialsSchema,
  })
);

/**
 * Service notification mapping schema
 */
export const serviceMappingSchema = z.object({
  serviceId: z.number(),
  channelId: z.string(),
  alertThreshold: z.number(),
  notifyOnRecovery: z.boolean(),
});

/**
 * Type exports
 */
export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type ServiceMappingInput = z.infer<typeof serviceMappingSchema>;

/**
 * Helper function to get credential schema by provider
 */
export function getCredentialsSchema(provider: NotificationProvider) {
  switch (provider) {
    case "telegram":
      return telegramCredentialsSchema;
    case "discord":
      return discordCredentialsSchema;
    case "slack":
      return slackCredentialsSchema;
    case "email":
      return emailCredentialsSchema;
    case "ntfy":
      return ntfyCredentialsSchema;
    case "gotify":
      return gotifyCredentialsSchema;
    case "apprise":
      return appriseCredentialsSchema;
    default:
      throw new Error("Unsupported provider");
  }
}

/**
 * Provider display information
 */
export const providerInfo: Record<
  NotificationProvider,
  {
    name: string;
    description: string;
    icon: string;
    setupGuide?: string;
  }
> = {
  telegram: {
    name: "Telegram",
    description: "Send notifications via Telegram Bot",
    icon: "MessageCircle",
    setupGuide:
      "1. Create a bot via @BotFather\n2. Get your bot token\n3. Start chat with your bot\n4. Get your chat ID from @userinfobot",
  },
  discord: {
    name: "Discord",
    description: "Send notifications to Discord channels",
    icon: "Hash",
    setupGuide:
      "1. Go to Server Settings → Integrations\n2. Create a webhook\n3. Copy the webhook URL",
  },
  slack: {
    name: "Slack",
    description: "Send notifications to Slack channels",
    icon: "Hash",
    setupGuide:
      "1. Go to your Slack workspace\n2. Create an Incoming Webhook\n3. Copy the webhook URL",
  },
  email: {
    name: "Email",
    description: "Send email notifications via Resend API",
    icon: "Mail",
    setupGuide:
      "1. Sign up at https://resend.com/signup (FREE: 100 emails/day, 3,000/month)\n2. Verify your sending domain at https://resend.com/domains\n3. Generate an API key at https://resend.com/api-keys\n4. Use an email address from your verified domain as the 'From' address\n\nPricing:\n- Free: 100 emails/day, 3,000/month\n- Pro: $20/month for 50,000 emails/month\n- Scale: Custom pricing for higher volumes",
  },
  ntfy: {
    name: "ntfy",
    description: "Simple HTTP-based pub-sub notifications",
    icon: "Bell",
    setupGuide:
      "1. Choose a topic name\n2. Subscribe to ntfy.sh/your-topic\n3. Optionally set up auth token",
  },
  gotify: {
    name: "Gotify",
    description: "Self-hosted notification server",
    icon: "Server",
    setupGuide:
      "1. Install Gotify server\n2. Create an application\n3. Copy the app token",
  },
  apprise: {
    name: "Apprise",
    description: "Universal notification gateway (legacy)",
    icon: "Webhook",
    setupGuide:
      "1. Set up Apprise API server\n2. Configure your notification services\n3. Copy the API endpoint URL",
  },
};
