import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: serial("id").primaryKey(),
  full_name: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  primary_area: text("primary_area"),
  transport_frequency: text("transport_frequency"),
  known_route_count: text("known_route_count"),
  known_areas: text("known_areas"),
  onboarding_completed: boolean("onboarding_completed").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({ id: true, created_at: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
