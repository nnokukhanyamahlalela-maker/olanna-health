import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { apiKeyAuth } from "./middleware/apiAuth";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface UserContext {
  cycleDay: number;
  averageCycleLength: number;
  phase: string;
  symptoms: string[];
  bleedingLevel: string;
  painScore: number;
  onHormonalContraception: boolean;
  tryingToConceive: boolean;
}

type PromptBuilder = (ctx: { userContext: UserContext }) => string;

const PROMPT_TEMPLATES: Record<string, PromptBuilder> = {
  phase_today: ({ userContext }) => `
User context:
- cycleDay: ${userContext.cycleDay}
- avgCycleLength: ${userContext.averageCycleLength}
- phase: ${userContext.phase}
- symptoms: ${(userContext.symptoms || []).join(", ")}

Task:
Explain what this phase typically means and what is common to feel.
Give practical tips (sleep, movement, hydration).
Suggest 2-3 things to track today.
Include red flags and a short medical disclaimer.
Keep tone warm, simple, and non-alarming.
Do NOT diagnose.
`,

  symptom_normal: ({ userContext }) => `
User context:
- phase: ${userContext.phase}
- symptoms: ${(userContext.symptoms || []).join(", ")}
- bleedingLevel: ${userContext.bleedingLevel}
- painScore: ${userContext.painScore}

Task:
Explain whether these symptoms can be common in this phase (general info).
Offer self-care actions.
Suggest what to track.
List red flags.
No diagnosis. No medication dosing.
`,

  late_period: ({ userContext }) => `
User context:
- avgCycleLength: ${userContext.averageCycleLength}
- tryingToConceive: ${userContext.tryingToConceive}
- onHormonalContraception: ${userContext.onHormonalContraception}

Task:
List common reasons a period can be late (stress, illness, travel, weight changes, PCOS, etc).
Provide what to do next steps (tracking, pregnancy test timing as general info if TTC).
Red flags + disclaimer. No diagnosis.
`,

  cramps_help: ({ userContext }) => `
User context:
- phase: ${userContext.phase}
- painScore: ${userContext.painScore}
- bleedingLevel: ${userContext.bleedingLevel}

Task:
Explain common causes of cramps across the cycle.
Give at-home relief options (heat, gentle movement, hydration, rest).
Explain when cramps are concerning (sudden severe, fever, fainting, heavy bleeding).
No diagnosis. No dosing instructions.
`,

  pcos_basics: () => `
Task:
Explain PCOS in plain language, common signs, how clinicians diagnose it (general).
Suggest what to track (cycle length, symptoms, acne/hair changes, weight changes, mood).
Encourage medical evaluation for diagnosis.
Red flags + disclaimer. No diagnosis.
`,

  doctor_when: () => `
Task:
Give a clear list of reproductive health red flags that need urgent care vs routine appointment.
Keep it calm, practical, and short.
Add disclaimer.
`,
};

function buildPrompt(promptId: string, userContext: UserContext): string | null {
  const fn = PROMPT_TEMPLATES[promptId];
  if (!fn) return null;
  return fn({ userContext });
}

function wrapSafetyFooter(text: string): string {
  const footer =
    "\n\n---\n**Note:** I can share general health information, not a medical diagnosis. " +
    "If you have severe or sudden pain, fainting, fever, or very heavy bleeding (soaking pads hourly), please seek urgent care.";
  return text + footer;
}

const SYSTEM_PROMPT =
  "You are Olanna Health Assistant, a warm and knowledgeable women's health guide for African women, " +
  "particularly in South Africa. You follow South African health guidelines (SAHCS, SASOG) and evidence-based research. " +
  "Provide educational info about menstrual cycles and reproductive health. " +
  "Do not diagnose. Do not give medication dosing. Encourage seeking professional care when appropriate. " +
  "If urgent symptoms are described, advise urgent care. " +
  "Use South African English spelling (e.g., colour, honour, organise). " +
  "Keep tone warm, empathetic, conversational, and empowering. Never use emojis. " +
  "Keep responses concise (3-5 paragraphs max).";

export function registerAssistantRoutes(app: Express): void {
  app.post("/api/assistant", apiKeyAuth, async (req: Request, res: Response) => {
    try {
      const { promptId, userContext, freeText } = req.body;

      const ctx: UserContext = {
        cycleDay: userContext?.cycleDay ?? 14,
        averageCycleLength: userContext?.averageCycleLength ?? 28,
        phase: userContext?.phase ?? "unknown",
        symptoms: userContext?.symptoms ?? [],
        bleedingLevel: userContext?.bleedingLevel ?? "none",
        painScore: userContext?.painScore ?? 0,
        onHormonalContraception: userContext?.onHormonalContraception ?? false,
        tryingToConceive: userContext?.tryingToConceive ?? false,
      };

      let userMessage: string;

      if (promptId) {
        const prompt = buildPrompt(promptId, ctx);
        if (!prompt) {
          return res.status(400).json({ error: "Invalid promptId" });
        }
        userMessage = prompt;
      } else if (freeText && typeof freeText === "string" && freeText.trim().length > 0) {
        if (freeText.length > 10000) {
          return res.status(400).json({ error: "Message too long (max 10000 characters)" });
        }
        userMessage = `User context:\n- cycleDay: ${ctx.cycleDay}\n- phase: ${ctx.phase}\n- symptoms: ${(ctx.symptoms || []).join(", ")}\n\nUser question:\n${freeText.trim()}`;
      } else {
        return res.status(400).json({ error: "Either promptId or freeText is required" });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.4,
        max_completion_tokens: 1024,
      });

      const raw = completion.choices?.[0]?.message?.content?.trim() || "";
      const reply = wrapSafetyFooter(raw);

      return res.json({ reply });
    } catch (error) {
      console.error("Assistant error:", error);
      return res.status(500).json({ error: "AI request failed" });
    }
  });
}
