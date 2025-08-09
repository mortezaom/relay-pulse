import * as z from "zod/v4-mini";

export const brandingSchema = z.object({
  title: z.string().check(z.minLength(1), z.trim()),
  alert: z.string().check(z.minLength(1), z.trim()),
  description: z.string().check(z.minLength(1), z.trim()),
});
export type BrandingSchemaType = z.infer<typeof brandingSchema>;

export type BrandingDataType = BrandingSchemaType & {
  imageUrl: string | null;
};
