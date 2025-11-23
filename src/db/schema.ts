import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  type: text("type", { enum: ["https", "http", "tcp"] }).notNull(),
  port: integer("port").notNull(),
});

// Monitoring results table - stores actual ping results
export const monitoringResults = sqliteTable("monitoring_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serviceId: integer("service_id")
    .references(() => services.id)
    .notNull(),
  timestamp: text("timestamp").notNull(), // ISO string
  status: text("status", {
    enum: ["up", "down", "timeout", "error"],
  }).notNull(),
  responseTime: integer("response_time"), // in milliseconds
  statusCode: integer("status_code"),
  errorMessage: text("error_message"),
});

// Incidents table - tracks service outages and downtime periods
export const incidents = sqliteTable("incidents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serviceId: integer("service_id")
    .references(() => services.id)
    .notNull(),
  startTime: text("start_time").notNull(), // ISO string
  endTime: text("end_time"), // ISO string, null if ongoing
  status: text("status", { enum: ["ongoing", "resolved"] }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
});

// Note: User settings like monitoring intervals, notification configs, etc.
// are stored in Cloudflare KV for easy dashboard management:
// - monitoring:${serviceId} - monitoring configuration
// - notification:${serviceId} - notification settings
// - settings:global - global application settings
// - failures:${serviceId} - current failure count for alerting
