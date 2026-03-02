import type { Express, Request, Response } from "express";
import crypto from "crypto";
import { db } from "./db";
import {
  partnerInvites,
  partnerLinks,
  partnerSharingSettings,
  cycleSnapshots,
  partnerAuditLog,
  updatePartnerSettingsSchema,
  insertCycleSnapshotSchema,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { generateSharedView } from "./partnerSharedView";
import { partnerTokenAuth } from "./middleware/partnerAuth";
import rateLimit from "express-rate-limit";

function getDeviceId(req: Request): string | null {
  const deviceId = req.header("x-device-id");
  if (!deviceId || typeof deviceId !== "string" || deviceId.length < 8 || deviceId.length > 64) {
    return null;
  }
  return deviceId;
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code.toUpperCase()).digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

async function logAudit(actorDeviceId: string, action: string, metadata?: any) {
  await db.insert(partnerAuditLog).values({
    actorDeviceId,
    action,
    metadata: metadata || null,
  });
}

async function getOrCreateSettings(primaryDeviceId: string) {
  const [existing] = await db
    .select()
    .from(partnerSharingSettings)
    .where(eq(partnerSharingSettings.primaryDeviceId, primaryDeviceId))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(partnerSharingSettings)
    .values({ primaryDeviceId })
    .returning();

  return created;
}

export function registerPartnerRoutes(app: Express): void {
  const acceptLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: "Too many accept attempts. Try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.post("/api/partner/invite", async (req: Request, res: Response) => {
    try {
      const deviceId = getDeviceId(req);
      if (!deviceId) return res.status(400).json({ error: "Missing device identifier" });

      const [existingLink] = await db
        .select()
        .from(partnerLinks)
        .where(and(eq(partnerLinks.primaryDeviceId, deviceId), eq(partnerLinks.isActive, true)))
        .limit(1);

      if (existingLink) {
        return res.status(409).json({ error: "Already linked to a partner. Revoke first." });
      }

      const code = generateInviteCode();
      const codeHash = hashCode(code);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await db.insert(partnerInvites).values({
        primaryDeviceId: deviceId,
        inviteCodeHash: codeHash,
        expiresAt,
      });

      await logAudit(deviceId, "PARTNER_INVITE_CREATED");

      res.json({ inviteCode: code, expiresAt: expiresAt.toISOString() });
    } catch (err) {
      console.error("Partner invite error:", err);
      res.status(500).json({ error: "Failed to create invite" });
    }
  });

  app.post("/api/partner/accept", acceptLimiter, async (req: Request, res: Response) => {
    try {
      const deviceId = getDeviceId(req);
      if (!deviceId) return res.status(400).json({ error: "Missing device identifier" });

      const { code } = req.body;
      if (!code || typeof code !== "string" || code.length < 4 || code.length > 10) {
        return res.status(400).json({ error: "Invalid invite code" });
      }

      const codeHash = hashCode(code);

      const [invite] = await db
        .select()
        .from(partnerInvites)
        .where(
          and(
            eq(partnerInvites.inviteCodeHash, codeHash),
            eq(partnerInvites.status, "pending")
          )
        )
        .limit(1);

      if (!invite) {
        return res.status(404).json({ error: "Invalid or expired invite code" });
      }

      if (new Date() > invite.expiresAt) {
        await db
          .update(partnerInvites)
          .set({ status: "expired" })
          .where(eq(partnerInvites.id, invite.id));
        return res.status(410).json({ error: "Invite code has expired" });
      }

      if (invite.primaryDeviceId === deviceId) {
        return res.status(400).json({ error: "Cannot accept your own invite" });
      }

      const [existingPrimaryLink] = await db
        .select()
        .from(partnerLinks)
        .where(and(eq(partnerLinks.primaryDeviceId, invite.primaryDeviceId), eq(partnerLinks.isActive, true)))
        .limit(1);

      if (existingPrimaryLink) {
        return res.status(409).json({ error: "This user already has an active partner link" });
      }

      const [existingPartnerLink] = await db
        .select()
        .from(partnerLinks)
        .where(and(eq(partnerLinks.partnerDeviceId, deviceId), eq(partnerLinks.isActive, true)))
        .limit(1);

      if (existingPartnerLink) {
        return res.status(409).json({ error: "You are already linked to another partner" });
      }

      const token = generateToken();

      await db
        .update(partnerInvites)
        .set({ status: "accepted" })
        .where(eq(partnerInvites.id, invite.id));

      const [link] = await db
        .insert(partnerLinks)
        .values({
          primaryDeviceId: invite.primaryDeviceId,
          partnerDeviceId: deviceId,
          partnerToken: token,
        })
        .returning();

      await db
        .update(partnerInvites)
        .set({ status: "expired" })
        .where(
          and(
            eq(partnerInvites.primaryDeviceId, invite.primaryDeviceId),
            eq(partnerInvites.status, "pending")
          )
        );

      await getOrCreateSettings(invite.primaryDeviceId);
      await logAudit(deviceId, "PARTNER_LINK_ACCEPTED", { primaryDeviceId: invite.primaryDeviceId });

      res.json({ partnerToken: token, linkedAt: link.createdAt });
    } catch (err) {
      console.error("Partner accept error:", err);
      res.status(500).json({ error: "Failed to accept invite" });
    }
  });

  app.get("/api/partner/settings", async (req: Request, res: Response) => {
    try {
      const deviceId = getDeviceId(req);
      if (!deviceId) return res.status(400).json({ error: "Missing device identifier" });

      const settings = await getOrCreateSettings(deviceId);
      res.json(settings);
    } catch (err) {
      console.error("Partner settings get error:", err);
      res.status(500).json({ error: "Failed to get settings" });
    }
  });

  app.put("/api/partner/settings", async (req: Request, res: Response) => {
    try {
      const deviceId = getDeviceId(req);
      if (!deviceId) return res.status(400).json({ error: "Missing device identifier" });

      const parsed = updatePartnerSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid settings", details: parsed.error.flatten().fieldErrors });
      }

      await getOrCreateSettings(deviceId);

      const [updated] = await db
        .update(partnerSharingSettings)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(partnerSharingSettings.primaryDeviceId, deviceId))
        .returning();

      await logAudit(deviceId, "PARTNER_SETTINGS_UPDATED", parsed.data);

      res.json(updated);
    } catch (err) {
      console.error("Partner settings update error:", err);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  app.post("/api/partner/revoke", async (req: Request, res: Response) => {
    try {
      const deviceId = getDeviceId(req);
      if (!deviceId) return res.status(400).json({ error: "Missing device identifier" });

      const [link] = await db
        .update(partnerLinks)
        .set({ isActive: false, revokedAt: new Date() })
        .where(and(eq(partnerLinks.primaryDeviceId, deviceId), eq(partnerLinks.isActive, true)))
        .returning();

      if (!link) {
        return res.status(404).json({ error: "No active partner link found" });
      }

      await logAudit(deviceId, "PARTNER_REVOKED");
      res.json({ success: true });
    } catch (err) {
      console.error("Partner revoke error:", err);
      res.status(500).json({ error: "Failed to revoke" });
    }
  });

  app.post("/api/partner/revoke-emergency", async (req: Request, res: Response) => {
    try {
      const deviceId = getDeviceId(req);
      if (!deviceId) return res.status(400).json({ error: "Missing device identifier" });

      const newToken = generateToken();

      const [link] = await db
        .update(partnerLinks)
        .set({ isActive: false, revokedAt: new Date(), partnerToken: newToken })
        .where(and(eq(partnerLinks.primaryDeviceId, deviceId), eq(partnerLinks.isActive, true)))
        .returning();

      if (!link) {
        return res.status(404).json({ error: "No active partner link found" });
      }

      await logAudit(deviceId, "PARTNER_EMERGENCY_REVOKED");
      res.json({ success: true });
    } catch (err) {
      console.error("Partner emergency revoke error:", err);
      res.status(500).json({ error: "Failed to emergency revoke" });
    }
  });

  app.get("/api/partner/status", async (req: Request, res: Response) => {
    try {
      const deviceId = getDeviceId(req);
      if (!deviceId) return res.status(400).json({ error: "Missing device identifier" });

      const [activeLink] = await db
        .select()
        .from(partnerLinks)
        .where(and(eq(partnerLinks.primaryDeviceId, deviceId), eq(partnerLinks.isActive, true)))
        .limit(1);

      if (activeLink) {
        return res.json({
          status: "linked",
          linkedAt: activeLink.createdAt,
        });
      }

      const [pendingInvite] = await db
        .select()
        .from(partnerInvites)
        .where(
          and(
            eq(partnerInvites.primaryDeviceId, deviceId),
            eq(partnerInvites.status, "pending")
          )
        )
        .limit(1);

      if (pendingInvite && new Date() < pendingInvite.expiresAt) {
        return res.json({ status: "pending", expiresAt: pendingInvite.expiresAt });
      }

      res.json({ status: "none" });
    } catch (err) {
      console.error("Partner status error:", err);
      res.status(500).json({ error: "Failed to get status" });
    }
  });

  app.post("/api/partner/snapshot", async (req: Request, res: Response) => {
    try {
      const deviceId = getDeviceId(req);
      if (!deviceId) return res.status(400).json({ error: "Missing device identifier" });

      const parsed = insertCycleSnapshotSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid snapshot", details: parsed.error.flatten().fieldErrors });
      }

      const [existing] = await db
        .select()
        .from(cycleSnapshots)
        .where(eq(cycleSnapshots.deviceId, deviceId))
        .limit(1);

      if (existing) {
        await db
          .update(cycleSnapshots)
          .set({ ...parsed.data, updatedAt: new Date() })
          .where(eq(cycleSnapshots.deviceId, deviceId));
      } else {
        await db
          .insert(cycleSnapshots)
          .values({ deviceId, ...parsed.data });
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Snapshot push error:", err);
      res.status(500).json({ error: "Failed to save snapshot" });
    }
  });

  app.get("/api/partner/preview", async (req: Request, res: Response) => {
    try {
      const deviceId = getDeviceId(req);
      if (!deviceId) return res.status(400).json({ error: "Missing device identifier" });

      const settings = await getOrCreateSettings(deviceId);

      const [snapshot] = await db
        .select()
        .from(cycleSnapshots)
        .where(eq(cycleSnapshots.deviceId, deviceId))
        .limit(1);

      const view = generateSharedView(snapshot || null, settings);
      res.json(view);
    } catch (err) {
      console.error("Partner preview error:", err);
      res.status(500).json({ error: "Failed to generate preview" });
    }
  });

  app.get("/api/partner/dashboard", partnerTokenAuth, async (req: Request, res: Response) => {
    try {
      const link = (req as any).partnerLink;

      const settings = await getOrCreateSettings(link.primaryDeviceId);

      const [snapshot] = await db
        .select()
        .from(cycleSnapshots)
        .where(eq(cycleSnapshots.deviceId, link.primaryDeviceId))
        .limit(1);

      const view = generateSharedView(snapshot || null, settings);
      res.json(view);
    } catch (err) {
      console.error("Partner dashboard error:", err);
      res.status(500).json({ error: "Failed to load dashboard" });
    }
  });
}
