import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./packages/db/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
});
