import { deleteService } from "@/data/services-storage";
import { errorResponse, successResponse } from "@/lib/responses";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id || isNaN(Number(id))) {
      return errorResponse("Invalid service ID", 400);
    }
    const serviceId = Number(id);

    const deletedService = await deleteService(serviceId);
    if (!deletedService) {
      return errorResponse("Service not found", 404);
    }
    return successResponse(deletedService, 200);
  } catch (err) {
    return errorResponse(String(err), 500);
  }
}
