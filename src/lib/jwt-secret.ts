/**
 * JWT Secret Management
 * 
 * This module handles JWT secret retrieval with automatic generation fallback.
 * Priority order:
 * 1. Environment variable (RELAY_JWT_SECRET)
 * 2. Cloudflare Secret
 * 3. KV storage (fallback)
 * 4. Auto-generate and store in KV
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Get JWT secret with automatic fallback
 * This ensures the application always has a valid secret
 */
export async function getJwtSecret(): Promise<string> {
    try {
        // Try environment variable first (local development)
        if (process.env.RELAY_JWT_SECRET) {
            return process.env.RELAY_JWT_SECRET;
        }

        // Try Cloudflare environment (production secret)
        const { env } = getCloudflareContext();

        // Cloudflare secrets are exposed as environment variables in the worker
        // This will be available if set via: wrangler secret put RELAY_JWT_SECRET
        if (env.RELAY_JWT_SECRET) {
            return env.RELAY_JWT_SECRET as string;
        }

        // Try KV storage as fallback
        const storedSecret = await env.RELAY_PULSE_KV.get("system:jwt_secret");
        if (storedSecret) {
            return storedSecret;
        }

        // Generate new secret if none exists
        console.warn("⚠️ JWT_SECRET not found. Generating new secret...");
        console.warn("📝 For production, set it explicitly via: wrangler secret put RELAY_JWT_SECRET");

        const newSecret = generateSecureSecret();

        // Store in KV for persistence
        await env.RELAY_PULSE_KV.put("system:jwt_secret", newSecret);

        return newSecret;
    } catch (error) {
        console.error("Failed to get JWT secret:", error);

        // Last resort: generate a temporary secret (not persisted)
        // This should only happen in development or edge cases
        console.error("⚠️ Using temporary JWT secret - sessions will not persist across restarts");
        return generateSecureSecret();
    }
}

/**
 * Generate a cryptographically secure random secret
 */
function generateSecureSecret(): string {
    // Use crypto.randomUUID() twice for extra entropy
    // This generates a 72-character hex string
    const uuid1 = crypto.randomUUID().replace(/-/g, '');
    const uuid2 = crypto.randomUUID().replace(/-/g, '');
    const uuid3 = crypto.randomUUID().replace(/-/g, '');

    return `${uuid1}${uuid2}${uuid3}`;
}

/**
 * Check if JWT secret is properly configured (not auto-generated)
 * Returns true if using explicit secret, false if using fallback
 */
export async function isJwtSecretConfigured(): Promise<boolean> {
    try {
        if (process.env.RELAY_JWT_SECRET) {
            return true;
        }

        const { env } = getCloudflareContext();
        if (env.RELAY_JWT_SECRET) {
            return true;
        }

        // Check if secret exists in KV (means it was auto-generated)
        const storedSecret = await env.RELAY_PULSE_KV.get("system:jwt_secret");
        return storedSecret === null;
    } catch {
        return false;
    }
}
