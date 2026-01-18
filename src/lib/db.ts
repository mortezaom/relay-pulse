import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "@repo/db";

export const getDb = () => {
  const { env } = getCloudflareContext();
  return drizzle(env.RELAY_PULSE_DB);
};
