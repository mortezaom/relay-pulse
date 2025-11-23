/**
 * Monitoring scheduler - handles cron-triggered service checks
 * This replaces the separate worker architecture with a unified approach
 */

import { getWorkerDb } from "@/db/index";
import { services } from "@/db/schema";
import { getJwtSecret } from "@/lib/jwt-secret";
import { sendServiceNotifications } from "@/lib/notifications";
import {
  getMonitoringSettings,
  incrementFailureCount,
  resetFailureCount,
} from "@/lib/settings";
import {
  handleIncidentManagement,
  monitorService,
  saveMonitoringResult,
} from "./monitor";

type ServiceConfig = {
  id: number;
  name: string;
  address: string;
  type: "http" | "https" | "tcp";
  port: number;
};

/**
 * Main scheduled handler - called by cron trigger
 * Determines whether to run monitoring or cleanup based on the time
 */
export async function handleScheduled(env: CloudflareEnv): Promise<void> {
  console.log("Starting scheduled task");

  try {
    // Get current time to determine which cron this is
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Check if this is the 2 AM cleanup cron (minute is 0, hour is 2)
    if (hour === 2 && minute === 0) {
      console.log("Running cleanup task");
      await cleanupOldData(env);
    } else {
      // Regular monitoring cron - run every 5 minutes
      console.log("Running monitoring task");
      const activeServices = await getActiveServices(env);

      // Monitor all services in parallel
      const monitoringPromises = activeServices.map((service) =>
        monitorServiceWithHandling(service, env)
      );

      await Promise.allSettled(monitoringPromises);

      console.log(`Completed monitoring ${activeServices.length} services`);
    }

    // Update last run timestamp
    await env.RELAY_PULSE_KV.put(
      "monitoring:last-run",
      new Date().toISOString()
    );
  } catch (error) {
    console.error("Error in scheduled task:", error);
    throw error; // Re-throw so cron system knows it failed
  }
}

/**
 * Get all active services from the database
 * Respects per-service monitoring intervals stored in KV
 */
async function getActiveServices(env: CloudflareEnv): Promise<ServiceConfig[]> {
  try {
    const db = getWorkerDb(env.RELAY_PULSE_DB);
    const allServices = await db.select().from(services);

    // Filter services that need monitoring now
    const activeServices: ServiceConfig[] = [];
    const now = Date.now();

    for (const service of allServices) {
      const settings = await getMonitoringSettings(service.id, env);

      if (!settings.enabled) {
        continue; // Skip disabled services
      }

      // Check if this service should be monitored based on interval
      const lastCheckKey = `monitoring:last-check:${service.id}`;
      const lastCheckStr = await env.RELAY_PULSE_KV.get(lastCheckKey);

      if (lastCheckStr) {
        const lastCheck = Number.parseInt(lastCheckStr, 10);
        const intervalMs = settings.interval * 60 * 1000; // Convert minutes to milliseconds

        if (now - lastCheck < intervalMs) {
          // Not time to check this service yet
          continue;
        }
      }

      activeServices.push({
        id: service.id,
        name: service.name,
        address: service.address,
        type: service.type as "http" | "https" | "tcp",
        port: service.port,
      });
    }

    return activeServices;
  } catch (error) {
    console.error("Failed to get active services:", error);
    return [];
  }
}

/**
 * Monitor a single service and handle all related tasks
 */
async function monitorServiceWithHandling(
  service: ServiceConfig,
  env: CloudflareEnv
): Promise<void> {
  try {
    // Monitor the service
    const result = await monitorService(service, env);

    // Save the result to database
    await saveMonitoringResult(result, env);

    // Store last check time for interval checking
    await env.RELAY_PULSE_KV.put(
      `monitoring:last-check:${service.id}`,
      Date.now().toString()
    );

    // Handle failure counting
    const isFailure = result.status !== "up";

    if (isFailure) {
      await incrementFailureCount(service.id, env);
    } else {
      await resetFailureCount(service.id, env);
    }

    // Handle incident management
    await handleIncidentManagement(result, env);

    // Send notifications through the unified notification system
    try {
      const jwtSecret = await getJwtSecret();
      await sendServiceNotifications(
        service.id,
        service.name,
        result.status,
        result.errorMessage ||
          `Service check failed with status: ${result.status}`,
        env as CloudflareEnv,
        jwtSecret,
        {
          responseTime: result.responseTime,
          statusCode: result.statusCode,
        }
      );
    } catch (notificationError) {
      // Don't fail monitoring if notifications fail
      console.error(
        `Failed to send notifications for service ${service.name}:`,
        notificationError
      );
    }

    console.log(
      `Monitored service: ${service.name} - Status: ${result.status}`
    );
  } catch (error) {
    console.error(`Error monitoring service ${service.name}:`, error);
  }
}

/**
 * Health check for the monitoring system itself
 */
export async function healthCheck(env: CloudflareEnv): Promise<{
  status: "healthy" | "unhealthy";
  lastRun?: string;
  activeServices: number;
  errors?: string[];
}> {
  try {
    // Check database connectivity
    const db = getWorkerDb(env.RELAY_PULSE_DB);
    await db.select().from(services).limit(1);

    // Check KV access
    await env.RELAY_PULSE_KV.get("health-check");

    // Count active services
    const activeServices = await getActiveServices(env);

    // Get last run timestamp
    const lastRun = await env.RELAY_PULSE_KV.get("monitoring:last-run");

    return {
      status: "healthy",
      lastRun: lastRun || undefined,
      activeServices: activeServices.length,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      activeServices: 0,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

/**
 * Cleanup old monitoring data (run daily at 2 AM)
 */
export async function cleanupOldData(env: CloudflareEnv): Promise<void> {
  try {
    const { monitoringResults } = await import("@/db/schema");
    const { lt } = await import("drizzle-orm");

    const db = getWorkerDb(env.RELAY_PULSE_DB);

    // Delete monitoring results older than 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    await db
      .delete(monitoringResults)
      .where(lt(monitoringResults.timestamp, ninetyDaysAgo.toISOString()));

    console.log("Data cleanup completed - deleted records older than 90 days");
  } catch (error) {
    console.error("Failed to cleanup old data:", error);
    // Don't throw - continue even if cleanup fails
  }
}
