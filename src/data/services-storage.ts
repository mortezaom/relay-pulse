import { getDb } from "@/db";
import type { ServiceType } from "./services-data";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getServiceList = async () => {
  const db = await getDb();
  const allServices = await db.select().from(services);
  return allServices;
}

export const saveService = async (service: ServiceType) => {
  const db = await getDb();
  const { id, ...rest } = service;
  if (id === -1) {
    // Insert new service
    const [newService] = await db.insert(services).values(rest).returning();
    return newService;
  } else {
    // Update existing service
    const [updatedService] = await db.update(services)
      .set(rest)
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }
}
