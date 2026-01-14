import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NextRequest } from "next/server";
import { prettifyError } from "zod/v4-mini";
import { type BrandingDataType, brandingSchema } from "@/data/branding-data";
import {
  getBrandingData,
  processImageToBase64,
  saveBrandingData,
} from "@/data/branding-storage";
import { errorResponse, successResponse } from "@/lib/responses";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const cfEnv = getCloudflareContext().env;
    const formData = await req.formData();
    const file = formData.get("image") as File | "removed" | null;

    // convert all fields to object except image fields
    const bodyFormData = Object.fromEntries(
      Array.from(formData.entries()).filter(([key]) => key !== "image")
    );

    const body = await brandingSchema.safeParseAsync(bodyFormData);

    if (!body.success) {
      return errorResponse(prettifyError(body.error), 422);
    }

    const brandingData: BrandingDataType = { ...body.data, imageUrl: null };

    if (file && file !== "removed") {
      const base64Image = await processImageToBase64(file);
      brandingData.imageUrl = base64Image;
    }
    if (!brandingData.imageUrl && file !== "removed") {
      const existingData = await getBrandingData(cfEnv);
      if (existingData?.imageUrl) {
        brandingData.imageUrl = existingData.imageUrl;
      }
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
