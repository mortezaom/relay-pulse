/**
 * JWT Secret Management
 *
 * This module retrieves the JWT secret from the environment.
 * The secret must be provided via:
 * - RELAY_JWT_SECRET environment variable
 * - wrangler secret put RELAY_JWT_SECRET (Cloudflare)
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Get JWT secret from environment
 * Throws an error if not configured
 */
export function getJwtSecret(): string {
  // Try environment variable first (local development)
  if (process.env.RELAY_JWT_SECRET) {
    return process.env.RELAY_JWT_SECRET;
  }

  // Try Cloudflare environment (production secret)
  const { env } = getCloudflareContext();

  if (env.RELAY_JWT_SECRET) {
    return env.RELAY_JWT_SECRET as string;
  }

  throw new Error(
    "RELAY_JWT_SECRET is not configured. Please set it via environment variables or wrangler secret put RELAY_JWT_SECRET"
  );
}
