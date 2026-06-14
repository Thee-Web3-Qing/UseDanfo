import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilesTable } from "./profiles";

export const tripsTable = pgTable("trips", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => profilesTable.id, { onDelete: "cascade" }),
  from_area: text("from_area").notNull(),
  to_area: text("to_area"),
  status: text("status").notNull().default("active"),
  gps_trace: jsonb("gps_trace").notNull().default([]),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completed_at: timestamp("completed_at", { withTimezone: true }),
});

export const tripEventsTable = pgTable("trip_events", {
  id: serial("id").primaryKey(),
  trip_id: integer("trip_id")
    .notNull()
    .references(() => tripsTable.id, { onDelete: "cascade" }),
  event_type: text("event_type").notNull(),
  area_name: text("area_name"),
  amount: integer("amount"),
  gps_point: jsonb("gps_point"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fareReportsTable = pgTable("fare_reports", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => profilesTable.id, { onDelete: "set null" }),
  trip_id: integer("trip_id").references(() => tripsTable.id, { onDelete: "set null" }),
  from_area: text("from_area").notNull(),
  to_area: text("to_area").notNull(),
  amount: integer("amount").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTripSchema = createInsertSchema(tripsTable).omit({ id: true, created_at: true, completed_at: true });
export const insertTripEventSchema = createInsertSchema(tripEventsTable).omit({ id: true, created_at: true });
export const insertFareReportSchema = createInsertSchema(fareReportsTable).omit({ id: true, created_at: true });

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type InsertTripEvent = z.infer<typeof insertTripEventSchema>;
export type InsertFareReport = z.infer<typeof insertFareReportSchema>;
export type Trip = typeof tripsTable.$inferSelect;
export type TripEvent = typeof tripEventsTable.$inferSelect;
export type FareReport = typeof fareReportsTable.$inferSelect;
