/** biome-ignore-all lint/performance/noNamespaceImport: It's Okay */
/** biome-ignore-all lint/performance/noBarrelFile: It's Okay */
import { drizzle as createDrizzle } from "drizzle-orm/d1";
import * as schemaObj from "./schema";

export * from "./schema";
export * as schema from "./schema";

export function drizzle(d1: D1Database) {
  return createDrizzle(d1, { schema: schemaObj });
}
