import type { Request, Response, NextFunction } from "express";

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === "development") {
    console.warn("WARNING: API key auth skipped in development mode");
    return next();
  }

  const apiKey = req.header("x-api-key");
  const expectedKey = process.env.SESSION_SECRET;

  if (!expectedKey) {
    console.error("SESSION_SECRET environment variable is not set");
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}
