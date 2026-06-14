import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, tripsTable, tripEventsTable, fareReportsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

function getUserId(req: Parameters<typeof requireAuth>[0]): number {
  return (req.session as Record<string, unknown>).userId as number;
}

async function getTripWithEvents(tripId: number) {
  const [trip] = await db.select().from(tripsTable).where(eq(tripsTable.id, tripId));
  if (!trip) return null;
  const events = await db
    .select()
    .from(tripEventsTable)
    .where(eq(tripEventsTable.trip_id, tripId))
    .orderBy(tripEventsTable.created_at);
  return { ...trip, events };
}

router.get("/trips", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const trips = await db
    .select()
    .from(tripsTable)
    .where(eq(tripsTable.user_id, userId))
    .orderBy(desc(tripsTable.created_at));

  const withEvents = await Promise.all(trips.map((t) => getTripWithEvents(t.id)));
  res.json(withEvents);
});

router.post("/trips", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const { from_area, to_area, initial_gps } = req.body;

  if (!from_area) {
    res.status(400).json({ error: "from_area is required" });
    return;
  }

  const gpsTrace = initial_gps ? [initial_gps] : [];

  const [trip] = await db
    .insert(tripsTable)
    .values({
      user_id: userId,
      from_area,
      to_area: to_area ?? null,
      status: "active",
      gps_trace: gpsTrace,
    })
    .returning();

  res.status(201).json({ ...trip, events: [] });
});

router.get("/trips/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const tripId = parseInt(req.params.id, 10);
  if (isNaN(tripId)) { res.status(400).json({ error: "Invalid trip id" }); return; }

  const trip = await getTripWithEvents(tripId);
  if (!trip || trip.user_id !== userId) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  res.json(trip);
});

router.patch("/trips/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const tripId = parseInt(req.params.id, 10);
  if (isNaN(tripId)) { res.status(400).json({ error: "Invalid trip id" }); return; }

  const [existing] = await db
    .select()
    .from(tripsTable)
    .where(and(eq(tripsTable.id, tripId), eq(tripsTable.user_id, userId)));

  if (!existing) { res.status(404).json({ error: "Trip not found" }); return; }

  const { status, gps_points, to_area } = req.body;

  const updates: Partial<typeof tripsTable.$inferSelect> = {};

  if (status) {
    updates.status = status;
    if (status === "completed") {
      updates.completed_at = new Date();
    }
  }

  if (to_area) {
    updates.to_area = to_area;
  }

  if (gps_points && Array.isArray(gps_points) && gps_points.length > 0) {
    const existingTrace = Array.isArray(existing.gps_trace) ? existing.gps_trace : [];
    updates.gps_trace = [...existingTrace, ...gps_points] as typeof tripsTable.$inferSelect["gps_trace"];
  }

  const [updated] = await db
    .update(tripsTable)
    .set(updates)
    .where(eq(tripsTable.id, tripId))
    .returning();

  const full = await getTripWithEvents(updated.id);
  res.json(full);
});

router.post("/trips/:id/events", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const tripId = parseInt(req.params.id, 10);
  if (isNaN(tripId)) { res.status(400).json({ error: "Invalid trip id" }); return; }

  const [trip] = await db
    .select()
    .from(tripsTable)
    .where(and(eq(tripsTable.id, tripId), eq(tripsTable.user_id, userId)));

  if (!trip) { res.status(404).json({ error: "Trip not found" }); return; }

  const { event_type, area_name, amount, gps_point } = req.body;

  if (!event_type || !["entered_bus", "dropped", "paid"].includes(event_type)) {
    res.status(400).json({ error: "Invalid event_type" });
    return;
  }

  const [event] = await db
    .insert(tripEventsTable)
    .values({
      trip_id: tripId,
      event_type,
      area_name: area_name ?? null,
      amount: amount ?? null,
      gps_point: gps_point ?? null,
    })
    .returning();

  res.status(201).json(event);
});

router.post("/fare-reports", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const { from_area, to_area, amount, trip_id } = req.body;

  if (!from_area || !to_area || amount == null) {
    res.status(400).json({ error: "from_area, to_area and amount are required" });
    return;
  }

  const [report] = await db
    .insert(fareReportsTable)
    .values({
      user_id: userId,
      from_area,
      to_area,
      amount: parseInt(amount, 10),
      trip_id: trip_id ?? null,
    })
    .returning();

  res.status(201).json(report);
});

router.get("/fare-reports", async (req, res): Promise<void> => {
  const { from_area, to_area } = req.query as Record<string, string>;

  let query = db.select().from(fareReportsTable).orderBy(desc(fareReportsTable.created_at)).$dynamic();

  if (from_area && to_area) {
    query = query.where(
      and(
        eq(fareReportsTable.from_area, from_area),
        eq(fareReportsTable.to_area, to_area)
      )
    );
  } else if (from_area) {
    query = query.where(eq(fareReportsTable.from_area, from_area));
  } else if (to_area) {
    query = query.where(eq(fareReportsTable.to_area, to_area));
  }

  const reports = await query;
  res.json(reports);
});

export default router;
