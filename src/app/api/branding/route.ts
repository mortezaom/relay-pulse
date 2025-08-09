import { brandingSchema, type BrandingDataType } from "@/data/branding-data";
import {
  convertFileKeyToUrl,
  getBrandingData,
  saveBrandingData,
  saveFileToBucket,
} from "@/data/branding-storage";
import { errorResponse, successResponse } from "@/lib/responses";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NextRequest } from "next/server";
import * as z from "zod/v4-mini";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const cfEnv = getCloudflareContext().env;
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    // convert all fields to object except image fields
    const bodyFormData = Object.fromEntries(
      Array.from(formData.entries()).filter(([key]) => key !== "image"),
    );

    const body = await brandingSchema.safeParseAsync(bodyFormData);

    if (!body.success) {
      return errorResponse(z.prettifyError(body.error), 422);
    }

    const brandingData: BrandingDataType = { ...body.data, imageUrl: null };

    if (file) {
      const imageKey = await saveFileToBucket(cfEnv, file);
      brandingData.imageUrl = imageKey ? convertFileKeyToUrl(imageKey) : null;
    }

    await saveBrandingData(cfEnv, brandingData);

    return successResponse(brandingData, 201);
  } catch (err) {
    return errorResponse(String(err), 500);
  }
}

export async function GET(_: NextRequest) {
  try {
    const cfEnv = getCloudflareContext().env;

    const bData = await getBrandingData(cfEnv);

    if (!bData) {
      return errorResponse("Branding data not found", 404);
    }

    return successResponse(bData, 200);
  } catch (err) {
    return errorResponse(String(err), 500);
  }
}
