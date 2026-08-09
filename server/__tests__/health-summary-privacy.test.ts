/**
 * health-summary-privacy.test.ts
 *
 * Confirms that personal notes cannot leak into the AI prompt (and therefore
 * into the clinical narrative) when the privacy toggle is off.
 *
 * Scenarios
 * ─────────
 * 1. POST /api/health-summary/enhance with includeNotes:false and a non-empty
 *    personalNotes array → the Anthropic prompt must NOT contain any of those
 *    note strings.
 *
 * 2. POST /api/health-summary/enhance with includeNotes:true and a non-empty
 *    personalNotes array → the Anthropic prompt DOES contain those notes
 *    (confirming the gate works in both directions).
 *
 * 3. POST /api/health-summary/enhance with includeNotes:false but personalNotes
 *    is already an empty array → handled gracefully, no notes in prompt.
 *
 * Anthropic is mocked so no real API key is needed.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import express from "express";
import supertest from "supertest";

// ─── Capture variable for the prompt text ──────────────────────────────────

let capturedPrompt = "";

// ─── Mock @anthropic-ai/sdk before the route module is imported ────────────

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: vi.fn(async (params: { messages: { content: string }[] }) => {
          // Capture the user message content (the built prompt)
          capturedPrompt = params.messages[0]?.content ?? "";
          return {
            content: [{ type: "text", text: "Mock clinical narrative." }],
          };
        }),
      };
    },
  };
});

// ─── Ensure ANTHROPIC_API_KEY is present so the route doesn't 503 ─────────

const ORIGINAL_KEY = process.env.ANTHROPIC_API_KEY;
beforeAll(() => {
  process.env.ANTHROPIC_API_KEY = "test-key-value";
});
afterAll(() => {
  if (ORIGINAL_KEY !== undefined) {
    process.env.ANTHROPIC_API_KEY = ORIGINAL_KEY;
  } else {
    delete process.env.ANTHROPIC_API_KEY;
  }
});

// ─── Minimal Express app ───────────────────────────────────────────────────

async function makeApp() {
  const app = express();
  app.use(express.json());
  const { registerHealthSummaryRoutes } = await import(
    "../healthSummaryRoutes"
  );
  registerHealthSummaryRoutes(app);
  return supertest(app);
}

// ─── Shared fixture ────────────────────────────────────────────────────────

const BASE_PAYLOAD = {
  generatedAt: "2026-08-01T12:00:00Z",
  dateRange: { start: "2026-05-01", end: "2026-07-31" },
  totalLogDays: 45,
  cycleCount: 3,
  cycleLength: 28,
  periodLength: 5,
  flowDays: 15,
  heavyFlowDays: 3,
  topSymptoms: [
    { id: "cramps", name: "Cramps", count: 12, avgSeverity: 3 },
  ],
  phaseSnapshots: [
    { phase: "menstrual", label: "Menstrual", logCount: 5, topSymptoms: ["Cramps"] },
  ],
};

const PERSONAL_NOTES = [
  "Feeling very fatigued this week",
  "Pain worse after eating gluten",
  "Mood improved after morning walks",
];

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("POST /api/health-summary/enhance — personal notes privacy gate", () => {
  it("does NOT include personal notes in the Anthropic prompt when includeNotes is false", async () => {
    capturedPrompt = "";
    const agent = await makeApp();

    const res = await agent
      .post("/api/health-summary/enhance")
      .send({
        ...BASE_PAYLOAD,
        includeNotes: false,
        personalNotes: PERSONAL_NOTES,
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(res.body.narrative).toBeTruthy();

    // The captured prompt must not contain any of the note strings
    for (const note of PERSONAL_NOTES) {
      expect(capturedPrompt).not.toContain(note);
    }

    // And the "Patient's personal notes:" section header must be absent
    expect(capturedPrompt).not.toContain("Patient's personal notes:");
  });

  it("DOES include personal notes in the Anthropic prompt when includeNotes is true", async () => {
    capturedPrompt = "";
    const agent = await makeApp();

    const res = await agent
      .post("/api/health-summary/enhance")
      .send({
        ...BASE_PAYLOAD,
        includeNotes: true,
        personalNotes: PERSONAL_NOTES,
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(res.body.narrative).toBeTruthy();

    // The prompt must include the notes section header
    expect(capturedPrompt).toContain("Patient's personal notes:");

    // At least one note must appear verbatim
    const anyNotePresent = PERSONAL_NOTES.some((n) =>
      capturedPrompt.includes(n)
    );
    expect(anyNotePresent).toBe(true);
  });

  it("handles includeNotes:false with an already-empty personalNotes array gracefully", async () => {
    capturedPrompt = "";
    const agent = await makeApp();

    const res = await agent
      .post("/api/health-summary/enhance")
      .send({
        ...BASE_PAYLOAD,
        includeNotes: false,
        personalNotes: [],
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(capturedPrompt).not.toContain("Patient's personal notes:");
  });

  it("returns 400 for an invalid payload", async () => {
    const agent = await makeApp();

    const res = await agent
      .post("/api/health-summary/enhance")
      .send({ foo: "bar" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 422 when totalLogDays is 0 (not enough data)", async () => {
    const agent = await makeApp();

    const res = await agent
      .post("/api/health-summary/enhance")
      .send({
        ...BASE_PAYLOAD,
        totalLogDays: 0,
        includeNotes: false,
        personalNotes: PERSONAL_NOTES,
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(422);
  });
});
