/**
 * Push notification routes
 *
 * POST /api/push/register  — upsert an Expo push token for a device
 * POST /api/push/test      — send a test notification to a specific device (dev only)
 */

import type { Express, Request, Response } from "express";
import { db } from "./db";
import { devicePushTokens } from "../shared/schema";
import { eq, sql } from "drizzle-orm";
import { sendExpoPush } from "./lib/expoPush";

export function registerPushRoutes(app: Express): void {

  // ── Register / refresh push token ─────────────────────────────────────────
  app.post("/api/push/register", async (req: Request, res: Response) => {
    try {
      const deviceId: string | undefined = req.headers["x-device-id"] as string;
      const { token } = req.body as { token?: string };

      if (!deviceId || !token) {
        res.status(400).json({ error: "deviceId header and token body are required" });
        return;
      }

      // Basic Expo token format check
      if (!token.startsWith("ExponentPushToken[") && !token.startsWith("ExpoPushToken[")) {
        res.status(400).json({ error: "Invalid Expo push token format" });
        return;
      }

      // Upsert — update if exists, insert if new
      await db
        .insert(devicePushTokens)
        .values({ deviceId, token, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: devicePushTokens.deviceId,
          set: { token, updatedAt: new Date() },
        });

      res.json({ ok: true });
    } catch (e) {
      console.error("[PushRoutes] register error:", e);
      res.status(500).json({ error: "Failed to register push token" });
    }
  });

  // ── Dev-only: send a test push to a specific device ───────────────────────
  app.post("/api/push/test", async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === "production") {
      res.status(403).json({ error: "Not available in production" });
      return;
    }
    try {
      const deviceId: string | undefined = req.headers["x-device-id"] as string;
      if (!deviceId) {
        res.status(400).json({ error: "x-device-id header required" });
        return;
      }

      const rows = await db
        .select()
        .from(devicePushTokens)
        .where(eq(devicePushTokens.deviceId, deviceId));

      if (!rows.length) {
        res.status(404).json({ error: "No push token registered for this device" });
        return;
      }

      const tickets = await sendExpoPush({
        to:    rows[0].token,
        title: "Lanna notification test 🌸",
        body:  "Push notifications are working correctly.",
        data:  { screen: "Home" },
        sound: "default",
      });

      res.json({ ok: true, tickets });
    } catch (e) {
      console.error("[PushRoutes] test push error:", e);
      res.status(500).json({ error: "Failed to send test push" });
    }
  });

  // ── Internal helper: send push to a device by deviceId ────────────────────
  // Called from other server-side code, not exposed as a public endpoint
}

/**
 * Send a push notification to a specific device by its deviceId.
 * Returns true if the token was found and the push was attempted.
 */
export async function sendPushToDevice(
  deviceId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<boolean> {
  try {
    const rows = await db
      .select()
      .from(devicePushTokens)
      .where(eq(devicePushTokens.deviceId, deviceId));

    if (!rows.length) return false;

    await sendExpoPush({ to: rows[0].token, title, body, data, sound: "default" });
    return true;
  } catch (e) {
    console.error("[PushRoutes] sendPushToDevice error:", e);
    return false;
  }
}
