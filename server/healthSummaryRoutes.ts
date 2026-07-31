/**
 * healthSummaryRoutes
 *
 * Provides:
 *   GET  /api/health-summary/ai-available  — returns { available: boolean }
 *   POST /api/health-summary/enhance       — accepts structured summary payload,
 *                                            returns a 2–3 paragraph clinical-warm
 *                                            AI narrative via Claude (Anthropic).
 *
 * Requires ANTHROPIC_API_KEY in the environment. Falls back gracefully:
 * callers display the existing templated summary when AI is unavailable or
 * when the call fails.
 */

import type { Express, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";

// ─── Lazy Anthropic client ────────────────────────────────────────────────────

let _anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set — Claude AI features unavailable."
      );
    }
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

// ─── Types shared with client ─────────────────────────────────────────────────

interface SymptomFreq {
  id: string;
  name: string;
  count: number;
  avgSeverity: number | null;
}

interface PhaseSnapshot {
  phase: string;
  label: string;
  logCount: number;
  topSymptoms: string[];
}

interface SummaryPayload {
  generatedAt: string;
  dateRange: { start: string; end: string } | null;
  totalLogDays: number;
  cycleCount: number;
  cycleLength: number;
  periodLength: number;
  flowDays: number;
  heavyFlowDays: number;
  topSymptoms: SymptomFreq[];
  phaseSnapshots: PhaseSnapshot[];
  personalNotes: string[];       // included only when privacy toggle is on
  includeNotes: boolean;
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(data: SummaryPayload): string {
  const lines: string[] = [];

  lines.push("You are a compassionate women's health assistant helping a patient prepare a clear, clinical summary for their healthcare provider.");
  lines.push("");
  lines.push("Write a concise 2–3 paragraph narrative in a warm but clinically precise tone. Highlight notable patterns, flag anything worth investigating (e.g. heavy flow, frequent pelvic pain, luteal-phase mood symptoms), and frame symptoms in medical language the patient can hand directly to a provider.");
  lines.push("Do NOT use bullet points. Do NOT recommend specific treatments. Write in third-person clinical style (e.g. 'The patient reports…'). End with one sentence summarising what the data suggests the provider focus on first.");
  lines.push("");
  lines.push("=== STRUCTURED SUMMARY DATA ===");

  if (data.dateRange) {
    lines.push(`Tracking period: ${data.dateRange.start} to ${data.dateRange.end}`);
  }
  lines.push(`Total days logged: ${data.totalLogDays}`);
  lines.push(`Estimated cycles covered: ${data.cycleCount}`);
  lines.push(`Reported average cycle length: ${data.cycleLength} days`);
  lines.push(`Reported period length: ${data.periodLength} days`);

  if (data.flowDays > 0) {
    lines.push(`Flow days logged: ${data.flowDays}`);
    if (data.heavyFlowDays > 0) {
      lines.push(`Heavy flow days: ${data.heavyFlowDays}`);
    }
  }

  if (data.topSymptoms.length > 0) {
    lines.push("");
    lines.push("Most frequently logged symptoms:");
    data.topSymptoms.slice(0, 8).forEach((s) => {
      const sev = s.avgSeverity ? ` (average severity ${s.avgSeverity}/5)` : "";
      lines.push(`  - ${s.name}: ${s.count} occurrence${s.count !== 1 ? "s" : ""}${sev}`);
    });
  }

  if (data.phaseSnapshots.length > 0) {
    lines.push("");
    lines.push("Symptoms by cycle phase:");
    data.phaseSnapshots.forEach((p) => {
      if (p.topSymptoms.length > 0) {
        lines.push(`  ${p.label}: ${p.topSymptoms.join(", ")}`);
      }
    });
  }

  if (data.includeNotes && data.personalNotes.length > 0) {
    lines.push("");
    lines.push("Patient's personal notes:");
    data.personalNotes.slice(0, 10).forEach((n) => lines.push(`  - ${n}`));
  }

  lines.push("");
  lines.push("Now write the 2–3 paragraph clinical narrative:");

  return lines.join("\n");
}

// ─── Validation ───────────────────────────────────────────────────────────────

function isValidPayload(body: unknown): body is SummaryPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.totalLogDays === "number" &&
    typeof b.cycleLength === "number" &&
    typeof b.periodLength === "number" &&
    Array.isArray(b.topSymptoms) &&
    Array.isArray(b.phaseSnapshots)
  );
}

// ─── Route registration ───────────────────────────────────────────────────────

export function registerHealthSummaryRoutes(app: Express): void {
  /**
   * GET /api/health-summary/ai-available
   * Returns { available: true } if ANTHROPIC_API_KEY is configured, otherwise
   * { available: false }. Used by the client to decide whether to show the
   * "Enhance with AI" button.
   */
  app.get(
    "/api/health-summary/ai-available",
    (_req: Request, res: Response) => {
      const available = Boolean(process.env.ANTHROPIC_API_KEY);
      res.json({ available });
    }
  );

  /**
   * POST /api/health-summary/enhance
   * Body: SummaryPayload (structured health summary, no raw notes by default)
   * Returns: { narrative: string } — a 2–3 paragraph clinical narrative from Claude
   */
  app.post(
    "/api/health-summary/enhance",
    async (req: Request, res: Response) => {
      if (!isValidPayload(req.body)) {
        return res.status(400).json({ error: "Invalid summary payload" });
      }

      const data = req.body as SummaryPayload;

      if (data.totalLogDays === 0) {
        return res.status(422).json({
          error: "Not enough data to enhance — no days logged yet.",
        });
      }

      let anthropic: Anthropic;
      try {
        anthropic = getAnthropic();
      } catch {
        return res.status(503).json({
          error: "ai_not_configured",
          message:
            "AI features are not available. The Anthropic API key is missing or invalid. Please contact the app administrator.",
        });
      }

      try {
        const prompt = buildPrompt(data);

        const message = await anthropic.messages.create({
          model: "claude-opus-4-5",
          max_tokens: 600,
          messages: [{ role: "user", content: prompt }],
        });

        const block = message.content.find((b) => b.type === "text");
        const narrative = block && block.type === "text" ? block.text.trim() : "";

        if (!narrative) {
          return res
            .status(502)
            .json({ error: "AI returned an empty response" });
        }

        return res.json({ narrative });
      } catch (err: unknown) {
        console.error("[health-summary/enhance] Claude call failed:", err);

        // Anthropic SDK auth errors
        if (
          err instanceof Error &&
          (err.message.includes("401") ||
            err.message.includes("authentication") ||
            err.message.toLowerCase().includes("api key") ||
            err.message.includes("ANTHROPIC_API_KEY"))
        ) {
          return res.status(503).json({
            error: "ai_not_configured",
            message:
              "AI features are not available. The Anthropic API key is missing or invalid.",
          });
        }

        return res
          .status(500)
          .json({ error: "Failed to generate AI narrative" });
      }
    }
  );
}
