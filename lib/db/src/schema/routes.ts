import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilesTable } from "./profiles";
import { areasTable } from "./areas";

export const routesTable = pgTable("routes", {
  id: serial("id").primaryKey(),
  contributor_id: integer("contributor_id")
    .notNull()
    .references(() => profilesTable.id, { onDelete: "cascade" }),
  start_area_id: integer("start_area_id")
    .notNull()
    .references(() => areasTable.id),
  end_area_id: integer("end_area_id")
    .notNull()
    .references(() => areasTable.id),
  buses_required: text("buses_required").notNull(),
  landmark: text("landmark"),
  confidence_level: text("confidence_level").notNull(),
  difficulty_level: text("difficulty_level").notNull(),
  common_mistake: text("common_mistake"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const routeLegsTable = pgTable("route_legs", {
  id: serial("id").primaryKey(),
  route_id: integer("route_id")
    .notNull()
    .references(() => routesTable.id, { onDelete: "cascade" }),
  leg_order: integer("leg_order").notNull(),
  start_area: text("start_area").notNull(),
  end_area: text("end_area").notNull(),
  fare_range: text("fare_range").notNull(),
  travel_time_range: text("travel_time_range").notNull(),
});

export const insertRouteSchema = createInsertSchema(routesTable).omit({ id: true, created_at: true });
export const insertRouteLegSchema = createInsertSchema(routeLegsTable).omit({ id: true });

export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type InsertRouteLeg = z.infer<typeof insertRouteLegSchema>;
export type Route = typeof routesTable.$inferSelect;
export type RouteLeg = typeof routeLegsTable.$inferSelect;
