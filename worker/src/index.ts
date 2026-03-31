import { drizzle, services } from "@repo/db";

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ) {
    console.log(controller.cron);

    const db = drizzle(env.RELAY_PULSE_DB);

    const allServices = await db.select().from(services);

    ctx.waitUntil(Promise.resolve(allServices));
  },
};
