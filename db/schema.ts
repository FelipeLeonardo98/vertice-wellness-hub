import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const aiDailyUsage = sqliteTable("ai_daily_usage", {
  day: text("day").primaryKey(),
  requests: integer("requests").notNull().default(0),
});
