import * as z from "zod/v4-mini";

export const setupSchema = z.object({
	email: z.email(),
	password: z.string().check(z.minLength(8), z.trim()),
	secret: z.string().check(z.minLength(1), z.trim()),
});
export type SetupSchemaType = z.infer<typeof setupSchema>;

export const loginSchema = z.object({
	email: z.email(),
	password: z.string().check(z.minLength(8)),
});
export type LoginSchemaType = z.infer<typeof loginSchema>;
