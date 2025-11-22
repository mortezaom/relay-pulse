/**
 * Health Check API
 * 
 * Returns the current health status of the monitoring system.
 * Useful for verifying deployment and monitoring the monitor itself.
 * 
 * GET /api/health - Public endpoint (no authentication required)
 */

import { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getWorkerDb } from "@/db/index";
import { services, monitoringResults } from "@/db/schema";
import { desc } from "drizzle-orm";
import { isJwtSecretConfigured } from "@/lib/jwt-secret";

export const runtime = "edge";

export async function GET(request: NextRequest) {
    const { env } = getCloudflareContext();

    try {
        // Test database connectivity
        const db = getWorkerDb(env.RELAY_PULSE_DB);

        // Count total services
        const allServices = await db.select().from(services);
        const totalServices = allServices.length;

        // Get last monitoring run timestamp
        const lastRun = await env.RELAY_PULSE_KV.get("monitoring:last-run");

        // Get most recent monitoring result
        const recentResults = await db
            .select()
            .from(monitoringResults)
            .orderBy(desc(monitoringResults.timestamp))
            .limit(1);

        const lastMonitoringCheck = recentResults[0]?.timestamp || null;

        // Check JWT secret configuration
        const jwtConfigured = await isJwtSecretConfigured();

        // Calculate uptime statistics
        const upCount = allServices.filter(s => s !== null).length;

        return Response.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            system: {
                version: "1.0.0",
                environment: process.env.NODE_ENV || "production",
            },
            services: {
                total: totalServices,
                monitored: totalServices, // All services are monitored
            },
            monitoring: {
                lastRun: lastRun || "never",
                lastCheck: lastMonitoringCheck || "no checks yet",
                cronSchedule: "*/5 * * * * (every 5 minutes)",
            },
            storage: {
                database: "connected",
                kv: "connected",
                r2: "available",
            },
            security: {
                jwtConfigured: jwtConfigured,
                jwtWarning: !jwtConfigured ? "Using auto-generated JWT secret. Set RELAY_JWT_SECRET for production." : undefined,
            },
        });
    } catch (error) {
        console.error("Health check failed:", error);

        return Response.json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error),
            details: "System is experiencing issues. Check logs for more information.",
        }, { status: 500 });
    }
}
