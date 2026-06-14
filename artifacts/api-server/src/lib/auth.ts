import { type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const hashBuffer = crypto.scryptSync(password, salt, 64);
  return hashBuffer.toString("hex") === hash;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const userId = (req.session as Record<string, unknown>)?.userId as number | undefined;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
