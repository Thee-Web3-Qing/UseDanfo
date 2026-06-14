import { Router, type IRouter } from "express";
import { passport, googleOAuthEnabled } from "../lib/passport";

const router: IRouter = Router();

router.get("/auth/google", (req, res, next) => {
  if (!googleOAuthEnabled) {
    res.status(503).json({ error: "Google OAuth is not configured on this server." });
    return;
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get(
  "/auth/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { failureRedirect: "/login?error=google_failed" })(
      req,
      res,
      next
    );
  },
  (req, res) => {
    const user = req.user as { id: number; onboarding_completed: boolean } | undefined;
    if (!user) {
      res.redirect("/login?error=google_failed");
      return;
    }

    (req.session as Record<string, unknown>).userId = user.id;

    if (!user.onboarding_completed) {
      res.redirect("/onboarding");
    } else {
      res.redirect("/dashboard");
    }
  }
);

export default router;
