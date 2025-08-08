import { dashboardSchema, type DashboardDataType } from "@/data/dashboard-data";
import {
    convertFileKeyToUrl,
    getDashboardData,
    saveDashboardData,
    saveFileToBucket,
} from "@/data/dashboard-storage";
import { errorResponse, successResponse } from "@/lib/responses";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NextRequest } from "next/server";
import * as z from "zod/v4-mini";

export const runtime = "edge";

const DASHBOARD_CACHE: Map<string, DashboardDataType> = new Map();

export async function POST(req: Request) {
  try {
    const cfEnv = getCloudflareContext().env;
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    // convert all fields to object except image fields
    const bodyFormData = Object.fromEntries(
      Array.from(formData.entries()).filter(([key]) => key !== "image"),
    );

    const body = await dashboardSchema.safeParseAsync(bodyFormData);

    if (!body.success) {
      return errorResponse(z.prettifyError(body.error), 422);
    }

    const dashboardData: DashboardDataType = { ...body.data, imageKey: null };

    if (file) {
      const imageKey = await saveFileToBucket(cfEnv, file);
      dashboardData.imageKey = imageKey ? convertFileKeyToUrl(imageKey) : null;
    }

    await saveDashboardData(cfEnv, dashboardData);

    DASHBOARD_CACHE.set("dash", dashboardData);

    return successResponse(dashboardData, 201);
  } catch (err) {
    return errorResponse(String(err), 500);
  }
}

export async function GET(_: NextRequest) {
  try {
    const cfEnv = getCloudflareContext().env;

    if (DASHBOARD_CACHE.has("dash")) {
      return successResponse(DASHBOARD_CACHE.get("dash")!, 200);
    }

    const dashboardData = await getDashboardData(cfEnv);

    if (!dashboardData) {
      return errorResponse("Dashboard data not found", 404);
    }

    DASHBOARD_CACHE.set("dash", dashboardData);

    return successResponse(dashboardData, 200);
  } catch (err) {
    return errorResponse(String(err), 500);
  }
}
