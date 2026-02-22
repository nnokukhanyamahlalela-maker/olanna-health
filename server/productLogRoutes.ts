import type { Express, Request, Response } from "express";
import { db } from "./db";
import { productLogs, insertProductLogSchema } from "@shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";

function getDeviceId(req: Request): string | null {
  const deviceId = req.header("x-device-id");
  if (!deviceId || typeof deviceId !== "string" || deviceId.length < 8 || deviceId.length > 64) {
    return null;
  }
  return deviceId;
}

export function registerProductLogRoutes(app: Express): void {
  app.post("/api/product-logs", async (req: Request, res: Response) => {
    try {
      const deviceId = getDeviceId(req);
      if (!deviceId) {
        return res.status(400).json({ error: "Missing or invalid device identifier" });
      }

      const parsed = insertProductLogSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
      }

      const [log] = await db
        .insert(productLogs)
        .values({
          deviceId,
          date: parsed.data.date,
          productType: parsed.data.productType,
          brand: parsed.data.brand || null,
          scented: parsed.data.scented,
          notes: parsed.data.notes || null,
        })
        .returning();

      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating product log:", error);
      res.status(500).json({ error: "Failed to save product log" });
    }
  });

  app.get("/api/product-logs/export", async (req: Request, res: Response) => {
    try {
      const deviceId = getDeviceId(req);
      if (!deviceId) {
        return res.status(400).json({ error: "Missing or invalid device identifier" });
      }

      const daysParam = parseInt(req.query.days as string) || 30;
      const days = Math.min(Math.max(daysParam, 1), 365);
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().split("T")[0];

      const logs = await db
        .select()
        .from(productLogs)
        .where(and(eq(productLogs.deviceId, deviceId), gte(productLogs.date, sinceStr)))
        .orderBy(desc(productLogs.date));

      const header = "Date,Product Type,Brand,Scented,Notes,Created At";
      const rows = logs.map((l) => {
        const escapeCsv = (val: string | null) => {
          if (!val) return "";
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        };
        return [
          l.date,
          escapeCsv(l.productType),
          escapeCsv(l.brand),
          l.scented ? "Yes" : "No",
          escapeCsv(l.notes),
          l.createdAt.toISOString(),
        ].join(",");
      });

      const csv = [header, ...rows].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=product-logs.csv");
      res.send(csv);
    } catch (error) {
      console.error("Error exporting product logs:", error);
      res.status(500).json({ error: "Failed to export product logs" });
    }
  });

  app.get("/api/product-logs", async (req: Request, res: Response) => {
    try {
      const deviceId = getDeviceId(req);
      if (!deviceId) {
        return res.status(400).json({ error: "Missing or invalid device identifier" });
      }

      const daysParam = parseInt(req.query.days as string) || 30;
      const days = Math.min(Math.max(daysParam, 1), 365);
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().split("T")[0];

      const logs = await db
        .select()
        .from(productLogs)
        .where(and(eq(productLogs.deviceId, deviceId), gte(productLogs.date, sinceStr)))
        .orderBy(desc(productLogs.date));

      res.json(logs);
    } catch (error) {
      console.error("Error fetching product logs:", error);
      res.status(500).json({ error: "Failed to fetch product logs" });
    }
  });

  app.delete("/api/product-logs/:id", async (req: Request, res: Response) => {
    try {
      const deviceId = getDeviceId(req);
      if (!deviceId) {
        return res.status(400).json({ error: "Missing or invalid device identifier" });
      }

      const id = parseInt(req.params.id as string);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid log id" });
      }

      const [existing] = await db
        .select()
        .from(productLogs)
        .where(and(eq(productLogs.id, id), eq(productLogs.deviceId, deviceId)));

      if (!existing) {
        return res.status(404).json({ error: "Log not found" });
      }

      await db.delete(productLogs).where(eq(productLogs.id, id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product log:", error);
      res.status(500).json({ error: "Failed to delete product log" });
    }
  });
}
