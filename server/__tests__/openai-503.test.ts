/**
 * Tests that AI routes return 503 with a descriptive error body when
 * AI_INTEGRATIONS_OPENAI_API_KEY is unset, instead of silently failing
 * with a 500 or a cryptic message.
 *
 * Each route group gets its own minimal Express app so that the audio and
 * chat routes (which both register POST /api/conversations/:id/messages)
 * don't shadow each other.
 */
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import express from "express";
import supertest from "supertest";

// ---------------------------------------------------------------------------
// Mock chatStorage so the chat route doesn't attempt DB calls before the
// key-check path is reached.
// ---------------------------------------------------------------------------
vi.mock("../replit_integrations/chat/storage", () => ({
  chatStorage: {
    createMessage: vi.fn().mockResolvedValue({ id: 1, role: "user", content: "hi" }),
    getMessagesByConversation: vi.fn().mockResolvedValue([]),
    getAllConversations: vi.fn().mockResolvedValue([]),
    getConversation: vi.fn().mockResolvedValue({ id: 1, title: "Test" }),
    createConversation: vi.fn().mockResolvedValue({ id: 1, title: "Test" }),
    deleteConversation: vi.fn().mockResolvedValue(undefined),
  },
}));

// Remove the key before any modules initialise their singletons.
const ORIGINAL_KEY = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
beforeAll(() => {
  delete process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  // Use development so apiKeyAuth middleware is bypassed in the chat route.
  process.env.NODE_ENV = "development";
});
afterAll(() => {
  if (ORIGINAL_KEY !== undefined) {
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY = ORIGINAL_KEY;
  }
});

// ---------------------------------------------------------------------------
// Factories – each creates an isolated Express app for one route group.
// ---------------------------------------------------------------------------
function makeApp() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  return app;
}

async function audioApp() {
  const app = makeApp();
  const { registerAudioRoutes } = await import("../replit_integrations/audio/routes");
  registerAudioRoutes(app);
  return supertest(app);
}

async function imageApp() {
  const app = makeApp();
  const { registerImageRoutes } = await import("../replit_integrations/image/routes");
  registerImageRoutes(app);
  return supertest(app);
}

async function chatApp() {
  const app = makeApp();
  const { registerChatRoutes } = await import("../replit_integrations/chat/routes");
  registerChatRoutes(app);
  return supertest(app);
}

async function cycleImportApp() {
  const app = makeApp();
  const { registerCycleImportRoutes } = await import("../cycleImportRoutes");
  registerCycleImportRoutes(app);
  return supertest(app);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const AUDIO_PAYLOAD = { audio: Buffer.from("fake-audio").toString("base64") };
const IMAGE_PAYLOAD = { prompt: "a red rose" };
const CHAT_PAYLOAD = { content: "hello" };
const CYCLE_PAYLOAD = { image: Buffer.from("fake-image").toString("base64") };

/** Assert the body has an error field that mentions AI / key configuration. */
function expect503WithError(body: Record<string, unknown>) {
  expect(body).toHaveProperty("error");
  const bodyStr = JSON.stringify(body).toLowerCase();
  const mentionsAI =
    bodyStr.includes("ai") ||
    bodyStr.includes("openai") ||
    bodyStr.includes("configured") ||
    bodyStr.includes("api key");
  expect(mentionsAI).toBe(true);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("503 when AI_INTEGRATIONS_OPENAI_API_KEY is unset", () => {
  it("POST /api/conversations/:id/messages (audio route) → 503", async () => {
    const agent = await audioApp();
    const res = await agent
      .post("/api/conversations/1/messages")
      .send(AUDIO_PAYLOAD)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(503);
    expect503WithError(res.body);
  });

  it("POST /api/conversations/:id/voice-stream → 503", async () => {
    const agent = await audioApp();
    const res = await agent
      .post("/api/conversations/1/voice-stream")
      .send(AUDIO_PAYLOAD)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(503);
    expect503WithError(res.body);
  });

  it("POST /api/generate-image → 503", async () => {
    const agent = await imageApp();
    const res = await agent
      .post("/api/generate-image")
      .send(IMAGE_PAYLOAD)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(503);
    expect503WithError(res.body);
  });

  it("POST /api/conversations/:id/messages (chat route) → 503", async () => {
    const agent = await chatApp();
    const res = await agent
      .post("/api/conversations/1/messages")
      .send(CHAT_PAYLOAD)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(503);
    expect503WithError(res.body);
  });

  it("POST /api/cycle-import/analyze → 503", async () => {
    const agent = await cycleImportApp();
    const res = await agent
      .post("/api/cycle-import/analyze")
      .send(CYCLE_PAYLOAD)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(503);
    expect503WithError(res.body);
  });
});
