import * as z from "zod/v4-mini";

const ipRegex =
	/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(?:\.(?!$)|$)){4}$|^(([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;

const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]{1,63}\.)+[a-zA-Z]{2,}$/;

export const serversSchema = z.object({
	id: z.number(),
	name: z.string().check(z.maxLength(50)),
	address: z
		.string()
		.check(
			z.refine(
				(val) => ipRegex.test(val) || domainRegex.test(val),
				"Must be a valid IP address or domain",
			),
		),
	type: z.enum(["tcp", "http", "https"]),
	port: z.nullable(z.optional(z.number())),
});

export type ServerType = z.infer<typeof serversSchema>;
