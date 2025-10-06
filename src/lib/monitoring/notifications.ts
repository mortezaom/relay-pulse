/**
 * Notification utilities using Apprise API
 * All notification settings are managed through the dashboard and stored in KV
 */

export interface NotificationConfig {
  serviceId: number;
  appriseUrl: string; // User-configured Apprise API endpoint
  enabled: boolean;
  alertThreshold: number; // Number of failures before sending alert
}

export interface NotificationPayload {
  serviceId: number;
  serviceName: string;
  status: "down" | "up" | "error" | "timeout";
  message: string;
  timestamp: string;
  incidentId?: number;
}

/**
 * Send notification via Apprise API
 * User configures their own Apprise instance through the dashboard
 */
export async function sendAppriseNotification(
  config: NotificationConfig,
  payload: NotificationPayload
): Promise<void> {
  if (!config.enabled || !config.appriseUrl) {
    return;
  }

  try {
    const notificationBody = formatNotificationMessage(payload);
    
    const response = await fetch(config.appriseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Relay-Pulse-Monitor/1.0",
      },
      body: JSON.stringify({
        body: notificationBody,
        title: `${payload.serviceName} is ${payload.status.toUpperCase()}`,
        type: payload.status === "up" ? "success" : "failure",
      }),
    });

    if (!response.ok) {
      throw new Error(`Apprise API returned ${response.status}: ${response.statusText}`);
    }

    console.log(`Notification sent for service ${payload.serviceName}`);
  } catch (error) {
    console.error("Failed to send Apprise notification:", error);
  }
}

/**
 * Format notification message for Apprise
 */
function formatNotificationMessage(payload: NotificationPayload): string {
  const timestamp = new Date(payload.timestamp).toLocaleString();
  
  let message = `Service: ${payload.serviceName}\n`;
  message += `Status: ${payload.status.toUpperCase()}\n`;
  message += `Time: ${timestamp}\n`;
  message += `Message: ${payload.message}`;
  
  if (payload.incidentId) {
    message += `\nIncident ID: #${payload.incidentId}`;
  }
  
  return message;
}

/**
 * Get notification configuration for a service from KV storage
 */
export async function getNotificationConfig(
  serviceId: number,
  env: CloudflareEnv
): Promise<NotificationConfig | null> {
  try {
    const config = await env.RELAY_PULSE_KV.get(`notification:${serviceId}`);
    
    if (!config) {
      return null;
    }
    
    return JSON.parse(config) as NotificationConfig;
  } catch (error) {
    console.error("Failed to get notification config:", error);
    return null;
  }
}

/**
 * Save notification configuration to KV storage
 */
export async function saveNotificationConfig(
  config: NotificationConfig,
  env: CloudflareEnv
): Promise<void> {
  try {
    await env.RELAY_PULSE_KV.put(
      `notification:${config.serviceId}`,
      JSON.stringify(config)
    );
  } catch (error) {
    console.error("Failed to save notification config:", error);
  }
}

/**
 * Check if notification should be sent based on alert threshold
 */
export async function shouldSendAlert(
  serviceId: number,
  config: NotificationConfig,
  env: CloudflareEnv
): Promise<boolean> {
  if (!config.enabled) {
    return false;
  }

  try {
    // Get failure count from KV
    const failureCountKey = `failures:${serviceId}`;
    const failureCount = await env.RELAY_PULSE_KV.get(failureCountKey);
    const currentFailures = failureCount ? parseInt(failureCount) : 0;
    
    return currentFailures >= config.alertThreshold;
  } catch (error) {
    console.error("Failed to check alert threshold:", error);
    return false;
  }
}

/**
 * Update failure count for a service
 */
export async function updateFailureCount(
  serviceId: number,
  isFailure: boolean,
  env: CloudflareEnv
): Promise<void> {
  try {
    const failureCountKey = `failures:${serviceId}`;
    
    if (isFailure) {
      // Increment failure count
      const current = await env.RELAY_PULSE_KV.get(failureCountKey);
      const count = current ? parseInt(current) + 1 : 1;
      await env.RELAY_PULSE_KV.put(failureCountKey, count.toString());
    } else {
      // Reset failure count on success
      await env.RELAY_PULSE_KV.delete(failureCountKey);
    }
  } catch (error) {
    console.error("Failed to update failure count:", error);
  }
}

/**
 * Send notification for a service
 */
export async function sendServiceNotification(
  serviceId: number,
  serviceName: string,
  status: "down" | "up" | "error" | "timeout",
  message: string,
  env: CloudflareEnv,
  incidentId?: number
): Promise<void> {
  try {
    const config = await getNotificationConfig(serviceId, env);
    
    if (!config) {
      return; // No notification configured
    }

    const isFailure = status !== "up";
    await updateFailureCount(serviceId, isFailure, env);

    if (await shouldSendAlert(serviceId, config, env)) {
      const payload: NotificationPayload = {
        serviceId,
        serviceName,
        status,
        message,
        timestamp: new Date().toISOString(),
        incidentId,
      };

      await sendAppriseNotification(config, payload);
    }
  } catch (error) {
    console.error("Failed to send service notification:", error);
  }
}

interface CloudflareEnv {
  RELAY_PULSE_DB: D1Database;
  RELAY_PULSE_KV: KVNamespace;
  RELAY_PULSE_BUCKET: R2Bucket;
}