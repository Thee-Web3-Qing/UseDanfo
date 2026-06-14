import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BASE_URL = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : process.env.BASE_URL ?? "http://localhost:8080";

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BASE_URL}/api/auth/google/callback`,
        scope: ["profile", "email"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email from Google profile"), undefined);
          }

          const [existing] = await db
            .select()
            .from(profilesTable)
            .where(eq(profilesTable.email, email));

          if (existing) {
            return done(null, existing);
          }

          const fullName =
            profile.displayName ||
            `${profile.name?.givenName ?? ""} ${profile.name?.familyName ?? ""}`.trim() ||
            email.split("@")[0];

          const [created] = await db
            .insert(profilesTable)
            .values({
              full_name: fullName,
              email,
              password_hash: `google:${profile.id}`,
            })
            .returning();

          return done(null, created);
        } catch (err) {
          logger.error({ err }, "Google OAuth error");
          return done(err as Error, undefined);
        }
      }
    )
  );

  logger.info("Google OAuth strategy registered");
} else {
  logger.warn(
    "GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google OAuth disabled"
  );
}

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as { id: number }).id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const [user] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, id));
    done(null, user ?? undefined);
  } catch (err) {
    done(err, undefined);
  }
});

export { passport };
export const googleOAuthEnabled = !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
