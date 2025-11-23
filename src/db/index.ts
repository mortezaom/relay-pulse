/** biome-ignore-all lint/performance/noNamespaceImport: no need to Tree Shaking in the server */
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

/**
 * Get database connection for Next.js routes
 * Uses getCloudflareContext to get environment variables
 */
export const getDb = () => {
  const { env } = getCloudflareContext();
  return getWorkerDb(env.RELAY_PULSE_DB);
};

/**
 * Get database connection for workers
 * Pass the D1 database directly from worker env
 */
export const getWorkerDb = (db: D1Database) => drizzle(db, { schema });
