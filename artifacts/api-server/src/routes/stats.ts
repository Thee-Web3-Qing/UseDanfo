import { Router, type IRouter } from "express";
import { db, routesTable, profilesTable, areasTable, routeLegsTable, badgesTable, userBadgesTable } from "@workspace/db";
import { eq, countDistinct, count } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [routesCount] = await db.select({ count: count() }).from(routesTable);
  const [contributorsCount] = await db.select({ count: countDistinct(routesTable.contributor_id) }).from(routesTable);

  const startAreas = await db.selectDistinct({ area_id: routesTable.start_area_id }).from(routesTable);
  const endAreas = await db.selectDistinct({ area_id: routesTable.end_area_id }).from(routesTable);
  const allAreaIds = new Set([
    ...startAreas.map((a) => a.area_id),
    ...endAreas.map((a) => a.area_id),
  ]);

  res.json({
    total_routes: routesCount.count,
    total_contributors: contributorsCount.count,
    total_areas_covered: allAreaIds.size,
  });
});

router.get("/me/dashboard", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as Record<string, unknown>).userId as number;

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, userId));
  if (!profile) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { password_hash: _ph, ...safeProfile } = profile;

  const [routesResult] = await db
    .select({ count: count() })
    .from(routesTable)
    .where(eq(routesTable.contributor_id, userId));

  const routesCount = routesResult.count;
  const contributionScore = routesCount * 10;

  const userBadges = await db
    .select()
    .from(userBadgesTable)
    .where(eq(userBadgesTable.user_id, userId));

  const recentRoutesRaw = await db
    .select()
    .from(routesTable)
    .where(eq(routesTable.contributor_id, userId))
    .orderBy(sql`${routesTable.created_at} desc`)
    .limit(5);

  const recentRoutes = await Promise.all(
    recentRoutesRaw.map(async (r) => {
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

  res.json({
    profile: safeProfile,
    routes_count: routesCount,
    contribution_score: contributionScore,
    badges_count: userBadges.length,
    recent_routes: recentRoutes,
  });
});

router.get("/me/wrapped", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as Record<string, unknown>).userId as number;

  const userRoutes = await db
    .select()
    .from(routesTable)
    .where(eq(routesTable.contributor_id, userId));

  const routesContributed = userRoutes.length;

  const areaIds = new Set<number>();
  for (const r of userRoutes) {
    areaIds.add(r.start_area_id);
    areaIds.add(r.end_area_id);
  }
  const areasCovered = areaIds.size;

  let mostFamiliarAreaName: string | null = null;
  if (userRoutes.length > 0) {
    const areaCounts: Record<number, number> = {};
    for (const r of userRoutes) {
      areaCounts[r.start_area_id] = (areaCounts[r.start_area_id] ?? 0) + 1;
      areaCounts[r.end_area_id] = (areaCounts[r.end_area_id] ?? 0) + 1;
    }
    const topAreaId = Object.entries(areaCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (topAreaId) {
      const [area] = await db
        .select({ name: areasTable.name })
        .from(areasTable)
        .where(eq(areasTable.id, parseInt(topAreaId)));
      mostFamiliarAreaName = area?.name ?? null;
    }
  }

  let topCorridor: string | null = null;
  if (userRoutes.length > 0) {
    const firstRoute = userRoutes[0];
    const [start] = await db.select({ name: areasTable.name }).from(areasTable).where(eq(areasTable.id, firstRoute.start_area_id));
    const [end] = await db.select({ name: areasTable.name }).from(areasTable).where(eq(areasTable.id, firstRoute.end_area_id));
    if (start && end) {
      topCorridor = `${start.name} → ${end.name}`;
    }
  }

  const levels = [
    { min: 0, max: 0, level: "Newbie" },
    { min: 1, max: 2, level: "Route Scout" },
    { min: 3, max: 5, level: "Mainland Navigator" },
    { min: 6, max: 10, level: "Island Connector" },
    { min: 11, max: Infinity, level: "Danfo Expert" },
  ];
  const contributorLevel = levels.find(
    (l) => routesContributed >= l.min && routesContributed <= l.max
  )?.level ?? "Newbie";

  const userBadgeRows = await db
    .select({ badge_id: userBadgesTable.badge_id })
    .from(userBadgesTable)
    .where(eq(userBadgesTable.user_id, userId));

  const earnedBadges = await Promise.all(
    userBadgeRows.map(async (ub) => {
      const [badge] = await db
        .select()
        .from(badgesTable)
        .where(eq(badgesTable.id, ub.badge_id));
      return badge;
    })
  );

  res.json({
    routes_contributed: routesContributed,
    areas_covered: areasCovered,
    most_familiar_area: mostFamiliarAreaName,
    contributor_level: contributorLevel,
    top_corridor: topCorridor,
    badges: earnedBadges.filter(Boolean),
  });
});

export default router;
