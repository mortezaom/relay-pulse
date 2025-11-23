import type { BrandingDataType } from "./branding-data";

export const KV_BRANDING_KEY = "branding-data";

const MAX_LOGO_SIZE = 200; // Max dimension (width/height) in pixels

/**
 * Resizes and converts an image file to base64 data URI
 * Crops/resizes to a maximum of 200x200px for efficiency
 */
export const processImageToBase64 = async (
  file: File
): Promise<string | null> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });

    // Use ImageBitmap API (available in Workers) for resizing
    const imageBitmap = await createImageBitmap(blob);

    // Calculate new dimensions while maintaining aspect ratio
    let { width, height } = imageBitmap;
    if (width > MAX_LOGO_SIZE || height > MAX_LOGO_SIZE) {
      const scale = Math.min(MAX_LOGO_SIZE / width, MAX_LOGO_SIZE / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    // Create canvas and draw resized image
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return null;
    }

    ctx.drawImage(imageBitmap, 0, 0, width, height);

    // Convert to blob and then to base64
    const resizedBlob = await canvas.convertToBlob({
      type: "image/png",
      quality: 0.9,
    });

    const resizedArrayBuffer = await resizedBlob.arrayBuffer();
    const base64 = btoa(
      String.fromCharCode(...new Uint8Array(resizedArrayBuffer))
    );

    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error("Failed to process image:", error);
    return null;
  }
};

export const saveBrandingData = async (
  env: CloudflareEnv,
  data: BrandingDataType
) => {
  const rKV = env.RELAY_PULSE_KV;
  await rKV.put(KV_BRANDING_KEY, JSON.stringify(data));

  return data;
};

export const getBrandingData = async (
  env: CloudflareEnv
): Promise<BrandingDataType | null> => {
  const rKV = env.RELAY_PULSE_KV;
  const kvData = await rKV.get(KV_BRANDING_KEY);

  if (!kvData) {
    return null;
  }

  try {
    const parsedData = JSON.parse(kvData);

    return parsedData as BrandingDataType;
  } catch {
    return null;
  }
};
