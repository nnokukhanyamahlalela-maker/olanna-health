import type { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { partnerLinks } from "@shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * How long (ms) to wait for the DB token-lookup before giving up.
 * Override via PARTNER_DB_TIMEOUT_MS env var (e.g. in tests or staging).
 */
export const PARTNER_DB_TIMEOUT_MS =
  Number(process.env.PARTNER_DB_TIMEOUT_MS) || 5000;

/**
 * Races `promise` against a timer.  If the timer fires first the returned
 * promise rejects with a timeout error so the caller can return 503.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`DB query timed out after ${ms}ms`)),
        ms
      )
    ),
  ]);
}

export async function partnerTokenAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header("x-partner-token");
  if (!token || typeof token !== "string" || token.length < 16) {
    return res.status(401).json({ error: "Missing or invalid partner token" });
  }

  let link: typeof partnerLinks.$inferSelect | undefined;
  try {
    [link] = await withTimeout(
      db
        .select()
        .from(partnerLinks)
        .where(
          and(eq(partnerLinks.partnerToken, token), eq(partnerLinks.isActive, true))
        )
        .limit(1),
      PARTNER_DB_TIMEOUT_MS
    );
  } catch (err) {
    console.error("[partnerTokenAuth] Database error:", err);
    return res.status(503).json({ error: "Service temporarily unavailable" });
  }

  if (!link) {
    return res.status(403).json({ error: "Partner access revoked or invalid" });
  }

  (req as any).partnerLink = link;
  next();
}
