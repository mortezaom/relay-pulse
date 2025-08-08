import * as z from "zod/v4-mini";

export const dashboardSchema = z.object({
  title: z.string().check(z.minLength(1), z.trim()),
  alert: z.string().check(z.minLength(1), z.trim()),
  description: z.string().check(z.minLength(1), z.trim()),
});
export type DashboardSchemaType = z.infer<typeof dashboardSchema>;

export type DashboardDataType = DashboardSchemaType & {
  imageKey: string | null;
};
