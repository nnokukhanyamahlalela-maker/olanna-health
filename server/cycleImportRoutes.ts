import type { Express, Request, Response } from "express";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface ExtractedCycleData {
  regularity: "regular" | "irregular" | "not_sure" | "";
  lastPeriodStartDate: string;
  averageCycleLength: number | null;
  periodDuration: number | null;
  previousPeriodDates: string[];
  periodDays: string[];
  confidence: {
    regularity: number;
    lastPeriodStartDate: number;
    averageCycleLength: number;
  };
  source: "screenshot_upload";
}

const EXTRACTION_PROMPT = `You are a medical data extraction assistant for a period tracking app called Olanna Health. Analyze this screenshot from another period-tracking app and extract cycle history data.

RECOGNIZING POPULAR PERIOD-TRACKING APPS:
- StarDust: Dark cosmic/purple UI with red or pink highlighted period days on a calendar grid, moon phase icons above dates
- Flo: Pink/coral UI with circles marking period days, clean calendar layout with colored dots
- Lively: Colorful calendar with highlighted period ranges, often shows cycle day numbers
- Harmony: Calendar view with colored bars or highlights spanning period days
- Other apps: Look for highlighted/colored date ranges, flow indicators, or period markers on any calendar view

Extract the following information if visible:
1. The most recent period start date
2. Any previous period start dates visible
3. Average cycle length (days between period starts)
4. Period duration (how many days each period lasted)
5. Whether the cycle appears regular (21-35 days, consistent) or irregular
6. ALL individual dates that appear as period/bleeding days (highlighted, colored, or marked as period days on the calendar)

IMPORTANT RULES:
- Dates should be in ISO format (YYYY-MM-DD)
- If you see dates in other formats (DD/MM, MM/DD, etc.), convert them to ISO
- If the year is not visible, assume the most recent year that makes sense
- Only extract data you can actually see — do not guess or hallucinate dates
- For confidence, use 0.0 to 1.0 where 1.0 means very clear and certain
- If the image is blurry, dark, or hard to read, lower confidence scores accordingly
- If no cycle data is visible at all, set all fields to empty/null with 0 confidence
- For periodDays: list EVERY individual date that is visually marked as a period/bleeding day (e.g., if Feb 2, 3, 4 are highlighted red, include all three dates)
- periodDays should include dates from ALL visible periods, not just the most recent one

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "regularity": "regular" | "irregular" | "not_sure" | "",
  "lastPeriodStartDate": "YYYY-MM-DD" or "",
  "averageCycleLength": number or null,
  "periodDuration": number or null,
  "previousPeriodDates": ["YYYY-MM-DD", ...] or [],
  "periodDays": ["YYYY-MM-DD", ...] or [],
  "confidence": {
    "regularity": 0.0-1.0,
    "lastPeriodStartDate": 0.0-1.0,
    "averageCycleLength": 0.0-1.0
  }
}`;

function detectMimeType(base64: string): string {
  const sig = base64.substring(0, 16);
  if (sig.startsWith("/9j/")) return "image/jpeg";
  if (sig.startsWith("iVBOR")) return "image/png";
  if (sig.startsWith("UklGR")) return "image/webp";
  return "image/jpeg";
}

export function registerCycleImportRoutes(app: Express): void {
  app.post("/api/cycle-import/analyze", async (req: Request, res: Response) => {
    try {
      const { image, mimeType: clientMime } = req.body;

      if (!image || typeof image !== "string") {
        return res.status(400).json({
          error: "No image provided",
          message: "Please upload a screenshot of your cycle history.",
        });
      }

      const rawBase64 = image.startsWith("data:")
        ? image.split(",")[1] || ""
        : image;

      const detectedMime = clientMime || detectMimeType(rawBase64);
      const base64Data = `data:${detectedMime};base64,${rawBase64}`;

      const maxSizeBytes = 10 * 1024 * 1024;
      if (Buffer.byteLength(rawBase64, "base64") > maxSizeBytes) {
        return res.status(400).json({
          error: "Image too large",
          message: "Please upload a smaller image (under 10MB).",
        });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: EXTRACTION_PROMPT },
              {
                type: "image_url",
                image_url: { url: base64Data, detail: "high" },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
      });

      const rawContent = response.choices[0]?.message?.content?.trim() || "";

      let cleaned = rawContent;
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      let parsed: any;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        console.error("[CycleImport] Failed to parse AI response:", rawContent);
        return res.status(422).json({
          error: "extraction_failed",
          message:
            "We couldn't read cycle data from this screenshot. Try a clearer image, or enter your details manually.",
        });
      }

      const hasAnyData =
        parsed.lastPeriodStartDate ||
        parsed.averageCycleLength ||
        (parsed.previousPeriodDates && parsed.previousPeriodDates.length > 0) ||
        (parsed.periodDays && parsed.periodDays.length > 0);

      if (!hasAnyData) {
        return res.status(422).json({
          error: "no_data_found",
          message:
            "We couldn't find any cycle data in this screenshot. Make sure the screenshot shows your cycle history or calendar view.",
        });
      }

      const result: ExtractedCycleData = {
        regularity: parsed.regularity || "",
        lastPeriodStartDate: parsed.lastPeriodStartDate || "",
        averageCycleLength:
          typeof parsed.averageCycleLength === "number"
            ? parsed.averageCycleLength
            : null,
        periodDuration:
          typeof parsed.periodDuration === "number"
            ? parsed.periodDuration
            : null,
        previousPeriodDates: Array.isArray(parsed.previousPeriodDates)
          ? parsed.previousPeriodDates.filter(
              (d: any) => typeof d === "string" && d.match(/^\d{4}-\d{2}-\d{2}$/)
            )
          : [],
        periodDays: Array.isArray(parsed.periodDays)
          ? parsed.periodDays.filter(
              (d: any) => typeof d === "string" && d.match(/^\d{4}-\d{2}-\d{2}$/)
            )
          : [],
        confidence: {
          regularity:
            typeof parsed.confidence?.regularity === "number"
              ? parsed.confidence.regularity
              : 0,
          lastPeriodStartDate:
            typeof parsed.confidence?.lastPeriodStartDate === "number"
              ? parsed.confidence.lastPeriodStartDate
              : 0,
          averageCycleLength:
            typeof parsed.confidence?.averageCycleLength === "number"
              ? parsed.confidence.averageCycleLength
              : 0,
        },
        source: "screenshot_upload",
      };

      res.json(result);
    } catch (error: any) {
      console.error("[CycleImport] Analysis error:", error);

      if (error?.status === 429) {
        return res.status(429).json({
          error: "rate_limited",
          message: "Too many requests. Please wait a moment and try again.",
        });
      }

      res.status(500).json({
        error: "analysis_error",
        message:
          "Something went wrong while analyzing your screenshot. Please try again or enter your details manually.",
      });
    }
  });
}
