import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerProductLogRoutes } from "./productLogRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  registerChatRoutes(app);
  registerProductLogRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
