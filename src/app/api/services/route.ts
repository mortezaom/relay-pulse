import type { NextRequest } from "next/server";
import * as z from "zod/v4-mini";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { type ServiceType, serviceSchema } from "@/data/services-data";
import { getServiceList, saveService } from "@/data/services-storage";
import { getServicesWithStatus } from "@/lib/monitoring/database";
import { errorResponse, successResponse } from "@/lib/responses";

export const runtime = "edge";

export async function GET(_req: NextRequest) {
	try {
		const { env } = getCloudflareContext();

		if (!env?.RELAY_PULSE_DB) {
			// Fallback to basic list without monitoring data if DB not available
			const services = await getServiceList();
			return successResponse(services, 200);
		}

		const servicesWithStatus = await getServicesWithStatus(env.RELAY_PULSE_DB);
		return successResponse(servicesWithStatus, 200);
	} catch (err) {
		console.error(err)
		return errorResponse(String(err), 500);
	}
}

export async function POST(req: Request) {
	try {
		const json = await req.json().catch(() => null);

		if (!json) {
			return errorResponse("Invalid or empty JSON body", 400);
		}

		const body = await serviceSchema.safeParseAsync(json);

		if (!body.success) {
			return errorResponse(z.prettifyError(body.error), 422);
		}

		const service: ServiceType = body.data;

		const savedService = await saveService(service);

		// TODO: Start monitoring for new service
		// await scheduleServiceMonitoring(savedService.id);

		return successResponse(savedService, 201);
	} catch (err) {
		return errorResponse(String(err), 500);
	}
}
