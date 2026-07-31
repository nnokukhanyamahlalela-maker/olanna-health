import type { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { partnerLinks } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export async function partnerTokenAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.header("x-partner-token");
  if (!token || typeof token !== "string" || token.length < 16) {
    return res.status(401).json({ error: "Missing or invalid partner token" });
  }

  let link: typeof partnerLinks.$inferSelect | undefined;
  try {
    [link] = await db
      .select()
      .from(partnerLinks)
      .where(and(eq(partnerLinks.partnerToken, token), eq(partnerLinks.isActive, true)))
      .limit(1);
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
