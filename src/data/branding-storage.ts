import type { BrandingDataType } from "./branding-data";

export const KV_BRANDING_KEY = "branding-data";

export const saveFileToBucket = async (
	env: CloudflareEnv,
	file: File,
): Promise<string | null> => {
	const rBucket = env.RELAY_PULSE_BUCKET;

	const filename = file.name || `upload-${Date.now()}`;
	const contentType = file.type || "application/octet-stream";

	const arrayBuffer = await file.arrayBuffer();
	const body = new Uint8Array(arrayBuffer);

	if (!rBucket) return null;

	const r2Object = await rBucket.put(filename, body, {
		httpMetadata: { contentType },
	});

	return r2Object.key;
};

export const saveBrandingData = async (
	env: CloudflareEnv,
	data: BrandingDataType,
) => {
	const rKV = env.RELAY_PULSE_KV;
	await rKV.put(KV_BRANDING_KEY, JSON.stringify(data));

	return data;
};

export const getBrandingData = async (
	env: CloudflareEnv,
): Promise<BrandingDataType | null> => {
	const rKV = env.RELAY_PULSE_KV;
	const kvData = await rKV.get(KV_BRANDING_KEY);
	if (!kvData) return null;

	try {
		const parsedData = JSON.parse(kvData);

		return parsedData as BrandingDataType;
	} catch {
		return null;
	}
};

export const convertFileKeyToUrl = (key: string) => {
	return `/r2?key=${key}`;
};
