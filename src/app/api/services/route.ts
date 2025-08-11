import type { NextRequest } from "next/server";
import * as z from "zod/v4-mini";
import { type ServiceType, serviceSchema } from "@/data/services-data";
import { getServiceList, saveService } from "@/data/services-storage";
import { errorResponse, successResponse } from "@/lib/responses";

export const runtime = "edge";

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

		return successResponse(savedService, 201);
	} catch (err) {
		return errorResponse(String(err), 500);
	}
}

export async function GET(_: NextRequest) {
	try {
		const services = await getServiceList();

		return successResponse(services, 200);
	} catch (err) {
		return errorResponse(String(err), 500);
	}
}
