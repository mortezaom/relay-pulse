import type { NextRequest } from "next/server";
import * as z from "zod/v4-mini";
import { type ServiceType, serviceSchema } from "@/data/services-data";
import { getServiceList, saveService } from "@/data/services-storage";
import { errorResponse, successResponse } from "@/lib/responses";

export const runtime = "edge";

// TODO: Add service monitoring status integration
// When fetching services, include latest monitoring status and uptime percentage
export async function GET(_: NextRequest) {
	try {
		const services = await getServiceList();
		
		// TODO: Enhance with monitoring data
		// const servicesWithStatus = await Promise.all(
		//   services.map(async (service) => ({
		//     ...service,
		//     status: await getServiceStatus(service.id),
		//     uptime: await getServiceUptime(service.id),
		//     lastCheck: await getLastMonitoringResult(service.id),
		//     responseTime: await getAverageResponseTime(service.id),
		//   }))
		// );

		return successResponse(services, 200);
	} catch (err) {
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
