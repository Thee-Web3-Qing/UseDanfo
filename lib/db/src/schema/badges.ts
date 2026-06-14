import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilesTable } from "./profiles";

export const badgesTable = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
});

export const userBadgesTable = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => profilesTable.id, { onDelete: "cascade" }),
  badge_id: integer("badge_id")
    .notNull()
    .references(() => badgesTable.id),
  earned_at: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBadgeSchema = createInsertSchema(badgesTable).omit({ id: true });
export const insertUserBadgeSchema = createInsertSchema(userBadgesTable).omit({ id: true, earned_at: true });

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badgesTable.$inferSelect;
export type UserBadge = typeof userBadgesTable.$inferSelect;
