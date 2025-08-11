import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const services = sqliteTable('services', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  address: text('address').notNull(),
  type: text('type', { enum: ['https', 'http', 'tcp'] }).notNull(),
  port: integer('port').notNull(),
});
