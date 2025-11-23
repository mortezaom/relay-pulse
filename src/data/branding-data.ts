import { z } from "zod/v4-mini";

export const brandingSchema = z.object({
  title: z.string().check(z.minLength(1), z.trim()),
  alert: z.string().check(z.minLength(1), z.trim()),
  description: z.string().check(z.minLength(1), z.trim()),
});
export type BrandingSchemaType = z.infer<typeof brandingSchema>;

export type BrandingDataType = BrandingSchemaType & {
  // Base64 data URI (e.g., "data:image/png;base64,...")
  // Image is automatically resized to max 200x200px
  imageUrl: string | null;
};
