import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, badgesTable, userBadgesTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/badges", async (_req, res): Promise<void> => {
  const badges = await db.select().from(badgesTable);
  res.json(badges);
});

router.get("/me/badges", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as Record<string, unknown>).userId as number;

  const rows = await db
    .select()
    .from(userBadgesTable)
    .where(eq(userBadgesTable.user_id, userId));

  const result = await Promise.all(
    rows.map(async (ub) => {
      const [badge] = await db
        .select()
        .from(badgesTable)
        .where(eq(badgesTable.id, ub.badge_id));
      return { ...ub, badge };
    })
  );

  res.json(result.filter((r) => r.badge));
});

export default router;
