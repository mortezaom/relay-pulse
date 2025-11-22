/**
 * Database utilities for monitoring operations
 */

import { drizzle } from "drizzle-orm/d1";
import { eq, and, gte, desc, lt } from "drizzle-orm";
import { services, monitoringResults, incidents } from "@/db/schema";
export interface ServiceStatus {
  serviceId: number;
  status: "up" | "down" | "timeout" | "error";
  uptime: number;
  lastCheck?: string;
  responseTime?: number;
}

export interface ServiceWithStatus {
  id: number;
  name: string;
  address: string;
  type: "http" | "https" | "tcp";
  port: number;
  status?: "up" | "down" | "timeout" | "error";
  uptime?: number;
  lastCheck?: string;
  responseTime?: number;
}

/**
 * Get the latest monitoring status for a service
 */
export async function getServiceStatus(
  serviceId: number,
  db: D1Database
): Promise<ServiceStatus | null> {
  const database = drizzle(db);

  const latestResult = await database
    .select()
    .from(monitoringResults)
    .where(eq(monitoringResults.serviceId, serviceId))
    .orderBy(desc(monitoringResults.timestamp))
    .limit(1);

  if (latestResult.length === 0) return null;

  const result = latestResult[0];
  const uptime = await calculateUptime(serviceId, "24h", db);

  return {
    serviceId,
    status: result.status as "up" | "down" | "timeout" | "error",
    uptime,
    lastCheck: result.timestamp,
    responseTime: result.responseTime ?? undefined,
  };
}

/**
 * Calculate uptime percentage for a service over a time period
 */
export async function calculateUptime(
  serviceId: number,
  period: "1h" | "24h" | "7d" | "30d" | "90d",
  db: D1Database
): Promise<number> {
  const database = drizzle(db);

  const since = new Date();
  switch (period) {
    case "1h":
      since.setHours(since.getHours() - 1);
      break;
    case "24h":
      since.setDate(since.getDate() - 1);
      break;
    case "7d":
      since.setDate(since.getDate() - 7);
      break;
    case "30d":
      since.setDate(since.getDate() - 30);
      break;
    case "90d":
      since.setDate(since.getDate() - 90);
      break;
  }

  const results = await database
    .select()
    .from(monitoringResults)
    .where(
      and(
        eq(monitoringResults.serviceId, serviceId),
        gte(monitoringResults.timestamp, since.toISOString())
      )
    );

  if (results.length === 0) return 100;

  const successfulChecks = results.filter(r => r.status === "up").length;
  return (successfulChecks / results.length) * 100;
}

/**
 * Get monitoring history for a service
 */
export async function getMonitoringHistory(
  serviceId: number,
  limit: number = 100,
  db: D1Database
): Promise<MonitoringResult[]> {
  const database = drizzle(db);

  const results = await database
    .select()
    .from(monitoringResults)
    .where(eq(monitoringResults.serviceId, serviceId))
    .orderBy(desc(monitoringResults.timestamp))
    .limit(limit);

  return results.map(r => ({
    id: r.id,
    serviceId: r.serviceId,
    timestamp: r.timestamp,
    status: r.status as "up" | "down" | "timeout" | "error",
    responseTime: r.responseTime ?? undefined,
    statusCode: r.statusCode ?? undefined,
    errorMessage: r.errorMessage ?? undefined,
  }));
}

/**
 * Get all services with their current status
 */
export async function getServicesWithStatus(db: D1Database): Promise<ServiceWithStatus[]> {
  const database = drizzle(db);

  const allServices = await database.select().from(services);

  const servicesWithStatus = await Promise.all(
    allServices.map(async (service) => {
      const status = await getServiceStatus(service.id, db);
      return {
        ...service,
        type: service.type as "http" | "https" | "tcp",
        status: status?.status,
        uptime: status?.uptime,
        lastCheck: status?.lastCheck,
        responseTime: status?.responseTime,
      };
    })
  );

  return servicesWithStatus;
}

/**
 * Get active incidents for a service
 */
export async function getActiveIncidents(
  serviceId?: number,
  db?: D1Database
): Promise<Incident[]> {
  if (!db) return [];

  const database = drizzle(db);

  const query = database
    .select()
    .from(incidents)
    .where(
      serviceId
        ? and(eq(incidents.serviceId, serviceId), eq(incidents.status, "ongoing"))
        : eq(incidents.status, "ongoing")
    )
    .orderBy(desc(incidents.startTime));

  const results = await query;

  return results.map(r => ({
    id: r.id,
    serviceId: r.serviceId,
    startTime: r.startTime,
    endTime: r.endTime ?? undefined,
    status: r.status as "ongoing" | "resolved",
    title: r.title,
    description: r.description ?? undefined,
  }));
}

/**
 * Create a new incident
 */
export async function createIncident(
  serviceId: number,
  title: string,
  description?: string,
  db?: D1Database
): Promise<Incident> {
  if (!db) {
    return {
      id: 1,
      serviceId,
      title,
      description,
      startTime: new Date().toISOString(),
      status: "ongoing",
    };
  }

  const database = drizzle(db);

  const incident = {
    serviceId,
    title,
    description: description ?? null,
    startTime: new Date().toISOString(),
    status: "ongoing" as const,
    endTime: null,
  };

  const result = await database
    .insert(incidents)
    .values(incident)
    .returning();

  return {
    id: result[0].id,
    serviceId: result[0].serviceId,
    title: result[0].title,
    description: result[0].description ?? undefined,
    startTime: result[0].startTime,
    status: result[0].status as "ongoing" | "resolved",
    endTime: result[0].endTime ?? undefined,
  };
}

/**
 * Resolve an incident
 */
export async function resolveIncident(
  incidentId: number,
  db: D1Database
): Promise<void> {
  const database = drizzle(db);

  await database
    .update(incidents)
    .set({
      status: "resolved",
      endTime: new Date().toISOString(),
    })
    .where(eq(incidents.id, incidentId));
}

// TODO: Define types (these should be moved to a shared types file)
interface MonitoringResult {
  id?: number;
  serviceId: number;
  timestamp: string;
  status: "up" | "down" | "timeout" | "error";
  responseTime?: number;
  statusCode?: number;
  errorMessage?: string;
}

interface Incident {
  id: number;
  serviceId: number;
  startTime: string;
  endTime?: string;
  status: "ongoing" | "resolved";
  title: string;
  description?: string;
}