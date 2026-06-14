import { Router, type IRouter } from "express";
import { db, areasTable } from "@workspace/db";
import { asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/areas", async (_req, res): Promise<void> => {
  const areas = await db.select().from(areasTable).orderBy(asc(areasTable.name));
  res.json(areas);
});

export default router;
