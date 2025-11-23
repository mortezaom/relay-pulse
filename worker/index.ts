// This wrapper lets us keep the OpenNext-generated worker for fetch handlers
// while providing our own cron-driven scheduled handler for monitoring.

import { handleScheduled } from "@/lib/monitoring/scheduler";

// OpenNext produces .open-next/worker.js during `opennext build`.
// We load it lazily so TypeScript tooling works even before the build runs.
const openNextWorkerPromise: Promise<{
  fetch: (
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ) => Promise<Response>;
  // Future OpenNext versions might emit a scheduled handler; call it if present.
  scheduled?: (
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ) => Promise<unknown> | unknown;
}> = import("../.open-next/worker.js").then((mod: any) => mod.default ?? mod);

type Env = CloudflareEnv;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const worker = await openNextWorkerPromise;
    return worker.fetch(request, env, ctx);
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Run Relay Pulse monitoring.
    await handleScheduled(env);

    // Also forward to the base worker if it exposes its own scheduled handler.
    const worker = await openNextWorkerPromise;
    if (typeof worker.scheduled === "function") {
      return worker.scheduled(event, env, ctx);
    }
  },
};
