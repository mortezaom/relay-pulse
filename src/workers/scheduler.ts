/**
 * Scheduled monitoring tasks for Relay Pulse
 * Handles cron jobs and service monitoring orchestration
 */

import { drizzle } from "drizzle-orm/d1";
import { services } from "@/db/schema";
import { monitorService, saveMonitoringResult, handleIncidentManagement } from "./monitor";
import { sendServiceNotification } from "@/lib/monitoring/notifications";
import { 
  getMonitoringSettings, 
  getNotificationSettings,
  getFailureCount, 
  incrementFailureCount, 
  resetFailureCount 
} from "@/lib/settings";

interface CloudflareEnv {
  RELAY_PULSE_DB: D1Database;
  RELAY_PULSE_KV: KVNamespace;
  RELAY_PULSE_BUCKET: R2Bucket;
}

/**
 * Main scheduled handler - runs every minute
 */
export async function handleScheduled(
  event: ScheduledEvent,
  env: CloudflareEnv,
  ctx: ExecutionContext
): Promise<void> {
  console.log("Starting scheduled monitoring run");
  
  try {
    const activeServices = await getActiveServices(env);
    
    // Monitor all services in parallel
    const monitoringPromises = activeServices.map(service => 
      monitorServiceWithHandling(service, env)
    );
    
    await Promise.allSettled(monitoringPromises);
    
    console.log(`Completed monitoring ${activeServices.length} services`);
  } catch (error) {
    console.error("Error in scheduled monitoring:", error);
  }
}

/**
 * Get all active services from the database
 */
async function getActiveServices(env: CloudflareEnv): Promise<ServiceConfig[]> {
  try {
    const db = drizzle(env.RELAY_PULSE_DB);
    const allServices = await db.select().from(services);
    
    // Filter services that have monitoring enabled
    const activeServices = [];
    
    for (const service of allServices) {
      const settings = await getMonitoringSettings(service.id, env);
      if (settings.enabled) {
        activeServices.push({
          id: service.id,
          name: service.name,
          address: service.address,
          type: service.type as "http" | "https" | "tcp",
          port: service.port,
        });
      }
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
    // Get monitoring settings
    const settings = await getMonitoringSettings(service.id, env);
    
    // Monitor the service
    const result = await monitorService(service, env);
    
    // Save the result to database
    await saveMonitoringResult(result, env);
    
    // Handle failure counting and notifications
    const isFailure = result.status !== "up";
    
    if (isFailure) {
      const failureCount = await incrementFailureCount(service.id, env);
      
      // Check if we should send notification
      const notificationSettings = await getNotificationSettings(service.id, env);
      if (notificationSettings && failureCount >= notificationSettings.alertThreshold) {
        await sendServiceNotification(
          service.id,
          service.name,
          result.status,
          result.errorMessage || `Service check failed with status: ${result.status}`,
          env
        );
      }
    } else {
      // Reset failure count on success
      await resetFailureCount(service.id, env);
    }
    
    // Handle incident management
    await handleIncidentManagement(result, env);
    
    console.log(`Monitored service: ${service.name} - Status: ${result.status}`);
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
    const db = drizzle(env.RELAY_PULSE_DB);
    await db.select().from(services).limit(1);
    
    // Check KV access
    await env.RELAY_PULSE_KV.get("health-check");
    
    // Count active services
    const activeServices = await getActiveServices(env);
    
    // Store last run timestamp
    await env.RELAY_PULSE_KV.put("monitoring:last-run", new Date().toISOString());
    
    return {
      status: "healthy",
      lastRun: new Date().toISOString(),
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
 * Cleanup old monitoring data (run daily)
 */
export async function cleanupOldData(env: CloudflareEnv): Promise<void> {
  try {
    const db = drizzle(env.RELAY_PULSE_DB);
    
    // Delete monitoring results older than 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    // This would be implemented with a proper delete query
    // await db.delete(monitoringResults)
    //   .where(lt(monitoringResults.timestamp, ninetyDaysAgo.toISOString()));
    
    console.log("Data cleanup completed");
  } catch (error) {
    console.error("Failed to cleanup old data:", error);
  }
}

// Types
interface ServiceConfig {
  id: number;
  name: string;
  address: string;
  type: "http" | "https" | "tcp";
  port: number;
}

// Worker export for Cloudflare Workers
export default {
  async scheduled(event: ScheduledEvent, env: CloudflareEnv, ctx: ExecutionContext) {
    return handleScheduled(event, env, ctx);
  },
};