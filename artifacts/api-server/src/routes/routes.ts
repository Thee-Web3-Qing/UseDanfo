import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, routesTable, routeLegsTable, areasTable } from "@workspace/db";
import {
  CreateRouteBody,
  UpdateRouteBody,
  GetRouteParams,
  UpdateRouteParams,
  DeleteRouteParams,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

async function getRouteWithLegs(routeId: number) {
  const [route] = await db.select().from(routesTable).where(eq(routesTable.id, routeId));
  if (!route) return null;

  const legs = await db
    .select()
    .from(routeLegsTable)
    .where(eq(routeLegsTable.route_id, routeId))
    .orderBy(routeLegsTable.leg_order);

  const [startArea] = await db
    .select({ name: areasTable.name })
    .from(areasTable)
    .where(eq(areasTable.id, route.start_area_id));

  const [endArea] = await db
    .select({ name: areasTable.name })
    .from(areasTable)
    .where(eq(areasTable.id, route.end_area_id));

  return {
    ...route,
    start_area_name: startArea?.name ?? null,
    end_area_name: endArea?.name ?? null,
    legs,
  };
}

router.get("/routes", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as Record<string, unknown>).userId as number;

  const userRoutes = await db
    .select()
    .from(routesTable)
    .where(eq(routesTable.contributor_id, userId))
    .orderBy(routesTable.created_at);

  const routesWithLegs = await Promise.all(
    userRoutes.map(async (r) => {
      const legs = await db
        .select()
        .from(routeLegsTable)
        .where(eq(routeLegsTable.route_id, r.id))
        .orderBy(routeLegsTable.leg_order);

      const [startArea] = await db
        .select({ name: areasTable.name })
        .from(areasTable)
        .where(eq(areasTable.id, r.start_area_id));

      const [endArea] = await db
        .select({ name: areasTable.name })
        .from(areasTable)
        .where(eq(areasTable.id, r.end_area_id));

      return {
        ...r,
        start_area_name: startArea?.name ?? null,
        end_area_name: endArea?.name ?? null,
        legs,
      };
    })
  );

  res.json(routesWithLegs);
});

router.post("/routes", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as Record<string, unknown>).userId as number;
  const parsed = CreateRouteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { legs, ...routeData } = parsed.data;

  const [route] = await db
    .insert(routesTable)
    .values({ ...routeData, contributor_id: userId })
    .returning();

  if (legs && legs.length > 0) {
    await db.insert(routeLegsTable).values(
      legs.map((leg) => ({ ...leg, route_id: route.id }))
    );
  }

  const full = await getRouteWithLegs(route.id);
  res.status(201).json(full);
});

router.get("/routes/map", async (_req, res): Promise<void> => {
  const allRoutes = await db.select().from(routesTable).orderBy(routesTable.created_at);

  const routesWithLegs = await Promise.all(
    allRoutes.map(async (r) => {
      const legs = await db
        .select()
        .from(routeLegsTable)
        .where(eq(routeLegsTable.route_id, r.id))
        .orderBy(routeLegsTable.leg_order);

      const [startArea] = await db
        .select({ name: areasTable.name })
        .from(areasTable)
        .where(eq(areasTable.id, r.start_area_id));

      const [endArea] = await db
        .select({ name: areasTable.name })
        .from(areasTable)
        .where(eq(areasTable.id, r.end_area_id));

      return {
        ...r,
        start_area_name: startArea?.name ?? "Unknown",
        end_area_name: endArea?.name ?? "Unknown",
        avg_fare: null,
        legs,
      };
    })
  );

  res.json(routesWithLegs);
});

router.get("/routes/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetRouteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const full = await getRouteWithLegs(params.data.id);
  if (!full) {
    res.status(404).json({ error: "Route not found" });
    return;
  }

  res.json(full);
});

router.patch("/routes/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as Record<string, unknown>).userId as number;
  const params = UpdateRouteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateRouteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { legs, ...routeData } = parsed.data;

  const [existing] = await db
    .select()
    .from(routesTable)
    .where(and(eq(routesTable.id, params.data.id), eq(routesTable.contributor_id, userId)));

  if (!existing) {
    res.status(404).json({ error: "Route not found" });
    return;
  }

  if (Object.keys(routeData).length > 0) {
    await db
      .update(routesTable)
      .set(routeData)
      .where(eq(routesTable.id, params.data.id));
  }

  if (legs !== undefined) {
    await db.delete(routeLegsTable).where(eq(routeLegsTable.route_id, params.data.id));
    if (legs.length > 0) {
      await db.insert(routeLegsTable).values(
        legs.map((leg) => ({ ...leg, route_id: params.data.id }))
      );
    }
  }

  const full = await getRouteWithLegs(params.data.id);
  res.json(full);
});

router.delete("/routes/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as Record<string, unknown>).userId as number;
  const params = DeleteRouteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(routesTable)
    .where(and(eq(routesTable.id, params.data.id), eq(routesTable.contributor_id, userId)));

  if (!existing) {
    res.status(404).json({ error: "Route not found" });
    return;
  }

  await db.delete(routesTable).where(eq(routesTable.id, params.data.id));
  res.json({ success: true });
});

export default router;
