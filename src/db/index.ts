import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export const getDb = async () => {
  const { env } = getCloudflareContext();
  return drizzle(env.RELAY_PULSE_DB, { schema });
};
