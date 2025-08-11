import * as z from "zod/v4-mini";

const ipRegex =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(?:\.(?!$)|$)){4}$|^(([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;

const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]{1,63}\.)+[a-zA-Z]{2,}$/;

export const serviceSchema = z.object({
  id: z.number(),
  name: z.string().check(z.maxLength(50), z.minLength(2, "Name must be at least 2 characters long")),
  address: z
    .string()
    .check(
      z.refine(
        (val) => ipRegex.test(val) || domainRegex.test(val),
        "Must be a valid IP address or domain",
      ),
    ),
  type: z.enum(["https", "http", "tcp"]),
  port: z.number(),
});

export type ServiceType = z.infer<typeof serviceSchema>;
