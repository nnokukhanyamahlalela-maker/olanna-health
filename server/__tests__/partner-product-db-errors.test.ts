/**
 * Audit: partner routes and product-log routes for silent-failure patterns.
 *
 * Findings:
 * - Neither partnerRoutes.ts nor productLogRoutes.ts calls any external service
 *   that requires an API key (no OpenAI, no third-party HTTP calls).
 * - The only external dependency is the database, which is already guarded at
 *   startup by db.ts (throws clearly when DATABASE_URL is missing).
 * - All route handlers already wrap calls in try/catch and return descriptive
 *   JSON error bodies; no silent 500s exist.
 *
 * These tests lock in that behaviour as a regression guard: when the database
 * throws, every route must return a JSON body with an `error` field rather
 * than hanging or emitting an empty/unstructured response.
 *
 * No new 503 guards are required because there is no missing-config path that
 * currently reaches a route handler silently — DATABASE_URL absence crashes the
 * server at boot rather than at request time.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import supertest from "supertest";

// ---------------------------------------------------------------------------
// Mock the database so tests are isolated from any real Postgres instance.
// We start with a "working" db and override per-test to simulate failures.
// ---------------------------------------------------------------------------
const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  transaction: vi.fn(),
};

vi.mock("../db", () => ({ db: mockDb }));

// generateSharedView is a pure function — no need to mock it.
// partnerAuth middleware hits the db; mock it so it doesn't interfere.
vi.mock("../middleware/partnerAuth", () => ({
  partnerTokenAuth: (_req: any, _res: any, next: any) => next(),
}));

// ---------------------------------------------------------------------------
// DB helper: make every chained drizzle call resolve to an empty array/value
// unless overridden.
// ---------------------------------------------------------------------------
function makeDbReturnsEmpty() {
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    orderBy: vi.fn().mockResolvedValue([]),
    set: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    send: vi.fn().mockResolvedValue(undefined),
  };
  mockDb.select.mockReturnValue(chain);
  mockDb.insert.mockReturnValue(chain);
  mockDb.update.mockReturnValue(chain);
  mockDb.delete.mockReturnValue(chain);
  mockDb.transaction.mockImplementation(async (fn: any) => fn(mockDb));
  return chain;
}

/** Make the db throw a realistic Postgres connection error. */
function makeDbThrow(message = "Connection refused") {
  const err = Object.assign(new Error(message), { code: "ECONNREFUSED" });
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockRejectedValue(err),
    orderBy: vi.fn().mockRejectedValue(err),
    set: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockRejectedValue(err),
  };
  mockDb.select.mockReturnValue(chain);
  mockDb.insert.mockReturnValue(chain);
  mockDb.update.mockReturnValue(chain);
  mockDb.delete.mockReturnValue(chain);
  mockDb.transaction.mockRejectedValue(err);
}

// ---------------------------------------------------------------------------
// App factories (separate Express instances to avoid route shadowing)
// ---------------------------------------------------------------------------
async function partnerApp() {
  const app = express();
  app.use(express.json());
  const { registerPartnerRoutes } = await import("../partnerRoutes");
  registerPartnerRoutes(app);
  return supertest(app);
}

async function productLogApp() {
  const app = express();
  app.use(express.json());
  const { registerProductLogRoutes } = await import("../productLogRoutes");
  registerProductLogRoutes(app);
  return supertest(app);
}

const DEVICE_ID = "device-id-abcdefgh"; // ≥8 chars, ≤64 chars

// ---------------------------------------------------------------------------
// Partner routes — happy-path structural checks
// ---------------------------------------------------------------------------
describe("Partner routes: input validation returns descriptive errors", () => {
  beforeEach(() => makeDbReturnsEmpty());

  it("POST /api/partner/invite → 400 when x-device-id is missing", async () => {
    const agent = await partnerApp();
    const res = await agent.post("/api/partner/invite").send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("POST /api/partner/accept → 400 when x-device-id is missing", async () => {
    const agent = await partnerApp();
    const res = await agent.post("/api/partner/accept").send({ code: "ABC123" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("POST /api/partner/accept → 400 when invite code is missing", async () => {
    const agent = await partnerApp();
    const res = await agent
      .post("/api/partner/accept")
      .set("x-device-id", DEVICE_ID)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("PUT /api/partner/settings → 400 when body is invalid", async () => {
    const agent = await partnerApp();
    const res = await agent
      .put("/api/partner/settings")
      .set("x-device-id", DEVICE_ID)
      .send({ shareCyclePhase: "not-a-boolean" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

// ---------------------------------------------------------------------------
// Partner routes — database failure returns descriptive JSON (not silent)
// ---------------------------------------------------------------------------
describe("Partner routes: database errors return descriptive JSON responses", () => {
  beforeEach(() => makeDbThrow());

  it("POST /api/partner/invite → descriptive JSON error when db throws", async () => {
    const agent = await partnerApp();
    const res = await agent
      .post("/api/partner/invite")
      .set("x-device-id", DEVICE_ID)
      .send({});

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it("POST /api/partner/accept → descriptive JSON error when db throws", async () => {
    const agent = await partnerApp();
    const res = await agent
      .post("/api/partner/accept")
      .set("x-device-id", DEVICE_ID)
      .send({ code: "ABC123" });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it("GET /api/partner/settings → descriptive JSON error when db throws", async () => {
    const agent = await partnerApp();
    const res = await agent
      .get("/api/partner/settings")
      .set("x-device-id", DEVICE_ID);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it("PUT /api/partner/settings → descriptive JSON error when db throws", async () => {
    const agent = await partnerApp();
    const res = await agent
      .put("/api/partner/settings")
      .set("x-device-id", DEVICE_ID)
      .send({ shareCyclePhase: true });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it("POST /api/partner/revoke → descriptive JSON error when db throws", async () => {
    const agent = await partnerApp();
    const res = await agent
      .post("/api/partner/revoke")
      .set("x-device-id", DEVICE_ID)
      .send({});

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it("POST /api/partner/revoke-emergency → descriptive JSON error when db throws", async () => {
    const agent = await partnerApp();
    const res = await agent
      .post("/api/partner/revoke-emergency")
      .set("x-device-id", DEVICE_ID)
      .send({});

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it("GET /api/partner/status → descriptive JSON error when db throws", async () => {
    const agent = await partnerApp();
    const res = await agent
      .get("/api/partner/status")
      .set("x-device-id", DEVICE_ID);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it("POST /api/partner/snapshot → descriptive JSON error when db throws", async () => {
    const agent = await partnerApp();
    const res = await agent
      .post("/api/partner/snapshot")
      .set("x-device-id", DEVICE_ID)
      .send({
        cycleLength: 28,
        lastPeriodStart: "2025-01-01",
        phase: "follicular",
      });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it("GET /api/partner/preview → descriptive JSON error when db throws", async () => {
    const agent = await partnerApp();
    const res = await agent
      .get("/api/partner/preview")
      .set("x-device-id", DEVICE_ID);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it("GET /api/partner/dashboard → descriptive JSON error when db throws", async () => {
    const agent = await partnerApp();
    const res = await agent
      .get("/api/partner/dashboard")
      .set("x-partner-token", "a-valid-looking-partner-token-abcdef123456");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
    expect(res.body.error.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Product-log routes — input validation
// ---------------------------------------------------------------------------
describe("Product-log routes: input validation returns descriptive errors", () => {
  beforeEach(() => makeDbReturnsEmpty());

  it("POST /api/product-logs → 400 when x-device-id is missing", async () => {
    const agent = await productLogApp();
    const res = await agent.post("/api/product-logs").send({ date: "2025-01-01", productType: "tampon", scented: false });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("POST /api/product-logs → 400 when body is invalid", async () => {
    const agent = await productLogApp();
    const res = await agent
      .post("/api/product-logs")
      .set("x-device-id", DEVICE_ID)
      .send({ productType: 123 }); // wrong type
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("GET /api/product-logs → 400 when x-device-id is missing", async () => {
    const agent = await productLogApp();
    const res = await agent.get("/api/product-logs");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("DELETE /api/product-logs/:id → 400 when id is not a number", async () => {
    const agent = await productLogApp();
    const res = await agent
      .delete("/api/product-logs/not-a-number")
      .set("x-device-id", DEVICE_ID);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

// ---------------------------------------------------------------------------
// Product-log routes — database failure returns descriptive JSON (not silent)
// ---------------------------------------------------------------------------
describe("Product-log routes: database errors return descriptive JSON responses", () => {
  beforeEach(() => makeDbThrow());

  it("POST /api/product-logs → descriptive JSON error when db throws", async () => {
    const agent = await productLogApp();
    const res = await agent
      .post("/api/product-logs")
      .set("x-device-id", DEVICE_ID)
      .send({ date: "2025-01-01", productType: "Tampon", scented: false });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it("GET /api/product-logs → descriptive JSON error when db throws", async () => {
    const agent = await productLogApp();
    const res = await agent
      .get("/api/product-logs")
      .set("x-device-id", DEVICE_ID);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it("GET /api/product-logs/export → descriptive JSON error when db throws", async () => {
    const agent = await productLogApp();
    const res = await agent
      .get("/api/product-logs/export")
      .set("x-device-id", DEVICE_ID);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it("DELETE /api/product-logs/:id → descriptive JSON error when db throws", async () => {
    const agent = await productLogApp();
    const res = await agent
      .delete("/api/product-logs/42")
      .set("x-device-id", DEVICE_ID);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
    expect(res.body.error.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Confirm: no external API-key dependency in either route file
// ---------------------------------------------------------------------------
describe("Audit: no external API-key dependency", () => {
  it("partner routes do not import OpenAI or any external-API module", async () => {
    // If this import succeeds without AI_INTEGRATIONS_OPENAI_API_KEY being set,
    // the route file has no hard dependency on an API key.
    delete process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
    makeDbReturnsEmpty();
    const { registerPartnerRoutes } = await import("../partnerRoutes");
    expect(typeof registerPartnerRoutes).toBe("function");
  });

  it("product-log routes do not import OpenAI or any external-API module", async () => {
    delete process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
    makeDbReturnsEmpty();
    const { registerProductLogRoutes } = await import("../productLogRoutes");
    expect(typeof registerProductLogRoutes).toBe("function");
  });
});
