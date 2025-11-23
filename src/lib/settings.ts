/**
 * Settings management using Cloudflare KV
 * All user-configurable settings are stored in KV for easy dashboard access
 */

// Settings interfaces
export type GlobalSettings = {
  appName: string;
  defaultMonitoringInterval: number; // minutes
  defaultAlertThreshold: number;
  maxServices: number;
  tcpCheckerUrl?: string; // External TCP checker service endpoint
};

export type MonitoringSettings = {
  serviceId: number;
  enabled: boolean;
  interval: number; // minutes
  timeout: number; // seconds
  retryAttempts: number;
};

export type NotificationSettings = {
  serviceId: number;
  enabled: boolean;
  appriseUrl: string; // User's Apprise instance URL
  alertThreshold: number;
};

// KV keys for different settings
const KV_KEYS = {
  globalSettings: "settings:global",
  monitoring: (serviceId: number) => `monitoring:${serviceId}`,
  notification: (serviceId: number) => `notification:${serviceId}`,
  failures: (serviceId: number) => `failures:${serviceId}`,
} as const;

/**
 * Global Settings Management
 */
export async function getGlobalSettings(
  env: CloudflareEnv
): Promise<GlobalSettings> {
  try {
    const settings = await env.RELAY_PULSE_KV.get(KV_KEYS.globalSettings);

    if (settings) {
      return JSON.parse(settings);
    }

    // Return defaults if not found
    return getDefaultGlobalSettings();
  } catch (error) {
    console.error("Failed to get global settings:", error);
    return getDefaultGlobalSettings();
  }
}

export async function saveGlobalSettings(
  settings: GlobalSettings,
  env: CloudflareEnv
): Promise<void> {
  try {
    await env.RELAY_PULSE_KV.put(
      KV_KEYS.globalSettings,
      JSON.stringify(settings)
    );
  } catch (error) {
    console.error("Failed to save global settings:", error);
  }
}

function getDefaultGlobalSettings(): GlobalSettings {
  return {
    appName: "Relay Pulse",
    defaultMonitoringInterval: 5, // 5 minutes - optimized for free tier
    defaultAlertThreshold: 3, // 3 failures before alert
    maxServices: 100,
    tcpCheckerUrl: "", // Optional: External TCP checker service
  };
}

/**
 * Monitoring Settings Management
 */
export async function getMonitoringSettings(
  serviceId: number,
  env: CloudflareEnv
): Promise<MonitoringSettings> {
  try {
    const settings = await env.RELAY_PULSE_KV.get(
      KV_KEYS.monitoring(serviceId)
    );

    if (settings) {
      return JSON.parse(settings);
    }

    // Return defaults if not found
    const globalSettings = await getGlobalSettings(env);
    return {
      serviceId,
      enabled: true,
      interval: globalSettings.defaultMonitoringInterval,
      timeout: 30, // 30 seconds
      retryAttempts: 3,
    };
  } catch (error) {
    console.error("Failed to get monitoring settings:", error);
    return {
      serviceId,
      enabled: true,
      interval: 5, // Default to 5 minutes (free-tier friendly)
      timeout: 30,
      retryAttempts: 3,
    };
  }
}

export async function saveMonitoringSettings(
  settings: MonitoringSettings,
  env: CloudflareEnv
): Promise<void> {
  try {
    await env.RELAY_PULSE_KV.put(
      KV_KEYS.monitoring(settings.serviceId),
      JSON.stringify(settings)
    );
  } catch (error) {
    console.error("Failed to save monitoring settings:", error);
  }
}

/**
 * Notification Settings Management
 */
export async function getNotificationSettings(
  serviceId: number,
  env: CloudflareEnv
): Promise<NotificationSettings | null> {
  try {
    const settings = await env.RELAY_PULSE_KV.get(
      KV_KEYS.notification(serviceId)
    );

    if (settings) {
      return JSON.parse(settings);
    }

    return null; // No notification configured
  } catch (error) {
    console.error("Failed to get notification settings:", error);
    return null;
  }
}

export async function saveNotificationSettings(
  settings: NotificationSettings,
  env: CloudflareEnv
): Promise<void> {
  try {
    await env.RELAY_PULSE_KV.put(
      KV_KEYS.notification(settings.serviceId),
      JSON.stringify(settings)
    );
  } catch (error) {
    console.error("Failed to save notification settings:", error);
  }
}

export async function deleteNotificationSettings(
  serviceId: number,
  env: CloudflareEnv
): Promise<void> {
  try {
    await env.RELAY_PULSE_KV.delete(KV_KEYS.notification(serviceId));
  } catch (error) {
    console.error("Failed to delete notification settings:", error);
  }
}

/**
 * Failure Count Management (for alerting)
 */
export async function getFailureCount(
  serviceId: number,
  env: CloudflareEnv
): Promise<number> {
  try {
    const count = await env.RELAY_PULSE_KV.get(KV_KEYS.failures(serviceId));
    return count ? Number.parseInt(count, 10) : 0;
  } catch (error) {
    console.error("Failed to get failure count:", error);
    return 0;
  }
}

export async function incrementFailureCount(
  serviceId: number,
  env: CloudflareEnv
): Promise<number> {
  try {
    const current = await getFailureCount(serviceId, env);
    const newCount = current + 1;
    await env.RELAY_PULSE_KV.put(
      KV_KEYS.failures(serviceId),
      newCount.toString()
    );
    return newCount;
  } catch (error) {
    console.error("Failed to increment failure count:", error);
    return 0;
  }
}

export async function resetFailureCount(
  serviceId: number,
  env: CloudflareEnv
): Promise<void> {
  try {
    await env.RELAY_PULSE_KV.delete(KV_KEYS.failures(serviceId));
  } catch (error) {
    console.error("Failed to reset failure count:", error);
  }
}

/**
 * Bulk operations for service deletion
 */
export async function deleteAllServiceSettings(
  serviceId: number,
  env: CloudflareEnv
): Promise<void> {
  try {
    await Promise.all([
      env.RELAY_PULSE_KV.delete(KV_KEYS.monitoring(serviceId)),
      env.RELAY_PULSE_KV.delete(KV_KEYS.notification(serviceId)),
      env.RELAY_PULSE_KV.delete(KV_KEYS.failures(serviceId)),
    ]);
  } catch (error) {
    console.error("Failed to delete service settings:", error);
  }
}

/**
 * Get all services with their settings
 */
export async function getAllServicesWithSettings(
  services: Array<{
    id: number;
    name: string;
    address: string;
    type: string;
    port: number;
  }>,
  env: CloudflareEnv
): Promise<
  Array<{
    id: number;
    name: string;
    address: string;
    type: string;
    port: number;
    monitoring: MonitoringSettings;
    notification: NotificationSettings | null;
  }>
> {
  try {
    const servicesWithSettings = await Promise.all(
      services.map(async (service) => {
        const [monitoring, notification] = await Promise.all([
          getMonitoringSettings(service.id, env),
          getNotificationSettings(service.id, env),
        ]);

        return {
          ...service,
          monitoring,
          notification,
        };
      })
    );

    return servicesWithSettings;
  } catch (error) {
    console.error("Failed to get services with settings:", error);
    return services.map((service) => ({
      ...service,
      monitoring: {
        serviceId: service.id,
        enabled: true,
        interval: 1,
        timeout: 30,
        retryAttempts: 3,
      },
      notification: null,
    }));
  }
}

type CloudflareEnv = {
  RELAY_PULSE_DB: D1Database;
  RELAY_PULSE_KV: KVNamespace;
  RELAY_PULSE_BUCKET: R2Bucket;
};
