import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import {
  SignupBody,
  LoginBody,
  UpdateProfileBody,
  SubmitOnboardingBody,
} from "@workspace/api-zod";
import { hashPassword, verifyPassword, requireAuth } from "../lib/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/auth/signup", async (req, res): Promise<void> => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { full_name, email, password } = parsed.data;

  const [existing] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.email, email));

  if (existing) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const password_hash = hashPassword(password);
  const [profile] = await db
    .insert(profilesTable)
    .values({ full_name, email, password_hash })
    .returning();

  (req.session as Record<string, unknown>).userId = profile.id;

  const { password_hash: _ph, ...safeProfile } = profile;
  res.status(201).json({ profile: safeProfile });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.email, email));

  if (!profile || !verifyPassword(password, profile.password_hash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  (req.session as Record<string, unknown>).userId = profile.id;

  const { password_hash: _ph, ...safeProfile } = profile;
  res.json({ profile: safeProfile });
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as Record<string, unknown>).userId as number;
  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.id, userId));

  if (!profile) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { password_hash: _ph, ...safeProfile } = profile;
  res.json(safeProfile);
});

router.patch("/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as Record<string, unknown>).userId as number;
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [profile] = await db
    .update(profilesTable)
    .set(parsed.data)
    .where(eq(profilesTable.id, userId))
    .returning();

  const { password_hash: _ph, ...safeProfile } = profile;
  res.json(safeProfile);
});

router.post("/onboarding", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as Record<string, unknown>).userId as number;
  const parsed = SubmitOnboardingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { known_areas, transport_frequency, known_route_count } = parsed.data;
  const primary_area = known_areas[0] ?? null;

  await db
    .update(profilesTable)
    .set({
      known_areas: known_areas.join(","),
      transport_frequency,
      known_route_count,
      primary_area,
      onboarding_completed: true,
    })
    .where(eq(profilesTable.id, userId));

  res.json({ success: true });
});

export default router;
