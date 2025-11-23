/**
 * Core monitoring logic for Relay Pulse
 * Handles service monitoring and health checks
 */

export type MonitoringResult = {
  serviceId: number;
  status: "up" | "down" | "timeout" | "error";
  responseTime?: number;
  statusCode?: number;
  errorMessage?: string;
  timestamp: string;
};

export type ServiceConfig = {
  id: number;
  name: string;
  address: string;
  type: "http" | "https" | "tcp";
  port: number;
};

type CloudflareEnv = {
  RELAY_PULSE_DB: D1Database;
  RELAY_PULSE_KV: KVNamespace;
  RELAY_PULSE_BUCKET: R2Bucket;
};

/**
 * Main monitoring function - checks a single service
 */
export async function monitorService(
  service: ServiceConfig,
  env: CloudflareEnv
): Promise<MonitoringResult> {
  const startTime = Date.now();

  try {
    switch (service.type) {
      case "http":
      case "https":
        return await monitorHttpService(service, startTime);
      case "tcp":
        return await monitorTcpService(service, startTime, env);
      default:
        throw new Error(`Unsupported service type: ${service.type}`);
    }
  } catch (error) {
    return {
      serviceId: service.id,
      status: "error",
      errorMessage: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Monitor HTTP/HTTPS services
 * Check response time, status code, and basic connectivity
 */
async function monitorHttpService(
  service: ServiceConfig,
  startTime: number
): Promise<MonitoringResult> {
  const url = `${service.type}://${service.address}:${service.port}`;

  try {
    const controller = new AbortController();
    const timeoutMs = 30_000; // 30 seconds
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: "HEAD", // Use HEAD to minimize data transfer
        signal: controller.signal,
        headers: {
          "User-Agent": "Relay-Pulse-Monitor/1.0",
        },
        redirect: "manual",
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      return {
        serviceId: service.id,
        status:
          response.ok || response.status === 301 || response.status === 302
            ? "up"
            : "down",
        responseTime,
        statusCode: response.status,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        return {
          serviceId: service.id,
          status: "timeout",
          errorMessage: `Request timeout after ${timeoutMs}ms`,
          timestamp: new Date().toISOString(),
        };
      }

      throw error;
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      serviceId: service.id,
      status: "error",
      errorMessage: error instanceof Error ? error.message : String(error),
      responseTime,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Monitor TCP services via external TCP checker service
 */
async function monitorTcpService(
  service: ServiceConfig,
  startTime: number,
  env: CloudflareEnv
): Promise<MonitoringResult> {
  try {
    const tcpCheckerUrl = await getTcpCheckerUrl(env);

    if (!tcpCheckerUrl) {
      return {
        serviceId: service.id,
        status: "error",
        errorMessage:
          "TCP checker service not configured. Please set TCP checker URL in Settings.",
        timestamp: new Date().toISOString(),
      };
    }

    const response = await fetch(tcpCheckerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Relay-Pulse-Monitor/1.0",
      },
      body: JSON.stringify({
        host: service.address,
        port: service.port,
        timeout: 30_000,
      }),
      signal: AbortSignal.timeout(35_000),
    });

    if (!response.ok) {
      throw new Error(
        `TCP checker returned ${response.status}: ${response.statusText}`
      );
    }

    const result = (await response.json()) as TcpCheckResponse;
    const responseTime = Date.now() - startTime;

    return {
      serviceId: service.id,
      status: result.reachable ? "up" : "down",
      responseTime: result.responseTime || responseTime,
      errorMessage: result.error || undefined,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      serviceId: service.id,
      status: "error",
      errorMessage: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get TCP checker URL from KV settings
 */
async function getTcpCheckerUrl(env: CloudflareEnv): Promise<string | null> {
  try {
    const settingsData = await env.RELAY_PULSE_KV.get("settings:global");
    if (!settingsData) {
      return null;
    }

    const settings = JSON.parse(settingsData) as { tcpCheckerUrl?: string };
    return settings.tcpCheckerUrl || null;
  } catch (error) {
    console.error("Failed to get TCP checker URL:", error);
    return null;
  }
}

/**
 * Response format from external TCP checker service
 */
type TcpCheckResponse = {
  reachable: boolean;
  responseTime?: number;
  error?: string;
  host: string;
  port: number;
};

/**
 * Save monitoring result to database
 */
export async function saveMonitoringResult(
  result: MonitoringResult,
  env: CloudflareEnv
): Promise<void> {
  try {
    const { getWorkerDb } = await import("@/db/index");
    const { monitoringResults } = await import("@/db/schema");

    const db = getWorkerDb(env.RELAY_PULSE_DB);

    await db.insert(monitoringResults).values({
      serviceId: result.serviceId,
      timestamp: result.timestamp,
      status: result.status,
      responseTime: result.responseTime || null,
      statusCode: result.statusCode || null,
      errorMessage: result.errorMessage || null,
    });
  } catch (error) {
    console.error("Failed to save monitoring result:", error);
  }
}

/**
 * Handle incident creation and resolution
 */
export async function handleIncidentManagement(
  result: MonitoringResult,
  env: CloudflareEnv
): Promise<void> {
  try {
    const { getWorkerDb } = await import("@/db/index");
    const { incidents } = await import("@/db/schema");
    const { eq, and } = await import("drizzle-orm");

    const db = getWorkerDb(env.RELAY_PULSE_DB);
    const isServiceDown =
      result.status === "down" ||
      result.status === "error" ||
      result.status === "timeout";

    if (isServiceDown) {
      // Check for existing ongoing incident
      const existingIncident = await db
        .select()
        .from(incidents)
        .where(
          and(
            eq(incidents.serviceId, result.serviceId),
            eq(incidents.status, "ongoing")
          )
        )
        .limit(1);

      // Create new incident if none exists
      if (existingIncident.length === 0) {
        await db.insert(incidents).values({
          serviceId: result.serviceId,
          startTime: result.timestamp,
          status: "ongoing",
          title: `Service Down - Check #${Math.random().toString(36).substr(2, 9)}`,
          description:
            result.errorMessage || `Service returned status: ${result.status}`,
        });
        console.log(`Created incident for service ${result.serviceId}`);
      }
    } else {
      // Service is back up - resolve ongoing incidents
      const ongoingIncidents = await db
        .select()
        .from(incidents)
        .where(
          and(
            eq(incidents.serviceId, result.serviceId),
            eq(incidents.status, "ongoing")
          )
        );

      for (const incident of ongoingIncidents) {
        await db
          .update(incidents)
          .set({
            status: "resolved",
            endTime: result.timestamp,
          })
          .where(eq(incidents.id, incident.id));

        console.log(
          `Resolved incident ${incident.id} for service ${result.serviceId}`
        );
      }
    }
  } catch (error) {
    console.error("Failed to handle incident management:", error);
  }
}
