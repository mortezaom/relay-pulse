/**
 * Notification Manager
 * Main orchestrator for the notification system
 */

import { decrypt, encrypt } from "../encryption";
import { AppriseProvider } from "./providers/apprise";
import { DiscordProvider } from "./providers/discord";
import { EmailProvider } from "./providers/email";
import { GotifyProvider } from "./providers/gotify";
import { NtfyProvider } from "./providers/ntfy";
import { SlackProvider } from "./providers/slack";
import { TelegramProvider } from "./providers/telegram";
import type {
  INotificationProvider,
  NotificationChannel,
  NotificationCredentials,
  NotificationPayload,
  NotificationProvider,
  NotificationResult,
  ServiceNotificationConfig,
  ServiceNotificationMapping,
} from "./types";

/**
 * Get the appropriate provider instance
 */
function getProvider(
  providerType: NotificationProvider
  // biome-ignore lint/suspicious/noExplicitAny: Provider factory needs to return a generic provider
): INotificationProvider<any> {
  switch (providerType) {
    case "telegram":
      return new TelegramProvider();
    case "discord":
      return new DiscordProvider();
    case "slack":
      return new SlackProvider();
    case "email":
      return new EmailProvider();
    case "ntfy":
      return new NtfyProvider();
    case "gotify":
      return new GotifyProvider();
    case "apprise":
      return new AppriseProvider();
    default:
      throw new Error(`Unknown provider type: ${providerType}`);
  }
}

/**
 * Send notification through a specific channel
 */
export async function sendNotification(
  channel: NotificationChannel,
  payload: NotificationPayload,
  encryptionKey: string
): Promise<NotificationResult> {
  try {
    if (!channel.enabled) {
      return {
        success: false,
        provider: channel.provider,
        error: "Channel is disabled",
        timestamp: new Date().toISOString(),
      };
    }

    // Decrypt credentials
    const credentialsJson = await decrypt(channel.credentials, encryptionKey);
    const credentials = JSON.parse(credentialsJson) as NotificationCredentials;

    // Get provider and send
    const provider = getProvider(channel.provider);
    return await provider.send(payload, credentials);
  } catch (error) {
    return {
      success: false,
      provider: channel.provider,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Test a notification channel
 */
export async function testNotificationChannel(
  provider: NotificationProvider,
  credentials: NotificationCredentials,
  encryptionKey?: string
): Promise<boolean> {
  try {
    const providerInstance = getProvider(provider);

    // If credentials are encrypted, decrypt them first
    let decryptedCredentials = credentials;
    if (encryptionKey && typeof credentials === "string") {
      const credentialsJson = await decrypt(credentials, encryptionKey);
      decryptedCredentials = JSON.parse(credentialsJson);
    }

    return await providerInstance.test(decryptedCredentials);
  } catch (error) {
    console.error(`Test failed for ${provider}:`, error);
    return false;
  }
}

/**
 * Validate notification credentials
 */
export function validateCredentials(
  provider: NotificationProvider,
  credentials: unknown
): boolean {
  const providerInstance = getProvider(provider);
  return providerInstance.validate(credentials);
}

/**
 * Encrypt notification credentials
 */
export async function encryptCredentials(
  credentials: NotificationCredentials,
  encryptionKey: string
): Promise<string> {
  const credentialsJson = JSON.stringify(credentials);
  return await encrypt(credentialsJson, encryptionKey);
}

/**
 * Decrypt notification credentials
 */
export async function decryptCredentials(
  encryptedCredentials: string,
  encryptionKey: string
): Promise<NotificationCredentials> {
  const credentialsJson = await decrypt(encryptedCredentials, encryptionKey);
  return JSON.parse(credentialsJson);
}

/**
 * Get all notification channels from KV
 */
export async function getAllChannels(
  env: CloudflareEnv
): Promise<NotificationChannel[]> {
  try {
    const channelsData = await env.RELAY_PULSE_KV.get("notification:channels");
    if (!channelsData) {
      return [];
    }
    return JSON.parse(channelsData) as NotificationChannel[];
  } catch (error) {
    console.error("Failed to get channels:", error);
    return [];
  }
}

/**
 * Get a specific notification channel by ID
 */
export async function getChannel(
  channelId: string,
  env: CloudflareEnv
): Promise<NotificationChannel | null> {
  const channels = await getAllChannels(env);
  return channels.find((ch) => ch.id === channelId) || null;
}

/**
 * Save a notification channel
 */
export async function saveChannel(
  channel: NotificationChannel,
  env: CloudflareEnv
): Promise<void> {
  const channels = await getAllChannels(env);
  const existingIndex = channels.findIndex((ch) => ch.id === channel.id);

  if (existingIndex >= 0) {
    channels[existingIndex] = channel;
  } else {
    channels.push(channel);
  }

  await env.RELAY_PULSE_KV.put(
    "notification:channels",
    JSON.stringify(channels)
  );
}

/**
 * Delete a notification channel
 */
export async function deleteChannel(
  channelId: string,
  env: CloudflareEnv
): Promise<void> {
  const channels = await getAllChannels(env);
  const filtered = channels.filter((ch) => ch.id !== channelId);
  await env.RELAY_PULSE_KV.put(
    "notification:channels",
    JSON.stringify(filtered)
  );

  // Also remove all service mappings for this channel
  const services = await getAllServiceMappings(env);
  for (const [serviceId, mappings] of Object.entries(services)) {
    const filteredMappings = mappings.filter((m) => m.channelId !== channelId);
    if (filteredMappings.length > 0) {
      await saveServiceMappings(
        Number.parseInt(serviceId, 10),
        filteredMappings,
        env
      );
    } else {
      await env.RELAY_PULSE_KV.delete(`notification:service:${serviceId}`);
    }
  }
}

/**
 * Get service notification mappings
 */
export async function getServiceMappings(
  serviceId: number,
  env: CloudflareEnv
): Promise<ServiceNotificationMapping[]> {
  try {
    const mappingsData = await env.RELAY_PULSE_KV.get(
      `notification:service:${serviceId}`
    );
    if (!mappingsData) {
      return [];
    }
    return JSON.parse(mappingsData) as ServiceNotificationMapping[];
  } catch (error) {
    console.error("Failed to get service mappings:", error);
    return [];
  }
}

/**
 * Get all service mappings
 */
async function getAllServiceMappings(
  env: CloudflareEnv
): Promise<Record<string, ServiceNotificationMapping[]>> {
  try {
    const keys = await env.RELAY_PULSE_KV.list({
      prefix: "notification:service:",
    });
    const result: Record<string, ServiceNotificationMapping[]> = {};

    for (const key of keys.keys) {
      const serviceId = key.name.replace("notification:service:", "");
      const mappings = await getServiceMappings(
        Number.parseInt(serviceId, 10),
        env
      );
      if (mappings.length > 0) {
        result[serviceId] = mappings;
      }
    }

    return result;
  } catch (error) {
    console.error("Failed to get all service mappings:", error);
    return {};
  }
}

/**
 * Save service notification mappings
 */
export async function saveServiceMappings(
  serviceId: number,
  mappings: ServiceNotificationMapping[],
  env: CloudflareEnv
): Promise<void> {
  await env.RELAY_PULSE_KV.put(
    `notification:service:${serviceId}`,
    JSON.stringify(mappings)
  );
}

/**
 * Add a channel to a service
 */
export async function addChannelToService(
  serviceId: number,
  mapping: ServiceNotificationMapping,
  env: CloudflareEnv
): Promise<void> {
  const mappings = await getServiceMappings(serviceId, env);

  // Check if already exists
  const exists = mappings.some((m) => m.channelId === mapping.channelId);
  if (exists) {
    throw new Error("Channel already added to this service");
  }

  mappings.push(mapping);
  await saveServiceMappings(serviceId, mappings, env);
}

/**
 * Remove a channel from a service
 */
export async function removeChannelFromService(
  serviceId: number,
  channelId: string,
  env: CloudflareEnv
): Promise<void> {
  const mappings = await getServiceMappings(serviceId, env);
  const filtered = mappings.filter((m) => m.channelId !== channelId);

  if (filtered.length > 0) {
    await saveServiceMappings(serviceId, filtered, env);
  } else {
    await env.RELAY_PULSE_KV.delete(`notification:service:${serviceId}`);
  }
}

/**
 * Get full notification config for a service (channels + mappings)
 */
export async function getServiceNotificationConfig(
  serviceId: number,
  env: CloudflareEnv
): Promise<ServiceNotificationConfig> {
  const mappings = await getServiceMappings(serviceId, env);
  const allChannels = await getAllChannels(env);

  const channels = mappings
    .map((mapping) => {
      const channel = allChannels.find((ch) => ch.id === mapping.channelId);
      if (!channel) {
        return null;
      }
      return { channel, mapping };
    })
    .filter(
      (
        item
      ): item is {
        channel: NotificationChannel;
        mapping: ServiceNotificationMapping;
      } => item !== null
    );

  return {
    serviceId,
    channels,
  };
}

/**
 * Update failure count for a service
 */
export async function updateFailureCount(
  serviceId: number,
  isFailure: boolean,
  env: CloudflareEnv
): Promise<number> {
  const key = `notification:failures:${serviceId}`;

  if (isFailure) {
    const current = await env.RELAY_PULSE_KV.get(key);
    const count = current ? Number.parseInt(current, 10) + 1 : 1;
    await env.RELAY_PULSE_KV.put(key, count.toString());
    return count;
  }

  await env.RELAY_PULSE_KV.delete(key);
  return 0;
}

/**
 * Get current failure count
 */
export async function getFailureCount(
  serviceId: number,
  env: CloudflareEnv
): Promise<number> {
  const key = `notification:failures:${serviceId}`;
  const count = await env.RELAY_PULSE_KV.get(key);
  return count ? Number.parseInt(count, 10) : 0;
}

/**
 * Check if we should send alert based on threshold
 */
export async function shouldSendAlert(
  serviceId: number,
  threshold: number,
  env: CloudflareEnv
): Promise<boolean> {
  const failureCount = await getFailureCount(serviceId, env);
  return failureCount >= threshold;
}

/**
 * Send notifications for a service status change
 */
export async function sendServiceNotifications(
  serviceId: number,
  serviceName: string,
  status: "up" | "down" | "timeout" | "error",
  message: string,
  env: CloudflareEnv,
  encryptionKey: string,
  options: {
    responseTime?: number;
    statusCode?: number;
    incidentId?: number;
  } = {}
): Promise<NotificationResult[]> {
  try {
    const config = await getServiceNotificationConfig(serviceId, env);

    if (config.channels.length === 0) {
      return []; // No channels configured
    }

    const isFailure = status !== "up";
    const failureCount = await updateFailureCount(serviceId, isFailure, env);

    // Check if this is a recovery notification
    const wasDown = failureCount === 0 && !isFailure;
    const isRecovery = wasDown && status === "up";

    const results: NotificationResult[] = [];

    for (const { channel, mapping } of config.channels) {
      // Check if we should send based on threshold
      if (isFailure) {
        const shouldAlert = await shouldSendAlert(
          serviceId,
          mapping.alertThreshold,
          env
        );
        if (!shouldAlert) {
          continue; // Skip this channel, threshold not met
        }
      } else if (isRecovery && !mapping.notifyOnRecovery) {
        continue; // Skip recovery notification if not enabled
      }

      const payload: NotificationPayload = {
        serviceId,
        serviceName,
        status,
        message,
        timestamp: new Date().toISOString(),
        responseTime: options.responseTime,
        statusCode: options.statusCode,
        incidentId: options.incidentId,
        isRecovery,
      };

      const result = await sendNotification(channel, payload, encryptionKey);
      results.push(result);
    }

    return results;
  } catch (error) {
    console.error("Failed to send service notifications:", error);
    return [];
  }
}
